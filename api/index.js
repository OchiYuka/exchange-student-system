/**
 * STEP-008: APIサーバー実装
 * ステータス: completed
 * 完了日時: 2024-01-01T00:00:00Z
 * 説明: Expressサーバー・CORS設定完了
 */

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3001;

// CORS設定
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.vercel.app'] 
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// データベース接続テスト
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// 基本的なルート
app.get('/', (req, res) => {
  res.json({ 
    message: 'Exchange Student System API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// 活動報告書関連のルート
app.get('/api/activity-reports', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activity_reports ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching activity reports:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/activity-reports', async (req, res) => {
  try {
    const { title, content, student_name, student_email } = req.body;
    const result = await pool.query(
      'INSERT INTO activity_reports (title, content, student_name, student_email, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, content, student_name, student_email, 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating activity report:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 在籍証明書関連のルート
app.get('/api/enrollment-certificates', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM enrollment_certificates ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching enrollment certificates:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/enrollment-certificates', async (req, res) => {
  try {
    const { type, purpose, student_name, student_email } = req.body;
    const result = await pool.query(
      'INSERT INTO enrollment_certificates (type, purpose, student_name, student_email, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [type, purpose, student_name, student_email, 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating enrollment certificate:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ステータス更新（管理者用）
app.put('/api/activity-reports/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE activity_reports SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity report not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating activity report status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/enrollment-certificates/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE enrollment_certificates SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Enrollment certificate not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating enrollment certificate status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// 404ハンドリング
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
