'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePlayApi } from '@/hooks/usePlayApi';
import PlayPerformanceSelector from '@/components/dashboard/play/PlayPerformanceSelector';
import PlayDailySalesTable from '@/components/dashboard/play/PlayDailySalesTable';
import ErrorView from '@/components/ui/ErrorView';
import ApiDataViewer from '@/components/debug/ApiDataViewer';

export default function PlayDailySalesPage() {
  const [selectedPerformance, setSelectedPerformance] = useState('all');

  const {
    getDailyDetailsData,
    isLoading,
    hasErrors,
    retryAll,
    responses
  } = usePlayApi();

  const dailyDetailsData = getDailyDetailsData();

  // 에러 처리
  if (hasErrors && !isLoading && !dailyDetailsData) {
    return (
      <div className="min-h-screen bg-gray-50/30">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              연극 & 뮤지컬 - 일간별 판매현황
            </h1>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8">
            <ErrorView
              title="데이터 로딩 실패"
              message="일간별 판매현황 데이터를 불러올 수 없습니다."
              onRetry={retryAll}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="p-8 max-w-7xl mx-auto space-y-10">
        {/* 페이지 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                연극 & 뮤지컬 - 일간별 판매현황
              </h1>
              <p className="text-gray-600">
                일간별 상세 판매 현황 및 공연별 분석을 확인하세요
              </p>
            </div>
            
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-full">
              최근 업데이트: {new Date().toLocaleDateString('ko-KR')}
            </div>
          </div>
        </motion.div>

        {/* API 응답 데이터 뷰어 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <ApiDataViewer responses={responses} />
        </motion.div>

        {/* 로딩 상태 */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12"
          >
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-gray-600 font-medium text-lg">일간별 판매현황 데이터를 불러오는 중...</p>
              <p className="text-gray-400 text-sm mt-2">잠시만 기다려 주세요</p>
            </div>
          </motion.div>
        )}

        {/* 공연 선택 섹션 */}
        {dailyDetailsData && dailyDetailsData.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-1 h-7 bg-blue-500 rounded-full mr-4"></div>
                <h2 className="text-xl font-bold text-gray-900">공연 선택</h2>
                <span className="ml-3 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                  필터링
                </span>
              </div>
            </div>
            <div className="p-6">
              <PlayPerformanceSelector
                data={dailyDetailsData}
                selectedPerformance={selectedPerformance}
                onPerformanceChange={setSelectedPerformance}
              />
            </div>
          </motion.section>
        )}

        {/* 일간별 판매 현황 섹션 */}
        {dailyDetailsData && dailyDetailsData.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-1 h-7 bg-emerald-500 rounded-full mr-4"></div>
                <h2 className="text-xl font-bold text-gray-900">일간별 판매 현황</h2>
                <span className="ml-3 px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full">
                  상세 분석
                </span>
              </div>
            </div>
            <div className="p-6">
              <PlayDailySalesTable
                data={dailyDetailsData}
                selectedPerformance={selectedPerformance}
              />
            </div>
          </motion.section>
        )}

        {/* 데이터가 없는 경우 */}
        {!isLoading && !hasErrors && (!dailyDetailsData || dailyDetailsData.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12"
          >
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-800">
                  일간별 판매현황 데이터 없음
                </h2>
                <p className="text-gray-600">
                  현재 연극과 뮤지컬의 일간별 판매현황 데이터가 없습니다.
                </p>
                <p className="text-gray-400 text-sm">
                  데이터가 로드되면 여기에 표시됩니다.
                </p>
              </div>
              
              <motion.button
                onClick={retryAll}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm"
              >
                다시 시도
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 