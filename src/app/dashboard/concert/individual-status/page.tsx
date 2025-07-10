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

  // 필터 적용 로딩 상태
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // 모든 환경에서 데이터 뷰어 표시
  const showDataViewer = true;

  // 전체 페이지 에러 상태 체크 (모든 API가 실패한 경우)
  const allApisFailure = Object.keys(responses).length > 0 && 
    Object.values(responses).every(r => r.status === 'error');

  // 콘서트 목록 추출 (Daily 데이터에서)
  const concertOptions = useMemo(() => {
    if (!responses.daily.data) return [];
    
    const uniqueConcerts = responses.daily.data.reduce((acc, item) => {
      if (!acc.find(c => c.liveId === item.liveId)) {
        acc.push({
          liveId: item.liveId,
          liveName: item.liveName
        });
      }
      return acc;
    }, [] as { liveId: string; liveName: string }[]);

    return uniqueConcerts.map(concert => ({
      value: concert.liveId,
      label: concert.liveName
    }));
  }, [responses.daily.data]);

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
      <div className="p-6">
        <ErrorView
          title="콘서트 개별 현황 데이터 로드 실패"
          message="모든 API 연결에 실패했습니다. 네트워크 상태를 확인해주세요."
          onRetry={retryAll}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* 페이지 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            콘서트 개별 현황
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
        <div className="flex items-center space-x-4">
          <UnifiedDateFilter
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onDateRangeChange={handleDateRangeChange}
            onReset={handleDateRangeReset}
            isLoading={isFilterLoading}
          />
          
          {hasErrors && (
            <button
              onClick={retryAll}
              className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm hover:bg-orange-200"
            >
              일부 데이터 로드 실패 - 재시도
            </button>
          )}
        </div>
      </motion.div>

      {/* 콘서트 선택 필터 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={isFilterLoading ? 'opacity-50 pointer-events-none' : ''}
      >
        <Select
          value={selectedConcert}
          onValueChange={setSelectedConcert}
          options={concertOptions}
          placeholder="콘서트 선택"
        />
      </motion.div>

      {/* 콘서트 미선택 시 안내 메시지 */}
      {!selectedConcert && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center"
        >
          <div className="text-blue-600 mb-2">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">콘서트를 선택해주세요</h3>
          <p className="text-blue-700">
            위의 드롭다운에서 분석하고 싶은 콘서트를 선택하면 해당 콘서트의 상세 현황을 확인할 수 있습니다.
          </p>
        </motion.div>
      )}

      {/* 선택된 콘서트가 있을 때만 데이터 표시 */}
      {selectedConcert && (
        <>
          {/* 수익성 추정 테이블 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`bg-white rounded-xl shadow-lg p-6 ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <span className="inline-block w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
              수익성 추정
            </h2>
            {filteredBepData.length > 0 && !isLoading ? (
              <ConcertProfitabilityTable data={filteredBepData} />
            ) : (
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
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
          </motion.div>

          {/* 일간 매출 그래프 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`bg-white rounded-xl shadow-lg p-6 ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <span className="inline-block w-1 h-6 bg-pink-500 rounded-full mr-3"></span>
                일간 매출
                {dateRange.startDate && dateRange.endDate && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (필터 적용됨)
                  </span>
                )}
              </h2>
            </div>
            {filteredDailyData.length > 0 && !isLoading ? (
              <ConcertDailySalesChart data={filteredDailyData} />
            ) : (
              <div className="w-full h-[400px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mb-4 mx-auto animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-32 mx-auto mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-300 rounded w-24 mx-auto animate-pulse"></div>
                </div>
              </div>
            )}
          </motion.div>

          {/* 일간 판매 매수 그래프 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`bg-white rounded-xl shadow-lg p-6 ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <span className="inline-block w-1 h-6 bg-indigo-500 rounded-full mr-3"></span>
                일간 판매 매수
                {dateRange.startDate && dateRange.endDate && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (필터 적용됨)
                  </span>
                )}
              </h2>
            </div>
            {filteredDailyData.length > 0 && !isLoading ? (
              <ConcertDailyTicketsChart data={filteredDailyData} />
            ) : (
              <div className="w-full h-[400px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mb-4 mx-auto animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded w-32 mx-auto mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-300 rounded w-24 mx-auto animate-pulse"></div>
                </div>
              </div>
            )}
          </motion.div>

          {/* 주간 매출 테이블 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className={`bg-white rounded-xl shadow-lg p-6 ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <span className="inline-block w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
              주간 매출 상세
              {dateRange.startDate && dateRange.endDate && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (필터 적용됨)
                </span>
              )}
            </h2>
            {filteredWeeklyData.length > 0 && !isLoading ? (
              <ConcertWeeklySalesTable data={filteredWeeklyData} />
            ) : isLoading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>주간 매출 데이터가 없습니다.</p>
                {responses.weekly.status === 'error' && (
                  <p className="text-sm mt-1 text-red-500">
                    API 호출 실패: {responses.weekly.error}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* API 데이터 뷰어 */}
      {showDataViewer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
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
              '주간 매출': {
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
  );
} 