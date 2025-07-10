import axios from 'axios';

// 환경별 Base URL 설정
const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  
  // 운영환경 기본값
  return 'http://35.208.29.100:3001';
};

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config: any) => {
    console.log(`🚀 API 요청: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: any) => {
    console.error('❌ API 요청 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response: any) => {
    console.log(`✅ API 응답: ${response.config.url}`, response.data);
    return response;
  },
  (error: any) => {
    console.error('❌ API 응답 에러:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// 콘서트 API 타입 정의
export interface ConcertDailyData {
  liveId: string;
  liveName: string;
  recordDate: string;
  recordMonth: string;
  recordWeek: string;
  dailySalesTicketNo: number;
  dailySalesAmount: number;
}

export interface ConcertOverview {
  yesterdaySales: string;
  accumulatedSales: string;
  weeklySales: string;
  dailyAvgSales: string;
}

export interface ConcertBEP {
  liveId: string;
  liveName: string;
  seatClass: string;
  totalSeats: number;
  soldSeats: number;
  remainingSeats: number;
  bepSeats: string;
  bepRatio: string;
}

export interface ConcertEstimatedProfit {
  liveName: string;
  bep: string;
  estSales: string;
  finalProfit: string;
}

export interface ConcertTargetSales {
  liveName: string;
  targetSales: string;
  salesAcc: string;
  targetRatio: string;
}

export interface ConcertMarketingCalendar {
  liveName: string;
  weekStartDate: string;
  weekEndDate: string;
  salesMarketing: string | null;
  promotion: string | null;
  etc: string | null;
}

export interface ConcertMonthlyData {
  liveId: string;
  liveName: string;
  recordMonth: string;
  monthlySalesAmount: string;
}

// 콘서트 API 클래스
export class ConcertAPI {
  // 일일 매출 데이터
  static async getDailyData(): Promise<ConcertDailyData[]> {
    const response = await apiClient.get<ConcertDailyData[]>('/concert/daily');
    return response.data;
  }

  // 전체 개요 (대시보드용)
  static async getOverview(): Promise<ConcertOverview[]> {
    const response = await apiClient.get<ConcertOverview[]>('/concert/overview');
    return response.data;
  }

  // BEP 분석 (손익분기점)
  static async getBEP(): Promise<ConcertBEP[]> {
    const response = await apiClient.get<ConcertBEP[]>('/concert/bep');
    return response.data;
  }

  // 예상 수익
  static async getEstimatedProfit(): Promise<ConcertEstimatedProfit[]> {
    const response = await apiClient.get<ConcertEstimatedProfit[]>('/concert/estimated-profit');
    return response.data;
  }

  // 목표 달성률
  static async getTargetSales(): Promise<ConcertTargetSales[]> {
    const response = await apiClient.get<ConcertTargetSales[]>('/concert/target-sales');
    return response.data;
  }

  // 마케팅 캘린더
  static async getMarketingCalendar(): Promise<ConcertMarketingCalendar[]> {
    const response = await apiClient.get<ConcertMarketingCalendar[]>('/concert/marketing-calendar');
    return response.data;
  }

  // 월간 매출 데이터
  static async getMonthlyData(): Promise<ConcertMonthlyData[]> {
    const response = await apiClient.get<ConcertMonthlyData[]>('/concert/monthly');
    return response.data;
  }
}

// 환경 정보 유틸리티
export const getEnvironmentInfo = () => {
  const baseURL = getBaseURL();
  const isLocal = baseURL.includes('localhost');
  
  return {
    baseURL,
    environment: isLocal ? 'development' : 'production',
    swaggerURL: `${baseURL}/api-docs`,
  };
};

// API 연결 테스트
export const testAPIConnection = async () => {
  try {
    const response = await apiClient.get('/concert/overview');
    return {
      success: true,
      message: 'API 연결 성공',
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'API 연결 실패',
      error: error.message,
    };
  }
};

export default apiClient; 