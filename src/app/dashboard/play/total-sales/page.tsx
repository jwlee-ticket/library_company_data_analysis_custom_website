'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PlaySalesCards from '@/components/dashboard/play/PlaySalesCards';
import PlayPerformanceDetailsTable from '@/components/dashboard/play/PlayPerformanceDetailsTable';
import PlayOccupancyStatusTable from '@/components/dashboard/play/PlayOccupancyStatusTable';
import ApiDataViewer from '@/components/debug/ApiDataViewer';
import ErrorView from '@/components/ui/ErrorView';
import UnifiedDateFilter from '@/components/ui/UnifiedDateFilter';

import { usePlayApi } from '@/hooks/usePlayApi';

// 더미 매출 카드 데이터 (목표 달성 수준으로 조정)
const DUMMY_SALES_DATA = {
  integrated: {
    yesterday: {
      total: 165000000,
      target: 150000000,
      changeAmount: 8000000,
      changeRate: 6.8,
    },
    accumulated: {
      total: 4200000000,
      target: 4000000000,
    },
    weekly: {
      total: 750000000,
      target: 700000000,
      changeAmount: 35000000,
      changeRate: 6.4,
    },
    weeklyAverage: {
      total: 107142857,
      target: 100000000,
      changeAmount: 5000000,
      changeRate: 6.4,
    },
  },
  theater: {
    yesterday: {
      total: 68000000,
      target: 60000000,
      changeAmount: 3000000,
      changeRate: 7.1,
    },
    accumulated: {
      total: 1580000000,
      target: 1500000000,
    },
    weekly: {
      total: 295000000,
      target: 280000000,
      changeAmount: 15000000,
      changeRate: 7.7,
    },
    weeklyAverage: {
      total: 42142857,
      target: 40000000,
      changeAmount: 2142857,
      changeRate: 7.7,
    },
  },
  musical: {
    yesterday: {
      total: 97000000,
      target: 90000000,
      changeAmount: 5000000,
      changeRate: 6.7,
    },
    accumulated: {
      total: 2620000000,
      target: 2500000000,
    },
    weekly: {
      total: 455000000,
      target: 420000000,
      changeAmount: 20000000,
      changeRate: 5.7,
    },
    weeklyAverage: {
      total: 65000000,
      target: 60000000,
      changeAmount: 2857143,
      changeRate: 5.7,
    },
  },
};

// 더미 공연별 매출 상세 데이터
const DUMMY_PERFORMANCE_DETAILS = [
  {
    category: '연극' as const,
    performanceName: '햄릿',
    todaySales: 15000000,
    todayTargetSales: 18000000,
    todayAchievementRate: 83.3,
    totalSales: 450000000,
    totalTargetSales: 500000000,
    totalAchievementRate: 90.0,
  },
  {
    category: '연극' as const,
    performanceName: '로미오와 줄리엣',
    todaySales: 12000000,
    todayTargetSales: 15000000,
    todayAchievementRate: 80.0,
    totalSales: 380000000,
    totalTargetSales: 400000000,
    totalAchievementRate: 95.0,
  },
  {
    category: '연극' as const,
    performanceName: '맥베스',
    todaySales: 18000000,
    todayTargetSales: 27000000,
    todayAchievementRate: 66.7,
    totalSales: 370000000,
    totalTargetSales: 600000000,
    totalAchievementRate: 61.7,
  },
  {
    category: '뮤지컬' as const,
    performanceName: '레미제라블',
    todaySales: 25000000,
    todayTargetSales: 30000000,
    todayAchievementRate: 83.3,
    totalSales: 800000000,
    totalTargetSales: 900000000,
    totalAchievementRate: 88.9,
  },
  {
    category: '뮤지컬' as const,
    performanceName: '오페라의 유령',
    todaySales: 30000000,
    todayTargetSales: 35000000,
    todayAchievementRate: 85.7,
    totalSales: 750000000,
    totalTargetSales: 850000000,
    totalAchievementRate: 88.2,
  },
  {
    category: '뮤지컬' as const,
    performanceName: '캣츠',
    todaySales: 25000000,
    todayTargetSales: 25000000,
    todayAchievementRate: 100.0,
    totalSales: 450000000,
    totalTargetSales: 750000000,
    totalAchievementRate: 60.0,
  },
];

// 더미 유료 점유율 데이터
const DUMMY_OCCUPANCY_STATUS = [
  {
    performanceName: '햄릿',
    paid: 180,
    unpaid: 45,
    target: 200,
    achievementRate: 90.0,
    category: '연극' as const,
  },
  {
    performanceName: '로미오와 줄리엣',
    paid: 160,
    unpaid: 40,
    target: 180,
    achievementRate: 88.9,
    category: '연극' as const,
  },
  {
    performanceName: '맥베스',
    paid: 140,
    unpaid: 60,
    target: 220,
    achievementRate: 63.6,
    category: '연극' as const,
  },
  {
    performanceName: '레미제라블',
    paid: 280,
    unpaid: 20,
    target: 300,
    achievementRate: 93.3,
    category: '뮤지컬' as const,
  },
  {
    performanceName: '오페라의 유령',
    paid: 250,
    unpaid: 30,
    target: 280,
    achievementRate: 89.3,
    category: '뮤지컬' as const,
  },
  {
    performanceName: '캣츠',
    paid: 190,
    unpaid: 35,
    target: 250,
    achievementRate: 76.0,
    category: '뮤지컬' as const,
  },
];

export default function PlayTotalSalesPage() {
  // API 훅 사용
  const { responses, isLoading, hasErrors, retryAll } = usePlayApi();
  
  // 통합 날짜 범위 상태
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  // 필터 적용 로딩 상태
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  
  // 섹션 최소화 상태
  const [isPerformanceDetailsMinimized, setIsPerformanceDetailsMinimized] = useState(false);
  const [isOccupancyStatusMinimized, setIsOccupancyStatusMinimized] = useState(false);
  
  // 클라이언트 측 시간 표시를 위한 상태
  const [currentTime, setCurrentTime] = useState<string>('');
  
  // 클라이언트에서만 시간 설정 (Hydration 오류 방지)
  useEffect(() => {
    setCurrentTime(new Date().toLocaleString('ko-KR'));
  }, []);
  
  // 모든 환경에서 데이터 뷰어 표시
  const showDataViewer = true;

  // 전체 페이지 에러 상태 체크 (모든 API가 실패한 경우)
  const allApisFailure = Object.keys(responses).length > 0 && 
    Object.values(responses).every(r => r.status === 'error');

  // 통합 날짜 범위 핸들러
  const handleDateRangeChange = async (startDate: string, endDate: string) => {
    setIsFilterLoading(true);
    
    // 시각적 피드백을 위한 짧은 지연
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setDateRange({ startDate, endDate });
    setIsFilterLoading(false);
    
    console.log('📅 통합 필터 적용:', { startDate, endDate });
  };

  const handleDateRangeReset = () => {
    setDateRange({ startDate: '', endDate: '' });
    console.log('🔄 필터 초기화');
  };

  // 섹션 토글 핸들러들
  const togglePerformanceDetails = () => {
    setIsPerformanceDetailsMinimized(!isPerformanceDetailsMinimized);
  };

  const toggleOccupancyStatus = () => {
    setIsOccupancyStatusMinimized(!isOccupancyStatusMinimized);
  };

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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              연극 & 뮤지컬 총 매출 현황
            </h1>
            <p className="text-gray-500">
              최근 업데이트: {currentTime || '로딩 중...'}
              {(isLoading || isFilterLoading) && (
                <span className="ml-2 inline-flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1"></span>
                  데이터 로딩 중...
                </span>
              )}
            </p>
          </div>
          
          {/* 통합 날짜 필터 */}
          <div className="flex items-center space-x-4">
            <UnifiedDateFilter
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onDateRangeChange={handleDateRangeChange}
              onReset={handleDateRangeReset}
              isLoading={isFilterLoading}
            />
            
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
        </div>
      </motion.div>

      {/* 매출 카드 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={isFilterLoading ? 'opacity-50 pointer-events-none' : ''}
      >
        <PlaySalesCards data={DUMMY_SALES_DATA} />
      </motion.div>

      {/* 공연별 매출 상세 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className={`bg-white rounded-xl shadow-lg overflow-hidden ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* 헤더 - 항상 표시 */}
        <div 
          onClick={togglePerformanceDetails}
          className="flex items-center justify-between p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
        >
          <div className="flex items-center">
            <span className="inline-block w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
            <h2 className="text-xl font-bold text-gray-900">
              공연별 매출 상세
            </h2>
          </div>
          
          <div className="flex items-center">
            <motion.div
              animate={{ rotate: isPerformanceDetailsMinimized ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </div>

        {/* 테이블 내용 - 확장 시에만 표시 */}
        <motion.div
          initial={false}
          animate={{ 
            height: isPerformanceDetailsMinimized ? 0 : 'auto',
            opacity: isPerformanceDetailsMinimized ? 0 : 1 
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="p-6">
            <PlayPerformanceDetailsTable data={DUMMY_PERFORMANCE_DETAILS} />
          </div>
        </motion.div>
      </motion.div>

      {/* 유료 점유율 현황 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`bg-white rounded-xl shadow-lg overflow-hidden ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* 헤더 - 항상 표시 */}
        <div 
          onClick={toggleOccupancyStatus}
          className="flex items-center justify-between p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
        >
          <div className="flex items-center">
            <span className="inline-block w-1 h-6 bg-pink-500 rounded-full mr-3"></span>
            <h2 className="text-xl font-bold text-gray-900">
              유료 점유율 현황 (공연 중)
            </h2>
          </div>
          
          <div className="flex items-center">
            <motion.div
              animate={{ rotate: isOccupancyStatusMinimized ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </div>

        {/* 테이블 내용 - 확장 시에만 표시 */}
        <motion.div
          initial={false}
          animate={{ 
            height: isOccupancyStatusMinimized ? 0 : 'auto',
            opacity: isOccupancyStatusMinimized ? 0 : 1 
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="p-6">
            <PlayOccupancyStatusTable data={DUMMY_OCCUPANCY_STATUS} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 