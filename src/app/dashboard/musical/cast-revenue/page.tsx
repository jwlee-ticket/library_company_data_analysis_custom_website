'use client';

import { useState } from 'react';
import * as Select from '@radix-ui/react-select';
import TopBottomCastTable from '@/components/dashboard/theater/TopBottomCastTable';
import AllCastTable from '@/components/dashboard/theater/AllCastTable';

// 임시 데이터
const DUMMY_PERFORMANCES = [
  { id: 1, title: '레미제라블' },
  { id: 2, title: '팬텀 오브 오페라' },
  { id: 3, title: '시카고' },
  { id: 4, title: '맘마미아' },
];

export default function MusicalCastRevenuePage() {
  const [selectedPerformance, setSelectedPerformance] = useState(DUMMY_PERFORMANCES[0].id);

  return (
    <div className="p-6 space-y-8">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          뮤지컬 캐스트별 매출 분석
        </h1>
      </div>

      {/* 공연 선택 섹션 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="w-64">
          <label className="block text-sm font-semibold text-gray-700 mb-2">공연 선택</label>
          <Select.Root
            value={selectedPerformance.toString()}
            onValueChange={(value) => setSelectedPerformance(Number(value))}
          >
            <Select.Trigger className="inline-flex items-center justify-between w-full px-4 py-2.5 text-sm border rounded-lg shadow-sm border-gray-200 bg-white text-gray-900 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200">
              <Select.Value>
                {DUMMY_PERFORMANCES.find(p => p.id === selectedPerformance)?.title}
              </Select.Value>
              <Select.Icon className="ml-2">
                <ChevronDownIcon />
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content className="overflow-hidden bg-white rounded-lg shadow-lg border border-gray-200 animate-fadeIn">
                <Select.Viewport className="p-1">
                  {DUMMY_PERFORMANCES.map((performance) => (
                    <Select.Item
                      key={performance.id}
                      value={performance.id.toString()}
                      className="relative flex items-center px-8 py-2.5 text-sm text-gray-900 rounded-md cursor-default select-none hover:bg-blue-50 focus:bg-blue-100 focus:outline-none transition-colors duration-150"
                    >
                      <Select.ItemText>{performance.title}</Select.ItemText>
                      <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                        <CheckIcon />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>

      {/* 상/하위 5위 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="inline-block w-2 h-6 bg-green-500 rounded mr-3"></span>
            매출 상위 5위
          </h2>
          <TopBottomCastTable 
            performanceId={selectedPerformance} 
            type="top"
          />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="inline-block w-2 h-6 bg-red-500 rounded mr-3"></span>
            매출 하위 5위
          </h2>
          <TopBottomCastTable 
            performanceId={selectedPerformance} 
            type="bottom"
          />
        </div>
      </div>

      {/* 전체 캐스트 섹션 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <span className="inline-block w-2 h-6 bg-blue-500 rounded mr-3"></span>
          전체 캐스트 조합
        </h2>
        <AllCastTable performanceId={selectedPerformance} />
      </div>
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      xmlns="http://www.w3.org/2000/svg"
      className="fill-current"
    >
      <path d="M2.15 4.65c.2-.2.5-.2.7 0L6 7.79l3.15-3.14c.2-.2.5-.2.7 0s.2.51 0 .71l-3.5 3.5c-.2.2-.5.2-.7 0L2.15 5.36c-.2-.2-.2-.52 0-.71z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      xmlns="http://www.w3.org/2000/svg"
      className="fill-current"
    >
      <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
    </svg>
  );
} 