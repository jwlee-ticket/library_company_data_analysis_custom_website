# Play API 상세 가이드 (프론트엔드용)

## 1. 🎯 /api/play/summary (통합 대시보드 API)

### 용도
- 메인 대시보드에서 필요한 모든 데이터를 한 번에 제공
- 초기 로딩 시 권장 사용
- 3개의 하위 API 데이터를 통합하여 반환

### 응답 형태
```typescript
{
  weeklyOverview: ViewLlmPlayWeeklyA[],    // 주간 목표 대비 실적
  dailyDetails: ViewLlmPlayDaily[],        // 공연별 상세 정보  
  occupancyRate: ViewLlmPlayWeeklyPaidshare[], // 유료 점유율
  timestamp: string                        // 데이터 조회 시간
}
```

### 사용 예시
```typescript
const dashboardData = await fetch('/api/play/summary').then(res => res.json());
```

---

## 2. 📊 /api/play/weekly-overview (주간 목표 대비 실적)

### 용도
- 지난주 목표점유율 vs 실제점유율 비교
- 지난주 목표매출 vs 실제매출 비교
- 전주 대비 매출 성장률 계산
- 차트 및 KPI 대시보드용

### 응답 필드
```typescript
interface WeeklyOverview {
  liveId: string;                          // 공연 ID
  liveName: string;                        // 공연명
  targetShare: number;                     // 지난주 목표점유율 (%)
  avgPaidShare: number;                    // 지난주 실제점유율 (%)
  totalTargetSales: number;                // 지난주 목표매출 (원)
  totalActualSales: number;                // 지난주 실제매출 (원)
  weekBeforeLastTotalActualSales: number;  // 지지난주 실제매출 (원)
}
```

### 프론트엔드 활용법
- 목표 대비 실적 진행률 바 차트
- 전주 대비 성장률 계산: `(totalActualSales - weekBeforeLastTotalActualSales) / weekBeforeLastTotalActualSales * 100`
- 점유율 도넛 차트: `targetShare` vs `avgPaidShare`

---

## 3. 📋 /api/play/daily-details (공연별 상세 정보)

### 용도
- 개별 공연의 상세 매출 및 좌석 정보
- 캐스트별 성과 분석
- 일자별 공연 현황 테이블
- 좌석등급별 판매 현황

### 응답 필드
```typescript
interface DailyDetails {
  id: number;                    // 고유 ID
  liveId: string;               // 공연 ID
  liveName: string;             // 공연명
  latestRecordDate: Date;       // 최신 기록일
  showTotalSeatNumber: number;  // 총 좌석수
  dailySales: number;           // 티켓판매일매출
  start_date: Date;             // 공연 시작일
  end_date: Date;               // 공연 종료일
  recordDate: Date;             // 기록일
  showDateTime: Date;           // 공연 일시
  cast: string;                 // 캐스트
  
  // 유료 좌석 정보
  paidSeatSales: number;        // 유료 좌석 매출
  paidSeatTot: number;          // 총 유료 좌석수
  paidSeatVip: number;          // VIP 유료 좌석수
  paidSeatA: number;            // A석 유료 좌석수
  paidSeatS: number;            // S석 유료 좌석수
  paidSeatR: number;            // R석 유료 좌석수
  
  // 시야제한석
  paidBadSeatA: number;         // A석 시야제한
  paidBadSeatS: number;         // S석 시야제한
  paidBadSeatR: number;         // R석 시야제한
  paidDisableSeat: number;      // 장애인석
  
  // 초대권 좌석 정보
  inviteSeatTot: number;        // 총 초대권 좌석수
  inviteSeatVip: number;        // VIP 초대권 좌석수
  inviteSeatA: number;          // A석 초대권 좌석수
  inviteSeatS: number;          // S석 초대권 좌석수
  inviteSeatR: number;          // R석 초대권 좌석수
  inviteBadSeatA: number;       // A석 초대권 시야제한
  inviteBadSeatS: number;       // S석 초대권 시야제한
  inviteBadSeatR: number;       // R석 초대권 시야제한
  inviteDisableSeat: number;    // 초대권 장애인석
  
  // 점유율 정보
  depositShare: number;         // 예매 점유율
  paidShare: number;            // 유료 점유율
  freeShare: number;            // 무료 점유율
  
  playUploadId: number;         // 업로드 ID
}
```

### 프론트엔드 활용법
- 공연별 상세 테이블
- 캐스트별 필터링
- 좌석등급별 파이 차트
- 일자별 매출 트렌드 라인 차트

---

## 4. 📈 /api/play/occupancy-rate (유료 점유율)

### 용도
- 주간별 유료 객석 점유율 트렌드
- 시계열 차트 데이터
- 공연 효율성 모니터링

### 응답 필드
```typescript
interface OccupancyRate {
  liveId: string;              // 공연 ID
  liveName: string;            // 공연명
  weekStartDate: string;       // 주 시작일 (YYYY-MM-DD)
  weekEndDate: string;         // 주 종료일 (YYYY-MM-DD)
  paidSharePercentage: number; // 유료 객석 점유율 (%)
  weeklyShowCount: number;     // 해당 주 공연 횟수
}
```

### 프론트엔드 활용법
- 시계열 라인 차트: `weekStartDate` (x축) vs `paidSharePercentage` (y축)
- 공연별 색상 구분
- 주간 공연 횟수 툴팁 표시

---

## 5. 🗓️ /api/play/all-showtime (전체 공연 일정)

### 용도
- 모든 공연의 일정 관리
- 캐스트별 공연 스케줄
- 좌석별 상세 판매 현황
- 손익분기점 대비 실적

### 응답 필드
```typescript
interface AllShowtime {
  liveId_: string;              // 공연 ID (메인)
  liveName: string;             // 공연명
  latestRecordDate: Date;       // 최신 기록일
  bep: number;                  // 손익분기점 (Break Even Point)
  id: number;                   // 고유 ID
  recordDate: Date;             // 기록일
  liveId: string;               // 공연 ID
  showDateTime: Date;           // 공연 일시
  cast: string;                 // 캐스트
  
  // 유료 좌석 정보
  paidSeatSales: number;        // 유료 좌석 매출
  paidSeatTot: number;          // 총 유료 좌석수
  paidSeatVip: number;          // VIP 좌석수
  paidSeatA: number;            // A석 좌석수
  paidSeatS: number;            // S석 좌석수
  paidSeatR: number;            // R석 좌석수
  paidBadSeatA: number;         // A석 시야제한
  paidBadSeatS: number;         // S석 시야제한
  paidBadSeatR: number;         // R석 시야제한
  paidDisableSeat: number;      // 장애인석
  
  // 초대권 좌석 정보
  inviteSeatTot: number;        // 총 초대권 좌석수
  inviteSeatVip: number;        // VIP 초대권
  inviteSeatA: number;          // A석 초대권
  inviteSeatS: number;          // S석 초대권
  inviteSeatR: number;          // R석 초대권
  inviteBadSeatA: number;       // A석 초대권 시야제한
  inviteBadSeatS: number;       // S석 초대권 시야제한
  inviteBadSeatR: number;       // R석 초대권 시야제한
  inviteDisableSeat: number;    // 초대권 장애인석
  
  // 점유율 정보
  depositShare: number;         // 예매 점유율
  paidShare: number;            // 유료 점유율
  freeShare: number;            // 무료 점유율
  
  playUploadId: number;         // 업로드 ID
}
```

### 프론트엔드 활용법
- 캘린더뷰: `showDateTime`으로 일정 표시
- 손익분기점 달성률: `(paidSeatSales / bep) * 100`
- 캐스트별 필터링 및 그룹핑
- 좌석등급별 판매율 히트맵

---

## 6. 📅 /api/play/monthly-summary (월별 전체 매출)

### 용도
- 최근 1년간 월별 매출 트렌드
- 전월 대비 증감률 분석
- 매출 성장 추이 모니터링

### 응답 필드
```typescript
interface MonthlySummary {
  month_str: string;           // 월 (YYYY-MM 형태)
  total_revenue: number;       // 총 매출 (원)
  absolute_change: number;     // 절대 변화량 (원)
  percentage_change: number;   // 전월 대비 증감률 (%)
  note: string;               // 특이사항 메모
}
```

### 프론트엔드 활용법
- 월별 매출 바 차트: `month_str` (x축) vs `total_revenue` (y축)
- 증감률 라인 차트: `percentage_change`
- 증감 화살표 표시: `absolute_change` 양수/음수에 따라
- 특이사항 툴팁: `note` 필드 활용

---

## 7. 🎭 /api/play/monthly-by-performance (월별 공연별 매출)

### 용도
- 월별 각 공연의 매출 비교
- 공연별 성과 분석
- 시즌별 인기 공연 파악

### 응답 필드
```typescript
interface MonthlyByPerformance {
  month: string;                // 월 (YYYY-MM 형태)
  performance_name: string;     // 공연명
  total_revenue: number;        // 총 매출 (원)
  absolute_change: number;      // 절대 변화량 (원)
  percentage_change: number;    // 전월 대비 증감률 (%)
}
```

### 프론트엔드 활용법
- 스택 바 차트: 월별로 각 공연의 매출 비중
- 공연별 트렌드 라인: 각 공연의 월별 매출 추이
- 히트맵: 공연(y축) × 월(x축) × 매출(색상)
- 공연별 성장률 순위

---

## 8. 💰 /api/play/revenue-analysis (종합 매출 분석)

### 용도
- 공연별 총 매출 및 목표 달성률
- 최근 일자 매출 현황
- 전체적인 수익성 분석

### 응답 필드
```typescript
interface RevenueAnalysis {
  liveId: string;                        // 공연 ID
  liveName: string;                      // 공연명
  category: string;                      // 카테고리
  total_sales: number;                   // 총 매출 (원)
  total_target: number;                  // 총 목표 매출 (원)
  total_sales_target_ratio: number;     // 총 매출 목표 달성률 (%)
  latest_day_sales: number;             // 최근 일자 매출 (원)
  latest_day_target: number;            // 최근 일자 목표 (원)
  latest_day_sales_target_ratio: number; // 최근 일자 목표 달성률 (%)
  latestRecordDate: string;             // 최신 기록일 (YYYY-MM-DD)
}
```

### 프론트엔드 활용법
- 목표 달성률 프로그레스 바: `total_sales_target_ratio`
- 공연별 매출 순위 테이블
- 일일 목표 vs 실적 비교 차트
- 카테고리별 그룹핑 및 필터링

---

## 9. 🎪 /api/play/cast-revenue (캐스트별 매출)

### 용도
- 캐스트별 매출 기여도 분석
- 인기 캐스트 성과 측정
- 공연 횟수 대비 매출 효율성

### 응답 필드
```typescript
interface CastRevenue {
  liveId: string;              // 공연 ID
  liveName: string;            // 공연명  
  cast: string;                // 캐스트명
  totalpaidseatsales: number;  // 총 유료 좌석 매출 (원)
  showcount: number;           // 공연 횟수
}
```

### 프론트엔드 활용법
- 캐스트별 매출 순위 차트
- 1회 공연당 평균 매출: `totalpaidseatsales / showcount`
- 공연별 캐스트 비교 테이블
- 캐스트 효율성 스캐터 차트: 공연횟수(x축) vs 총매출(y축)

---

## 사용 권장사항

### 초기 로딩
```typescript
// 메인 대시보드 - summary API 사용 권장
const data = await fetch('/api/play/summary').then(res => res.json());
```

### 상세 분석
```typescript
// 특정 분석이 필요한 경우 개별 API 조합
const [monthly, cast, revenue] = await Promise.all([
  fetch('/api/play/monthly-summary').then(res => res.json()),
  fetch('/api/play/cast-revenue').then(res => res.json()),
  fetch('/api/play/revenue-analysis').then(res => res.json())
]);
```

### 에러 처리
```typescript
try {
  const response = await fetch('/api/play/weekly-overview');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();
} catch (error) {
  console.error('API 호출 실패:', error);
}
```