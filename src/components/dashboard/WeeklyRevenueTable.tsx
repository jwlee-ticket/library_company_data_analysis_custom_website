'use client';

import { FaAd, FaGift, FaPercent, FaStar } from 'react-icons/fa';

interface MarketingEvent {
  date: string;
  type: 'promotion' | 'sales' | 'event' | 'discount';
  title: string;
  description: string;
}

interface WeeklyRevenue {
  startDate: string;
  endDate: string;
  actualRevenue: number;
  targetRevenue: number;
  marketingEvents: MarketingEvent[];
}

interface WeeklyRevenueTableProps {
  data: WeeklyRevenue[];
}

const getMarketingIcon = (type: MarketingEvent['type']) => {
  switch (type) {
    case 'promotion':
      return <FaGift className="text-purple-500" title="프로모션" />;
    case 'sales':
      return <FaPercent className="text-green-500" title="세일즈" />;
    case 'event':
      return <FaStar className="text-yellow-500" title="이벤트" />;
    case 'discount':
      return <FaAd className="text-blue-500" title="할인" />;
    default:
      return null;
  }
};

export default function WeeklyRevenueTable({ data }: WeeklyRevenueTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              주 시작일
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              주간 매출
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              주간 목표 매출
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              목표 달성률
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              마케팅 활동
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((week, index) => {
            const achievementRate = (week.actualRevenue / week.targetRevenue) * 100;
            
            return (
              <tr key={week.startDate} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {week.startDate} ~ {week.endDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {week.actualRevenue.toLocaleString()}원
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {week.targetRevenue.toLocaleString()}원
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm text-gray-900">{achievementRate.toFixed(1)}%</div>
                    <div
                      className="ml-2 h-2 w-20 bg-gray-200 rounded-full overflow-hidden"
                      title={`${achievementRate.toFixed(1)}%`}
                    >
                      <div
                        className={`h-full ${
                          achievementRate >= 100
                            ? 'bg-green-500'
                            : achievementRate >= 80
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(achievementRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex space-x-2">
                    {week.marketingEvents.map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className="relative group cursor-pointer"
                      >
                        <div className="w-6 h-6 flex items-center justify-center">
                          {getMarketingIcon(event.type)}
                        </div>
                        
                        {/* 툴팁 */}
                        <div className="absolute z-10 invisible group-hover:visible bg-black text-white text-xs rounded py-1 px-2 -mt-1 left-1/2 transform -translate-x-1/2 w-48">
                          <div className="font-semibold">{event.title}</div>
                          <div className="text-gray-300">{event.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 