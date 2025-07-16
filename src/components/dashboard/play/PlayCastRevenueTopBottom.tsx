'use client';

import { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { PlayCastRevenue } from '@/lib/api';

interface PlayCastRevenueTopBottomProps {
  data: PlayCastRevenue[];
  selectedPerformance: string;
}

interface ProcessedCastData {
  cast: string;
  totalRevenue: number;
  totalShows: number;
  avgRevenuePerShow: number;
}

function PlayCastRevenueTopBottom({ 
  data, 
  selectedPerformance 
}: PlayCastRevenueTopBottomProps) {

  // 안전한 숫자 변환 함수
  const toNumber = (value: any): number => {
    if (typeof value === 'string') {
      return parseFloat(value) || 0;
    }
    return typeof value === 'number' ? value : 0;
  };

  // 통화 포맷팅 함수
  const formatCurrency = (value: number): string => {
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(1)}억원`;
    } else if (value >= 10000) {
      return `${(value / 10000).toFixed(0)}만원`;
    } else {
      return `${value.toLocaleString()}원`;
    }
  };

  // 숫자 포맷팅 함수
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('ko-KR').format(value);
  };

  // 데이터 처리 및 집계
  const processedData = useMemo(() => {
    // 필터링된 데이터
    const filteredData = selectedPerformance === 'all' 
      ? data 
      : data.filter(item => item.liveName === selectedPerformance);

    // 캐스트별 그룹핑 및 집계
    const castGroups = new Map<string, {
      totalRevenue: number;
      totalShows: number;
    }>();

    filteredData.forEach(item => {
      const cast = item.cast || '알 수 없음';
      const revenue = toNumber(item.totalpaidseatsales);
      const shows = toNumber(item.showcount);

      if (castGroups.has(cast)) {
        const existing = castGroups.get(cast)!;
        existing.totalRevenue += revenue;
        existing.totalShows += shows;
      } else {
        castGroups.set(cast, {
          totalRevenue: revenue,
          totalShows: shows
        });
      }
    });

    // ProcessedCastData 배열로 변환
    const processedItems: ProcessedCastData[] = Array.from(castGroups.entries()).map(([cast, data]) => ({
      cast,
      totalRevenue: data.totalRevenue,
      totalShows: data.totalShows,
      avgRevenuePerShow: data.totalShows > 0 ? data.totalRevenue / data.totalShows : 0
    }));

    // 총 매출 기준으로 정렬
    processedItems.sort((a, b) => b.totalRevenue - a.totalRevenue);

    const top7 = processedItems.slice(0, 7);
    const bottom7 = processedItems.slice(-7).reverse(); // 하위 7개는 순서 뒤집기

    return { top7, bottom7, total: processedItems.length };
  }, [data, selectedPerformance]);

  // 캐스트 이름 줄이기 함수
  const truncateCast = (cast: string, maxLength: number = 20): string => {
    if (cast.length <= maxLength) return cast;
    return cast.substring(0, maxLength) + '...';
  };

  // 테이블 컴포넌트
  const CastTable = ({ 
    data, 
    title, 
    theme, 
    isTop 
  }: { 
    data: ProcessedCastData[]; 
    title: string; 
    theme: { bg: string; text: string; border: string }; 
    isTop: boolean;
  }) => (
    <div className={`bg-white rounded-xl shadow-lg border ${theme.border} overflow-hidden`}>
      {/* 헤더 */}
      <div className={`${theme.bg} px-6 py-4`}>
        <h3 className={`text-lg font-bold ${theme.text} flex items-center gap-2`}>
          {title}
          <span className="text-sm font-normal opacity-80">({data.length}개)</span>
        </h3>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-center py-3 px-2 font-medium text-gray-700 w-12">순위</th>
              <th className="text-left py-3 px-3 font-medium text-gray-700">캐스트 조합</th>
              <th className="text-right py-3 px-3 font-medium text-gray-700">총 매출</th>
              <th className="text-center py-3 px-2 font-medium text-gray-700 w-16">공연수</th>
              <th className="text-right py-3 px-3 font-medium text-gray-700">평균</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <motion.tr
                key={`${item.cast}-${index}`}
                initial={{ opacity: 0, x: isTop ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {/* 순위 */}
                <td className="py-3 px-2 text-center">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    isTop 
                      ? index === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {index + 1}
                  </span>
                </td>

                {/* 캐스트 조합 */}
                <td className="py-3 px-3">
                  <div className="font-medium text-gray-800" title={item.cast}>
                    {truncateCast(item.cast)}
                  </div>
                  {item.cast.includes(',') && (
                    <div className="text-xs text-gray-500 mt-1">
                      {item.cast.split(',').length}명 조합
                    </div>
                  )}
                </td>

                {/* 총 매출 */}
                <td className="py-3 px-3 text-right">
                  <div className="font-bold text-gray-800">
                    {formatCurrency(item.totalRevenue)}
                  </div>
                </td>

                {/* 공연수 */}
                <td className="py-3 px-2 text-center">
                  <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                    {item.totalShows}회
                  </span>
                </td>

                {/* 평균 매출 */}
                <td className="py-3 px-3 text-right">
                  <div className="text-sm text-gray-600">
                    {formatCurrency(item.avgRevenuePerShow)}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 빈 데이터 처리 */}
      {data.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>데이터가 없습니다</p>
        </div>
      )}
    </div>
  );

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">캐스트별 매출 데이터가 없습니다</p>
          <p className="text-sm">선택한 조건의 데이터를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* 요약 정보 */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {selectedPerformance !== 'all' ? `${selectedPerformance} - ` : '전체 공연 - '}
          총 {processedData.total}개의 캐스트 조합
        </p>
      </div>

      {/* 상위 7 & 하위 7 좌우 배치 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 상위 7 (좌측) */}
        <CastTable
          data={processedData.top7}
          title="매출 상위 7"
          theme={{
            bg: 'bg-green-50',
            text: 'text-green-800',
            border: 'border-green-200'
          }}
          isTop={true}
        />

        {/* 하위 7 (우측) */}
        <CastTable
          data={processedData.bottom7}
          title="매출 하위 7"
          theme={{
            bg: 'bg-orange-50',
            text: 'text-orange-800',
            border: 'border-orange-200'
          }}
          isTop={false}
        />
      </div>
    </motion.div>
  );
}

export default memo(PlayCastRevenueTopBottom);