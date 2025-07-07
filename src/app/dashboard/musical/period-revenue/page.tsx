'use client';

import { useState } from 'react';
import CumulativeRevenueChart from '@/components/dashboard/CumulativeRevenueChart';
import WeeklyRevenueTable from '@/components/dashboard/WeeklyRevenueTable';
import { Select } from '@/components/ui/select';
import { motion } from 'framer-motion';

// 더미 데이터
const DUMMY_SHOWS = [
  { id: 'all', name: '전체 뮤지컬' },
  { id: 'show1', name: '레미제라블' },
  { id: 'show2', name: '팬텀 오브 오페라' },
  { id: 'show3', name: '시카고' },
  { id: 'show4', name: '맘마미아' },
];

const DUMMY_REVENUE_DATA = {
  dates: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'],
  data: [
    {
      date: '2024-01',
      actualRevenue: 25000000,
      cumulativeRevenue: 25000000,
      targetRevenue: 30000000,
    },
    {
      date: '2024-02',
      actualRevenue: 32000000,
      cumulativeRevenue: 57000000,
      targetRevenue: 60000000,
    },
    {
      date: '2024-03',
      actualRevenue: 38000000,
      cumulativeRevenue: 95000000,
      targetRevenue: 90000000,
    },
    {
      date: '2024-04',
      actualRevenue: 35000000,
      cumulativeRevenue: 130000000,
      targetRevenue: 120000000,
    },
    {
      date: '2024-05',
      actualRevenue: 42000000,
      cumulativeRevenue: 172000000,
      targetRevenue: 150000000,
    },
    {
      date: '2024-06',
      actualRevenue: 48000000,
      cumulativeRevenue: 220000000,
      targetRevenue: 180000000,
    },
  ],
};

const DUMMY_MARKETING_EVENTS = [
  {
    date: '2024-01',
    type: 'promotion' as const,
    title: '뮤지컬 신년 특별 프로모션',
    description: '2024년 신년 맞이 25% 할인 이벤트',
  },
  {
    date: '2024-03',
    type: 'event' as const,
    title: '뮤지컬 페스티벌',
    description: '봄 시즌 뮤지컬 특별 공연 이벤트',
  },
  {
    date: '2024-05',
    type: 'sales' as const,
    title: '가정의 달 뮤지컬 세일',
    description: '가족 단위 관객 35% 할인',
  },
];

const DUMMY_WEEKLY_DATA = [
  {
    startDate: '2024-01-01',
    endDate: '2024-01-07',
    actualRevenue: 5800000,
    targetRevenue: 6000000,
    marketingEvents: [
      {
        date: '2024-01-01',
        type: 'promotion' as const,
        title: '뮤지컬 신년 특별 프로모션',
        description: '2024년 신년 맞이 25% 할인',
      },
    ],
  },
  {
    startDate: '2024-01-08',
    endDate: '2024-01-14',
    actualRevenue: 6500000,
    targetRevenue: 6000000,
    marketingEvents: [],
  },
  {
    startDate: '2024-01-15',
    endDate: '2024-01-21',
    actualRevenue: 6200000,
    targetRevenue: 6000000,
    marketingEvents: [
      {
        date: '2024-01-15',
        type: 'event' as const,
        title: '겨울방학 뮤지컬 특별 이벤트',
        description: '학생 관객 대상 특별 할인',
      },
    ],
  },
];

export default function MusicalPeriodRevenuePage() {
  const [selectedShow, setSelectedShow] = useState('all');
  const [startDate, setStartDate] = useState('2024-01');
  const [endDate, setEndDate] = useState('2024-06');

  return (
    <div className="p-6 space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          뮤지컬 기간별 통합 매출
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto bg-white p-3 rounded-xl shadow-sm"
        >
          <div className="w-full sm:w-auto">
            <Select
              value={selectedShow}
              onValueChange={setSelectedShow}
              options={DUMMY_SHOWS.map(show => ({
                value: show.id,
                label: show.name,
              }))}
              placeholder="공연 선택"
              className="min-w-[180px]"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select
              value={startDate}
              onValueChange={setStartDate}
              options={DUMMY_REVENUE_DATA.dates.map(date => ({
                value: date,
                label: date,
              }))}
              placeholder="시작일"
              className="min-w-[130px]"
            />
            <div className="flex items-center">
              <span className="text-gray-400">~</span>
            </div>
            <Select
              value={endDate}
              onValueChange={setEndDate}
              options={DUMMY_REVENUE_DATA.dates.map(date => ({
                value: date,
                label: date,
              }))}
              placeholder="종료일"
              className="min-w-[130px]"
            />
          </div>
        </motion.div>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="inline-block w-1 h-6 bg-blue-500 rounded-full"></span>
            누적 매출 현황
          </h2>
          <CumulativeRevenueChart
            title="월별 누적 매출"
            data={DUMMY_REVENUE_DATA.data}
            marketingEvents={DUMMY_MARKETING_EVENTS}
          />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="inline-block w-1 h-6 bg-purple-500 rounded-full"></span>
            주별 매출 현황
          </h2>
          <WeeklyRevenueTable data={DUMMY_WEEKLY_DATA} />
        </div>
      </div>
    </div>
  );
} 