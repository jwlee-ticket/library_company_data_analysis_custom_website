interface WeekRangePickerProps {
  startWeek: string;
  endWeek: string;
  onStartWeekChange: (week: string) => void;
  onEndWeekChange: (week: string) => void;
  onApply: () => void;
  onReset: () => void;
  className?: string;
}

export default function WeekRangePicker({
  startWeek,
  endWeek,
  onStartWeekChange,
  onEndWeekChange,
  onApply,
  onReset,
  className = ""
}: WeekRangePickerProps) {
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 ${className}`}>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors whitespace-nowrap"
      >
        전체 보기
      </button>
      
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">시작 주:</label>
        <input
          type="week"
          value={startWeek}
          onChange={(e) => onStartWeekChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">종료 주:</label>
        <input
          type="week"
          value={endWeek}
          onChange={(e) => onEndWeekChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <button
        onClick={onApply}
        disabled={!startWeek || !endWeek}
        className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors whitespace-nowrap disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        적용하기
      </button>
    </div>
  );
} 