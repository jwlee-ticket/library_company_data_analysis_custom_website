'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DailyRevenueChartProps {
  performanceId: number;
}

// 임시 데이터
const DUMMY_DATA = {
  labels: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07'],
  datasets: [
    {
      label: '판매 금액',
      data: [1510000, 1640000, 1600000, 1700000, 1760000, 1800000, 1600000],
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 1,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          return `${context.dataset.label}: ${context.raw.toLocaleString()}원`;
        },
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: '날짜',
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: '금액 (원)',
      },
      ticks: {
        callback: function(value: any) {
          return value.toLocaleString() + '원';
        },
      },
    },
  },
};

export default function DailyRevenueChart({ performanceId }: DailyRevenueChartProps) {
  // 실제 구현시 performanceId를 사용하여 데이터를 가져옵니다
  return <Bar data={DUMMY_DATA} options={options} />;
} 