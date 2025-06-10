'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ConcertSalesCards from '@/components/dashboard/concert/ConcertSalesCards';
import ConcertMonthlyChart from '@/components/dashboard/concert/ConcertMonthlyChart';
import ConcertMonthlyTable from '@/components/dashboard/concert/ConcertMonthlyTable';
import ConcertWeeklyChart from '@/components/dashboard/concert/ConcertWeeklyChart';
import ConcertWeeklyTable from '@/components/dashboard/concert/ConcertWeeklyTable';

// 더미 데이터
const DUMMY_CONCERTS = [
  { id: 1, title: '2024 아이유 콘서트' },
  { id: 2, title: '르세라핌 월드투어' },
  { id: 3, title: '뉴진스 쇼케이스' },
];

const DUMMY_MONTHLY_DATA = {
  dates: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'],
  data: [
    {
      date: '2024-01',
      total: 850000000,
      concerts: [
        { id: 1, title: '2024 아이유 콘서트', revenue: 400000000 },
        { id: 2, title: '르세라핌 월드투어', revenue: 300000000 },
        { id: 3, title: '뉴진스 쇼케이스', revenue: 150000000 },
      ],
    },
    {
      date: '2024-02',
      total: 920000000,
      concerts: [
        { id: 1, title: '2024 아이유 콘서트', revenue: 420000000 },
        { id: 2, title: '르세라핌 월드투어', revenue: 320000000 },
        { id: 3, title: '뉴진스 쇼케이스', revenue: 180000000 },
      ],
    },
    // ... 나머지 월 데이터
  ],
};

const DUMMY_WEEKLY_DATA = {
  weeks: [
    { id: 1, label: '1주차 (2024.01.01 - 2024.01.07)' },
    { id: 2, label: '2주차 (2024.01.08 - 2024.01.14)' },
    { id: 3, label: '3주차 (2024.01.15 - 2024.01.21)' },
  ],
  data: [
    {
      weekId: 1,
      total: 210000000,
      concerts: [
        { id: 1, title: '2024 아이유 콘서트', revenue: 100000000 },
        { id: 2, title: '르세라핌 월드투어', revenue: 70000000 },
        { id: 3, title: '뉴진스 쇼케이스', revenue: 40000000 },
      ],
    },
    // ... 나머지 주간 데이터
  ],
};

const DUMMY_SALES_DATA = {
  yesterday: {
    total: 85000000,
    target: 100000000,
  },
  accumulated: {
    total: 2500000000,
    target: 3000000000,
  },
  weekly: {
    total: 420000000,
    target: 500000000,
  },
  weeklyAverage: {
    total: 60000000,
    target: 71428571,
  },
};

export default function ConcertTotalStatusPage() {
  return (
    <div className="p-6 space-y-8">
      {/* 페이지 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          콘서트 통합 현황
        </h1>
        <p className="text-gray-500">
          최근 업데이트: {new Date().toLocaleString('ko-KR')}
        </p>
      </motion.div>

      {/* 매출 카드 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <ConcertSalesCards data={DUMMY_SALES_DATA} />
      </motion.div>

      {/* 월간 매출 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <span className="inline-block w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
          월간 매출 현황
        </h2>
        <ConcertMonthlyChart data={DUMMY_MONTHLY_DATA} />
      </motion.div>

      {/* 월간 매출 테이블 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <span className="inline-block w-1 h-6 bg-pink-500 rounded-full mr-3"></span>
          월간 매출 상세
        </h2>
        <ConcertMonthlyTable data={DUMMY_MONTHLY_DATA} />
      </motion.div>

      {/* 주간 매출 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <span className="inline-block w-1 h-6 bg-indigo-500 rounded-full mr-3"></span>
          주간 매출 현황
        </h2>
        <ConcertWeeklyChart data={DUMMY_WEEKLY_DATA} />
      </motion.div>

      {/* 주간 매출 테이블 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <span className="inline-block w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
          주간 매출 상세
        </h2>
        <ConcertWeeklyTable data={DUMMY_WEEKLY_DATA} />
      </motion.div>
    </div>
  );
} 