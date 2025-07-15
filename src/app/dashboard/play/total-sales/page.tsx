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

// 더미 데이터 (API 데이터 없을 때 사용)
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
    category: '뮤지컬' as const,
    performanceName: '레미제라블',
    todaySales: 25000000,
    todayTargetSales: 30000000,
    todayAchievementRate: 83.3,
    totalSales: 800000000,
    totalTargetSales: 900000000,
    totalAchievementRate: 88.9,
  },
];

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
    performanceName: '레미제라블',
    paid: 280,
    unpaid: 20,
    target: 300,
    achievementRate: 93.3,
    category: '뮤지컬' as const,
  },
];

export default function PlayTotalSalesPage() {
  // API 훅 사용
  const { responses, isLoading, hasErrors, retryAll, getWeeklyOverviewData, getDailyDetailsData, getOccupancyRateData } = usePlayApi();
  
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
  const weeklyOverviewData = getWeeklyOverviewData();
  const dailyDetailsData = getDailyDetailsData();
  const occupancyRateData = getOccupancyRateData();

  // 데이터 구조 로깅 (디버깅용)
  useEffect(() => {
    if (weeklyOverviewData && dailyDetailsData && occupancyRateData) {
      console.group('📊 API 데이터 구조 분석');
      console.log('Weekly Overview:', weeklyOverviewData);
      console.log('Daily Details (first 3):', dailyDetailsData.slice(0, 3));
      console.log('Occupancy Rate:', occupancyRateData);
      console.groupEnd();
    }
  }, [weeklyOverviewData, dailyDetailsData, occupancyRateData]);

  // 카드 데이터 변환 함수 (콘서트 페이지 패턴 적용)
  const transformSalesData = () => {
    const weeklyData = weeklyOverviewData?.[0];
    const dailyData = dailyDetailsData;
    
    if (!weeklyData || !dailyData) {
      console.log('⚠️ API 데이터 없음, 더미 데이터 사용');
      return {
        integrated: {
          yesterday: { total: 165000000, target: 150000000, changeAmount: 8000000, changeRate: 6.8 },
          accumulated: { total: 4200000000, target: 4000000000 },
          weekly: { total: 750000000, target: 700000000, changeAmount: 35000000, changeRate: 6.4 },
          weeklyAverage: { total: 107142857, target: 100000000, changeAmount: 5000000, changeRate: 6.4 },
        },
        theater: {
          yesterday: { total: 68000000, target: 60000000, changeAmount: 3000000, changeRate: 7.1 },
          accumulated: { total: 1580000000, target: 1500000000 },
          weekly: { total: 295000000, target: 280000000, changeAmount: 15000000, changeRate: 7.7 },
          weeklyAverage: { total: 42142857, target: 40000000, changeAmount: 2142857, changeRate: 7.7 },
        },
        musical: {
          yesterday: { total: 97000000, target: 90000000, changeAmount: 5000000, changeRate: 6.7 },
          accumulated: { total: 2620000000, target: 2500000000 },
          weekly: { total: 455000000, target: 420000000, changeAmount: 20000000, changeRate: 5.7 },
          weeklyAverage: { total: 65000000, target: 60000000, changeAmount: 2857143, changeRate: 5.7 },
        },
      };
    }

    // API 데이터로 변환
    const totalPaidSales = dailyData.reduce((sum, item) => sum + (item.paidSeatSales || 0), 0);
    const totalTargetSales = parseInt(weeklyData.totalTargetSales?.replace(/,/g, '') || '0') || 0;
    const totalActualSales = parseInt(weeklyData.totalActualSales?.replace(/,/g, '') || '0') || 0;
    const weekBeforeLastSales = parseInt(weeklyData.weekBeforeLastTotalActualSales?.replace(/,/g, '') || '0') || 0;
    
    // 변화율 계산
    const calculateChangeRate = (current: number, previous: number) => {
      return previous > 0 ? ((current - previous) / previous) * 100 : 0;
    };
    
    const changeRate = calculateChangeRate(totalActualSales, weekBeforeLastSales);
    const changeAmount = totalActualSales - weekBeforeLastSales;
    
    // 연극/뮤지컬 분할 (현재는 뮤지컬 데이터만 있으므로 비율로 분할)
    const theaterRatio = 0.4;
    const musicalRatio = 0.6;
    
    const integrated = {
      yesterday: {
        total: totalPaidSales * 0.1, // 일일 매출 추정
        target: totalTargetSales * 0.1,
        changeAmount: changeAmount * 0.1,
        changeRate: changeRate,
      },
      accumulated: {
        total: totalPaidSales,
        target: totalTargetSales,
      },
      weekly: {
        total: totalPaidSales * 0.7, // 주간 매출 추정
        target: totalTargetSales * 0.7,
        changeAmount: changeAmount * 0.7,
        changeRate: changeRate,
      },
      weeklyAverage: {
        total: (totalPaidSales * 0.7) / 7,
        target: (totalTargetSales * 0.7) / 7,
        changeAmount: (changeAmount * 0.7) / 7,
        changeRate: changeRate,
      },
    };
    
    const theater = {
      yesterday: {
        total: integrated.yesterday.total * theaterRatio,
        target: integrated.yesterday.target * theaterRatio,
        changeAmount: integrated.yesterday.changeAmount * theaterRatio,
        changeRate: integrated.yesterday.changeRate,
      },
      accumulated: {
        total: integrated.accumulated.total * theaterRatio,
        target: integrated.accumulated.target * theaterRatio,
      },
      weekly: {
        total: integrated.weekly.total * theaterRatio,
        target: integrated.weekly.target * theaterRatio,
        changeAmount: integrated.weekly.changeAmount * theaterRatio,
        changeRate: integrated.weekly.changeRate,
      },
      weeklyAverage: {
        total: integrated.weeklyAverage.total * theaterRatio,
        target: integrated.weeklyAverage.target * theaterRatio,
        changeAmount: integrated.weeklyAverage.changeAmount * theaterRatio,
        changeRate: integrated.weeklyAverage.changeRate,
      },
    };
    
    const musical = {
      yesterday: {
        total: integrated.yesterday.total * musicalRatio,
        target: integrated.yesterday.target * musicalRatio,
        changeAmount: integrated.yesterday.changeAmount * musicalRatio,
        changeRate: integrated.yesterday.changeRate,
      },
      accumulated: {
        total: integrated.accumulated.total * musicalRatio,
        target: integrated.accumulated.target * musicalRatio,
      },
      weekly: {
        total: integrated.weekly.total * musicalRatio,
        target: integrated.weekly.target * musicalRatio,
        changeAmount: integrated.weekly.changeAmount * musicalRatio,
        changeRate: integrated.weekly.changeRate,
      },
      weeklyAverage: {
        total: integrated.weeklyAverage.total * musicalRatio,
        target: integrated.weeklyAverage.target * musicalRatio,
        changeAmount: integrated.weeklyAverage.changeAmount * musicalRatio,
        changeRate: integrated.weeklyAverage.changeRate,
      },
    };
    
    console.log('✅ Play 카드 데이터 변환 완료:', { integrated, theater, musical });
    return { integrated, theater, musical };
  };

  const salesCardsData = transformSalesData();

  // 공연별 매출 상세 데이터 변환 함수
  const transformPerformanceDetails = () => {
    const dailyData = dailyDetailsData;
    const weeklyData = weeklyOverviewData?.[0];
    
    if (!dailyData || !weeklyData) {
      console.log('⚠️ 공연별 상세 데이터 없음, 더미 데이터 사용');
      return DUMMY_PERFORMANCE_DETAILS;
    }

    // 공연별로 그룹화
    const performanceGroups = dailyData.reduce((groups, item) => {
      const key = item.liveId || 'unknown';
      if (!groups[key]) {
        groups[key] = {
          liveId: item.liveId || '',
          liveName: item.liveName || '알 수 없는 공연',
          performances: []
        };
      }
      groups[key].performances.push(item);
      return groups;
    }, {} as Record<string, { liveId: string; liveName: string; performances: any[] }>);

    // 각 공연별 상세 정보 계산
    const result = Object.values(performanceGroups).map(group => {
      const totalSales = group.performances.reduce((sum, perf) => sum + (perf.paidSeatSales || 0), 0);
      const todaySales = group.performances.length > 0 ? (group.performances[0].paidSeatSales || 0) : 0;
      const targetSales = parseInt(weeklyData.totalTargetSales?.replace(/,/g, '') || '0') || 0;
      const todayTargetSales = targetSales / 30; // 월간 목표를 일일로 추정
      
      const category = group.liveName.includes('뮤지컬') ? '뮤지컬' : '연극';
      const performanceName = group.liveName.replace(/^뮤지컬〈|〉$/g, '');
      
      return {
        category: category as '연극' | '뮤지컬',
        performanceName,
        todaySales,
        todayTargetSales,
        todayAchievementRate: todayTargetSales > 0 ? (todaySales / todayTargetSales) * 100 : 0,
        totalSales,
        totalTargetSales: targetSales,
        totalAchievementRate: targetSales > 0 ? (totalSales / targetSales) * 100 : 0,
      };
    });

    console.log('✅ 공연별 매출 상세 데이터 변환 완료:', result);
    return result;
  };

  // 유료 점유율 현황 데이터 변환 함수
  const transformOccupancyStatus = () => {
    const dailyData = dailyDetailsData;
    const occupancyData = occupancyRateData;
    
    if (!dailyData) {
      console.log('⚠️ 점유율 데이터 없음, 더미 데이터 사용');
      return DUMMY_OCCUPANCY_STATUS;
    }

    // 공연별로 그룹화
    const performanceGroups = dailyData.reduce((groups, item) => {
      const key = item.liveId || 'unknown';
      if (!groups[key]) {
        groups[key] = {
          liveId: item.liveId || '',
          liveName: item.liveName || '알 수 없는 공연',
          performances: []
        };
      }
      groups[key].performances.push(item);
      return groups;
    }, {} as Record<string, { liveId: string; liveName: string; performances: any[] }>);

    // 각 공연별 점유율 정보 계산
    const result = Object.values(performanceGroups).map(group => {
      const totalPaidSeats = group.performances.reduce((sum, perf) => sum + (perf.paidSeatTot || 0), 0);
      const totalSeats = group.performances.length > 0 ? (group.performances[0].showTotalSeatNumber || 0) : 0;
      const totalInviteSeats = totalSeats - totalPaidSeats; // 무료 좌석 추정
      const targetSeats = Math.floor(totalSeats * 0.8); // 80% 목표로 추정
      
      const category = group.liveName.includes('뮤지컬') ? '뮤지컬' : '연극';
      const performanceName = group.liveName.replace(/^뮤지컬〈|〉$/g, '');
      
      return {
        performanceName,
        paid: totalPaidSeats,
        unpaid: totalInviteSeats,
        target: targetSeats,
        achievementRate: targetSeats > 0 ? (totalPaidSeats / targetSeats) * 100 : 0,
        category: category as '연극' | '뮤지컬',
      };
    });

    console.log('✅ 유료 점유율 현황 데이터 변환 완료:', result);
    return result;
  };

  const performanceDetailsData = transformPerformanceDetails();
  const occupancyStatusData = transformOccupancyStatus();

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
        transition={{ duration: 0.5, delay: 0.2 }}
        className={isFilterLoading ? 'opacity-50 pointer-events-none' : ''}
      >
        {salesCardsData && !isLoading ? (
          <PlaySalesCards data={salesCardsData} />
        ) : (
          <div className="space-y-8">
            {/* 스켈레톤 UI - 통합 섹션 */}
            <div className="space-y-4">
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
            
            {/* 스켈레톤 UI - 연극 섹션 */}
            <div className="space-y-4">
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
            
            {/* 스켈레톤 UI - 뮤지컬 섹션 */}
            <div className="space-y-4">
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
          </div>
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
            {performanceDetailsData && !isLoading ? (
              <PlayPerformanceDetailsTable data={performanceDetailsData} />
            ) : (
              <div className="animate-pulse">
                {/* 테이블 헤더 스켈레톤 */}
                <div className="mb-4">
                  <div className="flex space-x-4">
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                    <div className="h-6 bg-gray-300 rounded w-32"></div>
                    <div className="h-6 bg-gray-300 rounded w-32"></div>
                    <div className="h-6 bg-gray-300 rounded w-32"></div>
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
                {/* 테이블 행 스켈레톤 */}
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
            {occupancyStatusData && !isLoading ? (
              <PlayOccupancyStatusTable data={occupancyStatusData} />
            ) : (
              <div className="animate-pulse">
                {/* 테이블 헤더 스켈레톤 */}
                <div className="mb-4">
                  <div className="flex space-x-4">
                    <div className="h-6 bg-gray-300 rounded w-24"></div>
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                    <div className="h-6 bg-gray-300 rounded w-24"></div>
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                    <div className="h-6 bg-gray-300 rounded w-24"></div>
                  </div>
                </div>
                {/* 테이블 행 스켈레톤 */}
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
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 