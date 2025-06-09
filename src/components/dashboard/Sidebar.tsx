'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface DropdownProps {
  title: string;
  items: { name: string; href: string }[];
  isOpen: boolean;
  onToggle: () => void;
  currentPath: string;
}

function Dropdown({ title, items, isOpen, onToggle, currentPath }: DropdownProps) {
  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2 text-white hover:bg-gray-700 rounded transition-colors duration-200"
      >
        <span>{title}</span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-4 mt-2 space-y-1">
              {items.map((item, index) => {
                const isActive = currentPath === item.href;
                return (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={`block px-4 py-2 text-sm rounded transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    theater: false,
    musical: false,
    concert: false,
  });

  // useState를 useEffect로 수정
  useEffect(() => {
    const path = pathname || '';
    if (path.includes('/theater')) {
      setOpenMenus(prev => ({ ...prev, theater: true }));
    } else if (path.includes('/musical')) {
      setOpenMenus(prev => ({ ...prev, musical: true }));
    } else if (path.includes('/concert')) {
      setOpenMenus(prev => ({ ...prev, concert: true }));
    }
  }, [pathname]); // pathname이 변경될 때마다 실행

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const theaterItems = [
    { name: '통합 티켓 판매합계 : 총계', href: '/dashboard/theater/total-sales' },
    { name: '통합 주간별 티켓 매수', href: '/dashboard/theater/weekly-tickets' },
    { name: '월별 통합 매출', href: '/dashboard/theater/monthly-revenue' },
    { name: '기간별 통합 매출', href: '/dashboard/theater/period-revenue' },
    { name: '주간별 통합 매출', href: '/dashboard/theater/weekly-revenue' },
    { name: '일간별 판매현황', href: '/dashboard/theater/daily-sales' },
    { name: '캐스트별 매출', href: '/dashboard/theater/cast-revenue' },
  ];

  const musicalItems = [
    { name: '통합 티켓 판매합계 : 총계', href: '/dashboard/musical/total-sales' },
    { name: '통합 주간별 티켓 매수', href: '/dashboard/musical/weekly-tickets' },
    { name: '월별 통합 매출', href: '/dashboard/musical/monthly-revenue' },
    { name: '기간별 통합 매출', href: '/dashboard/musical/period-revenue' },
    { name: '주간별 통합 매출', href: '/dashboard/musical/weekly-revenue' },
    { name: '일간별 판매현황', href: '/dashboard/musical/daily-sales' },
    { name: '캐스트별 매출', href: '/dashboard/musical/cast-revenue' },
  ];

  const concertItems = [
    { name: '통합현황', href: '/dashboard/concert/overview' },
    { name: '개별현황', href: '/dashboard/concert/individual' },
  ];

  const isHome = pathname === '/dashboard';

  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-4">
      <div className="text-2xl font-bold mb-8">MVP 버전</div>
      <nav className="space-y-2">
        <Link
          href="/dashboard"
          className={`block px-4 py-2 rounded ${
            isHome ? 'bg-blue-600 text-white' : 'text-white hover:bg-gray-700'
          }`}
        >
          전체
        </Link>
        
        <Dropdown
          title="연극"
          items={theaterItems}
          isOpen={openMenus.theater}
          onToggle={() => toggleMenu('theater')}
          currentPath={pathname}
        />
        
        <Dropdown
          title="뮤지컬"
          items={musicalItems}
          isOpen={openMenus.musical}
          onToggle={() => toggleMenu('musical')}
          currentPath={pathname}
        />
        
        <Dropdown
          title="콘서트"
          items={concertItems}
          isOpen={openMenus.concert}
          onToggle={() => toggleMenu('concert')}
          currentPath={pathname}
        />
      </nav>
    </div>
  );
} 