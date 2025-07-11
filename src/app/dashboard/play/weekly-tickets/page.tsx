'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const WeeklyTicketsChart = dynamic(() => import('@/components/dashboard/WeeklyTicketsChart'), {
  ssr: false,
  loading: () => <div className="bg-white rounded-lg p-8 flex items-center justify-center">
    <div className="text-gray-500">차트를 로딩 중...</div>
  </div>
});
import TheaterTicketsTable from '@/components/dashboard/TheaterTicketsTable';
import { motion } from 'framer-motion';
import { IoStatsChart } from 'react-icons/io5';

const dummyData = [
  // 뮤지컬
  {
    id: '1',
    title: '레미제라블 (뮤지컬)',
    weeklyData: [
      { week: '1주차', soldTickets: 600, maxTickets: 650 },
      { week: '2주차', soldTickets: 630, maxTickets: 650 },
      { week: '3주차', soldTickets: 645, maxTickets: 650 },
      { week: '4주차', soldTickets: 640, maxTickets: 650 },
      { week: '5주차', soldTickets: 648, maxTickets: 650 },
      { week: '6주차', soldTickets: 650, maxTickets: 650 },
      { week: '7주차', soldTickets: 650, maxTickets: 650 },
    ],
  },
  {
    id: '2',
    title: '팬텀 오브 오페라 (뮤지컬)',
    weeklyData: [
      { week: '1주차', soldTickets: 520, maxTickets: 600 },
      { week: '2주차', soldTickets: 560, maxTickets: 600 },
      { week: '3주차', soldTickets: 585, maxTickets: 600 },
      { week: '4주차', soldTickets: 590, maxTickets: 600 },
      { week: '5주차', soldTickets: 595, maxTickets: 600 },
      { week: '6주차', soldTickets: 598, maxTickets: 600 },
      { week: '7주차', soldTickets: 600, maxTickets: 600 },
    ],
  },
  // 연극
  {
    id: '3',
    title: '바닷마을 다이어리 (연극)',
    weeklyData: [
      { week: '1주차', soldTickets: 450, maxTickets: 500 },
      { week: '2주차', soldTickets: 480, maxTickets: 500 },
      { week: '3주차', soldTickets: 495, maxTickets: 500 },
      { week: '4주차', soldTickets: 470, maxTickets: 500 },
      { week: '5주차', soldTickets: 485, maxTickets: 500 },
      { week: '6주차', soldTickets: 490, maxTickets: 500 },
      { week: '7주차', soldTickets: 498, maxTickets: 500 },
    ],
  },
  {
    id: '4',
    title: '타인의 삶 (연극)',
    weeklyData: [
      { week: '1주차', soldTickets: 380, maxTickets: 450 },
      { week: '2주차', soldTickets: 420, maxTickets: 450 },
      { week: '3주차', soldTickets: 445, maxTickets: 450 },
      { week: '4주차', soldTickets: 430, maxTickets: 450 },
      { week: '5주차', soldTickets: 440, maxTickets: 450 },
      { week: '6주차', soldTickets: 448, maxTickets: 450 },
      { week: '7주차', soldTickets: 450, maxTickets: 450 },
    ],
  },
  {
    id: '5',
    title: '사운드 인사이드 (연극)',
    weeklyData: [
      { week: '1주차', soldTickets: 320, maxTickets: 400 },
      { week: '2주차', soldTickets: 350, maxTickets: 400 },
      { week: '3주차', soldTickets: 380, maxTickets: 400 },
      { week: '4주차', soldTickets: 385, maxTickets: 400 },
      { week: '5주차', soldTickets: 390, maxTickets: 400 },
      { week: '6주차', soldTickets: 395, maxTickets: 400 },
      { week: '7주차', soldTickets: 400, maxTickets: 400 },
    ],
  },
];

export default function PlayWeeklyTicketsPage() {
  const [selectedPerformance, setSelectedPerformance] = useState(dummyData[0]);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-8"
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          연극 & 뮤지컬 - 통합 주간별 티켓 매수
        </h1>
        <div className="text-sm text-gray-500">
          최근 업데이트: {new Date().toLocaleDateString('ko-KR')}
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <TheaterTicketsTable performances={dummyData} />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <IoStatsChart className="w-4 h-4 mr-2 text-blue-500" />
            공연 상세 분석
          </label>
          <div className="relative">
            <button
              onClick={() => setIsSelectOpen(!isSelectOpen)}
              className="relative w-full bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-left
                       shadow-sm transition duration-200 ease-in-out
                       hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
            >
              <span className="block truncate text-gray-900">{selectedPerformance.title}</span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <motion.svg
                  animate={{ rotate: isSelectOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-4 w-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </span>
            </button>

            {/* Dropdown Menu */}
            {isSelectOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
              >
                <div className="py-1 max-h-60 overflow-auto">
                  {dummyData.map((performance) => (
                    <button
                      key={performance.id}
                      onClick={() => {
                        setSelectedPerformance(performance);
                        setIsSelectOpen(false);
                      }}
                      className={`
                        w-full text-left px-4 py-2.5 text-sm
                        transition duration-150 ease-in-out
                        ${selectedPerformance.id === performance.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      {performance.title}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <WeeklyTicketsChart selectedPerformance={selectedPerformance} />
      </motion.div>
    </motion.div>
  );
} 