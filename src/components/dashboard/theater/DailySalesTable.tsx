'use client';

interface DailySalesTableProps {
  performanceId: number;
}

// 임시 데이터
const DUMMY_DATA = [
  {
    date: '2024-01-01',
    dayOfWeek: '월',
    totalOccupancyRate: 75.5,
    paidOccupancyRate: 65.5,
    freeOccupancyRate: 10.0,
    totalTickets: 151,
    maxTickets: 200,
    totalRevenue: 1510000,
  },
  {
    date: '2024-01-02',
    dayOfWeek: '화',
    totalOccupancyRate: 82.0,
    paidOccupancyRate: 72.0,
    freeOccupancyRate: 10.0,
    totalTickets: 164,
    maxTickets: 200,
    totalRevenue: 1640000,
  },
  {
    date: '2024-01-03',
    dayOfWeek: '수',
    totalOccupancyRate: 80.0,
    paidOccupancyRate: 68.0,
    freeOccupancyRate: 12.0,
    totalTickets: 160,
    maxTickets: 200,
    totalRevenue: 1600000,
  },
  {
    date: '2024-01-04',
    dayOfWeek: '목',
    totalOccupancyRate: 85.0,
    paidOccupancyRate: 75.0,
    freeOccupancyRate: 10.0,
    totalTickets: 170,
    maxTickets: 200,
    totalRevenue: 1700000,
  },
  {
    date: '2024-01-05',
    dayOfWeek: '금',
    totalOccupancyRate: 88.0,
    paidOccupancyRate: 80.0,
    freeOccupancyRate: 8.0,
    totalTickets: 176,
    maxTickets: 200,
    totalRevenue: 1760000,
  },
  {
    date: '2024-01-06',
    dayOfWeek: '토',
    totalOccupancyRate: 90.0,
    paidOccupancyRate: 85.0,
    freeOccupancyRate: 5.0,
    totalTickets: 180,
    maxTickets: 200,
    totalRevenue: 1800000,
  },
  {
    date: '2024-01-07',
    dayOfWeek: '일',
    totalOccupancyRate: 80.0,
    paidOccupancyRate: 70.0,
    freeOccupancyRate: 10.0,
    totalTickets: 160,
    maxTickets: 200,
    totalRevenue: 1600000,
  },
];

export default function DailySalesTable({ performanceId }: DailySalesTableProps) {
  // 실제 구현시 performanceId를 사용하여 데이터를 가져옵니다

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              공연일
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              요일
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              점유율
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              판매 매수
            </th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              총 판매 금액
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {DUMMY_DATA.map((row) => (
            <tr 
              key={row.date} 
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{row.date}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className={`text-sm font-medium ${
                  row.dayOfWeek === '토' || row.dayOfWeek === '일' 
                    ? 'text-red-600' 
                    : 'text-gray-900'
                }`}>
                  {row.dayOfWeek}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="text-sm font-medium text-gray-900">
                      {row.totalOccupancyRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      유료 {row.paidOccupancyRate.toFixed(1)}% / 무료 {row.freeOccupancyRate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="flex-1 max-w-[200px]">
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${row.paidOccupancyRate}%`,
                        }}
                      />
                      <div
                        className="h-full bg-emerald-400 -mt-2 rounded-full"
                        style={{
                          width: `${row.freeOccupancyRate}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {row.totalTickets.toLocaleString()}매
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  / {row.maxTickets.toLocaleString()}매
                </div>
                <div className="mt-1 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{
                      width: `${(row.totalTickets / row.maxTickets) * 100}%`,
                    }}
                  />
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {row.totalRevenue.toLocaleString()}원
                </div>
                <div className="text-xs text-emerald-600 mt-0.5">
                  {row.totalOccupancyRate >= 80 && '목표 달성'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 