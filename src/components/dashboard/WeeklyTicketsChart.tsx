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

interface WeeklyData {
  week: string;
  soldTickets: number;
  maxTickets: number;
}

interface Performance {
  id: string;
  title: string;
  weeklyData: WeeklyData[];
}

interface WeeklyTicketsChartProps {
  selectedPerformance: Performance;
}

export default function WeeklyTicketsChart({ selectedPerformance }: WeeklyTicketsChartProps) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${selectedPerformance.title} - 주간별 티켓 판매 현황`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '티켓 매수',
        },
      },
    },
  };

  const data = {
    labels: selectedPerformance.weeklyData.map(data => data.week),
    datasets: [
      {
        type: 'bar' as const,
        label: '판매 매수',
        data: selectedPerformance.weeklyData.map(data => data.soldTickets),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
        order: 2,
      },
      {
        type: 'line' as const,
        label: '판매 가능 매수',
        data: selectedPerformance.weeklyData.map(data => data.maxTickets),
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        order: 1,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Chart type="bar" data={data} options={options} />
    </div>
  );
} 