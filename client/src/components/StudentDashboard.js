import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  FileText, 
  Certificate, 
  Plus, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Calendar,
  MapPin,
  GraduationCap,
  BarChart3,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import ActivityReportForm from './ActivityReportForm';
import EnrollmentCertificateForm from './EnrollmentCertificateForm';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showReportForm, setShowReportForm] = useState(false);
  const [showCertificateForm, setShowCertificateForm] = useState(false);
  const [reports, setReports] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reportsRes, certificatesRes] = await Promise.all([
              api.get('/api/activity-reports'),
      api.get('/api/enrollment-certificates')
      ]);
      setReports(reportsRes.data);
      setCertificates(certificatesRes.data);
    } catch (error) {
      toast.error('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('ログアウトしました');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />審査中</span>;
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />承認済み</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />却下</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">不明</span>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 統計情報の計算
  const stats = {
    totalReports: reports.length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    approvedReports: reports.filter(r => r.status === 'approved').length,
    totalCertificates: certificates.length,
    pendingCertificates: certificates.filter(c => c.status === 'pending').length,
    approvedCertificates: certificates.filter(c => c.status === 'approved').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <GraduationCap className="h-8 w-8 text-primary-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">交換留学生システム</h1>
                <p className="text-sm text-gray-500">学生ダッシュボード</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">学生ID: {user.student_id}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>ログアウト</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 学生情報カード */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">学生情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">氏名</p>
                <p className="text-sm text-gray-500">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">学生ID</p>
                <p className="text-sm text-gray-500">{user.student_id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">登録日</p>
                <p className="text-sm text-gray-500">{formatDate(user.created_at || new Date())}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">メール</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 統計情報カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">活動報告書</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalReports}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>審査中: {stats.pendingReports}</span>
              </div>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>承認済み: {stats.approvedReports}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Certificate className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">在籍証明書</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalCertificates}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>申請中: {stats.pendingCertificates}</span>
              </div>
              <div className="flex items-center text-sm text-green-600 mt-1">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>発行済み: {stats.approvedCertificates}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">承認率</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalReports + stats.totalCertificates > 0 
                      ? Math.round(((stats.approvedReports + stats.approvedCertificates) / (stats.totalReports + stats.totalCertificates)) * 100)
                      : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">審査待ち</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pendingReports + stats.pendingCertificates}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowReportForm(true)}
              className="flex items-center justify-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Plus className="h-6 w-6 text-primary-600" />
              <span className="text-primary-600 font-medium">新しい活動報告書を提出</span>
            </button>
            <button
              onClick={() => setShowCertificateForm(true)}
              className="flex items-center justify-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Plus className="h-6 w-6 text-primary-600" />
              <span className="text-primary-600 font-medium">在籍証明書を申請</span>
            </button>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline mr-2" />
                概要
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                活動報告書
              </button>
              <button
                onClick={() => setActiveTab('certificates')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'certificates'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Certificate className="h-4 w-4 inline mr-2" />
                在籍証明書
              </button>
            </nav>
          </div>
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 最近の活動報告書 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">最近の活動報告書</h3>
              {reports.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">報告書がありません</h4>
                  <p className="text-gray-500 mb-4">最初の活動報告書を提出してください。</p>
                  <button
                    onClick={() => setShowReportForm(true)}
                    className="btn-primary"
                  >
                    報告書を提出
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {reports.slice(0, 3).map((report) => (
                    <div key={report.id} className="bg-white rounded-lg shadow-sm border p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-md font-medium text-gray-900">{report.title}</h4>
                          <p className="text-sm text-gray-500">提出日: {formatDate(report.submitted_at)}</p>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>
                    </div>
                  ))}
                  {reports.length > 3 && (
                    <div className="text-center">
                      <button
                        onClick={() => setActiveTab('reports')}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        全ての報告書を表示 →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 最近の証明書申請 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">最近の証明書申請</h3>
              {certificates.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                  <Certificate className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">証明書申請がありません</h4>
                  <p className="text-gray-500 mb-4">在籍証明書の申請を行ってください。</p>
                  <button
                    onClick={() => setShowCertificateForm(true)}
                    className="btn-primary"
                  >
                    証明書を申請
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {certificates.slice(0, 3).map((certificate) => (
                    <div key={certificate.id} className="bg-white rounded-lg shadow-sm border p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-md font-medium text-gray-900">{certificate.request_type}</h4>
                          <p className="text-sm text-gray-500">申請日: {formatDate(certificate.requested_at)}</p>
                        </div>
                        {getStatusBadge(certificate.status)}
                      </div>
                    </div>
                  ))}
                  {certificates.length > 3 && (
                    <div className="text-center">
                      <button
                        onClick={() => setActiveTab('certificates')}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        全ての証明書を表示 →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">活動報告書</h2>
              <button
                onClick={() => setShowReportForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>新しい報告書を提出</span>
              </button>
            </div>

            {reports.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">報告書がありません</h3>
                <p className="text-gray-500 mb-4">最初の活動報告書を提出してください。</p>
                <button
                  onClick={() => setShowReportForm(true)}
                  className="btn-primary"
                >
                  報告書を提出
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {reports.map((report) => (
                  <div key={report.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-500">提出日: {formatDate(report.submitted_at)}</p>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                    <p className="text-gray-700 mb-4">{report.content}</p>
                    {report.reviewer_comment && (
                      <div className="bg-gray-50 rounded-md p-4 mb-4">
                        <p className="text-sm font-medium text-gray-900 mb-1">審査コメント:</p>
                        <p className="text-sm text-gray-700">{report.reviewer_comment}</p>
                      </div>
                    )}
                    {report.file_path && (
                      <button
                        onClick={() => window.open(`/api/files/${report.file_path.split('/').pop()}`, '_blank')}
                        className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm"
                      >
                        <Download className="h-4 w-4" />
                        <span>添付ファイルをダウンロード</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'certificates' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">在籍証明書</h2>
              <button
                onClick={() => setShowCertificateForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>証明書を申請</span>
              </button>
            </div>

            {certificates.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <Certificate className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">証明書申請がありません</h3>
                <p className="text-gray-500 mb-4">在籍証明書の申請を行ってください。</p>
                <button
                  onClick={() => setShowCertificateForm(true)}
                  className="btn-primary"
                >
                  証明書を申請
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {certificates.map((certificate) => (
                  <div key={certificate.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{certificate.request_type}</h3>
                        <p className="text-sm text-gray-500">申請日: {formatDate(certificate.requested_at)}</p>
                      </div>
                      {getStatusBadge(certificate.status)}
                    </div>
                    <p className="text-gray-700 mb-4">用途: {certificate.purpose}</p>
                    {certificate.file_path && (
                      <button
                        onClick={() => window.open(`/api/files/${certificate.file_path.split('/').pop()}`, '_blank')}
                        className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm"
                      >
                        <Download className="h-4 w-4" />
                        <span>添付ファイルをダウンロード</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* モーダル */}
      {showReportForm && (
        <ActivityReportForm
          onClose={() => setShowReportForm(false)}
          onSuccess={() => {
            setShowReportForm(false);
            fetchData();
            toast.success('活動報告書を提出しました');
          }}
        />
      )}

      {showCertificateForm && (
        <EnrollmentCertificateForm
          onClose={() => setShowCertificateForm(false)}
          onSuccess={() => {
            setShowCertificateForm(false);
            fetchData();
            toast.success('在籍証明書を申請しました');
          }}
        />
      )}
    </div>
  );
};

export default StudentDashboard; 