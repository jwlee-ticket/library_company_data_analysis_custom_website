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

interface OccupancyRateChartProps {
  performanceId: number;
  weekId: number;
}

// 임시 데이터
const DUMMY_DATA = {
  labels: ['월', '화', '수', '목', '금', '토', '일'],
  datasets: [
    {
      label: '전체 점유율',
      data: [75, 82, 68, 90, 95, 98, 85],
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      borderColor: 'rgb(53, 162, 235)',
      borderWidth: 1,
    },
    {
      label: '유료 점유율',
      data: [60, 70, 55, 80, 85, 90, 75],
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgb(75, 192, 192)',
      borderWidth: 1,
    },
    {
      label: '무료 점유율',
      data: [15, 12, 13, 10, 10, 8, 10],
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      borderColor: 'rgb(255, 99, 132)',
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
          return `${context.dataset.label}: ${context.raw}%`;
        },
      },
    },
  },
  scales: {
    y: {
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

export default function OccupancyRateChart({ performanceId, weekId }: OccupancyRateChartProps) {
  // 실제 구현시 performanceId와 weekId를 사용하여 데이터를 가져옵니다
  return (
    <div className="w-full h-full">
      <Bar data={DUMMY_DATA} options={options} />
    </div>
  );
} 