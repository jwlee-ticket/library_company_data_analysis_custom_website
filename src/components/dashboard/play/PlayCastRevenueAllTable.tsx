'use client';

import { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { PlayCastRevenue } from '@/lib/api';

interface PlayCastRevenueAllTableProps {
  data: PlayCastRevenue[];
  selectedPerformance: string;
}

interface ProcessedCastData {
  cast: string;
  totalRevenue: number;
  totalShows: number;
  avgRevenuePerShow: number;
  rank: number;
}

type SortField = 'rank' | 'cast' | 'totalRevenue' | 'totalShows' | 'avgRevenuePerShow';
type SortDirection = 'asc' | 'desc';

function PlayCastRevenueAllTable({ 
  data, 
  selectedPerformance 
}: PlayCastRevenueAllTableProps) {
  const [sortField, setSortField] = useState<SortField>('totalRevenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // 캐스트 이름 줄이기 함수
  const truncateCast = (cast: string, maxLength: number = 30): string => {
    if (cast.length <= maxLength) return cast;
    return cast.substring(0, maxLength) + '...';
  };

  // 데이터 처리 및 정렬
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
      avgRevenuePerShow: data.totalShows > 0 ? data.totalRevenue / data.totalShows : 0,
      rank: 0 // 임시값, 아래에서 설정
    }));

    // 총 매출 기준으로 먼저 정렬하여 순위 부여
    processedItems.sort((a, b) => b.totalRevenue - a.totalRevenue);
    processedItems.forEach((item, index) => {
      item.rank = index + 1;
    });

    // 선택된 필드로 정렬
    processedItems.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'rank':
          aValue = a.rank;
          bValue = b.rank;
          break;
        case 'cast':
          aValue = a.cast;
          bValue = b.cast;
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        case 'totalRevenue':
          aValue = a.totalRevenue;
          bValue = b.totalRevenue;
          break;
        case 'totalShows':
          aValue = a.totalShows;
          bValue = b.totalShows;
          break;
        case 'avgRevenuePerShow':
          aValue = a.avgRevenuePerShow;
          bValue = b.avgRevenuePerShow;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return processedItems;
  }, [data, selectedPerformance, sortField, sortDirection]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = processedData.slice(startIndex, endIndex);

  // 정렬 클릭 핸들러
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1); // 정렬 변경 시 첫 페이지로
  };

  // 정렬 아이콘
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↗️' : '↘️';
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 순위별 색상 함수
  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 font-bold';
    if (rank <= 3) return 'bg-green-100 text-green-800 font-medium';
    if (rank <= 10) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-700';
  };

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
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      {/* 헤더 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          전체 캐스트 조합 현황
          {selectedPerformance !== 'all' && (
            <span className="text-sm font-normal text-blue-600">- {selectedPerformance}</span>
          )}
        </h3>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <p>총 {processedData.length}개의 캐스트 조합</p>
          <p>
            {startIndex + 1}-{Math.min(endIndex, processedData.length)} / {processedData.length}
          </p>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th 
                className="text-center py-3 px-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors w-16"
                onClick={() => handleSort('rank')}
              >
                순위 {getSortIcon('rank')}
              </th>
              <th 
                className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('cast')}
              >
                캐스트 조합 {getSortIcon('cast')}
              </th>
              <th 
                className="text-right py-3 px-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('totalRevenue')}
              >
                총 매출 {getSortIcon('totalRevenue')}
              </th>
              <th 
                className="text-center py-3 px-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors w-20"
                onClick={() => handleSort('totalShows')}
              >
                공연수 {getSortIcon('totalShows')}
              </th>
              <th 
                className="text-right py-3 px-3 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('avgRevenuePerShow')}
              >
                1회 평균 {getSortIcon('avgRevenuePerShow')}
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, index) => (
              <motion.tr
                key={`${item.cast}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {/* 순위 */}
                <td className="py-3 px-3 text-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs ${getRankStyle(item.rank)}`}>
                    {item.rank}
                  </span>
                </td>

                {/* 캐스트 조합 */}
                <td className="py-3 px-4">
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
                <td className="py-3 px-3 text-center">
                  <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                    {item.totalShows}회
                  </span>
                </td>

                {/* 1회 평균 매출 */}
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

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            이전
          </button>
          
          {(() => {
            const maxVisiblePages = 10;
            let startPage = 1;
            let endPage = totalPages;

            if (totalPages > maxVisiblePages) {
              const halfVisible = Math.floor(maxVisiblePages / 2);
              startPage = Math.max(1, currentPage - halfVisible);
              endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
              
              // 끝에서 조정
              if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
              }
            }

            const pages = [];
            
            // 첫 페이지 표시 (시작이 1이 아닐 때)
            if (startPage > 1) {
              pages.push(
                <button
                  key={1}
                  onClick={() => handlePageChange(1)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  1
                </button>
              );
              
              if (startPage > 2) {
                pages.push(
                  <span key="start-ellipsis" className="px-2 text-gray-500">
                    ...
                  </span>
                );
              }
            }

            // 중간 페이지들
            for (let page = startPage; page <= endPage; page++) {
              pages.push(
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            }

            // 마지막 페이지 표시 (끝이 totalPages가 아닐 때)
            if (endPage < totalPages) {
              if (endPage < totalPages - 1) {
                pages.push(
                  <span key="end-ellipsis" className="px-2 text-gray-500">
                    ...
                  </span>
                );
              }
              
              pages.push(
                <button
                  key={totalPages}
                  onClick={() => handlePageChange(totalPages)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {totalPages}
                </button>
              );
            }

            return pages;
          })()}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            다음
          </button>
        </div>
      )}

      {/* 요약 통계 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-600 font-medium">1위 조합 매출</p>
          <p className="text-lg font-bold text-yellow-800">
            {processedData.length > 0 ? formatCurrency(processedData[0].totalRevenue) : '-'}
          </p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">평균 매출</p>
          <p className="text-lg font-bold text-blue-800">
            {processedData.length > 0 
              ? formatCurrency(processedData.reduce((sum, item) => sum + item.totalRevenue, 0) / processedData.length)
              : '-'}
          </p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 font-medium">총 공연 횟수</p>
          <p className="text-lg font-bold text-green-800">
            {processedData.reduce((sum, item) => sum + item.totalShows, 0)}회
          </p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">캐스트 조합 수</p>
          <p className="text-lg font-bold text-purple-800">
            {processedData.length}개
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(PlayCastRevenueAllTable);