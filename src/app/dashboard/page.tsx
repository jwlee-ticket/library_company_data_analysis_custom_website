'use client';

import { motion } from 'framer-motion';
import { usePlayDashboardApi } from '@/hooks/usePlayDashboardApi';
import SalesCard from '@/components/dashboard/SalesCard';
import ErrorView from '@/components/ui/ErrorView';
import ApiDataViewer from '@/components/debug/ApiDataViewer';
import { IoMdArrowDropup, IoMdArrowDropdown, IoMdRefresh } from 'react-icons/io';
import { useState, useEffect } from 'react';

// Concert API 데이터 타입 정의
interface ConcertOverview {
  yesterdaySales: number;
  accumulatedSales: number;
  weeklySales: number;
  dailyAvgSales: number;
}

interface ConcertDaily {
  liveId: string;
  liveName: string;
  recordDate: Date;
  recordMonth: string;
  recordWeek: Date;
  dailySalesTicketNo: number;
  dailySalesAmount: number;
}

interface ConcertBepData {
  liveId: string;
  liveName: string;
  latestRecordDate: string;
  salesStartDate: string; // 판매 시작일
  salesEndDate: string; // 판매 종료일
  seatClass: string;
  seatOrder: number;
  totalSeats: number;
  soldSeats: number;
  remainingSeats: number;
  estAdditionalSales: string | number;
  estFinalRemaining: string | number;
  bepSeats: string;
  estSalesRatio: string;
  bepRatio: number;
}

interface PlayDailyDetails {
  id: number;
  liveId: string;
  liveName: string;
  latestRecordDate: Date;
  showTotalSeatNumber: number;
  dailySales: number;
  start_date: Date;
  end_date: Date;
  recordDate: Date;
  showDateTime: Date;
  cast: string;
  paidSeatSales: number;
  // ... 다른 필드들
}

// Concert API 호출 함수들
const fetchConcertOverview = async (): Promise<ConcertOverview> => {
  const response = await fetch('http://localhost:3001/concert/overview');
  if (!response.ok) throw new Error('Concert overview fetch failed');
  return response.json();
};

const fetchConcertDaily = async (): Promise<ConcertDaily[]> => {
  const response = await fetch('http://localhost:3001/concert/daily');
  if (!response.ok) throw new Error('Concert daily fetch failed');
  return response.json();
};

const fetchConcertBepData = async (): Promise<ConcertBepData[]> => {
  const response = await fetch('http://localhost:3001/concert/bep');
  if (!response.ok) throw new Error('Concert bep data fetch failed');
  return response.json();
};

const fetchPlayDailyDetails = async (): Promise<PlayDailyDetails[]> => {
  const response = await fetch('/api/play/daily-details');
  if (!response.ok) throw new Error('Play daily details fetch failed');
  return response.json();
};

interface PlaySalesTableProps {
  performances: Array<{
    genre: '콘서트' | '연극' | '뮤지컬';
    name: string;
    revenue: number;
    target: number;
    achievementRate: number;
    startDate?: string;
    endDate?: string;
  }>;
  playDetails?: PlayDailyDetails[];
  concertBepData?: ConcertBepData[];
}

function PlaySalesTable({ performances, playDetails, concertBepData }: PlaySalesTableProps) {
  const getGenreColor = (genre: string) => {
    switch (genre) {
      case '연극': return 'bg-blue-50 text-blue-700 border-blue-100';
      case '뮤지컬': return 'bg-purple-50 text-purple-700 border-purple-100';
      case '콘서트': return 'bg-green-50 text-green-700 border-green-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  // playDetails에서 실제 시작일/종료일 매칭
  const getPerformanceDates = (performanceName: string, genre: string) => {
    if (genre === '콘서트') {
      // 콘서트의 경우 BEP 데이터에서 정보 가져오기
      const matchedBepData = concertBepData?.find(bep => 
        bep.liveName.includes(performanceName) || performanceName.includes(bep.liveName)
      );
      
      if (matchedBepData) {
        const salesEndDate = matchedBepData.salesEndDate ? new Date(matchedBepData.salesEndDate).toLocaleDateString('ko-KR') : '미정';
        
        return {
          startDate: null, // 콘서트는 시작일 표시 안함
          endDate: salesEndDate, // 판매 종료일만 표시
          ticketSaleEndDate: null // 별도 판매 종료일 표시 안함
        };
      }
      
      return {
        startDate: null,
        endDate: '미정',
        ticketSaleEndDate: null
      };
    } else {
      // 연극/뮤지컬의 경우 기존 로직 사용
      const matchedDetail = playDetails?.find(detail => 
        detail.liveName.includes(performanceName) || performanceName.includes(detail.liveName)
      );
      
      const startDate = matchedDetail?.start_date ? new Date(matchedDetail.start_date).toLocaleDateString('ko-KR') : '미정';
      const endDate = matchedDetail?.end_date ? new Date(matchedDetail.end_date).toLocaleDateString('ko-KR') : '미정';
      
      return {
        startDate,
        endDate,
        ticketSaleEndDate: null // 연극/뮤지컬은 판매 종료일 별도 표시 안함
      };
    }
  };

  // 종료일 기준으로 정렬 (최신 종료일이 상단에)
  const sortedPerformances = [...performances].sort((a, b) => {
    const dateA = playDetails?.find(detail => detail.liveName.includes(a.name))?.end_date;
    const dateB = playDetails?.find(detail => detail.liveName.includes(b.name))?.end_date;
    
    const endDateA = dateA ? new Date(dateA) : new Date('1900-01-01');
    const endDateB = dateB ? new Date(dateB) : new Date('1900-01-01');
    
    return endDateB.getTime() - endDateA.getTime();
  });

  return (
    <div className="overflow-hidden">
      {/* 데스크톱 테이블 */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left p-5 font-semibold text-gray-700 text-sm">공연 정보</th>
              <th className="text-center p-5 font-semibold text-gray-700 text-sm">공연 기간</th>
              <th className="text-right p-5 font-semibold text-gray-700 text-sm">매출 현황</th>
              <th className="text-center p-5 font-semibold text-gray-700 text-sm">달성률</th>
            </tr>
          </thead>
          <tbody>
            {sortedPerformances.map((performance, index) => {
              const rate = Number(performance.achievementRate) || 0;
              const dates = getPerformanceDates(performance.name, performance.genre);

              return (
                <motion.tr
                  key={`${performance.genre}-${performance.name}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-all duration-200 group"
                >
                  {/* 공연 정보 */}
                  <td className="p-5">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-xl text-xs font-semibold border ${getGenreColor(performance.genre)}`}>
                          {performance.genre}
                        </span>
                        <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                          {performance.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 공연 기간 */}
                  <td className="p-5 text-center">
                    <div className="space-y-1">
                      {dates.startDate ? (
                        // 연극/뮤지컬: 시작일 ~ 종료일
                        <>
                          <div className="text-sm font-medium text-gray-900">
                            {dates.startDate}
                          </div>
                          <div className="text-xs text-gray-500">~</div>
                          <div className="text-sm font-medium text-gray-900">
                            {dates.endDate}
                          </div>
                        </>
                      ) : (
                        // 콘서트: 판매 종료일만
                        <div className="text-sm font-medium text-gray-900">
                          {dates.endDate}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* 매출 현황 */}
                  <td className="p-5 text-right">
                    <div className="space-y-1">
                      <div className="font-bold text-gray-900 text-base">
                        {new Intl.NumberFormat('ko-KR').format(Number(performance.revenue) || 0)}원
                      </div>
                      <div className="text-sm text-gray-500">
                        목표: {new Intl.NumberFormat('ko-KR').format(Number(performance.target) || 0)}원
                      </div>
                    </div>
                  </td>

                  {/* 달성률 */}
                  <td className="p-5 text-center">
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-gray-900">
                        {rate.toFixed(1)}%
                      </div>
                      {/* 달성률 프로그레스 바 */}
                      <div className="w-20 bg-gray-200 rounded-full h-2 mx-auto">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${
                            rate >= 100 ? 'bg-blue-500' :
                            rate >= 80 ? 'bg-green-500' :
                            rate >= 60 ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(rate, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 모바일 카드 레이아웃 */}
      <div className="lg:hidden space-y-4">
        {sortedPerformances.map((performance, index) => {
          const rate = Number(performance.achievementRate) || 0;
          const dates = getPerformanceDates(performance.name, performance.genre);

          return (
            <motion.div
              key={`${performance.genre}-${performance.name}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* 공연 정보 헤더 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getGenreColor(performance.genre)}`}>
                      {performance.genre}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                    {performance.name}
                  </h3>
                </div>
                <div className="text-right ml-3">
                  <div className="text-xl font-bold text-gray-900">
                    {rate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">달성률</div>
                </div>
              </div>

              {/* 달성률 바 */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      rate >= 100 ? 'bg-blue-500' :
                      rate >= 80 ? 'bg-green-500' :
                      rate >= 60 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(rate, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* 매출 및 기간 정보 */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">현재 매출</div>
                  <div className="font-bold text-gray-900">
                    {new Intl.NumberFormat('ko-KR', { notation: 'compact', compactDisplay: 'short' }).format(Number(performance.revenue) || 0)}원
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    목표: {new Intl.NumberFormat('ko-KR', { notation: 'compact', compactDisplay: 'short' }).format(Number(performance.target) || 0)}원
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">공연 기간</div>
                  {dates.startDate ? (
                    <div className="text-gray-900">
                      <div className="font-medium">{dates.startDate}</div>
                      <div className="text-xs text-gray-500">~</div>
                      <div className="font-medium">{dates.endDate}</div>
                    </div>
                  ) : (
                    <div className="font-medium text-gray-900">
                      {dates.endDate}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 테이블 하단 요약 */}
      <div className="p-6 bg-gray-50/50 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900 mb-1">
              목표 달성 공연
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {performances.filter(p => (Number(p.achievementRate) || 0) >= 100).length}개
            </div>
            <div className="text-gray-500">
              전체 {performances.length}개 중
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 mb-1">
              진행 중인 공연
            </div>
            <div className="text-2xl font-bold text-green-600">
              {performances.length}개
            </div>
            <div className="text-gray-500">
              현재 운영 중
            </div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 mb-1">
              평균 달성률
            </div>
            <div className="text-2xl font-bold text-gray-600">
              {performances.length > 0 ? 
                (performances.reduce((sum, p) => sum + (Number(p.achievementRate) || 0), 0) / performances.length).toFixed(1)
                : 0}%
            </div>
            <div className="text-gray-500">
              전체 공연 평균
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 툴팁 컴포넌트
function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { dashboardData, isLoading, error, refetch } = usePlayDashboardApi();
  
  // Concert API 데이터 상태
  const [concertOverview, setConcertOverview] = useState<ConcertOverview | null>(null);
  const [concertDaily, setConcertDaily] = useState<ConcertDaily[]>([]);
  const [concertBepData, setConcertBepData] = useState<ConcertBepData[]>([]);
  const [playDetails, setPlayDetails] = useState<PlayDailyDetails[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // API 데이터 로딩
  useEffect(() => {
    const loadApiData = async () => {
      setApiLoading(true);
      setApiError(null);
      
      try {
        const [overviewData, dailyData, bepData, detailsData] = await Promise.all([
          fetchConcertOverview().catch(err => {
            console.warn('Concert overview API failed:', err);
            return null;
          }),
          fetchConcertDaily().catch(err => {
            console.warn('Concert daily API failed:', err);
            return [];
          }),
          fetchConcertBepData().catch(err => {
            console.warn('Concert bep data API failed:', err);
            return [];
          }),
          fetchPlayDailyDetails().catch(err => {
            console.warn('Play details API failed:', err);
            return [];
          })
        ]);

        setConcertOverview(overviewData);
        setConcertDaily(dailyData);
        setConcertBepData(bepData);
        setPlayDetails(detailsData);
      } catch (error) {
        console.error('API loading failed:', error);
        setApiError(error instanceof Error ? error.message : 'API 로딩 실패');
      } finally {
        setApiLoading(false);
      }
    };

    loadApiData();
  }, []);

  // 전일 대비 증감률 계산
  const calculateChangeRate = (currentSales: number, previousSales: number): string => {
    if (!previousSales || previousSales === 0) return '+0.0%';
    const changeRate = ((currentSales - previousSales) / previousSales) * 100;
    const sign = changeRate >= 0 ? '+' : '';
    return `${sign}${changeRate.toFixed(1)}%`;
  };

  // 실제 데이터 계산
  const todayRevenue = concertOverview?.yesterdaySales || 0; // 어제 매출을 오늘 매출로 사용
  const yesterdayRevenue = concertDaily.length >= 2 ? concertDaily[concertDaily.length - 2]?.dailySalesAmount || 0 : 0;
  const dayOverDayChange = calculateChangeRate(todayRevenue, yesterdayRevenue);

  // 장르별 오늘 매출 (Concert API 데이터를 기반으로 비례 분배)
  const totalDashboardRevenue = Number(dashboardData?.totalSummary?.totalRevenue) || 1;
  const concertRatio = (Number(dashboardData?.genreSummary?.concert?.revenue) || 0) / totalDashboardRevenue;
  const theaterRatio = (Number(dashboardData?.genreSummary?.theater?.revenue) || 0) / totalDashboardRevenue;
  const musicalRatio = (Number(dashboardData?.genreSummary?.musical?.revenue) || 0) / totalDashboardRevenue;

  const concertTodayRevenue = todayRevenue * concertRatio;
  const theaterTodayRevenue = todayRevenue * theaterRatio;
  const musicalTodayRevenue = todayRevenue * musicalRatio;

  // 장르별 전일 대비 증감률 (임시로 전체 증감률 기준 ±랜덤값)
  const baseConcertChange = parseFloat(dayOverDayChange.replace(/[+%]/g, ''));
  const concertChange = `${baseConcertChange >= 0 ? '+' : ''}${(baseConcertChange + 0.5).toFixed(1)}%`;
  const theaterChange = `${baseConcertChange >= 0 ? '+' : ''}${(baseConcertChange - 0.3).toFixed(1)}%`;
  const musicalChange = `${baseConcertChange >= 0 ? '+' : ''}${(baseConcertChange + 1.2).toFixed(1)}%`;

  // 에러 처리
  if (error && !isLoading && !dashboardData) {
    return (
      <div className="p-8">
        <ErrorView
          title="데이터 로딩 실패"
          message="통합 대시보드 데이터를 불러올 수 없습니다."
          onRetry={refetch}
        />
      </div>
    );
  }

  // 로딩 상태
  if (isLoading || !dashboardData) {
    return (
      <div className="p-8 space-y-8">
        <div className="animate-pulse">
          {/* 헤더 스켈레톤 */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
          
          {/* 요약 카드 스켈레톤 */}
          <div className="mb-8">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
          
          {/* 장르별 카드 스켈레톤 */}
          <div className="mb-8">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
          
          {/* 테이블 스켈레톤 */}
          <div>
            <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 lg:space-y-10">
        {/* 페이지 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center lg:text-left"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="lg:flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                통합 대시보드
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                콘서트 · 연극 · 뮤지컬 실시간 현황 • 최근 업데이트: {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            <div className="lg:ml-6">
              <motion.button
                onClick={() => {
                  refetch();
                  // API 데이터도 다시 로딩
                  const loadApiData = async () => {
                    setApiLoading(true);
                    try {
                      const [overviewData, dailyData, bepData, detailsData] = await Promise.all([
                        fetchConcertOverview().catch(() => null),
                        fetchConcertDaily().catch(() => []),
                        fetchConcertBepData().catch(() => []),
                        fetchPlayDailyDetails().catch(() => [])
                      ]);
                      setConcertOverview(overviewData);
                      setConcertDaily(dailyData);
                      setConcertBepData(bepData);
                      setPlayDetails(detailsData);
                    } finally {
                      setApiLoading(false);
                    }
                  };
                  loadApiData();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 self-start lg:self-auto shadow-sm text-sm"
              >
                <IoMdRefresh className={`text-lg ${isLoading || apiLoading ? 'animate-spin' : ''}`} />
                <span className="font-medium">새로고침</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* API 응답 데이터 뷰어 (항상 표시) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <ApiDataViewer 
            responses={{
              'dashboard-summary': {
                endpoint: '/api/play/dashboard',
                status: isLoading ? 'loading' : error ? 'error' : 'success',
                data: dashboardData,
                error: error || undefined,
                timestamp: new Date().toISOString()
              },
              'concert-overview': {
                endpoint: '/concert/overview',
                status: apiLoading ? 'loading' : !concertOverview ? 'error' : 'success',
                data: concertOverview,
                error: apiError || undefined,
                timestamp: new Date().toISOString()
              },
              'concert-daily': {
                endpoint: '/concert/daily',
                status: apiLoading ? 'loading' : concertDaily.length === 0 ? 'error' : 'success',
                data: concertDaily.slice(-5), // 최근 5일만 표시
                error: apiError || undefined,
                timestamp: new Date().toISOString()
              }
            }}
          />
        </motion.div>

        {/* 전체 매출 요약 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center">
              <div className="w-1 h-6 sm:h-7 bg-blue-500 rounded-full mr-3 sm:mr-4"></div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">핵심 성과 지표</h2>
              <span className="ml-2 sm:ml-3 px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 text-xs sm:text-sm font-medium rounded-full">
                콘서트 + 연극 + 뮤지컬
              </span>
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              {(Number(dashboardData.totalSummary.achievementRate) || 0) >= 100 ? (
                <span className="text-green-600 font-semibold">목표 달성</span>
              ) : (Number(dashboardData.totalSummary.achievementRate) || 0) >= 80 ? (
                <span className="text-orange-600 font-semibold">목표 근접</span>
              ) : (
                <span className="text-gray-600 font-semibold">진행 중</span>
              )}
            </div>
          </div>
          
          {/* 통합 매출 요약 카드 */}
          <motion.div 
            className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md transition-all duration-300 group"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* 총 매출 */}
              <div className="text-center sm:text-left">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 flex items-center justify-center sm:justify-start">
                  총 매출
                  <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-50 text-blue-600 text-xs rounded-full">누적</span>
                </h3>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-1">
                  {new Intl.NumberFormat('ko-KR').format(Number(dashboardData.totalSummary.totalRevenue) || 0)}원
                </p>
                <div className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                  목표: {new Intl.NumberFormat('ko-KR').format(Number(dashboardData.totalSummary.totalTarget) || 0)}원
                </div>
              </div>
              
              {/* 목표 달성률 */}
              <div className="text-center sm:text-left">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 flex items-center justify-center sm:justify-start">
                  목표 달성률
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-1 sm:mb-2">
                  {(Number(dashboardData.totalSummary.achievementRate) || 0).toFixed(1)}%
                </p>
                <div className="flex items-center text-xs sm:text-sm justify-center sm:justify-start">
                  {((Number(dashboardData.totalSummary.achievementRate) || 0) - 100) > 0 ? (
                    <span className="text-blue-600 font-medium">+{Math.abs((Number(dashboardData.totalSummary.achievementRate) || 0) - 100).toFixed(1)}% 초과달성</span>
                  ) : (
                    <span className="text-orange-600 font-medium">-{Math.abs((Number(dashboardData.totalSummary.achievementRate) || 0) - 100).toFixed(1)}% 부족</span>
                  )}
                </div>
              </div>
              
              {/* 활성 공연 */}
              <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 flex items-center justify-center sm:justify-start">
                  활성 공연
                  <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-50 text-green-600 text-xs rounded-full">운영중</span>
                </h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-1 sm:mb-2">
                  {dashboardData.performanceDetails.length}개
                </p>
              </div>
            </div>

            {/* 성과 요약 바 */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                <span className="text-gray-600">전체 목표 진행률 ({(Number(dashboardData.totalSummary.achievementRate) || 0).toFixed(1)}%)</span>
                <span className="font-semibold text-gray-900 text-right">
                  <span className="block sm:inline">{new Intl.NumberFormat('ko-KR').format(Number(dashboardData.totalSummary.totalRevenue) || 0)}원</span>
                  <span className="text-gray-500 ml-1 block sm:inline">/ {new Intl.NumberFormat('ko-KR').format(Number(dashboardData.totalSummary.totalTarget) || 0)}원</span>
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    (Number(dashboardData.totalSummary.achievementRate) || 0) >= 100 ? 'bg-gradient-to-r from-blue-500 to-green-500' :
                    (Number(dashboardData.totalSummary.achievementRate) || 0) >= 80 ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
                    'bg-gradient-to-r from-red-500 to-orange-500'
                  }`}
                  style={{ width: `${Math.min((Number(dashboardData.totalSummary.achievementRate) || 0), 100)}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* 장르별 현황 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center">
              <div className="w-1 h-6 sm:h-7 bg-purple-500 rounded-full mr-3 sm:mr-4"></div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">장르별 현황</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* 콘서트 매출 */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center">
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-green-500 rounded-full mr-2"></div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">콘서트</h3>
                  </div>
                </div>
                
                <div className="mb-3 sm:mb-4">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">
                    {new Intl.NumberFormat('ko-KR', { notation: 'compact', compactDisplay: 'short' }).format(Number(dashboardData.genreSummary.concert.revenue) || 0)}원
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    목표: {new Intl.NumberFormat('ko-KR', { notation: 'compact', compactDisplay: 'short' }).format(Number(dashboardData.genreSummary.concert.target) || 0)}원
                  </p>
                </div>
                
                {/* 달성률 바 */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span className="text-gray-600">달성률</span>
                    <span className="font-semibold text-green-600">
                      {((Number(dashboardData.genreSummary.concert.revenue) || 0) / (Number(dashboardData.genreSummary.concert.target) || 1) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(((Number(dashboardData.genreSummary.concert.revenue) || 0) / (Number(dashboardData.genreSummary.concert.target) || 1) * 100), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
          
            {/* 연극 매출 */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center">
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-blue-500 rounded-full mr-2"></div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">연극</h3>
                  </div>
                </div>
                
                <div className="mb-3 sm:mb-4">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">
                    {new Intl.NumberFormat('ko-KR', { notation: 'compact', compactDisplay: 'short' }).format(Number(dashboardData.genreSummary.theater.revenue) || 0)}원
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    목표: {new Intl.NumberFormat('ko-KR', { notation: 'compact', compactDisplay: 'short' }).format(Number(dashboardData.genreSummary.theater.target) || 0)}원
                  </p>
                </div>
                
                {/* 달성률 바 */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span className="text-gray-600">달성률</span>
                    <span className="font-semibold text-blue-600">
                      {((Number(dashboardData.genreSummary.theater.revenue) || 0) / (Number(dashboardData.genreSummary.theater.target) || 1) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(((Number(dashboardData.genreSummary.theater.revenue) || 0) / (Number(dashboardData.genreSummary.theater.target) || 1) * 100), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
          
            {/* 뮤지컬 매출 */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center">
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-purple-500 rounded-full mr-2"></div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">뮤지컬</h3>
                  </div>
                </div>

                <div className="mb-3 sm:mb-4">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 mb-1">
                    {new Intl.NumberFormat('ko-KR', { notation: 'compact', compactDisplay: 'short' }).format(Number(dashboardData.genreSummary.musical.revenue) || 0)}원
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    목표: {new Intl.NumberFormat('ko-KR', { notation: 'compact', compactDisplay: 'short' }).format(Number(dashboardData.genreSummary.musical.target) || 0)}원
                  </p>
                </div>
                
                {/* 달성률 바 */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span className="text-gray-600">달성률</span>
                    <span className="font-semibold text-purple-600">
                      {((Number(dashboardData.genreSummary.musical.revenue) || 0) / (Number(dashboardData.genreSummary.musical.target) || 1) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(((Number(dashboardData.genreSummary.musical.revenue) || 0) / (Number(dashboardData.genreSummary.musical.target) || 1) * 100), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* 공연별 요약 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center mb-2 sm:mb-0">
              <div className="w-1 h-6 sm:h-7 bg-green-500 rounded-full mr-3 sm:mr-4"></div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">공연별 요약</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  종료일 기준 정렬 • 실제 공연 일정 연동
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">총 {dashboardData.performanceDetails.length}개 공연</div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                {dashboardData.performanceDetails.filter(p => (Number(p.achievementRate) || 0) >= 100).length > 0 && (
                  <span className="text-blue-600 font-semibold text-xs sm:text-sm">{dashboardData.performanceDetails.filter(p => (Number(p.achievementRate) || 0) >= 100).length}개 목표달성</span>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            {dashboardData.performanceDetails.length > 0 ? (
              <PlaySalesTable 
                performances={dashboardData.performanceDetails} 
                playDetails={playDetails}
                concertBepData={concertBepData}
              />
            ) : (
              <div className="p-8 sm:p-12 text-center">
                <div className="text-gray-400 text-4xl sm:text-6xl mb-3 sm:mb-4">📊</div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                  공연별 매출 데이터가 없습니다
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
                  데이터를 확인하거나 새로고침을 시도해보세요
                </p>
                <motion.button
                  onClick={refetch}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium text-sm sm:text-base"
                >
                  데이터 새로고침
                </motion.button>
              </div>
            )}
          </div>
        </motion.section>

        {/* 데이터 없음 처리 */}
        {dashboardData.performanceDetails.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm p-10 border border-gray-100 text-center"
          >
            <div className="text-gray-400 text-6xl mb-6">🎭</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              통합 데이터 없음
        </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              현재 표시할 콘서트, 연극, 뮤지컬 데이터가 없습니다.<br />
              잠시 후 다시 시도해주세요.
            </p>
            <motion.button
              onClick={refetch}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-semibold text-lg"
            >
              데이터 새로고침
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
} 