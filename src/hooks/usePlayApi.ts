import { useState, useEffect } from 'react';

// API 응답 타입 정의 (백엔드 응답 구조에 맞춤)
export interface PlayWeeklyOverview {
  liveId?: string;                           // 공연 고유 ID
  liveName?: string;                         // 공연명
  targetShare?: string;                      // 목표 점유율
  avgPaidShare?: string;                     // 실제 점유율
  totalTargetSales?: string;                 // 목표 매출
  totalActualSales?: string;                 // 실제 매출
  weekBeforeLastTotalActualSales?: string;   // 지지난주 매출
}

export interface PlayDailyDetail {
  liveId?: string;
  liveName?: string;
  latestRecordDate?: string;
  showTotalSeatNumber?: number;
  dailySales?: number;
  cast?: string;
  paidSeatSales?: number;
  paidSeatTot?: number;
  paidSeatVip?: number;
  paidSeatA?: number;
}

export interface PlayOccupancyRate {
  "공연 ID"?: string;
  "공연명"?: string;
  "주 시작일"?: string;
  "주 종료일"?: string;
  "유료 객석 점유율(%)"?: number;
  "해당 주 공연 횟수"?: number;
}



interface ApiResponse<T> {
  endpoint: string;
  status: 'loading' | 'success' | 'error';
  data?: T;
  error?: string;
  timestamp?: string;
  duration?: number;
  url?: string;
}

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://35.208.29.100:3001' 
  : 'http://localhost:3001';

export function usePlayApi() {
  const [responses, setResponses] = useState<Record<string, ApiResponse<any>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasErrors, setHasErrors] = useState(false);

  const fetchData = async <T>(endpoint: string, key: string): Promise<void> => {
    const startTime = Date.now();
    const url = `${API_BASE_URL}${endpoint}`;
    
    setResponses(prev => ({
      ...prev,
      [key]: {
        endpoint,
        status: 'loading',
        url,
        timestamp: new Date().toISOString()
      }
    }));

    try {
      console.log(`🎭 API 호출 시작: ${endpoint}`);
      const response = await fetch(url);
      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: T = await response.json();
      
      setResponses(prev => ({
        ...prev,
        [key]: {
          endpoint,
          status: 'success',
          data,
          url,
          timestamp: new Date().toISOString(),
          duration
        }
      }));
      
      console.log(`✅ API 성공: ${endpoint} (${duration}ms)`, data);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setResponses(prev => ({
        ...prev,
        [key]: {
          endpoint,
          status: 'error',
          error: errorMessage,
          url,
          timestamp: new Date().toISOString(),
          duration
        }
      }));
      
      console.error(`❌ API 실패: ${endpoint}`, errorMessage);
      setHasErrors(true);
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    setHasErrors(false);

    try {
      // 분리된 API 호출
      await Promise.all([
        fetchData<PlayWeeklyOverview[]>('/play/weekly-overview', 'weeklyOverview'),
        fetchData<PlayDailyDetail[]>('/play/daily-details', 'dailyDetails'),
        fetchData<PlayOccupancyRate[]>('/play/occupancy-rate', 'occupancyRate')
      ]);
    } catch (error) {
      console.error('전체 데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const retryAll = () => {
    console.log('🔄 전체 API 재시도');
    loadAllData();
  };

  const retryOne = (key: string) => {
    console.log(`🔄 ${key} API 재시도`);
    
    switch (key) {
      case 'weeklyOverview':
        fetchData<PlayWeeklyOverview[]>('/play/weekly-overview', 'weeklyOverview');
        break;
      case 'dailyDetails':
        fetchData<PlayDailyDetail[]>('/play/daily-details', 'dailyDetails');
        break;
      case 'occupancyRate':
        fetchData<PlayOccupancyRate[]>('/play/occupancy-rate', 'occupancyRate');
        break;
      default:
        console.warn(`Unknown API key: ${key}`);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

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
    retryOne,
    // 개별 데이터 접근 함수들
    getWeeklyOverviewData,
    getDailyDetailsData,
    getOccupancyRateData
  };
} 