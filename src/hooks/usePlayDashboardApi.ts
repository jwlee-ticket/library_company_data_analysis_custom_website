import { useState, useEffect } from 'react';

// Play API 타입 정의
interface PlayRevenueAnalysis {
  liveId: string;
  liveName: string;
  category: string;
  total_sales: number;
  total_target: number;
  total_sales_target_ratio: number;
  latest_day_sales: number;
  latest_day_target: number;
  latest_day_sales_target_ratio: number;
  latestRecordDate: string;
}

// Concert API 타입 정의
interface ConcertOverview {
  yesterdaySales: number;
  accumulatedSales: number;
  weeklySales: number;
  dailyAvgSales: number;
}

interface ConcertTargetSales {
  liveName: string;
  targetSales: number;
  salesAcc: number;
  targetRatio: number;
}

// 통합 대시보드 데이터 타입
interface DashboardData {
  totalSummary: {
    totalRevenue: number;
    totalTarget: number;
    achievementRate: number;
  };
  genreSummary: {
    concert: {
      revenue: number;
      target: number;
      achievementRate: number;
    };
    theater: {
      revenue: number;
      target: number;
      achievementRate: number;
    };
    musical: {
      revenue: number;
      target: number;
      achievementRate: number;
    };
  };
  performanceDetails: Array<{
    genre: '콘서트' | '연극' | '뮤지컬';
    name: string;
    revenue: number;
    target: number;
    achievementRate: number;
  }>;
}

export function usePlayDashboardApi() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Play API와 Concert API를 병렬로 호출
      const [playRevenueResponse, concertOverviewResponse, concertTargetResponse] = await Promise.all([
        fetch('/api/play/revenue-analysis'),
        fetch('/api/concert/overview'),
        fetch('/api/concert/target-sales')
      ]);

      if (!playRevenueResponse.ok) {
        throw new Error(`Play API 오류: ${playRevenueResponse.status}`);
      }
      if (!concertOverviewResponse.ok) {
        throw new Error(`Concert Overview API 오류: ${concertOverviewResponse.status}`);
      }
      if (!concertTargetResponse.ok) {
        throw new Error(`Concert Target API 오류: ${concertTargetResponse.status}`);
      }

      const playRevenueData: PlayRevenueAnalysis[] = await playRevenueResponse.json();
      const concertOverviewRaw = await concertOverviewResponse.json();
      const concertTargetData: ConcertTargetSales[] = await concertTargetResponse.json();

      // Concert Overview는 배열로 응답되므로 첫 번째 항목 추출
      const concertOverviewData: ConcertOverview = Array.isArray(concertOverviewRaw) 
        ? concertOverviewRaw[0] 
        : concertOverviewRaw;

      // 디버깅 로그 추가
      console.log('🎪 Concert Overview Raw:', concertOverviewRaw);
      console.log('🎪 Concert Overview Data:', concertOverviewData);
      console.log('🎯 Concert Target Data:', concertTargetData);

      // 데이터 변환 및 통합
      const processedData = processApiData(playRevenueData, concertOverviewData, concertTargetData);
      setDashboardData(processedData);

    } catch (err) {
      console.error('대시보드 데이터 로딩 실패:', err);
      setError(err instanceof Error ? err.message : '데이터 로딩에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    dashboardData,
    isLoading,
    error,
    refetch: fetchData
  };
}

function processApiData(
  playData: PlayRevenueAnalysis[],
  concertOverview: ConcertOverview,
  concertTargets: ConcertTargetSales[]
): DashboardData {
  // Play 데이터에서 연극과 뮤지컬 분리
  const theaterData = playData.filter(item => 
    item.category === '연극' || item.liveName.includes('연극')
  );
  const musicalData = playData.filter(item => 
    item.category === '뮤지컬' || item.liveName.includes('뮤지컬')
  );

  // 연극 합계 계산
  const theaterRevenue = theaterData.reduce((sum, item) => sum + (Number(item.total_sales) || 0), 0);
  const theaterTarget = theaterData.reduce((sum, item) => sum + (Number(item.total_target) || 0), 0);

  // 뮤지컬 합계 계산
  const musicalRevenue = musicalData.reduce((sum, item) => sum + (Number(item.total_sales) || 0), 0);
  const musicalTarget = musicalData.reduce((sum, item) => sum + (Number(item.total_target) || 0), 0);

  // 콘서트 데이터 계산
  const concertRevenue = Number(concertOverview.accumulatedSales) || 0;
  const concertTarget = concertTargets.reduce((sum, item) => sum + (Number(item.targetSales) || 0), 0);

  // 디버깅 로그 추가
  console.log('💰 Concert Revenue:', concertRevenue, 'from:', concertOverview.accumulatedSales);
  console.log('🎯 Concert Target:', concertTarget);
  console.log('📊 Concert Achievement:', concertTarget > 0 ? (concertRevenue / concertTarget) * 100 : 0);

  // 전체 합계
  const totalRevenue = theaterRevenue + musicalRevenue + concertRevenue;
  const totalTarget = theaterTarget + musicalTarget + concertTarget;

  // 공연별 상세 데이터 생성
  const performanceDetails = [
    // 연극 데이터
    ...theaterData.map(item => ({
      genre: '연극' as const,
      name: item.liveName,
      revenue: Number(item.total_sales) || 0,
      target: Number(item.total_target) || 0,
      achievementRate: Number(item.total_sales_target_ratio) || 0
    })),
    // 뮤지컬 데이터
    ...musicalData.map(item => ({
      genre: '뮤지컬' as const,
      name: item.liveName,
      revenue: Number(item.total_sales) || 0,
      target: Number(item.total_target) || 0,
      achievementRate: Number(item.total_sales_target_ratio) || 0
    })),
    // 콘서트 데이터
    ...concertTargets.map(item => ({
      genre: '콘서트' as const,
      name: item.liveName,
      revenue: Number(item.salesAcc) || 0,
      target: Number(item.targetSales) || 0,
      achievementRate: (Number(item.targetRatio) || 0) * 100
    }))
  ];

  return {
    totalSummary: {
      totalRevenue,
      totalTarget,
      achievementRate: totalTarget > 0 ? (totalRevenue / totalTarget) * 100 : 0
    },
    genreSummary: {
      concert: {
        revenue: concertRevenue,
        target: concertTarget,
        achievementRate: concertTarget > 0 ? (concertRevenue / concertTarget) * 100 : 0
      },
      theater: {
        revenue: theaterRevenue,
        target: theaterTarget,
        achievementRate: theaterTarget > 0 ? (theaterRevenue / theaterTarget) * 100 : 0
      },
      musical: {
        revenue: musicalRevenue,
        target: musicalTarget,
        achievementRate: musicalTarget > 0 ? (musicalRevenue / musicalTarget) * 100 : 0
      }
    },
    performanceDetails
  };
} 