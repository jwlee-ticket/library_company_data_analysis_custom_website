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
      <div className="text-center py-12">
        <p className="text-gray-500 font-medium">공연별 매출 상세 데이터가 없습니다.</p>
        <p className="text-gray-400 text-sm mt-2">데이터가 로드되면 여기에 표시됩니다.</p>
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
    if (ratio >= 100) return 'text-emerald-600 bg-emerald-50 font-bold border border-emerald-200';
    if (ratio >= 80) return 'text-amber-600 bg-amber-50 font-bold border border-amber-200';
    return 'text-rose-600 bg-rose-50 font-bold border border-rose-200';
  };

  return (
    <div className="space-y-8">
      {/* 전체 총계 카드 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 overflow-hidden"
      >
        <div className="px-6 py-4 bg-blue-100/50 border-b border-blue-200">
          <div className="flex items-center">
            <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
            <h3 className="text-lg font-bold text-blue-800">전체 총계</h3>
            <span className="ml-3 px-3 py-1 bg-blue-200 text-blue-800 text-sm font-medium rounded-full">
              실시간 집계
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50/50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-blue-700 whitespace-nowrap">
                  구분
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-blue-700 whitespace-nowrap">
                  오늘 매출
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-blue-700 whitespace-nowrap">
                  오늘 목표
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-blue-700 whitespace-nowrap">
                  오늘 달성률
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-blue-700 whitespace-nowrap">
                  총 매출
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-blue-700 whitespace-nowrap">
                  총 목표
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-blue-700 whitespace-nowrap">
                  총 달성률
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-blue-50/30 transition-colors duration-200">
                <td className="px-6 py-4 text-sm font-bold text-blue-900 whitespace-nowrap">
                  통합 총계
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right whitespace-nowrap">
                  {grandTotals.todaySales.toLocaleString()}원
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-700 text-right whitespace-nowrap">
                  {grandTotals.todayTargetSales.toLocaleString()}원
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getAchievementColor(calculateAchievementRate(grandTotals.todaySales, grandTotals.todayTargetSales))}`}>
                    {calculateAchievementRate(grandTotals.todaySales, grandTotals.todayTargetSales).toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right whitespace-nowrap">
                  {grandTotals.totalSales.toLocaleString()}원
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-700 text-right whitespace-nowrap">
                  {grandTotals.totalTargetSales.toLocaleString()}원
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getAchievementColor(calculateAchievementRate(grandTotals.totalSales, grandTotals.totalTargetSales))}`}>
                    {calculateAchievementRate(grandTotals.totalSales, grandTotals.totalTargetSales).toFixed(1)}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 카테고리별 소계 카드 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
      >
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-1 h-6 bg-gray-500 rounded-full mr-3"></div>
            <h3 className="text-lg font-bold text-gray-800">카테고리별 소계</h3>
            <span className="ml-3 px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded-full">
              연극 vs 뮤지컬
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                  카테고리
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">
                  오늘 매출
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">
                  오늘 목표
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">
                  오늘 달성률
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">
                  총 매출
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">
                  총 목표
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">
                  총 달성률
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <motion.tr
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="hover:bg-purple-50/30 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    연극
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right whitespace-nowrap">
                  {theaterTotals.todaySales.toLocaleString()}원
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-700 text-right whitespace-nowrap">
                  {theaterTotals.todayTargetSales.toLocaleString()}원
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getAchievementColor(calculateAchievementRate(theaterTotals.todaySales, theaterTotals.todayTargetSales))}`}>
                    {calculateAchievementRate(theaterTotals.todaySales, theaterTotals.todayTargetSales).toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right whitespace-nowrap">
                  {theaterTotals.totalSales.toLocaleString()}원
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-700 text-right whitespace-nowrap">
                  {theaterTotals.totalTargetSales.toLocaleString()}원
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getAchievementColor(calculateAchievementRate(theaterTotals.totalSales, theaterTotals.totalTargetSales))}`}>
                    {calculateAchievementRate(theaterTotals.totalSales, theaterTotals.totalTargetSales).toFixed(1)}%
                  </span>
                </td>
              </motion.tr>
              <motion.tr
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="hover:bg-pink-50/30 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-pink-100 text-pink-800 border border-pink-200">
                    뮤지컬
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right whitespace-nowrap">
                  {musicalTotals.todaySales.toLocaleString()}원
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-700 text-right whitespace-nowrap">
                  {musicalTotals.todayTargetSales.toLocaleString()}원
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getAchievementColor(calculateAchievementRate(musicalTotals.todaySales, musicalTotals.todayTargetSales))}`}>
                    {calculateAchievementRate(musicalTotals.todaySales, musicalTotals.todayTargetSales).toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right whitespace-nowrap">
                  {musicalTotals.totalSales.toLocaleString()}원
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-700 text-right whitespace-nowrap">
                  {musicalTotals.totalTargetSales.toLocaleString()}원
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getAchievementColor(calculateAchievementRate(musicalTotals.totalSales, musicalTotals.totalTargetSales))}`}>
                    {calculateAchievementRate(musicalTotals.totalSales, musicalTotals.totalTargetSales).toFixed(1)}%
                  </span>
                </td>
              </motion.tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* 공연별 상세 카드 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
      >
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-1 h-6 bg-indigo-500 rounded-full mr-3"></div>
            <h3 className="text-lg font-bold text-gray-800">공연별 상세</h3>
            <span className="ml-3 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
              {data.length}개 공연
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                  카테고리
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  공연명
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">
                  오늘 매출
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">
                  오늘 목표
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">
                  오늘 달성률
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">
                  총 매출
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">
                  총 목표
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap">
                  총 달성률
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((item, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + (index * 0.05) }}
                  className="hover:bg-gray-50/50 transition-all duration-200 group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      item.category === '연극' 
                        ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                        : 'bg-pink-100 text-pink-800 border border-pink-200'
                    }`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                    {item.performanceName}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right whitespace-nowrap">
                    {item.todaySales.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700 text-right whitespace-nowrap">
                    {item.todayTargetSales.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getAchievementColor(item.todayAchievementRate)}`}>
                      {item.todayAchievementRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right whitespace-nowrap">
                    {item.totalSales.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700 text-right whitespace-nowrap">
                    {item.totalTargetSales.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getAchievementColor(item.totalAchievementRate)}`}>
                      {item.totalAchievementRate.toFixed(1)}%
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
} 