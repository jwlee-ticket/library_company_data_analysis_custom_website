'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { IoStatsChart } from 'react-icons/io5';

const WeeklyTicketsChart = dynamic(() => import('@/components/dashboard/WeeklyTicketsChart'), {
  ssr: false,
  loading: () => <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-center justify-center">
    <div className="flex items-center space-x-3">
      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-gray-600 font-medium">차트를 로딩 중...</span>
    </div>
  </div>
});

import TheaterTicketsTable from '@/components/dashboard/TheaterTicketsTable';
import ApiDataViewer from '@/components/debug/ApiDataViewer';
import ErrorView from '@/components/ui/ErrorView';
import UnifiedDateFilter from '@/components/ui/UnifiedDateFilter';

interface OccupancyRateData {
  liveId: string;
  liveName: string;
  weekStartDate: string;
  weekEndDate: string;
  paidSharePercentage: number;
  weeklyShowCount: number;
}

interface AllShowtimeData {
  liveId: string;
  liveName: string;
  paidSeatTot: number;
  inviteSeatTot: number;
  showDateTime: string;
  cast: string;
}

interface WeeklyTicketData {
  week: string;
  soldTickets: number;
  maxTickets: number;
}

interface PerformanceData {
  id: string;
  title: string;
  weeklyData: WeeklyTicketData[];
}

export default function PlayWeeklyTicketsPage() {
  // 상태 관리
  const [occupancyData, setOccupancyData] = useState<OccupancyRateData[]>([]);
  const [showtimeData, setShowtimeData] = useState<AllShowtimeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  // 통합 날짜 범위 상태
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  // 필터 적용 로딩 상태
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // 변환된 데이터
  const [performancesData, setPerformancesData] = useState<PerformanceData[]>([]);
  const [selectedPerformance, setSelectedPerformance] = useState<PerformanceData | null>(null);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  // 안전한 숫자 변환 함수
  const toNumber = (value: any): number => {
    if (typeof value === 'number') return Math.floor(value);
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : Math.floor(parsed);
    }
    return 0;
  };

  // API 데이터 로딩
  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [occupancyResponse, showtimeResponse] = await Promise.all([
        fetch('/api/play/occupancy-rate'),
        fetch('/api/play/all-showtime')
      ]);

      if (!occupancyResponse.ok || !showtimeResponse.ok) {
        throw new Error('API 응답 오류');
      }

      const occupancyResult = await occupancyResponse.json();
      const showtimeResult = await showtimeResponse.json();

      setOccupancyData(occupancyResult);
      setShowtimeData(showtimeResult);

      // 데이터 변환
      transformData(occupancyResult, showtimeResult);

    } catch (err) {
      console.error('데이터 로딩 실패:', err);
      setError(err instanceof Error ? err.message : '데이터 로딩에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // 데이터 변환 로직
  const transformData = (occupancy: OccupancyRateData[], showtime: AllShowtimeData[]) => {
    // 공연별로 총 좌석 수 계산
    const seatsByPerformance = new Map<string, number>();
    
    showtime.forEach(show => {
      const liveId = show.liveId;
      const totalSeats = toNumber(show.paidSeatTot) + toNumber(show.inviteSeatTot);
      
      if (!seatsByPerformance.has(liveId) || seatsByPerformance.get(liveId)! < totalSeats) {
        seatsByPerformance.set(liveId, totalSeats);
      }
    });

    // 공연별 주간 데이터 그룹핑
    const performanceGroups = new Map<string, {name: string, weeks: Map<string, OccupancyRateData>}>();
    
         occupancy.forEach(item => {
       const liveId = item.liveId;
       const liveName = item.liveName;
       const weekKey = item.weekStartDate; // 시작 날짜만 사용
       
       if (!performanceGroups.has(liveId)) {
         performanceGroups.set(liveId, {name: liveName, weeks: new Map()});
       }
       
       performanceGroups.get(liveId)!.weeks.set(weekKey, item);
     });

    // PerformanceData 형태로 변환
    const transformedData: PerformanceData[] = [];
    
    performanceGroups.forEach((group, liveId) => {
      const totalSeats = seatsByPerformance.get(liveId) || 0;
      
      if (totalSeats > 0) {
        const weeklyData: WeeklyTicketData[] = [];
        
        group.weeks.forEach((weekData, weekKey) => {
          const paidSharePercentage = toNumber(weekData.paidSharePercentage);
          const soldTickets = Math.floor(totalSeats * (paidSharePercentage / 100));
          
          weeklyData.push({
            week: weekKey,
            soldTickets: soldTickets,
            maxTickets: totalSeats
          });
        });

        // 주간별로 정렬
        weeklyData.sort((a, b) => a.week.localeCompare(b.week));

        transformedData.push({
          id: liveId,
          title: group.name,
          weeklyData: weeklyData
        });
      }
    });

    setPerformancesData(transformedData);
    
    // 첫 번째 공연을 기본 선택
    if (transformedData.length > 0) {
      setSelectedPerformance(transformedData[0]);
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    loadData();
  }, []);

  // 데이터 재시도
  const handleRetry = () => {
    loadData();
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

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/30">
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between"
          >
            <h1 className="text-3xl font-bold text-gray-900">
              연극 & 뮤지컬 - 주간별 티켓 판매
            </h1>
          </motion.div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-6 bg-gray-200 rounded-lg w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/30">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              연극 & 뮤지컬 - 주간별 티켓 판매
            </h1>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8">
            <ErrorView 
              message={error}
              onRetry={handleRetry}
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
                연극 & 뮤지컬 - 주간별 티켓 판매
              </h1>
              <p className="text-gray-600">
                주간별 티켓 판매 현황 및 공연별 상세 분석을 확인하세요
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
              'occupancyRate': {
                endpoint: '/api/play/occupancy-rate',
                status: 'success',
                data: occupancyData,
                timestamp: new Date().toISOString()
              },
              'allShowtime': {
                endpoint: '/api/play/all-showtime', 
                status: 'success',
                data: showtimeData,
                timestamp: new Date().toISOString()
              }
            }}
          />
        </motion.div>

        {/* 공연별 티켓 판매 테이블 */}
        {performancesData.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className={`transition-all duration-300 ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="flex items-center mb-6">
              <div className="w-1 h-7 bg-blue-500 rounded-full mr-4"></div>
              <h2 className="text-xl font-bold text-gray-900">공연별 티켓 판매 현황</h2>
              <span className="ml-3 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                {performancesData.length}개 공연
              </span>
            </div>
            <TheaterTicketsTable performances={performancesData} />
          </motion.section>
        )}
        
        {/* 공연 선택 및 차트 */}
        {selectedPerformance && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 ${isFilterLoading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center mb-6">
                <div className="w-1 h-7 bg-purple-500 rounded-full mr-4"></div>
                <h2 className="text-xl font-bold text-gray-900">공연별 상세 분석</h2>
                <span className="ml-3 px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-full">
                  인터랙티브 차트
                </span>
              </div>
              
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <IoStatsChart className="w-4 h-4 mr-2 text-purple-500" />
                  분석할 공연 선택
                </label>
                <motion.button
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="relative w-full bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-left
                           shadow-sm transition-all duration-200 ease-in-out
                           hover:border-purple-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-20"
                >
                  <span className="block truncate text-gray-900 font-medium">{selectedPerformance.title}</span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <motion.svg
                      animate={{ rotate: isSelectOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="h-5 w-5 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </span>
                </motion.button>

                {/* Dropdown Menu */}
                {isSelectOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                  >
                    <div className="py-1 max-h-60 overflow-auto">
                      {performancesData.map((performance) => (
                        <motion.button
                          key={performance.id}
                          onClick={() => {
                            setSelectedPerformance(performance);
                            setIsSelectOpen(false);
                          }}
                          whileHover={{ backgroundColor: 'rgb(249 250 251)' }}
                          className={`
                            w-full text-left px-4 py-3 text-sm
                            transition-all duration-150 ease-in-out
                            ${selectedPerformance.id === performance.id
                              ? 'bg-purple-50 text-purple-700 font-semibold border-r-4 border-purple-500'
                              : 'text-gray-900 hover:bg-gray-50'
                            }
                          `}
                        >
                          {performance.title}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="p-6">
              <WeeklyTicketsChart selectedPerformance={selectedPerformance} />
            </div>
          </motion.section>
        )}

        {/* 데이터가 없는 경우 */}
        {performancesData.length === 0 && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
          >
            <div className="text-gray-500 space-y-2">
              <p className="text-lg font-medium">주간별 티켓 데이터가 없습니다.</p>
              <p className="text-sm">데이터가 로드되면 여기에 표시됩니다.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 