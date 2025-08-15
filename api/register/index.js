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

// Neon PostgreSQL接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// ユーザー登録
app.post('/', [
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

module.exports = app;
