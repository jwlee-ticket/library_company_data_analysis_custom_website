'use client';

import { motion } from 'framer-motion';
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
import { PlayDailyDetail } from '@/lib/api';

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

interface PlayWeeklyTicketChartProps {
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

export default function PlayWeeklyTicketChart({ 
  data, 
  selectedPerformance 
}: PlayWeeklyTicketChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-4">🎫</div>
          <p className="text-lg font-medium mb-2">판매 매수 데이터가 없습니다</p>
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
        soldTickets: 0,
        maxTickets: 0,
        showCount: 0,
        totalSales: 0
      };
    }
    
    acc[weekStartStr].soldTickets += Number(item.paidSeatTot || 0);
    acc[weekStartStr].maxTickets += Number(item.showTotalSeatNumber || 0);
    acc[weekStartStr].showCount += 1;
    acc[weekStartStr].totalSales += Number(item.dailySales || 0);
    
    return acc;
  }, {} as Record<string, {
    weekStart: string;
    weekEnd: string;
    soldTickets: number;
    maxTickets: number;
    showCount: number;
    totalSales: number;
  }>);

  // 배열로 변환하고 날짜순 정렬
  const sortedWeeklyData = Object.values(weeklyData)
    .sort((a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime());

  // 최대값 계산하여 여유공간 확보
  const maxSoldTickets = Math.max(...sortedWeeklyData.map(item => item.soldTickets));
  const maxAvailableTickets = Math.max(...sortedWeeklyData.map(item => item.maxTickets));
  const yAxisMax = Math.max(maxSoldTickets, maxAvailableTickets) * 1.2; // 20% 여유공간

  const chartData = {
    labels: sortedWeeklyData.map(item => {
      const startDate = new Date(item.weekStart);
      const endDate = new Date(item.weekEnd);
      return `${startDate.getMonth() + 1}/${startDate.getDate()}~${endDate.getMonth() + 1}/${endDate.getDate()}`;
    }),
    datasets: [
      {
        type: 'bar' as const,
        label: '실제 판매 매수',
        data: sortedWeeklyData.map(item => item.soldTickets),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: 60, // 막대 최대 넓이 60px로 제한
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: '최대 판매 가능 매수',
        data: sortedWeeklyData.map(item => item.maxTickets),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 4,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 8,
        pointHoverRadius: 10,
        fill: false,
        tension: 0.3,
        yAxisID: 'y',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: `주간별 판매 매수 현황${selectedPerformance !== 'all' ? ` - ${selectedPerformance}` : ''}`,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#374151',
      },
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          font: {
            size: 12,
          },
          color: '#6b7280',
          padding: 20,
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
            const item = sortedWeeklyData[dataIndex];
            if (!context.parsed || typeof context.parsed.y !== 'number') {
              return '';
            }
            const value = context.parsed.y;
            const percentage = item.maxTickets > 0 ? (item.soldTickets / item.maxTickets * 100) : 0;
            
            if (context.datasetIndex === 0) {
              return [
                `실제 판매: ${value.toLocaleString()}매`,
                `판매율: ${percentage.toFixed(1)}%`,
                `공연 횟수: ${item.showCount}회`
              ];
            } else {
              return [
                `최대 가능: ${value.toLocaleString()}매`,
                `잠재 판매: ${(item.maxTickets - item.soldTickets).toLocaleString()}매`
              ];
            }
          }
        }
      },
      datalabels: {
        display: function(context: any) {
          // 모든 데이터셋에 표시하되, 0인 값은 제외
          if (!context.parsed || typeof context.parsed.y !== 'number') {
            return false;
          }
          return context.parsed.y > 0;
        },
        backgroundColor: function(context: any) {
          // 막대 그래프는 파란색, 라인 그래프는 빨간색 배경
          return context.datasetIndex === 0 
            ? 'rgba(59, 130, 246, 0.8)' 
            : 'rgba(239, 68, 68, 0.8)';
        },
        borderColor: '#fff',
        borderWidth: 1,
        borderRadius: 4,
        color: '#fff',
        font: {
          weight: 'bold' as const,
          size: 10,
        },
        padding: 4,
        anchor: function(context: any) {
          // 막대 그래프는 위쪽, 라인 그래프는 위쪽
          return context.datasetIndex === 0 ? 'end' as const : 'end' as const;
        },
        align: function(context: any) {
          // 막대 그래프는 위쪽, 라인 그래프는 아래쪽
          return context.datasetIndex === 0 ? 'top' as const : 'bottom' as const;
        },
        offset: function(context: any) {
          return context.datasetIndex === 0 ? 4 : -4;
        },
        formatter: (value: number, context: any) => {
          if (!value || value === 0) return '';
          
          // 최대값 계산하여 작은 값은 표시하지 않음
          const maxValue = Math.max(...sortedWeeklyData.map(item => 
            context.datasetIndex === 0 ? item.soldTickets : item.maxTickets
          ));
          
          // 최대값의 10% 미만인 값은 표시하지 않음
          if (maxValue > 0 && value < maxValue * 0.1) return '';
          
          return value.toLocaleString();
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
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        max: yAxisMax,
        title: {
          display: true,
          text: '매수',
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
            return `${value.toLocaleString()}매`;
          },
        },
      },
    },
  };

  // 통계 계산
  const totalSoldTickets = sortedWeeklyData.reduce((sum, item) => sum + item.soldTickets, 0);
  const totalMaxTickets = sortedWeeklyData.reduce((sum, item) => sum + item.maxTickets, 0);
  const avgSalesRate = totalMaxTickets > 0 ? (totalSoldTickets / totalMaxTickets * 100) : 0;
  const totalShows = sortedWeeklyData.reduce((sum, item) => sum + item.showCount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      {/* 통계 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">총 판매 매수</p>
          <p className="text-lg font-bold text-blue-800">{totalSoldTickets.toLocaleString()}매</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-600 font-medium">총 가능 매수</p>
          <p className="text-lg font-bold text-red-800">{totalMaxTickets.toLocaleString()}매</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 font-medium">평균 판매율</p>
          <p className="text-lg font-bold text-green-800">{avgSalesRate.toFixed(1)}%</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">총 공연 횟수</p>
          <p className="text-lg font-bold text-purple-800">{totalShows}회</p>
        </div>
      </div>

      {/* 차트 */}
      <div className="h-[400px]">
        <Chart type="bar" data={chartData} options={options} />
      </div>
    </motion.div>
  );
}