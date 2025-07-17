import { motion } from 'framer-motion';

interface OccupancyStatus {
  performanceName: string;
  paid: number;
  unpaid: number;
  target: number;
  achievementRate: number;
  category: '연극' | '뮤지컬';
}

interface PlayOccupancyStatusTableProps {
  data: OccupancyStatus[];
}

export default function PlayOccupancyStatusTable({ data }: PlayOccupancyStatusTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 font-medium">점유율 데이터가 없습니다.</p>
        <p className="text-gray-400 text-sm mt-2">현재 공연 중인 작품이 없거나 데이터 로딩 중입니다.</p>
      </div>
    );
  }

  // 카테고리별 총계 계산
  const theaterData = data.filter(item => item.category === '연극');
  const musicalData = data.filter(item => item.category === '뮤지컬');

  const theaterTotals = {
    paid: theaterData.reduce((sum, item) => sum + item.paid, 0),
    unpaid: theaterData.reduce((sum, item) => sum + item.unpaid, 0),
    target: theaterData.reduce((sum, item) => sum + item.target, 0),
  };

  const musicalTotals = {
    paid: musicalData.reduce((sum, item) => sum + item.paid, 0),
    unpaid: musicalData.reduce((sum, item) => sum + item.unpaid, 0),
    target: musicalData.reduce((sum, item) => sum + item.target, 0),
  };

  const grandTotals = {
    paid: theaterTotals.paid + musicalTotals.paid,
    unpaid: theaterTotals.unpaid + musicalTotals.unpaid,
    target: theaterTotals.target + musicalTotals.target,
  };

  // 달성률 계산 함수
  const calculateAchievementRate = (paid: number, target: number) => {
    return target > 0 ? (paid / target) * 100 : 0;
  };

  // 점유율 계산 함수
  const calculateOccupancyRate = (paid: number, unpaid: number) => {
    const total = paid + unpaid;
    return total > 0 ? (paid / total) * 100 : 0;
  };

  // 달성률에 따른 색상 반환 함수
  const getAchievementColor = (ratio: number) => {
    if (ratio >= 100) return 'text-emerald-600 bg-emerald-50 font-bold border border-emerald-200';
    if (ratio >= 80) return 'text-amber-600 bg-amber-50 font-bold border border-amber-200';
    return 'text-rose-600 bg-rose-50 font-bold border border-rose-200';
  };

  // 점유율에 따른 색상 반환 함수
  const getOccupancyColor = (ratio: number) => {
    if (ratio >= 80) return 'text-emerald-600 bg-emerald-50 font-bold border border-emerald-200';
    if (ratio >= 60) return 'text-amber-600 bg-amber-50 font-bold border border-amber-200';
    return 'text-rose-600 bg-rose-50 font-bold border border-rose-200';
  };

  return (
    <div className="space-y-8">
      {/* 전체 총계 카드 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 overflow-hidden"
      >
        <div className="px-6 py-4 bg-green-100/50 border-b border-green-200">
          <div className="flex items-center">
            <div className="w-1 h-6 bg-green-500 rounded-full mr-3"></div>
            <h3 className="text-lg font-bold text-green-800">전체 좌석 점유 현황</h3>
            <span className="ml-3 px-3 py-1 bg-green-200 text-green-800 text-sm font-medium rounded-full">
              실시간 집계
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-green-50/50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-green-700">
                  구분
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-green-700">
                  유료석
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-green-700">
                  무료석
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-green-700">
                  전체석
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-green-700">
                  유료 비율
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-green-700">
                  목표석
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-green-700">
                  목표 달성률
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-green-50/30 transition-colors duration-200">
                <td className="px-6 py-4 text-sm font-bold text-green-900">
                  통합 총계
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                  {grandTotals.paid.toLocaleString()}석
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-700 text-right">
                  {grandTotals.unpaid.toLocaleString()}석
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                  {(grandTotals.paid + grandTotals.unpaid).toLocaleString()}석
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getOccupancyColor(calculateOccupancyRate(grandTotals.paid, grandTotals.unpaid))}`}>
                    {calculateOccupancyRate(grandTotals.paid, grandTotals.unpaid).toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-700 text-right">
                  {grandTotals.target.toLocaleString()}석
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getAchievementColor(calculateAchievementRate(grandTotals.paid, grandTotals.target))}`}>
                    {calculateAchievementRate(grandTotals.paid, grandTotals.target).toFixed(1)}%
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
            <h3 className="text-lg font-bold text-gray-800">카테고리별 점유 현황</h3>
            <span className="ml-3 px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded-full">
              연극 vs 뮤지컬
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  카테고리
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  유료석
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  무료석
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  전체석
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  유료 비율
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  목표석
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  목표 달성률
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
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    연극
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                  {theaterTotals.paid.toLocaleString()}석
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-700 text-right">
                  {theaterTotals.unpaid.toLocaleString()}석
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                  {(theaterTotals.paid + theaterTotals.unpaid).toLocaleString()}석
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getOccupancyColor(calculateOccupancyRate(theaterTotals.paid, theaterTotals.unpaid))}`}>
                    {calculateOccupancyRate(theaterTotals.paid, theaterTotals.unpaid).toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-700 text-right">
                  {theaterTotals.target.toLocaleString()}석
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getAchievementColor(calculateAchievementRate(theaterTotals.paid, theaterTotals.target))}`}>
                    {calculateAchievementRate(theaterTotals.paid, theaterTotals.target).toFixed(1)}%
                  </span>
                </td>
              </motion.tr>
              <motion.tr
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="hover:bg-pink-50/30 transition-colors duration-200"
              >
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-pink-100 text-pink-800 border border-pink-200">
                    뮤지컬
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                  {musicalTotals.paid.toLocaleString()}석
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-700 text-right">
                  {musicalTotals.unpaid.toLocaleString()}석
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                  {(musicalTotals.paid + musicalTotals.unpaid).toLocaleString()}석
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getOccupancyColor(calculateOccupancyRate(musicalTotals.paid, musicalTotals.unpaid))}`}>
                    {calculateOccupancyRate(musicalTotals.paid, musicalTotals.unpaid).toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-700 text-right">
                  {musicalTotals.target.toLocaleString()}석
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getAchievementColor(calculateAchievementRate(musicalTotals.paid, musicalTotals.target))}`}>
                    {calculateAchievementRate(musicalTotals.paid, musicalTotals.target).toFixed(1)}%
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
            <h3 className="text-lg font-bold text-gray-800">공연별 점유 상세</h3>
            <span className="ml-3 px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
              {data.length}개 공연
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  카테고리
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  공연명
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  유료석
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  무료석
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  전체석
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  유료 비율
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  목표석
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  목표 달성률
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((item, index) => {
                const total = item.paid + item.unpaid;
                const occupancyRate = calculateOccupancyRate(item.paid, item.unpaid);
                
                return (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + (index * 0.05) }}
                    className="hover:bg-gray-50/50 transition-all duration-200 group"
                  >
                    <td className="px-6 py-4">
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
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                      {item.paid.toLocaleString()}석
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700 text-right">
                      {item.unpaid.toLocaleString()}석
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                      {total.toLocaleString()}석
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getOccupancyColor(occupancyRate)}`}>
                        {occupancyRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700 text-right">
                      {item.target.toLocaleString()}석
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getAchievementColor(item.achievementRate)}`}>
                        {item.achievementRate.toFixed(1)}%
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
} 