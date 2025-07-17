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
  ChartOptions,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';
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
  ChartDataLabels,
  annotationPlugin
);

interface MarketingSalesData {
  date: string;
  dailySales: number;
  cumulativeSales: number;
  lastYearComparison: number;
  marketingEvents: number;
  isIncreasing: boolean;
}

interface MarketingSalesChartProps {
  data: MarketingSalesData[];
  selectedConcert: string;
}

export default function MarketingSalesChart({ data, selectedConcert }: MarketingSalesChartProps) {
  // 빈 데이터 처리
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
          </div>
          <p className="text-lg font-medium mb-2">매출 데이터가 없습니다</p>
          <p className="text-sm">선택한 조건에 해당하는 매출 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  // 날짜순으로 정렬
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 차트 라벨 생성 (날짜를 MM.DD 형식으로 변환)
  const chartLabels = sortedData.map(item => {
    const date = new Date(item.date);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}.${day}`;
  });

  // 일일 매출 데이터
  const dailySalesData = sortedData.map(item => item.dailySales);

  // 목표 매출 계산 (평균 매출의 120%로 설정)
  const averageSales = dailySalesData.reduce((sum, val) => sum + val, 0) / dailySalesData.length;
  const targetSales = averageSales * 1.2;
  const targetSalesData = new Array(dailySalesData.length).fill(targetSales);

  // 최대값 계산 (여백을 위해)
  const maxSales = Math.max(...dailySalesData, targetSales);
  const yAxisMax = maxSales * 1.2;

  // 마케팅 이벤트가 있는 날짜 찾기
  const marketingDates = sortedData
    .map((item, index) => ({ ...item, index }))
    .filter(item => item.marketingEvents > 0);

  // Chart.js 설정
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        type: 'bar' as const,
        label: '일일 매출',
        data: dailySalesData,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        order: 1,
        datalabels: {
          anchor: 'end' as const,
          align: 'top' as const,
          formatter: (value: number) => `${(value / 10000).toFixed(0)}만원`,
          color: '#374151',
          font: {
            size: 10,
            weight: 'bold' as const
          }
        }
      },
      {
        type: 'line' as const,
        label: '목표 매출',
        data: targetSalesData,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: 'rgb(239, 68, 68)',
        pointRadius: 3,
        tension: 0.4,
        order: 2,
        datalabels: {
          display: false
        }
      }
    ]
  };

  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.dataset.label === '일일 매출' || context.dataset.label === '목표 매출') {
              return `${context.dataset.label}: ${(context.parsed.y / 10000).toFixed(0)}만원`;
            }
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}원`;
          },
          afterBody: function(tooltipItems) {
            if (tooltipItems.length > 0) {
              const dataIndex = tooltipItems[0].dataIndex;
              const dayData = sortedData[dataIndex];
              
              if (dayData.marketingEvents > 0) {
                return ['', `마케팅 활동: ${dayData.marketingEvents}개 이벤트`];
              }
            }
            return [];
          }
        },
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        footerFont: {
          size: 11
        },
        padding: 12
      },
      datalabels: {
        display: function(context) {
          return context.dataset.type === 'bar';
        }
      },
      annotation: {
        annotations: marketingDates.reduce((acc, marketingDay, idx) => {
          acc[`marketing_${idx}`] = {
            type: 'box',
            xMin: marketingDay.index - 0.4,
            xMax: marketingDay.index + 0.4,
            yMin: 0,
            yMax: yAxisMax,
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderColor: 'rgba(34, 197, 94, 0.3)',
            borderWidth: 1,
            borderDash: [5, 5],
          };
          return acc;
        }, {} as any)
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(229, 231, 235, 0.5)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        max: yAxisMax,
        grid: {
          display: true,
          color: 'rgba(229, 231, 235, 0.5)'
        },
        ticks: {
          stepSize: yAxisMax / 10,
          callback: function(value) {
            return `${(Number(value) / 10000).toFixed(0)}만원`;
          },
          font: {
            size: 11
          }
        },
        title: {
          display: true,
          text: '일일 매출 / 목표 매출',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg border border-gray-200 p-6"
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">매출 & 마케팅 현황</h3>
          <p className="text-sm text-gray-600 mt-1">
            {selectedConcert} • {chartLabels[0]} ~ {chartLabels[chartLabels.length - 1]}
          </p>
        </div>
      </div>

      {/* 차트 영역 */}
      <div className="relative">
        <div className="h-[400px]">
          <Chart type="bar" data={chartData} options={options} />
        </div>
      </div>

      {/* 데이터 요약 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-4">데이터 요약</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">총 매출</span>
            <p className="font-semibold text-blue-600">
              {(dailySalesData.reduce((sum, val) => sum + val, 0) / 10000).toLocaleString()}만원
            </p>
          </div>
          <div>
            <span className="text-gray-600">평균 매출</span>
            <p className="font-semibold text-green-600">
              {(averageSales / 10000).toFixed(0)}만원
            </p>
          </div>
          <div>
            <span className="text-gray-600">최고 매출</span>
            <p className="font-semibold text-purple-600">
              {(Math.max(...dailySalesData) / 10000).toFixed(0)}만원
            </p>
          </div>
          <div>
            <span className="text-gray-600">마케팅 활동</span>
            <p className="font-semibold text-orange-600">
              {marketingDates.length}일간
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 