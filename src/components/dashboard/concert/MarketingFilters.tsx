'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
// 간단한 SVG 아이콘 컴포넌트들
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ArrowPathIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

interface FilterState {
  selectedConcert: string;
  startDate: string;
  endDate: string;
}

interface MarketingFiltersProps {
  concerts: Array<{ id: string; name: string }>;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
}

export default function MarketingFilters({ 
  concerts, 
  filters, 
  onFiltersChange, 
  onReset 
}: MarketingFiltersProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleConcertSelect = (concertId: string) => {
    onFiltersChange({
      ...filters,
      selectedConcert: concertId
    });
    setIsDropdownOpen(false);
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const selectedConcertName = concerts.find(c => c.id === filters.selectedConcert)?.name || '라이카';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* 왼쪽: 콘서트 선택 드롭다운 */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between min-w-[120px] px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <span className="truncate">{selectedConcertName}</span>
              <ChevronDownIcon 
                className={`ml-2 h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
              >
                {concerts.map((concert) => (
                  <button
                    key={concert.id}
                    onClick={() => handleConcertSelect(concert.id)}
                    className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors duration-150 ${
                      filters.selectedConcert === concert.id 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-700'
                    }`}
                  >
                    {concert.name}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* 중앙: 날짜 범위 선택기 */}
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-gray-500 text-sm">-</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 오른쪽: 필터 초기화 버튼 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
        >
          <ArrowPathIcon className="h-4 w-4" />
          <span>필터 초기화</span>
        </motion.button>
      </div>

      {/* 활성 필터 표시 */}
      {(filters.selectedConcert || filters.startDate || filters.endDate) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="mt-4 pt-4 border-t border-gray-200"
        >
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <span className="font-medium">활성 필터:</span>
            {filters.selectedConcert && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {selectedConcertName}
              </span>
            )}
            {filters.startDate && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                시작: {filters.startDate}
              </span>
            )}
            {filters.endDate && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                종료: {filters.endDate}
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* 외부 클릭시 드롭다운 닫기 */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </motion.div>
  );
} 