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

interface TotalRevenueChartProps {
  performanceId: number;
  weekId: number;
}

// 임시 데이터
const DUMMY_DATA = {
  labels: ['월', '화', '수', '목', '금', '토', '일'],
  datasets: [
    {
      label: '총 판매 금액',
      data: [1500000, 1640000, 1360000, 1800000, 1900000, 1960000, 1700000],
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 1,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      align: 'start' as const,
      labels: {
        boxWidth: 15,
        padding: 15,
      },
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
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: '금액 (원)',
      },
      ticks: {
        callback: function(value: any) {
          return (value / 10000) + '만원';
        },
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        padding: 5,
      },
    },
  },
  layout: {
    padding: {
      right: 5,
    },
  },
};

export default function TotalRevenueChart({ performanceId, weekId }: TotalRevenueChartProps) {
  return (
    <div className="w-full h-full">
      <Bar data={DUMMY_DATA} options={options} />
    </div>
  );
} 