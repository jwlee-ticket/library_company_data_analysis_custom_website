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
import { PlayDailyDetail } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface PlayWeeklyRevenueChartProps {
  data: PlayDailyDetail[];
  selectedPerformance: string;
}

// 주간 시작일 계산 함수 (월요일 기준)
const getWeekStart = (date: Date): Date => {
  const dayOfWeek = date.getDay();
  const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

// 주간 종료일 계산 함수 (일요일 기준)
const getWeekEnd = (weekStart: Date): Date => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
};

export default function PlayWeeklyRevenueChart({ 
  data, 
  selectedPerformance 
}: PlayWeeklyRevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-4">💰</div>
          <p className="text-lg font-medium mb-2">판매 금액 데이터가 없습니다</p>
          <p className="text-sm">선택한 조건의 데이터를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  // 필터링된 데이터
  const filteredData = selectedPerformance === 'all' 
    ? data 
    : data.filter(item => item.liveName === selectedPerformance);

  // 주간별로 그룹화
  const weeklyData = filteredData.reduce((acc, item) => {
    if (!item.latestRecordDate) return acc;
    
    const showDate = new Date(item.latestRecordDate);
    const weekStart = getWeekStart(new Date(showDate));
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    if (!acc[weekStartStr]) {
      acc[weekStartStr] = {
        weekStart: weekStartStr,
        weekEnd: getWeekEnd(weekStart).toISOString().split('T')[0],
        totalRevenue: 0,
        showCount: 0,
        avgRevenuePerShow: 0
      };
    }
    
    acc[weekStartStr].totalRevenue += item.dailySales || 0;
    acc[weekStartStr].showCount += 1;
    
    return acc;
  }, {} as Record<string, {
    weekStart: string;
    weekEnd: string;
    totalRevenue: number;
    showCount: number;
    avgRevenuePerShow: number;
  }>);

  // 평균 계산 및 배열로 변환
  const sortedWeeklyData = Object.values(weeklyData)
    .map(item => ({
      ...item,
      avgRevenuePerShow: item.showCount > 0 ? item.totalRevenue / item.showCount : 0
    }))
    .sort((a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime());

  // 전주 대비 증감률 계산
  const weeklyDataWithGrowth = sortedWeeklyData.map((item, index) => {
    const previousWeek = index > 0 ? sortedWeeklyData[index - 1] : null;
    const growthRate = previousWeek && previousWeek.totalRevenue > 0 
      ? ((item.totalRevenue - previousWeek.totalRevenue) / previousWeek.totalRevenue) * 100
      : 0;
    
    return { ...item, growthRate };
  });

  const chartData = {
    labels: weeklyDataWithGrowth.map(item => {
      const startDate = new Date(item.weekStart);
      const endDate = new Date(item.weekEnd);
      return `${startDate.getMonth() + 1}/${startDate.getDate()}~${endDate.getMonth() + 1}/${endDate.getDate()}`;
    }),
    datasets: [
      {
        label: '주간 매출',
        data: weeklyDataWithGrowth.map(item => item.totalRevenue),
        backgroundColor: weeklyDataWithGrowth.map(item => {
          const growth = item.growthRate;
          if (growth > 10) return 'rgba(34, 197, 94, 0.8)'; // 초록색 (큰 증가)
          if (growth > 0) return 'rgba(59, 130, 246, 0.8)'; // 파란색 (증가)
          if (growth > -10) return 'rgba(245, 158, 11, 0.8)'; // 주황색 (소폭 감소)
          return 'rgba(239, 68, 68, 0.8)'; // 빨간색 (큰 감소)
        }),
        borderColor: weeklyDataWithGrowth.map(item => {
          const growth = item.growthRate;
          if (growth > 10) return 'rgb(34, 197, 94)';
          if (growth > 0) return 'rgb(59, 130, 246)';
          if (growth > -10) return 'rgb(245, 158, 11)';
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
        text: `주간별 총 판매 금액${selectedPerformance !== 'all' ? ` - ${selectedPerformance}` : ''}`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#374151',
      },
      legend: {
        display: false,
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
            const item = weeklyDataWithGrowth[dataIndex];
            if (!context.parsed || typeof context.parsed.y !== 'number') {
              return '';
            }
            const revenue = context.parsed.y;
            
            return [
              `총 매출: ${formatCurrency(revenue)}`,
              `공연 횟수: ${item.showCount}회`,
              `회당 평균: ${formatCurrency(item.avgRevenuePerShow)}`,
              `전주 대비: ${item.growthRate > 0 ? '+' : ''}${item.growthRate.toFixed(1)}%`
            ];
          }
        }
      },
      datalabels: {
        display: true,
        color: '#ffffff',
        font: {
          weight: 'bold' as const,
          size: 11,
        },
        anchor: 'end' as const,
        align: 'top' as const,
        offset: 4,
        formatter: (value: number) => {
          if (value >= 100000000) {
            return `${(value / 100000000).toFixed(1)}억`;
          } else if (value >= 10000) {
            return `${(value / 10000).toFixed(0)}만`;
          } else {
            return value.toLocaleString();
          }
        },
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
          text: '매출 (원)',
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
            return formatCurrency(value);
          },
        },
      },
    },
  };

  // 통계 계산
  const totalRevenue = weeklyDataWithGrowth.reduce((sum, item) => sum + item.totalRevenue, 0);
  const avgWeeklyRevenue = weeklyDataWithGrowth.length > 0 ? totalRevenue / weeklyDataWithGrowth.length : 0;
  const maxWeeklyRevenue = weeklyDataWithGrowth.length > 0 
    ? Math.max(...weeklyDataWithGrowth.map(item => item.totalRevenue)) 
    : 0;
  const totalShows = weeklyDataWithGrowth.reduce((sum, item) => sum + item.showCount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      {/* 통계 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">총 매출</p>
          <p className="text-lg font-bold text-blue-800">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 font-medium">주간 평균</p>
          <p className="text-lg font-bold text-green-800">{formatCurrency(avgWeeklyRevenue)}</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">최고 주간 매출</p>
          <p className="text-lg font-bold text-purple-800">{formatCurrency(maxWeeklyRevenue)}</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-600 font-medium">총 공연 횟수</p>
          <p className="text-lg font-bold text-orange-800">{totalShows}회</p>
        </div>
      </div>

      {/* 차트 */}
      <div className="h-[400px]">
        <Bar data={chartData} options={options} />
      </div>
    </motion.div>
  );
}