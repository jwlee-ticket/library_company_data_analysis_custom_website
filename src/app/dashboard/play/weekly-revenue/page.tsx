'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePlayApi } from '@/hooks/usePlayApi';
import PlayPerformanceSelector from '@/components/dashboard/play/PlayPerformanceSelector';
import PlayWeeklyOccupancyChart from '@/components/dashboard/play/PlayWeeklyOccupancyChart';
import PlayWeeklyTicketChart from '@/components/dashboard/play/PlayWeeklyTicketChart';
import PlayWeeklyRevenueChart from '@/components/dashboard/play/PlayWeeklyRevenueChart';
import ErrorView from '@/components/ui/ErrorView';
import ApiDataViewer from '@/components/debug/ApiDataViewer';

export default function PlayWeeklyRevenuePage() {
  const [selectedPerformance, setSelectedPerformance] = useState('all');

  const {
    getDailyDetailsData,
    getOccupancyRateData,
    isLoading,
    hasErrors,
    retryAll,
    responses
  } = usePlayApi();

  const dailyDetailsData = getDailyDetailsData();
  const occupancyRateData = getOccupancyRateData();

  // 에러 처리
  if (hasErrors && !isLoading && !dailyDetailsData && !occupancyRateData) {
    return (
      <div className="p-6">
        <ErrorView
          title="데이터 로딩 실패"
          message="주간별 매출 데이터를 불러올 수 없습니다."
          onRetry={retryAll}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
        >
          연극 & 뮤지컬 - 주간별 통합 매출
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm text-gray-500"
        >
          최근 업데이트: {new Date().toLocaleDateString('ko-KR')}
        </motion.div>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">주간별 매출 데이터를 불러오는 중...</p>
          </div>
        </motion.div>
      )}

      {/* 공연 선택 필터 */}
      {dailyDetailsData && dailyDetailsData.length > 0 && (
        <PlayPerformanceSelector
          data={dailyDetailsData}
          selectedPerformance={selectedPerformance}
          onPerformanceChange={setSelectedPerformance}
        />
      )}

      {/* 유료 점유율 막대 그래프 */}
      {occupancyRateData && occupancyRateData.length > 0 && (
        <PlayWeeklyOccupancyChart
          data={occupancyRateData}
          selectedPerformance={selectedPerformance}
        />
      )}

      {/* 총 판매 매수(막대)와 최대 판매 가능 매수(라인) 그래프 */}
      {dailyDetailsData && dailyDetailsData.length > 0 && (
        <PlayWeeklyTicketChart
          data={dailyDetailsData}
          selectedPerformance={selectedPerformance}
        />
      )}

      {/* 총 판매 금액 막대 그래프 */}
      {dailyDetailsData && dailyDetailsData.length > 0 && (
        <PlayWeeklyRevenueChart
          data={dailyDetailsData}
          selectedPerformance={selectedPerformance}
        />
      )}

      {/* 데이터가 없는 경우 */}
      {!isLoading && !hasErrors && (!dailyDetailsData || dailyDetailsData.length === 0) && (!occupancyRateData || occupancyRateData.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
        >
          <div className="text-center">
            <div className="text-6xl mb-4">📈</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              주간별 매출 데이터 없음
            </h2>
            <p className="text-gray-600 mb-6">
              현재 연극과 뮤지컬의 주간별 매출 데이터가 없습니다.
            </p>
            <button
              onClick={retryAll}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              다시 시도
            </button>
          </div>
        </motion.div>
      )}

      {/* 개발 환경에서만 API 데이터 뷰어 표시 */}
      {process.env.NODE_ENV === 'development' && (
        <ApiDataViewer responses={responses} />
      )}
    </div>
  );
} 