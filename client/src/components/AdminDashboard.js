import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  FileText, 
  Certificate, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle,
  Shield,
  Users,
  Eye,
  MessageSquare,
  X
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

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
    navigate('/admin/login');
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

  const handleReview = (item, type) => {
    setSelectedItem({ ...item, type });
    setShowReviewModal(true);
  };

  const handleStatusUpdate = async (status, comment = '') => {
    try {
      const endpoint = selectedItem.type === 'report' 
        ? `/api/admin/activity-reports/${selectedItem.id}`
        : `/api/admin/enrollment-certificates/${selectedItem.id}`;
      
      const data = selectedItem.type === 'report' 
        ? { status, reviewer_comment: comment }
        : { status };

      await api.put(endpoint, data);
      
      toast.success('ステータスを更新しました');
      setShowReviewModal(false);
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      toast.error('ステータスの更新に失敗しました');
    }
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
              <Shield className="h-8 w-8 text-red-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">管理者ダッシュボード</h1>
                <p className="text-sm text-gray-500">交換留学生システム管理</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">管理者</p>
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
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">総報告書数</dt>
                  <dd className="text-lg font-medium text-gray-900">{reports.length}</dd>
                </dl>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">審査待ち報告書</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {reports.filter(r => r.status === 'pending').length}
                  </dd>
                </dl>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">総証明書申請</dt>
                  <dd className="text-lg font-medium text-gray-900">{certificates.length}</dd>
                </dl>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">審査待ち証明書</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {certificates.filter(c => c.status === 'pending').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />
                活動報告書管理
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
                在籍証明書管理
              </button>
            </nav>
          </div>
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'reports' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">活動報告書一覧</h2>
            {reports.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">報告書がありません</h3>
                <p className="text-gray-500">学生からの報告書提出を待っています。</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {reports.map((report) => (
                  <div key={report.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-500">
                          提出者: {report.student_name} ({report.student_id})
                        </p>
                        <p className="text-sm text-gray-500">提出日: {formatDate(report.submitted_at)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(report.status)}
                        {report.status === 'pending' && (
                          <button
                            onClick={() => handleReview(report, 'report')}
                            className="btn-primary flex items-center space-x-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span>審査</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{report.content}</p>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-6">在籍証明書申請一覧</h2>
            {certificates.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <Certificate className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">証明書申請がありません</h3>
                <p className="text-gray-500">学生からの証明書申請を待っています。</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {certificates.map((certificate) => (
                  <div key={certificate.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{certificate.request_type}</h3>
                        <p className="text-sm text-gray-500">
                          申請者: {certificate.student_name} ({certificate.student_id})
                        </p>
                        <p className="text-sm text-gray-500">申請日: {formatDate(certificate.requested_at)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(certificate.status)}
                        {certificate.status === 'pending' && (
                          <button
                            onClick={() => handleReview(certificate, 'certificate')}
                            className="btn-primary flex items-center space-x-2"
                          >
                            <Eye className="h-4 w-4" />
                            <span>審査</span>
                          </button>
                        )}
                      </div>
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

      {/* 審査モーダル */}
      {showReviewModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedItem.type === 'report' ? '活動報告書審査' : '在籍証明書審査'}
              </h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedItem.type === 'report' ? selectedItem.title : selectedItem.request_type}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {selectedItem.type === 'report' 
                    ? `提出者: ${selectedItem.student_name} (${selectedItem.student_id})`
                    : `申請者: ${selectedItem.student_name} (${selectedItem.student_id})`
                  }
                </p>
                {selectedItem.type === 'report' ? (
                  <p className="text-gray-700">{selectedItem.content}</p>
                ) : (
                  <p className="text-gray-700">用途: {selectedItem.purpose}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  却下
                </button>
                <button
                  onClick={() => handleStatusUpdate('approved')}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  承認
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 