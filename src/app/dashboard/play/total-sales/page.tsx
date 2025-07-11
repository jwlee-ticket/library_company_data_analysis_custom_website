'use client';

import TheaterSalesCard from '@/components/dashboard/TheaterSalesCard';
import TheaterSalesTable from '@/components/dashboard/TheaterSalesTable';

export default function PlayTotalSalesPage() {
  // 연극과 뮤지컬 통합 데이터
  const totalData = {
    totalSales: 310000000, // 연극 125M + 뮤지컬 185M
    totalTarget: 350000000, // 연극 150M + 뮤지컬 200M
    dailySales: 12500000, // 연극 5M + 뮤지컬 7.5M
    dailyTarget: 14000000, // 연극 6M + 뮤지컬 8M
  };

  const performanceData = [
    // 뮤지컬
    {
      title: '레미제라블 (뮤지컬)',
      totalSales: 65000000,
      totalTarget: 70000000,
      dailySales: 3000000,
      dailyTarget: 3500000,
    },
    {
      title: '팬텀 오브 오페라 (뮤지컬)',
      totalSales: 55000000,
      totalTarget: 60000000,
      dailySales: 2500000,
      dailyTarget: 2800000,
    },
    // 연극
    {
      title: '바닷마을 다이어리 (연극)',
      totalSales: 45000000,
      totalTarget: 50000000,
      dailySales: 2000000,
      dailyTarget: 2500000,
    },
    {
      title: '시카고 (뮤지컬)',
      totalSales: 35000000,
      totalTarget: 40000000,
      dailySales: 1500000,
      dailyTarget: 1800000,
    },
    {
      title: '타인의 삶 (연극)',
      totalSales: 35000000,
      totalTarget: 40000000,
      dailySales: 1500000,
      dailyTarget: 1800000,
    },
    {
      title: '맘마미아 (뮤지컬)',
      totalSales: 30000000,
      totalTarget: 30000000,
      dailySales: 500000,
      dailyTarget: 900000,
    },
    {
      title: '사운드 인사이드 (연극)',
      totalSales: 25000000,
      totalTarget: 35000000,
      dailySales: 1000000,
      dailyTarget: 1200000,
    },
    {
      title: '붉은 낙엽 (연극)',
      totalSales: 20000000,
      totalTarget: 25000000,
      dailySales: 500000,
      dailyTarget: 500000,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">연극 & 뮤지컬 통합 티켓 판매 현황</h1>
        <TheaterSalesCard
          title="연극 & 뮤지컬 통합 매출"
          totalSales={totalData.totalSales}
          totalTarget={totalData.totalTarget}
          dailySales={totalData.dailySales}
          dailyTarget={totalData.dailyTarget}
          backgroundColor="bg-white"
        />
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">공연별 매출 현황</h2>
        <div className="bg-white rounded-lg shadow">
          <TheaterSalesTable performances={performanceData} />
        </div>
      </div>
    </div>
  );
} 