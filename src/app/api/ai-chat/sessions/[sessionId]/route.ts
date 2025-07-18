import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://35.208.29.100:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    console.log('🔄 세션 조회 프록시 요청:', `/ai-chat/sessions/${sessionId}`);
    
    const response = await fetch(`${API_BASE_URL}/ai-chat/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('❌ 세션 조회 백엔드 API 에러:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || '세션 조회 실패' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ 세션 조회 프록시 응답 성공');
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ 세션 조회 프록시 에러:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    console.log('🔄 세션 삭제 프록시 요청:', `/ai-chat/sessions/${sessionId}`);
    
    const response = await fetch(`${API_BASE_URL}/ai-chat/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('❌ 세션 삭제 백엔드 API 에러:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || '세션 삭제 실패' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ 세션 삭제 프록시 응답 성공');
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ 세션 삭제 프록시 에러:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 