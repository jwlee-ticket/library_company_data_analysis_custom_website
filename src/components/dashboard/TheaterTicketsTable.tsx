'use client';

interface Performance {
  id: string;
  title: string;
  weeklyData: {
    week: string;
    soldTickets: number;
    maxTickets: number;
  }[];
}

interface TheaterTicketsTableProps {
  performances: Performance[];
}

export default function TheaterTicketsTable({ performances }: TheaterTicketsTableProps) {
  const calculateTotals = (weeklyData: Performance['weeklyData']) => {
    return weeklyData.reduce(
      (acc, week) => ({
        totalSold: acc.totalSold + week.soldTickets,
        totalMax: acc.totalMax + week.maxTickets,
      }),
      { totalSold: 0, totalMax: 0 }
    );
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow mb-8">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              공연명
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              총 판매 매수
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              전체 판매 가능 매수
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              판매율
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              남은 매수
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {performances.map((performance) => {
            const totals = calculateTotals(performance.weeklyData);
            const soldRate = ((totals.totalSold / totals.totalMax) * 100).toFixed(1);
            const remainingTickets = totals.totalMax - totals.totalSold;

            return (
              <tr key={performance.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {performance.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {totals.totalSold.toLocaleString()}장
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {totals.totalMax.toLocaleString()}장
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <span className={`font-medium ${
                    Number(soldRate) >= 90 ? 'text-green-600' :
                    Number(soldRate) >= 70 ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {soldRate}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                  {remainingTickets.toLocaleString()}장
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 