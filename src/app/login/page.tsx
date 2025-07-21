'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [isMuted, setIsMuted] = useState(true); // 기본값: 음소거 ON (자동재생 보장)
  const [videoKey, setVideoKey] = useState(0); // iframe 강제 리로드용
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 페이지 로드 시 자동재생을 위한 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      setVideoKey(prev => prev + 1); // iframe 강제 리로드
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // 영상 영역 클릭 시 소리 켜기
  const handleVideoClick = () => {
    if (isMuted) {
      setIsMuted(false); // 소리 켜기
      setVideoKey(prev => prev + 1); // iframe 리로드로 소리 적용
      console.log('영상 클릭 - 소리 켜짐');
    }
  };

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

  // 음소거 토글 함수
  const toggleMute = () => {
    setIsMuted(!isMuted);
    setVideoKey(prev => prev + 1); // iframe 리로드로 음소거 상태 즉시 적용
    console.log('음소거 토글:', !isMuted ? '음소거됨' : '소리켜짐');
  };

  // 인증 상태 확인 중일 때 로딩 화면
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <span className="text-white text-3xl font-bold">LC</span>
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-3xl opacity-30 blur-xl animate-pulse"></div>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-white font-medium text-lg">인증 상태 확인 중...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* 배경 애니메이션 레이어들 */}
      <div className="absolute inset-0">
        {/* 기본 그라데이션 배경 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/60 to-blue-900/80"></div>
        
        {/* 움직이는 그라데이션 오브 */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* 스포트라이트 효과 */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-black/20"></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* 왼쪽 영상/브랜딩 영역 */}
        <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden">
          {/* 유튜브 영상 배경 */}
          <div className="absolute inset-0">
            <iframe
              ref={iframeRef}
              key={`video-${videoKey}-${isMuted}`} // videoKey와 음소거 상태로 강제 리렌더링
              src={`https://www.youtube.com/embed/wzfmZRJZUwE?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=wzfmZRJZUwE&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
              title="Background Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                objectFit: 'cover'
              }}
            />
            
            {/* 클릭 가능한 투명 오버레이 */}
            <div 
              className="absolute inset-0 z-5 cursor-pointer"
              onClick={handleVideoClick}
              title={isMuted ? "클릭하여 음악 재생" : "음악 재생 중"}
            ></div>
            
            {/* 영상 위 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-black/30 z-10 pointer-events-none"></div>
            
            {/* 음소거 토글 버튼 */}
            <div className="absolute bottom-6 right-6 z-20">
              <button 
                onClick={toggleMute}
                className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-200 group"
                title={isMuted ? "소리 켜기" : "소리 끄기"}
              >
                {isMuted ? (
                  // 음소거 상태 - 소리 없음 아이콘
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776l-4.146-3.317a1 1 0 00-.632-.219H2a1 1 0 01-1-1V7.761a1 1 0 011-1h1.605a1 1 0 00.632-.219l4.146-3.317a1 1 0 01.617-.149zM15.828 8.172a.5.5 0 00-.707 0L13 10.293 10.879 8.172a.5.5 0 10-.707.707L12.293 11l-2.121 2.121a.5.5 0 10.707.707L13 11.707l2.121 2.121a.5.5 0 10.707-.707L13.707 11l2.121-2.121a.5.5 0 000-.707z" clipRule="evenodd" />
                  </svg>
                ) : (
                  // 소리 재생 상태 - 스피커 아이콘
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776l-4.146-3.317a1 1 0 00-.632-.219H2a1 1 0 01-1-1V7.761a1 1 0 011-1h1.605a1 1 0 00.632-.219l4.146-3.317a1 1 0 01.617-.149zM14.024 7.564a.5.5 0 01.706.019c.33.333.79.797 1.255 1.364.47.574.904 1.253 1.255 1.955.351.703.629 1.462.629 2.098 0 .636-.278 1.395-.629 2.098-.351.702-.785 1.38-1.255 1.955-.464.567-.924 1.031-1.255 1.364a.5.5 0 11-.725-.69c.267-.272.684-.687 1.103-1.205.424-.525.802-1.142 1.11-1.785.312-.65.495-1.273.495-1.737s-.183-1.087-.495-1.737c-.308-.643-.686-1.26-1.11-1.785-.419-.518-.836-.933-1.103-1.205a.5.5 0 01.019-.706z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="relative z-20 flex flex-col justify-between items-start px-12 py-8 text-white h-full">
            {/* 상단 영역 - 타이틀과 설명 */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-full"
            >
              {/* 메인 타이틀 */}
              <div className="relative mb-4">
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  LibraryCompany<br />Dashboard
                </h1>
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 blur-xl opacity-60"></div>
              </div>
              
              {/* 장식적 라인 */}
              <motion.div 
                className="h-1 w-32 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full mb-4 shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: 128 }}
                transition={{ duration: 1.5, delay: 0.5 }}
              ></motion.div>
              
              {/* 설명 텍스트 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7 }}
              >
                <p className="text-lg text-gray-200 leading-relaxed font-light">
                  공연의 모든 순간을<br />
                  <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-semibold">데이터로 만나보세요</span>
                </p>
              </motion.div>
            </motion.div>


          </div>
        </div>

        {/* 오른쪽 로그인 폼 영역 */}
        <div className="w-full lg:w-[40%] flex items-center justify-center p-8 relative">
          {/* 폼 영역 배경 효과 */}
          <div className="absolute inset-0 bg-gradient-to-l from-black/50 via-black/30 to-transparent lg:from-black/70 lg:via-black/50"></div>
          
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md relative z-10 mt-64"
          >
            {/* 모바일에서만 보이는 로고 */}
            <div className="lg:hidden text-center mb-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
                  LibraryCompany Dashboard
                </h1>
                <div className="h-1 w-32 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-blue-400/30 rounded-full mx-auto mb-6"></div>
                <p className="text-gray-300 text-lg">데이터 대시보드에 로그인하세요</p>
              </motion.div>
            </div>

            {/* 로그인 폼 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* 폼 배경 글로우 효과 */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 rounded-3xl blur-2xl"></div>
              
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 아이디 입력 */}
                  <div>
                    <label htmlFor="userId" className="block text-sm font-medium text-gray-200 mb-3">
                      사용자 ID
                    </label>
                    <div className="relative">
                      <input
                        id="userId"
                        name="userId"
                        type="text"
                        required
                        value={formData.userId}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-300 hover:bg-white/15"
                        placeholder="아이디를 입력하세요"
                        disabled={isLoading}
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 hover:from-blue-500/5 hover:via-purple-500/5 hover:to-blue-500/5 transition-all duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* 비밀번호 입력 */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-3">
                      비밀번호
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-300 hover:bg-white/15"
                        placeholder="비밀번호를 입력하세요"
                        disabled={isLoading}
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 hover:from-blue-500/5 hover:via-purple-500/5 hover:to-blue-500/5 transition-all duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* 에러 메시지 */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className="relative"
                    >
                      <div className="absolute -inset-2 bg-gradient-to-r from-red-600/20 to-red-600/20 rounded-xl blur-lg"></div>
                      <div className="relative bg-red-500/10 backdrop-blur-sm border border-red-400/30 rounded-xl p-4">
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
                      </div>
                    </motion.div>
                  )}

                  {/* 로그인 버튼 */}
                  <motion.button
                    type="submit"
                    disabled={isLoading || !formData.userId || !formData.password}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className="relative w-full py-4 px-4 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-2xl overflow-hidden group"
                  >
                    {/* 버튼 배경 그라데이션 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-blue-500 transition-all duration-300"></div>
                    
                    {/* 버튼 글로우 효과 */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                    
                    {/* 버튼 내용 */}
                    <div className="relative flex items-center justify-center">
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                          로그인 중...
                        </>
                      ) : (
                        '로그인'
                      )}
                    </div>
                  </motion.button>
                </form>
                
                {/* 담당자 정보 */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-500 text-center">
                    담당자: <span className="text-gray-400 font-medium">플랫폼팀 이진욱</span>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 푸터 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-center mt-10"
            >
              <p className="text-sm text-gray-400">
                © 2025 <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">라이브러리컴퍼니</span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}