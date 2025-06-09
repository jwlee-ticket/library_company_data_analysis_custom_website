'use client';

import { useState } from 'react';
import MonthlyRevenueChart from '@/components/dashboard/MonthlyRevenueChart';
import { motion } from 'framer-motion';
import { IoStatsChart, IoCalendarOutline } from 'react-icons/io5';

// 더미 데이터
const dummyData = {
  total: [
    { month: '2024-01', revenue: 125000000, previousRevenue: null },
    { month: '2024-02', revenue: 135000000, previousRevenue: 125000000 },
    { month: '2024-03', revenue: 142000000, previousRevenue: 135000000 },
    { month: '2024-04', revenue: 138000000, previousRevenue: 142000000 },
    { month: '2024-05', revenue: 145000000, previousRevenue: 138000000 },
    { month: '2024-06', revenue: 155000000, previousRevenue: 145000000 },
  ],
  performances: [
    {
      id: '1',
      title: '햄릿',
      monthlyData: [
        { month: '2024-01', revenue: 45000000, previousRevenue: null },
        { month: '2024-02', revenue: 48000000, previousRevenue: 45000000 },
        { month: '2024-03', revenue: 52000000, previousRevenue: 48000000 },
        { month: '2024-04', revenue: 49000000, previousRevenue: 52000000 },
        { month: '2024-05', revenue: 51000000, previousRevenue: 49000000 },
        { month: '2024-06', revenue: 54000000, previousRevenue: 51000000 },
      ],
    },
    {
      id: '2',
      title: '로미오와 줄리엣',
      monthlyData: [
        { month: '2024-01', revenue: 42000000, previousRevenue: null },
        { month: '2024-02', revenue: 45000000, previousRevenue: 42000000 },
        { month: '2024-03', revenue: 48000000, previousRevenue: 45000000 },
        { month: '2024-04', revenue: 47000000, previousRevenue: 48000000 },
        { month: '2024-05', revenue: 50000000, previousRevenue: 47000000 },
        { month: '2024-06', revenue: 53000000, previousRevenue: 50000000 },
      ],
    },
    {
      id: '3',
      title: '맥베스',
      monthlyData: [
        { month: '2024-01', revenue: 38000000, previousRevenue: null },
        { month: '2024-02', revenue: 42000000, previousRevenue: 38000000 },
        { month: '2024-03', revenue: 42000000, previousRevenue: 42000000 },
        { month: '2024-04', revenue: 42000000, previousRevenue: 42000000 },
        { month: '2024-05', revenue: 44000000, previousRevenue: 42000000 },
        { month: '2024-06', revenue: 48000000, previousRevenue: 44000000 },
      ],
    },
  ],
};

export default function MonthlyRevenuePage() {
  const [selectedPerformance, setSelectedPerformance] = useState<string | 'total'>('total');

  const getChartData = () => {
    if (selectedPerformance === 'total') {
      return {
        title: '연극 통합 월별 매출',
        data: dummyData.total,
      };
    }
    const performance = dummyData.performances.find(p => p.id === selectedPerformance);
    return {
      title: `${performance?.title} 월별 매출`,
      data: performance?.monthlyData || [],
    };
  };

  const { title, data } = getChartData();

  // 최근 데이터의 매출 증감 계산
  const getLatestGrowth = () => {
    const latestData = data[data.length - 1];
    if (!latestData.previousRevenue) return null;
    
    const growth = latestData.revenue - latestData.previousRevenue;
    const percentage = ((growth / latestData.previousRevenue) * 100).toFixed(1);
    return {
      amount: growth,
      percentage: Number(percentage),
    };
  };

  const latestGrowth = getLatestGrowth();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            연극 - 월별 매출 현황
          </h1>
          <p className="mt-2 text-sm text-gray-500 flex items-center">
            <IoCalendarOutline className="mr-1" />
            {data[data.length - 1].month} 기준
          </p>
        </div>
        
        {latestGrowth && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`flex items-center px-4 py-2 rounded-lg ${
              latestGrowth.percentage >= 0 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}
          >
            <IoStatsChart className="mr-2" />
            <span className="font-medium">
              전월 대비 {latestGrowth.percentage >= 0 ? '▲' : '▼'} {Math.abs(latestGrowth.percentage)}%
            </span>
            <span className="ml-2 text-sm opacity-75">
              ({Math.abs(latestGrowth.amount).toLocaleString()}원)
            </span>
          </motion.div>
        )}
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <div className="mb-6">
          <label htmlFor="performance" className="block text-sm font-medium text-gray-700 mb-2">
            매출 분석 대상
          </label>
          <div className="relative">
            <select
              id="performance"
              value={selectedPerformance}
              onChange={(e) => setSelectedPerformance(e.target.value)}
              className="block w-full rounded-lg border-gray-300 bg-white pr-10 pl-4 py-2.5 text-sm
                       shadow-sm transition duration-200 ease-in-out
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
                       appearance-none"
            >
              <option value="total">전체 통합</option>
              {dummyData.performances.map((performance) => (
                <option key={performance.id} value={performance.id}>
                  {performance.title}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        <MonthlyRevenueChart title={title} monthlyData={data} />
      </motion.div>
    </motion.div>
  );
} 