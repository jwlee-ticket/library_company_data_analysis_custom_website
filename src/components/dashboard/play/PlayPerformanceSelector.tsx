'use client';

import { motion } from 'framer-motion';
import { PlayDailyDetail, PlayCastRevenue } from '@/lib/api';

interface PlayPerformanceSelectorProps {
  data: PlayDailyDetail[] | PlayCastRevenue[];
  selectedPerformance: string;
  onPerformanceChange: (performance: string) => void;
}

export default function PlayPerformanceSelector({
  data,
  selectedPerformance,
  onPerformanceChange
}: PlayPerformanceSelectorProps) {
  // 고유 공연 목록 추출 (두 타입 모두 liveName 속성을 가짐)
  const performances = Array.from(
    new Set(data.map(item => item.liveName).filter(name => name))
  ).sort();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
    >
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          공연 선택:
        </label>
        <select
          value={selectedPerformance}
          onChange={(e) => onPerformanceChange(e.target.value)}
          className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="all">전체 공연</option>
          {performances.map(performance => (
            <option key={performance} value={performance}>
              {performance}
            </option>
          ))}
        </select>
        
        {selectedPerformance !== 'all' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => onPerformanceChange('all')}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors duration-200"
          >
            초기화
          </motion.button>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        총 {performances.length}개 공연 | 선택됨: {
          selectedPerformance === 'all' 
            ? '전체' 
            : selectedPerformance
        }
      </div>
    </motion.div>
  );
} 