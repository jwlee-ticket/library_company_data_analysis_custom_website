import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://35.208.29.100:3001' 
  : 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/ai-chat/sessions`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || '세션 목록 조회 실패' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('세션 목록 조회 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 