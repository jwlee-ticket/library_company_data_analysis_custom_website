'use client';

import { motion } from 'framer-motion';

interface ErrorViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export default function ErrorView({ 
  title = "데이터를 불러올 수 없습니다",
  message = "서버 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
  onRetry,
  showRetry = true
}: ErrorViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg p-8 border border-red-100"
    >
      <div className="text-center space-y-4">
        {/* 에러 표시 */}
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-2xl text-red-600">×</span>
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">{message}</p>
        </div>

        {/* 재시도 버튼 */}
        {showRetry && onRetry && (
          <div className="pt-4">
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 기술적 안내 */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="text-sm text-gray-500 space-y-1">
            <p>문제가 지속되는 경우:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>네트워크 연결을 확인해주세요</li>
              <li>잠시 후 페이지를 새로고침해주세요</li>
              <li>브라우저 캐시를 삭제해주세요</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 