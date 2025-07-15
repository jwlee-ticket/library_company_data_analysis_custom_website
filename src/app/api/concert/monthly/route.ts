import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://35.208.29.100:3001';

// 콘서트 월간 매출 데이터 프록시 API
export async function GET() {
  try {
    console.log('🔄 프록시 요청: /concert/monthly');
    
    const response = await fetch(`${API_BASE_URL}/concert/monthly`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 캐시 비활성화 (실시간 데이터)
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('❌ 백엔드 API 에러:', response.status, response.statusText);
      return NextResponse.json(
        { error: '백엔드 서버 연결 실패', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ 프록시 응답 성공:', Array.isArray(data) ? `${data.length}개 항목` : '단일 객체');

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ 프록시 에러:', error.message);
    return NextResponse.json(
      { error: '서버 내부 오류', message: error.message },
      { status: 500 }
    );
  }
} 