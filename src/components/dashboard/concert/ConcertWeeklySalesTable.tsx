import { ConcertDailyData, ConcertWeeklyData } from '@/hooks/useConcertIndividualApi';

// 주간 집계 데이터 타입 (노트 정보 포함)
interface WeeklyAggregatedData {
  weekStart: string; // 주 시작일
  weekEnd: string;   // 주 종료일
  totalSales: number;
  totalTickets: number;
  dayCount: number;  // 해당 주에 포함된 일수
  noteSalesMarketing?: string; // 세일즈 노트
  notePromotion?: string;      // 마케팅/프로모션 노트
  noteEtc?: string;            // 기타 노트
}

interface ConcertWeeklySalesTableProps {
  dailyData: ConcertDailyData[]; // 매출/판매 집계용
  weeklyData: ConcertWeeklyData[]; // 노트 정보용
}

export default function ConcertWeeklySalesTable({ dailyData, weeklyData }: ConcertWeeklySalesTableProps) {
  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>주간 매출 데이터가 없습니다.</p>
      </div>
    );
  }

  // 주의 시작일 (월요일) 계산 함수
  const getWeekStart = (date: Date): Date => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // 월요일로 조정
    return new Date(date.setDate(diff));
  };

  // 주의 종료일 (일요일) 계산 함수
  const getWeekEnd = (weekStart: Date): Date => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  };

  // Weekly 데이터를 주 시작일로 매핑
  const weeklyNotesMap = weeklyData.reduce((acc, item) => {
    const recordWeek = new Date(item.recordWeek);
    const weekStart = getWeekStart(new Date(recordWeek));
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    acc[weekStartStr] = {
      noteSalesMarketing: item.noteSalesMarketing,
      notePromotion: item.notePromotion,
      noteEtc: item.noteEtc,
    };
    
    return acc;
  }, {} as Record<string, { noteSalesMarketing: string; notePromotion: string; noteEtc: string }>);

  // Daily 데이터를 주간별로 집계
  const weeklyData_aggregated = dailyData.reduce((acc, dailyItem) => {
    const recordDate = new Date(dailyItem.recordDate);
    const weekStart = getWeekStart(new Date(recordDate));
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEnd = getWeekEnd(weekStart);
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    if (!acc[weekStartStr]) {
      acc[weekStartStr] = {
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        totalSales: 0,
        totalTickets: 0,
        dayCount: 0,
        // Weekly API의 노트 정보 추가
        noteSalesMarketing: weeklyNotesMap[weekStartStr]?.noteSalesMarketing || '',
        notePromotion: weeklyNotesMap[weekStartStr]?.notePromotion || '',
        noteEtc: weeklyNotesMap[weekStartStr]?.noteEtc || '',
      };
    }

    acc[weekStartStr].totalSales += dailyItem.dailySalesAmount || 0;
    acc[weekStartStr].totalTickets += dailyItem.dailySalesTicketNo || 0;
    acc[weekStartStr].dayCount += 1;

    return acc;
  }, {} as Record<string, WeeklyAggregatedData>);

  // 배열로 변환하고 최신순 정렬
  const sortedWeeklyData = Object.values(weeklyData_aggregated)
    .sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());

  // 총계 계산
  const totalSales = sortedWeeklyData.reduce((sum, item) => sum + item.totalSales, 0);
  const totalTickets = sortedWeeklyData.reduce((sum, item) => sum + item.totalTickets, 0);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                주간 기간
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                세일즈
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                마케팅
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
            {sortedWeeklyData.map((item, index) => {
              return (
                <tr key={`${item.weekStart}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      {new Date(item.weekStart).toLocaleDateString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit'
                      })} ~ {new Date(item.weekEnd).toLocaleDateString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.weekStart).getFullYear()}년 ({item.dayCount}일)
                    </div>
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
                    {item.totalSales.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.totalTickets.toLocaleString()}매
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 총계 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-gray-600">전체 총계 ({sortedWeeklyData.length}주)</span>
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