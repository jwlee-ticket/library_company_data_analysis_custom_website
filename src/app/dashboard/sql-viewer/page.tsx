'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApiDataViewer from '@/components/debug/ApiDataViewer';

// API 타입 정의
interface TableSchema {
  tableName: string;
  columns: {
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string | null;
    key_type: string | null;
    references_table: string | null;
    references_column: string | null;
  }[];
}

interface RelationshipResponse {
  source_table: string;
  source_column: string;
  target_table: string;
  target_column: string;
  constraint_name: string;
}

interface TableDetailResponse {
  tableName: string;
  columns: {
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string | null;
    character_maximum_length: number | null;
    numeric_precision: number | null;
    numeric_scale: number | null;
  }[];
  constraints: {
    constraint_name: string;
    constraint_type: string;
    column_name: string;
    foreign_table_name: string | null;
    foreign_column_name: string | null;
  }[];
}

interface QueryResult {
  success: boolean;
  results?: any[];
  rowCount?: number;
  executionTime?: number;
  error?: string;
  code?: string;
}

interface ApiResponse {
  endpoint: string;
  status: 'loading' | 'success' | 'error';
  data?: any;
  error?: string;
  timestamp?: string;
  duration?: number;
  url?: string;
}

// 에러 코드별 메시지 매핑
const getErrorMessage = (error: string, code?: string) => {
  switch (code) {
    case 'INVALID_QUERY_TYPE':
      return 'SELECT 문만 사용할 수 있습니다.';
    case 'DANGEROUS_KEYWORD':
      return '데이터 수정 쿼리는 사용할 수 없습니다. 조회 쿼리만 사용해주세요.';
    case 'EXECUTION_TIMEOUT':
      return '쿼리 실행 시간이 초과되었습니다. 조건을 추가하여 범위를 줄여보세요.';
    case 'SYNTAX_ERROR':
      return 'SQL 문법에 오류가 있습니다. 쿼리를 다시 확인해주세요.';
    case 'OBJECT_NOT_FOUND':
      return '존재하지 않는 테이블 또는 컬럼입니다.';
    case 'PERMISSION_DENIED':
      return '해당 테이블에 접근 권한이 없습니다.';
    default:
      return `${error}`;
  }
};

// 컬럼 타입별 아이콘
const getColumnTypeIcon = (dataType: string) => {
  if (dataType.includes('integer') || dataType.includes('bigint') || dataType.includes('numeric')) return 'N';
  if (dataType.includes('character') || dataType.includes('text') || dataType.includes('varchar')) return 'T';
  if (dataType.includes('boolean')) return 'B';
  if (dataType.includes('timestamp') || dataType.includes('date')) return 'D';
  if (dataType.includes('ARRAY') || dataType.includes('array')) return 'A';
  if (dataType.includes('json')) return 'J';
  return '?';
};

// 기본 조회 예제 쿼리들
const BASIC_EXAMPLE_QUERIES = [
  {
    name: '사용자 목록',
    query: 'SELECT id, email, name, role FROM user_model LIMIT 10;',
    description: '사용자 기본 정보 조회'
  },
  {
    name: '활성 공연 목록', 
    query: 'SELECT "liveId", "liveName", category, "isLive" FROM live_model WHERE "isLive" = true LIMIT 10;',
    description: '현재 진행 중인 공연 목록'
  },
  {
    name: '최근 파일 업로드',
    query: 'SELECT "fileName", "recordDate", "uploadDate" FROM file_upload_model ORDER BY "uploadDate" DESC LIMIT 10;',
    description: '최근 업로드된 파일 목록'
  },
  {
    name: '일일 매출 현황',
    query: 'SELECT "liveName", "티켓판매일매출", "latestRecordDate" FROM view_llm_play_daily WHERE "티켓판매일매출" > 1000000 ORDER BY "티켓판매일매출" DESC LIMIT 10;',
    description: '매출 100만원 이상 공연 조회'
  }
];

export default function SqlViewerPage() {
  const [sqlQuery, setSqlQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [executionInfo, setExecutionInfo] = useState<{rowCount: number, executionTime: number} | null>(null);

  // 스키마 브라우저 상태
  const [showSchemaBrowser, setShowSchemaBrowser] = useState(false);
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableDetail, setTableDetail] = useState<TableDetailResponse | null>(null);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [loadingTableDetail, setLoadingTableDetail] = useState(false);

  // 자동완성 상태
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [suggestionPosition, setSuggestionPosition] = useState({ x: 0, y: 0 });

  // 관계 시각화 상태
  const [showRelationships, setShowRelationships] = useState(false);
  const [relationships, setRelationships] = useState<RelationshipResponse[]>([]);
  const [loadingRelationships, setLoadingRelationships] = useState(false);

  // API 응답 추적 상태
  const [apiResponses, setApiResponses] = useState<Record<string, ApiResponse>>({});

  // URL 파라미터에서 쿼리 확인 및 자동 실행
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('query');
    
    if (queryParam) {
      // URL에서 전달된 쿼리를 디코딩하여 설정
      const decodedQuery = decodeURIComponent(queryParam);
      setSqlQuery(decodedQuery);
      
      // 스키마가 로드된 후 자동으로 쿼리 실행
      const timer = setTimeout(() => {
        if (decodedQuery.trim()) {
          executeQueryWithValue(decodedQuery);
        }
      }, 1000); // 스키마 로드를 위한 짧은 지연
      
      return () => clearTimeout(timer);
    }
  }, []);

  // API URL 설정 (Next.js API Routes 프록시 사용)
  const getApiUrl = () => {
    return '/api';
  };

  // 스키마 정보 로드
  const loadSchema = async () => {
    setLoadingSchema(true);
    const startTime = Date.now();
    const endpoint = 'schema';
    
    // API 호출 시작 추적
    setApiResponses(prev => ({
      ...prev,
      [endpoint]: {
        endpoint,
        status: 'loading',
        timestamp: new Date().toISOString(),
        url: `${getApiUrl()}/sql-execute/schema`
      }
    }));

    try {
      const response = await fetch(`${getApiUrl()}/sql-execute/schema`);
      const duration = Date.now() - startTime;
      
      if (!response.ok) throw new Error('스키마 정보 조회 실패');
      const schemaData: TableSchema[] = await response.json();
      setSchema(schemaData);
      
      // API 성공 추적
      setApiResponses(prev => ({
        ...prev,
        [endpoint]: {
          endpoint,
          status: 'success',
          data: schemaData,
          timestamp: new Date().toISOString(),
          duration,
          url: `${getApiUrl()}/sql-execute/schema`
        }
      }));
    } catch (err) {
      const duration = Date.now() - startTime;
      console.error('스키마 로드 실패:', err);
      setError('스키마 정보를 불러올 수 없습니다.');
      
      // API 에러 추적
      setApiResponses(prev => ({
        ...prev,
        [endpoint]: {
          endpoint,
          status: 'error',
          error: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString(),
          duration,
          url: `${getApiUrl()}/sql-execute/schema`
        }
      }));
    } finally {
      setLoadingSchema(false);
    }
  };

  // 특정 테이블 상세 정보 로드
  const loadTableDetail = async (tableName: string) => {
    setSelectedTable(tableName);
    setLoadingTableDetail(true);
    try {
      const response = await fetch(`${getApiUrl()}/sql-execute/table/${tableName}`);
      if (!response.ok) throw new Error(`테이블 ${tableName} 정보 조회 실패`);
      const detail: TableDetailResponse = await response.json();
      setTableDetail(detail);
    } catch (err) {
      console.error('테이블 상세 정보 로드 실패:', err);
      setError('테이블 상세 정보를 불러올 수 없습니다.');
    } finally {
      setLoadingTableDetail(false);
    }
  };

  // 관계 정보 로드
  const loadRelationships = async () => {
    setLoadingRelationships(true);
    try {
      const response = await fetch(`${getApiUrl()}/sql-execute/relationships`);
      if (!response.ok) throw new Error('관계 정보 조회 실패');
      const relationshipData: RelationshipResponse[] = await response.json();
      setRelationships(relationshipData);
    } catch (err) {
      console.error('관계 정보 로드 실패:', err);
      setError('관계 정보를 불러올 수 없습니다.');
    } finally {
      setLoadingRelationships(false);
    }
  };

  // 페이지 로드 시 자동으로 스키마 정보 로드 (자동완성 지원용)
  useEffect(() => {
    loadSchema();
  }, []);

  // 스키마 브라우저 토글 시 스키마 로드
  useEffect(() => {
    if (showSchemaBrowser && schema.length === 0) {
      loadSchema();
    }
  }, [showSchemaBrowser]);

  // 관계 시각화 토글 시 관계 정보 로드
  useEffect(() => {
    if (showRelationships && relationships.length === 0) {
      loadRelationships();
    }
  }, [showRelationships]);

  // SQL 쿼리 실행
  const executeQuery = async () => {
    if (!sqlQuery.trim()) {
      setError('SQL 쿼리를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults([]);
    setExecutionInfo(null);

    const startTime = Date.now();
    const endpoint = 'sql-execute';
    
    // API 호출 시작 추적
    setApiResponses(prev => ({
      ...prev,
      [endpoint]: {
        endpoint,
        status: 'loading',
        timestamp: new Date().toISOString(),
        url: `${getApiUrl()}/sql-execute`
      }
    }));

    try {
      const response = await fetch(`${getApiUrl()}/sql-execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sqlQuery }),
      });

      const duration = Date.now() - startTime;
      const data: QueryResult = await response.json();

      if (data.success) {
        setResults(data.results || []);
        setExecutionInfo({
          rowCount: data.rowCount || 0,
          executionTime: data.executionTime || 0
        });
        setError('');
        
        // API 성공 추적
        setApiResponses(prev => ({
          ...prev,
          [endpoint]: {
            endpoint,
            status: 'success',
            data: data,
            timestamp: new Date().toISOString(),
            duration,
            url: `${getApiUrl()}/sql-execute`
          }
        }));
      } else {
        setError(getErrorMessage(data.error || '쿼리 실행 중 오류가 발생했습니다.', data.code));
        setResults([]);
        setExecutionInfo(null);
        
        // API 에러 추적
        setApiResponses(prev => ({
          ...prev,
          [endpoint]: {
            endpoint,
            status: 'error',
            error: data.error || '쿼리 실행 중 오류가 발생했습니다.',
            timestamp: new Date().toISOString(),
            duration,
            url: `${getApiUrl()}/sql-execute`
          }
        }));
      }
    } catch (err) {
      const duration = Date.now() - startTime;
      console.error('API 호출 오류:', err);
      setError('서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.');
      setResults([]);
      setExecutionInfo(null);
      
      // API 에러 추적
      setApiResponses(prev => ({
        ...prev,
        [endpoint]: {
          endpoint,
          status: 'error',
          error: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString(),
          duration,
          url: `${getApiUrl()}/sql-execute`
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // 특정 쿼리 값으로 실행 (URL 파라미터용)
  const executeQueryWithValue = async (queryValue: string) => {
    if (!queryValue.trim()) return;

    setIsLoading(true);
    setError('');
    setResults([]);
    setExecutionInfo(null);

    const startTime = Date.now();
    const endpoint = 'sql-execute-param';
    
    // API 호출 시작 추적
    setApiResponses(prev => ({
      ...prev,
      [endpoint]: {
        endpoint,
        status: 'loading',
        timestamp: new Date().toISOString(),
        url: `${getApiUrl()}/sql-execute`
      }
    }));

    try {
      const response = await fetch(`${getApiUrl()}/sql-execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: queryValue }),
      });

      const duration = Date.now() - startTime;
      const data: QueryResult = await response.json();

      if (data.success) {
        setResults(data.results || []);
        setExecutionInfo({
          rowCount: data.rowCount || 0,
          executionTime: data.executionTime || 0
        });
        setError('');
        
        // API 성공 추적
        setApiResponses(prev => ({
          ...prev,
          [endpoint]: {
            endpoint,
            status: 'success',
            data: data,
            timestamp: new Date().toISOString(),
            duration,
            url: `${getApiUrl()}/sql-execute`
          }
        }));
      } else {
        setError(getErrorMessage(data.error || '쿼리 실행 중 오류가 발생했습니다.', data.code));
        setResults([]);
        setExecutionInfo(null);
        
        // API 에러 추적
        setApiResponses(prev => ({
          ...prev,
          [endpoint]: {
            endpoint,
            status: 'error',
            error: data.error || '쿼리 실행 중 오류가 발생했습니다.',
            timestamp: new Date().toISOString(),
            duration,
            url: `${getApiUrl()}/sql-execute`
          }
        }));
      }
    } catch (err) {
      const duration = Date.now() - startTime;
      console.error('API 호출 오류:', err);
      setError('서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.');
      setResults([]);
      setExecutionInfo(null);
      
      // API 에러 추적
      setApiResponses(prev => ({
        ...prev,
        [endpoint]: {
          endpoint,
          status: 'error',
          error: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString(),
          duration,
          url: `${getApiUrl()}/sql-execute`
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // 예제 쿼리 설정
  const setExampleQuery = (query: string) => {
    setSqlQuery(query);
  };

  // SQL 자동완성 로직
  const generateSuggestions = (query: string, cursorPos: number): string[] => {
    if (schema.length === 0) return [];

    const beforeCursor = query.substring(0, cursorPos).toLowerCase();
    const words = beforeCursor.split(/\s+/);
    const lastWord = words[words.length - 1] || '';
    const secondLastWord = words[words.length - 2] || '';

    const suggestions: string[] = [];

    // FROM 다음에 테이블명 제안
    if (secondLastWord === 'from' || lastWord === 'from') {
      const tableNames = schema.map(t => t.tableName);
      suggestions.push(...tableNames.filter(name => 
        name.toLowerCase().includes(lastWord) && name !== lastWord
      ));
    }

    // JOIN 다음에 테이블명 제안
    if (secondLastWord === 'join' || lastWord === 'join' || 
        secondLastWord.includes('join') || lastWord.includes('join')) {
      const tableNames = schema.map(t => t.tableName);
      suggestions.push(...tableNames.filter(name => 
        name.toLowerCase().includes(lastWord) && name !== lastWord
      ));
    }

    // SELECT 다음에 컬럼명 제안
    if (beforeCursor.includes('select') && !beforeCursor.includes('from')) {
      const allColumns = schema.flatMap(table => 
        table.columns.map(col => {
          // 특수 문자가 있는 컬럼명은 따옴표로 감싸기
          const needsQuotes = /[^a-zA-Z0-9_]/.test(col.column_name);
          return needsQuotes ? `"${col.column_name}"` : col.column_name;
        })
      );
      suggestions.push(...allColumns.filter(col => 
        col.toLowerCase().includes(lastWord) && col !== lastWord
      ));
    }

    // WHERE 절에서 컬럼명 제안
    if (beforeCursor.includes('where') || lastWord === 'where') {
      // FROM 절에서 테이블 추출
      const fromMatch = beforeCursor.match(/from\s+(\w+)/);
      if (fromMatch) {
        const tableName = fromMatch[1];
        const table = schema.find(t => t.tableName === tableName);
        if (table) {
          const columns = table.columns.map(col => {
            const needsQuotes = /[^a-zA-Z0-9_]/.test(col.column_name);
            return needsQuotes ? `"${col.column_name}"` : col.column_name;
          });
          suggestions.push(...columns.filter(col => 
            col.toLowerCase().includes(lastWord) && col !== lastWord
          ));
        }
      }
    }

    // SQL 키워드 제안
    const sqlKeywords = [
      'SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING',
      'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN',
      'ON', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
      'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'DISTINCT',
      'LIMIT', 'OFFSET', 'ASC', 'DESC'
    ];

    if (lastWord.length > 0) {
      suggestions.push(...sqlKeywords.filter(keyword => 
        keyword.toLowerCase().startsWith(lastWord) && keyword.toLowerCase() !== lastWord
      ));
    }

    // 중복 제거하고 최대 10개만 반환
    return [...new Set(suggestions)].slice(0, 10);
  };

  // 자동완성 제안 적용
  const applySuggestion = (suggestion: string) => {
    const beforeCursor = sqlQuery.substring(0, cursorPosition);
    const afterCursor = sqlQuery.substring(cursorPosition);
    const words = beforeCursor.split(/\s+/);
    
    // 마지막 단어 교체
    if (words.length > 0) {
      words[words.length - 1] = suggestion;
      const newQuery = words.join(' ') + ' ' + afterCursor;
      setSqlQuery(newQuery);
      setShowSuggestions(false);
    }
  };

  // 쿼리 변경 시 자동완성 처리
  const handleQueryChange = (newQuery: string, newCursorPos?: number) => {
    setSqlQuery(newQuery);
    const pos = newCursorPos ?? newQuery.length;
    setCursorPosition(pos);

    if (newQuery.trim() && schema.length > 0) {
      const newSuggestions = generateSuggestions(newQuery, pos);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  // 테이블명을 쿼리에 삽입
  const insertTableName = (tableName: string) => {
    setSqlQuery(prev => {
      const cursorPos = prev.length;
      return prev + (prev.endsWith(' ') ? '' : ' ') + tableName + ' ';
    });
  };

  const clearQuery = () => {
    setSqlQuery('');
    setResults([]);
    setError('');
    setExecutionInfo(null);
  };

  // CSV 다운로드 함수
  const downloadExcel = () => {
    if (results.length === 0) {
      alert('다운로드할 데이터가 없습니다.');
      return;
    }

    try {
      // CSV 문자열 생성 함수
      const convertToCSV = (data: any[]) => {
        if (data.length === 0) return '';
        
        // 헤더 추출
        const headers = Object.keys(data[0]);
        
        // CSV 값 이스케이프 함수
        const escapeCSVValue = (value: any) => {
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          // 쉼표, 따옴표, 줄바꿈이 포함된 경우 따옴표로 감싸기
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        };
        
        // 헤더 행 생성
        const headerRow = headers.map(escapeCSVValue).join(',');
        
        // 데이터 행들 생성
        const dataRows = data.map(row => 
          headers.map(header => escapeCSVValue(row[header])).join(',')
        );
        
        return [headerRow, ...dataRows].join('\n');
      };
      
      // CSV 데이터 생성
      const csvContent = convertToCSV(results);
      
      // 현재 날짜시간으로 파일명 생성
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const fileName = `SQL_결과_${dateStr}.csv`;
      
      // UTF-8 BOM 추가 (엑셀에서 한글 깨짐 방지)
      const BOM = '\uFEFF';
      
      // Blob 생성
      const blob = new Blob([BOM + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      
      // 안전한 다운로드
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // 메모리 정리
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error('CSV 다운로드 오류:', error);
      alert('CSV 다운로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* 페이지 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            SQL Viewer
          </h1>
          <p className="text-gray-600">
            Library DB 쿼리 실행 및 결과 조회
          </p>
        </motion.div>

        {/* 예제 쿼리 섹션 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">기본 조회 예제</h2>
          <div className="flex flex-wrap gap-2">
            {BASIC_EXAMPLE_QUERIES.map((example, index) => (
              <div key={index} className="group relative">
                <button
                  onClick={() => setExampleQuery(example.query)}
                  className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  {example.name}
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {example.description}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* SQL 입력 섹션 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-gray-900">SQL 쿼리 입력</h2>
            <div className="group relative">
              <button className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-300 transition-colors">
                ?
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 p-4 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                <div className="space-y-3">
                  <div>
                    <div className="font-semibold text-yellow-300 mb-1">허용되는 쿼리</div>
                    <div>• SELECT 문만 허용</div>
                    <div>• JOIN, WHERE, ORDER BY 등 조회 절 사용 가능</div>
                    <div>• 집계 함수 사용 가능 (COUNT, SUM, AVG 등)</div>
                  </div>
                  <div>
                    <div className="font-semibold text-red-300 mb-1">차단되는 쿼리</div>
                    <div>• 데이터 수정: INSERT, UPDATE, DELETE</div>
                    <div>• 구조 변경: DROP, CREATE, ALTER</div>
                    <div>• 실행 관련: EXEC, PROCEDURE</div>
                  </div>
                  <div>
                    <div className="font-semibold text-blue-300 mb-1">자동 제한사항</div>
                    <div>• 최대 1000행 조회 (LIMIT 자동 추가)</div>
                    <div>• 30초 실행 시간 제한</div>
                    <div>• 최대 5000자 쿼리 크기</div>
                  </div>
                  <div>
                    <div className="font-semibold text-green-300 mb-1">고급 기능</div>
                    <div>• SQL 자동완성으로 빠른 쿼리 작성</div>
                    <div>• 스키마 브라우저로 테이블 구조 확인</div>
                    <div>• 관계 시각화로 테이블 간 연관성 파악</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="sql-query" className="block text-sm font-medium text-gray-700 mb-2">
                SQL 쿼리 (SELECT 문만 허용)
                {loadingSchema ? (
                  <span className="ml-2 text-xs text-gray-500">자동완성 로딩 중...</span>
                ) : schema.length > 0 ? (
                  <span className="ml-2 text-xs text-blue-600">자동완성 지원</span>
                ) : (
                  <span className="ml-2 text-xs text-red-500">자동완성 로드 실패</span>
                )}
              </label>
              <div className="relative">
                <textarea
                  id="sql-query"
                  value={sqlQuery}
                  onChange={(e) => {
                    const textarea = e.target as HTMLTextAreaElement;
                    handleQueryChange(e.target.value, textarea.selectionStart);
                  }}
                  onKeyDown={(e) => {
                    if (showSuggestions) {
                      if (e.key === 'Escape') {
                        setShowSuggestions(false);
                        e.preventDefault();
                      } else if (e.key === 'Tab' && suggestions.length > 0) {
                        applySuggestion(suggestions[0]);
                        e.preventDefault();
                      }
                    }
                  }}
                  onBlur={() => {
                    // 약간의 지연을 두어 클릭 이벤트가 먼저 처리되도록 함
                    setTimeout(() => setShowSuggestions(false), 150);
                  }}
                  onFocus={() => {
                    if (sqlQuery.trim() && schema.length > 0) {
                      const newSuggestions = generateSuggestions(sqlQuery, cursorPosition);
                      if (newSuggestions.length > 0) {
                        setSuggestions(newSuggestions);
                        setShowSuggestions(true);
                      }
                    }
                  }}
                  placeholder="SELECT * FROM user_model LIMIT 10;"
                  className="w-full h-48 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                
                {/* 자동완성 드롭다운 */}
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-4 right-4 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto"
                  >
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => applySuggestion(suggestion)}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 font-mono text-sm border-b last:border-b-0 border-gray-100"
                      >
                        <span className="text-blue-600">{suggestion}</span>
                        {schema.find(t => t.tableName === suggestion) && (
                          <span className="ml-2 text-xs text-gray-500">테이블</span>
                        )}
                        {schema.some(t => t.columns.some(c => c.column_name === suggestion.replace(/"/g, ''))) && (
                          <span className="ml-2 text-xs text-gray-500">컬럼</span>
                        )}
                      </button>
                    ))}
                    
                    <div className="px-3 py-1 bg-gray-50 text-xs text-gray-600 border-t">
                      Tab키로 첫 번째 제안 선택 • ESC로 닫기
                    </div>
                  </motion.div>
                )}
              </div>
              
              {/* 자동완성 안내 */}
              {schema.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  입력하면서 테이블명, 컬럼명, SQL 키워드 자동완성을 사용할 수 있습니다.
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={executeQuery}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                {isLoading ? '실행 중...' : '쿼리 실행'}
              </button>
              <button
                onClick={clearQuery}
                disabled={isLoading}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors duration-200 font-medium"
              >
                초기화
              </button>
            </div>
          </div>
        </motion.section>

        {/* 에러 표시 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <p className="text-red-700 font-medium">{error}</p>
          </motion.div>
        )}

        {/* 결과 표시 */}
        {results.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">쿼리 결과</h2>
                  {executionInfo && (
                    <p className="text-sm text-gray-600 mt-1">
                      {executionInfo.rowCount}개의 레코드 조회됨 • 실행 시간: {executionInfo.executionTime}ms
                    </p>
                  )}
                </div>
                {results.length > 0 && (
                  <button
                    onClick={downloadExcel}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    CSV 다운로드
                  </button>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {results.length > 0 && Object.keys(results[0]).map((key) => (
                      <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {Object.values(row).map((value: any, cellIndex) => (
                        <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {typeof value === 'object' && value !== null
                            ? JSON.stringify(value)
                            : typeof value === 'number' && value > 1000 
                              ? new Intl.NumberFormat('ko-KR').format(value)
                              : String(value)
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>
        )}

        {/* 로딩 상태 */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-gray-100 p-12 shadow-sm text-center"
          >
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">쿼리를 실행하고 있습니다...</p>
          </motion.div>
        )}

        {/* 고급 기능 버튼들 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap gap-4"
        >
          <button
            onClick={() => setShowSchemaBrowser(!showSchemaBrowser)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              showSchemaBrowser 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            전체 스키마 보기
          </button>
          
          <button
            onClick={() => setShowRelationships(!showRelationships)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              showRelationships 
                ? 'bg-green-600 text-white shadow-sm' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            테이블 관계 보기
          </button>
          
          <div className="flex gap-2">
            {schema.length > 0 && (
              <span className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                {schema.length}개 테이블
              </span>
            )}
            {relationships.length > 0 && (
              <span className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
                {relationships.length}개 관계
              </span>
            )}
          </div>
        </motion.div>

        {/* 스키마 브라우저 */}
        <AnimatePresence>
          {showSchemaBrowser && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">데이터베이스 스키마</h2>
                  <button
                    onClick={loadSchema}
                    disabled={loadingSchema}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {loadingSchema ? '새로고침 중...' : '새로고침'}
                  </button>
                </div>

                {loadingSchema ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-600">스키마 정보를 불러오는 중...</p>
                  </div>
                ) : (
                  <div className="flex gap-6">
                    {/* 테이블 목록 */}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-3">테이블 목록</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                        {schema.map(table => (
                          <div
                            key={table.tableName}
                            className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                              selectedTable === table.tableName
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => loadTableDetail(table.tableName)}
                          >
                            <div className="font-medium text-gray-900 text-sm truncate" title={table.tableName}>
                              {table.tableName}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {table.columns.length}개 컬럼
                            </div>
                            <div className="flex gap-1 mt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  insertTableName(table.tableName);
                                }}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                              >
                                삽입
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 테이블 상세 정보 */}
                    {selectedTable && (
                      <div className="flex-1 border-l border-gray-200 pl-6">
                        <h3 className="font-medium text-gray-900 mb-3">{selectedTable} 상세</h3>
                        
                        {loadingTableDetail ? (
                          <div className="text-center py-8">
                            <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                            <p className="text-gray-600 text-sm">테이블 정보 로드 중...</p>
                          </div>
                        ) : tableDetail ? (
                          <div className="space-y-4">
                            {/* 컬럼 정보 */}
                            <div>
                              <h4 className="font-medium text-gray-800 mb-2">컬럼 정보</h4>
                              <div className="max-h-60 overflow-y-auto">
                                <table className="w-full text-xs">
                                  <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                      <th className="text-left p-2 font-medium">컬럼명</th>
                                      <th className="text-left p-2 font-medium">타입</th>
                                      <th className="text-left p-2 font-medium">NULL</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {tableDetail.columns.map(column => {
                                      const constraint = tableDetail.constraints.find(
                                        c => c.column_name === column.column_name
                                      );
                                      return (
                                        <tr key={column.column_name} className="border-t border-gray-100">
                                          <td className="p-2">
                                            <div className="flex items-center gap-1">
                                              {getColumnTypeIcon(column.data_type)}
                                              <span className="font-mono">{column.column_name}</span>
                                              {constraint?.constraint_type === 'PRIMARY KEY' && (
                                                <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">PK</span>
                                              )}
                                              {constraint?.constraint_type === 'FOREIGN KEY' && (
                                                <span className="text-xs bg-green-100 text-green-700 px-1 rounded">FK</span>
                                              )}
                                            </div>
                                          </td>
                                          <td className="p-2 text-gray-600">{column.data_type}</td>
                                          <td className="p-2">{column.is_nullable === 'YES' ? 'Y' : 'N'}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* 제약조건 정보 */}
                            {tableDetail.constraints.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-800 mb-2">제약조건</h4>
                                <div className="space-y-1">
                                  {tableDetail.constraints.map(constraint => (
                                    <div key={constraint.constraint_name} className="text-xs p-2 bg-gray-50 rounded">
                                      <span className="font-medium">{constraint.constraint_type}</span>: {constraint.column_name}
                                      {constraint.foreign_table_name && (
                                        <span className="text-blue-600">
                                          → {constraint.foreign_table_name}.{constraint.foreign_column_name}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* 관계 시각화 */}
        <AnimatePresence>
          {showRelationships && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">테이블 관계도</h2>
                  <button
                    onClick={loadRelationships}
                    disabled={loadingRelationships}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {loadingRelationships ? '새로고침 중...' : '새로고침'}
                  </button>
                </div>

                {loadingRelationships ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-600">관계 정보를 불러오는 중...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 관계 요약 */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="font-medium text-green-900 mb-2">관계 요약</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-green-700 font-medium">총 테이블:</span>
                          <span className="ml-2">{schema.length}개</span>
                        </div>
                        <div>
                          <span className="text-green-700 font-medium">관계:</span>
                          <span className="ml-2">{relationships.length}개</span>
                        </div>
                        <div>
                          <span className="text-green-700 font-medium">연결된 테이블:</span>
                          <span className="ml-2">
                            {[...new Set([...relationships.map(r => r.source_table), ...relationships.map(r => r.target_table)])].length}개
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 관계 목록 */}
                    {relationships.length > 0 ? (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Foreign Key 관계</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {relationships.map((rel, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="text-sm">
                                  <span className="font-mono font-medium text-blue-600">{rel.source_table}</span>
                                  <span className="text-gray-500 mx-1">.</span>
                                  <span className="font-mono text-blue-800">{rel.source_column}</span>
                                </div>
                                <div className="text-gray-400">→</div>
                                <div className="text-sm">
                                  <span className="font-mono font-medium text-green-600">{rel.target_table}</span>
                                  <span className="text-gray-500 mx-1">.</span>
                                  <span className="font-mono text-green-800">{rel.target_column}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  const joinQuery = `SELECT *
FROM ${rel.source_table} s
JOIN ${rel.target_table} t ON s."${rel.source_column}" = t."${rel.target_column}"
LIMIT 10;`;
                                  setSqlQuery(joinQuery);
                                }}
                                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                              >
                                JOIN 쿼리 생성
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>Foreign Key 관계가 발견되지 않았습니다.</p>
                        <p className="text-sm mt-1">테이블 간 명시적인 관계가 정의되지 않았을 수 있습니다.</p>
                      </div>
                    )}

                    {/* 관계 기반 쿼리 제안 */}
                    {relationships.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">관계 기반 쿼리 제안</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              const complexJoinQuery = relationships.slice(0, 2).reduce((query, rel, index) => {
                                if (index === 0) {
                                  return `SELECT s."${rel.source_column}", t."${rel.target_column}"
FROM ${rel.source_table} s
JOIN ${rel.target_table} t ON s."${rel.source_column}" = t."${rel.target_column}"`;
                                } else {
                                  return query + `
JOIN ${rel.target_table} t${index + 1} ON s."${rel.source_column}" = t${index + 1}."${rel.target_column}"`;
                                }
                              }, '') + '\nLIMIT 10;';
                              setSqlQuery(complexJoinQuery);
                            }}
                            className="p-3 text-left bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                          >
                            <div className="font-medium text-blue-900 text-sm">복합 JOIN 쿼리</div>
                            <div className="text-xs text-blue-700 mt-1">여러 테이블을 연결한 복합 조회</div>
                          </button>
                          
                          <button
                            onClick={() => {
                              const rel = relationships[0];
                              const aggregateQuery = `SELECT 
  t."${rel.target_column}",
  COUNT(s."${rel.source_column}") as related_count
FROM ${rel.target_table} t
LEFT JOIN ${rel.source_table} s ON t."${rel.target_column}" = s."${rel.source_column}"
GROUP BY t."${rel.target_column}"
ORDER BY related_count DESC
LIMIT 10;`;
                              setSqlQuery(aggregateQuery);
                            }}
                            className="p-3 text-left bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                          >
                            <div className="font-medium text-green-900 text-sm">관계 집계 쿼리</div>
                            <div className="text-xs text-green-700 mt-1">관련 레코드 수 집계</div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* API 응답 데이터 뷰어 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <ApiDataViewer responses={apiResponses} />
        </motion.section>
      </div>
    </div>
  );
} 