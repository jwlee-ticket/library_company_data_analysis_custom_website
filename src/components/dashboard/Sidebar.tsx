'use client';

import Link from 'next/link';
import { useState } from 'react';

interface DropdownProps {
  title: string;
  items: { name: string; href: string }[];
  isOpen: boolean;
  onToggle: () => void;
}

function Dropdown({ title, items, isOpen, onToggle }: DropdownProps) {
  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2 text-white hover:bg-gray-700 rounded"
      >
        <span>{title}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="ml-4 mt-2 space-y-1">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded"
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    theater: false,
    musical: false,
    concert: false,
  });

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const theaterItems = [
    { name: '통합 티켓 판매합계 : 총계', href: '/dashboard/theater/total-sales' },
    { name: '통합 주간별 티켓 매수', href: '/dashboard/theater/weekly-tickets' },
    { name: '월별 통합 매출', href: '/dashboard/theater/monthly-sales' },
    { name: '기간별 통합 매출', href: '/dashboard/theater/period-sales' },
    { name: '주간별 통합 매출', href: '/dashboard/theater/weekly-sales' },
    { name: '일간별 판매현황', href: '/dashboard/theater/daily-sales' },
    { name: '캐스트별 매출', href: '/dashboard/theater/cast-sales' },
  ];

  const musicalItems = [
    { name: '통합 티켓 판매합계 : 총계', href: '/dashboard/musical/total-sales' },
    { name: '통합 주간별 티켓 매수', href: '/dashboard/musical/weekly-tickets' },
    { name: '월별 통합 매출', href: '/dashboard/musical/monthly-sales' },
    { name: '기간별 통합 매출', href: '/dashboard/musical/period-sales' },
    { name: '주간별 통합 매출', href: '/dashboard/musical/weekly-sales' },
    { name: '일간별 판매현황', href: '/dashboard/musical/daily-sales' },
    { name: '캐스트별 매출', href: '/dashboard/musical/cast-sales' },
  ];

  const concertItems = [
    { name: '통합현황', href: '/dashboard/concert/overview' },
    { name: '개별현황', href: '/dashboard/concert/individual' },
  ];

  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <div className="text-2xl font-bold mb-8">데이터 대시보드</div>
      <nav className="space-y-2">
        <Link href="/dashboard" className="block px-4 py-2 text-white hover:bg-gray-700 rounded">
          전체
        </Link>
        
        <Dropdown
          title="연극"
          items={theaterItems}
          isOpen={openMenus.theater}
          onToggle={() => toggleMenu('theater')}
        />
        
        <Dropdown
          title="뮤지컬"
          items={musicalItems}
          isOpen={openMenus.musical}
          onToggle={() => toggleMenu('musical')}
        />
        
        <Dropdown
          title="콘서트"
          items={concertItems}
          isOpen={openMenus.concert}
          onToggle={() => toggleMenu('concert')}
        />
      </nav>
    </div>
  );
} 