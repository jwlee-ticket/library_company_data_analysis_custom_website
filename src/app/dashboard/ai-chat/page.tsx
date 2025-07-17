'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AiChatPage() {
  const [messages, setMessages] = useState<Array<{id: string, type: 'user' | 'ai', content: string}>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <div className="p-8 max-w-4xl mx-auto">
        {/* 페이지 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Library AI Data Chat
          </h1>
          <p className="text-gray-600">
            데이터 분석을 위한 AI 어시스턴트와 대화해보세요.
          </p>
        </motion.div>

        {/* 채팅 컨테이너 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* 채팅 메시지 영역 */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                <div className="text-4xl mb-4">Chat</div>
                <p>AI와 대화를 시작해보세요!</p>
                <p className="text-sm mt-2">데이터 분석, SQL 쿼리, 보고서 생성 등에 대해 질문할 수 있습니다.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 메시지 입력 영역 */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex space-x-3">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
                className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                전송
              </button>
            </div>
          </div>
        </motion.div>

        {/* 기능 안내 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 bg-blue-50 rounded-2xl border border-blue-100 p-6"
        >
          <h3 className="text-lg font-bold text-blue-900 mb-3">AI Chat 기능</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">데이터 분석 지원</h4>
              <ul className="space-y-1">
                <li>• SQL 쿼리 작성 도움</li>
                <li>• 데이터 인사이트 제공</li>
                <li>• 차트 및 시각화 추천</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">보고서 작성</h4>
              <ul className="space-y-1">
                <li>• 데이터 요약 및 분석</li>
                <li>• 트렌드 해석</li>
                <li>• 비즈니스 인사이트 도출</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>개발 중:</strong> 현재 기본 채팅 인터페이스만 구현되어 있습니다. 
              실제 AI 기능은 추후 백엔드 AI API와 연동하여 제공될 예정입니다.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 