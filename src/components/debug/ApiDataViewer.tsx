'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ApiResponse {
  endpoint: string;
  status: 'loading' | 'success' | 'error';
  data?: any;
  error?: string;
  timestamp?: string;
  duration?: number;
  url?: string;
}

interface ApiDataViewerProps {
  responses: Record<string, ApiResponse>;
  isVisible?: boolean;
}

export default function ApiDataViewer({ responses, isVisible = true }: ApiDataViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fullscreenData, setFullscreenData] = useState<{ key: string; response: ApiResponse } | null>(null);

  if (!isVisible) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'loading': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('ko-KR');
  };

  // ESC 키로 전체화면 모달 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && fullscreenData) {
        setFullscreenData(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenData]);

  return (
    <>
      {/* 토글 버튼 - 헤더 밑 우상단 고정 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed top-20 right-6 z-50 w-12 h-12 rounded-full shadow-lg
          transition-all duration-200 ease-in-out flex items-center justify-center
          ${isOpen 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
        `}
        title={isOpen ? '데이터 뷰어 닫기' : '데이터 뷰어 열기'}
      >
        {isOpen ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )}
      </button>

      {/* 사이드패널 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 백드롭 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* 패널 */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="fixed top-0 right-0 w-96 h-full bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              {/* 헤더 */}
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">API 응답 데이터</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {Object.keys(responses).length}개 API 엔드포인트
                </p>
              </div>

              {/* 컨텐츠 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {Object.entries(responses).map(([key, response]) => (
                  <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* API 정보 헤더 */}
                    <div className={`p-3 ${getStatusColor(response.status)}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {response.endpoint || key}
                        </span>
                        <span className="text-xs">
                          {response.status}
                        </span>
                      </div>
                      {response.url && (
                        <div className="mt-1 text-xs opacity-75">
                          <span className="font-mono bg-black/10 px-1 rounded">
                            {response.url}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-1 text-xs">
                        <span>{formatTimestamp(response.timestamp)}</span>
                        {response.duration && (
                          <span>{response.duration}ms</span>
                        )}
                      </div>
                    </div>

                    {/* 응답 데이터 */}
                    <div className="p-3 bg-gray-50">
                      {response.status === 'loading' && (
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-600">로딩 중...</span>
                        </div>
                      )}

                      {response.status === 'error' && (
                        <div className="text-sm text-red-700">
                          <strong>에러:</strong> {response.error}
                        </div>
                      )}

                      {response.status === 'success' && response.data && (
                        <div>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <span>응답 데이터 {Array.isArray(response.data) ? `(${response.data.length}개 항목)` : ''}</span>
                            <button
                              onClick={() => setFullscreenData({ key, response })}
                              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                            >
                              전체화면
                            </button>
                          </div>
                          <pre className="text-xs bg-white p-2 rounded border max-h-40 overflow-y-auto">
                            {JSON.stringify(response.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {Object.keys(responses).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>API 응답 데이터가 없습니다.</p>
                    <p className="text-sm mt-1">페이지를 새로고침하여 데이터를 로드해보세요.</p>
                  </div>
                )}
              </div>

              {/* 푸터 */}
              <div className="p-4 bg-gray-50 border-t">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                >
                  페이지 새로고침
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 전체화면 데이터 모달 */}
      <AnimatePresence>
        {fullscreenData && (
          <>
            {/* 전체화면 백드롭 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-[60]"
              onClick={() => setFullscreenData(null)}
            />

            {/* 전체화면 모달 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="fixed inset-4 bg-white rounded-lg shadow-2xl z-[61] overflow-hidden flex flex-col"
            >
              {/* 모달 헤더 */}
              <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {fullscreenData.response.endpoint}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>{fullscreenData.response.url}</span>
                    <span>{formatTimestamp(fullscreenData.response.timestamp)}</span>
                    {fullscreenData.response.duration && (
                      <span>{fullscreenData.response.duration}ms</span>
                    )}
                    <span>
                      {Array.isArray(fullscreenData.response.data) 
                        ? `${fullscreenData.response.data.length}개 항목` 
                        : typeof fullscreenData.response.data === 'object' 
                          ? `${Object.keys(fullscreenData.response.data || {}).length}개 속성` 
                          : '단일 값'
                      }
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(fullscreenData.response.data, null, 2));
                      // 간단한 피드백 (실제로는 toast 라이브러리 사용 권장)
                      const button = document.activeElement as HTMLButtonElement;
                      const originalText = button.textContent;
                      button.textContent = '복사됨!';
                      setTimeout(() => {
                        button.textContent = originalText;
                      }, 1000);
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    JSON 복사
                  </button>
                  <button
                    onClick={() => setFullscreenData(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* 모달 콘텐츠 */}
              <div className="flex-1 overflow-hidden">
                <pre className="h-full w-full p-4 text-sm bg-gray-900 text-green-400 overflow-auto font-mono">
                  {JSON.stringify(fullscreenData.response.data, null, 2)}
                </pre>
              </div>

              {/* 모달 푸터 */}
              <div className="p-4 bg-gray-50 border-t">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div>
                    <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">ESC</kbd> 키를 눌러 닫기
                  </div>
                  <div>
                    마지막 업데이트: {formatTimestamp(fullscreenData.response.timestamp)}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
} 