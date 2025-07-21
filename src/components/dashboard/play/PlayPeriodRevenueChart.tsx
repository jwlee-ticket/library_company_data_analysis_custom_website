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
import { Bar } from 'react-chartjs-2';
import { PlayMonthlySummary } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

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

interface PlayPeriodRevenueChartProps {
  data: PlayMonthlySummary[];
}

export default function PlayPeriodRevenueChart({ data }: PlayPeriodRevenueChartProps) {
  // 안전한 숫자 변환 함수
  const toSafeNumber = (value: any): number => {
    if (typeof value === 'number' && isFinite(value) && value >= 0) {
      return Math.min(value, 1000000000000); // 1조원 이하로 제한
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      if (isFinite(parsed) && parsed >= 0) {
        return Math.min(parsed, 1000000000000);
      }
    }
    return 0;
  };

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-lg font-medium mb-2">월별 매출 데이터가 없습니다</p>
          <p className="text-sm">데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  // 데이터를 날짜순으로 정렬 (과거 → 현재)
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date((a.month_str || '') + '-01');
    const dateB = new Date((b.month_str || '') + '-01');
    return dateA.getTime() - dateB.getTime();
  });

  const chartData = {
    labels: sortedData.map(item => {
      const [year, month] = (item.month_str || '').split('-');
      return `${year}년 ${month}월`;
    }),
    datasets: [
      {
        label: '월별 매출',
        data: sortedData.map(item => toSafeNumber(item.total_revenue)),
        backgroundColor: sortedData.map(item => {
          const change = item.percentage_change || 0;
          if (change > 0) return 'rgba(34, 197, 94, 0.6)'; // 증가: 초록색
          if (change < 0) return 'rgba(239, 68, 68, 0.6)'; // 감소: 빨간색
          return 'rgba(59, 130, 246, 0.6)'; // 동일/첫 월: 파란색
        }),
        borderColor: sortedData.map(item => {
          const change = item.percentage_change || 0;
          if (change > 0) return 'rgb(34, 197, 94)';
          if (change < 0) return 'rgb(239, 68, 68)';
          return 'rgb(59, 130, 246)';
        }),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 60, // 막대 최대 넓이 제한
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: '연극 & 뮤지컬 월별 매출 추이',
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        color: '#1f2937',
        padding: 20,
      },
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const dataIndex = context.dataIndex;
            const item = sortedData[dataIndex];
            if (!context.parsed || typeof context.parsed.y !== 'number') {
              return '';
            }
            const revenue = formatCurrency(context.parsed.y);
            const change = item.percentage_change;
            
            // 안전한 숫자 변환
            const numericChange = typeof change === 'string' ? parseFloat(change) : change;
            const changeText = numericChange !== null && numericChange !== undefined && !isNaN(numericChange)
              ? `전월 대비: ${numericChange > 0 ? '+' : ''}${numericChange.toFixed(1)}%`
              : '전월 대비: -';
            
            return [
              `매출: ${revenue}`,
              changeText
            ];
          }
        }
      },
      datalabels: {
        display: true,
        color: '#1f2937',
        font: {
          weight: 'bold' as const,
          size: 12,
        },
        anchor: 'end' as const,
        align: 'top' as const,
        offset: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        borderRadius: 6,
        padding: {
          top: 4,
          bottom: 4,
          left: 8,
          right: 8,
        },
        formatter: (value: number) => {
          if (value >= 100000000) {
            return `${(value / 100000000).toFixed(1)}억원`;
          } else if (value >= 10000) {
            return `${(value / 10000).toFixed(0)}만원`;
          } else {
            return value.toLocaleString() + '원';
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
            size: 14,
            weight: 'bold' as const,
          },
        },
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
        categoryPercentage: 0.7, // 카테고리 너비 비율 (전체 공간의 70%)
        barPercentage: 0.8, // 막대 너비 비율 (카테고리의 80%)
      },
      y: {
        title: {
          display: true,
          text: '매출 (원)',
          color: '#6b7280',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
          callback: function(value: any) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  // 통계 계산 - 안전한 데이터 처리
  console.log('📊 PlayPeriodRevenueChart - 원본 데이터:', sortedData);
  console.log('📊 매출 데이터 추출:', sortedData.map(item => ({
    month: item.month_str,
    revenue: item.total_revenue,
    type: typeof item.total_revenue
  })));

  // 안전한 매출 데이터 변환
  const validRevenueData: number[] = sortedData
    .map(item => toSafeNumber(item.total_revenue))
    .filter(revenue => revenue > 0); // 0보다 큰 값만 유효

  console.log('📊 유효한 매출 데이터:', validRevenueData);

  const totalRevenue = validRevenueData.reduce((sum, revenue) => sum + revenue, 0);
  const averageRevenue = validRevenueData.length > 0 ? totalRevenue / validRevenueData.length : 0;
  const maxRevenue = validRevenueData.length > 0 ? Math.max(...validRevenueData) : 0;
  const minRevenue = validRevenueData.length > 0 ? Math.min(...validRevenueData) : 0;

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
          <p className="text-sm text-blue-600 font-medium">총 매출</p>
          <p className="text-lg font-bold text-blue-800">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 font-medium">월 평균</p>
          <p className="text-lg font-bold text-green-800">{formatCurrency(averageRevenue)}</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">최고 매출</p>
          <p className="text-lg font-bold text-purple-800">{formatCurrency(maxRevenue)}</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-600 font-medium">최저 매출</p>
          <p className="text-lg font-bold text-orange-800">{formatCurrency(minRevenue)}</p>
        </div>
      </div>

      {/* 차트 - 최대 너비 제한 */}
      <div className="w-full max-w-5xl mx-auto h-[450px] overflow-x-auto">
        <div className="min-w-[600px] h-full">
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </motion.div>
  );
}