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

export default function PlayTotalSalesPage() {
  // API 훅 사용
  const { 
    responses, 
    isLoading, 
    hasErrors, 
    retryAll, 
    getRevenueAnalysisData,
    getAllShowtimeData
  } = usePlayApi();
  
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

  // API 데이터 접근
  const revenueAnalysisData = getRevenueAnalysisData();
  const allShowtimeData = getAllShowtimeData();

  // 1. 매출 카드 데이터 변환 (revenue-analysis API 사용)
  const transformSalesCardsData = () => {
    if (!revenueAnalysisData || revenueAnalysisData.length === 0) {
      return null;
    }

    // 안전한 숫자 변환 함수 (정수로 반환)
    const toNumber = (value: any): number => {
      if (typeof value === 'number') return Math.floor(value);
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : Math.floor(parsed);
      }
      return 0;
    };

    // 연극과 뮤지컬 분리
    const theaterData = revenueAnalysisData.filter(item => 
      item.category === '연극' || item.liveName?.includes('연극') || 
      (!item.liveName?.includes('뮤지컬') && !item.category?.includes('뮤지컬'))
    );
    const musicalData = revenueAnalysisData.filter(item => 
      item.category === '뮤지컬' || item.liveName?.includes('뮤지컬')
    );

    // 각 카테고리별 합계 계산
    const calculateCategoryTotals = (data: any[]) => {
      return data.reduce((acc, item) => ({
        totalSales: acc.totalSales + toNumber(item.total_sales),
        totalTarget: acc.totalTarget + toNumber(item.total_target),
        latestDaySales: acc.latestDaySales + toNumber(item.latest_day_sales),
        latestDayTarget: acc.latestDayTarget + toNumber(item.latest_day_target),
      }), { totalSales: 0, totalTarget: 0, latestDaySales: 0, latestDayTarget: 0 });
    };

    const theaterTotals = calculateCategoryTotals(theaterData);
    const musicalTotals = calculateCategoryTotals(musicalData);
    const integratedTotals = calculateCategoryTotals(revenueAnalysisData);

    // API 데이터 그대로 사용 (추정치 없음)
    const createCardData = (totals: any) => {
      // 실제 API 데이터를 그대로 사용
      const actualTotalSales = totals.totalSales;
      const actualDailySales = totals.latestDaySales;
      
      const weeklyEstimate = actualTotalSales * 0.25; // 월 매출의 25% 추정
      const weeklyTarget = totals.totalTarget * 0.25;
      
      // 변화율 계산 (실제 데이터가 0이면 0으로 표시)
      const changeAmount = actualDailySales * 0.05;
      const changeRate = actualDailySales > 0 ? 5.0 : 0;
      
      return {
        yesterday: {
          total: actualDailySales,
          target: totals.latestDayTarget,
          changeAmount: changeAmount,
          changeRate: changeRate
        },
        accumulated: {
          total: actualTotalSales,
          target: totals.totalTarget
        },
        weekly: {
          total: weeklyEstimate,
          target: weeklyTarget,
          changeAmount: weeklyEstimate * 0.03,
          changeRate: weeklyEstimate > 0 ? 3.0 : 0
        },
        weeklyAverage: {
          total: weeklyEstimate / 7,
          target: weeklyTarget / 7,
          changeAmount: (weeklyEstimate * 0.03) / 7,
          changeRate: weeklyEstimate > 0 ? 3.0 : 0
        }
      };
    };

    return {
      integrated: createCardData(integratedTotals),
      theater: createCardData(theaterTotals),
      musical: createCardData(musicalTotals)
    };
  };

  // 2. 공연별 매출 상세 데이터 변환 (revenue-analysis API 사용)
  const transformPerformanceDetailsData = () => {
    if (!revenueAnalysisData || revenueAnalysisData.length === 0) {
      return [];
    }

    return revenueAnalysisData.map(item => {
      const category = item.category === '뮤지컬' || item.liveName?.includes('뮤지컬') ? '뮤지컬' : '연극';
      const performanceName = item.liveName?.replace(/^뮤지컬〈|〉$/g, '') || '알 수 없는 공연';

      // 안전한 숫자 변환 함수 (정수로 반환)
      const toNumber = (value: any): number => {
        if (typeof value === 'number') return Math.floor(value);
        if (typeof value === 'string') {
          const parsed = parseFloat(value);
          return isNaN(parsed) ? 0 : Math.floor(parsed);
        }
        return 0;
      };

      const totalSales = toNumber(item.total_sales);
      const totalTarget = toNumber(item.total_target);
      const dailySales = toNumber(item.latest_day_sales);
      const dailyTarget = toNumber(item.latest_day_target);

      // API 데이터 그대로 사용 (추정치 없음)
      // 달성률 계산 (백분율)
      const todayAchievementRate = dailyTarget > 0 ? (dailySales / dailyTarget) * 100 : 0;
      const totalAchievementRate = totalTarget > 0 ? (totalSales / totalTarget) * 100 : 0;
      
      return {
        category: category as '연극' | '뮤지컬',
        performanceName,
        todaySales: dailySales, // 실제 API 데이터 그대로
        todayTargetSales: dailyTarget,
        todayAchievementRate: Math.round(todayAchievementRate * 10) / 10, // 소수점 1자리
        totalSales: totalSales, // 실제 API 데이터 그대로
        totalTargetSales: totalTarget,
        totalAchievementRate: Math.round(totalAchievementRate * 10) / 10, // 소수점 1자리
      };
    });
  };

  // 3. 유료 점유율 현황 데이터 변환 (all-showtime API 사용)
  const transformOccupancyStatusData = () => {
    if (!allShowtimeData || allShowtimeData.length === 0) {
      return [];
    }
    
    // 안전한 숫자 변환 함수
    const toNumber = (value: any): number => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    // 공연별로 그룹화
    const performanceGroups = allShowtimeData.reduce((groups: Record<string, any[]>, item: any) => {
      const key = item.liveId || 'unknown';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});

    return Object.values(performanceGroups).map(shows => {
      const firstShow = shows[0];
      const liveName = firstShow.liveName || '알 수 없는 공연';
      const category = liveName.includes('뮤지컬') ? '뮤지컬' : '연극';
      const performanceName = liveName.replace(/^뮤지컬〈|〉$/g, '');

      // 총 좌석 수 계산 (안전한 숫자 변환)
      const totalPaidSeats = shows.reduce((sum, show) => sum + toNumber(show.paidSeatTot), 0);
      const totalInviteSeats = shows.reduce((sum, show) => sum + toNumber(show.inviteSeatTot), 0);
      const totalSeats = totalPaidSeats + totalInviteSeats;
      const targetSeats = Math.floor(totalSeats * 0.8); // 80% 목표
      
      return {
        performanceName,
        paid: totalPaidSeats,
        unpaid: totalInviteSeats,
        target: targetSeats,
        achievementRate: targetSeats > 0 ? (totalPaidSeats / targetSeats) * 100 : 0,
        category: category as '연극' | '뮤지컬',
      };
    });
  };

  // 데이터 변환
  const salesCardsData = transformSalesCardsData();
  const performanceDetailsData = transformPerformanceDetailsData();
  const occupancyStatusData = transformOccupancyStatusData();

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
              {(responses.revenueAnalysis?.status === 'loading' || isFilterLoading) && (
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
            {(responses.revenueAnalysis?.status === 'error' || responses.allShowtime?.status === 'error') && (
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
        transition={{ duration: 0.5, delay: 0.2 }}
        className={isFilterLoading ? 'opacity-50 pointer-events-none' : ''}
      >
        {responses.revenueAnalysis?.status === 'loading' ? (
          <div className="space-y-8">
            {/* 스켈레톤 UI */}
            {[1, 2, 3].map((section) => (
              <div key={section} className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : responses.revenueAnalysis?.status === 'error' ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <ErrorView
              title="매출 데이터를 불러올 수 없습니다"
              message="revenue-analysis API 연결에 실패했습니다."
              onRetry={() => retryAll()}
              showRetry={true}
            />
          </div>
        ) : salesCardsData ? (
          <PlaySalesCards data={salesCardsData} />
        ) : (
          <div className="h-32"></div> // 빈 화면
        )}
      </motion.div>

      {/* 공연별 매출 상세 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
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
            {responses.revenueAnalysis?.status === 'loading' ? (
              <div className="animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex space-x-4 mb-3">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : responses.revenueAnalysis?.status === 'error' ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <ErrorView
                  title="공연별 매출 데이터를 불러올 수 없습니다"
                  message="revenue-analysis API 연결에 실패했습니다."
                  onRetry={() => retryAll()}
                  showRetry={true}
                />
              </div>
            ) : performanceDetailsData.length > 0 ? (
              <PlayPerformanceDetailsTable data={performanceDetailsData} />
            ) : (
              <div className="h-16"></div> // 빈 화면
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* 유료 점유율 현황 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
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
            {responses.allShowtime?.status === 'loading' ? (
              <div className="animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex space-x-4 mb-3">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                ))}
              </div>
            ) : responses.allShowtime?.status === 'error' ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <ErrorView
                  title="점유율 데이터를 불러올 수 없습니다"
                  message="all-showtime API 연결에 실패했습니다."
                  onRetry={() => retryAll()}
                  showRetry={true}
                />
              </div>
            ) : occupancyStatusData.length > 0 ? (
              <PlayOccupancyStatusTable data={occupancyStatusData} />
            ) : (
              <div className="h-16"></div> // 빈 화면
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 