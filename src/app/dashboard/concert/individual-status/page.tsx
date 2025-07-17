'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Select } from '@/components/ui/select';
import ConcertProfitabilityTable from '@/components/dashboard/concert/ConcertProfitabilityTable';
import ConcertDailySalesChart from '@/components/dashboard/concert/ConcertDailySalesChart';
import ConcertDailyTicketsChart from '@/components/dashboard/concert/ConcertDailyTicketsChart';
import ConcertWeeklySalesTable from '@/components/dashboard/concert/ConcertWeeklySalesTable';
import ApiDataViewer from '@/components/debug/ApiDataViewer';
import ErrorView from '@/components/ui/ErrorView';
import UnifiedDateFilter from '@/components/ui/UnifiedDateFilter';

import { useConcertIndividualApi } from '@/hooks/useConcertIndividualApi';

export default function ConcertIndividualStatusPage() {
  // API 훅 사용
  const { responses, isLoading, hasErrors, retryAll } = useConcertIndividualApi();
  
  const [selectedConcert, setSelectedConcert] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [isConcertListMinimized, setIsConcertListMinimized] = useState(false);
  
  // 섹션 최소화 상태
  const [isProfitabilityMinimized, setIsProfitabilityMinimized] = useState(false);
  const [isDailySalesMinimized, setIsDailySalesMinimized] = useState(false);
  const [isDailyTicketsMinimized, setIsDailyTicketsMinimized] = useState(false);
  const [isWeeklySalesMinimized, setIsWeeklySalesMinimized] = useState(false);

  // 필터 적용 로딩 상태
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // 모든 환경에서 데이터 뷰어 표시
  const showDataViewer = true;

  // 전체 페이지 에러 상태 체크 (모든 API가 실패한 경우)
  const allApisFailure = Object.keys(responses).length > 0 && 
    Object.values(responses).every(r => r.status === 'error');

  // 콘서트 목록 추출 (Daily 데이터에서, BEP 데이터의 종료날짜로 정렬)
  const concertOptions = useMemo(() => {
    if (!responses.daily.data || !responses.bep.data) return [];
    
    const uniqueConcerts = responses.daily.data.reduce((acc, item) => {
      if (!acc.find(c => c.liveId === item.liveId)) {
        // BEP 데이터에서 해당 콘서트의 종료날짜 찾기
        const bepData = responses.bep.data?.find(bep => bep.liveId === item.liveId);
        acc.push({
          liveId: item.liveId,
          liveName: item.liveName,
          salesEndDate: bepData?.salesEndDate || '9999-12-31' // 기본값
        });
      }
      return acc;
    }, [] as { liveId: string; liveName: string; salesEndDate: string }[]);

    // 종료날짜가 가장 늦은 순서로 정렬 (내림차순)
    const sortedConcerts = uniqueConcerts.sort((a, b) => 
      new Date(b.salesEndDate).getTime() - new Date(a.salesEndDate).getTime()
    );

    return sortedConcerts.map(concert => ({
      value: concert.liveId,
      label: `${concert.liveName} (${new Date(concert.salesEndDate).toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      })})`
    }));
  }, [responses.daily.data, responses.bep.data]);

  // 콘서트 선택 핸들러
  const handleConcertSelect = (concertId: string) => {
    setSelectedConcert(concertId);
    setIsConcertListMinimized(true); // 콘서트 선택 시 목록 최소화
  };

  // 콘서트 목록 토글 핸들러
  const toggleConcertList = () => {
    setIsConcertListMinimized(!isConcertListMinimized);
  };

  // 섹션 토글 핸들러
  const toggleProfitability = () => {
    setIsProfitabilityMinimized(!isProfitabilityMinimized);
  };

  const toggleDailySales = () => {
    setIsDailySalesMinimized(!isDailySalesMinimized);
  };

  const toggleDailyTickets = () => {
    setIsDailyTicketsMinimized(!isDailyTicketsMinimized);
  };

  const toggleWeeklySales = () => {
    setIsWeeklySalesMinimized(!isWeeklySalesMinimized);
  };

  // 선택된 콘서트 정보 가져오기
  const selectedConcertInfo = concertOptions.find(concert => concert.value === selectedConcert);

  // 통합 날짜 범위 핸들러
  const handleDateRangeChange = async (startDate: string, endDate: string) => {
    setIsFilterLoading(true);
    
    // 시각적 피드백을 위한 짧은 지연
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setDateRange({ startDate, endDate });
    setIsFilterLoading(false);
    
    console.log('📅 개별 현황 필터 적용:', { selectedConcert, startDate, endDate });
  };

  const handleDateRangeReset = () => {
    setDateRange({ startDate: '', endDate: '' });
    console.log('🔄 개별 현황 필터 초기화');
  };

  // 선택된 콘서트와 날짜 범위에 따른 데이터 필터링
  const filteredBepData = useMemo(() => {
    if (!responses.bep.data || !selectedConcert) return [];
    return responses.bep.data.filter(item => item.liveId === selectedConcert);
  }, [responses.bep.data, selectedConcert]);

  const filteredDailyData = useMemo(() => {
    if (!responses.daily.data || !selectedConcert) return [];
    
    let filtered = responses.daily.data.filter(item => item.liveId === selectedConcert);
    
    // 날짜 범위 필터링
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      filtered = filtered.filter(item => {
        const recordDate = new Date(item.recordDate);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }
    
    return filtered;
  }, [responses.daily.data, selectedConcert, dateRange]);

  const filteredWeeklyData = useMemo(() => {
    if (!responses.weekly.data || !selectedConcert) return [];
    
    let filtered = responses.weekly.data.filter(item => item.liveId === selectedConcert);
    
    // 날짜 범위 필터링 (주간 데이터)
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      filtered = filtered.filter(item => {
        const recordDate = new Date(item.recordWeek);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }
    
    return filtered;
  }, [responses.weekly.data, selectedConcert, dateRange]);

  if (allApisFailure) {
    return (
      <div className="min-h-screen bg-gray-50/30">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto mt-20">
        <ErrorView
          title="콘서트 개별 현황 데이터 로드 실패"
          message="모든 API 연결에 실패했습니다. 네트워크 상태를 확인해주세요."
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
        <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
            콘서트 개별 현황
          </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <p className="text-gray-600">
            최근 업데이트: {new Date().toLocaleString('ko-KR')}
                </p>
            {isLoading && (
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-sm text-blue-600 font-medium">데이터 로딩 중...</span>
                  </div>
            )}
              </div>
        </div>
        
        {/* API 상태 표시 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <UnifiedDateFilter
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onDateRangeChange={handleDateRangeChange}
            onReset={handleDateRangeReset}
            isLoading={isFilterLoading}
          />
          
          {hasErrors && (
                <motion.button
              onClick={retryAll}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-sm font-medium hover:bg-orange-100 transition-colors duration-200 border border-orange-200"
            >
              일부 데이터 로드 실패 - 재시도
                </motion.button>
          )}
            </div>
        </div>
      </motion.div>

      {/* 콘서트 목록 테이블 - 최소화/확장 가능 */}
      {concertOptions.length > 0 && (
          <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* 헤더 - 항상 표시 */}
            <motion.div 
            onClick={toggleConcertList}
              className="flex items-center justify-between p-6 bg-gray-50/50 cursor-pointer hover:bg-gray-100/50 transition-all duration-200 group"
              whileHover={{ backgroundColor: 'rgb(249 250 251 / 0.8)' }}
          >
            <div className="flex items-center">
                <div className="w-1 h-7 bg-blue-500 rounded-full mr-4"></div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                {selectedConcert && isConcertListMinimized 
                  ? `선택된 콘서트: ${selectedConcertInfo?.label.split(' (')[0]}` 
                  : '콘서트 목록'
                }
                  <span className="ml-3 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                    {concertOptions.length}개
                  </span>
              </h3>
            </div>
            
            <div className="flex items-center">
              {selectedConcert && isConcertListMinimized && (
                  <span className="mr-4 text-sm text-gray-500 bg-gray-200 px-3 py-1.5 rounded-full font-medium">
                  {selectedConcertInfo?.label.split(' (')[1]?.replace(')', '')}
                </span>
              )}
              <motion.div
                animate={{ rotate: isConcertListMinimized ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                  className="p-1 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            </div>
            </motion.div>

          {/* 테이블 내용 - 확장 시에만 표시 */}
          <motion.div
            initial={false}
            animate={{ 
              height: isConcertListMinimized ? 0 : 'auto',
              opacity: isConcertListMinimized ? 0 : 1 
            }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-50/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        No.
                      </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        콘서트명
                      </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        판매 종료일
                      </th>
                    </tr>
                  </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                    {concertOptions.map((concert, index) => {
                      const concertName = concert.label.split(' (')[0];
                      const endDate = concert.label.split(' (')[1]?.replace(')', '');
                      const isSelected = selectedConcert === concert.value;
                      
                      return (
                        <motion.tr
                          key={concert.value}
                            initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.03 }}
                          onClick={() => handleConcertSelect(concert.value)}
                            className={`cursor-pointer transition-all duration-200 group ${
                            isSelected 
                                ? 'bg-blue-50/80 border-l-4 border-blue-500' 
                                : 'hover:bg-blue-50/50 hover:border-l-4 hover:border-blue-300'
                          }`}
                        >
                            <td className="px-6 py-4 text-sm text-gray-500 group-hover:text-blue-600 transition-colors duration-200">
                            {index + 1}
                          </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <span className={`text-sm font-semibold transition-colors duration-200 ${
                            isSelected 
                              ? 'text-blue-700' 
                                    : 'text-gray-900 group-hover:text-blue-700'
                          }`}>
                            {concertName}
                                </span>
                            {isSelected && (
                                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                                선택됨
                              </span>
                            )}
                              </div>
                          </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors duration-200">
                            {endDate}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
                <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="flex items-center text-sm text-blue-700">
                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  콘서트는 판매 종료일 기준으로 최신순으로 정렬되어 있습니다. 행을 클릭하여 선택하세요.
                </div>
              </div>
            </div>
          </motion.div>
          </motion.section>
      )}

      {/* 선택된 콘서트가 있을 때만 데이터 표시 */}
      {selectedConcert && (
        <>
          {/* 수익성 추정 테이블 */}
            <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {/* 헤더 - 항상 표시 */}
              <motion.div 
              onClick={toggleProfitability}
                className="flex items-center justify-between p-6 bg-gray-50/50 cursor-pointer hover:bg-gray-100/50 transition-all duration-200 group"
                whileHover={{ backgroundColor: 'rgb(249 250 251 / 0.8)' }}
            >
              <div className="flex items-center">
                  <div className="w-1 h-7 bg-purple-500 rounded-full mr-4"></div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                  수익성 추정
                </h2>
              </div>
              
              <div className="flex items-center">
                  <span className="mr-4 text-xs text-gray-500 bg-gray-200 px-3 py-1.5 rounded-full font-medium">
                  전체기간으로 고정
                </span>
                <motion.div
                  animate={{ rotate: isProfitabilityMinimized ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                    className="p-1 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </div>
              </motion.div>

            {/* 테이블 내용 - 확장 시에만 표시 */}
            <motion.div
              initial={false}
              animate={{ 
                height: isProfitabilityMinimized ? 0 : 'auto',
                opacity: isProfitabilityMinimized ? 0 : 1 
              }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-6">
                {filteredBepData.length > 0 && !isLoading ? (
                  <ConcertProfitabilityTable data={filteredBepData} />
                ) : (
                  <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded-lg w-48 mb-4"></div>
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex space-x-4">
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            </motion.section>

          {/* 일간 매출 그래프 */}
            <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {/* 헤더 - 항상 표시 */}
              <motion.div 
              onClick={toggleDailySales}
                className="flex items-center justify-between p-6 bg-gray-50/50 cursor-pointer hover:bg-gray-100/50 transition-all duration-200 group"
                whileHover={{ backgroundColor: 'rgb(249 250 251 / 0.8)' }}
            >
              <div className="flex items-center">
                  <div className="w-1 h-7 bg-pink-500 rounded-full mr-4"></div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors duration-200">
                  일간 매출
                  {dateRange.startDate && dateRange.endDate && (
                      <span className="ml-3 px-3 py-1 bg-pink-50 text-pink-700 text-sm font-medium rounded-full">
                        필터 적용됨
                    </span>
                  )}
                </h2>
              </div>
              
              <motion.div
                animate={{ rotate: isDailySalesMinimized ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                  className="p-1 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
              </motion.div>

            {/* 차트 내용 - 확장 시에만 표시 */}
            <motion.div
              initial={false}
              animate={{ 
                height: isDailySalesMinimized ? 0 : 'auto',
                opacity: isDailySalesMinimized ? 0 : 1 
              }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-6">
                {filteredDailyData.length > 0 && !isLoading ? (
                  <ConcertDailySalesChart data={filteredDailyData} />
                ) : (
                    <div className="w-full h-[400px] bg-gray-50 rounded-2xl animate-pulse flex items-center justify-center border border-gray-100">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-300 rounded-full mb-4 mx-auto animate-pulse"></div>
                        <div className="h-4 bg-gray-300 rounded-lg w-32 mx-auto mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-300 rounded w-24 mx-auto animate-pulse"></div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            </motion.section>

          {/* 일간 판매 매수 그래프 */}
            <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {/* 헤더 - 항상 표시 */}
              <motion.div 
              onClick={toggleDailyTickets}
                className="flex items-center justify-between p-6 bg-gray-50/50 cursor-pointer hover:bg-gray-100/50 transition-all duration-200 group"
                whileHover={{ backgroundColor: 'rgb(249 250 251 / 0.8)' }}
            >
              <div className="flex items-center">
                  <div className="w-1 h-7 bg-rose-500 rounded-full mr-4"></div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-rose-600 transition-colors duration-200">
                  일간 판매 매수
                  {dateRange.startDate && dateRange.endDate && (
                      <span className="ml-3 px-3 py-1 bg-rose-50 text-rose-700 text-sm font-medium rounded-full">
                        필터 적용됨
                    </span>
                  )}
                </h2>
              </div>
              
              <motion.div
                animate={{ rotate: isDailyTicketsMinimized ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                  className="p-1 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
              </motion.div>

            {/* 차트 내용 - 확장 시에만 표시 */}
            <motion.div
              initial={false}
              animate={{ 
                height: isDailyTicketsMinimized ? 0 : 'auto',
                opacity: isDailyTicketsMinimized ? 0 : 1 
              }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-6">
                {filteredDailyData.length > 0 && !isLoading ? (
                  <ConcertDailyTicketsChart data={filteredDailyData} />
                ) : (
                    <div className="w-full h-[400px] bg-gray-50 rounded-2xl animate-pulse flex items-center justify-center border border-gray-100">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-300 rounded-full mb-4 mx-auto animate-pulse"></div>
                        <div className="h-4 bg-gray-300 rounded-lg w-32 mx-auto mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-300 rounded w-24 mx-auto animate-pulse"></div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            </motion.section>

          {/* 주간 매출 테이블 */}
            <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {/* 헤더 - 항상 표시 */}
              <motion.div 
              onClick={toggleWeeklySales}
                className="flex items-center justify-between p-6 bg-gray-50/50 cursor-pointer hover:bg-gray-100/50 transition-all duration-200 group"
                whileHover={{ backgroundColor: 'rgb(249 250 251 / 0.8)' }}
            >
              <div className="flex items-center">
                  <div className="w-1 h-7 bg-indigo-500 rounded-full mr-4"></div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                  주간 매출 상세
                  {dateRange.startDate && dateRange.endDate && (
                      <span className="ml-3 px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full">
                        필터 적용됨
                    </span>
                  )}
                </h2>
              </div>
              
              <motion.div
                animate={{ rotate: isWeeklySalesMinimized ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                  className="p-1 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
              </motion.div>

            {/* 테이블 내용 - 확장 시에만 표시 */}
            <motion.div
              initial={false}
              animate={{ 
                height: isWeeklySalesMinimized ? 0 : 'auto',
                opacity: isWeeklySalesMinimized ? 0 : 1 
              }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-6">
                {filteredDailyData.length > 0 && !isLoading ? (
                  <ConcertWeeklySalesTable 
                    dailyData={filteredDailyData} 
                    weeklyData={filteredWeeklyData} 
                  />
                ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-4xl mb-4">📊</div>
                      <p className="text-gray-500 font-medium">주간 매출 데이터가 없습니다.</p>
                      <p className="text-gray-400 text-sm mt-2">콘서트를 선택하고 데이터를 확인해주세요.</p>
                  </div>
                )}
              </div>
            </motion.div>
            </motion.section>
        </>
      )}

      {/* API 데이터 뷰어 */}
      {showDataViewer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
        >
          <ApiDataViewer
            responses={{
              'BEP 분석': {
                endpoint: '/api/concert/bep',
                status: responses.bep.status === 'idle' ? 'loading' : responses.bep.status,
                data: responses.bep.data,
                error: responses.bep.error || undefined,
                timestamp: new Date().toISOString(),
                url: '/api/concert/bep',
              },
              '일간 매출': {
                endpoint: '/api/concert/daily',
                status: responses.daily.status === 'idle' ? 'loading' : responses.daily.status,
                data: responses.daily.data,
                error: responses.daily.error || undefined,
                timestamp: new Date().toISOString(),
                url: '/api/concert/daily',
              },
              '주간 노트 (세일즈/마케팅/기타)': {
                endpoint: '/api/concert/weekly',
                status: responses.weekly.status === 'idle' ? 'loading' : responses.weekly.status,
                data: responses.weekly.data,
                error: responses.weekly.error || undefined,
                timestamp: new Date().toISOString(),
                url: '/api/concert/weekly',
              },
            }}
          />
        </motion.div>
      )}
      </div>
    </div>
  );
} 