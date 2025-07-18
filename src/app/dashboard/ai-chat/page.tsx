'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AiChatApi, type ChatMessage, type ChatResponse, type SqlExecuteResponse } from '@/lib/aiChatApi';

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

  // 세션 목록 로드
  const loadSessions = async () => {
    try {
      const response = await aiChatApi.getSessions();
      if (response.success && response.sessions && response.sessions.length > 0) {
        const sessions: ChatSession[] = response.sessions.map(session => ({
          id: session.id,
          title: session.title,
          lastMessage: session.lastMessage || '새로운 대화',
          timestamp: new Date(session.updatedAt),
          messageCount: session.messageCount
        }));
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

    try {
      // 이전 메시지 컨텍스트 (최근 5개)
      const previousMessages = messages.slice(-5);
      
      const response: ChatResponse = await aiChatApi.sendMessage(
        inputMessage, 
        currentSessionId || undefined,
        previousMessages.length > 0 ? previousMessages : undefined
      );

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

      // 세션 목록 업데이트
      await loadSessions();

    } catch (err) {
      console.error('AI Chat 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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
  };

  const handleSessionSelect = async (sessionId: string) => {
    if (sessionId === currentSessionId) return;
    
    try {
      setCurrentSessionId(sessionId);
      // 실제로는 해당 세션의 메시지를 로드해야 함
      const sessionData = await aiChatApi.getSession(sessionId);
      if (sessionData.success && sessionData.messages) {
        setMessages(sessionData.messages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('세션 로드 실패:', error);
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

  // SQL 코드 파싱 및 렌더링 (복사 버튼만 남김)
  const renderMessageContent = (content: string, sqlQuery?: string) => {
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
        <div className="p-6 bg-white overflow-y-auto" style={{ height: 'calc(100vh - 300px)' }}>
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
                        {renderMessageContent(message.content, message.sqlQuery)}
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

        {/* 메시지 입력 영역 - 고정된 하단 위치 */}
        <div className="border-t border-gray-200 bg-white p-4 shadow-lg" style={{ height: '120px' }}>
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