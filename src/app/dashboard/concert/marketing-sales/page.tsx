'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import MarketingSalesChart from '@/components/dashboard/concert/MarketingSalesChart';
import MarketingCalendar from '@/components/dashboard/concert/MarketingCalendar';
import MarketingFilters from '@/components/dashboard/concert/MarketingFilters';
import ApiDataViewer from '@/components/debug/ApiDataViewer';
import ErrorView from '@/components/ui/ErrorView';
import { useConcertApi } from '@/hooks/useConcertApi';
import { ConcertMarketingCalendar, ConcertWeeklyData, ConcertMonthlyData, ConcertDailyData } from '@/lib/api';

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
  const dailyData = responses.daily?.data as ConcertDailyData[] || [];
  const monthlyData = responses.monthly?.data as ConcertMonthlyData[] || [];

  // 디버깅 로그 추가
  console.log('API 응답 상태:', {
    marketingCalendar: responses.marketingCalendar?.status,
    weekly: responses.weekly?.status,
    daily: responses.daily?.status,
    monthly: responses.monthly?.status
  });
  console.log('실제 데이터:', {
    marketingData: marketingData.length,
    weeklyData: weeklyData.length,
    dailyData: dailyData.length,
    monthlyData: monthlyData.length
  });

  // 개발용 더미 데이터 (API 데이터가 없을 때만 사용)
  const dummyMarketingData: ConcertMarketingCalendar[] = (marketingData.length === 0 && process.env.NODE_ENV === 'development') ? [
    {
      liveName: "테스트 콘서트 A",
      weekStartDate: "2025-01-13",
      weekEndDate: "2025-01-19", 
      salesMarketing: "인터파크 할인 이벤트",
      promotion: "30% 할인",
      etc: null
    },
    {
      liveName: "테스트 콘서트 A",
      weekStartDate: "2025-01-20",
      weekEndDate: "2025-01-26",
      salesMarketing: null,
      promotion: "얼리버드 특가",
      etc: "프리뷰 공연"
    }
  ] : [];

  const dummyDailyData: ConcertDailyData[] = (dailyData.length === 0 && process.env.NODE_ENV === 'development') ? [
    {
      liveId: "test-001",
      liveName: "테스트 콘서트 A",
      recordDate: "2025-01-13",
      recordMonth: "2025-01",
      recordWeek: "2025-01-13",
      dailySalesTicketNo: 50,
      dailySalesAmount: 15000000
    },
    {
      liveId: "test-001", 
      liveName: "테스트 콘서트 A",
      recordDate: "2025-01-14",
      recordMonth: "2025-01",
      recordWeek: "2025-01-13",
      dailySalesTicketNo: 75,
      dailySalesAmount: 22500000
    },
    {
      liveId: "test-001",
      liveName: "테스트 콘서트 A", 
      recordDate: "2025-01-15",
      recordMonth: "2025-01",
      recordWeek: "2025-01-13",
      dailySalesTicketNo: 30,
      dailySalesAmount: 9000000
    },
    {
      liveId: "test-001",
      liveName: "테스트 콘서트 A",
      recordDate: "2025-01-16", 
      recordMonth: "2025-01",
      recordWeek: "2025-01-13",
      dailySalesTicketNo: 60,
      dailySalesAmount: 18000000
    },
    {
      liveId: "test-001",
      liveName: "테스트 콘서트 A",
      recordDate: "2025-01-17",
      recordMonth: "2025-01", 
      recordWeek: "2025-01-13",
      dailySalesTicketNo: 40,
      dailySalesAmount: 12000000
    }
  ] : [];

  const dummyWeeklyData: ConcertWeeklyData[] = (weeklyData.length === 0 && process.env.NODE_ENV === 'development') ? [
    {
      liveId: "test-001",
      liveName: "테스트 콘서트 A", 
      recordWeek: "2025-01-13",
      weeklySalesTicketNo: 150,
      weeklySalesAmount: 45000000,
      noteSalesMarketing: "인터파크 할인 이벤트",
      notePromotion: "30% 할인",
      noteEtc: null
    },
    {
      liveId: "test-001",
      liveName: "테스트 콘서트 A",
      recordWeek: "2025-01-20", 
      weeklySalesTicketNo: 200,
      weeklySalesAmount: 60000000,
      noteSalesMarketing: null,
      notePromotion: "얼리버드 특가",
      noteEtc: "프리뷰 공연"
    }
  ] : [];

  // 실제 데이터 우선, 없으면 더미 데이터 사용
  const finalMarketingData = marketingData.length > 0 ? marketingData : dummyMarketingData;
  const finalDailyData = dailyData.length > 0 ? dailyData : dummyDailyData;
  const finalWeeklyData = weeklyData.length > 0 ? weeklyData : dummyWeeklyData;

  // 필터 조건 검증 함수
  const isFiltersComplete = () => {
    return filters.selectedConcert !== '' && filters.startDate !== '' && filters.endDate !== '';
  };

  // 콘서트 목록 추출
  const availableConcerts = useMemo(() => {
    const concertSet = new Set<string>();
    
    finalMarketingData.forEach(item => {
      if (item.liveName) concertSet.add(item.liveName);
    });
    
    finalDailyData.forEach(item => {
      if (item.liveName) concertSet.add(item.liveName);
    });
    
    finalWeeklyData.forEach(item => {
      if (item.liveName) concertSet.add(item.liveName);
    });
    
    const concerts = Array.from(concertSet).map(name => ({
      id: name, // ID를 원본 이름 그대로 사용
      name
    }));
    
    console.log('추출된 콘서트 목록:', concerts);
    return concerts;
  }, [finalMarketingData, finalDailyData, finalWeeklyData]);

  // 필터 핸들러
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    console.log('필터 적용:', newFilters);
  };

  // 캘린더 월 변경 핸들러
  const handleMonthChange = (date: Date) => {
    setSelectedMonth(date);
  };

  // 차트 데이터 변환 함수 수정
  const transformToChartData = useMemo(() => {
    if (!finalDailyData || finalDailyData.length === 0) return [];

    // 필터가 완전하지 않으면 빈 배열 반환
    if (!isFiltersComplete()) return [];

    // 필터링된 일별 데이터
    const filteredDailyData = finalDailyData.filter(item => {
      // 콘서트 필터 (이제 원본 이름으로 비교)
      if (filters.selectedConcert && item.liveName !== filters.selectedConcert) {
        return false;
      }
      
      // 날짜 필터 (recordDate 기준)
      const itemDate = new Date(item.recordDate);
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      
      return itemDate >= startDate && itemDate <= endDate;
    });

    console.log('필터링된 일별 데이터:', filteredDailyData);

    // 주간 데이터에서 마케팅 정보 매핑 생성
    const marketingInfoMap = new Map<string, number>();
    finalWeeklyData.forEach(weekItem => {
      if (filters.selectedConcert && weekItem.liveName !== filters.selectedConcert) {
        return;
      }
      
      const weekStart = new Date(weekItem.recordWeek);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      // 이 주에 해당하는 모든 날짜에 마케팅 이벤트 정보 추가
      for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        const hasMarketingNote = weekItem.noteSalesMarketing && weekItem.noteSalesMarketing.trim();
        const hasPromotionNote = weekItem.notePromotion && weekItem.notePromotion.trim();
        const hasEtcNote = weekItem.noteEtc && weekItem.noteEtc.trim();
        
        const eventCount = (hasMarketingNote ? 1 : 0) + (hasPromotionNote ? 1 : 0) + (hasEtcNote ? 1 : 0);
        marketingInfoMap.set(dateKey, eventCount);
      }
    });

    // 일별 데이터를 차트 데이터로 변환
    const result = filteredDailyData.map(dayItem => {
      const dateKey = dayItem.recordDate;
      const marketingEvents = marketingInfoMap.get(dateKey) || 0;
      
      return {
        date: dateKey,
        dailySales: dayItem.dailySalesAmount,
        cumulativeSales: dayItem.dailySalesAmount,
        lastYearComparison: 0,
        marketingEvents: marketingEvents,
        isIncreasing: false,
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log('변환된 차트 데이터:', result);
    
    return result;
  }, [finalDailyData, finalWeeklyData, filters]);

  // 마케팅 이벤트 데이터 변환 함수
  const transformMarketingEvents = useMemo(() => {
    if (!finalMarketingData || finalMarketingData.length === 0) return [];

    // 필터가 완전하지 않으면 빈 배열 반환
    if (!isFiltersComplete()) return [];

    const result = finalMarketingData
      .filter(item => {
        // 필터 적용
        if (filters.selectedConcert && item.liveName !== filters.selectedConcert) {
          return false;
        }
        
        // 날짜 필터 적용 (weekStartDate 기준)
        const weekStart = new Date(item.weekStartDate);
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        
        return weekStart >= startDate && weekStart <= endDate;
      })
      .map((item, index) => {
        // ConcertMarketingCalendar 타입에 맞는 필드명 사용
        const hasMarketing = item.salesMarketing && item.salesMarketing.trim();
        const hasPromotion = item.promotion && item.promotion.trim();
        const hasEtc = item.etc && item.etc.trim();
        
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
        } else if (hasEtc) {
          title = item.etc || '';
          type = 'special';
          color = 'gray';
        } else {
          return null; // 모든 필드가 비어있으면 제외
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

    console.log('변환된 마케팅 이벤트:', result);
    return result;
  }, [finalMarketingData, filters]);

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

        {/* 매출 & 마케팅 분석 */}
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
              {/* 데이터 소스 표시 */}
              {finalDailyData.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full">
                  {process.env.NODE_ENV === 'development' && dailyData.length === 0 ? '테스트 데이터' : 'API 데이터'}
                </span>
              )}
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
                {availableConcerts.length === 0 && (
                  <p className="text-orange-500 text-sm mt-2">⚠️ 현재 사용 가능한 콘서트 데이터가 없습니다.</p>
                )}
              </div>
            ) : transformToChartData.length > 0 ? (
              <MarketingSalesChart
                data={transformToChartData}
                selectedConcert={filters.selectedConcert}
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-4 h-4 bg-orange-500 rounded-sm"></div>
                </div>
                <p className="text-gray-700 font-medium mb-2">선택된 조건에 해당하는 데이터가 없습니다</p>
                <p className="text-gray-500 text-sm mb-4">다른 날짜 범위나 콘서트를 선택해보세요.</p>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• 선택된 콘서트: {filters.selectedConcert}</p>
                  <p>• 기간: {filters.startDate} ~ {filters.endDate}</p>
                  <p>• 사용 가능한 콘서트: {availableConcerts.map(c => c.name).join(', ')}</p>
                </div>
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
              {/* 데이터 소스 표시 */}
              {finalMarketingData.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full">
                  {process.env.NODE_ENV === 'development' && marketingData.length === 0 ? '테스트 데이터' : 'API 데이터'}
                </span>
              )}
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
                {availableConcerts.length === 0 && (
                  <p className="text-orange-500 text-sm mt-2">⚠️ 현재 사용 가능한 마케팅 데이터가 없습니다.</p>
                )}
              </div>
            ) : transformMarketingEvents.length > 0 ? (
              <MarketingCalendar
                events={transformMarketingEvents}
                selectedMonth={selectedMonth}
                onMonthChange={handleMonthChange}
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-4 h-4 bg-orange-500 rounded-sm"></div>
                </div>
                <p className="text-gray-700 font-medium mb-2">선택된 기간에 마케팅 이벤트가 없습니다</p>
                <p className="text-gray-500 text-sm mb-4">다른 날짜 범위를 선택해보세요.</p>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>• 선택된 콘서트: {filters.selectedConcert}</p>
                  <p>• 기간: {filters.startDate} ~ {filters.endDate}</p>
                  <p>• 마케팅 데이터 개수: {finalMarketingData.length}개</p>
                </div>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
} 