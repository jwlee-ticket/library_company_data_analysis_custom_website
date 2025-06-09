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
  ChartData,
  ChartOptions,
  Scale,
  CoreScaleOptions,
  Tick,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Chart } from 'react-chartjs-2';
import { FaAd, FaGift, FaPercent, FaStar } from 'react-icons/fa';
import { useState } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

interface MarketingEvent {
  date: string;
  type: 'promotion' | 'sales' | 'event' | 'discount';
  title: string;
  description: string;
}

interface RevenueData {
  date: string;
  actualRevenue: number;
  cumulativeRevenue: number;
  targetRevenue: number;
}

interface CumulativeRevenueChartProps {
  title: string;
  data: RevenueData[];
  marketingEvents: MarketingEvent[];
}

const getMarketingIcon = (type: MarketingEvent['type']) => {
  switch (type) {
    case 'promotion':
      return '🎁';
    case 'sales':
      return '💰';
    case 'event':
      return '⭐';
    case 'discount':
      return '📢';
    default:
      return null;
  }
};

const getMarketingColor = (type: MarketingEvent['type']) => {
  switch (type) {
    case 'promotion':
      return '#9333ea'; // purple-600
    case 'sales':
      return '#16a34a'; // green-600
    case 'event':
      return '#ca8a04'; // yellow-600
    case 'discount':
      return '#2563eb'; // blue-600
    default:
      return '#6b7280'; // gray-500
  }
};

export default function CumulativeRevenueChart({
  title,
  data,
  marketingEvents,
}: CumulativeRevenueChartProps) {
  const [hoveredEvent, setHoveredEvent] = useState<MarketingEvent | null>(null);

  const chartData: ChartData<'bar' | 'line'> = {
    labels: data.map(item => item.date),
    datasets: [
      {
        type: 'bar' as const,
        label: '누적 실 매출',
        data: data.map(item => item.cumulativeRevenue),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
        order: 2,
      },
      {
        type: 'bar' as const,
        label: '실 매출',
        data: data.map(item => item.actualRevenue),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
        order: 3,
      },
      {
        type: 'line' as const,
        label: '누적 목표 매출',
        data: data.map(item => item.targetRevenue),
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        order: 1,
      },
    ],
  };

  const options: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          afterBody: (context) => {
            const date = data[context[0].dataIndex].date;
            const event = marketingEvents.find(e => e.date === date);
            if (event) {
              return [
                '',
                '마케팅 활동:',
                `${getMarketingIcon(event.type)} ${event.title}`,
                event.description,
              ];
            }
            return [];
          },
        },
      },
      //@ts-ignore
      annotation: {
        common: {
          drawTime: 'beforeDatasetsDraw',
        },
        annotations: marketingEvents.reduce((acc, event, index) => {
          const dataIndex = data.findIndex(item => item.date === event.date);
          if (dataIndex === -1) return acc;

          const color = getMarketingColor(event.type);
          
          return {
            ...acc,
            [`marketing-line-${index}`]: {
              type: 'line',
              xMin: dataIndex,
              xMax: dataIndex,
              borderColor: color,
              borderWidth: 2,
              borderDash: [4, 4],
              label: {
                display: true,
                content: getMarketingIcon(event.type),
                position: 'start',
                backgroundColor: 'transparent',
                color: 'black',
                font: {
                  size: 20,
                },
                yAdjust: -10,
              },
            },
            [`marketing-label-${index}`]: {
              type: 'label',
              xValue: dataIndex,
              yValue: 0,
              backgroundColor: color,
              content: event.type.toUpperCase(),
              color: 'white',
              padding: 4,
              borderRadius: 4,
              font: {
                size: 11,
                weight: 'bold',
              },
              yAdjust: 20,
            },
          };
        }, {}),
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: '매출 (원)',
        },
        ticks: {
          callback: function(
            this: Scale<CoreScaleOptions>,
            tickValue: string | number,
            index: number,
            ticks: Tick[]
          ) {
            if (typeof tickValue === 'number') {
              return tickValue.toLocaleString() + '원';
            }
            return tickValue;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
} 