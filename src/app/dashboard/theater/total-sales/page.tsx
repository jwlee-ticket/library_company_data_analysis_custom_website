'use client';

import TheaterSalesCard from '@/components/dashboard/TheaterSalesCard';
import TheaterSalesTable from '@/components/dashboard/TheaterSalesTable';

export default function TheaterTotalSalesPage() {
  // 실제로는 API나 데이터베이스에서 가져올 데이터입니다
  const totalData = {
    totalSales: 125000000,
    totalTarget: 150000000,
    dailySales: 5000000,
    dailyTarget: 6000000,
  };

  const performanceData = [
    {
      title: '바닷마을 다이어리',
      totalSales: 45000000,
      totalTarget: 50000000,
      dailySales: 2000000,
      dailyTarget: 2500000,
    },
    {
      title: '타인의 삶',
      totalSales: 35000000,
      totalTarget: 40000000,
      dailySales: 1500000,
      dailyTarget: 1800000,
    },
    {
      title: '사운드 인사이드',
      totalSales: 25000000,
      totalTarget: 35000000,
      dailySales: 1000000,
      dailyTarget: 1200000,
    },
    {
      title: '붉은 낙엽',
      totalSales: 20000000,
      totalTarget: 25000000,
      dailySales: 500000,
      dailyTarget: 500000,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">연극 통합 티켓 판매 현황</h1>
        <TheaterSalesCard
          title="연극 통합 매출"
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