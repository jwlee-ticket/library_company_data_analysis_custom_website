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
import { PlayMonthlyByPerformance } from '@/lib/api';
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

interface PlayPerformanceRevenueChartProps {
  data: PlayMonthlyByPerformance[];
}

// 공연별 색상 매핑 (고정된 색상을 사용)
const PERFORMANCE_COLORS = [
  'rgba(59, 130, 246, 0.7)',   // 파란색
  'rgba(236, 72, 153, 0.7)',   // 핑크색
  'rgba(34, 197, 94, 0.7)',    // 초록색
  'rgba(249, 115, 22, 0.7)',   // 주황색
  'rgba(147, 51, 234, 0.7)',   // 보라색
  'rgba(14, 165, 233, 0.7)',   // 하늘색
  'rgba(239, 68, 68, 0.7)',    // 빨간색
  'rgba(16, 185, 129, 0.7)',   // 청록색
  'rgba(245, 158, 11, 0.7)',   // 노란색
  'rgba(168, 85, 247, 0.7)',   // 연보라색
];

export default function PlayPerformanceRevenueChart({ data }: PlayPerformanceRevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-4">🎭</div>
          <p className="text-lg font-medium mb-2">공연별 매출 데이터가 없습니다</p>
          <p className="text-sm">데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  // 월별로 그룹화하고 정렬
  const monthsSet = new Set(data.map(item => item.month || ''));
  const months = Array.from(monthsSet).sort();

  // 공연별로 그룹화
  const performancesSet = new Set(data.map(item => item.performance_name || ''));
  const performances = Array.from(performancesSet);

  // 차트 데이터 생성
  const chartData = {
    labels: months.map(month => {
      const [year, monthNum] = month.split('-');
      return `${year}년 ${monthNum}월`;
    }),
    datasets: performances.map((performanceName, index) => {
      const performanceData = data.filter(item => item.performance_name === performanceName);
      
      return {
        label: performanceName,
        data: months.map(month => {
          const monthData = performanceData.find(item => item.month === month);
          return monthData?.total_revenue || 0;
        }),
        backgroundColor: PERFORMANCE_COLORS[index % PERFORMANCE_COLORS.length],
        borderColor: PERFORMANCE_COLORS[index % PERFORMANCE_COLORS.length].replace('0.7)', '1)'),
        borderWidth: 1,
        borderRadius: 4,
      };
    }),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: '공연별 월별 매출 현황',
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
          padding: 15,
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
            const performanceName = context.dataset.label;
            if (!context.parsed || typeof context.parsed.y !== 'number') {
              return '';
            }
            const revenue = formatCurrency(context.parsed.y);
            
            // 해당 월의 해당 공연 데이터 찾기
            const month = months[context.dataIndex];
            const performanceData = data.find(
              item => item.month === month && item.performance_name === performanceName
            );
            
            // 안전한 숫자 변환
            const change = performanceData?.percentage_change;
            const numericChange = typeof change === 'string' ? parseFloat(change) : change;
            const changeText = numericChange !== null && numericChange !== undefined && !isNaN(numericChange)
              ? `전월 대비: ${numericChange > 0 ? '+' : ''}${numericChange.toFixed(1)}%`
              : '전월 대비: -';
            
            return [
              `${performanceName}: ${revenue}`,
              changeText
            ];
          }
        }
      },
      datalabels: {
        display: function(context: any) {
          // 데이터 값이 작은 경우 라벨 숨기기 (가독성 향상)
          if (!context.parsed || typeof context.parsed.y !== 'number') {
            return false;
          }
          const value = context.parsed.y;
          return value > 1000000; // 100만원 이상만 표시
        },
        color: '#ffffff',
        font: {
          weight: 'bold' as const,
          size: 10,
        },
        anchor: 'center' as const,
        align: 'center' as const,
        formatter: (value: number) => {
          if (value >= 100000000) {
            return `${(value / 100000000).toFixed(0)}억`;
          } else if (value >= 10000000) {
            return `${(value / 10000000).toFixed(0)}천만`;
          } else if (value >= 10000) {
            return `${(value / 10000).toFixed(0)}만`;
          } else {
            return '';
          }
        },
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '기간',
          color: '#6b7280',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
          },
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
        stacked: true,
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
  const performanceStats = performances.map(performanceName => {
    const performanceData = data.filter(item => item.performance_name === performanceName);
    const totalRevenue = performanceData.reduce((sum, item) => sum + (item.total_revenue || 0), 0);
    return {
      name: performanceName,
      total: totalRevenue,
      count: performanceData.length,
      average: totalRevenue / performanceData.length
    };
  }).sort((a, b) => b.total - a.total);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      {/* 공연별 통계 요약 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">공연별 매출 순위</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {performanceStats.slice(0, 6).map((stat, index) => (
            <div key={stat.name} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: PERFORMANCE_COLORS[performances.indexOf(stat.name) % PERFORMANCE_COLORS.length] }}
                />
                <span className="text-sm font-medium text-gray-700 truncate">{stat.name}</span>
              </div>
              <p className="text-xs text-gray-500">{formatCurrency(stat.total)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 차트 */}
      <div className="h-[400px]">
        <Bar data={chartData} options={options} />
      </div>
    </motion.div>
  );
} 