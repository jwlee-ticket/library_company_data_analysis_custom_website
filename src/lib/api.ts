import axios from 'axios';

// 환경별 Base URL 설정
const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  
  // 개발환경에서는 로컬 서버 사용
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001';
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
    console.error('❌ API 응답 에러:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });
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

export interface ConcertWeeklyData {
  liveId: string;
  liveName: string;
  recordWeek: string;
  weeklySalesTicketNo: number;
  weeklySalesAmount: number;
  noteSalesMarketing: string | null;
  notePromotion: string | null;
  noteEtc: string | null;
}


// 콘서트 API 클래스
export class ConcertAPI {
  // 일일 매출 데이터 (프록시 사용)
  static async getDailyData(): Promise<ConcertDailyData[]> {
    const response = await fetch('/api/concert/daily');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // 전체 개요 (대시보드용) - 프록시 사용
  static async getOverview(): Promise<ConcertOverview[]> {
    const response = await fetch('/api/concert/overview');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // BEP 분석 (손익분기점) - 프록시 사용
  static async getBEP(): Promise<ConcertBEP[]> {
    const response = await fetch('/api/concert/bep');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // 예상 수익 - 프록시 사용
  static async getEstimatedProfit(): Promise<ConcertEstimatedProfit[]> {
    const response = await fetch('/api/concert/estimated-profit');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // 목표 달성률 - 프록시 사용
  static async getTargetSales(): Promise<ConcertTargetSales[]> {
    const response = await fetch('/api/concert/target-sales');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // 마케팅 캘린더 - 프록시 사용
  static async getMarketingCalendar(): Promise<ConcertMarketingCalendar[]> {
    const response = await fetch('/api/concert/marketing-calendar');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // 월간 매출 데이터 - 프록시 사용
  static async getMonthlyData(): Promise<ConcertMonthlyData[]> {
    const response = await fetch('/api/concert/monthly');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // 주간 매출 데이터 - 프록시 사용
  static async getWeeklyData(): Promise<ConcertWeeklyData[]> {
    const response = await fetch('/api/concert/weekly');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }


}

// 환경 정보 유틸리티
// 연극/뮤지컬 API 타입 정의
export interface PlayWeeklyOverview {
  liveId?: string;
  liveName?: string;
  targetShare?: string;
  avgPaidShare?: string;
  totalTargetSales?: string;
  totalActualSales?: string;
  weekBeforeLastTotalActualSales?: string;
}

export interface PlayDailyDetail {
  id?: number;                            // 고유 ID
  liveId?: string;                        // 공연 ID
  liveName?: string;                      // 공연명
  latestRecordDate?: string;              // 최신 기록일
  showTotalSeatNumber?: number;           // 총 좌석수
  dailySales?: number;                    // 일일 매출
  start_date?: string;                    // 공연 시작일
  end_date?: string;                      // 공연 종료일
  recordDate?: string;                    // 기록일
  showDateTime?: string;                  // 공연 일시
  cast?: string;                          // 캐스트
  
  // 유료 좌석 정보
  paidSeatSales?: number | string;        // 유료 좌석 매출
  paidSeatTot?: number | string;          // 총 유료 좌석수
  paidSeatVip?: number;                   // VIP 유료 좌석수
  paidSeatA?: number;                     // A석 유료 좌석수
  paidSeatS?: number;                     // S석 유료 좌석수
  paidSeatR?: number;                     // R석 유료 좌석수
  
  // 초대권 좌석 정보
  inviteSeatTot?: number;                 // 총 초대권 좌석수
  inviteSeatVip?: number;                 // VIP 초대권 좌석수
  inviteSeatA?: number;                   // A석 초대권 좌석수
  inviteSeatS?: number;                   // S석 초대권 좌석수
  inviteSeatR?: number;                   // R석 초대권 좌석수
  
  // 점유율 정보
  depositShare?: string;                  // 예매 점유율
  paidShare?: string;                     // 유료 점유율
  freeShare?: string;                     // 무료 점유율
  
  playUploadId?: number;                  // 업로드 ID
}

export interface PlayOccupancyRate {
  liveId?: string;                    // 공연 ID
  liveName?: string;                  // 공연명
  weekStartDate?: string;             // 주 시작일 (YYYY-MM-DD)
  weekEndDate?: string;               // 주 종료일 (YYYY-MM-DD)
  paidSharePercentage?: number | string; // 유료 객석 점유율 (%) - API에서 문자열로 반환될 수 있음
  weeklyShowCount?: number | string;     // 해당 주 공연 횟수 - API에서 문자열로 반환될 수 있음
}

// 신규 API 타입들
export interface PlayAllShowtime {
  liveId_?: string;
  liveName?: string;
  latestRecordDate?: Date;
  bep?: number;
  id?: number;
  recordDate?: Date;
  liveId?: string;
  showDateTime?: Date;
  cast?: string;
  paidSeatSales?: number;
  paidSeatTot?: number;
  paidSeatVip?: number;
  paidSeatA?: number;
  paidSeatS?: number;
  paidSeatR?: number;
  paidBadSeatA?: number;
  paidBadSeatS?: number;
  paidBadSeatR?: number;
  paidDisableSeat?: number;
  inviteSeatTot?: number;
  inviteSeatVip?: number;
  inviteSeatA?: number;
  inviteSeatS?: number;
  inviteSeatR?: number;
  inviteBadSeatA?: number;
  inviteBadSeatS?: number;
  inviteBadSeatR?: number;
  inviteDisableSeat?: number;
  depositShare?: number;
  paidShare?: number;
  freeShare?: number;
  playUploadId?: number;
}

export interface PlayMonthlySummary {
  month_str?: string;
  total_revenue?: number;
  absolute_change?: number;
  percentage_change?: number;
  note?: string;
}

export interface PlayMonthlyByPerformance {
  month?: string;
  performance_name?: string;
  total_revenue?: number;
  absolute_change?: number;
  percentage_change?: number;
}

export interface PlayRevenueAnalysis {
  liveId?: string;
  liveName?: string;
  category?: string;
  total_sales?: number;
  total_target?: number;
  total_sales_target_ratio?: number;
  latest_day_sales?: number;
  latest_day_target?: number;
  latest_day_sales_target_ratio?: number;
  latestRecordDate?: string;
}

export interface PlayCastRevenue {
  liveId?: string;                        // 공연 ID
  liveName?: string;                      // 공연명
  cast?: string;                          // 캐스트 조합
  totalpaidseatsales?: string | number;   // 총 유료 좌석 매출 (문자열로 반환)
  showcount?: string | number;            // 공연 횟수 (문자열로 반환)
}

export interface PlaySummary {
  weeklyOverview?: PlayWeeklyOverview[];
  dailyDetails?: PlayDailyDetail[];
  occupancyRate?: PlayOccupancyRate[];
  timestamp?: string;
}

// 연극/뮤지컬 API 클래스
export class PlayAPI {
  // 주간 현황 데이터 (프록시 사용)
  static async getWeeklyOverview(): Promise<PlayWeeklyOverview[]> {
    const response = await fetch('/api/play/weekly-overview');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // 공연별 상세 정보 (프록시 사용)
  static async getDailyDetails(): Promise<PlayDailyDetail[]> {
    const response = await fetch('/api/play/daily-details');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // 유료 점유율 데이터 (프록시 사용)
  static async getOccupancyRate(): Promise<PlayOccupancyRate[]> {
    const response = await fetch('/api/play/occupancy-rate');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // 신규 API 메소드들
  // 전체 공연 일정 조회
  static async getAllShowtime(): Promise<PlayAllShowtime[]> {
    const response = await fetch('/api/play/all-showtime');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // 월별 전체 매출 조회
  static async getMonthlySummary(): Promise<PlayMonthlySummary[]> {
    const response = await fetch('/api/play/monthly-summary');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // 월별 공연별 매출 조회
  static async getMonthlyByPerformance(): Promise<PlayMonthlyByPerformance[]> {
    const response = await fetch('/api/play/monthly-by-performance');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // 매출 분석 조회
  static async getRevenueAnalysis(): Promise<PlayRevenueAnalysis[]> {
    const response = await fetch('/api/play/revenue-analysis');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // 캐스트별 매출 조회
  static async getCastRevenue(): Promise<PlayCastRevenue[]> {
    const response = await fetch('/api/play/cast-revenue');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // 통합 대시보드 데이터 조회
  static async getSummary(): Promise<PlaySummary> {
    const response = await fetch('/api/play/summary');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }
}

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