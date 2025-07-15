import { motion } from 'framer-motion';

interface PerformanceDetail {
  category: '연극' | '뮤지컬';
  performanceName: string;
  todaySales: number;
  todayTargetSales: number;
  todayAchievementRate: number;
  totalSales: number;
  totalTargetSales: number;
  totalAchievementRate: number;
}

interface PlayPerformanceDetailsTableProps {
  data: PerformanceDetail[];
}

export default function PlayPerformanceDetailsTable({ data }: PlayPerformanceDetailsTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">공연별 매출 상세 데이터가 없습니다.</p>
      </div>
    );
  }

  // 카테고리별 총계 계산
  const theaterData = data.filter(item => item.category === '연극');
  const musicalData = data.filter(item => item.category === '뮤지컬');

  const theaterTotals = {
    todaySales: theaterData.reduce((sum, item) => sum + item.todaySales, 0),
    todayTargetSales: theaterData.reduce((sum, item) => sum + item.todayTargetSales, 0),
    totalSales: theaterData.reduce((sum, item) => sum + item.totalSales, 0),
    totalTargetSales: theaterData.reduce((sum, item) => sum + item.totalTargetSales, 0),
  };

  const musicalTotals = {
    todaySales: musicalData.reduce((sum, item) => sum + item.todaySales, 0),
    todayTargetSales: musicalData.reduce((sum, item) => sum + item.todayTargetSales, 0),
    totalSales: musicalData.reduce((sum, item) => sum + item.totalSales, 0),
    totalTargetSales: musicalData.reduce((sum, item) => sum + item.totalTargetSales, 0),
  };

  const grandTotals = {
    todaySales: theaterTotals.todaySales + musicalTotals.todaySales,
    todayTargetSales: theaterTotals.todayTargetSales + musicalTotals.todayTargetSales,
    totalSales: theaterTotals.totalSales + musicalTotals.totalSales,
    totalTargetSales: theaterTotals.totalTargetSales + musicalTotals.totalTargetSales,
  };

  // 달성률 계산 함수
  const calculateAchievementRate = (sales: number, target: number) => {
    return target > 0 ? (sales / target) * 100 : 0;
  };

  // 달성률에 따른 색상 반환 함수
  const getAchievementColor = (ratio: number) => {
    if (ratio >= 100) return 'text-green-600 font-semibold';
    if (ratio >= 70) return 'text-amber-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  // 카테고리별 배경색
  const getCategoryBgColor = (category: string) => {
    return category === '연극' ? 'bg-purple-50' : 'bg-pink-50';
  };

  return (
    <div className="space-y-6">
      {/* 전체 총계 */}
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200 play-table">
          <thead>
            <tr>
              <th className="px-3 py-2 bg-blue-50 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                전체 총계
              </th>
              <th className="px-6 py-3 bg-blue-50 text-right text-xs font-medium text-blue-700 uppercase tracking-wider">
                오늘 매출
              </th>
              <th className="px-6 py-3 bg-blue-50 text-right text-xs font-medium text-blue-700 uppercase tracking-wider">
                오늘 목표
              </th>
              <th className="px-6 py-3 bg-blue-50 text-right text-xs font-medium text-blue-700 uppercase tracking-wider">
                오늘 달성률
              </th>
              <th className="px-6 py-3 bg-blue-50 text-right text-xs font-medium text-blue-700 uppercase tracking-wider">
                총 매출
              </th>
              <th className="px-6 py-3 bg-blue-50 text-right text-xs font-medium text-blue-700 uppercase tracking-wider">
                총 목표
              </th>
              <th className="px-6 py-3 bg-blue-50 text-right text-xs font-medium text-blue-700 uppercase tracking-wider">
                총 달성률
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="bg-blue-50 hover:bg-blue-100 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                통합 총계
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-800 text-right">
                {grandTotals.todaySales.toLocaleString()}원
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-800 text-right">
                {grandTotals.todayTargetSales.toLocaleString()}원
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                <span className={getAchievementColor(calculateAchievementRate(grandTotals.todaySales, grandTotals.todayTargetSales))}>
                  {calculateAchievementRate(grandTotals.todaySales, grandTotals.todayTargetSales).toFixed(1)}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-800 text-right">
                {grandTotals.totalSales.toLocaleString()}원
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-800 text-right">
                {grandTotals.totalTargetSales.toLocaleString()}원
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                <span className={getAchievementColor(calculateAchievementRate(grandTotals.totalSales, grandTotals.totalTargetSales))}>
                  {calculateAchievementRate(grandTotals.totalSales, grandTotals.totalTargetSales).toFixed(1)}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 카테고리별 소계 */}
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200 play-table">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                오늘 매출
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                오늘 목표
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                오늘 달성률
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                총 매출
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                총 목표
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                총 달성률
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="bg-purple-50 hover:bg-purple-100 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-700">
                연극
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                {theaterTotals.todaySales.toLocaleString()}원
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                {theaterTotals.todayTargetSales.toLocaleString()}원
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                <span className={getAchievementColor(calculateAchievementRate(theaterTotals.todaySales, theaterTotals.todayTargetSales))}>
                  {calculateAchievementRate(theaterTotals.todaySales, theaterTotals.todayTargetSales).toFixed(1)}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                {theaterTotals.totalSales.toLocaleString()}원
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                {theaterTotals.totalTargetSales.toLocaleString()}원
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                <span className={getAchievementColor(calculateAchievementRate(theaterTotals.totalSales, theaterTotals.totalTargetSales))}>
                  {calculateAchievementRate(theaterTotals.totalSales, theaterTotals.totalTargetSales).toFixed(1)}%
                </span>
              </td>
            </tr>
            <tr className="bg-pink-50 hover:bg-pink-100 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-pink-700">
                뮤지컬
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                {musicalTotals.todaySales.toLocaleString()}원
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                {musicalTotals.todayTargetSales.toLocaleString()}원
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                <span className={getAchievementColor(calculateAchievementRate(musicalTotals.todaySales, musicalTotals.todayTargetSales))}>
                  {calculateAchievementRate(musicalTotals.todaySales, musicalTotals.todayTargetSales).toFixed(1)}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                {musicalTotals.totalSales.toLocaleString()}원
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                {musicalTotals.totalTargetSales.toLocaleString()}원
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                <span className={getAchievementColor(calculateAchievementRate(musicalTotals.totalSales, musicalTotals.totalTargetSales))}>
                  {calculateAchievementRate(musicalTotals.totalSales, musicalTotals.totalTargetSales).toFixed(1)}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 공연별 상세 */}
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200 play-table">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                공연명
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                오늘 매출
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                오늘 목표 매출
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                오늘 달성률
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                총 매출
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                목표 매출
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                총 달성률
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.category === '연극' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-pink-100 text-pink-800'
                  }`}>
                    {item.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.performanceName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                  {item.todaySales.toLocaleString()}원
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                  {item.todayTargetSales.toLocaleString()}원
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <span className={getAchievementColor(item.todayAchievementRate)}>
                    {item.todayAchievementRate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                  {item.totalSales.toLocaleString()}원
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                  {item.totalTargetSales.toLocaleString()}원
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  <span className={getAchievementColor(item.totalAchievementRate)}>
                    {item.totalAchievementRate.toFixed(1)}%
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 