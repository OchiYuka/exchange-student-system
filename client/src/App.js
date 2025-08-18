/**
 * STEP-004: 基本コンポーネント作成
 * ステータス: completed
 * 完了日時: 2024-01-01T00:00:00Z
 * 説明: App.js・LoginPage・Dashboard作成完了
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

function App() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showCertificateForm, setShowCertificateForm] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [isAdmin, setIsAdmin] = useState(false);

  // 学生の提出機能を改善
  const submitReport = (reportData) => {
    const newReport = {
      id: Date.now(),
      ...reportData,
      status: 'pending',
      submittedAt: new Date().toLocaleString('ja-JP'),
      studentName: user.name,
      studentEmail: user.email,
      fileName: reportData.file ? reportData.file.name : null
    };
    setReports([...reports, newReport]);
    alert('活動報告書を提出しました！');
  };

  const submitCertificate = (certificateData) => {
    const newCertificate = {
      id: Date.now(),
      ...certificateData,
      status: 'pending',
      submittedAt: new Date().toLocaleString('ja-JP'),
      studentName: user.name,
      studentEmail: user.email,
      fileName: certificateData.file ? certificateData.file.name : null
    };
    setCertificates([...certificates, newCertificate]);
    alert('在籍証明書を申請しました！');
  };

  // 管理者の審査機能を改善
  const approveReport = (id) => {
    setReports(prev => prev.map(report => 
      report.id === id ? { ...report, status: 'approved' } : report
    ));
  };

  const rejectReport = (id) => {
    setReports(prev => prev.map(report => 
      report.id === id ? { ...report, status: 'rejected' } : report
    ));
  };

  const approveCertificate = (id) => {
    setCertificates(prev => prev.map(cert => 
      cert.id === id ? { ...cert, status: 'approved' } : cert
    ));
  };

  const rejectCertificate = (id) => {
    setCertificates(prev => prev.map(cert => 
      cert.id === id ? { ...cert, status: 'rejected' } : cert
    ));
  };

  // ログインページ
  const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
      e.preventDefault();
      
      // 管理者ログインの判定
      if (email === 'admin' && password === 'admin123') {
        setUser({ name: '管理者', email: email });
        setIsAdmin(true);
        console.log('管理者としてログインしました');
        navigate('/admin');
      } else {
        // 一般ユーザーログイン
        setUser({ name: 'テストユーザー', email: email });
        setIsAdmin(false);
        console.log('一般ユーザーとしてログインしました');
        navigate('/dashboard');
      }
    };

    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '8px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>
            交換留学生システム
          </h1>
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>
                ユーザー名 / メールアドレス
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                placeholder="ユーザー名またはメールアドレスを入力"
                required
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                placeholder="パスワードを入力"
                required
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              ログイン
            </button>
          </form>
          
          {/* ヘルプ情報 */}
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: '#f8f9fa', 
            borderRadius: '5px',
            border: '1px solid #e9ecef'
          }}>
            <p style={{ margin: '0', fontSize: '0.9rem', color: '#6c757d', textAlign: 'center' }}>
              <strong>ヘルプ:</strong><br/>
              学生の方は任意のメールアドレスとパスワードでログインできます。<br/>
              管理者の方はシステム管理者にお問い合わせください。
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ダッシュボードページ
  const DashboardPage = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
      setUser(null);
      setIsAdmin(false);
      navigate('/');
    };

    const getStatusBadge = (status) => {
      switch (status) {
        case 'pending':
          return <span style={{ background: '#ffc107', color: '#333', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem' }}>申請中</span>;
        case 'approved':
          return <span style={{ background: '#28a745', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem' }}>承認済み</span>;
        case 'rejected':
          return <span style={{ background: '#dc3545', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem' }}>却下</span>;
        default:
          return <span style={{ background: '#6c757d', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem' }}>未提出</span>;
      }
    };

    // 活動報告書フォーム
    const ReportForm = () => {
      const [reportData, setReportData] = useState({
        title: '',
        content: '',
        file: null
      });

      const handleSubmit = (e) => {
        e.preventDefault();
        submitReport(reportData);
        setShowReportForm(false);
        setReportData({ title: '', content: '', file: null });
      };

      const handleFileChange = (e) => {
        setReportData({ ...reportData, file: e.target.files[0] });
      };

      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#333' }}>活動報告書提出</h2>
              <button
                onClick={() => setShowReportForm(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 'bold' }}>
                  報告書タイトル *
                </label>
                <input
                  type="text"
                  value={reportData.title}
                  onChange={(e) => setReportData({...reportData, title: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                  placeholder="例: 2024年春学期活動報告"
                  required
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 'bold' }}>
                  活動内容 *
                </label>
                <textarea
                  value={reportData.content}
                  onChange={(e) => setReportData({...reportData, content: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    minHeight: '120px',
                    resize: 'vertical'
                  }}
                  placeholder="活動の詳細を記入してください"
                  required
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 'bold' }}>
                  添付ファイル（任意）
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  提出する
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    };

    // 在籍証明書フォーム
    const CertificateForm = () => {
      const [certificateData, setCertificateData] = useState({
        type: '',
        purpose: '',
        file: null
      });

      const handleSubmit = (e) => {
        e.preventDefault();
        submitCertificate(certificateData);
        setShowCertificateForm(false);
        setCertificateData({ type: '', purpose: '', file: null });
      };

      const handleFileChange = (e) => {
        setCertificateData({ ...certificateData, file: e.target.files[0] });
      };

      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: '#333' }}>在籍証明書申請</h2>
              <button
                onClick={() => setShowCertificateForm(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 'bold' }}>
                  証明書の種類 *
                </label>
                <select
                  value={certificateData.type}
                  onChange={(e) => setCertificateData({...certificateData, type: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                  required
                >
                  <option value="">選択してください</option>
                  <option value="在籍証明書">在籍証明書</option>
                  <option value="成績証明書">成績証明書</option>
                  <option value="卒業見込証明書">卒業見込証明書</option>
                  <option value="その他">その他</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 'bold' }}>
                  申請目的 *
                </label>
                <textarea
                  value={certificateData.purpose}
                  onChange={(e) => setCertificateData({...certificateData, purpose: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                  placeholder="申請目的を記入してください"
                  required
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: 'bold' }}>
                  添付書類（任意）
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  申請する
                </button>
                <button
                  type="button"
                  onClick={() => setShowCertificateForm(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    };

    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>学生ダッシュボード</h1>
          <button 
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ログアウト
          </button>
        </div>

        {/* 提出ボタン */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => setShowReportForm(true)}
            style={{
              padding: '1rem 2rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            📝 活動報告書を提出
          </button>
          <button
            onClick={() => setShowCertificateForm(true)}
            style={{
              padding: '1rem 2rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            📄 在籍証明書を申請
          </button>
        </div>

        {/* 提出状況 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* 活動報告書の状況 */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>活動報告書の状況</h2>
            {reports.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center' }}>提出された報告書はありません</p>
            ) : (
              reports.map(report => (
                <div key={report.id} style={{ 
                  border: '1px solid #e5e7eb', 
                  padding: '1rem', 
                  marginBottom: '1rem', 
                  borderRadius: '5px'
                }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{report.title}</h3>
                  <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>提出日: {report.submittedAt}</p>
                  {report.fileName && (
                    <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>添付ファイル: {report.fileName}</p>
                  )}
                  <div style={{ marginTop: '0.5rem' }}>
                    {getStatusBadge(report.status)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 在籍証明書の状況 */}
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>在籍証明書の状況</h2>
            {certificates.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center' }}>申請された証明書はありません</p>
            ) : (
              certificates.map(cert => (
                <div key={cert.id} style={{ 
                  border: '1px solid #e5e7eb', 
                  padding: '1rem', 
                  marginBottom: '1rem', 
                  borderRadius: '5px'
                }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{cert.type}</h3>
                  <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>申請日: {cert.submittedAt}</p>
                  {cert.fileName && (
                    <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>添付ファイル: {cert.fileName}</p>
                  )}
                  <div style={{ marginTop: '0.5rem' }}>
                    {getStatusBadge(cert.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* モーダル */}
        {showReportForm && <ReportForm />}
        {showCertificateForm && <CertificateForm />}
      </div>
    );
  };

  // 管理者ダッシュボード
  const AdminDashboard = () => {
    const navigate = useNavigate();
    
    // 学生が提出した報告書と証明書を表示
    const pendingReports = reports.filter(report => report.status === 'pending');
    const pendingCertificates = certificates.filter(cert => cert.status === 'pending');

    const handleLogout = () => {
      setUser(null);
      setIsAdmin(false);
      navigate('/');
    };

    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>管理者ダッシュボード</h1>
          <button 
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ログアウト
          </button>
        </div>

        {/* 統計情報 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: '#667eea', color: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{reports.length}</h3>
            <p style={{ margin: 0 }}>総報告書数</p>
          </div>
          <div style={{ backgroundColor: '#10b981', color: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{certificates.length}</h3>
            <p style={{ margin: 0 }}>総証明書申請数</p>
          </div>
          <div style={{ backgroundColor: '#f59e0b', color: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{pendingReports.length}</h3>
            <p style={{ margin: 0 }}>審査待ち報告書</p>
          </div>
          <div style={{ backgroundColor: '#ef4444', color: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>{pendingCertificates.length}</h3>
            <p style={{ margin: 0 }}>審査待ち証明書</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* 活動報告書の審査 */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>活動報告書の審査</h2>
            {pendingReports.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center' }}>審査待ちの報告書はありません</p>
            ) : (
              pendingReports.map(report => (
                <div key={report.id} style={{ 
                  border: '1px solid #e5e7eb', 
                  padding: '15px', 
                  marginBottom: '10px', 
                  borderRadius: '5px',
                  backgroundColor: '#fef3c7'
                }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '5px' }}>{report.title}</h3>
                  <p style={{ color: '#6b7280', marginBottom: '5px' }}>学生: {report.studentName}</p>
                  <p style={{ color: '#6b7280', marginBottom: '5px' }}>提出日: {report.submittedAt}</p>
                  {report.fileName && (
                    <p style={{ color: '#6b7280', marginBottom: '5px' }}>添付ファイル: {report.fileName}</p>
                  )}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button 
                      onClick={() => approveReport(report.id)}
                      style={{
                        padding: '5px 15px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      承認
                    </button>
                    <button 
                      onClick={() => rejectReport(report.id)}
                      style={{
                        padding: '5px 15px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      却下
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 在籍証明書の審査 */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1f2937' }}>在籍証明書の審査</h2>
            {pendingCertificates.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center' }}>審査待ちの証明書はありません</p>
            ) : (
              pendingCertificates.map(cert => (
                <div key={cert.id} style={{ 
                  border: '1px solid #e5e7eb', 
                  padding: '15px', 
                  marginBottom: '10px', 
                  borderRadius: '5px',
                  backgroundColor: '#fef3c7'
                }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '5px' }}>{cert.type}</h3>
                  <p style={{ color: '#6c757d', marginBottom: '5px' }}>学生: {cert.studentName}</p>
                  <p style={{ color: '#6c757d', marginBottom: '5px' }}>申請日: {cert.submittedAt}</p>
                  {cert.fileName && (
                    <p style={{ color: '#6c757d', marginBottom: '5px' }}>添付ファイル: {cert.fileName}</p>
                  )}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button 
                      onClick={() => approveCertificate(cert.id)}
                      style={{
                        padding: '5px 15px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      承認
                    </button>
                    <button 
                      onClick={() => rejectCertificate(cert.id)}
                      style={{
                        padding: '5px 15px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      却下
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // ルーティング設定
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 