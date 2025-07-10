'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ConcertSalesCards from '@/components/dashboard/concert/ConcertSalesCards';
import ConcertMonthlyChart from '@/components/dashboard/concert/ConcertMonthlyChart';
import ConcertMonthlyTable from '@/components/dashboard/concert/ConcertMonthlyTable';
import ConcertWeeklyChart from '@/components/dashboard/concert/ConcertWeeklyChart';
import ConcertWeeklyTable from '@/components/dashboard/concert/ConcertWeeklyTable';
import ApiDataViewer from '@/components/debug/ApiDataViewer';
import ErrorView from '@/components/ui/ErrorView';
import UnifiedDateFilter from '@/components/ui/UnifiedDateFilter';

import { useConcertApi } from '@/hooks/useConcertApi';
import { ConcertMonthlyData, ConcertDailyData } from '@/lib/api';

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
  
  // 개발환경에서만 데이터 뷰어 표시
  const showDataViewer = process.env.NODE_ENV === 'development';

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

  // API 데이터 변환 함수 (백엔드 가이드 적용)
  const getSalesData = () => {
    const overviewResponse = responses.overview;
    const targetResponse = responses.targetSales;
    const dailyResponse = responses.daily;
    
    // API 데이터가 성공적으로 로드된 경우
    if (overviewResponse?.status === 'success' && overviewResponse.data && overviewResponse.data.length > 0) {
      const overviewData = overviewResponse.data[0];
      
      // 기본 매출 데이터
      const yesterdaySales = parseInt(overviewData.yesterdaySales?.replace(/,/g, '') || '0') || 0;
      const accumulatedSales = parseInt(overviewData.accumulatedSales?.replace(/,/g, '') || '0') || 0;
      const weeklySales = parseInt(overviewData.weeklySales?.replace(/,/g, '') || '0') || 0;
      const dailyAvgSales = parseInt(overviewData.dailyAvgSales?.replace(/,/g, '') || '0') || 0;
      
      // 목표 매출 계산
      let totalTarget = 3000000000; // 기본값
      let dailyTarget = Math.round(totalTarget / 365);
      
      if (targetResponse?.status === 'success' && targetResponse.data && targetResponse.data.length > 0) {
        totalTarget = targetResponse.data.reduce((sum: number, item: any) => 
          sum + (parseInt(item.targetSales?.replace(/,/g, '') || '0') || 0), 0
        );
        dailyTarget = Math.round(totalTarget / 365);
      }
      
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
          avgChangeAmount = dailyAvgSales - previousWeekDailyAvg;
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
      
      console.log('✅ 매출 데이터 변환 완료 (백엔드 가이드 적용):', transformedData);
      return transformedData;
    }
    
    // API 데이터가 없거나 실패한 경우 더미 데이터 사용
    console.log('⚠️ API 데이터 없음, 더미 데이터 사용:', {
      status: overviewResponse?.status,
      hasData: !!overviewResponse?.data,
      dataLength: overviewResponse?.data?.length
    });
    
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
    console.log('⚠️ 월간 API 데이터 없음, 더미 데이터 사용');
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
      
      // 주간 데이터로 집계 (테이블용)
      const weeklyTable = apiData.reduce((acc: any, item: ConcertDailyData) => {
        const weekKey = item.recordWeek;
        
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
      
      console.log('✅ 주간 매출 데이터 변환 완료:', transformedData);
      return transformedData;
    }
    
    // API 데이터가 없거나 실패한 경우 더미 데이터 사용
    console.log('⚠️ 주간 API 데이터 없음, 더미 데이터 사용');
    return DUMMY_WEEKLY_DATA;
  };

  const weeklyData = getWeeklyData();

  // 전체 페이지 에러 화면
  if (allApisFailure) {
    return (
      <div className="p-6">
        {/* 데이터 뷰어 (개발환경) */}
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
      {/* 데이터 뷰어 (개발환경에서만) */}
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
              최근 업데이트: {new Date().toLocaleString('ko-KR')}
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
        <ConcertSalesCards data={salesData} />
      </motion.div>

      {/* 월간 매출 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className={`bg-white rounded-xl shadow-lg p-6 ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <span className="inline-block w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
            월간 매출 현황
            {dateRange.startDate && dateRange.endDate && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                (필터 적용됨)
              </span>
            )}
          </h2>
        </div>
        <ConcertMonthlyChart data={monthlyData} />
      </motion.div>

      {/* 월간 매출 테이블 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className={`bg-white rounded-xl shadow-lg p-6 ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <span className="inline-block w-1 h-6 bg-pink-500 rounded-full mr-3"></span>
          월간 매출 상세
        </h2>
        <ConcertMonthlyTable data={monthlyData} />
      </motion.div>

      {/* 주간 매출 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className={`bg-white rounded-xl shadow-lg p-6 ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <span className="inline-block w-1 h-6 bg-indigo-500 rounded-full mr-3"></span>
            주간 매출 현황
            {dateRange.startDate && dateRange.endDate && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                (필터 적용됨)
              </span>
            )}
          </h2>
        </div>
        <ConcertWeeklyChart data={weeklyData} />
      </motion.div>

      {/* 주간 매출 테이블 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className={`bg-white rounded-xl shadow-lg p-6 ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <span className="inline-block w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
          주간 매출 상세
        </h2>
        <ConcertWeeklyTable data={weeklyData} />
      </motion.div>
    </div>
  );
} 