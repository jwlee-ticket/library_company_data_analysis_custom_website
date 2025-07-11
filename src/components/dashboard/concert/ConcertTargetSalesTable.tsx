import { motion } from 'framer-motion';
import { ConcertTargetSales } from '@/lib/api';

interface ConcertTargetSalesTableProps {
  data: ConcertTargetSales[];
}

export default function ConcertTargetSalesTable({ data }: ConcertTargetSalesTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">목표 매출 데이터가 없습니다.</p>
      </div>
    );
  }

  // 총계 계산
  const totalTargetSales = data.reduce((sum, item) => sum + parseInt(item.targetSales.replace(/,/g, '')), 0);
  const totalSalesAcc = data.reduce((sum, item) => sum + parseInt(item.salesAcc.replace(/,/g, '')), 0);
  const totalTargetRatio = totalTargetSales > 0 ? (totalSalesAcc / totalTargetSales) * 100 : 0;

  // 달성률에 따른 색상 반환 함수
  const getAchievementColor = (ratio: number) => {
    if (ratio >= 100) return 'text-green-600'; // 목표 달성 (초록색)
    if (ratio >= 70) return 'text-amber-600';  // 목표 근접 (주황색)
    return 'text-red-600';                     // 목표 미달 (빨간색)
  };

  return (
    <div className="space-y-6">
      {/* 총계 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-blue-50 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                총계
              </th>
              <th className="px-6 py-3 bg-blue-50 text-right text-xs font-medium text-blue-700 uppercase tracking-wider">
                목표 매출
              </th>
              <th className="px-6 py-3 bg-blue-50 text-right text-xs font-medium text-blue-700 uppercase tracking-wider">
                현재 매출
              </th>
              <th className="px-6 py-3 bg-blue-50 text-right text-xs font-medium text-blue-700 uppercase tracking-wider">
                달성률
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="bg-blue-50 hover:bg-blue-100 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                전체 총계
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-800 text-right">
                {totalTargetSales.toLocaleString()}원
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-800 text-right">
                {totalSalesAcc.toLocaleString()}원
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                <span className={getAchievementColor(totalTargetRatio)}>
                  {totalTargetRatio.toFixed(1)}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 목표 매출 달성 현황 상세 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                공연명
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                목표 매출
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                현재 매출
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                달성률
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => {
              const targetSales = parseInt(item.targetSales.replace(/,/g, ''));
              const salesAcc = parseInt(item.salesAcc.replace(/,/g, ''));
              const targetRatio = parseFloat(item.targetRatio) * 100; // API에서 받은 값에 100을 곱함

              return (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.liveName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {targetSales.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {salesAcc.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`font-semibold ${getAchievementColor(targetRatio)}`}>
                      {targetRatio.toFixed(1)}%
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 