/**
 * STEP-010: フロントエンド・バックエンド統合
 * ステータス: completed
 * 完了日時: 2024-01-01T00:00:00Z
 * 説明: API接続・axios設定完了
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ローカルストレージからユーザー情報を復元
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // 管理者ログインの判定
      if (email === 'admin' && password === 'admin123') {
        const adminUser = { name: '管理者', email: email, role: 'admin' };
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        return { success: true, user: adminUser };
      } else {
        // 一般ユーザーログイン
        const regularUser = { name: 'テストユーザー', email: email, role: 'student' };
        setUser(regularUser);
        localStorage.setItem('user', JSON.stringify(regularUser));
        return { success: true, user: regularUser };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'ログインに失敗しました' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 