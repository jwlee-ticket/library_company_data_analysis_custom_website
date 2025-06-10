interface ConcertProfitabilityTableProps {
  data: {
    totalSeats: number;
    soldTickets: number;
    averageTicketPrice: number;
    remainingDays: number;
    dailyAverageSales: number;
    estimatedAdditionalSales: number;
    estimatedTotalRevenue: number;
    targetRevenue: number;
  };
}

export default function ConcertProfitabilityTable({ data }: ConcertProfitabilityTableProps) {
  const currentSalesRate = (data.soldTickets / data.totalSeats) * 100;
  const estimatedFinalSalesRate = ((data.soldTickets + data.estimatedAdditionalSales) / data.totalSeats) * 100;
  const targetAchievementRate = (data.estimatedTotalRevenue / data.targetRevenue) * 100;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <tbody className="divide-y divide-gray-200">
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-900 w-1/3">총 좌석수</td>
            <td className="px-6 py-4 text-sm text-gray-500">{data.totalSeats.toLocaleString()}석</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-900">판매 좌석수</td>
            <td className="px-6 py-4 text-sm text-gray-500">{data.soldTickets.toLocaleString()}석</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-900">현재 판매율</td>
            <td className="px-6 py-4 text-sm text-gray-500">{currentSalesRate.toFixed(1)}%</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-900">평균 티켓 가격</td>
            <td className="px-6 py-4 text-sm text-gray-500">{data.averageTicketPrice.toLocaleString()}원</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-900">잔여 일수</td>
            <td className="px-6 py-4 text-sm text-gray-500">{data.remainingDays}일</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-900">일 평균 판매량</td>
            <td className="px-6 py-4 text-sm text-gray-500">{data.dailyAverageSales.toLocaleString()}매</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-900">추정 추가 판매량</td>
            <td className="px-6 py-4 text-sm text-gray-500">{data.estimatedAdditionalSales.toLocaleString()}매</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-900">추정 최종 판매율</td>
            <td className="px-6 py-4 text-sm text-gray-500">{estimatedFinalSalesRate.toFixed(1)}%</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-900">추정 총 매출</td>
            <td className="px-6 py-4 text-sm text-gray-500">{data.estimatedTotalRevenue.toLocaleString()}원</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-900">목표 매출</td>
            <td className="px-6 py-4 text-sm text-gray-500">{data.targetRevenue.toLocaleString()}원</td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-900">목표 달성률</td>
            <td className="px-6 py-4 text-sm text-gray-500">{targetAchievementRate.toFixed(1)}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
} 