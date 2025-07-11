'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PlayWeeklyOverviewTable from '@/components/dashboard/play/PlayWeeklyOverviewTable';
import PlayDailyDetailsTable from '@/components/dashboard/play/PlayDailyDetailsTable';
import PlayOccupancyChart from '@/components/dashboard/play/PlayOccupancyChart';
import ApiDataViewer from '@/components/debug/ApiDataViewer';
import ErrorView from '@/components/ui/ErrorView';
import { usePlayApi } from '@/hooks/usePlayApi';

export default function PlayTotalSalesPage() {
  const { 
    responses, 
    isLoading, 
    hasErrors, 
    retryAll,
    getWeeklyOverviewData,
    getDailyDetailsData,
    getOccupancyRateData
  } = usePlayApi();
  const [currentTime, setCurrentTime] = useState<string>('');

  // 클라이언트에서만 시간 설정 (Hydration 오류 방지)
  useEffect(() => {
    setCurrentTime(new Date().toLocaleString('ko-KR'));
  }, []);

  // 모든 환경에서 데이터 뷰어 표시
  const showDataViewer = true;

  // 전체 페이지 에러 상태 체크
  const allApisFailure = Object.keys(responses).length > 0 && 
    Object.values(responses).every(r => r.status === 'error');

  // API 데이터 가져오기
  const weeklyOverviewData = getWeeklyOverviewData();
  const dailyDetailsData = getDailyDetailsData();
  const occupancyRateData = getOccupancyRateData();

  // 전체 페이지 에러 화면
  if (allApisFailure) {
    return (
      <div className="p-6">
        {showDataViewer && <ApiDataViewer responses={responses} />}
        
        <div className="max-w-2xl mx-auto mt-20">
          <ErrorView
            title="연극 & 뮤지컬 데이터를 불러올 수 없습니다"
            message="API 서버 연결에 실패했습니다. 네트워크 상태와 서버 상태를 확인해주세요."
            onRetry={retryAll}
            showRetry={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* 데이터 뷰어 (모든 환경) */}
      {showDataViewer && <ApiDataViewer responses={responses} />}
      
      {/* 페이지 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              연극 & 뮤지컬 통합 티켓 판매합계
            </h1>
            <p className="text-gray-500">
              최근 업데이트: {currentTime || '로딩 중...'}
              {isLoading && (
                <span className="ml-2 inline-flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1"></span>
                  데이터 로딩 중...
                </span>
              )}
            </p>
          </div>
          
          {/* API 상태 표시 */}
          {hasErrors && (
            <button
              onClick={retryAll}
              className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200"
            >
              일부 데이터 로드 실패 - 재시도
            </button>
          )}
        </div>
      </motion.div>

      {/* 주간 현황 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">주간 현황</h2>
          <p className="text-sm text-gray-500">목표 대비 실적</p>
        </div>
        
        {weeklyOverviewData ? (
          <PlayWeeklyOverviewTable data={weeklyOverviewData} />
        ) : (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 공연별 상세 정보 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">공연별 상세 정보</h2>
          <p className="text-sm text-gray-500">일일 매출 현황</p>
        </div>
        
        {dailyDetailsData ? (
          <PlayDailyDetailsTable data={dailyDetailsData} />
        ) : (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 유료 점유율 현황 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">유료 점유율 현황</h2>
          <p className="text-sm text-gray-500">주간별 점유율</p>
        </div>
        
        {occupancyRateData ? (
          <PlayOccupancyChart data={occupancyRateData} />
        ) : (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 