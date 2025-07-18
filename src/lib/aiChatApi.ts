interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sqlQuery?: string;
}

interface ChatRequest {
  message: string;
  sessionId?: string;
  previousMessages?: ChatMessage[];
}

interface ChatResponse {
  success: true;
  message: {
    id: string;
    role: 'assistant';
    content: string;
    timestamp: Date;
    sqlQuery?: string;
  };
  sessionId: string;
  sqlAnalysis: {
    isValidSql: boolean;
    query?: string;
    explanation: string;
    confidence: number;
  };
  tokensUsed?: number;
  responseTime?: number;
}

interface SqlExecuteRequest {
  query: string;
  sessionId: string;
  messageId: string;
}

interface SqlExecuteResponse {
  success: boolean;
  results?: any[];
  executionTime?: number;
  rowCount?: number;
  error?: string;
  code?: string;
}

interface SessionListResponse {
  success: boolean;
  sessions: {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    messageCount: number;
    lastMessage?: string;
  }[];
}

class AiChatApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'http://35.208.29.100:3001' 
      : 'http://localhost:3001';
  }

  async sendMessage(message: string, sessionId?: string, previousMessages?: ChatMessage[]): Promise<ChatResponse> {
    const requestData: ChatRequest = {
      message,
      sessionId,
      previousMessages
    };

    const response = await fetch(`${this.baseUrl}/ai-chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
    }

    return response.json();
  }

  async executeSql(query: string, sessionId: string, messageId: string): Promise<SqlExecuteResponse> {
    const requestData: SqlExecuteRequest = {
      query,
      sessionId,
      messageId
    };

    const response = await fetch(`${this.baseUrl}/ai-chat/execute-sql`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
    }

    return response.json();
  }

  async getSessions(): Promise<SessionListResponse> {
    const response = await fetch(`${this.baseUrl}/ai-chat/sessions`, {
      headers: { 
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
    }

    return response.json();
  }

  async getSession(sessionId: string) {
    const response = await fetch(`${this.baseUrl}/ai-chat/sessions/${sessionId}`, {
      headers: { 
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
    }

    return response.json();
  }

  async deleteSession(sessionId: string) {
    const response = await fetch(`${this.baseUrl}/ai-chat/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: { 
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
    }

    return response.json();
  }
}

export { AiChatApi, type ChatMessage, type ChatResponse, type SqlExecuteResponse, type SessionListResponse }; 