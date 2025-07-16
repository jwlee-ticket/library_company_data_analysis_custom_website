'use client';

import { motion } from 'framer-motion';
import { usePlayDashboardApi } from '@/hooks/usePlayDashboardApi';
import SalesCard from '@/components/dashboard/SalesCard';
import ErrorView from '@/components/ui/ErrorView';
import { IoMdArrowDropup, IoMdArrowDropdown } from 'react-icons/io';

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  comparison?: {
    value: number;
    label: string;
  };
}

function SummaryCard({ title, value, subtitle, comparison }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col h-full">
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {value}
        </p>
        {comparison && (
          <div className="flex items-center mt-2">
            {comparison.value > 0 ? (
              <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <IoMdArrowDropup className="text-xl" />
                <span className="text-sm font-medium">
                  {Math.abs(comparison.value).toFixed(1)}%
                </span>
              </div>
            ) : comparison.value < 0 ? (
              <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-full">
                <IoMdArrowDropdown className="text-xl" />
                <span className="text-sm font-medium">
                  {Math.abs(comparison.value).toFixed(1)}%
                </span>
              </div>
            ) : null}
            <span className="text-sm text-gray-500 ml-2">
              {comparison.label}
            </span>
          </div>
        )}
        {subtitle && (
          <p className="text-sm text-gray-600 mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

interface PlaySalesTableProps {
  performances: Array<{
    genre: '콘서트' | '연극' | '뮤지컬';
    name: string;
    revenue: number;
    target: number;
    achievementRate: number;
  }>;
}

function PlaySalesTable({ performances }: PlaySalesTableProps) {
  const getGenreColor = (genre: string) => {
    switch (genre) {
      case '연극': return 'bg-blue-100 text-blue-800';
      case '뮤지컬': return 'bg-purple-100 text-purple-800';
      case '콘서트': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAchievementColor = (rate: number) => {
    if (rate >= 100) return 'text-green-600 font-semibold';
    if (rate >= 80) return 'text-blue-600 font-medium';
    if (rate >= 60) return 'text-yellow-600 font-medium';
    return 'text-red-600 font-medium';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left p-4 font-semibold text-gray-700">장르</th>
            <th className="text-left p-4 font-semibold text-gray-700">공연명</th>
            <th className="text-right p-4 font-semibold text-gray-700">총 매출</th>
            <th className="text-right p-4 font-semibold text-gray-700">목표 매출</th>
            <th className="text-right p-4 font-semibold text-gray-700">달성률</th>
          </tr>
        </thead>
        <tbody>
          {performances.map((performance, index) => (
            <motion.tr
              key={`${performance.genre}-${performance.name}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGenreColor(performance.genre)}`}>
                  {performance.genre}
                </span>
              </td>
              <td className="p-4 font-medium text-gray-900">
                {performance.name}
              </td>
              <td className="p-4 text-right font-semibold text-gray-900">
                {new Intl.NumberFormat('ko-KR', {
                  style: 'currency',
                  currency: 'KRW',
                  maximumFractionDigits: 0
                }).format(Number(performance.revenue) || 0)}
              </td>
              <td className="p-4 text-right text-gray-600">
                {new Intl.NumberFormat('ko-KR', {
                  style: 'currency',
                  currency: 'KRW',
                  maximumFractionDigits: 0
                }).format(Number(performance.target) || 0)}
              </td>
              <td className={`p-4 text-right ${getAchievementColor(Number(performance.achievementRate) || 0)}`}>
                {(Number(performance.achievementRate) || 0).toFixed(1)}%
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DashboardPage() {
  const { dashboardData, isLoading, error, refetch } = usePlayDashboardApi();

  // 에러 처리
  if (error && !isLoading && !dashboardData) {
    return (
      <div className="p-6">
        <ErrorView
          title="데이터 로딩 실패"
          message="통합 대시보드 데이터를 불러올 수 없습니다."
          onRetry={refetch}
        />
      </div>
    );
  }

  // 로딩 상태
  if (isLoading || !dashboardData) {
    return (
      <div className="p-6 space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* 페이지 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          통합 데이터 대시보드
        </h1>
        <p className="text-gray-500 text-sm">
          콘서트 · 연극 · 뮤지컬 통합 현황 | 최근 업데이트: {new Date().toLocaleDateString('ko-KR')}
        </p>
      </motion.div>

      {/* 전체 매출 요약 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <span className="inline-block w-2 h-6 bg-blue-500 rounded mr-3"></span>
          전체 매출 요약 (콘서트 + 연극 + 뮤지컬)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard
            title="총 매출"
            value={new Intl.NumberFormat('ko-KR', {
              style: 'currency',
              currency: 'KRW',
              maximumFractionDigits: 0
            }).format(Number(dashboardData.totalSummary.totalRevenue) || 0)}
          />
          <SummaryCard
            title="총 목표"
            value={new Intl.NumberFormat('ko-KR', {
              style: 'currency',
              currency: 'KRW',
              maximumFractionDigits: 0
            }).format(Number(dashboardData.totalSummary.totalTarget) || 0)}
          />
          <SummaryCard
            title="전체 달성률"
            value={`${(Number(dashboardData.totalSummary.achievementRate) || 0).toFixed(1)}%`}
            subtitle={`목표 대비 ${(Number(dashboardData.totalSummary.achievementRate) || 0).toFixed(1)}% 달성`}
            comparison={{
              value: (Number(dashboardData.totalSummary.achievementRate) || 0) - 100,
              label: "목표 대비"
            }}
          />
        </div>
      </motion.div>

      {/* 장르별 매출 현황 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <span className="inline-block w-2 h-6 bg-purple-500 rounded mr-3"></span>
          장르별 매출 현황
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SalesCard
            title="콘서트 매출"
            currentSales={Number(dashboardData.genreSummary.concert.revenue) || 0}
            targetSales={Number(dashboardData.genreSummary.concert.target) || 0}
            previousDaySales={(Number(dashboardData.genreSummary.concert.revenue) || 0) * 0.92}
            backgroundColor="bg-white"
          />
          
          <SalesCard
            title="연극 매출"
            currentSales={Number(dashboardData.genreSummary.theater.revenue) || 0}
            targetSales={Number(dashboardData.genreSummary.theater.target) || 0}
            previousDaySales={(Number(dashboardData.genreSummary.theater.revenue) || 0) * 0.95}
            backgroundColor="bg-white"
          />
          
          <SalesCard
            title="뮤지컬 매출"
            currentSales={Number(dashboardData.genreSummary.musical.revenue) || 0}
            targetSales={Number(dashboardData.genreSummary.musical.target) || 0}
            previousDaySales={(Number(dashboardData.genreSummary.musical.revenue) || 0) * 0.97}
            backgroundColor="bg-white"
          />
        </div>
      </motion.div>

      {/* 공연별 매출 현황 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <span className="inline-block w-2 h-6 bg-green-500 rounded mr-3"></span>
          공연별 매출 현황 (전체)
        </h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
          {dashboardData.performanceDetails.length > 0 ? (
            <PlaySalesTable performances={dashboardData.performanceDetails} />
          ) : (
            <div className="p-8 text-center text-gray-500">
              공연별 매출 데이터가 없습니다.
            </div>
          )}
        </div>
      </motion.div>

      {/* 데이터 없음 처리 */}
      {dashboardData.performanceDetails.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"
        >
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              통합 데이터 없음
            </h2>
            <p className="text-gray-600 mb-6">
              현재 표시할 콘서트, 연극, 뮤지컬 데이터가 없습니다.
            </p>
            <button
              onClick={refetch}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              데이터 새로고침
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
} 