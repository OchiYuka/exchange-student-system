/**
 * STEP-005: ルーティング設定
 * ステータス: completed
 * 完了日時: 2024-01-01T00:00:00Z
 * 説明: react-router-dom・BrowserRouter設定完了
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App';

// 環境に応じてaxiosのベースURL設定
if (process.env.NODE_ENV === 'production') {
  axios.defaults.baseURL = '/api';
} else {
  axios.defaults.baseURL = 'http://localhost:5000/api';
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 