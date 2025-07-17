'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    userId: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 이미 로그인된 사용자는 대시보드로 리다이렉트
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log('이미 로그인된 사용자 - 대시보드로 리다이렉트');
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 입력 시 에러 메시지 초기화
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData.userId, formData.password);
      
      if (result.success) {
        console.log('로그인 성공 - 대시보드로 이동');
        router.push('/dashboard');
      } else {
        setError(result.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('로그인 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 인증 상태 확인 중일 때 로딩 화면
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <span className="text-white text-2xl font-bold animate-pulse">LC</span>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <svg className="animate-spin h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-300 font-medium">인증 상태 확인 중...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 flex">
      {/* 왼쪽 브랜딩 영역 */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-gray-900/40"></div>
        <div className="relative z-10 flex flex-col justify-center items-start p-12 text-white">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              LibraryCompany<br />Dashboard
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mb-6"></div>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              공연 데이터를 한눈에 분석하고<br />
              인사이트를 발견하세요
            </p>
            <div className="space-y-4 text-gray-400">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>실시간 매출 현황</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>마케팅 성과 분석</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>통합 대시보드</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 오른쪽 로그인 폼 영역 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* 모바일에서만 보이는 로고 */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              LibraryCompany Dashboard
            </h1>
            <div className="h-0.5 w-24 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">데이터 대시보드에 로그인하세요</p>
          </div>

          {/* 로그인 폼 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-700/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-600/50 p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 아이디 입력 */}
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-300 mb-2">
                  아이디
                </label>
                <input
                  id="userId"
                  name="userId"
                  type="text"
                  required
                  value={formData.userId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-600/50 border border-gray-500/50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                  placeholder="아이디를 입력하세요"
                  disabled={isLoading}
                />
              </div>

              {/* 비밀번호 입력 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-600/50 border border-gray-500/50 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                  placeholder="비밀번호를 입력하세요"
                  disabled={isLoading}
                />
              </div>

              {/* 에러 메시지 */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="bg-red-500/10 backdrop-blur-sm border border-red-400/20 rounded-lg p-4 shadow-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-red-300 text-sm font-medium">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 로그인 버튼 */}
              <motion.button
                type="submit"
                disabled={isLoading || !formData.userId || !formData.password}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    로그인 중...
                  </>
                ) : (
                  '로그인'
                )}
              </motion.button>
            </form>

            {/* 테스트 계정 정보 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 p-4 bg-gray-600/30 rounded-lg border border-gray-500/30"
            >
              <p className="text-sm text-gray-300 font-medium mb-2 flex items-center">
                <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mr-2"></span>
                문의는 플랫폼팀 이진욱님에게 해주세요.
              </p>
            </motion.div>
          </motion.div>

          {/* 푸터 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-gray-500">
              © 2025 라이브러리컴퍼니
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 