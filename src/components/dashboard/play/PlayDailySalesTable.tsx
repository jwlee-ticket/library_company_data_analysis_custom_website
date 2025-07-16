'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PlayDailyDetail } from '@/lib/api';

interface PlayDailySalesTableProps {
  data: PlayDailyDetail[];
  selectedPerformance: string;
}

type SortField = 'date' | 'occupancy' | 'occupancyGrowth' | 'tickets' | 'ticketsGrowth' | 'revenue' | 'revenueGrowth';
type SortDirection = 'asc' | 'desc';

export default function PlayDailySalesTable({ 
  data, 
  selectedPerformance 
}: PlayDailySalesTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // 안전한 숫자 변환 함수
  const toNumber = (value: any): number => {
    if (typeof value === 'string') {
      return parseFloat(value) || 0;
    }
    return typeof value === 'number' ? value : 0;
  };

  // 증감율 계산 함수
  const calculateGrowthRate = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 숫자 포맷팅 함수
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('ko-KR').format(value);
  };

  // 통화 포맷팅 함수
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(value);
  };

  // 증감율 스타일 함수
  const getGrowthStyle = (growth: number) => {
    if (growth > 0) return 'text-green-600 bg-green-50';
    if (growth < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  // 증감율 아이콘 함수
  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return '↗️';
    if (growth < 0) return '↘️';
    return '➡️';
  };

  // 데이터 처리 및 정렬
  const processedData = useMemo(() => {
    // 필터링된 데이터
    const filteredData = selectedPerformance === 'all' 
      ? data 
      : data.filter(item => item.liveName === selectedPerformance);

    // 날짜별로 정렬 (최신순)
    const sortedByDate = [...filteredData].sort((a, b) => {
      const dateA = new Date(a.showDateTime || '').getTime();
      const dateB = new Date(b.showDateTime || '').getTime();
      return dateB - dateA;
    });

    // 증감율 계산을 위한 처리
    const processedItems = sortedByDate.map((item, index) => {
      const currentOccupancy = toNumber(item.paidShare);
      const currentTickets = toNumber(item.paidSeatTot);
      const currentRevenue = toNumber(item.paidSeatSales);

      // 전일 데이터 (다음 인덱스 = 전일, 내림차순 정렬이므로)
      const previousItem = sortedByDate[index + 1];
      
      let occupancyGrowth = 0;
      let ticketsGrowth = 0;
      let revenueGrowth = 0;

      if (previousItem) {
        const previousOccupancy = toNumber(previousItem.paidShare);
        const previousTickets = toNumber(previousItem.paidSeatTot);
        const previousRevenue = toNumber(previousItem.paidSeatSales);

        occupancyGrowth = calculateGrowthRate(currentOccupancy, previousOccupancy);
        ticketsGrowth = calculateGrowthRate(currentTickets, previousTickets);
        revenueGrowth = calculateGrowthRate(currentRevenue, previousRevenue);
      }

      return {
        ...item,
        processedOccupancy: currentOccupancy,
        processedTickets: currentTickets,
        processedRevenue: currentRevenue,
        occupancyGrowth,
        ticketsGrowth,
        revenueGrowth
      };
    });

    // 정렬 적용
    return processedItems.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'date':
          aValue = new Date(a.showDateTime || '').getTime();
          bValue = new Date(b.showDateTime || '').getTime();
          break;
        case 'occupancy':
          aValue = a.processedOccupancy;
          bValue = b.processedOccupancy;
          break;
        case 'occupancyGrowth':
          aValue = a.occupancyGrowth;
          bValue = b.occupancyGrowth;
          break;
        case 'tickets':
          aValue = a.processedTickets;
          bValue = b.processedTickets;
          break;
        case 'ticketsGrowth':
          aValue = a.ticketsGrowth;
          bValue = b.ticketsGrowth;
          break;
        case 'revenue':
          aValue = a.processedRevenue;
          bValue = b.processedRevenue;
          break;
        case 'revenueGrowth':
          aValue = a.revenueGrowth;
          bValue = b.revenueGrowth;
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
  }, [data, selectedPerformance, sortField, sortDirection]);

  // 정렬 클릭 핸들러
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // 정렬 아이콘
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↗️' : '↘️';
  };

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-lg font-medium mb-2">일간별 판매 데이터가 없습니다</p>
          <p className="text-sm">선택한 조건의 데이터를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      {/* 헤더 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          일간별 판매현황 테이블 {selectedPerformance !== 'all' && `- ${selectedPerformance}`}
        </h3>
        <p className="text-sm text-gray-600">
          총 {processedData.length}개의 공연 데이터 | 전일 대비 증감율 포함
        </p>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th 
                className="text-left py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('date')}
              >
                공연일 {getSortIcon('date')}
              </th>
              <th 
                className="text-center py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('occupancy')}
              >
                유료 점유율 {getSortIcon('occupancy')}
              </th>
              <th 
                className="text-center py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('occupancyGrowth')}
              >
                점유율 증감 {getSortIcon('occupancyGrowth')}
              </th>
              <th 
                className="text-center py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('tickets')}
              >
                총 판매 매수 {getSortIcon('tickets')}
              </th>
              <th 
                className="text-center py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('ticketsGrowth')}
              >
                매수 증감 {getSortIcon('ticketsGrowth')}
              </th>
              <th 
                className="text-center py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('revenue')}
              >
                총 판매 금액 {getSortIcon('revenue')}
              </th>
              <th 
                className="text-center py-3 px-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('revenueGrowth')}
              >
                금액 증감 {getSortIcon('revenueGrowth')}
              </th>
            </tr>
          </thead>
          <tbody>
            {processedData.map((item, index) => (
              <motion.tr
                key={`${item.id}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {/* 공연일 */}
                <td className="py-3 px-4 text-gray-800 font-medium">
                  {formatDate(item.showDateTime || '')}
                </td>

                {/* 유료 점유율 */}
                <td className="py-3 px-4 text-center">
                  <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                    {item.processedOccupancy.toFixed(1)}%
                  </span>
                </td>

                {/* 점유율 증감 */}
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-2 py-1 rounded-lg text-sm font-medium ${getGrowthStyle(item.occupancyGrowth)}`}>
                    {getGrowthIcon(item.occupancyGrowth)} {item.occupancyGrowth.toFixed(1)}%
                  </span>
                </td>

                {/* 총 판매 매수 */}
                <td className="py-3 px-4 text-center text-gray-800 font-medium">
                  {formatNumber(item.processedTickets)}
                </td>

                {/* 매수 증감 */}
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-2 py-1 rounded-lg text-sm font-medium ${getGrowthStyle(item.ticketsGrowth)}`}>
                    {getGrowthIcon(item.ticketsGrowth)} {item.ticketsGrowth.toFixed(1)}%
                  </span>
                </td>

                {/* 총 판매 금액 */}
                <td className="py-3 px-4 text-center text-gray-800 font-medium">
                  {formatCurrency(item.processedRevenue)}
                </td>

                {/* 금액 증감 */}
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-2 py-1 rounded-lg text-sm font-medium ${getGrowthStyle(item.revenueGrowth)}`}>
                    {getGrowthIcon(item.revenueGrowth)} {item.revenueGrowth.toFixed(1)}%
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 요약 통계 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">평균 점유율</p>
          <p className="text-lg font-bold text-blue-800">
            {processedData.length > 0 
              ? (processedData.reduce((sum, item) => sum + item.processedOccupancy, 0) / processedData.length).toFixed(1)
              : 0}%
          </p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600 font-medium">총 판매 매수</p>
          <p className="text-lg font-bold text-green-800">
            {formatNumber(processedData.reduce((sum, item) => sum + item.processedTickets, 0))}
          </p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-600 font-medium">총 판매 금액</p>
          <p className="text-lg font-bold text-purple-800">
            {formatCurrency(processedData.reduce((sum, item) => sum + item.processedRevenue, 0))}
          </p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-600 font-medium">총 공연 횟수</p>
          <p className="text-lg font-bold text-orange-800">
            {processedData.length}회
          </p>
        </div>
      </div>
    </motion.div>
  );
} 