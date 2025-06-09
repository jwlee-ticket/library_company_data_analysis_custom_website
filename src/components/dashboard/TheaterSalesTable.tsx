'use client';

import { motion } from 'framer-motion';
import { IoTrendingUp, IoTrendingDown } from 'react-icons/io5';

interface TheaterPerformance {
  title: string;
  totalSales: number;
  totalTarget: number;
  dailySales: number;
  dailyTarget: number;
}

interface TheaterSalesTableProps {
  performances: TheaterPerformance[];
}

export default function TheaterSalesTable({ performances }: TheaterSalesTableProps) {
  // 숫자 포맷팅
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(num);
  };

  // 달성률 계산
  const calculateAchievementRate = (current: number, target: number) => {
    return ((current / target) * 100).toFixed(1);
  };

  const getStatusColor = (rate: number) => {
    if (rate >= 100) return 'text-green-600';
    if (rate >= 80) return 'text-blue-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 100) return 'bg-green-600';
    if (rate >= 80) return 'bg-blue-600';
    if (rate >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              공연명
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              총 매출
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              총 목표 매출
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              총 달성률
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              당일 매출
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              당일 목표
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              당일 달성률
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {performances.map((performance, index) => {
            const totalRate = Number(calculateAchievementRate(performance.totalSales, performance.totalTarget));
            const dailyRate = Number(calculateAchievementRate(performance.dailySales, performance.dailyTarget));
            
            return (
              <motion.tr 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">{performance.title}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatNumber(performance.totalSales)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatNumber(performance.totalTarget)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-end space-x-3">
                    <div className="w-24 bg-gray-100 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(totalRate, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`${getProgressColor(totalRate)} rounded-full h-2`}
                      />
                    </div>
                    <div className="flex items-center">
                      <span className={`text-sm font-semibold ${getStatusColor(totalRate)}`}>
                        {totalRate}%
                      </span>
                      <div className={`ml-1 ${getStatusColor(totalRate)}`}>
                        {totalRate >= 100 ? <IoTrendingUp size={16} /> : <IoTrendingDown size={16} />}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatNumber(performance.dailySales)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatNumber(performance.dailyTarget)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-end space-x-3">
                    <div className="w-24 bg-gray-100 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(dailyRate, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`${getProgressColor(dailyRate)} rounded-full h-2`}
                      />
                    </div>
                    <div className="flex items-center">
                      <span className={`text-sm font-semibold ${getStatusColor(dailyRate)}`}>
                        {dailyRate}%
                      </span>
                      <div className={`ml-1 ${getStatusColor(dailyRate)}`}>
                        {dailyRate >= 100 ? <IoTrendingUp size={16} /> : <IoTrendingDown size={16} />}
                      </div>
                    </div>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 