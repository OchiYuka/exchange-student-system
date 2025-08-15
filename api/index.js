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

// Vercel Postgres接続設定
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// データベース初期化
const initDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // ユーザーテーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 活動報告テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        date VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // 在学証明書テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS enrollment_certificates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        student_id VARCHAR(255) NOT NULL,
        program VARCHAR(255) NOT NULL,
        start_date VARCHAR(255) NOT NULL,
        end_date VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // デフォルト管理者アカウントを作成
    const adminPassword = bcrypt.hashSync('admin123', 10);
    await client.query(`
      INSERT INTO users (username, email, password, role) 
      VALUES ($1, $2, $3, $4) 
      ON CONFLICT (username) DO NOTHING
    `, ['admin', 'admin@example.com', adminPassword, 'admin']);

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

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: '無効なトークンです' });
    }
    req.user = user;
    next();
  });
};

// ルートエンドポイント
app.get('/', (req, res) => {
  res.json({ message: 'Exchange Student System API is running' });
});

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Exchange Student System API is running' });
});

// データベース初期化エンドポイント
app.post('/init-db', async (req, res) => {
  try {
    await initDatabase();
    res.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ error: 'Database initialization failed' });
  }
});

// ユーザー登録
app.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('ユーザー名は3文字以上である必要があります'),
  body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
  body('password').isLength({ min: 6 }).withMessage('パスワードは6文字以上である必要があります')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, role',
      [username, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'your-secret-key');

    client.release();
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      res.status(400).json({ error: 'ユーザー名またはメールアドレスが既に使用されています' });
    } else {
      res.status(500).json({ error: '登録に失敗しました' });
    }
  }
});

// ログイン
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    client.release();

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'ユーザー名またはパスワードが正しくありません' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role }, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'ログインに失敗しました' });
  }
});

// プロフィール取得
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT id, username, email, role, created_at FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    client.release();

    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'プロフィールの取得に失敗しました' });
  }
});

// 活動報告書一覧取得
app.get('/activity-reports', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    let query = 'SELECT ar.*, u.username FROM activity_reports ar JOIN users u ON ar.user_id = u.id';
    let params = [];

    if (req.user.role !== 'admin') {
      query += ' WHERE ar.user_id = $1';
      params.push(req.user.id);
    }

    query += ' ORDER BY ar.created_at DESC';

    const result = await client.query(query, params);
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Activity reports error:', error);
    res.status(500).json({ error: '活動報告書の取得に失敗しました' });
  }
});

// 活動報告書作成
app.post('/activity-reports', [
  body('title').notEmpty().withMessage('タイトルは必須です'),
  body('description').notEmpty().withMessage('説明は必須です'),
  body('date').notEmpty().withMessage('日付は必須です')
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, date } = req.body;

    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO activity_reports (user_id, title, description, date) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, title, description, date]
    );

    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Activity report creation error:', error);
    res.status(500).json({ error: '活動報告書の作成に失敗しました' });
  }
});

// 在籍証明書一覧取得
app.get('/enrollment-certificates', authenticateToken, async (req, res) => {
  try {
    const client = await pool.connect();
    let query = 'SELECT ec.*, u.username FROM enrollment_certificates ec JOIN users u ON ec.user_id = u.id';
    let params = [];

    if (req.user.role !== 'admin') {
      query += ' WHERE ec.user_id = $1';
      params.push(req.user.id);
    }

    query += ' ORDER BY ec.created_at DESC';

    const result = await client.query(query, params);
    client.release();

    res.json(result.rows);
  } catch (error) {
    console.error('Enrollment certificates error:', error);
    res.status(500).json({ error: '在籍証明書の取得に失敗しました' });
  }
});

// 在籍証明書申請
app.post('/enrollment-certificates', [
  body('student_name').notEmpty().withMessage('学生名は必須です'),
  body('student_id').notEmpty().withMessage('学生IDは必須です'),
  body('program').notEmpty().withMessage('プログラムは必須です'),
  body('start_date').notEmpty().withMessage('開始日は必須です'),
  body('end_date').notEmpty().withMessage('終了日は必須です')
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { student_name, student_id, program, start_date, end_date } = req.body;

    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO enrollment_certificates (user_id, student_name, student_id, program, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, student_name, student_id, program, start_date, end_date]
    );

    client.release();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Enrollment certificate creation error:', error);
    res.status(500).json({ error: '在籍証明書の申請に失敗しました' });
  }
});

// 在籍証明書ステータス更新（管理者のみ）
app.put('/enrollment-certificates/:id/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '管理者権限が必要です' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: '無効なステータスです' });
    }

    const client = await pool.connect();
    const result = await client.query(
      'UPDATE enrollment_certificates SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '在籍証明書が見つかりません' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'ステータスの更新に失敗しました' });
  }
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'サーバーエラーが発生しました' });
});

// 404ハンドリング
app.use((req, res) => {
  res.status(404).json({ error: 'エンドポイントが見つかりません' });
});

// サーバー起動
const PORT = process.env.PORT || 5000;

// 開発環境でのみデータベース初期化を実行
if (process.env.NODE_ENV !== 'production') {
  initDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }).catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
} else {
  // 本番環境（Vercel）では関数としてエクスポート
  module.exports = app;
}

