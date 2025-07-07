'use client';

import { useState } from 'react';
import MonthlyRevenueChart from '@/components/dashboard/MonthlyRevenueChart';
import { motion, AnimatePresence } from 'framer-motion';
import { IoStatsChart, IoCalendarOutline, IoChevronDown, IoCheckmark } from 'react-icons/io5';

// 더미 데이터
const dummyData = {
  total: [
    { month: '2024-01', revenue: 185000000, previousRevenue: null },
    { month: '2024-02', revenue: 195000000, previousRevenue: 185000000 },
    { month: '2024-03', revenue: 210000000, previousRevenue: 195000000 },
    { month: '2024-04', revenue: 205000000, previousRevenue: 210000000 },
    { month: '2024-05', revenue: 220000000, previousRevenue: 205000000 },
    { month: '2024-06', revenue: 235000000, previousRevenue: 220000000 },
  ],
  performances: [
    {
      id: '1',
      title: '레미제라블',
      monthlyData: [
        { month: '2024-01', revenue: 65000000, previousRevenue: null },
        { month: '2024-02', revenue: 68000000, previousRevenue: 65000000 },
        { month: '2024-03', revenue: 72000000, previousRevenue: 68000000 },
        { month: '2024-04', revenue: 70000000, previousRevenue: 72000000 },
        { month: '2024-05', revenue: 75000000, previousRevenue: 70000000 },
        { month: '2024-06', revenue: 78000000, previousRevenue: 75000000 },
      ],
    },
    {
      id: '2',
      title: '팬텀 오브 오페라',
      monthlyData: [
        { month: '2024-01', revenue: 55000000, previousRevenue: null },
        { month: '2024-02', revenue: 58000000, previousRevenue: 55000000 },
        { month: '2024-03', revenue: 62000000, previousRevenue: 58000000 },
        { month: '2024-04', revenue: 60000000, previousRevenue: 62000000 },
        { month: '2024-05', revenue: 65000000, previousRevenue: 60000000 },
        { month: '2024-06', revenue: 68000000, previousRevenue: 65000000 },
      ],
    },
    {
      id: '3',
      title: '시카고',
      monthlyData: [
        { month: '2024-01', revenue: 35000000, previousRevenue: null },
        { month: '2024-02', revenue: 38000000, previousRevenue: 35000000 },
        { month: '2024-03', revenue: 40000000, previousRevenue: 38000000 },
        { month: '2024-04', revenue: 42000000, previousRevenue: 40000000 },
        { month: '2024-05', revenue: 45000000, previousRevenue: 42000000 },
        { month: '2024-06', revenue: 48000000, previousRevenue: 45000000 },
      ],
    },
    {
      id: '4',
      title: '맘마미아',
      monthlyData: [
        { month: '2024-01', revenue: 30000000, previousRevenue: null },
        { month: '2024-02', revenue: 31000000, previousRevenue: 30000000 },
        { month: '2024-03', revenue: 36000000, previousRevenue: 31000000 },
        { month: '2024-04', revenue: 33000000, previousRevenue: 36000000 },
        { month: '2024-05', revenue: 35000000, previousRevenue: 33000000 },
        { month: '2024-06', revenue: 41000000, previousRevenue: 35000000 },
      ],
    },
  ],
};

export default function MusicalMonthlyRevenuePage() {
  const [selectedPerformance, setSelectedPerformance] = useState<string | 'total'>('total');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getChartData = () => {
    if (selectedPerformance === 'total') {
      return {
        title: '뮤지컬 통합 월별 매출',
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

  const getSelectedTitle = () => {
    if (selectedPerformance === 'total') return '전체 통합';
    return dummyData.performances.find(p => p.id === selectedPerformance)?.title;
  };

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
            뮤지컬 - 월별 매출 현황
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            매출 분석 대상
          </label>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-left
                         flex items-center justify-between
                         hover:border-blue-500 focus:outline-none focus:border-blue-500 focus:ring-2 
                         focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200"
            >
              <span className="text-sm text-gray-700">{getSelectedTitle()}</span>
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <IoChevronDown className="h-5 w-5 text-gray-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg
                           overflow-hidden"
                >
                  <div className="max-h-60 overflow-y-auto py-1">
                    <button
                      onClick={() => {
                        setSelectedPerformance('total');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-sm text-left hover:bg-blue-50 flex items-center
                               justify-between transition-colors duration-150"
                    >
                      <span className="text-gray-700">전체 통합</span>
                      {selectedPerformance === 'total' && (
                        <IoCheckmark className="h-5 w-5 text-blue-500" />
                      )}
                    </button>
                    {dummyData.performances.map((performance) => (
                      <button
                        key={performance.id}
                        onClick={() => {
                          setSelectedPerformance(performance.id);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-sm text-left hover:bg-blue-50 flex items-center
                                 justify-between transition-colors duration-150"
                      >
                        <span className="text-gray-700">{performance.title}</span>
                        {selectedPerformance === performance.id && (
                          <IoCheckmark className="h-5 w-5 text-blue-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <MonthlyRevenueChart title={title} monthlyData={data} />
      </motion.div>
    </motion.div>
  );
} 