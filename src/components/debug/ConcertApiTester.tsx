'use client';

import { useState } from 'react';
import { ConcertAPI, getEnvironmentInfo, testAPIConnection } from '@/lib/api';

interface ApiTestResult {
  endpoint: string;
  status: 'loading' | 'success' | 'error' | 'idle';
  data?: any;
  error?: string;
  duration?: number;
}

export default function ConcertApiTester() {
  const [results, setResults] = useState<Record<string, ApiTestResult>>({});
  const envInfo = getEnvironmentInfo();

  const updateResult = (endpoint: string, result: Partial<ApiTestResult>) => {
    setResults(prev => ({
      ...prev,
      [endpoint]: { ...prev[endpoint], endpoint, ...result }
    }));
  };

  const testEndpoint = async (endpoint: string, apiCall: () => Promise<any>) => {
    const startTime = Date.now();
    updateResult(endpoint, { status: 'loading' });

    try {
      const data = await apiCall();
      const duration = Date.now() - startTime;
      updateResult(endpoint, {
        status: 'success',
        data,
        duration,
        error: undefined
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateResult(endpoint, {
        status: 'error',
        error: error.message,
        duration,
        data: undefined
      });
    }
  };

  const testConnection = async () => {
    const startTime = Date.now();
    updateResult('connection', { status: 'loading' });

    try {
      const result = await testAPIConnection();
      const duration = Date.now() - startTime;
      updateResult('connection', {
        status: result.success ? 'success' : 'error',
        data: result.data,
        error: result.success ? undefined : result.message,
        duration
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      updateResult('connection', {
        status: 'error',
        error: error.message,
        duration
      });
    }
  };

  const testAllEndpoints = async () => {
    const endpoints = [
      { name: 'daily', call: () => ConcertAPI.getDailyData() },
      { name: 'overview', call: () => ConcertAPI.getOverview() },
      { name: 'bep', call: () => ConcertAPI.getBEP() },
      { name: 'estimated-profit', call: () => ConcertAPI.getEstimatedProfit() },
      { name: 'target-sales', call: () => ConcertAPI.getTargetSales() },
      { name: 'marketing-calendar', call: () => ConcertAPI.getMarketingCalendar() },
    ];

    for (const endpoint of endpoints) {
      await testEndpoint(endpoint.name, endpoint.call);
      // 각 요청 사이에 100ms 딜레이
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const clearResults = () => {
    setResults({});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'loading': return 'text-yellow-600 bg-yellow-50';
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⚪';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🎵 콘서트 API 테스터</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg">
            <span className="font-semibold text-blue-700">환경:</span>
            <span className="ml-2 text-blue-600">{envInfo.environment}</span>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <span className="font-semibold text-green-700">Base URL:</span>
            <span className="ml-2 text-green-600 font-mono text-xs break-all">{envInfo.baseURL}</span>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <span className="font-semibold text-purple-700">Swagger:</span>
            <a 
              href={envInfo.swaggerURL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 text-purple-600 hover:underline text-xs"
            >
              API 문서 보기
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={testConnection}
          disabled={results.connection?.status === 'loading'}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          연결 테스트
        </button>
        <button
          onClick={testAllEndpoints}
          disabled={Object.values(results).some(r => r.status === 'loading')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          전체 API 테스트
        </button>
        <button
          onClick={() => testEndpoint('overview', () => ConcertAPI.getOverview())}
          disabled={results.overview?.status === 'loading'}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          Overview 테스트
        </button>
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          결과 지우기
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(results).map(([endpoint, result]) => (
          <div key={endpoint} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className={`p-4 border-b ${getStatusColor(result.status)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getStatusIcon(result.status)}</span>
                  <span className="font-semibold">
                    {endpoint === 'connection' ? 'API 연결' : `/concert/${endpoint}`}
                  </span>
                </div>
                {result.duration && (
                  <span className="text-xs font-mono bg-white px-2 py-1 rounded">
                    {result.duration}ms
                  </span>
                )}
              </div>
              {result.error && (
                <div className="mt-2 text-sm font-medium text-red-700">
                  ❌ {result.error}
                </div>
              )}
            </div>
            
            {result.data && (
              <div className="p-4 bg-gray-50">
                <div className="mb-2">
                  <span className="text-sm font-semibold text-gray-700">응답 데이터:</span>
                  {Array.isArray(result.data) && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({result.data.length}개 항목)
                    </span>
                  )}
                </div>
                <pre className="bg-white p-3 rounded border text-xs overflow-x-auto max-h-64 overflow-y-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {Object.keys(results).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          위 버튼을 클릭하여 API 테스트를 시작하세요.
        </div>
      )}
    </div>
  );
} 