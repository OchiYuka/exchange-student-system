/**
 * STEP-006: フォーム機能実装
 * ステータス: completed
 * 完了日時: 2024-01-01T00:00:00Z
 * 説明: 活動報告書・在籍証明書フォーム実装完了
 */

import axios from 'axios';

// APIのベースURLを環境に応じて設定
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin + '/api';
  }
  return 'http://localhost:3001';
};

// axiosインスタンスを作成
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（認証トークンの追加など）
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリングなど）
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 認証エラーの場合、ログインページにリダイレクト
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;


