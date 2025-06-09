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

interface DailyOccupancyChartProps {
  performanceId: number;
}

// 임시 데이터
const DUMMY_DATA = {
  labels: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07'],
  datasets: [
    {
      label: '유료 점유율',
      data: [65.5, 72.0, 68.0, 75.0, 80.0, 85.0, 70.0],
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      borderColor: 'rgb(53, 162, 235)',
      borderWidth: 1,
      stack: 'stack0',
    },
    {
      label: '무료 점유율',
      data: [10.0, 10.0, 12.0, 10.0, 8.0, 5.0, 10.0],
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 1,
      stack: 'stack0',
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
          return `${context.dataset.label}: ${context.raw}%`;
        },
        footer: function(tooltipItems: any) {
          const total = tooltipItems.reduce((sum: number, item: any) => sum + item.raw, 0);
          return `총 점유율: ${total}%`;
        },
      },
    },
  },
  scales: {
    x: {
      stacked: true,
      title: {
        display: true,
        text: '날짜',
      },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      max: 100,
      title: {
        display: true,
        text: '점유율 (%)',
      },
      ticks: {
        callback: function(value: any) {
          return value + '%';
        },
      },
    },
  },
};

export default function DailyOccupancyChart({ performanceId }: DailyOccupancyChartProps) {
  // 실제 구현시 performanceId를 사용하여 데이터를 가져옵니다
  return <Bar data={DUMMY_DATA} options={options} />;
} 