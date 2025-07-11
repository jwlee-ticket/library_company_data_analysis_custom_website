'use client';

import { motion } from 'framer-motion';
import { PlayDailyDetail } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PlayDailyDetailsTableProps {
  data: PlayDailyDetail[];
}

export default function PlayDailyDetailsTable({ data }: PlayDailyDetailsTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">공연별 상세 데이터가 없습니다.</p>
      </div>
    );
  }

  const calculatePercentage = (actual: number | undefined | null, total: number | undefined | null) => {
    if (!actual || !total || total === 0 || isNaN(actual) || isNaN(total)) return '0%';
    return `${((actual / total) * 100).toFixed(0)}%`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              공연명
            </th>
            <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              업데이트일
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              일일 매출
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              총 좌석수
            </th>
            <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              유료 좌석 매출
            </th>
            <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              VIP / A석
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <motion.tr
              key={`${item.liveId}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {item.liveName || '-'}
                </div>
                {item.cast && (
                  <div className="text-xs text-gray-500">
                    캐스트: {item.cast}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                {formatDate(item.latestRecordDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                {formatCurrency(item.dailySales)}원
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                {item.showTotalSeatNumber || 0}석
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                {formatCurrency(item.paidSeatSales)}원
                <div className="text-xs text-gray-400">
                  {calculatePercentage(item.paidSeatSales, item.paidSeatTot)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                <div>VIP: {item.paidSeatVip || 0}</div>
                <div>A석: {item.paidSeatA || 0}</div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 