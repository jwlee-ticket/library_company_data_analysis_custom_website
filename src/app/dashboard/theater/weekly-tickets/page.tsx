'use client';

import { useState } from 'react';
import WeeklyTicketsChart from '@/components/dashboard/WeeklyTicketsChart';
import TheaterTicketsTable from '@/components/dashboard/TheaterTicketsTable';

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
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">연극 - 통합 주간별 티켓 매수</h1>
      
      <TheaterTicketsTable performances={dummyData} />
      
      <div className="mb-6">
        <label htmlFor="performance" className="block text-sm font-medium text-gray-700 mb-2">
          공연 선택
        </label>
        <select
          id="performance"
          value={selectedPerformance.id}
          onChange={(e) => {
            const selected = dummyData.find(p => p.id === e.target.value);
            if (selected) setSelectedPerformance(selected);
          }}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          {dummyData.map((performance) => (
            <option key={performance.id} value={performance.id}>
              {performance.title}
            </option>
          ))}
        </select>
      </div>

      <WeeklyTicketsChart selectedPerformance={selectedPerformance} />
    </div>
  );
} 