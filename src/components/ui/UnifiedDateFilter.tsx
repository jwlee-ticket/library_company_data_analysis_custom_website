'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCalendar, IoCheckmark, IoRefresh, IoFunnel } from 'react-icons/io5';

interface DatePreset {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  description?: string;
}

interface UnifiedDateFilterProps {
  startDate: string;
  endDate: string;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  onReset: () => void;
  isLoading?: boolean;
  className?: string;
}

// 날짜 프리셋 생성 함수
const createDatePresets = (): DatePreset[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  
  const monthAgo = new Date(today);
  monthAgo.setMonth(today.getMonth() - 1);
  
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  
  const yearAgo = new Date(today);
  yearAgo.setFullYear(today.getFullYear() - 1);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  return [
    {
      id: 'last7days',
      label: '최근 7일',
      startDate: formatDate(weekAgo),
      endDate: formatDate(today),
      description: '지난 주 데이터 분석에 적합'
    },
    {
      id: 'last30days',
      label: '최근 30일',
      startDate: formatDate(monthAgo),
      endDate: formatDate(today),
      description: '월간 트렌드 파악에 적합'
    },
    {
      id: 'last3months',
      label: '최근 3개월',
      startDate: formatDate(threeMonthsAgo),
      endDate: formatDate(today),
      description: '분기별 성과 분석에 적합'
    },
    {
      id: 'thisYear',
      label: '올해',
      startDate: `${today.getFullYear()}-01-01`,
      endDate: formatDate(today),
      description: '연간 누적 데이터 확인'
    },
    {
      id: 'lastYear',
      label: '작년 동기',
      startDate: formatDate(yearAgo),
      endDate: formatDate(new Date(yearAgo.getTime() + (today.getTime() - new Date(`${today.getFullYear()}-01-01`).getTime()))),
      description: '전년 동기 대비 분석'
    }
  ];
};

export default function UnifiedDateFilter({
  startDate,
  endDate,
  onDateRangeChange,
  onReset,
  isLoading = false,
  className = ""
}: UnifiedDateFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [panelPosition, setPanelPosition] = useState<'left' | 'right'>('left');

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const presets = createDatePresets();

  // 패널 위치 계산
  useEffect(() => {
    if (isExpanded && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const panelWidth = 384; // w-96 = 24rem = 384px
      const rightPadding = 24; // 오른쪽 패딩
      
      // 버튼 오른쪽 끝에서 패널 너비와 패딩을 더한 값이 화면을 벗어나는지 확인
      const wouldOverflow = buttonRect.right + panelWidth + rightPadding > viewportWidth;
      
      if (wouldOverflow) {
        setPanelPosition('right');
      } else {
        setPanelPosition('left');
      }
    }
  }, [isExpanded]);

  // 현재 선택된 프리셋 찾기
  const currentPreset = presets.find(preset => 
    preset.startDate === startDate && preset.endDate === endDate
  );

  // 프리셋 선택 핸들러
  const handlePresetSelect = (preset: DatePreset) => {
    setSelectedPreset(preset.id);
    setTempStartDate(preset.startDate);
    setTempEndDate(preset.endDate);
    onDateRangeChange(preset.startDate, preset.endDate);
    setIsExpanded(false);
  };

  // 커스텀 날짜 적용
  const handleCustomApply = () => {
    if (tempStartDate && tempEndDate) {
      onDateRangeChange(tempStartDate, tempEndDate);
      setSelectedPreset('');
      setIsExpanded(false);
    }
  };

  // 리셋 핸들러
  const handleReset = () => {
    setSelectedPreset('');
    setTempStartDate('');
    setTempEndDate('');
    onReset();
    setIsExpanded(false);
  };

  // 현재 필터 상태 표시 텍스트
  const getFilterStatusText = () => {
    if (!startDate || !endDate) {
      return '전체 기간';
    }
    
    if (currentPreset) {
      return currentPreset.label;
    }
    
    const start = new Date(startDate).toLocaleDateString('ko-KR');
    const end = new Date(endDate).toLocaleDateString('ko-KR');
    return `${start} ~ ${end}`;
  };

  // 데이터 범위 미리보기 (예상 데이터 포인트 수)
  const getDataPointsPreview = () => {
    if (!tempStartDate || !tempEndDate) return '';
    
    const start = new Date(tempStartDate);
    const end = new Date(tempEndDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return `약 ${diffDays}일간의 데이터`;
    if (diffDays <= 31) return `약 ${Math.ceil(diffDays / 7)}주간의 데이터`;
    if (diffDays <= 93) return `약 ${Math.ceil(diffDays / 30)}개월간의 데이터`;
    return `약 ${Math.ceil(diffDays / 365)}년간의 데이터`;
  };

  // 패널 위치 클래스 계산
  const getPanelPositionClasses = () => {
    const baseClasses = "absolute top-full mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50";
    
    if (panelPosition === 'right') {
      return `${baseClasses} right-0`;
    } else {
      return `${baseClasses} left-0`;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 필터 버튼 */}
      <button
        ref={buttonRef}
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={isLoading}
        className={`
          flex items-center space-x-2 px-4 py-2.5 bg-white border-2 rounded-lg
          transition-all duration-200 hover:shadow-md
          ${isExpanded ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${(startDate && endDate) ? 'bg-blue-50 border-blue-200' : ''}
        `}
      >
        <IoFunnel className={`w-4 h-4 ${(startDate && endDate) ? 'text-blue-600' : 'text-gray-500'}`} />
        <span className={`text-sm font-medium ${(startDate && endDate) ? 'text-blue-700' : 'text-gray-700'}`}>
          {getFilterStatusText()}
        </span>
        {isLoading && (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
        {(startDate && endDate) && !isLoading && (
          <span className="w-2 h-2 bg-blue-500 rounded-full" />
        )}
      </button>

      {/* 필터 패널 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={getPanelPositionClasses()}
            style={{
              maxWidth: 'calc(100vw - 48px)', // 양쪽 24px 패딩 확보
            }}
          >
            <div className="p-4 space-y-4">
              {/* 헤더 */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">날짜 범위 선택</h3>
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <IoRefresh className="w-4 h-4" />
                  <span>초기화</span>
                </button>
              </div>

              {/* 프리셋 옵션 */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">빠른 선택</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className={`
                        p-3 text-left rounded-lg border transition-all duration-200
                        ${selectedPreset === preset.id || currentPreset?.id === preset.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{preset.label}</span>
                        {(selectedPreset === preset.id || currentPreset?.id === preset.id) && (
                          <IoCheckmark className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                      {preset.description && (
                        <p className="text-xs text-gray-500 mt-1 break-words">{preset.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 커스텀 날짜 선택 */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">직접 선택</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">시작일</label>
                      <input
                        type="date"
                        value={tempStartDate}
                        onChange={(e) => setTempStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">종료일</label>
                      <input
                        type="date"
                        value={tempEndDate}
                        onChange={(e) => setTempEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* 미리보기 */}
                  {tempStartDate && tempEndDate && (
                    <div className="p-2 bg-gray-50 rounded-md">
                      <p className="text-xs text-gray-600">{getDataPointsPreview()}</p>
                    </div>
                  )}

                  <button
                    onClick={handleCustomApply}
                    disabled={!tempStartDate || !tempEndDate}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    적용하기
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 