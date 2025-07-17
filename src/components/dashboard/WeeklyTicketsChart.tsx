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
import ChartDataLabels from 'chartjs-plugin-datalabels';
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
  Legend,
  ChartDataLabels
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
  // 최대값 계산하여 여유공간 확보
  const maxSoldTickets = Math.max(...selectedPerformance.weeklyData.map(item => item.soldTickets));
  const maxAvailableTickets = Math.max(...selectedPerformance.weeklyData.map(item => item.maxTickets));
  const yAxisMax = Math.max(maxSoldTickets, maxAvailableTickets) * 1.15; // 15% 여유공간

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
      datalabels: {
        display: function(context: any) {
          // 모든 데이터셋에 라벨 표시, 0인 값은 제외
          if (!context.parsed || typeof context.parsed.y !== 'number') {
            return false;
          }
          return context.parsed.y > 0;
        },
        backgroundColor: function(context: any) {
          // 막대 그래프는 파란색, 라인 그래프는 빨간색 배경
          return context.datasetIndex === 0 
            ? 'rgba(59, 130, 246, 0.9)' 
            : 'rgba(239, 68, 68, 0.9)';
        },
        borderColor: '#fff',
        borderWidth: 2,
        borderRadius: 6,
        color: '#fff',
        font: {
          weight: 'bold' as const,
          size: 11,
          family: "'Pretendard', sans-serif",
        },
        padding: {
          top: 6,
          bottom: 6,
          left: 8,
          right: 8,
        },
        anchor: function(context: any) {
          // 막대 그래프는 end, 라인 그래프는 end
          return 'end' as const;
        },
        align: function(context: any) {
          // 막대 그래프는 위쪽, 라인 그래프는 위쪽
          return context.datasetIndex === 0 ? 'top' as const : 'top' as const;
        },
        offset: function(context: any) {
          return context.datasetIndex === 0 ? 8 : 12;
        },
        formatter: (value: number, context: any) => {
          if (!value || value === 0) return '';
          
          // 최대값 계산하여 작은 값은 표시하지 않음
          const allData = selectedPerformance.weeklyData;
          const maxSoldTickets = Math.max(...allData.map(item => item.soldTickets));
          const maxAvailableTickets = Math.max(...allData.map(item => item.maxTickets));
          const maxValue = context.datasetIndex === 0 ? maxSoldTickets : maxAvailableTickets;
          
          // 최대값의 5% 미만인 값은 표시하지 않음 (가독성 향상)
          if (maxValue > 0 && value < maxValue * 0.05) return '';
          
          return value.toLocaleString() + '매';
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: yAxisMax,
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
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        borderRadius: 6,
        order: 2,
      },
      {
        type: 'line' as const,
        label: '판매 가능 매수',
        data: selectedPerformance.weeklyData.map(data => data.maxTickets),
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 3,
        fill: false,
        tension: 0.3,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
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