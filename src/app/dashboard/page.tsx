'use client';

import SalesCard from '@/components/dashboard/SalesCard';
import SalesTable from '@/components/dashboard/SalesTable';
import { IoMdArrowDropup, IoMdArrowDropdown } from 'react-icons/io';

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  comparison?: {
    value: number;
    label: string;
  };
}

function SummaryCard({ title, value, subtitle, comparison }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {comparison && (
        <div className="flex items-center mt-2">
          {comparison.value > 0 ? (
            <IoMdArrowDropup className="text-green-500 text-xl" />
          ) : comparison.value < 0 ? (
            <IoMdArrowDropdown className="text-red-500 text-xl" />
          ) : null}
          <span className={`text-sm ${
            comparison.value > 0 ? 'text-green-600' : 
            comparison.value < 0 ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {Math.abs(comparison.value).toLocaleString()}원
          </span>
          <span className="text-sm text-gray-500 ml-1">
            {comparison.label}
          </span>
        </div>
      )}
      {subtitle && (
        <p className="text-sm text-gray-600 mt-2">{subtitle}</p>
      )}
    </div>
  );
}

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

  const totalCurrent = salesData.theater.current + salesData.musical.current + salesData.concert.current;
  const totalTarget = salesData.theater.target + salesData.musical.target + salesData.concert.target;
  const totalPreviousDay = salesData.theater.previousDay + salesData.musical.previousDay + salesData.concert.previousDay;
  const achievementRate = ((totalCurrent / totalTarget) * 100).toFixed(1);
  const dailyChange = totalCurrent - totalPreviousDay;

  return (
    <div className="space-y-8">
      {/* 전체 매출 요약 */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">전체 매출 요약</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard
            title="총 매출"
            value={new Intl.NumberFormat('ko-KR', {
              style: 'currency',
              currency: 'KRW',
              maximumFractionDigits: 0
            }).format(totalCurrent)}
            comparison={{
              value: dailyChange,
              label: "전일 대비"
            }}
          />
          <SummaryCard
            title="총 목표"
            value={new Intl.NumberFormat('ko-KR', {
              style: 'currency',
              currency: 'KRW',
              maximumFractionDigits: 0
            }).format(totalTarget)}
          />
          <SummaryCard
            title="전체 달성률"
            value={`${achievementRate}%`}
            subtitle={`목표 대비 ${achievementRate}% 달성`}
          />
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
            backgroundColor="bg-white"
          />
          
          <SalesCard
            title="뮤지컬 매출"
            currentSales={salesData.musical.current}
            targetSales={salesData.musical.target}
            previousDaySales={salesData.musical.previousDay}
            backgroundColor="bg-white"
          />
          
          <SalesCard
            title="콘서트 매출"
            currentSales={salesData.concert.current}
            targetSales={salesData.concert.target}
            previousDaySales={salesData.concert.previousDay}
            backgroundColor="bg-white"
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