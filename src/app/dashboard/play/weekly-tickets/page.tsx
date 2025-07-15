'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { IoStatsChart } from 'react-icons/io5';

const WeeklyTicketsChart = dynamic(() => import('@/components/dashboard/WeeklyTicketsChart'), {
  ssr: false,
  loading: () => <div className="bg-white rounded-lg p-8 flex items-center justify-center">
    <div className="text-gray-500">차트를 로딩 중...</div>
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
      const weekKey = `${item.weekStartDate} ~ ${item.weekEndDate}`;
      
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

  // 로딩 중
  if (isLoading) {
    return (
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            연극 & 뮤지컬 - 통합 주간별 티켓 매수
          </h1>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            연극 & 뮤지컬 - 통합 주간별 티켓 매수
          </h1>
        </div>
        
        <ErrorView 
          message={error}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-8"
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          연극 & 뮤지컬 - 통합 주간별 티켓 매수
        </h1>
        <div className="text-sm text-gray-500">
          최근 업데이트: {new Date().toLocaleDateString('ko-KR')}
        </div>
      </div>

            {/* API 응답 데이터 뷰어 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
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

      {/* 데이터가 있는 경우만 테이블 표시 */}
      {performancesData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <TheaterTicketsTable performances={performancesData} />
        </motion.div>
      )}
      
      {/* 공연 선택 및 차트 */}
      {selectedPerformance && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <IoStatsChart className="w-4 h-4 mr-2 text-blue-500" />
              공연 상세 분석
            </label>
            <div className="relative">
              <button
                onClick={() => setIsSelectOpen(!isSelectOpen)}
                className="relative w-full bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-left
                         shadow-sm transition duration-200 ease-in-out
                         hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
              >
                <span className="block truncate text-gray-900">{selectedPerformance.title}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <motion.svg
                    animate={{ rotate: isSelectOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-4 w-4 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </span>
              </button>

              {/* Dropdown Menu */}
              {isSelectOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
                >
                  <div className="py-1 max-h-60 overflow-auto">
                    {performancesData.map((performance) => (
                      <button
                        key={performance.id}
                        onClick={() => {
                          setSelectedPerformance(performance);
                          setIsSelectOpen(false);
                        }}
                        className={`
                          w-full text-left px-4 py-2.5 text-sm
                          transition duration-150 ease-in-out
                          ${selectedPerformance.id === performance.id
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-900 hover:bg-gray-50'
                          }
                        `}
                      >
                        {performance.title}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <WeeklyTicketsChart selectedPerformance={selectedPerformance} />
        </motion.div>
      )}

      {/* 데이터가 없는 경우 */}
      {performancesData.length === 0 && !isLoading && !error && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-gray-500">
            주간별 티켓 데이터가 없습니다.
          </div>
        </div>
      )}
    </motion.div>
  );
} 