import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, GraduationCap, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await registerUser(data);
    
    if (result.success) {
      toast.success('登録が完了しました');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-600">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            アカウント登録
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            交換留学生として登録してください
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="student_id" className="form-label">
                学生ID
              </label>
              <input
                id="student_id"
                type="text"
                {...register('student_id', { 
                  required: '学生IDは必須です',
                  pattern: {
                    value: /^[A-Z0-9]+$/,
                    message: '学生IDは英数字のみで入力してください'
                  }
                })}
                className="input-field"
                placeholder="例: 2024001"
              />
              {errors.student_id && (
                <p className="mt-1 text-sm text-red-600">{errors.student_id.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="name" className="form-label">
                氏名
              </label>
              <input
                id="name"
                type="text"
                {...register('name', { 
                  required: '氏名は必須です',
                  minLength: {
                    value: 2,
                    message: '氏名は2文字以上で入力してください'
                  }
                })}
                className="input-field"
                placeholder="山田 太郎"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'メールアドレスは必須です',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: '有効なメールアドレスを入力してください'
                  }
                })}
                className="input-field"
                placeholder="example@university.edu"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="nationality" className="form-label">
                国籍
              </label>
              <input
                id="nationality"
                type="text"
                {...register('nationality', { 
                  required: '国籍は必須です'
                })}
                className="input-field"
                placeholder="例: アメリカ"
              />
              {errors.nationality && (
                <p className="mt-1 text-sm text-red-600">{errors.nationality.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="home_university" className="form-label">
                出身大学
              </label>
              <input
                id="home_university"
                type="text"
                {...register('home_university', { 
                  required: '出身大学は必須です'
                })}
                className="input-field"
                placeholder="例: ハーバード大学"
              />
              {errors.home_university && (
                <p className="mt-1 text-sm text-red-600">{errors.home_university.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="exchange_period" className="form-label">
                交換留学期間
              </label>
              <select
                id="exchange_period"
                {...register('exchange_period', { 
                  required: '交換留学期間は必須です'
                })}
                className="input-field"
              >
                <option value="">期間を選択してください</option>
                <option value="1学期">1学期</option>
                <option value="2学期">2学期</option>
                <option value="1年間">1年間</option>
                <option value="その他">その他</option>
              </select>
              {errors.exchange_period && (
                <p className="mt-1 text-sm text-red-600">{errors.exchange_period.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="form-label">
                パスワード
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { 
                    required: 'パスワードは必須です',
                    minLength: {
                      value: 6,
                      message: 'パスワードは6文字以上で入力してください'
                    }
                  })}
                  className="input-field pr-10"
                  placeholder="パスワードを入力"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                パスワード確認
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', { 
                  required: 'パスワード確認は必須です',
                  validate: value => value === password || 'パスワードが一致しません'
                })}
                className="input-field"
                placeholder="パスワードを再入力"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '登録中...' : '登録'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              既にアカウントをお持ちの方はこちら
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 