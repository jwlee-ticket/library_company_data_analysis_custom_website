'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const monthlyData = [
  // 연극과 뮤지컬 통합 월별 데이터
  { month: '2024-01', theater: 85000000, musical: 125000000, total: 210000000 },
  { month: '2024-02', theater: 92000000, musical: 138000000, total: 230000000 },
  { month: '2024-03', theater: 78000000, musical: 142000000, total: 220000000 },
  { month: '2024-04', theater: 95000000, musical: 155000000, total: 250000000 },
  { month: '2024-05', theater: 88000000, musical: 162000000, total: 250000000 },
  { month: '2024-06', theater: 90000000, musical: 160000000, total: 250000000 },
];

export default function PlayMonthlyRevenuePage() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const handleDateRangeChange = (start: string, end: string) => {
    setDateRange({ start, end });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-8"
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          연극 & 뮤지컬 - 월별 통합 매출
        </h1>
        <div className="text-sm text-gray-500">
          최근 업데이트: {new Date().toLocaleDateString('ko-KR')}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <div className="mb-6">
          <div className="text-center text-gray-600">
            📊 월별 통합 매출 차트 영역
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">월별 매출 상세</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">월</th>
                <th className="px-6 py-3">연극 매출</th>
                <th className="px-6 py-3">뮤지컬 매출</th>
                <th className="px-6 py-3">총 매출</th>
                <th className="px-6 py-3">전월 대비</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((item, index) => {
                const prevTotal = index > 0 ? monthlyData[index - 1].total : item.total;
                const growth = ((item.total - prevTotal) / prevTotal * 100).toFixed(1);
                
                return (
                  <tr key={item.month} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.month}
                    </td>
                    <td className="px-6 py-4">
                      {item.theater.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4">
                      {item.musical.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {item.total.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        parseFloat(growth) >= 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {parseFloat(growth) >= 0 ? '+' : ''}{growth}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
} 