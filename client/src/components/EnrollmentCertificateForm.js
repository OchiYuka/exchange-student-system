import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, Certificate } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const EnrollmentCertificateForm = ({ onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('request_type', data.request_type);
      formData.append('purpose', data.purpose);
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      
      await api.post('/api/enrollment-certificates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      reset();
      setSelectedFile(null);
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || '証明書の申請に失敗しました');
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
          <h2 className="text-xl font-semibold text-gray-900">在籍証明書申請</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label htmlFor="request_type" className="form-label">
              証明書の種類
            </label>
            <select
              id="request_type"
              {...register('request_type', { 
                required: '証明書の種類は必須です'
              })}
              className="input-field"
            >
              <option value="">種類を選択してください</option>
              <option value="在籍証明書">在籍証明書</option>
              <option value="成績証明書">成績証明書</option>
              <option value="卒業見込証明書">卒業見込証明書</option>
              <option value="出席証明書">出席証明書</option>
              <option value="その他">その他</option>
            </select>
            {errors.request_type && (
              <p className="mt-1 text-sm text-red-600">{errors.request_type.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="purpose" className="form-label">
              申請目的
            </label>
            <textarea
              id="purpose"
              rows={4}
              {...register('purpose', { 
                required: '申請目的は必須です',
                minLength: {
                  value: 20,
                  message: '申請目的は20文字以上で入力してください'
                }
              })}
              className="input-field resize-none"
              placeholder="証明書の使用目的を具体的に記載してください。例：奨学金申請、就職活動、ビザ申請など"
            />
            {errors.purpose && (
              <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="file" className="form-label">
              追加書類（任意）
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
                <Certificate className="h-5 w-5 text-gray-400" />
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

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Certificate className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  在籍証明書申請について
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>証明書の発行には通常3-5営業日かかります</li>
                    <li>緊急の場合は申請時にその旨を記載してください</li>
                    <li>必要に応じて追加書類を添付してください</li>
                    <li>申請状況はダッシュボードで確認できます</li>
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
              {isSubmitting ? '申請中...' : '証明書を申請'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnrollmentCertificateForm; 