'use client';

import { 
  PlayAPI, 
  PlayWeeklyOverview, 
  PlayDailyDetail, 
  PlayOccupancyRate,
  PlayAllShowtime,
  PlayMonthlySummary,
  PlayMonthlyByPerformance,
  PlayRevenueAnalysis,
  PlayCastRevenue,
  PlaySummary
} from '@/lib/api';
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
  // 신규 API 데이터 접근 함수들
  getAllShowtimeData: () => PlayAllShowtime[] | null;
  getMonthlySummaryData: () => PlayMonthlySummary[] | null;
  getMonthlyByPerformanceData: () => PlayMonthlyByPerformance[] | null;
  getRevenueAnalysisData: () => PlayRevenueAnalysis[] | null;
  getCastRevenueData: () => PlayCastRevenue[] | null;
  getSummaryData: () => PlaySummary | null;
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
    },
    allShowtime: { 
      name: '전체 공연 일정', 
      method: () => PlayAPI.getAllShowtime(),
      url: '/api/play/all-showtime'
    },
    monthlySummary: { 
      name: '월별 전체 매출', 
      method: () => PlayAPI.getMonthlySummary(),
      url: '/api/play/monthly-summary'
    },
    monthlyByPerformance: { 
      name: '월별 공연별 매출', 
      method: () => PlayAPI.getMonthlyByPerformance(),
      url: '/api/play/monthly-by-performance'
    },
    revenueAnalysis: { 
      name: '매출 분석', 
      method: () => PlayAPI.getRevenueAnalysis(),
      url: '/api/play/revenue-analysis'
    },
    castRevenue: { 
      name: '캐스트별 매출', 
      method: () => PlayAPI.getCastRevenue(),
      url: '/api/play/cast-revenue'
    },
    summary: { 
      name: '통합 대시보드', 
      method: () => PlayAPI.getSummary(),
      url: '/api/play/summary'
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

  // 신규 API 데이터 접근 함수들
  const getAllShowtimeData = (): PlayAllShowtime[] | null => {
    const response = responses.allShowtime;
    if (response?.status === 'success' && response.data) {
      return response.data as PlayAllShowtime[];
    }
    return null;
  };

  const getMonthlySummaryData = (): PlayMonthlySummary[] | null => {
    const response = responses.monthlySummary;
    if (response?.status === 'success' && response.data) {
      return response.data as PlayMonthlySummary[];
    }
    return null;
  };

  const getMonthlyByPerformanceData = (): PlayMonthlyByPerformance[] | null => {
    const response = responses.monthlyByPerformance;
    if (response?.status === 'success' && response.data) {
      return response.data as PlayMonthlyByPerformance[];
    }
    return null;
  };

  const getRevenueAnalysisData = (): PlayRevenueAnalysis[] | null => {
    const response = responses.revenueAnalysis;
    if (response?.status === 'success' && response.data) {
      return response.data as PlayRevenueAnalysis[];
    }
    return null;
  };

  const getCastRevenueData = (): PlayCastRevenue[] | null => {
    const response = responses.castRevenue;
    if (response?.status === 'success' && response.data) {
      return response.data as PlayCastRevenue[];
    }
    return null;
  };

  const getSummaryData = (): PlaySummary | null => {
    const response = responses.summary;
    if (response?.status === 'success' && response.data) {
      return response.data as PlaySummary;
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
    getOccupancyRateData,
    // 신규 API 데이터 접근 함수들
    getAllShowtimeData,
    getMonthlySummaryData,
    getMonthlyByPerformanceData,
    getRevenueAnalysisData,
    getCastRevenueData,
    getSummaryData
  };
}

// 기존 타입들은 api.ts에서 import하므로 여기서는 제거
export type { 
  PlayWeeklyOverview, 
  PlayDailyDetail, 
  PlayOccupancyRate,
  PlayAllShowtime,
  PlayMonthlySummary,
  PlayMonthlyByPerformance,
  PlayRevenueAnalysis,
  PlayCastRevenue,
  PlaySummary
} from '@/lib/api'; 