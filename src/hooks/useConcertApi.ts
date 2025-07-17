'use client';

import { ConcertAPI } from '@/lib/api';
import { useApiData, ApiResponse, ApiEndpoint } from './useApiData';

interface UseConcertApiReturn {
  responses: Record<string, ApiResponse>;
  isLoading: boolean;
  hasErrors: boolean;
  retryAll: () => void;
  retryEndpoint: (endpoint: string) => void;
}

export function useConcertApi(): UseConcertApiReturn {
  // 콘서트 API 엔드포인트 정의 (static 메서드 사용)
  const concertEndpoints: Record<string, ApiEndpoint> = {
    daily: { 
      name: '일별 현황', 
      method: () => ConcertAPI.getDailyData(),
      url: '/concert/daily'
    },
    overview: { 
      name: '전체 개요', 
      method: () => ConcertAPI.getOverview(),
      url: '/concert/overview'
    },
    bep: { 
      name: 'BEP 분석', 
      method: () => ConcertAPI.getBEP(),
      url: '/concert/bep'
    },
    estimatedProfit: { 
      name: '예상 수익', 
      method: () => ConcertAPI.getEstimatedProfit(),
      url: '/concert/estimated-profit'
    },
    targetSales: { 
      name: '목표 매출', 
      method: () => ConcertAPI.getTargetSales(),
      url: '/concert/target-sales'
    },
    marketingCalendar: { 
      name: '마케팅 일정', 
      method: () => ConcertAPI.getMarketingCalendar(),
      url: '/concert/marketing-calendar'
    },
    monthly: { 
      name: '월간 매출', 
      method: () => ConcertAPI.getMonthlyData(),
      url: '/concert/monthly'
    },
    weekly: { 
      name: '주간 매출', 
      method: () => ConcertAPI.getWeeklyData(),
      url: '/concert/weekly'
    }
  };

  // 범용 API 훅 사용
  const { responses, isLoading, hasErrors, retryAll, retryEndpoint } = useApiData(concertEndpoints);

  return {
    responses,
    isLoading,
    hasErrors,
    retryAll,
    retryEndpoint
  };
} 