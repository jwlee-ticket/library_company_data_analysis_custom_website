'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface DailyTicketSalesChartProps {
  performanceId: number;
}

// 임시 데이터
const DUMMY_DATA = {
  labels: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07'],
  datasets: [
    {
      type: 'bar' as const,
      label: '판매 매수',
      data: [151, 164, 160, 170, 176, 180, 160],
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      borderColor: 'rgb(53, 162, 235)',
      borderWidth: 1,
      order: 2,
    },
    {
      type: 'line' as const,
      label: '최대 판매 가능 매수',
      data: [200, 200, 200, 200, 200, 200, 200],
      borderColor: 'rgb(255, 99, 132)',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
      order: 1,
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
          return `${context.dataset.label}: ${context.raw}매`;
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
        text: '매수',
      },
      ticks: {
        callback: function(value: any) {
          return value + '매';
        },
      },
    },
  },
};

export default function DailyTicketSalesChart({ performanceId }: DailyTicketSalesChartProps) {
  // 실제 구현시 performanceId를 사용하여 데이터를 가져옵니다
  return <Chart type="bar" data={DUMMY_DATA} options={options} />;
} 