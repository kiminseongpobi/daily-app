# 데일리 업무 공유 앱 개발 계획

## MVP 기능 구현 목록

### 1. 데이터베이스 설계 및 Supabase 설정
- 사용자 테이블 (users)
- 데일리 리포트 테이블 (daily_reports)
- AI 요약 테이블 (ai_summaries)

### 2. 핵심 컴포넌트 파일 (총 7개)
- `src/pages/Index.tsx` - 메인 대시보드 페이지
- `src/components/DailyReportForm.tsx` - 데일리 업무 작성 폼
- `src/components/ReportList.tsx` - 개별/통합 리포트 목록
- `src/components/AISummary.tsx` - AI 요약 컴포넌트
- `src/components/AuthComponent.tsx` - 로그인/회원가입 컴포넌트
- `src/lib/supabase.ts` - Supabase 클라이언트 설정
- `src/types/index.ts` - TypeScript 타입 정의

### 3. 주요 기능
- 사용자 인증 (Supabase Auth)
- 4개 섹션 데일리 리포트 작성
- 개별/통합 보기 전환
- 날짜별 필터링
- 간단한 AI 요약 (클라이언트 사이드)

### 4. UI/UX
- 깔끔하고 사용하기 쉬운 인터페이스
- 모바일 반응형 디자인
- 부담스럽지 않은 작성 폼