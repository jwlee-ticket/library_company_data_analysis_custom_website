import { useState, useEffect } from 'react';

// API 응답 타입 정의
export interface ConcertBepData {
  liveId: string;
  liveName: string;
  latestRecordDate: string; // 최근 데이터 기준일
  salesStartDate: string; // 판매 시작일
  salesEndDate: string; // 판매 종료일
  seatClass: 'VIP' | 'R' | 'S' | 'A' | 'B' | 'Total';
  seatOrder: number;
  totalSeats: number; // 전체 좌석 수
  soldSeats: number; // 현재 판매된 좌석
  remainingSeats: number; // 남은 좌석
  estAdditionalSales: string | number; // 추가 판매 예상 좌석
  estFinalRemaining: string | number; // 최종 예상 남은 좌석
  bepSeats: string; // BEP 달성 필요 좌석
  estSalesRatio: string; // 예상 판매율
  bepRatio: number; // BEP 달성률
}

export interface ConcertDailyData {
  liveId: string;
  liveName: string;
  recordDate: string;
  recordMonth: string;
  recordWeek: string;
  dailySalesTicketNo: number;
  dailySalesAmount: number;
}

export interface ConcertWeeklyData {
  liveId: string;
  liveName: string;
  recordWeek: string;
  weeklySalesTicketNo: number; // 사용하지 않음
  weeklySalesAmount: number;   // 사용하지 않음
  noteSalesMarketing: string;  // 세일즈 노트 (사용)
  notePromotion: string;       // 마케팅/프로모션 노트 (사용)
  noteEtc: string;             // 기타 노트 (사용)
}

// API 응답 상태 타입
interface ApiResponse<T> {
  data: T[] | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

// 전체 응답 타입
interface ConcertIndividualApiResponses {
  bep: ApiResponse<ConcertBepData>;
  daily: ApiResponse<ConcertDailyData>;
  weekly: ApiResponse<ConcertWeeklyData>;
}

export function useConcertIndividualApi() {
  const [responses, setResponses] = useState<ConcertIndividualApiResponses>({
    bep: { data: null, status: 'idle', error: null },
    daily: { data: null, status: 'idle', error: null },
    weekly: { data: null, status: 'idle', error: null },
  });

  const [isLoading, setIsLoading] = useState(false);

  // 개별 API 호출 함수
  const fetchBepData = async () => {
    setResponses(prev => ({
      ...prev,
      bep: { ...prev.bep, status: 'loading', error: null }
    }));

    try {
      const response = await fetch('/api/concert/bep');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      setResponses(prev => ({
        ...prev,
        bep: { data, status: 'success', error: null }
      }));
    } catch (error) {
      console.error('❌ BEP API 오류:', error);
      setResponses(prev => ({
        ...prev,
        bep: { data: null, status: 'error', error: error instanceof Error ? error.message : '알 수 없는 오류' }
      }));
    }
  };

  const fetchDailyData = async () => {
    setResponses(prev => ({
      ...prev,
      daily: { ...prev.daily, status: 'loading', error: null }
    }));

    try {
      const response = await fetch('/api/concert/daily');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      setResponses(prev => ({
        ...prev,
        daily: { data, status: 'success', error: null }
      }));
    } catch (error) {
      console.error('❌ Daily API 오류:', error);
      setResponses(prev => ({
        ...prev,
        daily: { data: null, status: 'error', error: error instanceof Error ? error.message : '알 수 없는 오류' }
      }));
    }
  };

  const fetchWeeklyData = async () => {
    setResponses(prev => ({
      ...prev,
      weekly: { ...prev.weekly, status: 'loading', error: null }
    }));

    try {
      const response = await fetch('/api/concert/weekly');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      setResponses(prev => ({
        ...prev,
        weekly: { data, status: 'success', error: null }
      }));
    } catch (error) {
      console.error('❌ Weekly API 오류:', error);
      setResponses(prev => ({
        ...prev,
        weekly: { data: null, status: 'error', error: error instanceof Error ? error.message : '알 수 없는 오류' }
      }));
    }
  };

  // 모든 API 호출
  const fetchAllData = async () => {
    setIsLoading(true);
    console.log('🚀 콘서트 개별 현황 API 호출 시작');
    
    try {
      await Promise.all([
        fetchBepData(),
        fetchDailyData(),
        fetchWeeklyData(), // 노트 정보를 위한 Weekly API 호출
      ]);
      
    } finally {
      setIsLoading(false);
      console.log('✅ 콘서트 개별 현황 API 호출 완료');
    }
  };

  // 재시도 함수
  const retryAll = () => {
    console.log('🔄 콘서트 개별 현황 API 재시도');
    fetchAllData();
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchAllData();
  }, []);

  // 에러 상태 계산
  const hasErrors = Object.values(responses).some(response => response.status === 'error');

  return {
    responses,
    isLoading,
    hasErrors,
    retryAll,
    fetchBepData,
    fetchDailyData,
    fetchWeeklyData,
  };
} 