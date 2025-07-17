import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://35.208.29.100:3001';

export async function GET(request: NextRequest) {
  try {
    console.log('테이블 관계 조회 프록시 요청');
    
    // 백엔드 API로 프록시
    const response = await fetch(`${API_BASE_URL}/sql-execute/relationships`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('백엔드 API 에러:', response.status, response.statusText);
      throw new Error(`백엔드 API 응답 오류: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('프록시 응답 성공:', Array.isArray(data) ? `${data.length}개 관계` : '단일 객체');
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('관계 조회 프록시 오류:', error);
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' 
    }, { status: 500 });
  }
} 