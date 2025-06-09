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

interface TicketSalesChartProps {
  performanceId: number;
  weekId: number;
}

// 임시 데이터
const DUMMY_DATA = {
  labels: ['월', '화', '수', '목', '금', '토', '일'],
  datasets: [
    {
      type: 'bar' as const,
      label: '총 판매 매수',
      data: [150, 164, 136, 180, 190, 196, 170],
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
          return `${context.dataset.label}: ${context.raw}매`;
        },
      },
    },
  },
  scales: {
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

export default function TicketSalesChart({ performanceId, weekId }: TicketSalesChartProps) {
  return (
    <div className="w-full h-full">
      <Chart type="bar" data={DUMMY_DATA} options={options} />
    </div>
  );
} 