import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://35.208.29.100:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔄 SQL 실행 프록시 요청: /ai-chat/execute-sql');
    
    const response = await fetch(`${API_BASE_URL}/ai-chat/execute-sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('❌ SQL 실행 백엔드 API 에러:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'SQL 실행 API 호출 실패' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ SQL 실행 프록시 응답 성공');
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ SQL 실행 프록시 에러:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 