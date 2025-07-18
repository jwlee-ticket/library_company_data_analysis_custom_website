'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<Array<{id: string, type: 'user' | 'ai', content: string}>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string>('default');
  
  // 임시 채팅 세션 목록
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: 'session-1',
      title: '사용자 데이터 분석',
      lastMessage: 'SELECT * FROM user_model WHERE...',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: 'session-2', 
      title: '매출 현황 조회',
      lastMessage: '매출 데이터를 보여주세요',
      timestamp: new Date(Date.now() - 7200000)
    },
    {
      id: 'session-3',
      title: '공연 관련 SQL',
      lastMessage: '공연별 티켓 판매량을 조회하고 싶어요',
      timestamp: new Date(Date.now() - 86400000)
    }
  ]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // 임시 AI 응답 (실제 AI API 연동 시 대체)
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: '안녕하세요! Library Data AI Chat입니다. 현재 개발 중인 기능입니다. 데이터 분석과 관련된 질문을 도와드릴 예정입니다.'
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: '새로운 채팅',
      lastMessage: '',
      timestamp: new Date()
    };
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    // 실제로는 해당 세션의 메시지를 로드해야 함
    setMessages([]);
  };

  return (
    <div className="h-screen w-full bg-gray-50 flex overflow-hidden">
      {/* 메인 채팅 화면 (왼쪽) */}
      <div className="flex-1 flex flex-col">
        {/* 채팅 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-gray-500">
              <div>
                <div className="text-6xl mb-6">💬</div>
                <h2 className="text-2xl font-bold mb-4">AI와 대화를 시작해보세요!</h2>
                <p className="text-lg mb-2">데이터 분석, SQL 쿼리, 보고서 생성 등에 대해 질문할 수 있습니다.</p>
                <p className="text-sm text-gray-400">메시지를 입력하여 대화를 시작하세요</p>
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
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md lg:max-w-lg xl:max-w-2xl px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
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
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* 메시지 입력 영역 */}
        <div className="h-24 border-t border-gray-200 bg-white p-6 shadow-lg flex items-center">
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex space-x-4">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
                className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-sm"
              >
                전송
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 이전 대화 목록 사이드바 (오른쪽) */}
      <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
        {/* 새로운 채팅 버튼 */}
        <div className="h-20 p-4 border-b border-gray-200 flex items-center">
          <button
            onClick={handleNewChat}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span>
            새로운 채팅
          </button>
        </div>

        {/* 채팅 세션 목록 */}
        <div className="flex-1 overflow-y-auto">
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
                  {session.lastMessage || '새로운 대화'}
                </div>
                <div className="text-xs text-gray-400">
                  {session.timestamp.toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="h-16 p-4 border-t border-gray-200 flex items-center justify-center">
          <div className="text-xs text-gray-500 text-center">
            <p className="mb-1">Library AI Data Chat</p>
            <p>개발 중인 기능입니다</p>
          </div>
        </div>
      </div>
    </div>
  );
} 