'use client';

interface SalesCardProps {
  title: string;
  currentSales: number;
  targetSales: number;
  previousDaySales: number;
  backgroundColor?: string;
}

export default function SalesCard({
  title,
  currentSales,
  targetSales,
  previousDaySales,
  backgroundColor = 'bg-white'
}: SalesCardProps) {
  // 목표 달성률 계산
  const achievementRate = (currentSales / targetSales) * 100;
  
  // 전일 대비 증감률 계산
  const growthRate = ((currentSales - previousDaySales) / previousDaySales) * 100;
  
  // 숫자 포맷팅 함수
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className={`${backgroundColor} rounded-lg shadow-lg p-6 transform transition-all duration-300 hover:scale-105`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <div className="flex items-center">
          <span className={`text-sm font-semibold ${growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {growthRate >= 0 ? '↑' : '↓'} {Math.abs(growthRate).toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500 ml-1">전일대비</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-gray-600 text-sm">현재 매출</span>
            <span className="text-2xl font-bold text-gray-800">{formatNumber(currentSales)}</span>
          </div>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-gray-600 text-sm">목표 매출</span>
            <span className="text-lg text-gray-600">{formatNumber(targetSales)}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">목표 달성률</span>
            <span className="text-sm font-semibold text-gray-800">{achievementRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 rounded-full h-2 transition-all duration-500"
              style={{ width: `${Math.min(achievementRate, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 