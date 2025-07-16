'use client';

import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import { PlayOccupancyRate } from '@/lib/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface PlayWeeklyOccupancyChartProps {
  data: PlayOccupancyRate[];
  selectedPerformance: string;
}

export default function PlayWeeklyOccupancyChart({ 
  data, 
  selectedPerformance 
}: PlayWeeklyOccupancyChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-lg font-medium mb-2">유료 점유율 데이터가 없습니다</p>
          <p className="text-sm">선택한 조건의 데이터를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  // 필터링된 데이터
  const filteredData = selectedPerformance === 'all' 
    ? data 
    : data.filter(item => item.liveName === selectedPerformance);

  // 주간별로 정렬
  const sortedData = [...filteredData].sort((a, b) => {
    const dateA = new Date(a.weekStartDate || '');
    const dateB = new Date(b.weekStartDate || '');
    return dateA.getTime() - dateB.getTime();
  });

  const chartData = {
    labels: sortedData.map(item => {
      const startDate = new Date(item.weekStartDate || '');
      const endDate = new Date(item.weekEndDate || '');
      return `${startDate.getMonth() + 1}/${startDate.getDate()}~${endDate.getMonth() + 1}/${endDate.getDate()}`;
    }),
    datasets: [
      {
        label: '유료 점유율 (%)',
        data: sortedData.map(item => {
          const value = item.paidSharePercentage;
          return typeof value === 'string' ? parseFloat(value) || 0 : (value || 0);
        }),
        backgroundColor: sortedData.map(item => {
          const value = item.paidSharePercentage;
          const percentage = typeof value === 'string' ? parseFloat(value) || 0 : (value || 0);
          if (percentage >= 80) return 'rgba(34, 197, 94, 0.8)'; // 초록색 (우수)
          if (percentage >= 60) return 'rgba(59, 130, 246, 0.8)'; // 파란색 (양호)
          if (percentage >= 40) return 'rgba(245, 158, 11, 0.8)'; // 주황색 (보통)
          return 'rgba(239, 68, 68, 0.8)'; // 빨간색 (저조)
        }),
        borderColor: sortedData.map(item => {
          const value = item.paidSharePercentage;
          const percentage = typeof value === 'string' ? parseFloat(value) || 0 : (value || 0);
          if (percentage >= 80) return 'rgb(34, 197, 94)';
          if (percentage >= 60) return 'rgb(59, 130, 246)';
          if (percentage >= 40) return 'rgb(245, 158, 11)';
          return 'rgb(239, 68, 68)';
        }),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 60, // 막대 최대 넓이 60px로 제한
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `주간별 유료 점유율 현황${selectedPerformance !== 'all' ? ` - ${selectedPerformance}` : ''}`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#374151',
      },
      legend: {
        display: false,
      },
      datalabels: {
        display: true,
        color: '#ffffff',
        font: {
          weight: 'bold' as const,
          size: 12,
        },
        anchor: 'end' as const,
        align: 'top' as const,
        offset: 4,
        formatter: (value: number) => {
          return `${value.toFixed(1)}%`;
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const dataIndex = context.dataIndex;
            const item = sortedData[dataIndex];
            if (!context.parsed || typeof context.parsed.y !== 'number') {
              return '';
            }
            const percentage = context.parsed.y;
            const showCountValue = item.weeklyShowCount;
            const showCount = typeof showCountValue === 'string' ? parseInt(showCountValue) || 0 : (showCountValue || 0);
            
            return [
              `유료 점유율: ${percentage.toFixed(1)}%`,
              `공연 횟수: ${showCount}회`,
              `공연명: ${item.liveName || '전체'}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '주간',
          color: '#6b7280',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
          maxRotation: 45,
        },
      },
      y: {
        title: {
          display: true,
          text: '점유율 (%)',
          color: '#6b7280',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return `${value}%`;
          },
        },
        min: 0,
        max: 100,
      },
    },
  };

  // 통계 계산 (문자열을 숫자로 안전하게 변환)
  const validOccupancyValues = sortedData
    .map(item => {
      const value = item.paidSharePercentage;
      if (typeof value === 'string') {
        return parseFloat(value) || 0;
      }
      return typeof value === 'number' ? value : 0;
    })
    .filter(value => typeof value === 'number' && !isNaN(value));

  const avgOccupancy = validOccupancyValues.length > 0 
    ? validOccupancyValues.reduce((sum, value) => sum + value, 0) / validOccupancyValues.length
    : 0;
  
  const maxOccupancy = validOccupancyValues.length > 0 
    ? Math.max(...validOccupancyValues)
    : 0;
    
  const minOccupancy = validOccupancyValues.length > 0 
    ? Math.min(...validOccupancyValues)
    : 0;
    
  const totalShows = sortedData.reduce((sum, item) => {
    const showCount = item.weeklyShowCount;
    const numericCount = typeof showCount === 'string' ? parseInt(showCount) || 0 : (showCount || 0);
    return sum + numericCount;
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      {/* 통계 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">평균 점유율</p>
          <p className="text-lg font-bold text-blue-800">{avgOccupancy.toFixed(1)}%</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 font-medium">최고 점유율</p>
          <p className="text-lg font-bold text-green-800">{maxOccupancy.toFixed(1)}%</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-600 font-medium">최저 점유율</p>
          <p className="text-lg font-bold text-orange-800">{minOccupancy.toFixed(1)}%</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">총 공연 횟수</p>
          <p className="text-lg font-bold text-purple-800">{totalShows}회</p>
        </div>
      </div>

      {/* 차트 */}
      <div className="h-[400px]">
        <Bar data={chartData} options={options} />
      </div>
    </motion.div>
  );
}