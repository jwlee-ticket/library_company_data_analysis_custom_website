'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const MonthlyRevenueChart = dynamic(() => import('@/components/dashboard/MonthlyRevenueChart'), {
  ssr: false,
  loading: () => <div className="bg-white rounded-lg p-8 flex items-center justify-center">
    <div className="text-gray-500">차트를 로딩 중...</div>
  </div>
});

import ApiDataViewer from '@/components/debug/ApiDataViewer';
import ErrorView from '@/components/ui/ErrorView';
import UnifiedDateFilter from '@/components/ui/UnifiedDateFilter';

interface MonthlySummaryData {
  month_str: string;
  total_revenue: number;
  absolute_change: number;
  percentage_change: number;
  note: string;
}

interface MonthlyByPerformanceData {
  month: string;
  performance_name: string;
  total_revenue: number;
  absolute_change: number;
  percentage_change: number;
}

export default function PlayMonthlyRevenuePage() {
  // 상태 관리
  const [monthlySummaryData, setMonthlySummaryData] = useState<MonthlySummaryData[]>([]);
  const [monthlyByPerformanceData, setMonthlyByPerformanceData] = useState<MonthlyByPerformanceData[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [performanceLoading, setPerformanceLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [performanceError, setPerformanceError] = useState<string | null>(null);

  // 통합 날짜 범위 상태
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  // 필터 적용 로딩 상태
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // 안전한 숫자 변환 함수 (정수로 반환)
  const toNumber = (value: any): number => {
    if (typeof value === 'number') return Math.floor(value);
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : Math.floor(parsed);
    }
    return 0;
  };

  // 월별 전체 매출 데이터 로딩
  const loadMonthlySummary = async () => {
    setSummaryLoading(true);
    setSummaryError(null);

    try {
      const response = await fetch('/api/play/monthly-summary');
      if (!response.ok) {
        throw new Error('월별 전체 매출 API 응답 오류');
      }

      const result = await response.json();
      setMonthlySummaryData(result);

    } catch (err) {
      console.error('월별 전체 매출 데이터 로딩 실패:', err);
      setSummaryError(err instanceof Error ? err.message : '월별 전체 매출 데이터 로딩에 실패했습니다');
    } finally {
      setSummaryLoading(false);
    }
  };

  // 월별 공연별 매출 데이터 로딩
  const loadMonthlyByPerformance = async () => {
    setPerformanceLoading(true);
    setPerformanceError(null);

    try {
      const response = await fetch('/api/play/monthly-by-performance');
      if (!response.ok) {
        throw new Error('월별 공연별 매출 API 응답 오류');
      }

      const result = await response.json();
      setMonthlyByPerformanceData(result);

    } catch (err) {
      console.error('월별 공연별 매출 데이터 로딩 실패:', err);
      setPerformanceError(err instanceof Error ? err.message : '월별 공연별 매출 데이터 로딩에 실패했습니다');
    } finally {
      setPerformanceLoading(false);
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    loadMonthlySummary();
    loadMonthlyByPerformance();
  }, []);

  // 월별 전체 매출 차트 데이터 변환
  const getChartData = () => {
    // 월별 데이터를 시간 순서대로 정렬 (오래된 것부터 최신 순)
    const sortedData = [...monthlySummaryData].sort((a, b) => 
      a.month_str.localeCompare(b.month_str)
    );
    
    return sortedData.map((item, index) => ({
      month: item.month_str,
      revenue: toNumber(item.total_revenue),
      previousRevenue: index > 0 ? toNumber(sortedData[index - 1].total_revenue) : null
    }));
  };

  // 월별 공연별 데이터 그룹핑
  const getPerformanceTableData = () => {
    const groupedByMonth = new Map<string, MonthlyByPerformanceData[]>();
    
    monthlyByPerformanceData.forEach(item => {
      const month = item.month;
      if (!groupedByMonth.has(month)) {
        groupedByMonth.set(month, []);
      }
      groupedByMonth.get(month)!.push(item);
    });

    // 월별로 시간 순서대로 정렬 (최신부터 오래된 순)
    const sortedMonths = Array.from(groupedByMonth.keys()).sort((a, b) => 
      b.localeCompare(a)
    );
    
    return sortedMonths.map(month => ({
      month,
      performances: groupedByMonth.get(month)!.sort((a, b) => 
        toNumber(b.total_revenue) - toNumber(a.total_revenue)
      )
    }));
  };

  // 재시도 함수들
  const handleSummaryRetry = () => {
    loadMonthlySummary();
  };

  const handlePerformanceRetry = () => {
    loadMonthlyByPerformance();
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-50 via-white to-purple-50 rounded-2xl p-6 border border-gray-100 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              연극 & 뮤지컬 - 월별 통합 매출
            </h1>
            <p className="text-sm text-gray-600">
              월별 매출 추이 및 공연별 상세 분석을 확인하세요
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
          </div>
        </div>
      </motion.div>

      {/* API 응답 데이터 뷰어 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <ApiDataViewer 
          responses={{
            'monthly-summary': {
              endpoint: '/api/play/monthly-summary',
              status: summaryLoading ? 'loading' : summaryError ? 'error' : 'success',
              data: monthlySummaryData,
              error: summaryError || undefined,
              timestamp: new Date().toISOString()
            },
            'monthly-by-performance': {
              endpoint: '/api/play/monthly-by-performance',
              status: performanceLoading ? 'loading' : performanceError ? 'error' : 'success',
              data: monthlyByPerformanceData,
              error: performanceError || undefined,
              timestamp: new Date().toISOString()
            }
          }}
        />
      </motion.div>

      {/* 월별 전체 매출 차트 영역 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-6">월별 전체 매출 추이</h2>
        
        {summaryLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ) : summaryError ? (
          <ErrorView 
            message={summaryError}
            onRetry={handleSummaryRetry}
          />
        ) : monthlySummaryData.length > 0 ? (
          <MonthlyRevenueChart 
            title="월별 매출 추이" 
            monthlyData={getChartData()} 
          />
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            월별 전체 매출 데이터가 없습니다.
          </div>
        )}
      </motion.div>

      {/* 월별 공연별 매출 상세 테이블 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-6">월별 공연별 매출 상세</h2>
        
        {performanceLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        ) : performanceError ? (
          <ErrorView 
            message={performanceError}
            onRetry={handlePerformanceRetry}
          />
        ) : monthlyByPerformanceData.length > 0 ? (
          <div className="space-y-6">
            {getPerformanceTableData().map(monthData => (
              <div key={monthData.month} className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-medium text-gray-800">{monthData.month}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">공연명</th>
                        <th className="px-6 py-3">매출</th>
                        <th className="px-6 py-3">전월 대비 변화량</th>
                        <th className="px-6 py-3">전월 대비 증감률</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthData.performances.map((performance, index) => (
                        <tr key={`${monthData.month}-${performance.performance_name}`} 
                            className="bg-white border-b hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {performance.performance_name}
                          </td>
                          <td className="px-6 py-4">
                            {toNumber(performance.total_revenue).toLocaleString()}원
                          </td>
                          <td className="px-6 py-4">
                            <span className={`${
                              toNumber(performance.absolute_change) >= 0 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {toNumber(performance.absolute_change) >= 0 ? '+' : ''}
                              {toNumber(performance.absolute_change).toLocaleString()}원
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {performance.percentage_change !== null && performance.percentage_change !== undefined ? (() => {
                              const changeRate = typeof performance.percentage_change === 'number' 
                                ? performance.percentage_change 
                                : parseFloat(performance.percentage_change);
                              
                              if (isNaN(changeRate)) {
                                return (
                                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                    -
                                  </span>
                                );
                              }
                              
                              return (
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  changeRate >= 0 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {changeRate >= 0 ? '+' : ''}
                                  {changeRate.toFixed(1)}%
                                </span>
                              );
                            })() : (
                              <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                -
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            월별 공연별 매출 데이터가 없습니다.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
} 