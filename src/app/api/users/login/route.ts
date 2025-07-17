import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://35.208.29.100:3001';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 User Login API 프록시 요청 시작');
    
    // 요청 본문 파싱
    const body = await request.json();
    console.log('📝 로그인 요청 데이터:', { email: body.email, password: '***' });
    
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      // 캐시 비활성화
      cache: 'no-store'
    });

    const data = await response.json();
    console.log('✅ User Login API 프록시 응답:', { 
      code: data.code, 
      message: data.message,
      userId: data.userId,
      name: data.name 
    });

    // 백엔드 응답을 그대로 전달
    return NextResponse.json(data, { status: response.status });
    
  } catch (error: any) {
    console.error('❌ User Login API 프록시 오류:', error);
    return NextResponse.json(
      { 
        code: 500,
        message: '로그인 처리 중 서버 오류가 발생했습니다.',
        error: error.message 
      },
      { status: 500 }
    );
  }
} 