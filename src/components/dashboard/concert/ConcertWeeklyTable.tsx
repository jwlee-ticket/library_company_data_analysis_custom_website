interface Concert {
  id: number;
  title: string;
  revenue: number;
}

interface WeeklyData {
  weekId: number;
  total: number;
  concerts: Concert[];
}

interface ConcertWeeklyTableProps {
  data: {
    weeks: { id: number; label: string }[];
    data: WeeklyData[];
  };
}

export default function ConcertWeeklyTable({ data }: ConcertWeeklyTableProps) {
  const uniqueConcerts = Array.from(
    new Set(data.data.flatMap(week => week.concerts.map(concert => concert.title)))
  );

  return (
    <div className="space-y-6">
      {/* 총계 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-blue-50 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                총계
              </th>
              {uniqueConcerts.map((title) => (
                <th
                  key={title}
                  className="px-6 py-3 bg-blue-50 text-left text-xs font-medium text-blue-700 uppercase tracking-wider"
                >
                  {title}
                </th>
              ))}
              <th className="px-6 py-3 bg-blue-50 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                전체 합계
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="bg-blue-50 hover:bg-blue-100 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                주간 총계
              </td>
              {uniqueConcerts.map((title) => {
                const total = data.data.reduce((sum, week) => {
                  const concert = week.concerts.find(c => c.title === title);
                  return sum + (concert ? concert.revenue : 0);
                }, 0);
                return (
                  <td
                    key={title}
                    className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-800"
                  >
                    {total.toLocaleString()}원
                  </td>
                );
              })}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                {data.data.reduce((sum, week) => sum + week.total, 0).toLocaleString()}원
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 주간 매출 상세 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                주차
              </th>
              {uniqueConcerts.map((title) => (
                <th
                  key={title}
                  className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {title}
                </th>
              ))}
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                합계
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.weeks.map((week) => {
              const weekData = data.data.find(d => d.weekId === week.id);
              if (!weekData) return null;

              return (
                <tr key={week.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {week.label}
                  </td>
                  {uniqueConcerts.map((title) => {
                    const concert = weekData.concerts.find(c => c.title === title);
                    return (
                      <td
                        key={title}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        {concert ? concert.revenue.toLocaleString() : '0'}원
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {weekData.total.toLocaleString()}원
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 