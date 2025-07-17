'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const MonthlyRevenueChart = dynamic(() => import('@/components/dashboard/MonthlyRevenueChart'), {
  ssr: false,
  loading: () => <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-center justify-center">
    <div className="flex items-center space-x-3">
      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-gray-600 font-medium">차트를 로딩 중...</span>
    </div>
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
    
    console.log('통합 필터 적용:', { startDate, endDate });
  };

  const handleDateRangeReset = () => {
    setDateRange({ startDate: '', endDate: '' });
    console.log('필터 초기화');
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="p-8 max-w-7xl mx-auto space-y-10">
        {/* 페이지 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                연극 & 뮤지컬 - 월별 매출 분석
              </h1>
              <p className="text-gray-600">
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
          transition={{ duration: 0.4, delay: 0.1 }}
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
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className={`bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-1 h-7 bg-blue-500 rounded-full mr-4"></div>
              <h2 className="text-xl font-bold text-gray-900">월별 전체 매출 추이</h2>
              <span className="ml-3 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                시계열 분석
              </span>
            </div>
          </div>
          
          <div className="p-6">
            {summaryLoading ? (
              <div className="animate-pulse space-y-6">
                <div className="h-6 bg-gray-200 rounded-lg w-1/3"></div>
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            ) : summaryError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <ErrorView 
                  message={summaryError}
                  onRetry={handleSummaryRetry}
                />
              </div>
            ) : monthlySummaryData.length > 0 ? (
              <MonthlyRevenueChart 
                title="월별 매출 추이" 
                monthlyData={getChartData()} 
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 font-medium">월별 전체 매출 데이터가 없습니다.</p>
                <p className="text-gray-400 text-sm mt-2">데이터가 로드되면 여기에 표시됩니다.</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* 월별 공연별 매출 상세 테이블 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-1 h-7 bg-purple-500 rounded-full mr-4"></div>
              <h2 className="text-xl font-bold text-gray-900">월별 공연별 매출 상세</h2>
              <span className="ml-3 px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-full">
                상세 분석
              </span>
            </div>
          </div>
          
          <div className="p-6">
            {performanceLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="border border-gray-200 rounded-xl p-6">
                    <div className="h-5 bg-gray-200 rounded-lg w-24 mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : performanceError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <ErrorView 
                  message={performanceError}
                  onRetry={handlePerformanceRetry}
                />
              </div>
            ) : monthlyByPerformanceData.length > 0 ? (
              <div className="space-y-6">
                {getPerformanceTableData().map((monthData, index) => (
                  <motion.div 
                    key={monthData.month}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-200">
                      <h3 className="font-bold text-gray-900">{monthData.month}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {monthData.performances.length}개 공연 데이터
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50/30">
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">공연명</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">매출</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">전월 대비 변화량</th>
                            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">전월 대비 증감률</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {monthData.performances.map((performance, perfIndex) => (
                            <motion.tr 
                              key={`${monthData.month}-${performance.performance_name}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: (index * 0.1) + (perfIndex * 0.05) }}
                              className="hover:bg-gray-50/50 transition-colors duration-200 group"
                            >
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                                {performance.performance_name}
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                {toNumber(performance.total_revenue).toLocaleString()}원
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  toNumber(performance.absolute_change) >= 0 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                  {toNumber(performance.absolute_change) >= 0 ? '+' : ''}
                                  {toNumber(performance.absolute_change).toLocaleString()}원
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {performance.percentage_change !== null && performance.percentage_change !== undefined ? (() => {
                                  const changeRate = typeof performance.percentage_change === 'number' 
                                    ? performance.percentage_change 
                                    : parseFloat(performance.percentage_change);
                                  
                                  if (isNaN(changeRate)) {
                                    return (
                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                                        -
                                      </span>
                                    );
                                  }
                                  
                                  return (
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                      changeRate >= 0 
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                    }`}>
                                      {changeRate >= 0 ? '+' : ''}
                                      {changeRate.toFixed(1)}%
                                    </span>
                                  );
                                })() : (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                                    -
                                  </span>
                                )}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 font-medium">월별 공연별 매출 데이터가 없습니다.</p>
                <p className="text-gray-400 text-sm mt-2">데이터가 로드되면 여기에 표시됩니다.</p>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
} 