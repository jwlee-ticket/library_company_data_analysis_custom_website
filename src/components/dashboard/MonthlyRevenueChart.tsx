'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Scale,
  CoreScaleOptions,
  Tick,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface MonthlyData {
  month: string;
  revenue: number;
  previousRevenue: number | null;
}

interface MonthlyRevenueChartProps {
  title: string;
  monthlyData: MonthlyData[];
}

export default function MonthlyRevenueChart({ title, monthlyData }: MonthlyRevenueChartProps) {
  const calculateGrowth = (current: number, previous: number | null): string => {
    if (previous === null) return '-';
    const growth = current - previous;
    const percentage = ((growth / previous) * 100).toFixed(1);
    return `${growth >= 0 ? '+' : ''}${growth.toLocaleString()}원 (${percentage}%)`;
  };

  const options: ChartOptions<'bar'> = {
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
      datalabels: {
        display: true,
        anchor: 'end' as const,
        align: 'top' as const,
        formatter: (value: number) => {
          return value.toLocaleString() + '원';
        },
        font: {
          size: 11,
          family: "'Pretendard', sans-serif",
          weight: 'bold' as const,
        },
        color: '#374151',
        padding: {
          top: 4,
        },
      },
      title: {
        display: true,
        text: title,
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
        callbacks: {
          label: (context: any) => {
            const dataIndex = context.dataIndex;
            const currentRevenue = monthlyData[dataIndex].revenue;
            const previousRevenue = monthlyData[dataIndex].previousRevenue;
            
            const lines = [
              `매출: ${currentRevenue.toLocaleString()}원`,
            ];
            
            if (previousRevenue !== null) {
              const growth = currentRevenue - previousRevenue;
              const percentage = ((growth / previousRevenue) * 100).toFixed(1);
              const trend = growth >= 0 ? '▲' : '▼';
              lines.push(`전월대비: ${trend} ${Math.abs(growth).toLocaleString()}원 (${percentage}%)`);
            }
            
            return lines;
          },
        },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        grace: '10%',
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          display: true,
        },
        border: {
          display: false,
        },
        title: {
          display: true,
          text: '매출 (원)',
          font: {
            size: 12,
            family: "'Pretendard', sans-serif",
          },
          color: '#4b5563',
        },
        ticks: {
          callback: function(this: Scale<CoreScaleOptions>, tickValue: string | number, index: number, ticks: Tick[]) {
            if (typeof tickValue === 'number') {
              return tickValue.toLocaleString() + '원';
            }
            return tickValue;
          },
          font: {
            size: 11,
            family: "'Pretendard', sans-serif",
          },
          color: '#6b7280',
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
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const data = {
    labels: monthlyData.map(data => {
      const [year, month] = data.month.split('-');
      return `${year}년 ${month}월`;
    }),
    datasets: [
      {
        label: '월별 매출',
        data: monthlyData.map(data => data.revenue),
        backgroundColor: monthlyData.map((data, index) => {
          if (index === 0 || data.previousRevenue === null) return 'rgba(59, 130, 246, 0.5)';
          return data.revenue >= data.previousRevenue
            ? 'rgba(34, 197, 94, 0.5)'  // 증가: 초록색
            : 'rgba(239, 68, 68, 0.5)'; // 감소: 빨간색
        }),
        borderColor: monthlyData.map((data, index) => {
          if (index === 0 || data.previousRevenue === null) return 'rgb(59, 130, 246)';
          return data.revenue >= data.previousRevenue
            ? 'rgb(34, 197, 94)'
            : 'rgb(239, 68, 68)';
        }),
        borderWidth: 1.5,
        borderRadius: 4,
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
      <Bar options={options} data={data} />
    </motion.div>
  );
} 