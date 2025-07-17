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
  // 실제 차트 데이터 (이미지 기준으로 정확히 매칭)
  const chartDates = ['25.04.17', '25.04.18', '25.04.19', '25.04.20', '25.04.21', '25.04.22', '25.04.23', '25.04.24', '25.04.25', '25.04.26', '25.04.27', '25.04.28'];
  
  // 일일 매출 데이터 (막대 그래프용)
  const dailySalesData = [12000000, 10000000, 14000000, 16000000, 17000000, 15000000, 28000000, 21000000, 13000000, 15000000, 16000000, 8000000];
  
  // 목표 매출 데이터 (라인 그래프용)
  const targetSalesData = [15000000, 15000000, 15000000, 15000000, 20000000, 20000000, 25000000, 25000000, 18000000, 18000000, 18000000, 18000000];

  // 마케팅 이벤트 정의 (날짜와 색상)
  const marketingPeriods = [
    {
      name: '인터파크 아웃트로 40%',
      startIndex: 0, // 25.04.17
      endIndex: 3,   // 25.04.20
      color: 'rgba(59, 130, 246, 0.15)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      description: '인터파크 아웃트로 40% 할인 + 예스24 콘서트 프로모션',
      category: 'salesMarketing',
      startDate: '2025-04-17',
      endDate: '2025-04-20'
    },
    {
      name: '메조 타입캐스팅 40%',
      startIndex: 4, // 25.04.21
      endIndex: 5,   // 25.04.22
      color: 'rgba(236, 72, 153, 0.15)',
      borderColor: 'rgba(236, 72, 153, 0.3)',
      description: '메조 타입캐스팅 40% 할인',
      category: 'promotion',
      startDate: '2025-04-21',
      endDate: '2025-04-22'
    },
    {
      name: '세계적인출장의',
      startIndex: 6, // 25.04.23
      endIndex: 6,   // 25.04.23
      color: 'rgba(245, 158, 11, 0.15)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      description: '세계적인출장의 타입캐스팅',
      category: 'etc',
      startDate: '2025-04-23',
      endDate: '2025-04-23'
    },
    {
      name: '인터파크 놀이스타',
      startIndex: 8, // 25.04.25
      endIndex: 11,  // 25.04.28
      color: 'rgba(34, 197, 94, 0.15)',
      borderColor: 'rgba(34, 197, 94, 0.3)',
      description: '인터파크 놀이스타 특별 프로모션',
      category: 'salesMarketing',
      startDate: '2025-04-25',
      endDate: '2025-04-28'
    }
  ];

  // 날짜별 마케팅 정보 매핑
  const getMarketingByDate = (dateIndex: number) => {
    return marketingPeriods.filter(period => 
      dateIndex >= period.startIndex && dateIndex <= period.endIndex
    );
  };

  // Chart.js 설정
  const chartData = {
    labels: chartDates,
    datasets: [
      {
        type: 'bar' as const,
        label: '매출',
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
        borderWidth: 3,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: 'rgb(239, 68, 68)',
        pointRadius: 6,
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
            if (context.dataset.label === '매출' || context.dataset.label === '목표 매출') {
              return `${context.dataset.label}: ${(context.parsed.y / 10000).toFixed(0)}만원`;
            }
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}원`;
          },
          afterBody: function(tooltipItems) {
            if (tooltipItems.length > 0) {
              const dataIndex = tooltipItems[0].dataIndex;
              const marketingInfo = getMarketingByDate(dataIndex);
              
              if (marketingInfo.length > 0) {
                const marketingTexts = marketingInfo.map((info: any) => `${info.description}`);
                return ['', '마케팅 활동:', ...marketingTexts];
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
        annotations: {
          // 인터파크 프로모션 배경
          interpark: {
            type: 'box',
            xMin: -0.5,
            xMax: 3.5,
            yMin: 0,
            yMax: 35000000,
            backgroundColor: marketingPeriods[0].color,
            borderColor: marketingPeriods[0].borderColor,
            borderWidth: 1,
            borderDash: [5, 5],
          },
          // 메조 이벤트 배경
          mezzo: {
            type: 'box',
            xMin: 3.5,
            xMax: 5.5,
            yMin: 0,
            yMax: 35000000,
            backgroundColor: marketingPeriods[1].color,
            borderColor: marketingPeriods[1].borderColor,
            borderWidth: 1,
            borderDash: [5, 5],
          },
          // 세계적인출장의 배경
          worldTravel: {
            type: 'box',
            xMin: 5.5,
            xMax: 6.5,
            yMin: 0,
            yMax: 35000000,
            backgroundColor: marketingPeriods[2].color,
            borderColor: marketingPeriods[2].borderColor,
            borderWidth: 1,
            borderDash: [5, 5],
          },
          // 인터파크 놀이스타 배경
          noleestar: {
            type: 'box',
            xMin: 7.5,
            xMax: 11.5,
            yMin: 0,
            yMax: 35000000,
            backgroundColor: marketingPeriods[3].color,
            borderColor: marketingPeriods[3].borderColor,
            borderWidth: 1,
            borderDash: [5, 5],
          }
        }
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
        max: 35000000,
        grid: {
          display: true,
          color: 'rgba(229, 231, 235, 0.5)'
        },
        ticks: {
          stepSize: 5000000,
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
            <h3 className="text-lg font-semibold text-gray-900">마케팅 & 매출 현황</h3>
          </div>
        <select className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>일별 보기</option>
          <option>주별 보기</option>
          <option>월별 보기</option>
        </select>
      </div>

      {/* 차트 영역 */}
      <div className="relative">
        <div className="h-[500px]">
          <Chart type="bar" data={chartData} options={options} />
        </div>
      </div>

      {/* 마케팅 리스트 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-4">진행 중 마케팅 리스트</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-2 pr-4 text-gray-700 font-medium">색상</th>
                <th className="text-left py-2 px-4 text-gray-700 font-medium">카테고리</th>
                <th className="text-left py-2 px-4 text-gray-700 font-medium">내용</th>
                <th className="text-left py-2 px-4 text-gray-700 font-medium">시작일</th>
                <th className="text-left py-2 pl-4 text-gray-700 font-medium">종료일</th>
              </tr>
            </thead>
            <tbody>
              {marketingPeriods.map((period, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-white transition-colors">
                  <td className="py-3 pr-4">
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ 
                        backgroundColor: period.color,
                        borderColor: period.borderColor,
                        borderStyle: 'dashed'
                      }}
                    ></div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{period.category}</td>
                  <td className="py-3 px-4 text-gray-900">{period.name}</td>
                  <td className="py-3 px-4 text-gray-700">{period.startDate}</td>
                  <td className="py-3 pl-4 text-gray-700">{period.endDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
} 