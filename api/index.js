const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const app = express();

// ミドルウェア
app.use(cors());
app.use(express.json());

// 環境変数からJWTシークレットを取得
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Supabase PostgreSQL接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// データベース初期化
const initDatabase = async () => {
  try {
    const client = await pool.connect();

    // 学生テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nationality VARCHAR(50) NOT NULL,
        home_university VARCHAR(100) NOT NULL,
        exchange_period VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 活動報告書テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_reports (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        file_path VARCHAR(500),
        status VARCHAR(20) DEFAULT 'pending',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP,
        reviewer_comment TEXT,
        FOREIGN KEY (student_id) REFERENCES students (id)
      )
    `);

    // 在籍証明書テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS enrollment_certificates (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        request_type VARCHAR(100) NOT NULL,
        purpose TEXT NOT NULL,
        file_path VARCHAR(500),
        status VARCHAR(20) DEFAULT 'pending',
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        issued_at TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students (id)
      )
    `);

    // 管理者テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // デフォルト管理者アカウント作成
    const adminPassword = bcrypt.hashSync('admin123', 10);
    await client.query(`
      INSERT INTO admins (username, password, name)
      VALUES ($1, $2, $3)
      ON CONFLICT (username) DO NOTHING
    `, ['admin', adminPassword, 'システム管理者']);

    client.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// JWT認証ミドルウェア
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'アクセストークンが必要です' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '無効なトークンです' });
    }
    req.user = user;
    next();
  });
};

// 診断用エンドポイント
app.get('/debug/env', (req, res) => {
  res.json({
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasJwtSecret: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV,
    databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'not set'
  });
});

app.get('/debug/db', async (req, res) => {
  try {
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('Database connected successfully');
    const result = await client.query('SELECT NOW()');
    console.log('Query result:', result.rows[0]);
    client.release();
    res.json({ 
      success: true, 
      timestamp: result.rows[0].now,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack,
      code: error.code
    });
  }
});

app.get('/debug/tables', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    client.release();
    res.json({ 
      tables: result.rows.map(row => row.table_name),
      count: result.rows.length
    });
  } catch (error) {
    console.error('Table check error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ルートエンドポイント
app.get('/', (req, res) => {
  res.json({ message: 'Exchange Student System API is running' });
});

// 学生登録
app.post('/register', [
  body('student_id').notEmpty().withMessage('学生IDは必須です'),
  body('name').notEmpty().withMessage('名前は必須です'),
  body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
  body('password').isLength({ min: 6 }).withMessage('パスワードは6文字以上である必要があります'),
  body('nationality').notEmpty().withMessage('国籍は必須です'),
  body('home_university').notEmpty().withMessage('出身大学は必須です'),
  body('exchange_period').notEmpty().withMessage('交換期間は必須です')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    await initDatabase();

    const { student_id, name, email, password, nationality, home_university, exchange_period } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await pool.connect();
    const result = await client.query(`
      INSERT INTO students (student_id, name, email, password, nationality, home_university, exchange_period)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, student_id, name, email
    `, [student_id, name, email, hashedPassword, nationality, home_university, exchange_period]);

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, student_id: user.student_id, name: user.name }, JWT_SECRET, { expiresIn: '24h' });

    client.release();

    res.status(201).json({
      message: '登録が完了しました',
      token,
      user: { id: user.id, student_id: user.student_id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: '既に登録されている学生IDまたはメールアドレスです' });
    }
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 学生ログイン
app.post('/login', async (req, res) => {
  try {
    await initDatabase();

    const { email, password } = req.body;

    const client = await pool.connect();
    const result = await client.query('SELECT * FROM students WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      client.release();
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }

    const student = result.rows[0];
    const validPassword = await bcrypt.compare(password, student.password);

    if (!validPassword) {
      client.release();
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }

    const token = jwt.sign({ id: student.id, student_id: student.student_id, name: student.name }, JWT_SECRET, { expiresIn: '24h' });

    client.release();

    res.json({
      message: 'ログインしました',
      token,
      user: { id: student.id, student_id: student.student_id, name: student.name, email: student.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 活動報告書提出
app.post('/activity-reports', authenticateToken, [
  body('title').notEmpty().withMessage('タイトルは必須です'),
  body('content').notEmpty().withMessage('内容は必須です')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    await initDatabase();

    const { title, content } = req.body;
    const student_id = req.user.id;

    const client = await pool.connect();
    const result = await client.query(`
      INSERT INTO activity_reports (student_id, title, content)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [student_id, title, content]);

    client.release();

    res.status(201).json({
      message: '活動報告書を提出しました',
      report_id: result.rows[0].id
    });
  } catch (error) {
    console.error('Activity report error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 在籍証明書申請
app.post('/enrollment-certificates', authenticateToken, [
  body('request_type').notEmpty().withMessage('申請種別は必須です'),
  body('purpose').notEmpty().withMessage('用途は必須です')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    await initDatabase();

    const { request_type, purpose } = req.body;
    const student_id = req.user.id;

    const client = await pool.connect();
    const result = await client.query(`
      INSERT INTO enrollment_certificates (student_id, request_type, purpose)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [student_id, request_type, purpose]);

    client.release();

    res.status(201).json({
      message: '在籍証明書を申請しました',
      certificate_id: result.rows[0].id
    });
  } catch (error) {
    console.error('Enrollment certificate error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 学生の報告書一覧取得
app.get('/activity-reports', authenticateToken, async (req, res) => {
  try {
    await initDatabase();

    const student_id = req.user.id;

    const client = await pool.connect();
    const result = await client.query(`
      SELECT * FROM activity_reports
      WHERE student_id = $1
      ORDER BY submitted_at DESC
    `, [student_id]);

    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Get activity reports error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 学生の証明書申請一覧取得
app.get('/enrollment-certificates', authenticateToken, async (req, res) => {
  try {
    await initDatabase();

    const student_id = req.user.id;

    const client = await pool.connect();
    const result = await client.query(`
      SELECT * FROM enrollment_certificates
      WHERE student_id = $1
      ORDER BY requested_at DESC
    `, [student_id]);

    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Get enrollment certificates error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 管理者ログイン
app.post('/admin/login', async (req, res) => {
  try {
    await initDatabase();

    const { username, password } = req.body;

    const client = await pool.connect();
    const result = await client.query('SELECT * FROM admins WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      client.release();
      return res.status(401).json({ error: 'ユーザー名またはパスワードが正しくありません' });
    }

    const admin = result.rows[0];
    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword) {
      client.release();
      return res.status(401).json({ error: 'ユーザー名またはパスワードが正しくありません' });
    }

    const token = jwt.sign({ id: admin.id, username: admin.username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });

    client.release();

    res.json({
      message: 'ログインしました',
      token,
      admin: { id: admin.id, username: admin.username, name: admin.name }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 全報告書取得（管理者用）
app.get('/admin/activity-reports', authenticateToken, async (req, res) => {
  try {
    await initDatabase();

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '管理者権限が必要です' });
    }

    const client = await pool.connect();
    const result = await client.query(`
      SELECT ar.*, s.name as student_name, s.student_id
      FROM activity_reports ar
      JOIN students s ON ar.student_id = s.id
      ORDER BY ar.submitted_at DESC
    `);

    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Get all activity reports error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 全証明書申請取得（管理者用）
app.get('/admin/enrollment-certs', authenticateToken, async (req, res) => {
  try {
    await initDatabase();

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '管理者権限が必要です' });
    }

    const client = await pool.connect();
    const result = await client.query(`
      SELECT ec.*, s.name as student_name, s.student_id
      FROM enrollment_certificates ec
      JOIN students s ON ec.student_id = s.id
      ORDER BY ec.requested_at DESC
    `);

    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Get all enrollment certificates error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 報告書ステータス更新（管理者用）
app.put('/admin/activity-reports/:id', authenticateToken, async (req, res) => {
  try {
    await initDatabase();

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '管理者権限が必要です' });
    }

    const { status, reviewer_comment } = req.body;
    const report_id = req.params.id;

    const client = await pool.connect();
    await client.query(`
      UPDATE activity_reports
      SET status = $1, reviewer_comment = $2, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [status, reviewer_comment, report_id]);

    client.release();

    res.json({ message: 'ステータスを更新しました' });
  } catch (error) {
    console.error('Update activity report error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 証明書ステータス更新（管理者用）
app.put('/admin/enrollment-certs/:id', authenticateToken, async (req, res) => {
  try {
    await initDatabase();

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '管理者権限が必要です' });
    }

    const { status } = req.body;
    const certificate_id = req.params.id;

    const client = await pool.connect();
    await client.query(`
      UPDATE enrollment_certificates
      SET status = $1, issued_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [status, certificate_id]);

    client.release();

    res.json({ message: 'ステータスを更新しました' });
  } catch (error) {
    console.error('Update enrollment certificate error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// エラーハンドリング
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'サーバーエラーが発生しました' });
});

// Vercel用のエクスポート
module.exports = app;
