'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

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

// 실제 예제 쿼리들
const EXAMPLE_QUERIES = [
  {
    name: '사용자 목록',
    query: 'SELECT id, email, name, role FROM user_model LIMIT 10;'
  },
  {
    name: '공연 목록', 
    query: 'SELECT "liveId", "liveName", category, "isLive" FROM live_model WHERE "isLive" = true LIMIT 10;'
  },
  {
    name: '일일 매출 현황',
    query: 'SELECT "liveName", "티켓판매일매출", "latestRecordDate" FROM view_llm_play_daily WHERE "티켓판매일매출" > 1000000 ORDER BY "티켓판매일매출" DESC LIMIT 10;'
  },
  {
    name: '사용자 통계',
    query: `SELECT 
  role,
  COUNT(*) as user_count,
  COUNT(CASE WHEN status = true THEN 1 END) as active_users
FROM user_model 
GROUP BY role 
ORDER BY role;`
  },
  {
    name: '최근 업로드 파일',
    query: 'SELECT "fileName", "recordDate", "uploadDate" FROM file_upload_model ORDER BY "uploadDate" DESC LIMIT 10;'
  },
  {
    name: '매출 집계',
    query: 'SELECT "liveName", SUM("티켓판매일매출") as total_sales FROM view_llm_play_daily GROUP BY "liveName" ORDER BY total_sales DESC LIMIT 10;'
  }
];

interface QueryResult {
  success: boolean;
  results?: any[];
  rowCount?: number;
  executionTime?: number;
  error?: string;
  code?: string;
}

export default function SqlViewerPage() {
  const [sqlQuery, setSqlQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [executionInfo, setExecutionInfo] = useState<{rowCount: number, executionTime: number} | null>(null);

  // API URL 설정
  const getApiUrl = () => {
    return process.env.NODE_ENV === 'production' 
      ? 'http://35.208.29.100:3001' 
      : 'http://localhost:3001';
  };

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

    try {
      const response = await fetch(`${getApiUrl()}/sql-execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sqlQuery }),
      });

      const data: QueryResult = await response.json();

      if (data.success) {
        setResults(data.results || []);
        setExecutionInfo({
          rowCount: data.rowCount || 0,
          executionTime: data.executionTime || 0
        });
        setError('');
      } else {
        setError(getErrorMessage(data.error || '쿼리 실행 중 오류가 발생했습니다.', data.code));
        setResults([]);
        setExecutionInfo(null);
      }
    } catch (err) {
      console.error('API 호출 오류:', err);
      setError('서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.');
      setResults([]);
      setExecutionInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 예제 쿼리 설정
  const setExampleQuery = (query: string) => {
    setSqlQuery(query);
  };

  const clearQuery = () => {
    setSqlQuery('');
    setResults([]);
    setError('');
    setExecutionInfo(null);
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
            데이터베이스 쿼리 실행 및 결과 조회 • {getApiUrl()}
          </p>
        </motion.div>

        {/* 예제 쿼리 섹션 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">예제 쿼리</h2>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((example, index) => (
              <button
                key={index}
                onClick={() => setExampleQuery(example.query)}
                className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                {example.name}
              </button>
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
          <h2 className="text-xl font-bold text-gray-900 mb-4">SQL 쿼리 입력</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="sql-query" className="block text-sm font-medium text-gray-700 mb-2">
                SQL 쿼리 (SELECT 문만 허용)
              </label>
              <textarea
                id="sql-query"
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                placeholder="SELECT * FROM user_model LIMIT 10;"
                className="w-full h-48 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">쿼리 결과</h2>
              {executionInfo && (
                <p className="text-sm text-gray-600 mt-1">
                  {executionInfo.rowCount}개의 레코드 조회됨 • 실행 시간: {executionInfo.executionTime}ms
                </p>
              )}
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

        {/* 사용 가이드 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-blue-50 rounded-2xl border border-blue-100 p-6"
        >
          <h3 className="text-lg font-bold text-blue-900 mb-3">사용 가이드</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">허용되는 쿼리</h4>
              <ul className="space-y-1">
                <li>• SELECT 문만 허용</li>
                <li>• JOIN, WHERE, ORDER BY 등 조회 절 사용 가능</li>
                <li>• 집계 함수 사용 가능 (COUNT, SUM, AVG 등)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">차단되는 쿼리</h4>
              <ul className="space-y-1">
                <li>• 데이터 수정: INSERT, UPDATE, DELETE</li>
                <li>• 구조 변경: DROP, CREATE, ALTER</li>
                <li>• 실행 관련: EXEC, PROCEDURE</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">자동 제한사항</h4>
              <ul className="space-y-1">
                <li>• 최대 1000행 조회 (LIMIT 자동 추가)</li>
                <li>• 30초 실행 시간 제한</li>
                <li>• 최대 5000자 쿼리 크기</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">팁</h4>
              <ul className="space-y-1">
                <li>• 큰 테이블 조회 시 LIMIT 사용 권장</li>
                <li>• 인덱스가 있는 컬럼으로 WHERE 조건 작성</li>
                <li>• 복잡한 JOIN 쿼리는 최소화</li>
              </ul>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
} 