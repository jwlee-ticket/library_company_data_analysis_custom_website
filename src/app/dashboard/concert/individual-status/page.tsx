'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Select } from '@/components/ui/select';
import ConcertProfitabilityTable from '@/components/dashboard/concert/ConcertProfitabilityTable';
import ConcertDailySalesChart from '@/components/dashboard/concert/ConcertDailySalesChart';
import ConcertDailyTicketsChart from '@/components/dashboard/concert/ConcertDailyTicketsChart';
import ConcertWeeklySalesTable from '@/components/dashboard/concert/ConcertWeeklySalesTable';

// 더미 데이터
const DUMMY_CONCERTS = [
  { id: 1, title: '2024 아이유 콘서트' },
  { id: 2, title: '르세라핌 월드투어' },
  { id: 3, title: '뉴진스 쇼케이스' },
];

const DUMMY_PERIODS = [
  { id: 1, label: '2024.01 ~ 2024.03' },
  { id: 2, label: '2024.04 ~ 2024.06' },
  { id: 3, label: '2024.07 ~ 2024.09' },
];

const DUMMY_PROFITABILITY_DATA = {
  totalSeats: 10000,
  soldTickets: 6000,
  averageTicketPrice: 110000,
  remainingDays: 45,
  dailyAverageSales: 133,
  estimatedAdditionalSales: 5985,
  estimatedTotalRevenue: 1320000000,
  targetRevenue: 1500000000,
};

const DUMMY_DAILY_SALES = [
  { date: '2024-01-01', amount: 15000000 },
  { date: '2024-01-02', amount: 18000000 },
  { date: '2024-01-03', amount: 12000000 },
  // ... 추가 데이터
];

const DUMMY_DAILY_TICKETS = [
  { date: '2024-01-01', count: 150 },
  { date: '2024-01-02', count: 180 },
  { date: '2024-01-03', count: 120 },
  // ... 추가 데이터
];

const DUMMY_WEEKLY_SALES = [
  {
    week: '1주차 (2024.01.01 - 2024.01.07)',
    sales: 45000000,
    promotion: 3000000,
    others: 1000000,
    totalRevenue: 49000000,
    ticketsSold: 450,
  },
  // ... 추가 데이터
];

export default function ConcertIndividualStatusPage() {
  const [selectedConcert, setSelectedConcert] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  return (
    <div className="p-6 space-y-8">
      {/* 페이지 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          콘서트 개별 현황
        </h1>
        <p className="text-gray-500">
          최근 업데이트: {new Date().toLocaleString('ko-KR')}
        </p>
      </motion.div>

      {/* 선택 필터 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Select
          value={selectedConcert}
          onValueChange={setSelectedConcert}
          options={DUMMY_CONCERTS.map(concert => ({
            value: concert.id.toString(),
            label: concert.title,
          }))}
          placeholder="콘서트 선택"
        />
        <Select
          value={selectedPeriod}
          onValueChange={setSelectedPeriod}
          options={DUMMY_PERIODS.map(period => ({
            value: period.id.toString(),
            label: period.label,
          }))}
          placeholder="기간 선택"
        />
      </motion.div>

      {/* 수익성 추정 테이블 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <span className="inline-block w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
          수익성 추정
        </h2>
        <ConcertProfitabilityTable data={DUMMY_PROFITABILITY_DATA} />
      </motion.div>

      {/* 일간 매출 그래프 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <span className="inline-block w-1 h-6 bg-pink-500 rounded-full mr-3"></span>
          일간 매출
        </h2>
        <ConcertDailySalesChart data={DUMMY_DAILY_SALES} />
      </motion.div>

      {/* 일간 판매 매수 그래프 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <span className="inline-block w-1 h-6 bg-indigo-500 rounded-full mr-3"></span>
          일간 판매 매수
        </h2>
        <ConcertDailyTicketsChart data={DUMMY_DAILY_TICKETS} />
      </motion.div>

      {/* 주간 매출 테이블 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <span className="inline-block w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
          주간 매출
        </h2>
        <ConcertWeeklySalesTable data={DUMMY_WEEKLY_SALES} />
      </motion.div>
    </div>
  );
} 