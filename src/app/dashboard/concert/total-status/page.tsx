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
import { useConcertApi } from '@/hooks/useConcertApi';
import { ConcertMonthlyData } from '@/lib/api';

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
    { id: 1, label: '1주차 (2024.01.01 - 2024.01.07)' },
    { id: 2, label: '2주차 (2024.01.08 - 2024.01.14)' },
    { id: 3, label: '3주차 (2024.01.15 - 2024.01.21)' },
  ],
  data: [
    {
      weekId: 1,
      total: 210000000,
      concerts: [
        { id: 1, title: '2024 아이유 콘서트', revenue: 100000000 },
        { id: 2, title: '르세라핌 월드투어', revenue: 70000000 },
        { id: 3, title: '뉴진스 쇼케이스', revenue: 40000000 },
      ],
    },
    // ... 나머지 주간 데이터
  ],
};

const DUMMY_SALES_DATA = {
  yesterday: {
    total: 85000000,
    target: 100000000,
  },
  accumulated: {
    total: 2500000000,
    target: 3000000000,
  },
  weekly: {
    total: 420000000,
    target: 500000000,
  },
  weeklyAverage: {
    total: 60000000,
    target: 71428571,
  },
};

export default function ConcertTotalStatusPage() {
  // API 훅 사용
  const { responses, isLoading, hasErrors, retryAll } = useConcertApi();
  
  // 개발환경에서만 데이터 뷰어 표시
  const showDataViewer = process.env.NODE_ENV === 'development';

  // 전체 페이지 에러 상태 체크 (모든 API가 실패한 경우)
  const allApisFailure = Object.keys(responses).length > 0 && 
    Object.values(responses).every(r => r.status === 'error');

  // API 데이터 변환 함수
  const getSalesData = () => {
    const overviewResponse = responses.overview;
    
    // API 데이터가 성공적으로 로드된 경우
    if (overviewResponse?.status === 'success' && overviewResponse.data && overviewResponse.data.length > 0) {
      const apiData = overviewResponse.data[0]; // 첫 번째 항목 사용
      
      console.log('📊 매출 데이터 바인딩:', {
        원본데이터: apiData,
        변환된데이터: {
          어제매출: apiData.yesterdaySales,
          누적매출: apiData.accumulatedSales,
          주간매출: apiData.weeklySales,
          일평균매출: apiData.dailyAvgSales
        }
      });
      
      const transformedData = {
        yesterday: {
          total: parseInt(apiData.yesterdaySales?.replace(/,/g, '') || '0') || 0,
          target: 100000000, // 목표값은 별도 API나 설정에서 가져와야 함
        },
        accumulated: {
          total: parseInt(apiData.accumulatedSales?.replace(/,/g, '') || '0') || 0,
          target: 3000000000, // 목표값은 별도 API나 설정에서 가져와야 함
        },
        weekly: {
          total: parseInt(apiData.weeklySales?.replace(/,/g, '') || '0') || 0,
          target: 500000000, // 목표값은 별도 API나 설정에서 가져와야 함
        },
        weeklyAverage: {
          total: parseInt(apiData.dailyAvgSales?.replace(/,/g, '') || '0') || 0,
          target: 71428571, // 목표값은 별도 API나 설정에서 가져와야 함
        },
      };
      
      console.log('✅ 매출 데이터 변환 완료:', transformedData);
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
      const apiData = monthlyResponse.data;
      
      console.log('📊 월간 매출 데이터 바인딩:', {
        원본데이터: apiData,
        데이터개수: apiData.length
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
      
      // 월별 총합 계산 및 정렬
      const dates = Object.keys(monthlyGroups).sort();
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
    console.log('⚠️ 월간 API 데이터 없음, 더미 데이터 사용:', {
      status: monthlyResponse?.status,
      hasData: !!monthlyResponse?.data,
      dataLength: monthlyResponse?.data?.length
    });
    
    return DUMMY_MONTHLY_DATA;
  };

  const monthlyData = getMonthlyData();

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
        <div className="flex items-center justify-between">
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
          
          {/* API 상태 표시 */}
          <div className="flex items-center space-x-2">
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
      >
        <ConcertSalesCards data={salesData} />
      </motion.div>

      {/* 월간 매출 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <span className="inline-block w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
          월간 매출 현황
        </h2>
        <ConcertMonthlyChart data={monthlyData} />
      </motion.div>

      {/* 월간 매출 테이블 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg p-6"
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
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <span className="inline-block w-1 h-6 bg-indigo-500 rounded-full mr-3"></span>
          주간 매출 현황
        </h2>
        <ConcertWeeklyChart data={DUMMY_WEEKLY_DATA} />
      </motion.div>

      {/* 주간 매출 테이블 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <span className="inline-block w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
          주간 매출 상세
        </h2>
        <ConcertWeeklyTable data={DUMMY_WEEKLY_DATA} />
      </motion.div>
    </div>
  );
} 