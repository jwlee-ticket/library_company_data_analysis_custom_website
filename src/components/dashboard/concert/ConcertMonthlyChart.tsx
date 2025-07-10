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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface Concert {
  id: number;
  title: string;
  revenue: number;
}

interface MonthlyData {
  date: string;
  total: number;
  concerts: Concert[];
}

interface ConcertMonthlyChartProps {
  data: {
    dates: string[];
    data: MonthlyData[];
  };
}

export default function ConcertMonthlyChart({ data }: ConcertMonthlyChartProps) {
  const uniqueConcerts = Array.from(
    new Set(data.data.flatMap(month => month.concerts.map(concert => concert.title)))
  );

  const colors = [
    'rgba(147, 51, 234, 0.7)',  // 보라색
    'rgba(236, 72, 153, 0.7)',  // 핑크색
    'rgba(79, 70, 229, 0.7)',   // 인디고색
    'rgba(59, 130, 246, 0.7)',  // 파란색
    'rgba(16, 185, 129, 0.7)',  // 초록색
  ];

  // 데이터 변환 (최신 날짜가 오른쪽에 오도록 정렬)
  const sortedDates = [...data.dates].sort(); // 오름차순 정렬
  const sortedData = sortedDates.map(date => 
    data.data.find(item => item.date === date)
  ).filter(Boolean) as MonthlyData[]; // undefined 제거
  
  const chartData = {
    labels: sortedData.map(month => month.date), // 실제 존재하는 데이터의 날짜만 사용
    datasets: uniqueConcerts.map((concertTitle, index) => ({
      label: concertTitle,
      data: sortedData.map(month => 
        month.concerts.find(concert => concert.title === concertTitle)?.revenue || 0
      ),
      backgroundColor: colors[index % colors.length],
      stack: 'stack',
    })),
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false,
      },
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw as number;
            return `${context.dataset.label}: ${value.toLocaleString()}원`;
          },
        },
      },
      datalabels: {
        display: function(context) {
          // 각 막대 그룹의 최상단에만 총합 표시
          const datasetIndex = context.datasetIndex;
          const datasets = context.chart.data.datasets;
          const dataIndex = context.dataIndex;
          const monthData = sortedData[dataIndex];
          const total = monthData.total;
          
          // 0일 경우 표시하지 않음
          if (total === 0) return false;
          
          return datasetIndex === datasets.length - 1;
        },
        align: 'top',
        anchor: 'end',
        color: '#374151',
        font: {
          size: 11,
          weight: 'bold',
        },
        padding: 8, // 라벨과 막대 사이 여백
        formatter: function(value, context) {
          // 해당 월의 총 매출 계산
          const dataIndex = context.dataIndex;
          const monthData = sortedData[dataIndex];
          const total = monthData.total;
          
          // 0일 경우 표시하지 않음
          if (total === 0) return null;
          
          // 억 단위로 표시 (₩ 제거)
          if (total >= 100000000) {
            return `${(total / 100000000).toFixed(1)}억`;
          }
          if (total >= 10000) {
            return `${(total / 10000).toFixed(0)}만`;
          }
          return `${total.toLocaleString()}`;
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        suggestedMax: (() => {
          // 최대값에 20% 여유 공간 추가
          const max = Math.max(...sortedData.map(item => item.total));
          return max * 1.2;
        })(),
        ticks: {
          callback: function(value) {
            if (typeof value !== 'number') return value;
            if (value >= 100000000) {
              return `${(value / 100000000).toFixed(1)}억`;
            }
            if (value >= 10000) {
              return `${(value / 10000).toFixed(0)}만`;
            }
            return value;
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