'use client';

import { PlayAPI, PlayWeeklyOverview, PlayDailyDetail, PlayOccupancyRate } from '@/lib/api';
import { useApiData, ApiResponse, ApiEndpoint } from './useApiData';

interface UsePlayApiReturn {
  responses: Record<string, ApiResponse>;
  isLoading: boolean;
  hasErrors: boolean;
  retryAll: () => void;
  retryEndpoint: (endpoint: string) => void;
  // 개별 데이터 접근 함수들
  getWeeklyOverviewData: () => PlayWeeklyOverview[] | null;
  getDailyDetailsData: () => PlayDailyDetail[] | null;
  getOccupancyRateData: () => PlayOccupancyRate[] | null;
}

export function usePlayApi(): UsePlayApiReturn {
  // 연극/뮤지컬 API 엔드포인트 정의
  const playEndpoints: Record<string, ApiEndpoint> = {
    weeklyOverview: { 
      name: '주간 현황', 
      method: () => PlayAPI.getWeeklyOverview(),
      url: '/api/play/weekly-overview'
    },
    dailyDetails: { 
      name: '공연별 상세 정보', 
      method: () => PlayAPI.getDailyDetails(),
      url: '/api/play/daily-details'
    },
    occupancyRate: { 
      name: '유료 점유율', 
      method: () => PlayAPI.getOccupancyRate(),
      url: '/api/play/occupancy-rate'
    }
  };

  // 범용 API 훅 사용
  const { responses, isLoading, hasErrors, retryAll, retryEndpoint } = useApiData(playEndpoints);

  // 개별 데이터 접근 함수들
  const getWeeklyOverviewData = (): PlayWeeklyOverview[] | null => {
    const response = responses.weeklyOverview;
    if (response?.status === 'success' && response.data) {
      return response.data as PlayWeeklyOverview[];
    }
    return null;
  };

  const getDailyDetailsData = (): PlayDailyDetail[] | null => {
    const response = responses.dailyDetails;
    if (response?.status === 'success' && response.data) {
      return response.data as PlayDailyDetail[];
    }
    return null;
  };

  const getOccupancyRateData = (): PlayOccupancyRate[] | null => {
    const response = responses.occupancyRate;
    if (response?.status === 'success' && response.data) {
      return response.data as PlayOccupancyRate[];
    }
    return null;
  };

  return {
    responses,
    isLoading,
    hasErrors,
    retryAll,
    retryEndpoint,
    // 개별 데이터 접근 함수들
    getWeeklyOverviewData,
    getDailyDetailsData,
    getOccupancyRateData
  };
}

// 기존 타입들은 api.ts에서 import하므로 여기서는 제거
export type { PlayWeeklyOverview, PlayDailyDetail, PlayOccupancyRate } from '@/lib/api'; 