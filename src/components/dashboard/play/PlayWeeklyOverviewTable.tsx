'use client';

import { motion } from 'framer-motion';
import { PlayWeeklyOverview } from '@/hooks/usePlayApi';
import { formatCurrency, formatShareRate, getAchievementStatus } from '@/lib/utils';

interface PlayWeeklyOverviewTableProps {
  data: PlayWeeklyOverview[];
}

export default function PlayWeeklyOverviewTable({ data }: PlayWeeklyOverviewTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">연극 & 뮤지컬 주간 현황 데이터가 없습니다.</p>
      </div>
    );
  }

  // 달성률에 따른 색상 반환 함수
  const getAchievementColor = (ratio: number) => {
    if (ratio >= 100) return 'text-green-600';
    if (ratio >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              공연명
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              목표 점유율
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              실제 점유율
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              목표 매출
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              실제 매출
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              달성률
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => {
            const achievement = getAchievementStatus(item.totalActualSales, item.totalTargetSales);
            
            return (
              <motion.tr
                key={`${item.liveId}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.liveName || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatShareRate(item.targetShare)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatShareRate(item.avgPaidShare)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatCurrency(item.totalTargetSales)}원
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatCurrency(item.totalActualSales)}원
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <span className={`font-semibold ${getAchievementColor(achievement.rate)}`}>
                    {achievement.rate.toFixed(1)}%
                  </span>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 