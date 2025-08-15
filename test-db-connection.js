const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Neon PostgreSQL接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('Neon PostgreSQLに接続中...');
    const client = await pool.connect();
    console.log('✅ データベース接続成功！');
    
    // 簡単なクエリを実行
    const result = await client.query('SELECT NOW() as current_time');
    console.log('現在時刻:', result.rows[0].current_time);
    
    client.release();
    await pool.end();
    console.log('接続を閉じました');
  } catch (error) {
    console.error('❌ データベース接続エラー:', error.message);
    console.error('詳細エラー:', error);
    process.exit(1);
  }
}

testConnection();
