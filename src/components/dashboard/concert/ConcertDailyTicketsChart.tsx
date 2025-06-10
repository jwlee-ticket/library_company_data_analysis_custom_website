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

interface DailyTickets {
  date: string;
  count: number;
}

interface ConcertDailyTicketsChartProps {
  data: DailyTickets[];
}

export default function ConcertDailyTicketsChart({ data }: ConcertDailyTicketsChartProps) {
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: '판매 매수',
        data: data.map(item => item.count),
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
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
            return `판매 매수: ${value.toLocaleString()}매`;
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
            return value.toLocaleString() + '매';
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