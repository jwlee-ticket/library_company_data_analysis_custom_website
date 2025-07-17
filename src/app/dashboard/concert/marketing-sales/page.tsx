'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import MarketingSalesChart from '@/components/dashboard/concert/MarketingSalesChart';
import MarketingCalendar from '@/components/dashboard/concert/MarketingCalendar';
import MarketingFilters from '@/components/dashboard/concert/MarketingFilters';
import ApiDataViewer from '@/components/debug/ApiDataViewer';
import ErrorView from '@/components/ui/ErrorView';
import { useConcertApi } from '@/hooks/useConcertApi';
import { ConcertMarketingCalendar, ConcertWeeklyData, ConcertMonthlyData } from '@/lib/api';

export default function ConcertMarketingSalesPage() {
  // API 훅 사용
  const { responses, isLoading, hasErrors, retryAll } = useConcertApi();
  
  // 필터 상태
  const [filters, setFilters] = useState({
    selectedConcert: '',
    startDate: '',
    endDate: ''
  });

  // 캘린더 상태
  const [selectedMonth, setSelectedMonth] = useState(new Date(2025, 3, 1)); // 2025년 4월

  // 클라이언트 측 시간 표시를 위한 상태
  const [currentTime, setCurrentTime] = useState<string>('');
  
  // 클라이언트에서만 시간 설정 (Hydration 오류 방지)
  useEffect(() => {
    setCurrentTime(new Date().toLocaleString('ko-KR'));
  }, []);

  // API 데이터 접근
  const marketingData = responses.marketingCalendar?.data as ConcertMarketingCalendar[] || [];
  const weeklyData = responses.weekly?.data as ConcertWeeklyData[] || [];
  const monthlyData = responses.monthly?.data as ConcertMonthlyData[] || [];

  // 필터 조건 검증 함수
  const isFiltersComplete = () => {
    return filters.selectedConcert !== '' && filters.startDate !== '' && filters.endDate !== '';
  };

  // 콘서트 목록 추출
  const availableConcerts = useMemo(() => {
    const concertSet = new Set<string>();
    
    marketingData.forEach(item => {
      if (item.liveName) concertSet.add(item.liveName);
    });
    
    weeklyData.forEach(item => {
      if (item.liveName) concertSet.add(item.liveName);
    });
    
    return Array.from(concertSet).map(name => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name
    }));
  }, [marketingData, weeklyData]);

  // 필터 핸들러
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    console.log('필터 적용:', newFilters);
  };

  // 캘린더 월 변경 핸들러
  const handleMonthChange = (date: Date) => {
    setSelectedMonth(date);
  };

  // 차트 데이터 변환 함수
  const transformToChartData = useMemo(() => {
    if (!weeklyData || weeklyData.length === 0) return [];

    // 필터가 완전하지 않으면 빈 배열 반환
    if (!isFiltersComplete()) return [];

    // 필터링된 주간 데이터
    const filteredWeeklyData = weeklyData.filter(item => {
      // 콘서트 필터
      if (filters.selectedConcert && item.liveName !== filters.selectedConcert) {
        return false;
      }
      
      // 날짜 필터 (recordWeek 기준)
      const itemDate = new Date(item.recordWeek);
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      
      return itemDate >= startDate && itemDate <= endDate;
    });

    // 날짜별로 그룹화 및 차트 데이터 생성
    const dateMap = new Map<string, any>();
    
    filteredWeeklyData.forEach(item => {
      const dateKey = item.recordWeek;
      
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, {
          date: dateKey,
          dailySales: 0,
          cumulativeSales: 0,
          lastYearComparison: 0,
          marketingEvents: 0,
          isIncreasing: false,
        });
      }
      
      const existing = dateMap.get(dateKey);
      existing.dailySales += item.weeklySalesAmount;
      existing.cumulativeSales += item.weeklySalesAmount;
      
      // 마케팅 이벤트 카운트
      if (item.noteSalesMarketing || item.notePromotion) {
        existing.marketingEvents += 1;
      }
    });

    return Array.from(dateMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [weeklyData, filters]);

  // 마케팅 이벤트 데이터 변환 함수
  const transformMarketingEvents = useMemo(() => {
    if (!marketingData || marketingData.length === 0) return [];

    // 필터가 완전하지 않으면 빈 배열 반환
    if (!isFiltersComplete()) return [];

    return marketingData
      .filter(item => {
        // 필터 적용
        if (filters.selectedConcert && item.liveName !== filters.selectedConcert) {
          return false;
        }
        return true;
      })
      .map((item, index) => {
        const hasMarketing = item.salesMarketing && item.salesMarketing.trim();
        const hasPromotion = item.promotion && item.promotion.trim();
        
        let title = '';
        let type: 'discount' | 'promotion' | 'collaboration' | 'special' = 'promotion';
        let color = 'blue';
        
        if (hasMarketing && hasPromotion) {
          title = `${item.salesMarketing} / ${item.promotion}`;
          type = 'special';
          color = 'purple';
        } else if (hasMarketing) {
          title = item.salesMarketing || '';
          type = 'collaboration';
          color = 'green';
        } else if (hasPromotion) {
          title = item.promotion || '';
          type = (item.promotion && item.promotion.includes('할인')) ? 'discount' : 'promotion';
          color = (item.promotion && item.promotion.includes('할인')) ? 'orange' : 'blue';
        } else {
          return null;
        }

        return {
          id: `${item.liveName}-${item.weekStartDate}-${index}`,
          title,
          startDate: item.weekStartDate,
          endDate: item.weekEndDate,
          color,
          type
        };
      })
      .filter(Boolean) as any[];
  }, [marketingData, filters]);

  // 전체 페이지 에러 상태 체크
  const allApisFailure = Object.keys(responses).length > 0 && 
    Object.values(responses).every(r => r.status === 'error');

  // 전체 페이지 에러 화면
  if (allApisFailure) {
    return (
      <div className="min-h-screen bg-gray-50/30">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto mt-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              콘서트 마케팅 & 매출 분석
            </h1>
            
            {/* API 응답 데이터 뷰어 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <ApiDataViewer responses={responses} />
            </motion.div>
            
            <ErrorView
              title="마케팅 데이터를 불러올 수 없습니다"
              message="모든 API 서버 연결에 실패했습니다. 네트워크 상태와 서버 상태를 확인해주세요."
              onRetry={retryAll}
              showRetry={true}
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
                콘서트 마케팅 & 매출 분석
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <p className="text-gray-600">
                  최근 업데이트: {currentTime || '로딩 중...'}
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
        </motion.div>

        {/* API 응답 데이터 뷰어 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <ApiDataViewer responses={responses} />
        </motion.div>

        {/* 필터 섹션 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-1 h-7 bg-purple-500 rounded-full mr-4"></div>
              <h2 className="text-xl font-bold text-gray-900">분석 필터</h2>
              <span className="ml-3 px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-full">
                데이터 조건 설정
              </span>
            </div>
          </div>
          <div className="p-6">
            <MarketingFilters
              concerts={availableConcerts}
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>
        </motion.section>

        {/* 마케팅 매출 차트 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-1 h-7 bg-blue-500 rounded-full mr-4"></div>
              <h2 className="text-xl font-bold text-gray-900">매출 & 마케팅 분석</h2>
              <span className="ml-3 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                통합 차트
              </span>
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="w-full h-[400px] bg-gray-50 rounded-2xl animate-pulse flex items-center justify-center border border-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mb-4 mx-auto animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded-lg w-32 mx-auto mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-300 rounded w-24 mx-auto animate-pulse"></div>
                </div>
              </div>
            ) : !isFiltersComplete() ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                </div>
                <p className="text-gray-700 font-medium mb-2">분석할 조건을 선택해주세요</p>
                <p className="text-gray-500 text-sm">공연, 시작일, 종료일을 모두 설정하면 매출 데이터를 확인할 수 있습니다.</p>
              </div>
            ) : transformToChartData.length > 0 ? (
              <MarketingSalesChart
                data={transformToChartData}
                selectedConcert={filters.selectedConcert}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 font-medium">선택된 조건에 해당하는 매출 데이터가 없습니다.</p>
                <p className="text-gray-400 text-sm mt-2">필터 조건을 조정해보세요.</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* 마케팅 캘린더 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-1 h-7 bg-green-500 rounded-full mr-4"></div>
              <h2 className="text-xl font-bold text-gray-900">마케팅 캘린더</h2>
              <span className="ml-3 px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                일정 관리
              </span>
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="w-full h-[500px] bg-gray-50 rounded-2xl animate-pulse flex items-center justify-center border border-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mb-4 mx-auto animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded-lg w-32 mx-auto mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-300 rounded w-24 mx-auto animate-pulse"></div>
                </div>
              </div>
            ) : !isFiltersComplete() ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                </div>
                <p className="text-gray-700 font-medium mb-2">마케팅 일정을 확인하려면 필터를 설정해주세요</p>
                <p className="text-gray-500 text-sm">공연과 날짜를 선택하면 마케팅 캘린더를 확인할 수 있습니다.</p>
              </div>
            ) : (
              <MarketingCalendar
                events={transformMarketingEvents}
                selectedMonth={selectedMonth}
                onMonthChange={handleMonthChange}
              />
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
} 