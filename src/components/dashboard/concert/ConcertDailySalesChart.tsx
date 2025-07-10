import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ConcertDailyData } from '@/hooks/useConcertIndividualApi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface ConcertDailySalesChartProps {
  data: ConcertDailyData[];
}

export default function ConcertDailySalesChart({ data }: ConcertDailySalesChartProps) {
  // 0이 아닌 데이터만 필터링하고 날짜순으로 정렬
  const filteredData = data
    .filter(item => item.dailySalesAmount > 0)
    .sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime());

  if (filteredData.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-lg font-medium mb-2">매출 데이터가 없습니다</p>
          <p className="text-sm">선택한 기간 동안 판매된 티켓이 없습니다.</p>
        </div>
      </div>
    );
  }

  // 최대값 계산하여 여유공간 확보
  const maxValue = Math.max(...filteredData.map(item => item.dailySalesAmount));
  const yAxisMax = maxValue * 1.2; // 20% 여유공간

  const chartData = {
    labels: filteredData.map(item => {
      const date = new Date(item.recordDate);
      return date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      });
    }),
    datasets: [
      {
        label: '일간 매출',
        data: filteredData.map(item => item.dailySalesAmount),
        backgroundColor: 'rgba(236, 72, 153, 0.7)',
        borderColor: 'rgba(236, 72, 153, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw as number;
            return `매출: ${value.toLocaleString()}원`;
          },
        },
      },
      datalabels: {
        display: true,
        anchor: 'end',
        align: 'top',
        color: '#6B7280',
        font: {
          size: 10,
          weight: 'bold',
        },
        padding: 4,
        formatter: (value: number) => {
          if (!value || value === 0) return '';
          // 작은 값은 표시하지 않음 (0이 아닌 값들 중에서)
          if (maxValue > 0 && value < maxValue * 0.1) return '';
          
          // 만원 단위로 표시
          const manwon = Math.round(value / 10000);
          return `${manwon}만원`;
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          color: '#6B7280',
        },
      },
      y: {
        beginAtZero: true,
        max: yAxisMax,
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          color: '#6B7280',
          callback: function(value) {
            if (typeof value !== 'number') return value;
            if (value >= 100000000) {
              return `${(value / 100000000).toFixed(1)}억원`;
            } else if (value >= 10000) {
              return `${(value / 10000).toFixed(0)}만원`;
            }
            return value.toLocaleString() + '원';
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-[400px]">
      <Bar data={chartData} options={options} />
    </div>
  );
} 