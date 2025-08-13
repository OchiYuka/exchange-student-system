const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// ミドルウェア
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ファイルアップロード設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and images are allowed.'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// データベース初期化
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

// データベーステーブル作成
function initDatabase() {
  db.serialize(() => {
    // 学生テーブル
    db.run(`CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nationality TEXT NOT NULL,
      home_university TEXT NOT NULL,
      exchange_period TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 活動報告書テーブル
    db.run(`CREATE TABLE IF NOT EXISTS activity_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      file_path TEXT,
      status TEXT DEFAULT 'pending',
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME,
      reviewer_comment TEXT,
      FOREIGN KEY (student_id) REFERENCES students (id)
    )`);

    // 在籍証明書テーブル
    db.run(`CREATE TABLE IF NOT EXISTS enrollment_certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      request_type TEXT NOT NULL,
      purpose TEXT NOT NULL,
      file_path TEXT,
      status TEXT DEFAULT 'pending',
      requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      issued_at DATETIME,
      FOREIGN KEY (student_id) REFERENCES students (id)
    )`);

    // 管理者テーブル
    db.run(`CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // デフォルト管理者アカウント作成
    const defaultAdminPassword = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO admins (username, password, name) VALUES (?, ?, ?)`, 
      ['admin', defaultAdminPassword, 'システム管理者']);
  });
}

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

// 学生登録
app.post('/api/register', async (req, res) => {
  try {
    const { student_id, name, email, password, nationality, home_university, exchange_period } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(`INSERT INTO students (student_id, name, email, password, nationality, home_university, exchange_period) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [student_id, name, email, hashedPassword, nationality, home_university, exchange_period],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: '既に登録されている学生IDまたはメールアドレスです' });
          }
          return res.status(500).json({ error: '登録に失敗しました' });
        }
        
        const token = jwt.sign({ id: this.lastID, student_id, name }, 'your-secret-key', { expiresIn: '24h' });
        res.status(201).json({ 
          message: '登録が完了しました',
          token,
          user: { id: this.lastID, student_id, name, email }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 学生ログイン
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM students WHERE email = ?', [email], async (err, student) => {
    if (err) {
      return res.status(500).json({ error: 'ログインに失敗しました' });
    }
    
    if (!student) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }
    
    const validPassword = await bcrypt.compare(password, student.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません' });
    }
    
    const token = jwt.sign({ id: student.id, student_id: student.student_id, name: student.name }, 'your-secret-key', { expiresIn: '24h' });
    res.json({ 
      message: 'ログインしました',
      token,
      user: { id: student.id, student_id: student.student_id, name: student.name, email: student.email }
    });
  });
});

// 活動報告書提出
app.post('/api/activity-reports', authenticateToken, upload.single('file'), (req, res) => {
  const { title, content } = req.body;
  const student_id = req.user.id;
  const file_path = req.file ? req.file.path : null;
  
  db.run(`INSERT INTO activity_reports (student_id, title, content, file_path) VALUES (?, ?, ?, ?)`,
    [student_id, title, content, file_path],
    function(err) {
      if (err) {
        return res.status(500).json({ error: '報告書の提出に失敗しました' });
      }
      res.status(201).json({ 
        message: '活動報告書を提出しました',
        report_id: this.lastID 
      });
    }
  );
});

// 在籍証明書申請
app.post('/api/enrollment-certificates', authenticateToken, upload.single('file'), (req, res) => {
  const { request_type, purpose } = req.body;
  const student_id = req.user.id;
  const file_path = req.file ? req.file.path : null;
  
  db.run(`INSERT INTO enrollment_certificates (student_id, request_type, purpose, file_path) VALUES (?, ?, ?, ?)`,
    [student_id, request_type, purpose, file_path],
    function(err) {
      if (err) {
        return res.status(500).json({ error: '証明書の申請に失敗しました' });
      }
      res.status(201).json({ 
        message: '在籍証明書を申請しました',
        certificate_id: this.lastID 
      });
    }
  );
});

// 学生の報告書一覧取得
app.get('/api/activity-reports', authenticateToken, (req, res) => {
  const student_id = req.user.id;
  
  db.all(`SELECT * FROM activity_reports WHERE student_id = ? ORDER BY submitted_at DESC`, [student_id], (err, reports) => {
    if (err) {
      return res.status(500).json({ error: '報告書の取得に失敗しました' });
    }
    res.json(reports);
  });
});

// 学生の証明書申請一覧取得
app.get('/api/enrollment-certificates', authenticateToken, (req, res) => {
  const student_id = req.user.id;
  
  db.all(`SELECT * FROM enrollment_certificates WHERE student_id = ? ORDER BY requested_at DESC`, [student_id], (err, certificates) => {
    if (err) {
      return res.status(500).json({ error: '証明書の取得に失敗しました' });
    }
    res.json(certificates);
  });
});

// 管理者ログイン
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM admins WHERE username = ?', [username], async (err, admin) => {
    if (err) {
      return res.status(500).json({ error: 'ログインに失敗しました' });
    }
    
    if (!admin) {
      return res.status(401).json({ error: 'ユーザー名またはパスワードが正しくありません' });
    }
    
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'ユーザー名またはパスワードが正しくありません' });
    }
    
    const token = jwt.sign({ id: admin.id, username: admin.username, role: 'admin' }, 'your-secret-key', { expiresIn: '24h' });
    res.json({ 
      message: 'ログインしました',
      token,
      admin: { id: admin.id, username: admin.username, name: admin.name }
    });
  });
});

// 全報告書取得（管理者用）
app.get('/api/admin/activity-reports', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '管理者権限が必要です' });
  }
  
  db.all(`SELECT ar.*, s.name as student_name, s.student_id 
          FROM activity_reports ar 
          JOIN students s ON ar.student_id = s.id 
          ORDER BY ar.submitted_at DESC`, (err, reports) => {
    if (err) {
      return res.status(500).json({ error: '報告書の取得に失敗しました' });
    }
    res.json(reports);
  });
});

// 全証明書申請取得（管理者用）
app.get('/api/admin/enrollment-certificates', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '管理者権限が必要です' });
  }
  
  db.all(`SELECT ec.*, s.name as student_name, s.student_id 
          FROM enrollment_certificates ec 
          JOIN students s ON ec.student_id = s.id 
          ORDER BY ec.requested_at DESC`, (err, certificates) => {
    if (err) {
      return res.status(500).json({ error: '証明書の取得に失敗しました' });
    }
    res.json(certificates);
  });
});

// 報告書ステータス更新（管理者用）
app.put('/api/admin/activity-reports/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '管理者権限が必要です' });
  }
  
  const { status, reviewer_comment } = req.body;
  const report_id = req.params.id;
  
  db.run(`UPDATE activity_reports SET status = ?, reviewer_comment = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [status, reviewer_comment, report_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'ステータスの更新に失敗しました' });
      }
      res.json({ message: 'ステータスを更新しました' });
    }
  );
});

// 証明書ステータス更新（管理者用）
app.put('/api/admin/enrollment-certificates/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '管理者権限が必要です' });
  }
  
  const { status } = req.body;
  const certificate_id = req.params.id;
  
  db.run(`UPDATE enrollment_certificates SET status = ?, issued_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [status, certificate_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'ステータスの更新に失敗しました' });
      }
      res.json({ message: 'ステータスを更新しました' });
    }
  );
});

// ファイルダウンロード
app.get('/api/files/:filename', authenticateToken, (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', filename);
  
  if (fs.existsSync(filepath)) {
    res.download(filepath);
  } else {
    res.status(404).json({ error: 'ファイルが見つかりません' });
  }
});

// エラーハンドリング
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'ファイルサイズが大きすぎます（最大5MB）' });
    }
  }
  res.status(500).json({ error: 'サーバーエラーが発生しました' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 