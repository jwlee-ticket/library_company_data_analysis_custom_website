'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AiChatApi, type ChatMessage, type ChatResponse } from '@/lib/aiChatApi';
import ApiDataViewer from '@/components/debug/ApiDataViewer';

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount?: number;
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  
  const aiChatApi = new AiChatApi();
  
  // 서버에서 받아온 채팅 세션만 표시
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [hasServerSessions, setHasServerSessions] = useState(false);
  
  // SQL 실행 결과 상태
  const [sqlResults, setSqlResults] = useState<any>(null);
  const [isExecutingSql, setIsExecutingSql] = useState(false);
  
  // API 응답 데이터 상태
  const [apiResponses, setApiResponses] = useState<Record<string, any>>({});
  const [showApiModal, setShowApiModal] = useState(false);

  // 세션 목록 로드
  const loadSessions = async () => {
    try {
      const response = await aiChatApi.getSessions();
      if (response.success && response.sessions && response.sessions.length > 0) {
        const sessions: ChatSession[] = await Promise.all(
          response.sessions.map(async (session) => {
            try {
              // 각 세션의 상세 정보를 가져와서 첫 번째 사용자 메시지와 마지막 메시지 추출
              const sessionDetail = await aiChatApi.getSession(session.id);
              let title = session.title;
              let lastMessage = session.lastMessage || '새로운 대화';

              if (sessionDetail.success && sessionDetail.messages && sessionDetail.messages.length > 0) {
                // 첫 번째 사용자 메시지를 타이틀로 사용
                const firstUserMessage = sessionDetail.messages.find((msg: ChatMessage) => msg.role === 'user');
                if (firstUserMessage) {
                  title = firstUserMessage.content.length > 30 
                    ? firstUserMessage.content.substring(0, 30) + '...'
                    : firstUserMessage.content;
                }

                // 마지막 메시지를 내용으로 사용
                const lastMsg = sessionDetail.messages[sessionDetail.messages.length - 1];
                if (lastMsg) {
                  lastMessage = lastMsg.content.length > 50
                    ? lastMsg.content.substring(0, 50) + '...'
                    : lastMsg.content;
                }
              }

              return {
                id: session.id,
                title,
                lastMessage,
                timestamp: new Date(session.updatedAt),
                messageCount: session.messageCount
              };
            } catch (error) {
              console.error(`세션 ${session.id} 상세 정보 로드 실패:`, error);
              return {
                id: session.id,
                title: session.title,
                lastMessage: session.lastMessage || '새로운 대화',
                timestamp: new Date(session.updatedAt),
                messageCount: session.messageCount
              };
            }
          })
        );
        
        setChatSessions(sessions);
        setHasServerSessions(true);
      } else {
        setChatSessions([]);
        setHasServerSessions(false);
      }
      setSessionsLoaded(true);
    } catch (error) {
      console.error('세션 로드 실패:', error);
      setChatSessions([]);
      setHasServerSessions(false);
      setSessionsLoaded(true);
    }
  };

  // 컴포넌트 마운트 시 세션 목록 로드
  useEffect(() => {
    loadSessions();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    const startTime = Date.now();
    const endpoint = `ai-chat-${Date.now()}`;

    // API 호출 시작 추적
    setApiResponses(prev => ({
      ...prev,
      [endpoint]: {
        endpoint: 'AI Chat 메시지',
        status: 'loading',
        timestamp: new Date().toISOString(),
        url: '/ai-chat'
      }
    }));

    try {
      // 이전 메시지 컨텍스트 (최근 5개)
      const previousMessages = messages.slice(-5);
      
      const response: ChatResponse = await aiChatApi.sendMessage(
        inputMessage, 
        currentSessionId || undefined,
        previousMessages.length > 0 ? previousMessages : undefined
      );

      const duration = Date.now() - startTime;

      // 세션 ID 설정
      if (!currentSessionId) {
        setCurrentSessionId(response.sessionId);
      }

      const aiMessage: ChatMessage = {
        id: response.message.id,
        role: 'assistant',
        content: response.message.content,
        timestamp: new Date(response.message.timestamp),
        sqlQuery: response.sqlAnalysis?.query
      };

      setMessages(prev => [...prev, aiMessage]);

      // API 성공 추적
      setApiResponses(prev => ({
        ...prev,
        [endpoint]: {
          endpoint: 'AI Chat 메시지',
          status: 'success',
          data: response,
          timestamp: new Date().toISOString(),
          duration,
          url: '/ai-chat'
        }
      }));

      // 세션 목록 업데이트
      await loadSessions();

    } catch (err) {
      const duration = Date.now() - startTime;
      console.error('AI Chat 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);

      // API 에러 추적
      setApiResponses(prev => ({
        ...prev,
        [endpoint]: {
          endpoint: 'AI Chat 메시지',
          status: 'error',
          error: err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
          timestamp: new Date().toISOString(),
          duration,
          url: '/ai-chat'
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setError('');
    setSqlResults(null);
    setApiResponses({});
  };

  const handleSessionSelect = async (sessionId: string) => {
    if (sessionId === currentSessionId) return;
    
    try {
      setCurrentSessionId(sessionId);
      setError('');
      setSqlResults(null);
      setApiResponses({});
      
      // 해당 세션의 모든 메시지를 로드
      const sessionData = await aiChatApi.getSession(sessionId);
      if (sessionData.success && sessionData.messages && sessionData.messages.length > 0) {
        // 메시지 데이터를 ChatMessage 형태로 변환
        const formattedMessages: ChatMessage[] = sessionData.messages.map((msg: any) => ({
          id: msg.id || Date.now().toString(),
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          sqlQuery: msg.sqlQuery
        }));
        setMessages(formattedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('세션 로드 실패:', error);
      setError('세션을 불러오는데 실패했습니다.');
      setMessages([]);
    }
  };

  // 안전한 클립보드 복사 함수
  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
      
      // Fallback: 임시 textarea 사용
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      
    } catch (error) {
      console.error('복사 실패:', error);
      // 에러 시 사용자에게 안내
      alert('자동 복사가 실패했습니다. 텍스트를 수동으로 선택해서 복사해주세요.');
    }
  };

  // SQL 실행 함수
  const executeSql = async (query: string, messageId: string) => {
    if (!currentSessionId || !query) return;

    setIsExecutingSql(true);
    setSqlResults(null);

    const startTime = Date.now();
    const endpoint = `sql-execute-${messageId}`;

    // API 호출 시작 추적
    setApiResponses(prev => ({
      ...prev,
      [endpoint]: {
        endpoint: 'AI Chat SQL 실행',
        status: 'loading',
        timestamp: new Date().toISOString(),
        url: '/ai-chat/execute-sql'
      }
    }));

    try {
      const result = await aiChatApi.executeSql(query, currentSessionId, messageId);
      const duration = Date.now() - startTime;
      
      setSqlResults(result);
      
      // API 응답 추적
      setApiResponses(prev => ({
        ...prev,
        [endpoint]: {
          endpoint: 'AI Chat SQL 실행',
          status: result.success ? 'success' : 'error',
          data: result,
          error: result.success ? undefined : result.error,
          timestamp: new Date().toISOString(),
          duration,
          url: '/ai-chat/execute-sql'
        }
      }));
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('SQL 실행 오류:', error);
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'SQL 실행 중 오류가 발생했습니다.'
      };
      
      setSqlResults(errorResult);
      
      // API 에러 추적
      setApiResponses(prev => ({
        ...prev,
        [endpoint]: {
          endpoint: 'AI Chat SQL 실행',
          status: 'error',
          error: error instanceof Error ? error.message : 'SQL 실행 중 오류가 발생했습니다.',
          timestamp: new Date().toISOString(),
          duration,
          url: '/ai-chat/execute-sql'
        }
      }));
    } finally {
      setIsExecutingSql(false);
    }
  };

  // SQL 코드 파싱 및 렌더링 (복사 및 실행 버튼)
  const renderMessageContent = (content: string, sqlQuery?: string, messageId?: string) => {
    const parts = content.split(/(```sql[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```sql') && part.endsWith('```')) {
        const sqlCode = part.replace(/```sql\n?/, '').replace(/```$/, '');
        return (
          <div key={index} className="my-4">
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>{sqlCode}</pre>
            </div>
            {sqlQuery && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => copyToClipboard(sqlQuery)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  복사
                </button>
                {messageId && (
                  <button
                    onClick={() => executeSql(sqlQuery, messageId)}
                    disabled={isExecutingSql}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isExecutingSql ? '실행 중...' : 'API 응답 데이터'}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="h-screen w-full bg-gray-50 flex overflow-hidden">
      {/* 메인 채팅 화면 */}
      <div className="flex flex-col h-full flex-1">
        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4 rounded">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* 채팅 메시지 영역 */}
        <div className="p-6 bg-white overflow-y-auto" style={{ height: 'calc(100vh - 100px)' }}>
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-gray-500">
              <div>
                <p className="text-lg mb-4">AI SQL Assistant를 통해 SQL문을 만들어봐요.</p>
                
                <div className="bg-gray-50 rounded-lg p-6 mt-8 max-w-2xl">
                  <h3 className="text-lg font-semibold mb-4 text-gray-700">예시 질문</h3>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="text-left bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                      "최근 일주일간 매출이 높은 공연 5개를 조회하는 SQL문을 생성해주세요"
                    </div>
                    <div className="text-left bg-green-50 p-3 rounded border-l-4 border-green-400">
                      "진행중인 모든 공연을 알려주는 SQL문을 생성해주세요"
                    </div>
                    <div className="text-left bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                      "사용자 정보를 확인하는 SQL문을 생성해주세요"
                    </div>
                    <div className="text-left bg-orange-50 p-3 rounded border-l-4 border-orange-400">
                      "캐스트별 매출 통계를 조회하는 SQL문을 생성해주세요"
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md lg:max-w-lg xl:max-w-2xl px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    ) : (
                      <div className="text-sm leading-relaxed">
                        {renderMessageContent(message.content, message.sqlQuery, message.id)}
                      </div>
                    )}
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString('ko-KR')}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 text-gray-900 max-w-md px-4 py-3 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm">AI가 답변을 생성하고 있습니다...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* 플로팅 API 응답 데이터 버튼 */}
        <button
          onClick={() => setShowApiModal(true)}
          className="fixed top-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center z-40"
          title="API 응답 데이터"
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
            />
          </svg>
        </button>

        {/* API 응답 데이터 모달 */}
        <AnimatePresence>
          {showApiModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowApiModal(false)}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">API 응답 데이터</h2>
                  <button
                    onClick={() => setShowApiModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                  >
                    ×
                  </button>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 60px)' }}>
                  <ApiDataViewer responses={apiResponses} />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* SQL 실행 결과 영역 */}
        {sqlResults && (
          <div className="border-t border-gray-200 bg-gray-50 p-4 max-h-60 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-700">SQL 실행 결과</h3>
                <button
                  onClick={() => setSqlResults(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  ✕ 닫기
                </button>
              </div>
              
              {sqlResults.success ? (
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-green-600 font-medium">
                      ✅ 성공 • {sqlResults.rowCount || 0}행 • {sqlResults.executionTime || 0}ms
                    </span>
                  </div>
                  <div className="bg-gray-900 text-gray-100 rounded p-3 overflow-x-auto">
                    <pre className="text-xs">
                      {JSON.stringify(sqlResults.results, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-center mb-2">
                    <span className="text-xs text-red-600 font-medium">
                      ❌ 오류
                    </span>
                  </div>
                  <div className="text-sm text-red-700 bg-red-50 p-3 rounded">
                    {sqlResults.error || '알 수 없는 오류가 발생했습니다.'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 메시지 입력 영역 - 고정된 하단 위치 */}
        <div className="border-t border-gray-200 bg-white p-4 shadow-lg" style={{ height: '100px' }}>
          <div className="max-w-4xl mx-auto h-full flex items-center">
            <div className="flex space-x-4 w-full">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="데이터에 대해 질문해주세요~ (Shift+Enter로 줄바꿈)"
                className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                rows={2}
                disabled={isLoading}
                style={{ height: '60px' }}
              />
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-sm"
                  style={{ height: '60px' }}
                >
                  {isLoading ? '전송 중...' : '전송'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* API 응답 데이터 모달 */}
      </div>

      {/* 사이드바 - 새로운 채팅 버튼은 항상 표시 */}
      <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col shrink-0">
        {/* 새로운 채팅 버튼 */}
        <div className="shrink-0 p-4 border-b border-gray-200">
          <button
            onClick={handleNewChat}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span>
            새로운 채팅
          </button>
        </div>

        {/* 채팅 세션 목록 - 서버 데이터가 있을 때만 표시 */}
        {hasServerSessions && (
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-2">
              <h3 className="text-sm font-semibold text-gray-700 px-3 py-2 mb-2">이전 대화</h3>
              {chatSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSessionSelect(session.id)}
                  className={`w-full text-left p-3 rounded-lg mb-2 transition-colors duration-200 ${
                    currentSessionId === session.id
                      ? 'bg-blue-100 border border-blue-200'
                      : 'bg-white hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900 truncate mb-1">
                    {session.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate mb-2">
                    {session.lastMessage}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-400">
                      {session.timestamp.toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {session.messageCount && (
                      <div className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        {session.messageCount}개
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 빈 공간 또는 안내 메시지 */}
        {!hasServerSessions && (
          <div className="flex-1 flex items-center justify-center text-center text-gray-500 p-4">
            <div>
              <p className="text-sm">아직 저장된 대화가 없습니다.</p>
              <p className="text-xs mt-1">새로운 채팅을 시작해보세요!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 