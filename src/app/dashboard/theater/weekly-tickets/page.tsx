'use client';

import { useState } from 'react';
import WeeklyTicketsChart from '@/components/dashboard/WeeklyTicketsChart';
import TheaterTicketsTable from '@/components/dashboard/TheaterTicketsTable';
import { motion } from 'framer-motion';

const dummyData = [
  {
    id: '1',
    title: '햄릿',
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
    id: '2',
    title: '로미오와 줄리엣',
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
    id: '3',
    title: '맥베스',
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

export default function WeeklyTicketsPage() {
  const [selectedPerformance, setSelectedPerformance] = useState(dummyData[0]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-8"
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          연극 - 통합 주간별 티켓 매수
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
          <label htmlFor="performance" className="block text-sm font-medium text-gray-700 mb-2">
            공연 상세 분석
          </label>
          <div className="relative">
            <select
              id="performance"
              value={selectedPerformance.id}
              onChange={(e) => {
                const selected = dummyData.find(p => p.id === e.target.value);
                if (selected) setSelectedPerformance(selected);
              }}
              className="block w-full rounded-lg border-gray-300 bg-white pr-10 pl-4 py-2.5 text-sm
                       shadow-sm transition duration-200 ease-in-out
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
            >
              {dummyData.map((performance) => (
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

        <WeeklyTicketsChart selectedPerformance={selectedPerformance} />
      </motion.div>
    </motion.div>
  );
} 