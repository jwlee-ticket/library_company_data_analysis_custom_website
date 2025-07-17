'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

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
  // 간단한 이벤트 데이터 (날짜별로 정리)
  const marketingEvents = [
    { 
      title: '인터파크 아웃트로 40%', 
      startDate: '2025-04-17', 
      endDate: '2025-04-20', 
      color: 'bg-blue-500',
      category: 'salesMarketing'
    },
    { 
      title: '메조 타입캐스팅 40%', 
      startDate: '2025-04-21', 
      endDate: '2025-04-22', 
      color: 'bg-pink-500',
      category: 'promotion'
    },
    { 
      title: '세계적인출장의', 
      startDate: '2025-04-23', 
      endDate: '2025-04-23', 
      color: 'bg-orange-500',
      category: 'etc'
    },
    { 
      title: '인터파크 놀이스타', 
      startDate: '2025-04-25', 
      endDate: '2025-04-28', 
      color: 'bg-green-500',
      category: 'salesMarketing'
    },
    { 
      title: '바오밥 WEEK', 
      startDate: '2025-04-29', 
      endDate: '2025-05-04', 
      color: 'bg-purple-500',
      category: 'special'
    }
  ];

  // 2025년 4월 캘린더 생성
  const generateCalendar = () => {
    const year = 2025;
    const month = 3; // 4월 (0부터 시작)
    const firstDay = new Date(year, month, 1).getDay(); // 4월 1일의 요일
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // 4월의 총 일수
    const days = [];

    // 이전 달 마지막 날들 채우기
    const prevMonth = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: prevMonth - i,
        fullDate: new Date(year, month - 1, prevMonth - i).toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: false
      });
    }

    // 현재 달 날들 채우기
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      days.push({
        date: day,
        fullDate: currentDate.toISOString().split('T')[0],
        isCurrentMonth: true,
        isToday: currentDate.toDateString() === new Date().toDateString()
      });
    }

    // 다음 달 시작 날들 채우기 (총 42개 칸 맞추기)
    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        date: day,
        fullDate: new Date(year, month + 1, day).toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  };

  // 특정 날짜가 연속 이벤트에 포함되는지 확인
  const isDateInContinuousEvent = (dateStr: string) => {
    return marketingEvents.some(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const currentDate = new Date(dateStr);
      
      // 이벤트가 2일 이상인 경우만 연속 이벤트로 간주
      const daysDiff = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff >= 1 && currentDate >= eventStart && currentDate <= eventEnd;
    });
  };

  // 특정 날짜의 단일 이벤트 가져오기 (연속 이벤트 제외)
  const getSingleEventsForDate = (dateStr: string) => {
    return marketingEvents.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const currentDate = new Date(dateStr);
      
      // 단일 이벤트만 반환 (연속 이벤트는 제외)
      const daysDiff = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff === 0 && currentDate >= eventStart && currentDate <= eventEnd;
    });
  };

  // 연속 이벤트 바 계산
  const calculateEventBars = () => {
    const calendarDays = generateCalendar();
    const eventBars: any[] = [];

    marketingEvents.forEach((event, eventIndex) => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      
      // 2일 이상인 이벤트만 연속 바로 표시
      const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff < 1) return;
      
      const bars: any[] = [];
      let currentStart: number | null = null;
      let currentLength = 0;
      let currentWeek = -1;

      calendarDays.forEach((day, dayIndex) => {
        const dayDate = new Date(day.fullDate);
        const weekIndex = Math.floor(dayIndex / 7);
        const dayOfWeek = dayIndex % 7;

        if (dayDate >= startDate && dayDate <= endDate) {
          if (currentStart === null || weekIndex !== currentWeek) {
            if (currentStart !== null) {
              bars.push({
                weekIndex: currentWeek,
                startCol: currentStart,
                length: currentLength
              });
            }
            currentStart = dayOfWeek;
            currentLength = 1;
            currentWeek = weekIndex;
          } else {
            currentLength++;
          }
        }
      });

      if (currentStart !== null) {
        bars.push({
          weekIndex: currentWeek,
          startCol: currentStart,
          length: currentLength
        });
      }

      eventBars.push({
        event,
        bars,
        level: eventIndex % 2 // 최대 2개 레벨
      });
    });

    return eventBars;
  };

  const calendarDays = generateCalendar();
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const eventBars = calculateEventBars();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
    >
      {/* 캘린더 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">마케팅 캘린더</h3>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-medium text-gray-900 mx-4">2025년 4월</span>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div 
            key={day} 
            className={`h-10 flex items-center justify-center text-sm font-medium ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div className="relative">
        <div className="grid grid-cols-7 gap-1">
          {weeks.map((week, weekIndex) =>
            week.map((day, dayIndex) => {
              const isContinuous = isDateInContinuousEvent(day.fullDate);
              const singleEvents = getSingleEventsForDate(day.fullDate);
              
              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`h-24 p-1 border rounded-lg transition-colors relative ${
                    !day.isCurrentMonth 
                      ? 'bg-gray-50 text-gray-400 border-gray-200' 
                      : day.isToday
                      ? 'bg-blue-50 border-blue-300 text-gray-900'
                      : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {/* 날짜 숫자 */}
                  <div className={`text-sm font-medium mb-1 ${
                    !day.isCurrentMonth ? 'text-gray-400' : 
                    day.isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {day.date}
                  </div>

                  {/* 단일 이벤트 표시 (연속 이벤트가 없는 경우만) */}
                  {!isContinuous && singleEvents.length > 0 && (
                    <div className="space-y-0.5">
                      {singleEvents.slice(0, 2).map((event, index) => (
                        <div
                          key={index}
                          className={`${event.color} text-white text-xs px-1 py-0.5 rounded truncate`}
                          title={`${event.title} (${event.startDate})`}
                        >
                          {event.title.length > 8 ? `${event.title.substring(0, 8)}...` : event.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 연속 이벤트 바 오버레이 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {eventBars.map((eventBar: any, index: number) => 
            eventBar.bars.map((bar: any, barIndex: number) => {
              // 캘린더 그리드의 실제 크기에 맞춰 위치 계산
              const cellWidth = 100 / 7; // 각 셀의 너비 (%)
              const cellHeight = 96; // h-24 = 96px
              const gap = 4; // gap-1 = 4px
              const totalGridWidth = 100; // 전체 그리드 너비 (%)
              
              // 실제 픽셀 기반 계산
              const leftPercent = (bar.startCol * cellWidth) + (bar.startCol * 0.6); // gap 보정
              const widthPercent = (bar.length * cellWidth) - 0.6; // gap 보정
              const topPixels = 32 + (bar.weekIndex * (cellHeight + gap)) + (eventBar.level * 22); // 날짜 영역 아래에 위치
              
              return (
                <div
                  key={`${index}-${barIndex}`}
                  className={`absolute ${eventBar.event.color} bg-opacity-90 text-white text-xs px-2 py-1 rounded-lg flex items-center justify-center font-medium shadow-sm`}
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPixels}px`,
                    width: `${widthPercent}%`,
                    height: '20px',
                    zIndex: 10,
                    maxWidth: '100%' // 영역을 벗어나지 않도록 제한
                  }}
                  title={`${eventBar.event.title} (${eventBar.event.startDate} ~ ${eventBar.event.endDate})`}
                >
                  <span className="truncate">
                    {bar.length >= 2 ? eventBar.event.title : eventBar.event.title.substring(0, 3)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
} 