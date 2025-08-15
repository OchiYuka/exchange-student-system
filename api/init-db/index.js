const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const app = express();

// ミドルウェア
app.use(cors());
app.use(express.json());

// Neon PostgreSQL接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
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

// データベース初期化エンドポイント
app.post('/', async (req, res) => {
  try {
    await initDatabase();
    res.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ error: 'Database initialization failed' });
  }
});

module.exports = app;
