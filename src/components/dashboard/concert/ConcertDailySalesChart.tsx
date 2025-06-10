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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DailySales {
  date: string;
  amount: number;
}

interface ConcertDailySalesChartProps {
  data: DailySales[];
}

export default function ConcertDailySalesChart({ data }: ConcertDailySalesChartProps) {
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: '일간 매출',
        data: data.map(item => item.amount),
        backgroundColor: 'rgba(236, 72, 153, 0.7)',
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
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
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