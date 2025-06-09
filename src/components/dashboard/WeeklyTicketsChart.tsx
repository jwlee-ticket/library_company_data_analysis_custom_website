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
import { motion } from 'framer-motion';

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
        labels: {
          padding: 20,
          font: {
            size: 12,
            family: "'Pretendard', sans-serif",
          },
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: `${selectedPerformance.title} - 주간별 티켓 판매 현황`,
        font: {
          size: 16,
          family: "'Pretendard', sans-serif",
          weight: 'bold' as const,
        },
        padding: { bottom: 30 },
        color: '#1f2937',
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        titleFont: {
          size: 13,
          family: "'Pretendard', sans-serif",
          weight: 'bold' as const,
        },
        bodyColor: '#4b5563',
        bodyFont: {
          size: 12,
          family: "'Pretendard', sans-serif",
        },
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        usePointStyle: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
            family: "'Pretendard', sans-serif",
          },
          color: '#6b7280',
        },
        title: {
          display: true,
          text: '티켓 매수',
          font: {
            size: 12,
            family: "'Pretendard', sans-serif",
          },
          color: '#4b5563',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
            family: "'Pretendard', sans-serif",
          },
          color: '#6b7280',
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const data = {
    labels: selectedPerformance.weeklyData.map(data => data.week),
    datasets: [
      {
        type: 'bar' as const,
        label: '판매 매수',
        data: selectedPerformance.weeklyData.map(data => data.soldTickets),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1.5,
        borderRadius: 4,
        order: 2,
      },
      {
        type: 'line' as const,
        label: '판매 가능 매수',
        data: selectedPerformance.weeklyData.map(data => data.maxTickets),
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        order: 1,
      },
    ],
  };

  return (
    <motion.div 
      className="bg-white rounded-lg p-1"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Chart type="bar" data={data} options={options} />
    </motion.div>
  );
} 