'use client';

import SalesCard from '@/components/dashboard/SalesCard';
import SalesTable from '@/components/dashboard/SalesTable';

export default function DashboardPage() {
  // 실제로는 API나 데이터베이스에서 가져올 데이터입니다
  const salesData = {
    theater: {
      current: 125000000,
      target: 150000000,
      previousDay: 120000000,
    },
    musical: {
      current: 280000000,
      target: 300000000,
      previousDay: 260000000,
    },
    concert: {
      current: 180000000,
      target: 200000000,
      previousDay: 175000000,
    }
  };

  // 공연별 상세 데이터
  const performanceData = [
    {
      genre: '연극' as const,
      title: '햄릿',
      currentSales: 45000000,
      targetSales: 50000000,
    },
    {
      genre: '연극' as const,
      title: '로미오와 줄리엣',
      currentSales: 80000000,
      targetSales: 100000000,
    },
    {
      genre: '뮤지컬' as const,
      title: '레미제라블',
      currentSales: 150000000,
      targetSales: 160000000,
    },
    {
      genre: '뮤지컬' as const,
      title: '오페라의 유령',
      currentSales: 130000000,
      targetSales: 140000000,
    },
    {
      genre: '콘서트' as const,
      title: '겨울 클래식',
      currentSales: 90000000,
      targetSales: 100000000,
    },
    {
      genre: '콘서트' as const,
      title: '재즈 페스티벌',
      currentSales: 90000000,
      targetSales: 100000000,
    },
  ];

  return (
    <div className="space-y-8">
      {/* 전체 매출 요약 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">전체 매출 요약</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">총 매출</p>
            <p className="text-2xl font-bold text-gray-800">
              {new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW',
                maximumFractionDigits: 0
              }).format(
                salesData.theater.current +
                salesData.musical.current +
                salesData.concert.current
              )}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">총 목표</p>
            <p className="text-2xl font-bold text-gray-800">
              {new Intl.NumberFormat('ko-KR', {
                style: 'currency',
                currency: 'KRW',
                maximumFractionDigits: 0
              }).format(
                salesData.theater.target +
                salesData.musical.target +
                salesData.concert.target
              )}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">전체 달성률</p>
            <p className="text-2xl font-bold text-gray-800">
              {(
                ((salesData.theater.current + salesData.musical.current + salesData.concert.current) /
                (salesData.theater.target + salesData.musical.target + salesData.concert.target)) *
                100
              ).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* 장르별 매출 현황 */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">장르별 매출 현황</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SalesCard
            title="연극 매출"
            currentSales={salesData.theater.current}
            targetSales={salesData.theater.target}
            previousDaySales={salesData.theater.previousDay}
            backgroundColor="bg-blue-50"
          />
          
          <SalesCard
            title="뮤지컬 매출"
            currentSales={salesData.musical.current}
            targetSales={salesData.musical.target}
            previousDaySales={salesData.musical.previousDay}
            backgroundColor="bg-purple-50"
          />
          
          <SalesCard
            title="콘서트 매출"
            currentSales={salesData.concert.current}
            targetSales={salesData.concert.target}
            previousDaySales={salesData.concert.previousDay}
            backgroundColor="bg-pink-50"
          />
        </div>
      </div>

      {/* 공연별 매출 현황 */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">공연별 매출 현황</h2>
        <div className="bg-white rounded-lg shadow">
          <SalesTable performances={performanceData} />
        </div>
      </div>
    </div>
  );
} 