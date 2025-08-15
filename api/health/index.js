const express = require('express');
const cors = require('cors');

const app = express();

// ミドルウェア
app.use(cors());
app.use(express.json());

// ヘルスチェックエンドポイント
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Exchange Student System API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
