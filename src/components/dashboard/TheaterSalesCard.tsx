'use client';

import { useMemo } from 'react';

interface TheaterSalesCardProps {
  title: string;
  totalSales: number;
  totalTarget: number;
  dailySales: number;
  dailyTarget: number;
  backgroundColor?: string;
}

export default function TheaterSalesCard({
  title,
  totalSales,
  totalTarget,
  dailySales,
  dailyTarget,
  backgroundColor = 'bg-white'
}: TheaterSalesCardProps) {
  // useMemo를 사용하여 계산값 메모이제이션
  const totalAchievementRate = useMemo(() => 
    (totalSales / totalTarget) * 100
  , [totalSales, totalTarget]);

  const dailyAchievementRate = useMemo(() => 
    (dailySales / dailyTarget) * 100
  , [dailySales, dailyTarget]);
  
  // 숫자 포맷팅
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className={`${backgroundColor} rounded-lg shadow-lg p-6`}>
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 총 매출 정보 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">총 매출</p>
            <p className="text-2xl font-bold text-gray-800">{formatNumber(totalSales)}</p>
          </div>
          <div className="mb-2">
            <p className="text-sm text-gray-600 mb-1">목표 매출</p>
            <p className="text-lg text-gray-700">{formatNumber(totalTarget)}</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">달성률</span>
              <span className="text-sm font-semibold text-gray-800">
                {totalAchievementRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                style={{ width: `${Math.min(totalAchievementRate, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 당일 매출 정보 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">당일 매출</p>
            <p className="text-2xl font-bold text-gray-800">{formatNumber(dailySales)}</p>
          </div>
          <div className="mb-2">
            <p className="text-sm text-gray-600 mb-1">당일 목표</p>
            <p className="text-lg text-gray-700">{formatNumber(dailyTarget)}</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">달성률</span>
              <span className="text-sm font-semibold text-gray-800">
                {dailyAchievementRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                style={{ width: `${Math.min(dailyAchievementRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 