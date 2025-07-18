# 📚 API 구현 가이드 - Next.js API Routes 프록시 패턴

## 🏗️ 시스템 아키텍처 개요

라이브러리컴퍼니 데이터 분석 시스템은 **Next.js API Routes 프록시 패턴**을 사용하여 백엔드 API와 통신합니다.

```
📱 프론트엔드 (React/Next.js)
    ↓ fetch('/api/...')
🔄 Next.js API Routes 프록시 (/src/app/api/...)
    ↓ fetch('http://35.208.29.100:3001/...')
🖥️ 백엔드 서버 (NestJS)
```

## 🚨 **중요: 왜 이 패턴을 사용해야 하는가?**

### 1. **Mixed Content 보안 문제 해결**
- **프로덕션**: `https://librarycompany-data-analysis.vercel.app` (HTTPS)
- **백엔드**: `http://35.208.29.100:3001` (HTTP)
- **문제**: HTTPS 사이트에서 HTTP API 직접 호출 시 브라우저가 차단
- **해결**: Next.js 서버사이드에서 HTTP 호출 후 HTTPS로 응답

### 2. **CORS 문제 해결**
- 동일 도메인 API 호출로 CORS 우회
- 추가적인 CORS 설정 불필요

### 3. **보안 강화**
- API 키나 민감한 정보를 서버사이드에서 처리
- 클라이언트에 백엔드 URL 노출 최소화


### 1. **폴더 구조 생성**
```bash
# GET API 예시
mkdir -p src/app/api/{domain}/{endpoint}

# POST API 예시  
mkdir -p src/app/api/{domain}/{endpoint}

# 예시
mkdir -p src/app/api/users/login
mkdir -p src/app/api/concert/overview
```

---

## 🔧 **환경 변수 설정**

### `.env.local` 파일
```bash
# API 서버 URL
NEXT_PUBLIC_API_BASE_URL=http://35.208.29.100:3001

# 개발환경에서는 localhost 사용 가능
# NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

---

## 🎯 **결론**

**모든 API는 반드시 Next.js API Routes 프록시 패턴을 사용해야 합니다.**

이 패턴을 통해:
- ✅ Mixed Content 보안 문제 해결
- ✅ CORS 문제 해결  
- ✅ 일관된 에러 처리
- ✅ 중앙집중식 로깅
- ✅ 프로덕션 안정성 보장

**새로운 API를 추가할 때는 이 가이드를 참고하여 일관성 있는 구현을 유지하세요.** 🚀 