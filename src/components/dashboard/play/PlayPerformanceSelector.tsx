'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isOpen, setIsOpen] = useState(false);

  // 고유 공연 목록 추출 (두 타입 모두 liveName 속성을 가짐)
  const performances = Array.from(
    new Set(data.map(item => item.liveName).filter((name): name is string => Boolean(name)))
  ).sort();

  const allOptions = [
    { value: 'all', label: '전체 공연' },
    ...performances.map(performance => ({ value: performance, label: performance }))
  ];

  const selectedOption = allOptions.find(option => option.value === selectedPerformance);

  const handleSelect = (value: string) => {
    onPerformanceChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        공연 선택
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 flex items-center justify-between"
        >
          <span>{selectedOption?.label}</span>
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </button>

        {/* 드롭다운 옵션 리스트 */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="py-2 max-h-60 overflow-y-auto">
                {allOptions.map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.1, delay: index * 0.02 }}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-150 flex items-center justify-between group ${
                      selectedPerformance === option.value
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span>{option.label}</span>
                    {selectedPerformance === option.value && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 