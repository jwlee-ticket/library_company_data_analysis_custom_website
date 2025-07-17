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
  bgColor,
  accentColor,
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
  bgColor: string;
  accentColor: string;
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
      transition={{ duration: 0.4, delay }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)"
      }}
      className={`${bgColor} rounded-2xl shadow-sm p-6 border border-gray-100 group relative transition-all duration-200 hover:border-gray-200`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <IoInformationCircleOutline className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
            </motion.div>
            <div className="absolute right-0 bottom-8 w-72 p-4 bg-gray-900 text-white text-sm rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10 transform translate-y-2 group-hover:translate-y-0">
              {tooltip}
              <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <p className="text-2xl font-bold text-gray-900 break-words leading-tight">
              {amount.toLocaleString()}원
            </p>
          </div>
          
          <p className="text-sm text-gray-500 font-medium">
            목표액: {target.toLocaleString()}원
          </p>

          {hasChangeData && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm text-gray-600 font-medium">
                증감액: {changeAmount >= 0 ? '+' : ''}{changeAmount?.toLocaleString()}원
              </span>
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold ${isChangePositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {isChangePositive ? <IoTrendingUp className="mr-1 w-3 h-3" /> : <IoTrendingDown className="mr-1 w-3 h-3" />}
                {changeRate !== undefined && changeRate >= 0 ? '+' : ''}{changeRate?.toFixed(1)}%
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">달성률</span>
            <span className={`font-bold ${isPositive ? 'text-emerald-600' : 'text-gray-600'}`}>
              {percentage}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
              transition={{ duration: 0.8, delay: delay + 0.2, ease: "easeOut" }}
              className={`h-full rounded-full ${accentColor}`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SalesSection({ 
  title, 
  data, 
  baseDelay,
  bgColor,
  accentColor,
  titleColor
}: { 
  title: string; 
  data: { yesterday: SalesData; accumulated: SalesData; weekly: SalesData; weeklyAverage: SalesData; };
  baseDelay: number;
  bgColor: string;
  accentColor: string;
  titleColor: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: baseDelay }}
      className="space-y-6"
    >
      <div className="flex items-center">
        <div className={`w-1 h-8 ${accentColor} rounded-full mr-4`}></div>
        <h3 className={`text-xl font-bold ${titleColor}`}>{title}</h3>
        <span className={`ml-3 px-3 py-1 bg-gray-50 text-gray-600 text-sm font-medium rounded-full border border-gray-200`}>
          4개 지표
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SalesCard
          title="어제 매출"
          amount={data.yesterday.total}
          target={data.yesterday.target}
          changeAmount={data.yesterday.changeAmount}
          changeRate={data.yesterday.changeRate}
          bgColor={bgColor}
          accentColor={accentColor}
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
          bgColor={bgColor}
          accentColor={accentColor}
          delay={baseDelay + 0.2}
          tooltip="지금까지의 총 누적 매출입니다. 전체 목표 대비 달성률을 확인할 수 있습니다."
        />
        <SalesCard
          title="주간 매출"
          amount={data.weekly.total}
          target={data.weekly.target}
          changeAmount={data.weekly.changeAmount}
          changeRate={data.weekly.changeRate}
          bgColor={bgColor}
          accentColor={accentColor}
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
          bgColor={bgColor}
          accentColor={accentColor}
          delay={baseDelay + 0.4}
          tooltip="최근 7일간의 일평균 매출입니다. 일평균 목표 대비 달성률과 전주 일평균 대비 증감률을 확인할 수 있습니다."
          changeLabel="전주 일평균 대비"
        />
      </div>
    </motion.div>
  );
}

export default function PlaySalesCards({ data }: PlaySalesCardsProps) {
  return (
    <div className="space-y-12">
      <SalesSection
        title="통합"
        data={data.integrated}
        baseDelay={0}
        bgColor="bg-blue-50/50"
        accentColor="bg-gradient-to-r from-blue-500 to-blue-400"
        titleColor="text-blue-700"
      />
      <SalesSection
        title="연극"
        data={data.theater}
        baseDelay={0.3}
        bgColor="bg-purple-50/50"
        accentColor="bg-gradient-to-r from-purple-500 to-purple-400"
        titleColor="text-purple-700"
      />
      <SalesSection
        title="뮤지컬"
        data={data.musical}
        baseDelay={0.6}
        bgColor="bg-pink-50/50"
        accentColor="bg-gradient-to-r from-pink-500 to-pink-400"
        titleColor="text-pink-700"
      />
    </div>
  );
} 