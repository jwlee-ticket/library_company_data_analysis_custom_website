'use client';

import { motion } from 'framer-motion';
import { PlayMonthlySummary } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { IoTrendingUp, IoTrendingDown, IoRemoveOutline, IoInformationCircleOutline } from 'react-icons/io5';

interface PlayPeriodRevenueTableProps {
  data: PlayMonthlySummary[];
}

export default function PlayPeriodRevenueTable({ data }: PlayPeriodRevenueTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-lg font-medium mb-2">월별 매출 데이터가 없습니다</p>
          <p className="text-sm">데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

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

  // 데이터를 날짜순으로 정렬 (과거 → 현재)
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date((a.month_str || '') + '-01');
    const dateB = new Date((b.month_str || '') + '-01');
    return dateA.getTime() - dateB.getTime();
  });

  // 변화율에 따른 아이콘과 색상 반환
  const getChangeIndicator = (change: number | string | undefined) => {
    // 숫자로 변환 및 유효성 검사
    const numericChange = typeof change === 'string' ? parseFloat(change) : change;
    
    if (numericChange === null || numericChange === undefined || isNaN(numericChange)) {
      return {
        icon: <IoRemoveOutline className="w-4 h-4" />,
        color: 'text-gray-500',
        text: '-'
      };
    }

    if (numericChange > 0) {
      return {
        icon: <IoTrendingUp className="w-4 h-4" />,
        color: 'text-green-600',
        text: `+${numericChange.toFixed(1)}%`
      };
    } else if (numericChange < 0) {
      return {
        icon: <IoTrendingDown className="w-4 h-4" />,
        color: 'text-red-600',
        text: `${numericChange.toFixed(1)}%`
      };
    } else {
      // 0인 경우
      return {
        icon: <IoRemoveOutline className="w-4 h-4" />,
        color: 'text-gray-500',
        text: '0.0%'
      };
    }
  };

  // 통계 계산 - 안전한 데이터 처리
  console.log('📋 PlayPeriodRevenueTable - 원본 데이터:', sortedData);
  console.log('📋 매출 데이터 추출:', sortedData.map(item => ({
    month: item.month_str,
    revenue: item.total_revenue,
    type: typeof item.total_revenue
  })));

  // 안전한 매출 데이터 변환
  const validRevenueData: number[] = sortedData
    .map(item => {
      const revenue = item.total_revenue;
      if (typeof revenue === 'number' && isFinite(revenue) && revenue >= 0) {
        return Math.min(revenue, 1000000000000); // 1조원 이하로 제한
      }
      if (typeof revenue === 'string') {
        const parsed = parseFloat(revenue);
        if (isFinite(parsed) && parsed >= 0) {
          return Math.min(parsed, 1000000000000);
        }
      }
      return 0;
    })
    .filter(revenue => revenue > 0); // 0보다 큰 값만 유효

  console.log('📋 유효한 매출 데이터:', validRevenueData);

  const totalRevenue = validRevenueData.reduce((sum, revenue) => sum + revenue, 0);
  const averageRevenue = validRevenueData.length > 0 ? totalRevenue / validRevenueData.length : 0;
  const positiveMonths = sortedData.filter(item => {
    if (item.percentage_change === undefined || item.percentage_change === null) return false;
    const change = typeof item.percentage_change === 'string' ? parseFloat(item.percentage_change) : item.percentage_change;
    return !isNaN(change) && change > 0;
  }).length;
  const negativeMonths = sortedData.filter(item => {
    if (item.percentage_change === undefined || item.percentage_change === null) return false;
    const change = typeof item.percentage_change === 'string' ? parseFloat(item.percentage_change) : item.percentage_change;
    return !isNaN(change) && change < 0;
  }).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100"
    >
      {/* 헤더 및 요약 통계 */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">월별 매출 상세 현황</h3>
          <div className="flex items-center space-x-1 text-gray-500">
            <IoInformationCircleOutline className="w-4 h-4" />
            <span className="text-sm">전월 대비 증감률 포함</span>
          </div>
        </div>

        {/* 요약 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">총 매출</p>
            <p className="text-lg font-bold text-blue-800">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 font-medium">월 평균</p>
            <p className="text-lg font-bold text-green-800">{formatCurrency(averageRevenue)}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg">
            <p className="text-sm text-emerald-600 font-medium">증가 월수</p>
            <p className="text-lg font-bold text-emerald-800">{positiveMonths}개월</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600 font-medium">감소 월수</p>
            <p className="text-lg font-bold text-red-800">{negativeMonths}개월</p>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                기간
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                매출
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                절대 변화량
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                전월 대비
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                특이사항
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item, index) => {
              const changeIndicator = getChangeIndicator(item.percentage_change);
              const [year, month] = (item.month_str || '').split('-');
              
              return (
                <motion.tr
                  key={item.month_str}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {year}년 {month}월
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-semibold">
                    {formatCurrency(toSafeNumber(item.total_revenue))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {item.absolute_change ? formatCurrency(toSafeNumber(item.absolute_change)) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className={`flex items-center justify-center space-x-1 ${changeIndicator.color}`}>
                      {changeIndicator.icon}
                      <span className="font-medium">{changeIndicator.text}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs">
                      {item.note ? (
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-xs">
                          {item.note}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 푸터 */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>총 {sortedData.length}개월 데이터</span>
          <span>
            평균 증감률: {' '}
            {(() => {
              const validChanges = sortedData
                .map(item => item.percentage_change)
                .filter(change => change !== undefined && change !== null)
                .map(change => typeof change === 'string' ? parseFloat(change) : change)
                .filter(change => !isNaN(change)) as number[];
              const avgChange = validChanges.length > 0 
                ? validChanges.reduce((sum, change) => sum + change, 0) / validChanges.length
                : 0;
              
              return avgChange > 0 ? `+${avgChange.toFixed(1)}%` : `${avgChange.toFixed(1)}%`;
            })()}
          </span>
        </div>
      </div>
    </motion.div>
  );
} 