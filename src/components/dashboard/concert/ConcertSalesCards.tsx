import { motion } from 'framer-motion';
import { IoTrendingUp, IoTrendingDown } from 'react-icons/io5';

interface SalesData {
  total: number;
  target: number;
}

interface ConcertSalesCardsProps {
  data: {
    yesterday: SalesData;
    accumulated: SalesData;
    weekly: SalesData;
    weeklyAverage: SalesData;
  };
}

function SalesCard({ 
  title, 
  amount, 
  target, 
  color,
  delay 
}: { 
  title: string; 
  amount: number; 
  target: number;
  color: string;
  delay: number;
}) {
  const percentage = ((amount / target) * 100).toFixed(1);
  const isPositive = amount >= target;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-white rounded-xl shadow-sm p-5 border ${color}`}
    >
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <p className="text-xl font-bold text-gray-800 truncate">
              {amount.toLocaleString()}원
            </p>
            <div className={`flex items-center text-sm ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isPositive ? <IoTrendingUp className="mr-1" /> : <IoTrendingDown className="mr-1" />}
              <span>{percentage}%</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            목표: {target.toLocaleString()}원
          </p>
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

export default function ConcertSalesCards({ data }: ConcertSalesCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <SalesCard
        title="어제 매출"
        amount={data.yesterday.total}
        target={data.yesterday.target}
        color="border-slate-100"
        delay={0.1}
      />
      <SalesCard
        title="누적 매출"
        amount={data.accumulated.total}
        target={data.accumulated.target}
        color="border-slate-100"
        delay={0.2}
      />
      <SalesCard
        title="주간 매출"
        amount={data.weekly.total}
        target={data.weekly.target}
        color="border-slate-100"
        delay={0.3}
      />
      <SalesCard
        title="주간 일평균 매출"
        amount={data.weeklyAverage.total}
        target={data.weeklyAverage.target}
        color="border-slate-100"
        delay={0.4}
      />
    </div>
  );
} 