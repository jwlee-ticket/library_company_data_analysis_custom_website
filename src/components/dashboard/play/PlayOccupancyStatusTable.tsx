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
      <div className="text-center py-8">
        <p className="text-gray-500">유료 점유율 데이터가 없습니다.</p>
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
    if (ratio >= 100) return 'text-green-600 font-semibold';
    if (ratio >= 70) return 'text-amber-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  // 점유율에 따른 색상 반환 함수
  const getOccupancyColor = (ratio: number) => {
    if (ratio >= 80) return 'text-green-600';
    if (ratio >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  // 카테고리별 배경색
  const getCategoryBgColor = (category: string) => {
    return category === '연극' ? 'bg-purple-50' : 'bg-pink-50';
  };

  return (
    <div className="space-y-6">
      {/* 전체 총계 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-blue-50 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                전체 총계
              </th>
              <th className="px-6 py-3 bg-blue-50 text-right text-xs font-medium text-blue-700 uppercase tracking-wider">
                입금
              </th>
              <th className="px-6 py-3 bg-blue-50 text-right text-xs font-medium text-blue-700 uppercase tracking-wider">
                미입금
              </th>
              <th className="px-6 py-3 bg-blue-50 text-right text-xs font-medium text-blue-700 uppercase tracking-wider">
                전체
              </th>
              <th className="px-6 py-3 bg-blue-50 text-right text-xs font-medium text-blue-700 uppercase tracking-wider">
                점유율
              </th>
              <th className="px-6 py-3 bg-blue-50 text-right text-xs font-medium text-blue-700 uppercase tracking-wider">
                목표
              </th>
              <th className="px-6 py-3 bg-blue-50 text-right text-xs font-medium text-blue-700 uppercase tracking-wider">
                목표 대비 달성률
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="bg-blue-50 hover:bg-blue-100 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-900">
                통합 총계
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-800 text-right">
                {grandTotals.paid.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-800 text-right">
                {grandTotals.unpaid.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-800 text-right">
                {(grandTotals.paid + grandTotals.unpaid).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                <span className={getOccupancyColor(calculateOccupancyRate(grandTotals.paid, grandTotals.unpaid))}>
                  {calculateOccupancyRate(grandTotals.paid, grandTotals.unpaid).toFixed(1)}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-800 text-right">
                {grandTotals.target.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                <span className={getAchievementColor(calculateAchievementRate(grandTotals.paid, grandTotals.target))}>
                  {calculateAchievementRate(grandTotals.paid, grandTotals.target).toFixed(1)}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 카테고리별 소계 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                입금
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                미입금
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                전체
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                점유율
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                목표
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                목표 대비 달성률
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="bg-purple-50 hover:bg-purple-100 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-700">
                연극
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                {theaterTotals.paid.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                {theaterTotals.unpaid.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                {(theaterTotals.paid + theaterTotals.unpaid).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                <span className={getOccupancyColor(calculateOccupancyRate(theaterTotals.paid, theaterTotals.unpaid))}>
                  {calculateOccupancyRate(theaterTotals.paid, theaterTotals.unpaid).toFixed(1)}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                {theaterTotals.target.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                <span className={getAchievementColor(calculateAchievementRate(theaterTotals.paid, theaterTotals.target))}>
                  {calculateAchievementRate(theaterTotals.paid, theaterTotals.target).toFixed(1)}%
                </span>
              </td>
            </tr>
            <tr className="bg-pink-50 hover:bg-pink-100 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-pink-700">
                뮤지컬
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                {musicalTotals.paid.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                {musicalTotals.unpaid.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                {(musicalTotals.paid + musicalTotals.unpaid).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                <span className={getOccupancyColor(calculateOccupancyRate(musicalTotals.paid, musicalTotals.unpaid))}>
                  {calculateOccupancyRate(musicalTotals.paid, musicalTotals.unpaid).toFixed(1)}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                {musicalTotals.target.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                <span className={getAchievementColor(calculateAchievementRate(musicalTotals.paid, musicalTotals.target))}>
                  {calculateAchievementRate(musicalTotals.paid, musicalTotals.target).toFixed(1)}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 공연별 상세 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                공연명
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                입금
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                미입금
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                전체
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                점유율
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                목표
              </th>
              <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                목표 대비 달성률
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => {
              const total = item.paid + item.unpaid;
              const occupancyRate = calculateOccupancyRate(item.paid, item.unpaid);
              
              return (
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
                    {item.paid.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                    {item.unpaid.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                    {total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={getOccupancyColor(occupancyRate)}>
                      {occupancyRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                    {item.target.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={getAchievementColor(item.achievementRate)}>
                      {item.achievementRate.toFixed(1)}%
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