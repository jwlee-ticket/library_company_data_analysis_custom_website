'use client';

import { useState, useEffect } from 'react';

export interface ApiResponse {
  endpoint: string;
  status: 'loading' | 'success' | 'error';
  data?: any;
  error?: string;
  timestamp?: string;
  duration?: number;
  url?: string;
}

export interface ApiEndpoint {
  name: string;
  method: () => Promise<any>;
  url?: string;
}

interface UseApiDataReturn {
  responses: Record<string, ApiResponse>;
  isLoading: boolean;
  hasErrors: boolean;
  retryAll: () => void;
  retryEndpoint: (endpoint: string) => void;
  addEndpoints: (endpoints: Record<string, ApiEndpoint>) => void;
}

export function useApiData(initialEndpoints: Record<string, ApiEndpoint> = {}): UseApiDataReturn {
  const [responses, setResponses] = useState<Record<string, ApiResponse>>({});
  const [endpoints, setEndpoints] = useState<Record<string, ApiEndpoint>>(initialEndpoints);

  // 개별 API 호출 함수
  const callApi = async (key: string, endpoint: ApiEndpoint) => {
    const startTime = Date.now();
    
    // 로딩 상태 설정
    setResponses(prev => ({
      ...prev,
      [key]: {
        endpoint: endpoint.name,
        status: 'loading',
        timestamp: new Date().toISOString(),
        url: endpoint.url
      }
    }));

    try {
      console.log(`🔄 API 호출 시작 [${endpoint.name}]`);
      const data = await endpoint.method();
      const duration = Date.now() - startTime;

      // 콘솔 성공 로그
      console.log(`✅ API 성공 [${endpoint.name}]:`, {
        endpoint: endpoint.name,
        duration: `${duration}ms`,
        dataSize: Array.isArray(data) ? `${data.length}개 항목` : typeof data === 'object' ? `${Object.keys(data || {}).length}개 속성` : '단일 값',
        timestamp: new Date().toISOString(),
        data: data // 실제 데이터도 콘솔에 출력
      });

      setResponses(prev => ({
        ...prev,
        [key]: {
          endpoint: endpoint.name,
          status: 'success',
          data,
          timestamp: new Date().toISOString(),
          duration,
          url: endpoint.url
        }
      }));

      return { success: true, data };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const errorMessage = error.message || '알 수 없는 오류가 발생했습니다.';
      
      // 콘솔 에러 로그
      console.error(`❌ API 에러 [${endpoint.name}]:`, {
        endpoint: endpoint.name,
        error: errorMessage,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        url: endpoint.url,
        errorType: error.name,
        errorCode: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        fullError: error,
        stack: error.stack
      });
      
      setResponses(prev => ({
        ...prev,
        [key]: {
          endpoint: endpoint.name,
          status: 'error',
          error: errorMessage,
          timestamp: new Date().toISOString(),
          duration,
          url: endpoint.url
        }
      }));

      return { success: false, error };
    }
  };

  // 모든 API 호출
  const fetchAllData = async () => {
    if (Object.keys(endpoints).length === 0) return;
    
    console.log('🚀 API 호출 시작:', Object.keys(endpoints));
    
    // 모든 API를 병렬로 호출
    const promises = Object.entries(endpoints).map(([key, endpoint]) =>
      callApi(key, endpoint)
    );

    const results = await Promise.allSettled(promises);
    
    console.log('✅ API 호출 완료:', results);
  };

  // 개별 API 재시도
  const retryEndpoint = async (key: string) => {
    const endpoint = endpoints[key];
    if (endpoint) {
      await callApi(key, endpoint);
    }
  };

  // 전체 재시도
  const retryAll = () => {
    fetchAllData();
  };

  // 엔드포인트 추가/업데이트
  const addEndpoints = (newEndpoints: Record<string, ApiEndpoint>) => {
    setEndpoints(prev => ({ ...prev, ...newEndpoints }));
  };

  // 엔드포인트 변경 시 데이터 로드
  useEffect(() => {
    if (Object.keys(endpoints).length > 0) {
      fetchAllData();
    }
  }, [endpoints]);

  // 계산된 상태
  const isLoading = Object.values(responses).some(r => r.status === 'loading');
  const hasErrors = Object.values(responses).some(r => r.status === 'error');

  return {
    responses,
    isLoading,
    hasErrors,
    retryAll,
    retryEndpoint,
    addEndpoints
  };
} 