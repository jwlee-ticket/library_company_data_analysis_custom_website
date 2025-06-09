'use client';

interface Performance {
  genre: '연극' | '뮤지컬' | '콘서트';
  title: string;
  currentSales: number;
  targetSales: number;
}

interface SalesTableProps {
  performances: Performance[];
}

export default function SalesTable({ performances }: SalesTableProps) {
  // 숫자 포맷팅 함수
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(num);
  };

  // 달성률 계산 함수
  const calculateAchievementRate = (current: number, target: number) => {
    return ((current / target) * 100).toFixed(1);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              장르
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              공연명
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              총 매출
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              목표 매출
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              달성률
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {performances.map((performance, index) => (
            <tr
              key={index}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${performance.genre === '연극' ? 'bg-blue-100 text-blue-800' : ''}
                  ${performance.genre === '뮤지컬' ? 'bg-purple-100 text-purple-800' : ''}
                  ${performance.genre === '콘서트' ? 'bg-pink-100 text-pink-800' : ''}
                `}>
                  {performance.genre}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {performance.title}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatNumber(performance.currentSales)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatNumber(performance.targetSales)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end space-x-2">
                  <span className="text-sm text-gray-900">
                    {calculateAchievementRate(performance.currentSales, performance.targetSales)}%
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        performance.genre === '연극' ? 'bg-blue-600' :
                        performance.genre === '뮤지컬' ? 'bg-purple-600' : 'bg-pink-600'
                      }`}
                      style={{
                        width: `${Math.min(
                          (performance.currentSales / performance.targetSales) * 100,
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