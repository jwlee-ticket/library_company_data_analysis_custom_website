import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://35.208.29.100:3001';

export async function GET() {
  try {
    console.log('🔍 Weekly API 요청 시작:', `${API_BASE_URL}/concert/weekly`);
    
    const response = await fetch(`${API_BASE_URL}/concert/weekly`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 캐시 비활성화
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('❌ Weekly API 응답 오류:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Weekly API 응답 성공:', data?.length || 0, '개 항목');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Weekly API 프록시 오류:', error);
    return NextResponse.json(
      { error: 'Weekly 데이터를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 