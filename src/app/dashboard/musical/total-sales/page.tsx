'use client';

import TheaterSalesCard from '@/components/dashboard/TheaterSalesCard';
import TheaterSalesTable from '@/components/dashboard/TheaterSalesTable';

export default function MusicalTotalSalesPage() {
  // 실제로는 API나 데이터베이스에서 가져올 데이터입니다
  const totalData = {
    totalSales: 185000000,
    totalTarget: 200000000,
    dailySales: 7500000,
    dailyTarget: 8000000,
  };

  const performanceData = [
    {
      title: '레미제라블',
      totalSales: 65000000,
      totalTarget: 70000000,
      dailySales: 3000000,
      dailyTarget: 3500000,
    },
    {
      title: '팬텀 오브 오페라',
      totalSales: 55000000,
      totalTarget: 60000000,
      dailySales: 2500000,
      dailyTarget: 2800000,
    },
    {
      title: '시카고',
      totalSales: 35000000,
      totalTarget: 40000000,
      dailySales: 1500000,
      dailyTarget: 1800000,
    },
    {
      title: '맘마미아',
      totalSales: 30000000,
      totalTarget: 30000000,
      dailySales: 500000,
      dailyTarget: 900000,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">뮤지컬 통합 티켓 판매 현황</h1>
        <TheaterSalesCard
          title="뮤지컬 통합 매출"
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