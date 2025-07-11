'use client';

import { motion } from 'framer-motion';

export default function PlayPeriodRevenuePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-8"
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          연극 & 뮤지컬 - 기간별 통합 매출
        </h1>
        <div className="text-sm text-gray-500">
          최근 업데이트: {new Date().toLocaleDateString('ko-KR')}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
      >
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            연극과 뮤지컬 통합 기간별 매출 현황
          </h2>
          <p className="text-gray-600">
            연극과 뮤지컬의 기간별 매출 데이터를 통합하여 표시합니다.
          </p>
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-700">
              📊 통합된 데이터로 더 정확한 분석이 가능합니다.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 