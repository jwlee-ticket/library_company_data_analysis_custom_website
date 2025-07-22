'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { usePlayApi } from '@/hooks/usePlayApi';
import PlayPeriodRevenueChart from '@/components/dashboard/play/PlayPeriodRevenueChart';
import PlayPerformanceRevenueChart from '@/components/dashboard/play/PlayPerformanceRevenueChart';
import PlayPeriodRevenueTable from '@/components/dashboard/play/PlayPeriodRevenueTable';
import ErrorView from '@/components/ui/ErrorView';
import ApiDataViewer from '@/components/debug/ApiDataViewer';
import { Select } from '@/components/ui/select';
import UnifiedDateFilter from '@/components/ui/UnifiedDateFilter';

export default function PlayPeriodRevenuePage() {
  const {
    getMonthlySummaryData,
    getMonthlyByPerformanceData,
    isLoading,
    hasErrors,
    retryAll,
    responses
  } = usePlayApi();

  // 필터 상태 관리
  const [selectedPerformance, setSelectedPerformance] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const monthlySummaryData = getMonthlySummaryData();
  const monthlyByPerformanceData = getMonthlyByPerformanceData();

  // 공연 목록 추출 (중복 제거)
  const performanceOptions = useMemo(() => {
    if (!monthlyByPerformanceData) return [{ value: 'all', label: '전체 공연' }];
    
    const performances = monthlyByPerformanceData
      .filter(item => item.performance_name) // undefined 제거
      .map(item => item.performance_name!)   // non-null assertion
      .filter((name, index, array) => array.indexOf(name) === index)
      .sort();
    
    return [
      { value: 'all', label: '전체 공연' },
      ...performances.map(name => ({ value: name, label: name }))
    ];
  }, [monthlyByPerformanceData]);

  // 날짜 필터링 함수
  const filterDataByDate = (data: any[], dateField: string) => {
    if (!startDate || !endDate || !data) return data;
    
    return data.filter(item => {
      const itemDate = item[dateField];
      if (!itemDate) return true;
      
      // 월 데이터 형식 처리 (YYYY-MM 또는 YYYY-MM-DD)
      let compareDate = itemDate;
      if (typeof itemDate === 'string' && itemDate.length === 7) {
        compareDate = `${itemDate}-01`; // YYYY-MM -> YYYY-MM-01
      }
      
      return compareDate >= startDate && compareDate <= endDate;
    });
  };

  // 공연별 필터링 함수
  const filterDataByPerformance = (data: any[], performanceField: string) => {
    if (selectedPerformance === 'all' || !data) return data;
    
    return data.filter(item => item[performanceField] === selectedPerformance);
  };

  // 필터링된 데이터
  const filteredMonthlySummaryData = useMemo(() => {
    if (!monthlySummaryData) return null;
    return filterDataByDate(monthlySummaryData, 'month_str');
  }, [monthlySummaryData, startDate, endDate]);

  const filteredMonthlyByPerformanceData = useMemo(() => {
    if (!monthlyByPerformanceData) return null;
    
    let filtered = filterDataByPerformance(monthlyByPerformanceData, 'performance_name');
    filtered = filterDataByDate(filtered, 'month');
    
    return filtered;
  }, [monthlyByPerformanceData, selectedPerformance, startDate, endDate]);

  // 필터 리셋 함수
  const handleResetFilters = () => {
    setIsFilterLoading(true);
    setSelectedPerformance('all');
    setStartDate('');
    setEndDate('');
    setTimeout(() => setIsFilterLoading(false), 300);
  };

  // 날짜 범위 변경 핸들러
  const handleDateRangeChange = (start: string, end: string) => {
    setIsFilterLoading(true);
    setStartDate(start);
    setEndDate(end);
    setTimeout(() => setIsFilterLoading(false), 300);
  };

  // 공연 선택 변경 핸들러
  const handlePerformanceChange = (value: string) => {
    setIsFilterLoading(true);
    setSelectedPerformance(value);
    setTimeout(() => setIsFilterLoading(false), 300);
  };

  // 필터가 적용되었는지 확인
  const hasActiveFilters = selectedPerformance !== 'all' || startDate || endDate;

  // 에러 처리
  if (hasErrors && !isLoading && !monthlySummaryData && !monthlyByPerformanceData) {
    return (
      <div className="min-h-screen bg-gray-50/30">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              연극 & 뮤지컬 - 기간별 매출 분석
            </h1>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8">
            <ErrorView
              title="데이터 로딩 실패"
              message="기간별 매출 데이터를 불러올 수 없습니다."
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
                연극 & 뮤지컬 - 기간별 매출 분석
              </h1>
              <p className="text-gray-600">
                기간별 매출 추이 및 공연별 상세 분석을 확인하세요
              </p>
            </div>
            
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-full">
              최근 업데이트: {new Date().toLocaleDateString('ko-KR')}
            </div>
          </div>
        </motion.div>

        {/* 필터 영역 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
              <h2 className="text-lg font-semibold text-gray-900">데이터 필터</h2>
              {hasActiveFilters && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  필터 적용됨
                </span>
              )}
            </div>
            
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                disabled={isFilterLoading}
                className="text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                필터 초기화
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 공연 선택 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                공연 선택
              </label>
              <Select
                value={selectedPerformance}
                onValueChange={handlePerformanceChange}
                options={performanceOptions}
                placeholder="공연을 선택하세요"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                분석할 공연을 선택하거나 전체를 선택하세요
              </p>
            </div>

            {/* 기간 선택 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                분석 기간
              </label>
              <UnifiedDateFilter
                startDate={startDate}
                endDate={endDate}
                onDateRangeChange={handleDateRangeChange}
                onReset={() => handleDateRangeChange('', '')}
                isLoading={isFilterLoading}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                분석하고 싶은 기간을 선택하세요
              </p>
            </div>
          </div>

          {/* 필터 적용 상태 안내 */}
          {(isFilterLoading || isLoading) && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-blue-700">
                  {isLoading ? '데이터를 불러오는 중...' : '필터를 적용하는 중...'}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* API 응답 데이터 뷰어 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <ApiDataViewer responses={responses} />
        </motion.div>

        {/* 로딩 상태 */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12"
          >
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-gray-600 font-medium text-lg">기간별 매출 데이터를 불러오는 중...</p>
              <p className="text-gray-400 text-sm mt-2">잠시만 기다려 주세요</p>
            </div>
          </motion.div>
        )}

        {/* 월별 매출 트렌드 차트 */}
        {filteredMonthlySummaryData && filteredMonthlySummaryData.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-7 bg-blue-500 rounded-full mr-4"></div>
                  <h2 className="text-xl font-bold text-gray-900">기간별 매출 트렌드</h2>
                  <span className="ml-3 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                    시계열 분석
                  </span>
                </div>
                
                {hasActiveFilters && (
                  <div className="text-sm text-gray-500">
                    {filteredMonthlySummaryData.length}개 데이터 포인트
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              <PlayPeriodRevenueChart data={filteredMonthlySummaryData} />
            </div>
          </motion.section>
        )}

        {/* 공연별 월별 매출 차트 */}
        {filteredMonthlyByPerformanceData && filteredMonthlyByPerformanceData.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-7 bg-purple-500 rounded-full mr-4"></div>
                  <h2 className="text-xl font-bold text-gray-900">공연별 매출 분석</h2>
                  <span className="ml-3 px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-full">
                    비교 분석
                  </span>
                </div>
                
                {hasActiveFilters && (
                  <div className="text-sm text-gray-500">
                    {selectedPerformance === 'all' ? '전체 공연' : selectedPerformance} | {filteredMonthlyByPerformanceData.length}개 데이터
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              <PlayPerformanceRevenueChart data={filteredMonthlyByPerformanceData} />
            </div>
          </motion.section>
        )}

        {/* 월별 매출 상세 테이블 */}
        {filteredMonthlySummaryData && filteredMonthlySummaryData.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-7 bg-emerald-500 rounded-full mr-4"></div>
                  <h2 className="text-xl font-bold text-gray-900">기간별 매출 상세</h2>
                  <span className="ml-3 px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full">
                    상세 데이터
                  </span>
                </div>
                
                {hasActiveFilters && (
                  <div className="text-sm text-gray-500">
                    필터링된 결과: {filteredMonthlySummaryData.length}개월
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              <PlayPeriodRevenueTable data={filteredMonthlySummaryData} />
            </div>
          </motion.section>
        )}

        {/* 데이터가 없는 경우 */}
        {!isLoading && !hasErrors && (!filteredMonthlySummaryData || filteredMonthlySummaryData.length === 0) && (!filteredMonthlyByPerformanceData || filteredMonthlyByPerformanceData.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12"
          >
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-800">
                  {hasActiveFilters ? '필터 조건에 맞는 데이터 없음' : '기간별 매출 데이터 없음'}
                </h2>
                <p className="text-gray-600">
                  {hasActiveFilters 
                    ? '선택한 공연과 기간에 해당하는 데이터가 없습니다. 필터 조건을 변경해보세요.'
                    : '현재 연극과 뮤지컬의 기간별 매출 데이터가 없습니다.'
                  }
                </p>
                <p className="text-gray-400 text-sm">
                  데이터가 로드되면 여기에 표시됩니다.
                </p>
              </div>
              
              <div className="flex justify-center space-x-3">
                {hasActiveFilters && (
                  <motion.button
                    onClick={handleResetFilters}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium shadow-sm"
                  >
                    필터 초기화
                  </motion.button>
                )}
                
                <motion.button
                  onClick={retryAll}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm"
                >
                  다시 시도
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 