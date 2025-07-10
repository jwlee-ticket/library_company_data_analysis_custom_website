import { ConcertWeeklyData } from '@/hooks/useConcertIndividualApi';

interface ConcertWeeklySalesTableProps {
  data: ConcertWeeklyData[];
}

export default function ConcertWeeklySalesTable({ data }: ConcertWeeklySalesTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>주간 매출 데이터가 없습니다.</p>
      </div>
    );
  }

  // 안전한 숫자 변환 헬퍼 함수
  const safeNumber = (value: any): number => {
    if (typeof value === 'string') {
      return parseInt(value.replace(/[^\d]/g, '')) || 0;
    }
    return Number(value) || 0;
  };

  // 주간 데이터를 날짜순으로 정렬 (최신순)
  const sortedData = [...data].sort((a, b) => new Date(b.recordWeek).getTime() - new Date(a.recordWeek).getTime());

  // 총계 계산
  const totalSales = sortedData.reduce((sum, item) => sum + safeNumber(item.weeklySalesAmount), 0);
  const totalTickets = sortedData.reduce((sum, item) => sum + safeNumber(item.weeklySalesTicketNo), 0);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                주 시작일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                세일즈
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                프로모션
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                기타
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                매출
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                판매 매수
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item, index) => (
              <tr key={`${item.recordWeek}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(item.recordWeek).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                  <div className="truncate" title={item.noteSalesMarketing}>
                    {item.noteSalesMarketing || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                  <div className="truncate" title={item.notePromotion}>
                    {item.notePromotion || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                  <div className="truncate" title={item.noteEtc}>
                    {item.noteEtc || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {safeNumber(item.weeklySalesAmount).toLocaleString()}원
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {safeNumber(item.weeklySalesTicketNo).toLocaleString()}매
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 총계 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-gray-600">전체 총계 ({sortedData.length}주)</span>
          <div className="flex space-x-6">
            <span className="text-gray-900">
              매출: <span className="font-bold">{totalSales.toLocaleString()}원</span>
            </span>
            <span className="text-gray-900">
              판매 매수: <span className="font-bold">{totalTickets.toLocaleString()}매</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 