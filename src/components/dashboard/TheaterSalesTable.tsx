'use client';

interface TheaterPerformance {
  title: string;
  totalSales: number;
  totalTarget: number;
  dailySales: number;
  dailyTarget: number;
}

interface TheaterSalesTableProps {
  performances: TheaterPerformance[];
}

export default function TheaterSalesTable({ performances }: TheaterSalesTableProps) {
  // 숫자 포맷팅
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(num);
  };

  // 달성률 계산
  const calculateAchievementRate = (current: number, target: number) => {
    return ((current / target) * 100).toFixed(1);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              공연명
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              총 매출
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              총 목표 매출
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              총 달성률
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              당일 매출
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              당일 목표
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              당일 달성률
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {performances.map((performance, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {performance.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatNumber(performance.totalSales)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatNumber(performance.totalTarget)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end space-x-2">
                  <span className="text-sm text-gray-900">
                    {calculateAchievementRate(performance.totalSales, performance.totalTarget)}%
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 rounded-full h-1.5"
                      style={{
                        width: `${Math.min(
                          (performance.totalSales / performance.totalTarget) * 100,
                          100
                        )}%`
                      }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatNumber(performance.dailySales)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatNumber(performance.dailyTarget)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end space-x-2">
                  <span className="text-sm text-gray-900">
                    {calculateAchievementRate(performance.dailySales, performance.dailyTarget)}%
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 rounded-full h-1.5"
                      style={{
                        width: `${Math.min(
                          (performance.dailySales / performance.dailyTarget) * 100,
                          100
                        )}%`
                      }}
                    />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 