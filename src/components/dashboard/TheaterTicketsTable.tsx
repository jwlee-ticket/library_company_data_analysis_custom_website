'use client';

import { motion } from 'framer-motion';
import { IoTicketOutline, IoTrendingUp, IoTrendingDown } from 'react-icons/io5';

interface Performance {
  id: string;
  title: string;
  weeklyData: {
    week: string;
    soldTickets: number;
    maxTickets: number;
  }[];
}

interface TheaterTicketsTableProps {
  performances: Performance[];
}

export default function TheaterTicketsTable({ performances }: TheaterTicketsTableProps) {
  const calculateTotals = (weeklyData: Performance['weeklyData']) => {
    return weeklyData.reduce(
      (acc, week) => ({
        totalSold: acc.totalSold + week.soldTickets,
        totalMax: acc.totalMax + week.maxTickets,
      }),
      { totalSold: 0, totalMax: 0 }
    );
  };

  const getStatusColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-blue-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-600';
    if (rate >= 70) return 'bg-blue-600';
    if (rate >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <IoTicketOutline className="w-5 h-5 mr-2" />
          공연별 티켓 판매 현황
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                공연명
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                총 판매 매수
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                전체 판매 가능 매수
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                판매율
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                남은 매수
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {performances.map((performance, index) => {
              const totals = calculateTotals(performance.weeklyData);
              const soldRate = Number(((totals.totalSold / totals.totalMax) * 100).toFixed(1));
              const remainingTickets = totals.totalMax - totals.totalSold;

              return (
                <motion.tr 
                  key={performance.id}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className="font-semibold text-gray-900">{totals.totalSold.toLocaleString()}</span>
                    <span className="text-gray-500 ml-1">장</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className="text-gray-500">{totals.totalMax.toLocaleString()}</span>
                    <span className="text-gray-400 ml-1">장</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-3">
                      <div className="w-24 bg-gray-100 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(soldRate, 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`${getProgressColor(soldRate)} rounded-full h-2`}
                        />
                      </div>
                      <div className="flex items-center">
                        <span className={`text-sm font-semibold ${getStatusColor(soldRate)}`}>
                          {soldRate}%
                        </span>
                        <div className={`ml-1 ${getStatusColor(soldRate)}`}>
                          {soldRate >= 70 ? <IoTrendingUp size={16} /> : <IoTrendingDown size={16} />}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`font-medium ${remainingTickets === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {remainingTickets.toLocaleString()}
                    </span>
                    <span className="text-gray-500 ml-1">장</span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 