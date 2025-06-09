'use client';

interface TopBottomCastTableProps {
  performanceId: number;
  type: 'top' | 'bottom';
}

// 임시 데이터
const DUMMY_DATA = {
  top: [
    {
      castCombination: '김철수, 이영희, 박민수',
      totalRevenue: 15000000,
      performanceCount: 10,
    },
    {
      castCombination: '최영수, 이영희, 정민지',
      totalRevenue: 14500000,
      performanceCount: 8,
    },
    {
      castCombination: '김철수, 정민지, 박민수',
      totalRevenue: 14000000,
      performanceCount: 9,
    },
    {
      castCombination: '최영수, 김철수, 이영희',
      totalRevenue: 13500000,
      performanceCount: 7,
    },
    {
      castCombination: '박민수, 정민지, 최영수',
      totalRevenue: 13000000,
      performanceCount: 8,
    },
  ],
  bottom: [
    {
      castCombination: '신동엽, 유재석, 강호동',
      totalRevenue: 5000000,
      performanceCount: 3,
    },
    {
      castCombination: '이수근, 강호동, 신동엽',
      totalRevenue: 5500000,
      performanceCount: 4,
    },
    {
      castCombination: '유재석, 이수근, 강호동',
      totalRevenue: 6000000,
      performanceCount: 5,
    },
    {
      castCombination: '신동엽, 이수근, 유재석',
      totalRevenue: 6500000,
      performanceCount: 4,
    },
    {
      castCombination: '강호동, 유재석, 이수근',
      totalRevenue: 7000000,
      performanceCount: 6,
    },
  ],
};

export default function TopBottomCastTable({ performanceId, type }: TopBottomCastTableProps) {
  // 실제 구현시 performanceId를 사용하여 데이터를 가져옵니다
  const data = type === 'top' ? DUMMY_DATA.top : DUMMY_DATA.bottom;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              순위
            </th>
            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              캐스트 조합
            </th>
            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              총 매출
            </th>
            <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              공연 수
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr 
              key={row.castCombination} 
              className={`
                hover:bg-gray-50 transition-colors duration-150
                ${type === 'top' ? 'hover:bg-green-50/30' : 'hover:bg-red-50/30'}
              `}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className={`
                  inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-semibold
                  ${type === 'top' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                  }
                `}>
                  {type === 'top' ? index + 1 : data.length - index}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{row.castCombination}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className={`
                  text-sm font-semibold
                  ${type === 'top' ? 'text-green-600' : 'text-red-600'}
                `}>
                  {row.totalRevenue.toLocaleString()}원
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">
                  {row.performanceCount}회
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 