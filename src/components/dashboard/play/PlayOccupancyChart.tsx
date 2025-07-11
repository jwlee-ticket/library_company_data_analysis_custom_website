'use client';

import { motion } from 'framer-motion';
import { PlayOccupancyRate } from '@/hooks/usePlayApi';

interface PlayOccupancyChartProps {
  data: PlayOccupancyRate[];
}

export default function PlayOccupancyChart({ data }: PlayOccupancyChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">유료 점유율 데이터가 없습니다.</p>
      </div>
    );
  }

  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTextColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-700';
    if (percentage >= 60) return 'text-blue-700';
    if (percentage >= 40) return 'text-yellow-700';
    if (percentage >= 20) return 'text-orange-700';
    return 'text-red-700';
  };

  const formatDateRange = (startDate: string | undefined | null, endDate: string | undefined | null) => {
    if (!startDate || !endDate) return '-';
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return '-';
      return `${start.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })} ~ ${end.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}`;
    } catch {
      return '-';
    }
  };

  return (
    <div>
        <div className="space-y-6">
          {data.map((item, index) => (
            <motion.div
              key={`${item["공연 ID"]}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {item.공연명 || '-'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDateRange(item["주 시작일"], item["주 종료일"])} | 공연 {item["해당 주 공연 횟수"] || 0}회
                  </div>
                </div>
                <div className={`text-sm font-semibold ${getTextColor(item["유료 객석 점유율(%)"] || 0)}`}>
                  {(item["유료 객석 점유율(%)"] || 0).toFixed(1)}%
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(item["유료 객석 점유율(%)"] || 0, 100)}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.5 }}
                  className={`h-full rounded-full ${getBarColor(item["유료 객석 점유율(%)"] || 0)} flex items-center justify-center`}
                >
                  {(item["유료 객석 점유율(%)"] || 0) > 15 && (
                    <span className="text-white text-xs font-medium">
                      {(item["유료 객석 점유율(%)"] || 0).toFixed(1)}%
                    </span>
                  )}
                </motion.div>
                
                {/* 점유율 구간 표시 */}
                <div className="absolute inset-0 flex">
                  <div className="w-1/5 border-r border-gray-300 opacity-30"></div>
                  <div className="w-1/5 border-r border-gray-300 opacity-30"></div>
                  <div className="w-1/5 border-r border-gray-300 opacity-30"></div>
                  <div className="w-1/5 border-r border-gray-300 opacity-30"></div>
                  <div className="w-1/5"></div>
                </div>
              </div>
              
              {/* 범례 */}
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>20%</span>
                <span>40%</span>
                <span>60%</span>
                <span>80%</span>
                <span>100%</span>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* 컬러 범례 */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">점유율 범례</h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>0-20%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>20-40%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>40-60%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>60-80%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>80-100%</span>
            </div>
          </div>
        </div>
      </div>
    );
  } 