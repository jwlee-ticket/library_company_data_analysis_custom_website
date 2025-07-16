'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MarketingSalesChart from '@/components/dashboard/concert/MarketingSalesChart';
import MarketingCalendar from '@/components/dashboard/concert/MarketingCalendar';
import MarketingFilters from '@/components/dashboard/concert/MarketingFilters';
import ApiDataViewer from '@/components/debug/ApiDataViewer';
import ErrorView from '@/components/ui/ErrorView';

// 마케팅 캘린더 타입
interface MarketingCalendar {
  liveName: string;
  weekStartDate: string;
  weekEndDate: string;
  salesMarketing: string;
  promotion: string;
  etc: string;
}

// 주간 매출 타입
interface WeeklySales {
  liveId: string;
  liveName: string;
  recordWeek: string;
  weeklySalesTicketNo: number;
  weeklySalesAmount: number;
  noteSalesMarketing: string;
  notePromotion: string;
  noteEtc: string;
}

// 월간 매출 타입
interface MonthlySales {
  liveId: string;
  liveName: string;
  recordMonth: string;
  monthlySalesAmount: number;
}

export default function ConcertMarketingSalesPage() {
  // 상태 관리
  const [marketingData, setMarketingData] = useState<MarketingCalendar[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklySales[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlySales[]>([]);
  
  const [marketingLoading, setMarketingLoading] = useState(true);
  const [weeklyLoading, setWeeklyLoading] = useState(true);
  const [monthlyLoading, setMonthlyLoading] = useState(true);
  
  const [marketingError, setMarketingError] = useState<string | null>(null);
  const [weeklyError, setWeeklyError] = useState<string | null>(null);
  const [monthlyError, setMonthlyError] = useState<string | null>(null);

  // 필터 상태
  const [filters, setFilters] = useState({
    selectedConcert: '',
    startDate: '2025-04-17',
    endDate: '2025-04-28'
  });

  // 캘린더 상태
  const [selectedMonth, setSelectedMonth] = useState(new Date(2025, 3, 1)); // 2025년 4월

  // 안전한 숫자 변환 함수
  const toNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // 마케팅 캘린더 데이터 로딩
  const loadMarketingData = async () => {
    setMarketingLoading(true);
    setMarketingError(null);

    try {
      const response = await fetch('/api/concert/marketing-calendar');
      if (!response.ok) {
        throw new Error('마케팅 캘린더 API 응답 오류');
      }

      const result = await response.json();
      setMarketingData(result);

    } catch (err) {
      console.error('마케팅 캘린더 데이터 로딩 실패:', err);
      setMarketingError(err instanceof Error ? err.message : '마케팅 캘린더 데이터 로딩에 실패했습니다');
    } finally {
      setMarketingLoading(false);
    }
  };

  // 주간 매출 데이터 로딩
  const loadWeeklyData = async () => {
    setWeeklyLoading(true);
    setWeeklyError(null);

    try {
      const response = await fetch('/api/concert/weekly');
      if (!response.ok) {
        throw new Error('주간 매출 API 응답 오류');
      }

      const result = await response.json();
      setWeeklyData(result);

    } catch (err) {
      console.error('주간 매출 데이터 로딩 실패:', err);
      setWeeklyError(err instanceof Error ? err.message : '주간 매출 데이터 로딩에 실패했습니다');
    } finally {
      setWeeklyLoading(false);
    }
  };

  // 월간 매출 데이터 로딩
  const loadMonthlyData = async () => {
    setMonthlyLoading(true);
    setMonthlyError(null);

    try {
      const response = await fetch('/api/concert/monthly');
      if (!response.ok) {
        throw new Error('월간 매출 API 응답 오류');
      }

      const result = await response.json();
      setMonthlyData(result);

    } catch (err) {
      console.error('월간 매출 데이터 로딩 실패:', err);
      setMonthlyError(err instanceof Error ? err.message : '월간 매출 데이터 로딩에 실패했습니다');
    } finally {
      setMonthlyLoading(false);
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    loadMarketingData();
    loadWeeklyData();
    loadMonthlyData();
  }, []);

  // 필터 핸들러
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    console.log('📅 필터 적용:', newFilters);
  };

  const handleFiltersReset = () => {
    setFilters({
      selectedConcert: '',
      startDate: '2025-04-17',
      endDate: '2025-04-28'
    });
    console.log('🔄 필터 초기화');
  };

  // 캘린더 월 변경 핸들러
  const handleMonthChange = (date: Date) => {
    setSelectedMonth(date);
  };

  // 재시도 함수들
  const handleMarketingRetry = () => {
    loadMarketingData();
  };

  const handleWeeklyRetry = () => {
    loadWeeklyData();
  };

  const handleMonthlyRetry = () => {
    loadMonthlyData();
  };

  // 차트 데이터 생성
  const generateChartData = () => {
    const dates = [];
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    return dates.map((date, index) => ({
      date,
      dailySales: Math.floor(Math.random() * 30000000) + 10000000, // 1천만~4천만원
      cumulativeSales: Math.floor(Math.random() * 20000000) + 5000000, // 5백만~2천5백만원
      lastYearComparison: Math.floor(Math.random() * 50000000) + 20000000, // 2천만~7천만원
      marketingEvents: Math.floor(Math.random() * 3) + 1, // 1-3개 이벤트
      isIncreasing: Math.random() > 0.3, // 70% 확률로 증가
    }));
  };

  // 마케팅 이벤트 데이터 생성
  const generateMarketingEvents = () => {
    return [
      {
        id: '1',
        title: '인터파크 이용료할인 40%',
        startDate: '2025-04-14',
        endDate: '2025-04-20',
        color: 'blue',
        type: 'discount' as const
      },
      {
        id: '2',
        title: '롤링 공지사항 프로모션',
        startDate: '2025-04-14',
        endDate: '2025-04-20',
        color: 'blue',
        type: 'promotion' as const
      },
      {
        id: '3',
        title: '제휴할인율몰의타임세일',
        startDate: '2025-04-23',
        endDate: '2025-04-23',
        color: 'orange',
        type: 'collaboration' as const
      },
      {
        id: '4',
        title: '인터파크 롤오스타일',
        startDate: '2025-04-25',
        endDate: '2025-04-26',
        color: 'green',
        type: 'special' as const
      },
      {
        id: '5',
        title: '박오월 WEEK',
        startDate: '2025-04-29',
        endDate: '2025-05-04',
        color: 'pink',
        type: 'special' as const
      }
    ];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-8"
    >
      {/* 페이지 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-green-50 via-white to-blue-50 rounded-2xl p-6 border border-gray-100 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              콘서트 마케팅 & 매출 분석
            </h1>
            <p className="text-sm text-gray-600">
              마케팅 캘린더와 매출 데이터를 통합 분석하여 효과적인 마케팅 전략을 수립하세요
            </p>
          </div>
          
          {/* 필터 컨트롤 */}
          <MarketingFilters
            concerts={[
              { id: 'raika', name: '라이카' },
              { id: 'hisaishi', name: '히사이시조 영화음악 콘서트' },
              { id: 'morricone', name: '엔니오 모리꼬네 영화음악 콘서트' },
              { id: 'japanimation', name: '재패니메이션 인 콘서트' }
            ]}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleFiltersReset}
          />
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
            'marketing-calendar': {
              endpoint: '/api/concert/marketing-calendar',
              status: marketingLoading ? 'loading' : marketingError ? 'error' : 'success',
              data: marketingData,
              error: marketingError || undefined,
              timestamp: new Date().toISOString()
            },
            'weekly-sales': {
              endpoint: '/api/concert/weekly',
              status: weeklyLoading ? 'loading' : weeklyError ? 'error' : 'success',
              data: weeklyData,
              error: weeklyError || undefined,
              timestamp: new Date().toISOString()
            },
            'monthly-sales': {
              endpoint: '/api/concert/monthly',
              status: monthlyLoading ? 'loading' : monthlyError ? 'error' : 'success',
              data: monthlyData,
              error: monthlyError || undefined,
              timestamp: new Date().toISOString()
            }
          }}
        />
      </motion.div>

      {/* 마케팅 매출 차트 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <MarketingSalesChart
          data={generateChartData()}
          selectedConcert={filters.selectedConcert}
        />
      </motion.div>

      {/* 마케팅 캘린더 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <MarketingCalendar
          events={generateMarketingEvents()}
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
        />
      </motion.div>
    </motion.div>
  );
} 