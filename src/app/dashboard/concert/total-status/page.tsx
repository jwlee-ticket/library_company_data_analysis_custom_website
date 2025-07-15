'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ConcertSalesCards from '@/components/dashboard/concert/ConcertSalesCards';
import ConcertMonthlyChart from '@/components/dashboard/concert/ConcertMonthlyChart';
import ConcertMonthlyTable from '@/components/dashboard/concert/ConcertMonthlyTable';
import ConcertWeeklyChart from '@/components/dashboard/concert/ConcertWeeklyChart';
import ConcertWeeklyTable from '@/components/dashboard/concert/ConcertWeeklyTable';
import ConcertTargetSalesTable from '@/components/dashboard/concert/ConcertTargetSalesTable';
import ApiDataViewer from '@/components/debug/ApiDataViewer';
import ErrorView from '@/components/ui/ErrorView';
import UnifiedDateFilter from '@/components/ui/UnifiedDateFilter';

import { useConcertApi } from '@/hooks/useConcertApi';
import { ConcertMonthlyData, ConcertDailyData, ConcertTargetSales } from '@/lib/api';

// 더미 데이터
const DUMMY_CONCERTS = [
  { id: 1, title: '2024 아이유 콘서트' },
  { id: 2, title: '르세라핌 월드투어' },
  { id: 3, title: '뉴진스 쇼케이스' },
];

const DUMMY_MONTHLY_DATA = {
  dates: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'],
  data: [
    {
      date: '2024-01',
      total: 850000000,
      concerts: [
        { id: 1, title: '2024 아이유 콘서트', revenue: 400000000 },
        { id: 2, title: '르세라핌 월드투어', revenue: 300000000 },
        { id: 3, title: '뉴진스 쇼케이스', revenue: 150000000 },
      ],
    },
    {
      date: '2024-02',
      total: 920000000,
      concerts: [
        { id: 1, title: '2024 아이유 콘서트', revenue: 420000000 },
        { id: 2, title: '르세라핌 월드투어', revenue: 320000000 },
        { id: 3, title: '뉴진스 쇼케이스', revenue: 180000000 },
      ],
    },
    // ... 나머지 월 데이터
  ],
};

const DUMMY_WEEKLY_DATA = {
  weeks: [
    { id: 1, label: '2024. 2. 5' },
    { id: 2, label: '2024. 1. 29' },
    { id: 3, label: '2024. 1. 22' },
    { id: 4, label: '2024. 1. 15' },
    { id: 5, label: '2024. 1. 8' },
    { id: 6, label: '2024. 1. 1' },
  ],
  data: [
    {
      weekId: 1,
      total: 200000000,
      concerts: [
        { id: 1, title: '2024 아이유 콘서트', revenue: 95000000 },
        { id: 2, title: '르세라핌 월드투어', revenue: 70000000 },
        { id: 3, title: '뉴진스 쇼케이스', revenue: 35000000 },
      ],
    },
    {
      weekId: 2,
      total: 220000000,
      concerts: [
        { id: 1, title: '2024 아이유 콘서트', revenue: 110000000 },
        { id: 2, title: '르세라핌 월드투어', revenue: 75000000 },
        { id: 3, title: '뉴진스 쇼케이스', revenue: 35000000 },
      ],
    },
    {
      weekId: 3,
      total: 190000000,
      concerts: [
        { id: 1, title: '2024 아이유 콘서트', revenue: 90000000 },
        { id: 2, title: '르세라핌 월드투어', revenue: 65000000 },
        { id: 3, title: '뉴진스 쇼케이스', revenue: 35000000 },
      ],
    },
    {
      weekId: 4,
      total: 250000000,
      concerts: [
        { id: 1, title: '2024 아이유 콘서트', revenue: 120000000 },
        { id: 2, title: '르세라핌 월드투어', revenue: 80000000 },
        { id: 3, title: '뉴진스 쇼케이스', revenue: 50000000 },
      ],
    },
    {
      weekId: 5,
      total: 180000000,
      concerts: [
        { id: 1, title: '2024 아이유 콘서트', revenue: 85000000 },
        { id: 2, title: '르세라핌 월드투어', revenue: 60000000 },
        { id: 3, title: '뉴진스 쇼케이스', revenue: 35000000 },
      ],
    },
    {
      weekId: 6,
      total: 210000000,
      concerts: [
        { id: 1, title: '2024 아이유 콘서트', revenue: 100000000 },
        { id: 2, title: '르세라핌 월드투어', revenue: 70000000 },
        { id: 3, title: '뉴진스 쇼케이스', revenue: 40000000 },
      ],
    },
  ],
};

const DUMMY_SALES_DATA = {
  yesterday: {
    total: 85000000,
    target: 100000000,
    changeAmount: 5000000,
    changeRate: 6.3,
  },
  accumulated: {
    total: 2500000000,
    target: 3000000000,
  },
  weekly: {
    total: 420000000,
    target: 500000000,
    changeAmount: 20000000,
    changeRate: 5.0,
  },
  weeklyAverage: {
    total: 60000000,
    target: 71428571,
    changeAmount: 3000000,
    changeRate: 5.3,
  },
};

export default function ConcertTotalStatusPage() {
  // API 훅 사용
  const { responses, isLoading, hasErrors, retryAll } = useConcertApi();
  
  // 통합 날짜 범위 상태
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  // 필터 적용 로딩 상태
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  
  // 목표 매출 섹션 최소화 상태
  const [isTargetSalesMinimized, setIsTargetSalesMinimized] = useState(false);
  
  // 월간/주간 매출 섹션 최소화 상태
  const [isMonthlyChartMinimized, setIsMonthlyChartMinimized] = useState(false);
  const [isMonthlyTableMinimized, setIsMonthlyTableMinimized] = useState(false);
  const [isWeeklyChartMinimized, setIsWeeklyChartMinimized] = useState(false);
  const [isWeeklyTableMinimized, setIsWeeklyTableMinimized] = useState(false);
  
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

  // 목표 매출 섹션 토글 핸들러
  const toggleTargetSales = () => {
    setIsTargetSalesMinimized(!isTargetSalesMinimized);
  };

  // 월간/주간 매출 섹션 토글 핸들러
  const toggleMonthlyChart = () => {
    setIsMonthlyChartMinimized(!isMonthlyChartMinimized);
  };

  const toggleMonthlyTable = () => {
    setIsMonthlyTableMinimized(!isMonthlyTableMinimized);
  };

  const toggleWeeklyChart = () => {
    setIsWeeklyChartMinimized(!isWeeklyChartMinimized);
  };

  const toggleWeeklyTable = () => {
    setIsWeeklyTableMinimized(!isWeeklyTableMinimized);
  };

  // 통합 날짜 범위 필터링 함수
  const filterDataByDateRange = (data: any[], dateField: string, isMonthly: boolean = false) => {
    if (!dateRange.startDate || !dateRange.endDate) {
      return data;
    }
    
    return data.filter(item => {
      let itemDate: Date;
      
      if (isMonthly) {
        // 월간 데이터의 경우 (예: "2024-01")
        itemDate = new Date(item[dateField] + '-01');
      } else {
        // 일간 데이터의 경우
        itemDate = new Date(item[dateField]);
      }
      
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  // 목표 매출 데이터 변환 함수
  const getTargetSalesData = () => {
    const targetSalesResponse = responses.targetSales;
    
    // API 데이터가 성공적으로 로드된 경우
    if (targetSalesResponse?.status === 'success' && targetSalesResponse.data && targetSalesResponse.data.length > 0) {
      console.log('✅ 목표 매출 데이터 변환 완료:', targetSalesResponse.data);
      return targetSalesResponse.data as ConcertTargetSales[];
    }
    
    // API 데이터가 없거나 실패한 경우 더미 데이터 사용
    return [
      {
        liveName: "히사이시조 영화음악 콘서트_2025_서울(예술의전당)",
        targetSales: "50,000,000",
        salesAcc: "156,419,000",
        targetRatio: "3.13"
      },
      {
        liveName: "[2025LOF] 재패니메이션 인 콘서트_2025 전설의 시작",
        targetSales: "62,000,000",
        salesAcc: "37,902,500",
        targetRatio: "0.61"
      }
    ] as ConcertTargetSales[];
  };

  const targetSalesData = getTargetSalesData();

  // 목표 매출 총계 계산 함수
  const getTargetSalesTotals = () => {
    if (!targetSalesData || targetSalesData.length === 0) {
      return { totalTarget: 3000000000, totalCurrent: 0, achievementRate: 0 };
    }

    const totalTarget = targetSalesData.reduce((sum, item) => sum + parseInt(item.targetSales.replace(/,/g, '')), 0);
    const totalCurrent = targetSalesData.reduce((sum, item) => sum + parseInt(item.salesAcc.replace(/,/g, '')), 0);
    const achievementRate = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

    return { totalTarget, totalCurrent, achievementRate };
  };

  // API 데이터 변환 함수 (백엔드 가이드 적용)
  const getSalesData = () => {
    const overviewResponse = responses.overview;
    const targetResponse = responses.targetSales;
    const dailyResponse = responses.daily;
    
    // 로딩 중인 경우 null 반환 (깜빡임 방지)
    if (isLoading) {
      return null;
    }
    
    // API 데이터가 성공적으로 로드된 경우
    if (overviewResponse?.status === 'success' && overviewResponse.data && overviewResponse.data.length > 0) {
      const overviewData = overviewResponse.data[0];
      
      // 기본 매출 데이터
      const yesterdaySales = parseInt(overviewData.yesterdaySales?.replace(/,/g, '') || '0') || 0;
      const accumulatedSales = parseInt(overviewData.accumulatedSales?.replace(/,/g, '') || '0') || 0;
      const weeklySales = parseInt(overviewData.weeklySales?.replace(/,/g, '') || '0') || 0;
      const dailyAvgSales = parseInt(overviewData.dailyAvgSales?.replace(/,/g, '') || '0') || 0;
      
      // 목표 매출 계산 (목표 매출 총계 사용)
      const targetTotals = getTargetSalesTotals();
      const totalTarget = targetTotals.totalTarget;
      const dailyTarget = Math.round(totalTarget / 365);
      const achievementRate = targetTotals.achievementRate;
      
      // 증감율 계산 (daily 데이터 사용)
      let yesterdayChangeRate = 0;
      let yesterdayChangeAmount = 0;
      let weeklyChangeRate = 0;
      let weeklyChangeAmount = 0;
      let avgChangeRate = 0;
      let avgChangeAmount = 0;
      
      if (dailyResponse?.status === 'success' && dailyResponse.data && dailyResponse.data.length > 0) {
        const dailyData = dailyResponse.data;
        
        // 어제 vs 그저께 비교
        const dayBeforeYesterday = new Date();
        dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
        const dayBeforeStr = dayBeforeYesterday.toISOString().split('T')[0];
        
        const dayBeforeSales = dailyData
          .filter((item: any) => item.recordDate.startsWith(dayBeforeStr))
          .reduce((sum: number, item: any) => sum + (item.dailySalesAmount || 0), 0);
        
        if (dayBeforeSales > 0) {
          yesterdayChangeAmount = yesterdaySales - dayBeforeSales;
          yesterdayChangeRate = (yesterdayChangeAmount / dayBeforeSales) * 100;
        }
        
        // 주간 비교 (최근 7일 vs 이전 7일)
        const today = new Date();
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
        
        const previousWeekSales = dailyData
          .filter((item: any) => {
            const itemDate = new Date(item.recordDate);
            return itemDate >= fourteenDaysAgo && itemDate < sevenDaysAgo;
          })
          .reduce((sum: number, item: any) => sum + (item.dailySalesAmount || 0), 0);
        
        if (previousWeekSales > 0) {
          weeklyChangeAmount = weeklySales - previousWeekSales;
          weeklyChangeRate = (weeklyChangeAmount / previousWeekSales) * 100;
          
          // 일평균 비교
          const previousWeekDailyAvg = previousWeekSales / 7;
          avgChangeAmount = Math.round(dailyAvgSales - previousWeekDailyAvg);
          avgChangeRate = (avgChangeAmount / previousWeekDailyAvg) * 100;
        }
      }
      
      const transformedData = {
        yesterday: {
          total: yesterdaySales,
          target: dailyTarget,
          changeAmount: yesterdayChangeAmount,
          changeRate: yesterdayChangeRate,
        },
        accumulated: {
          total: accumulatedSales,
          target: totalTarget,
          achievementRate: achievementRate,
        },
        weekly: {
          total: weeklySales,
          target: dailyTarget * 7,
          changeAmount: weeklyChangeAmount,
          changeRate: weeklyChangeRate,
        },
        weeklyAverage: {
          total: dailyAvgSales,
          target: dailyTarget,
          changeAmount: avgChangeAmount,
          changeRate: avgChangeRate,
        },
      };
      
      return transformedData;
    }
    
    // API 데이터가 없거나 실패한 경우 더미 데이터 사용
    return DUMMY_SALES_DATA;
  };

  const salesData = getSalesData();

  // 월간 매출 데이터 변환 함수
  const getMonthlyData = () => {
    const monthlyResponse = responses.monthly;
    
    // API 데이터가 성공적으로 로드된 경우
    if (monthlyResponse?.status === 'success' && monthlyResponse.data && monthlyResponse.data.length > 0) {
      let apiData = monthlyResponse.data;
      
      // 통합 날짜 범위 필터링 적용
      apiData = filterDataByDateRange(apiData, 'recordMonth', true);
      
      console.log('📊 월간 매출 데이터 바인딩:', {
        원본데이터: monthlyResponse.data.length,
        필터링된데이터: apiData.length,
        적용된날짜범위: dateRange
      });
      
      // 월별로 그룹화
      const monthlyGroups: Record<string, any[]> = {};
      apiData.forEach((item: ConcertMonthlyData) => {
        const month = item.recordMonth;
        if (!monthlyGroups[month]) {
          monthlyGroups[month] = [];
        }
        monthlyGroups[month].push({
          id: item.liveId,
          title: item.liveName,
          revenue: parseInt(item.monthlySalesAmount?.replace(/,/g, '') || '0') || 0
        });
      });
      
      // 월별 총합 계산 및 최신순 정렬
      const dates = Object.keys(monthlyGroups).sort().reverse();
      const data = dates.map(date => {
        const concerts = monthlyGroups[date];
        const total = concerts.reduce((sum, concert) => sum + concert.revenue, 0);
        
        return {
          date,
          total,
          concerts
        };
      });
      
      const transformedData = {
        dates,
        data
      };
      
      console.log('✅ 월간 매출 데이터 변환 완료:', transformedData);
      return transformedData;
    }
    
    // API 데이터가 없거나 실패한 경우 더미 데이터 사용
    return DUMMY_MONTHLY_DATA;
  };

  const monthlyData = getMonthlyData();

  // 주간 매출 데이터 변환 함수 (API 데이터 사용)
  const getWeeklyData = () => {
    const dailyResponse = responses.daily;
    
    // API 데이터가 성공적으로 로드된 경우
    if (dailyResponse?.status === 'success' && dailyResponse.data && dailyResponse.data.length > 0) {
      let apiData = dailyResponse.data as ConcertDailyData[];
      
      // 통합 날짜 범위 필터링 적용
      apiData = filterDataByDateRange(apiData, 'recordDate');
      
      console.log('📊 주간 매출 데이터 바인딩:', {
        원본데이터: dailyResponse.data.length,
        필터링된데이터: apiData.length,
        적용된날짜범위: dateRange
      });
      
      // 오늘 날짜
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정
      
      // 주간 데이터로 집계 (테이블용)
      const weeklyTable = apiData.reduce((acc: any, item: ConcertDailyData) => {
        const weekKey = item.recordWeek;
        
        // 주간 시작일이 오늘 날짜보다 이후인 경우 제외
        const weekStartDate = new Date(weekKey);
        if (weekStartDate > today) {
          console.log('🚫 미래 주간 데이터 제외:', weekKey);
          return acc;
        }
        
        if (!acc[weekKey]) {
          acc[weekKey] = {
            recordWeek: item.recordWeek,
            concerts: []
          };
        }
        
        // 해당 주의 콘서트별 데이터 추가
        const existingConcert = acc[weekKey].concerts.find((c: any) => c.liveId === item.liveId);
        
        if (existingConcert) {
          existingConcert.weeklySalesAmount += item.dailySalesAmount;
          existingConcert.weeklySalesTicketNo += item.dailySalesTicketNo;
        } else {
          acc[weekKey].concerts.push({
            liveId: item.liveId,
            liveName: item.liveName,
            weeklySalesAmount: item.dailySalesAmount,
            weeklySalesTicketNo: item.dailySalesTicketNo
          });
        }
        
        return acc;
      }, {});
      
      // 주간 데이터 배열로 변환 (최신순 정렬)
      const sortedWeekKeys = Object.keys(weeklyTable).sort().reverse();
      const weeks = sortedWeekKeys.map((weekKey, index) => ({
        id: index + 1,
        label: new Date(weekKey).toLocaleDateString('ko-KR')
      }));
      
      const data = sortedWeekKeys.map((weekKey, index) => {
        const week = weeklyTable[weekKey];
        return {
          weekId: index + 1,
          total: week.concerts.reduce((sum: number, concert: any) => sum + concert.weeklySalesAmount, 0),
          concerts: week.concerts.map((concert: any) => ({
            id: parseInt(concert.liveId),
            title: concert.liveName,
            revenue: concert.weeklySalesAmount
          }))
        };
      });
      
      const transformedData = {
        weeks,
        data
      };
      
      console.log('✅ 주간 매출 데이터 변환 완료 (미래 데이터 제외):', {
        전체주간수: Object.keys(weeklyTable).length,
        표시될주간수: sortedWeekKeys.length,
        오늘날짜: today.toISOString().split('T')[0],
        주간범위: sortedWeekKeys.length > 0 ? `${sortedWeekKeys[sortedWeekKeys.length - 1]} ~ ${sortedWeekKeys[0]}` : '데이터 없음'
      });
      
      return transformedData;
    }
    
    // API 데이터가 없거나 실패한 경우 더미 데이터 사용
    return DUMMY_WEEKLY_DATA;
  };

  const weeklyData = getWeeklyData();

  // 전체 페이지 에러 화면
  if (allApisFailure) {
    return (
      <div className="p-6">
              {/* 데이터 뷰어 (모든 환경) */}
      {showDataViewer && <ApiDataViewer responses={responses} />}
        
        <div className="max-w-2xl mx-auto mt-20">
          <ErrorView
            title="콘서트 데이터를 불러올 수 없습니다"
            message="모든 API 서버 연결에 실패했습니다. 네트워크 상태와 서버 상태를 확인해주세요."
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
              콘서트 통합 현황
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
        {salesData ? (
          <ConcertSalesCards data={salesData} />
        ) : (
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
        )}
      </motion.div>

      {/* 목표 매출 달성 현황 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className={`bg-white rounded-xl shadow-lg overflow-hidden ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* 헤더 - 항상 표시 */}
        <div 
          onClick={toggleTargetSales}
          className="flex items-center justify-between p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
        >
          <div className="flex items-center">
            <span className="inline-block w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
            <h2 className="text-xl font-bold text-gray-900">
              목표 매출 달성 현황
            </h2>
          </div>
          
          <div className="flex items-center">
            <span className="mr-3 text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">
              전체기간으로 고정
            </span>
            <motion.div
              animate={{ rotate: isTargetSalesMinimized ? 180 : 0 }}
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
            height: isTargetSalesMinimized ? 0 : 'auto',
            opacity: isTargetSalesMinimized ? 0 : 1 
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="p-6">
            {targetSalesData && !isLoading ? (
              <ConcertTargetSalesTable data={targetSalesData} />
            ) : (
              <div className="animate-pulse">
                {/* 테이블 헤더 스켈레톤 */}
                <div className="mb-4">
                  <div className="flex space-x-4">
                    <div className="h-6 bg-gray-300 rounded w-40"></div>
                    <div className="h-6 bg-gray-300 rounded w-32"></div>
                    <div className="h-6 bg-gray-300 rounded w-32"></div>
                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
                {/* 테이블 행 스켈레톤 */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex space-x-4 mb-3">
                    <div className="h-4 bg-gray-200 rounded w-40"></div>
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

      {/* 월간 매출 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className={`bg-white rounded-xl shadow-lg overflow-hidden ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* 헤더 - 항상 표시 */}
        <div 
          onClick={toggleMonthlyChart}
          className="flex items-center justify-between p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
        >
          <div className="flex items-center">
            <span className="inline-block w-1 h-6 bg-pink-500 rounded-full mr-3"></span>
            <h2 className="text-xl font-bold text-gray-900">
              월간 매출 현황
              {dateRange.startDate && dateRange.endDate && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (필터 적용됨)
                </span>
              )}
            </h2>
          </div>
          
          <motion.div
            animate={{ rotate: isMonthlyChartMinimized ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>

        {/* 차트 내용 - 확장 시에만 표시 */}
        <motion.div
          initial={false}
          animate={{ 
            height: isMonthlyChartMinimized ? 0 : 'auto',
            opacity: isMonthlyChartMinimized ? 0 : 1 
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="p-6">
            {monthlyData && !isLoading ? (
              <ConcertMonthlyChart data={monthlyData} />
            ) : (
              <div className="w-full h-[400px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mb-4 mx-auto animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-32 mx-auto mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-300 rounded w-24 mx-auto animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* 월간 매출 테이블 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className={`bg-white rounded-xl shadow-lg overflow-hidden ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* 헤더 - 항상 표시 */}
        <div 
          onClick={toggleMonthlyTable}
          className="flex items-center justify-between p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
        >
          <div className="flex items-center">
            <span className="inline-block w-1 h-6 bg-pink-500 rounded-full mr-3"></span>
            <h2 className="text-xl font-bold text-gray-900">
              월간 매출 상세
            </h2>
          </div>
          
          <motion.div
            animate={{ rotate: isMonthlyTableMinimized ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>

        {/* 테이블 내용 - 확장 시에만 표시 */}
        <motion.div
          initial={false}
          animate={{ 
            height: isMonthlyTableMinimized ? 0 : 'auto',
            opacity: isMonthlyTableMinimized ? 0 : 1 
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="p-6">
            {monthlyData && !isLoading ? (
              <ConcertMonthlyTable data={monthlyData} />
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

      {/* 주간 매출 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className={`bg-white rounded-xl shadow-lg overflow-hidden ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* 헤더 - 항상 표시 */}
        <div 
          onClick={toggleWeeklyChart}
          className="flex items-center justify-between p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
        >
          <div className="flex items-center">
            <span className="inline-block w-1 h-6 bg-indigo-500 rounded-full mr-3"></span>
            <h2 className="text-xl font-bold text-gray-900">
              주간 매출 현황
              {dateRange.startDate && dateRange.endDate && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (필터 적용됨)
                </span>
              )}
            </h2>
          </div>
          
          <motion.div
            animate={{ rotate: isWeeklyChartMinimized ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>

        {/* 차트 내용 - 확장 시에만 표시 */}
        <motion.div
          initial={false}
          animate={{ 
            height: isWeeklyChartMinimized ? 0 : 'auto',
            opacity: isWeeklyChartMinimized ? 0 : 1 
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="p-6">
            {weeklyData && !isLoading ? (
              <ConcertWeeklyChart data={weeklyData} />
            ) : (
              <div className="w-full h-[400px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mb-4 mx-auto animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-32 mx-auto mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-300 rounded w-24 mx-auto animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* 주간 매출 테이블 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className={`bg-white rounded-xl shadow-lg overflow-hidden ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* 헤더 - 항상 표시 */}
        <div 
          onClick={toggleWeeklyTable}
          className="flex items-center justify-between p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
        >
          <div className="flex items-center">
            <span className="inline-block w-1 h-6 bg-indigo-600 rounded-full mr-3"></span>
            <h2 className="text-xl font-bold text-gray-900">
              주간 매출 상세
            </h2>
          </div>
          
          <motion.div
            animate={{ rotate: isWeeklyTableMinimized ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>

        {/* 테이블 내용 - 확장 시에만 표시 */}
        <motion.div
          initial={false}
          animate={{ 
            height: isWeeklyTableMinimized ? 0 : 'auto',
            opacity: isWeeklyTableMinimized ? 0 : 1 
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="p-6">
            {weeklyData && !isLoading ? (
              <ConcertWeeklyTable data={weeklyData} />
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
    </div>
  );
} 