'use client';

import { useState } from 'react';
import Calendar from 'react-calendar';
import { motion } from 'framer-motion';
import 'react-calendar/dist/Calendar.css';

interface MarketingEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  color: string;
  type: 'promotion' | 'discount' | 'collaboration' | 'special';
}

interface MarketingCalendarProps {
  events: MarketingEvent[];
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

export default function MarketingCalendar({ events, selectedMonth, onMonthChange }: MarketingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 이벤트 색상 매핑
  const eventColors = {
    promotion: 'bg-blue-500 text-white',
    discount: 'bg-pink-500 text-white', 
    collaboration: 'bg-orange-500 text-white',
    special: 'bg-green-500 text-white',
  };

  // 특정 날짜의 이벤트 가져오기
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const currentDate = new Date(dateStr);
      
      return currentDate >= eventStart && currentDate <= eventEnd;
    });
  };

  // 캘린더 타일 내용 커스터마이징
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayEvents = getEventsForDate(date);
      
      if (dayEvents.length > 0) {
        return (
          <div className="flex flex-col items-center mt-1 space-y-1">
            {dayEvents.slice(0, 2).map((event, index) => (
              <div
                key={index}
                className={`w-full text-xs px-1 py-0.5 rounded text-center truncate ${eventColors[event.type]}`}
                style={{ fontSize: '8px' }}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">
                +{dayEvents.length - 2}
              </div>
            )}
          </div>
        );
      }
    }
    return null;
  };

  // 캘린더 타일 클래스 커스터마이징
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayEvents = getEventsForDate(date);
      const baseClass = 'h-20 relative p-1';
      
      if (dayEvents.length > 0) {
        return `${baseClass} bg-gray-50`;
      }
      
      return baseClass;
    }
    return '';
  };

  // 전체 일정 요약 - 숫자별 그룹핑
  const getEventSummary = () => {
    const summary: { [key: number]: MarketingEvent[] } = {};
    
    events.forEach((event, index) => {
      const eventNumber = (index % 9) + 1; // 1-9 순환
      if (!summary[eventNumber]) {
        summary[eventNumber] = [];
      }
      summary[eventNumber].push(event);
    });
    
    return summary;
  };

  const eventSummary = getEventSummary();

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6">
        {/* 캘린더 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            {selectedMonth.getFullYear()}년 {selectedMonth.getMonth() + 1}월
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const prevMonth = new Date(selectedMonth);
                prevMonth.setMonth(prevMonth.getMonth() - 1);
                onMonthChange(prevMonth);
              }}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              &#8249;
            </button>
            <button
              onClick={() => {
                const nextMonth = new Date(selectedMonth);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                onMonthChange(nextMonth);
              }}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              &#8250;
            </button>
          </div>
        </div>

        {/* 캘린더 */}
        <div className="marketing-calendar">
          <Calendar
            value={selectedDate}
            onChange={(value) => setSelectedDate(value as Date)}
            activeStartDate={selectedMonth}
            onActiveStartDateChange={({ activeStartDate }) => 
              activeStartDate && onMonthChange(activeStartDate)
            }
            tileContent={tileContent}
            tileClassName={tileClassName}
            showNavigation={false}
            locale="ko-KR"
          />
        </div>

        {/* 전체 일정 섹션 */}
        <div className="mt-8 border-t pt-6">
          <h4 className="text-md font-semibold text-gray-800 mb-4">전체 일정</h4>
          
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(eventSummary).map(([number, eventList]) => (
              <motion.div
                key={number}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: parseInt(number) * 0.05 }}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {number}
                </div>
                <div className="flex-1 min-w-0">
                  {eventList.map((event, index) => (
                    <div key={index} className={`text-xs px-2 py-1 rounded mb-1 ${eventColors[event.type]}`}>
                      {event.title}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 캘린더 커스텀 스타일 */}
      <style jsx global>{`
        .marketing-calendar .react-calendar {
          border: none;
          background: transparent;
          font-family: 'Pretendard', sans-serif;
          width: 100%;
        }
        
        .marketing-calendar .react-calendar__navigation {
          display: none;
        }
        
        .marketing-calendar .react-calendar__month-view__weekdays {
          background-color: #f8fafc;
          padding: 8px 0;
        }
        
        .marketing-calendar .react-calendar__month-view__weekdays__weekday {
          padding: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          text-align: center;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .marketing-calendar .react-calendar__tile {
          border: 1px solid #e5e7eb;
          padding: 4px;
          font-size: 12px;
          background: white;
          transition: all 0.2s;
        }
        
        .marketing-calendar .react-calendar__tile:hover {
          background-color: #f3f4f6;
        }
        
        .marketing-calendar .react-calendar__tile--active {
          background-color: #dbeafe !important;
          color: #1d4ed8;
        }
        
        .marketing-calendar .react-calendar__tile--now {
          background-color: #fef3c7;
          color: #92400e;
        }
        
        .marketing-calendar .react-calendar__month-view__days__day--neighboringMonth {
          color: #d1d5db;
          background-color: #f9fafb;
        }
      `}</style>
    </motion.div>
  );
} 