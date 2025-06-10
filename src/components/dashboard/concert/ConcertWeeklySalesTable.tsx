interface WeeklySales {
  week: string;
  sales: number;
  promotion: number;
  others: number;
  totalRevenue: number;
  ticketsSold: number;
}

interface ConcertWeeklySalesTableProps {
  data: WeeklySales[];
}

export default function ConcertWeeklySalesTable({ data }: ConcertWeeklySalesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              주차
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              세일즈
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              프로모션
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              기타
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              총 매출
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              판매 매수
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((week, index) => (
            <tr key={index} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {week.week}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {week.sales.toLocaleString()}원
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {week.promotion.toLocaleString()}원
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {week.others.toLocaleString()}원
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                {week.totalRevenue.toLocaleString()}원
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {week.ticketsSold.toLocaleString()}매
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
              총계
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
              {data.reduce((sum, week) => sum + week.sales, 0).toLocaleString()}원
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
              {data.reduce((sum, week) => sum + week.promotion, 0).toLocaleString()}원
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
              {data.reduce((sum, week) => sum + week.others, 0).toLocaleString()}원
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
              {data.reduce((sum, week) => sum + week.totalRevenue, 0).toLocaleString()}원
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
              {data.reduce((sum, week) => sum + week.ticketsSold, 0).toLocaleString()}매
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
} 