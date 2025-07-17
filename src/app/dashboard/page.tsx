'use client';

import { motion } from 'framer-motion';
import { usePlayDashboardApi } from '@/hooks/usePlayDashboardApi';
import SalesCard from '@/components/dashboard/SalesCard';
import ErrorView from '@/components/ui/ErrorView';
import ApiDataViewer from '@/components/debug/ApiDataViewer';
import { IoMdArrowDropup, IoMdArrowDropdown, IoMdRefresh } from 'react-icons/io';

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
    <motion.div 
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col h-full">
        <h3 className="text-sm font-medium text-gray-600 mb-3">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
          {value}
        </p>
        {comparison && (
          <div className="flex items-center mb-2">
            {comparison.value > 0 ? (
              <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl">
                <IoMdArrowDropup className="text-lg" />
                <span className="text-sm font-semibold">
                  {Math.abs(comparison.value).toFixed(1)}%
                </span>
              </div>
            ) : comparison.value < 0 ? (
              <div className="flex items-center text-red-500 bg-red-50 px-3 py-1.5 rounded-xl">
                <IoMdArrowDropdown className="text-lg" />
                <span className="text-sm font-semibold">
                  {Math.abs(comparison.value).toFixed(1)}%
                </span>
              </div>
            ) : (
              <div className="flex items-center text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl">
                <span className="text-sm font-semibold">0.0%</span>
              </div>
            )}
            <span className="text-sm text-gray-500 ml-3">
              {comparison.label}
            </span>
          </div>
        )}
        {subtitle && (
          <p className="text-sm text-gray-500 mt-auto">{subtitle}</p>
        )}
      </div>
    </motion.div>
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
      case '연극': return 'bg-blue-50 text-blue-700 border-blue-100';
      case '뮤지컬': return 'bg-purple-50 text-purple-700 border-purple-100';
      case '콘서트': return 'bg-green-50 text-green-700 border-green-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getAchievementColor = (rate: number) => {
    if (rate >= 100) return 'text-blue-600 font-bold';
    if (rate >= 80) return 'text-green-600 font-semibold';
    if (rate >= 60) return 'text-orange-500 font-medium';
    return 'text-red-500 font-medium';
  };

  const getAchievementBadge = (rate: number) => {
    if (rate >= 100) return 'bg-blue-50 text-blue-700 border-blue-100';
    if (rate >= 80) return 'bg-green-50 text-green-700 border-green-100';
    if (rate >= 60) return 'bg-orange-50 text-orange-700 border-orange-100';
    return 'bg-red-50 text-red-700 border-red-100';
  };

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left p-5 font-semibold text-gray-700 text-sm">장르</th>
              <th className="text-left p-5 font-semibold text-gray-700 text-sm">공연명</th>
              <th className="text-right p-5 font-semibold text-gray-700 text-sm">총 매출</th>
              <th className="text-right p-5 font-semibold text-gray-700 text-sm">목표 매출</th>
              <th className="text-right p-5 font-semibold text-gray-700 text-sm">달성률</th>
            </tr>
          </thead>
          <tbody>
            {performances.map((performance, index) => (
              <motion.tr
                key={`${performance.genre}-${performance.name}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-all duration-200 group"
              >
                <td className="p-5">
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${getGenreColor(performance.genre)}`}>
                    {performance.genre}
                  </span>
                </td>
                <td className="p-5">
                  <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                    {performance.name}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <span className="font-bold text-gray-900 text-base">
                    {new Intl.NumberFormat('ko-KR', {
                      style: 'currency',
                      currency: 'KRW',
                      maximumFractionDigits: 0
                    }).format(Number(performance.revenue) || 0)}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <span className="text-gray-600 font-medium">
                    {new Intl.NumberFormat('ko-KR', {
                      style: 'currency',
                      currency: 'KRW',
                      maximumFractionDigits: 0
                    }).format(Number(performance.target) || 0)}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <span className={`px-3 py-1.5 rounded-xl text-sm font-bold border ${getAchievementBadge(Number(performance.achievementRate) || 0)}`}>
                    {(Number(performance.achievementRate) || 0).toFixed(1)}%
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

export default function DashboardPage() {
  const { dashboardData, isLoading, error, refetch } = usePlayDashboardApi();

  // 에러 처리
  if (error && !isLoading && !dashboardData) {
    return (
      <div className="p-8">
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
      <div className="p-8 space-y-8">
        <div className="animate-pulse">
          {/* 헤더 스켈레톤 */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded-lg w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
          
          {/* 요약 카드 스켈레톤 */}
          <div className="mb-8">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
          
          {/* 장르별 카드 스켈레톤 */}
          <div className="mb-8">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
          
          {/* 테이블 스켈레톤 */}
          <div>
            <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="p-8 max-w-7xl mx-auto space-y-10">
        {/* 페이지 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center lg:text-left"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            통합 데이터 대시보드
          </h1>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <p className="text-gray-600 mb-4 lg:mb-0">
              콘서트 · 연극 · 뮤지컬 통합 현황 • 최근 업데이트: {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
            </p>
            <motion.button
              onClick={refetch}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 self-start lg:self-auto"
            >
              <IoMdRefresh className="text-lg" />
              <span className="font-medium text-sm">새로고침</span>
            </motion.button>
          </div>
        </motion.div>

        {/* API 응답 데이터 뷰어 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <ApiDataViewer 
            responses={{
              'dashboard-summary': {
                endpoint: '/api/play/dashboard',
                status: isLoading ? 'loading' : error ? 'error' : 'success',
                data: dashboardData,
                error: error || undefined,
                timestamp: new Date().toISOString()
              }
            }}
          />
        </motion.div>

        {/* 전체 매출 요약 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center mb-6">
            <div className="w-1 h-7 bg-blue-500 rounded-full mr-4"></div>
            <h2 className="text-xl font-bold text-gray-900">전체 매출 요약</h2>
            <span className="ml-3 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
              콘서트 + 연극 + 뮤지컬
            </span>
          </div>
          
          {/* 통합 매출 요약 카드 */}
          <motion.div 
            className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all duration-300 group"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 총 매출 */}
              <div className="text-center md:text-left">
                <h3 className="text-sm font-medium text-gray-600 mb-2">총 매출</h3>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  {new Intl.NumberFormat('ko-KR', {
              style: 'currency',
              currency: 'KRW',
              maximumFractionDigits: 0
                  }).format(Number(dashboardData.totalSummary.totalRevenue) || 0)}
                </p>
        </div>
              
              {/* 총 목표 */}
              <div className="text-center md:text-left">
                <h3 className="text-sm font-medium text-gray-600 mb-2">총 목표</h3>
                <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  {new Intl.NumberFormat('ko-KR', {
                    style: 'currency',
                    currency: 'KRW',
                    maximumFractionDigits: 0
                  }).format(Number(dashboardData.totalSummary.totalTarget) || 0)}
                </p>
      </div>
              
              {/* 달성률 */}
              <div className="text-center md:text-left">
                <h3 className="text-sm font-medium text-gray-600 mb-2">전체 달성률</h3>
                <div className="flex flex-col items-center md:items-start">
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-3">
                    {(Number(dashboardData.totalSummary.achievementRate) || 0).toFixed(1)}%
                  </p>
                  <div className="flex items-center">
                    {((Number(dashboardData.totalSummary.achievementRate) || 0) - 100) > 0 ? (
                      <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl">
                        <IoMdArrowDropup className="text-lg" />
                        <span className="text-sm font-semibold">
                          {Math.abs((Number(dashboardData.totalSummary.achievementRate) || 0) - 100).toFixed(1)}%
                        </span>
                      </div>
                    ) : ((Number(dashboardData.totalSummary.achievementRate) || 0) - 100) < 0 ? (
                      <div className="flex items-center text-red-500 bg-red-50 px-3 py-1.5 rounded-xl">
                        <IoMdArrowDropdown className="text-lg" />
                        <span className="text-sm font-semibold">
                          {Math.abs((Number(dashboardData.totalSummary.achievementRate) || 0) - 100).toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl">
                        <span className="text-sm font-semibold">0.0%</span>
                      </div>
                    )}
                    <span className="text-sm text-gray-500 ml-3">목표 대비</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

      {/* 장르별 매출 현황 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center mb-6">
            <div className="w-1 h-7 bg-purple-500 rounded-full mr-4"></div>
            <h2 className="text-xl font-bold text-gray-900">장르별 매출 현황</h2>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <SalesCard
                title="콘서트 매출"
                currentSales={Number(dashboardData.genreSummary.concert.revenue) || 0}
                targetSales={Number(dashboardData.genreSummary.concert.target) || 0}
                previousDaySales={(Number(dashboardData.genreSummary.concert.revenue) || 0) * 0.92}
            backgroundColor="bg-white"
          />
            </motion.div>
          
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <SalesCard
                title="연극 매출"
                currentSales={Number(dashboardData.genreSummary.theater.revenue) || 0}
                targetSales={Number(dashboardData.genreSummary.theater.target) || 0}
                previousDaySales={(Number(dashboardData.genreSummary.theater.revenue) || 0) * 0.95}
            backgroundColor="bg-white"
          />
            </motion.div>
          
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <SalesCard
                title="뮤지컬 매출"
                currentSales={Number(dashboardData.genreSummary.musical.revenue) || 0}
                targetSales={Number(dashboardData.genreSummary.musical.target) || 0}
                previousDaySales={(Number(dashboardData.genreSummary.musical.revenue) || 0) * 0.97}
            backgroundColor="bg-white"
          />
            </motion.div>
        </div>
        </motion.section>

      {/* 공연별 매출 현황 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center mb-6">
            <div className="w-1 h-7 bg-green-500 rounded-full mr-4"></div>
            <h2 className="text-xl font-bold text-gray-900">공연별 매출 현황</h2>
            <span className="ml-3 px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
              총 {dashboardData.performanceDetails.length}개 공연
            </span>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            {dashboardData.performanceDetails.length > 0 ? (
              <PlaySalesTable performances={dashboardData.performanceDetails} />
            ) : (
              <div className="p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  공연별 매출 데이터가 없습니다
                </h3>
                <p className="text-gray-500 mb-6">
                  데이터를 확인하거나 새로고침을 시도해보세요
                </p>
                <motion.button
                  onClick={refetch}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  데이터 새로고침
                </motion.button>
              </div>
            )}
          </div>
        </motion.section>

        {/* 데이터 없음 처리 */}
        {dashboardData.performanceDetails.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm p-10 border border-gray-100 text-center"
          >
            <div className="text-gray-400 text-6xl mb-6">🎭</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              통합 데이터 없음
        </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              현재 표시할 콘서트, 연극, 뮤지컬 데이터가 없습니다.<br />
              잠시 후 다시 시도해주세요.
            </p>
            <motion.button
              onClick={refetch}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-semibold text-lg"
            >
              데이터 새로고침
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
} 