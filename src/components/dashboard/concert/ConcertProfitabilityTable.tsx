import { ConcertBepData } from '@/hooks/useConcertIndividualApi';

interface ConcertProfitabilityTableProps {
  data: ConcertBepData[];
}

export default function ConcertProfitabilityTable({ data }: ConcertProfitabilityTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>수익성 추정 데이터가 없습니다.</p>
      </div>
    );
  }

  // 안전한 숫자 변환 헬퍼 함수
  const safeNumber = (value: any): number => {
    if (typeof value === 'string') {
      return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
    }
    return Number(value) || 0;
  };

  // BEP 달성률에 따른 색상 반환
  const getBepStatusColor = (ratio: number) => {
    if (ratio >= 1.0) return 'text-green-600 font-bold'; // BEP 달성
    if (ratio >= 0.7) return 'text-orange-600 font-semibold'; // BEP 근접
    return 'text-red-600 font-semibold'; // BEP 미달
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">좌석</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전체</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">판매</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">초대</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">잔여</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">추가판매예상</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">최종잔여예상</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">최종판매율</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BEP %</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => {
            // 백엔드 가이드에 따른 데이터 처리
            const totalSeats = item.totalSeats || 0;
            const soldSeats = item.soldSeats || 0;
            const remainingSeats = item.remainingSeats || 0;
            
            // 초대석 계산: totalSeats - soldSeats - remainingSeats
            const invitedSeats = Math.max(0, totalSeats - soldSeats - remainingSeats);
            
            // 추가 판매 예상 및 최종 잔여 예상 (안전한 변환)
            const estAdditionalSales = safeNumber(item.estAdditionalSales);
            const estFinalRemaining = safeNumber(item.estFinalRemaining);
            
            // 최종 판매율 계산: (전체좌석 - 최종잔여예상) / 전체좌석 * 100
            const finalSalesRate = totalSeats > 0 
              ? ((totalSeats - estFinalRemaining) / totalSeats) * 100 
              : 0;
            
            // BEP 달성률
            const bepRatio = item.bepRatio || 0;
            const bepPercentage = bepRatio * 100;
            
            const isTotal = item.seatClass === 'Total';
            
            return (
              <tr 
                key={`${item.seatClass}-${index}`} 
                className={`hover:bg-gray-50 ${isTotal ? 'bg-blue-50 border-t-2 border-blue-200' : ''}`}
              >
                <td className={`px-6 py-4 text-sm ${isTotal ? 'font-bold text-blue-900' : 'font-medium text-gray-900'}`}>
                  {item.seatClass}
                </td>
                <td className={`px-6 py-4 text-sm ${isTotal ? 'font-bold text-blue-900' : 'text-gray-500'}`}>
                  {totalSeats.toLocaleString()}
                </td>
                <td className={`px-6 py-4 text-sm ${isTotal ? 'font-bold text-blue-900' : 'text-gray-500'}`}>
                  {soldSeats.toLocaleString()}
                </td>
                <td className={`px-6 py-4 text-sm ${isTotal ? 'font-bold text-blue-900' : 'text-gray-500'}`}>
                  {invitedSeats.toLocaleString()}
                </td>
                <td className={`px-6 py-4 text-sm ${isTotal ? 'font-bold text-blue-900' : 'text-gray-500'}`}>
                  {remainingSeats.toLocaleString()}
                </td>
                <td className={`px-6 py-4 text-sm ${isTotal ? 'font-bold text-blue-900' : 'text-gray-500'}`}>
                  {estAdditionalSales.toLocaleString()}
                </td>
                <td className={`px-6 py-4 text-sm ${isTotal ? 'font-bold text-blue-900' : 'text-gray-500'}`}>
                  {estFinalRemaining.toLocaleString()}
                </td>
                <td className={`px-6 py-4 text-sm ${isTotal ? 'font-bold text-blue-900' : 'text-gray-500'}`}>
                  {finalSalesRate.toFixed(1)}%
                </td>
                <td className={`px-6 py-4 text-sm ${isTotal ? `font-bold ${getBepStatusColor(bepRatio)}` : getBepStatusColor(bepRatio)}`}>
                  {bepPercentage.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 