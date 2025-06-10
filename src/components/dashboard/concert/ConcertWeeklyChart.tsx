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

interface Week {
  id: number;
  label: string;
}

interface Concert {
  id: number;
  title: string;
  revenue: number;
}

interface WeeklyData {
  weekId: number;
  total: number;
  concerts: Concert[];
}

interface ConcertWeeklyChartProps {
  data: {
    weeks: Week[];
    data: WeeklyData[];
  };
}

export default function ConcertWeeklyChart({ data }: ConcertWeeklyChartProps) {
  const uniqueConcerts = Array.from(
    new Set(data.data.flatMap(week => week.concerts.map(concert => concert.title)))
  );

  const colors = [
    'rgba(147, 51, 234, 0.7)',  // 보라색
    'rgba(236, 72, 153, 0.7)',  // 핑크색
    'rgba(79, 70, 229, 0.7)',   // 인디고색
    'rgba(59, 130, 246, 0.7)',  // 파란색
    'rgba(16, 185, 129, 0.7)',  // 초록색
  ];

  const chartData = {
    labels: data.weeks.map(week => week.label),
    datasets: uniqueConcerts.map((concertTitle, index) => ({
      label: concertTitle,
      data: data.data.map(week => 
        week.concerts.find(concert => concert.title === concertTitle)?.revenue || 0
      ),
      backgroundColor: colors[index % colors.length],
      borderRadius: 4,
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
    },
    scales: {
      x: {
        grid: {
          display: false,
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