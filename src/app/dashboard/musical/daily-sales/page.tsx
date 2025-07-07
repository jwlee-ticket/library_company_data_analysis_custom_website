'use client';

import { useState } from 'react';
import * as Select from '@radix-ui/react-select';
import DailySalesTable from '@/components/dashboard/theater/DailySalesTable';

// 임시 데이터
const DUMMY_PERFORMANCES = [
  { id: 1, title: '레미제라블' },
  { id: 2, title: '팬텀 오브 오페라' },
  { id: 3, title: '시카고' },
  { id: 4, title: '맘마미아' },
];

export default function MusicalDailySalesPage() {
  const [selectedPerformance, setSelectedPerformance] = useState(DUMMY_PERFORMANCES[0].id);

  return (
    <div className="p-6 space-y-8 animate-fadeIn">
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          뮤지컬 일간별 판매현황
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="w-full sm:w-64">
            <label className="block text-sm font-semibold text-gray-700 mb-2">공연 선택</label>
            <Select.Root
              value={selectedPerformance.toString()}
              onValueChange={(value) => setSelectedPerformance(Number(value))}
            >
              <Select.Trigger className="inline-flex items-center justify-between w-full px-4 py-2.5 text-sm border rounded-lg shadow-sm border-gray-200 bg-white text-gray-900 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
                <Select.Value>
                  {DUMMY_PERFORMANCES.find(p => p.id === selectedPerformance)?.title}
                </Select.Value>
                <Select.Icon className="ml-2">
                  <ChevronDownIcon />
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Content className="overflow-hidden bg-white rounded-lg shadow-lg border border-gray-200 animate-slideIn">
                  <Select.Viewport className="p-1">
                    {DUMMY_PERFORMANCES.map((performance) => (
                      <Select.Item
                        key={performance.id}
                        value={performance.id.toString()}
                        className="relative flex items-center px-8 py-2.5 text-sm text-gray-900 rounded-md cursor-default select-none hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none transition-colors"
                      >
                        <Select.ItemText>{performance.title}</Select.ItemText>
                        <Select.ItemIndicator className="absolute left-2 inline-flex items-center text-indigo-600">
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
      </div>

      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="border-b border-gray-100 p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="inline-block w-1 h-6 bg-indigo-500 rounded-full"></span>
            일간 판매 현황
          </h2>
        </div>
        <DailySalesTable performanceId={selectedPerformance} />
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