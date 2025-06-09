'use client';

import { useMemo } from 'react';
import { IoTrendingUp, IoTrendingDown } from 'react-icons/io5';
import { motion } from 'framer-motion';

interface TheaterSalesCardProps {
  title: string;
  totalSales: number;
  totalTarget: number;
  dailySales: number;
  dailyTarget: number;
  backgroundColor?: string;
}

export default function TheaterSalesCard({
  title,
  totalSales,
  totalTarget,
  dailySales,
  dailyTarget,
  backgroundColor = 'bg-white'
}: TheaterSalesCardProps) {
  // useMemo를 사용하여 계산값 메모이제이션
  const totalAchievementRate = useMemo(() => 
    (totalSales / totalTarget) * 100
  , [totalSales, totalTarget]);

  const dailyAchievementRate = useMemo(() => 
    (dailySales / dailyTarget) * 100
  , [dailySales, dailyTarget]);
  
  // 숫자 포맷팅
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0
    }).format(num);
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
    <div className={`${backgroundColor} rounded-xl shadow-lg p-6 border border-gray-100`}>
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        {title}
        <span className="ml-2 text-sm font-normal text-gray-500">
          실시간 업데이트
        </span>
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 총 매출 정보 */}
        <motion.div 
          className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-100"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="mb-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">총 매출</p>
                <p className="text-2xl font-bold text-gray-800">{formatNumber(totalSales)}</p>
              </div>
              <div className={`flex items-center ${getStatusColor(totalAchievementRate)}`}>
                {totalAchievementRate >= 100 ? <IoTrendingUp size={24} /> : <IoTrendingDown size={24} />}
              </div>
            </div>
            <p className="text-sm text-gray-500">목표 매출: {formatNumber(totalTarget)}</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">달성률</span>
              <span className={`text-sm font-bold ${getStatusColor(totalAchievementRate)}`}>
                {totalAchievementRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(totalAchievementRate, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`${getProgressColor(totalAchievementRate)} rounded-full h-3`}
              />
            </div>
          </div>
        </motion.div>

        {/* 당일 매출 정보 */}
        <motion.div 
          className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="mb-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">당일 매출</p>
                <p className="text-2xl font-bold text-gray-800">{formatNumber(dailySales)}</p>
              </div>
              <div className={`flex items-center ${getStatusColor(dailyAchievementRate)}`}>
                {dailyAchievementRate >= 100 ? <IoTrendingUp size={24} /> : <IoTrendingDown size={24} />}
              </div>
            </div>
            <p className="text-sm text-gray-500">당일 목표: {formatNumber(dailyTarget)}</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">달성률</span>
              <span className={`text-sm font-bold ${getStatusColor(dailyAchievementRate)}`}>
                {dailyAchievementRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(dailyAchievementRate, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`${getProgressColor(dailyAchievementRate)} rounded-full h-3`}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 