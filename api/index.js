const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const app = express();

// ミドルウェア
app.use(cors());
app.use(express.json());

// データベース初期化
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(':memory:'); // VercelではファイルベースのDBは使えないので、メモリベースを使用
    
    db.serialize(() => {
      // ユーザーテーブル
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'student',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // 活動報告テーブル
      db.run(`CREATE TABLE IF NOT EXISTS activity_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // 在学証明書テーブル
      db.run(`CREATE TABLE IF NOT EXISTS enrollment_certificates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        student_name TEXT NOT NULL,
        student_id TEXT NOT NULL,
        program TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // デフォルト管理者アカウントを作成
      const adminPassword = bcrypt.hashSync('admin123', 10);
      db.run(`INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
        ['admin', 'admin@example.com', adminPassword, 'admin']);
    });

    resolve(db);
  });
};

// JWT認証ミドルウェア
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'アクセストークンが必要です' });
  }

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: '無効なトークンです' });
    }
    req.user = user;
    next();
  });
};

// ルート
app.get('/api/health', (req, res) => {
  res.json({ message: 'Exchange Student System API is running' });
});

// ユーザー登録
app.post('/api/register', [
  body('username').isLength({ min: 3 }).withMessage('ユーザー名は3文字以上である必要があります'),
  body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
  body('password').isLength({ min: 6 }).withMessage('パスワードは6文字以上である必要があります')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = await initDatabase();
    const { username, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'ユーザー名またはメールアドレスが既に使用されています' });
          }
          return res.status(500).json({ error: '登録に失敗しました' });
        }

        const token = jwt.sign({ id: this.lastID, username, role: 'student' }, 'your-secret-key');
        res.json({ token, user: { id: this.lastID, username, email, role: 'student' } });
      });
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// ログイン
app.post('/api/login', async (req, res) => {
  try {
    const db = await initDatabase();
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'ログインに失敗しました' });
      }

      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'ユーザー名またはパスワードが正しくありません' });
      }

      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, 'your-secret-key');
      res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    });
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 活動報告の作成
app.post('/api/activity-reports', authenticateToken, [
  body('title').notEmpty().withMessage('タイトルは必須です'),
  body('description').notEmpty().withMessage('説明は必須です'),
  body('date').notEmpty().withMessage('日付は必須です')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = await initDatabase();
    const { title, description, date } = req.body;
    const userId = req.user.id;

    db.run(`INSERT INTO activity_reports (user_id, title, description, date) VALUES (?, ?, ?, ?)`,
      [userId, title, description, date],
      function(err) {
        if (err) {
          return res.status(500).json({ error: '活動報告の作成に失敗しました' });
        }

        res.json({ id: this.lastID, title, description, date, user_id: userId });
      });
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 活動報告の取得
app.get('/api/activity-reports', authenticateToken, async (req, res) => {
  try {
    const db = await initDatabase();
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const query = isAdmin 
      ? `SELECT ar.*, u.username FROM activity_reports ar JOIN users u ON ar.user_id = u.id ORDER BY ar.created_at DESC`
      : `SELECT * FROM activity_reports WHERE user_id = ? ORDER BY created_at DESC`;

    const params = isAdmin ? [] : [userId];

    db.all(query, params, (err, reports) => {
      if (err) {
        return res.status(500).json({ error: '活動報告の取得に失敗しました' });
      }
      res.json(reports);
    });
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 在学証明書の作成
app.post('/api/enrollment-certificates', authenticateToken, [
  body('student_name').notEmpty().withMessage('学生名は必須です'),
  body('student_id').notEmpty().withMessage('学籍番号は必須です'),
  body('program').notEmpty().withMessage('プログラム名は必須です'),
  body('start_date').notEmpty().withMessage('開始日は必須です'),
  body('end_date').notEmpty().withMessage('終了日は必須です')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = await initDatabase();
    const { student_name, student_id, program, start_date, end_date } = req.body;
    const userId = req.user.id;

    db.run(`INSERT INTO enrollment_certificates (user_id, student_name, student_id, program, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, student_name, student_id, program, start_date, end_date],
      function(err) {
        if (err) {
          return res.status(500).json({ error: '在学証明書の作成に失敗しました' });
        }

        res.json({ 
          id: this.lastID, 
          student_name, 
          student_id, 
          program, 
          start_date, 
          end_date, 
          status: 'pending',
          user_id: userId 
        });
      });
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 在学証明書の取得
app.get('/api/enrollment-certificates', authenticateToken, async (req, res) => {
  try {
    const db = await initDatabase();
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    const query = isAdmin 
      ? `SELECT ec.*, u.username FROM enrollment_certificates ec JOIN users u ON ec.user_id = u.id ORDER BY ec.created_at DESC`
      : `SELECT * FROM enrollment_certificates WHERE user_id = ? ORDER BY created_at DESC`;

    const params = isAdmin ? [] : [userId];

    db.all(query, params, (err, certificates) => {
      if (err) {
        return res.status(500).json({ error: '在学証明書の取得に失敗しました' });
      }
      res.json(certificates);
    });
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 在学証明書のステータス更新（管理者のみ）
app.put('/api/enrollment-certificates/:id/status', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '管理者権限が必要です' });
  }

  try {
    const db = await initDatabase();
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: '無効なステータスです' });
    }

    db.run(`UPDATE enrollment_certificates SET status = ? WHERE id = ?`, [status, id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'ステータスの更新に失敗しました' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: '在学証明書が見つかりません' });
      }

      res.json({ message: 'ステータスが更新されました' });
    });
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// ユーザー情報の取得
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const db = await initDatabase();
    const userId = req.user.id;

    db.get(`SELECT id, username, email, role, created_at FROM users WHERE id = ?`, [userId], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'ユーザー情報の取得に失敗しました' });
      }

      if (!user) {
        return res.status(404).json({ error: 'ユーザーが見つかりません' });
      }

      res.json(user);
    });
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

module.exports = app;
