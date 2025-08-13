import axios from 'axios';

// 環境に応じてAPIのベースURLを設定
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // Vercelデプロイ時は同じドメインのAPIを使用
    return '';
  }
  // 開発時はローカルサーバーを使用
  return 'http://localhost:5000';
};

// Axiosインスタンスを作成
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
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

// レスポンスインターセプター
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 認証エラーの場合、ローカルストレージをクリア
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;


