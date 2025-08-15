const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// ログイン
app.post('/', async (req, res) => {
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

module.exports = app;
