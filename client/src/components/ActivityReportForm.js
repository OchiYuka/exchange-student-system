import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, FileText } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ActivityReportForm = ({ onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      await api.post('/api/activity-reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      reset();
      setSelectedFile(null);
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || '報告書の提出に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ファイルサイズは5MB以下にしてください');
        return;
      }
      setSelectedFile(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">活動報告書提出</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="form-label">
              報告書タイトル
            </label>
            <input
              id="title"
              type="text"
              {...register('title', { 
                required: 'タイトルは必須です',
                minLength: {
                  value: 3,
                  message: 'タイトルは3文字以上で入力してください'
                }
              })}
              className="input-field"
              placeholder="例: 2024年春学期活動報告"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="content" className="form-label">
              活動内容
            </label>
            <textarea
              id="content"
              rows={8}
              {...register('content', { 
                required: '活動内容は必須です',
                minLength: {
                  value: 50,
                  message: '活動内容は50文字以上で入力してください'
                }
              })}
              className="input-field resize-none"
              placeholder="留学中の活動内容を詳しく記入してください。授業、研究活動、文化交流、その他の活動について具体的に記載してください。"
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="file" className="form-label">
              添付ファイル（任意）
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>ファイルをアップロード</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">またはドラッグ&ドロップ</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, JPG, PNGファイル（最大5MB）
                </p>
              </div>
            </div>
            {selectedFile && (
              <div className="mt-2 flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                <FileText className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  削除
                </button>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  活動報告書の提出について
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>定期的に活動内容を報告してください</li>
                    <li>具体的な活動内容と成果を記載してください</li>
                    <li>必要に応じて写真や資料を添付してください</li>
                    <li>提出後は審査が行われ、コメントが付きます</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? '提出中...' : '報告書を提出'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityReportForm; 