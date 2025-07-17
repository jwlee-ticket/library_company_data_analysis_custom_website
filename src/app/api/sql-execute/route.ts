import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    // 1. 기본 유효성 검증
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'SQL 쿼리가 필요합니다.' 
      });
    }
    
    // 2. SELECT 문만 허용
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery.startsWith('select')) {
      return NextResponse.json({ 
        success: false, 
        error: 'SELECT 문만 실행 가능합니다.' 
      });
    }
    
    // 3. 위험한 키워드 차단
    const dangerousKeywords = [
      'drop', 'delete', 'insert', 'update', 'alter', 
      'create', 'truncate', 'grant', 'revoke'
    ];
    
    const hasDangerousKeyword = dangerousKeywords.some(keyword => 
      new RegExp(`\\b${keyword}\\b`, 'i').test(query)
    );
    
    if (hasDangerousKeyword) {
      return NextResponse.json({ 
        success: false, 
        error: '데이터 수정 쿼리는 실행할 수 없습니다. SELECT 문만 사용하세요.' 
      });
    }
    
    // 4. 외부 API 서버로 요청 전달
    const apiResponse = await fetch('http://localhost:3001/sql-execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    if (!apiResponse.ok) {
      throw new Error(`API 서버 응답 오류: ${apiResponse.status}`);
    }
    
    const result = await apiResponse.json();
    
    return NextResponse.json({
      success: true,
      results: result.results || result.data || [],
      rowCount: result.rowCount || (result.results ? result.results.length : 0),
      message: `${result.rowCount || 0}개의 레코드가 조회되었습니다.`
    });
    
  } catch (error) {
    console.error('SQL 실행 오류:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' 
    });
  }
}

// GET 요청은 허용하지 않음
export async function GET() {
  return NextResponse.json({ 
    success: false, 
    error: 'POST 메서드만 지원합니다.' 
  }, { status: 405 });
} 