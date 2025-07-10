interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onApply?: () => void;
  onReset: () => void;
  className?: string;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApply,
  onReset,
  className = ""
}: DateRangePickerProps) {
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 ${className}`}>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors whitespace-nowrap"
      >
        전체 보기
      </button>
      
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">시작일:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">종료일:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {onApply && (
        <button
          onClick={onApply}
          disabled={!startDate || !endDate}
          className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors whitespace-nowrap disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          적용하기
        </button>
      )}
    </div>
  );
} 