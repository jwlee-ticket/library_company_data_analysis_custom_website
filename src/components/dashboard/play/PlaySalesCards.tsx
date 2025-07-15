import { motion } from 'framer-motion';
import { IoTrendingUp, IoTrendingDown, IoInformationCircleOutline } from 'react-icons/io5';

interface SalesData {
  total: number;
  target: number;
  changeAmount?: number;
  changeRate?: number;
  achievementRate?: number;
}

interface PlaySalesCardsProps {
  data: {
    integrated: {
      yesterday: SalesData;
      accumulated: SalesData;
      weekly: SalesData;
      weeklyAverage: SalesData;
    };
    theater: {
      yesterday: SalesData;
      accumulated: SalesData;
      weekly: SalesData;
      weeklyAverage: SalesData;
    };
    musical: {
      yesterday: SalesData;
      accumulated: SalesData;
      weekly: SalesData;
      weeklyAverage: SalesData;
    };
  };
}

function SalesCard({ 
  title, 
  amount, 
  target, 
  changeAmount,
  changeRate,
  achievementRate,
  color,
  delay,
  tooltip,
  changeLabel
}: { 
  title: string; 
  amount: number; 
  target: number;
  changeAmount?: number;
  changeRate?: number;
  achievementRate?: number;
  color: string;
  delay: number;
  tooltip: string;
  changeLabel?: string;
}) {
  const percentage = ((amount / target) * 100).toFixed(1);
  const isPositive = amount >= target;
  const hasChangeData = changeAmount !== undefined && changeRate !== undefined && title !== "누적 매출";
  const isChangePositive = changeAmount !== undefined && changeAmount >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-white rounded-xl shadow-sm p-4 border ${color} group relative`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className="relative">
            <IoInformationCircleOutline className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
            <div className="absolute right-0 bottom-6 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              {tooltip}
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div>
            <p className="text-xl font-bold text-gray-800 break-words">
              {amount.toLocaleString()}원
            </p>
          </div>
          
          <p className="text-xs text-gray-500">
            목표액: {target.toLocaleString()}원
          </p>

          {hasChangeData && (
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-gray-500">
                증감액: {changeAmount >= 0 ? '+' : ''}{changeAmount?.toLocaleString()}원
              </span>
              <span className={`flex items-center ${isChangePositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isChangePositive ? <IoTrendingUp className="mr-1" /> : <IoTrendingDown className="mr-1" />}
                {changeRate !== undefined && changeRate >= 0 ? '+' : ''}{changeRate?.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isPositive 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                : 'bg-gradient-to-r from-rose-500 to-rose-400'
            }`}
            style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function SalesSection({ 
  title, 
  data, 
  baseDelay,
  colorScheme
}: { 
  title: string; 
  data: { yesterday: SalesData; accumulated: SalesData; weekly: SalesData; weeklyAverage: SalesData; };
  baseDelay: number;
  colorScheme: string;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SalesCard
          title="어제 매출"
          amount={data.yesterday.total}
          target={data.yesterday.target}
          changeAmount={data.yesterday.changeAmount}
          changeRate={data.yesterday.changeRate}
          color={colorScheme}
          delay={baseDelay + 0.1}
          tooltip="전일 매출 총액입니다. 목표 대비 달성률과 전일 대비 증감률을 확인할 수 있습니다."
          changeLabel="전일 대비"
        />
        <SalesCard
          title="누적 매출"
          amount={data.accumulated.total}
          target={data.accumulated.target}
          changeAmount={data.accumulated.changeAmount}
          changeRate={data.accumulated.changeRate}
          color={colorScheme}
          delay={baseDelay + 0.2}
          tooltip="지금까지의 총 누적 매출입니다. 전체 목표 대비 달성률을 확인할 수 있습니다."
        />
        <SalesCard
          title="주간 매출"
          amount={data.weekly.total}
          target={data.weekly.target}
          changeAmount={data.weekly.changeAmount}
          changeRate={data.weekly.changeRate}
          color={colorScheme}
          delay={baseDelay + 0.3}
          tooltip="최근 7일간의 매출 총액입니다. 주간 목표 대비 달성률과 전주 대비 증감률을 확인할 수 있습니다."
          changeLabel="전주 대비"
        />
        <SalesCard
          title="주간 일평균 매출"
          amount={data.weeklyAverage.total}
          target={data.weeklyAverage.target}
          changeAmount={data.weeklyAverage.changeAmount}
          changeRate={data.weeklyAverage.changeRate}
          color={colorScheme}
          delay={baseDelay + 0.4}
          tooltip="최근 7일간의 일평균 매출입니다. 일평균 목표 대비 달성률과 전주 일평균 대비 증감률을 확인할 수 있습니다."
          changeLabel="전주 일평균 대비"
        />
      </div>
    </div>
  );
}

export default function PlaySalesCards({ data }: PlaySalesCardsProps) {
  return (
    <div className="space-y-8">
      <SalesSection
        title="통합"
        data={data.integrated}
        baseDelay={0}
        colorScheme="border-blue-200"
      />
      <SalesSection
        title="연극"
        data={data.theater}
        baseDelay={0.5}
        colorScheme="border-purple-200"
      />
      <SalesSection
        title="뮤지컬"
        data={data.musical}
        baseDelay={1.0}
        colorScheme="border-pink-200"
      />
    </div>
  );
} 