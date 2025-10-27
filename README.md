# 데일리 리포트 공유 앱

팀원들이 매일의 업무 성과와 계획을 공유할 수 있는 웹 애플리케이션입니다.

## 🚀 주요 기능

### ✅ 완전 구현된 기능
- **회원가입/로그인 시스템**: 이메일 기반 인증 (로컬 모드 + Supabase 지원)
- **데일리 리포트 작성**: 성과, 완료 업무, 아이디어, 내일 계획 입력
- **팀 리포트 조회**: 날짜별 팀원들의 리포트 확인
- **반응형 디자인**: PC와 모바일에서 최적화된 UI/UX
- **데이터 저장**: localStorage (로컬 모드) 또는 Supabase (클라우드 모드)

### 🔄 개발 중인 기능
- **AI 요약**: OpenAI API를 통한 팀 리포트 자동 요약 (기본 구조 완성)
- **실시간 알림**: 새 리포트 작성 시 팀원 알림
- **PWA 지원**: 모바일 앱처럼 설치 가능

## 🛠 기술 스택

- **Frontend**: React 18 + TypeScript
- **UI Framework**: shadcn/ui + Tailwind CSS
- **State Management**: React Hooks
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Build Tool**: Vite
- **Deployment**: Vercel/Netlify 호환

## 📱 지원 플랫폼

- ✅ **데스크톱 브라우저** (Chrome, Firefox, Safari, Edge)
- ✅ **모바일 브라우저** (iOS Safari, Android Chrome)
- 🔄 **PWA 설치** (개발 예정)

## 🚦 시작하기

### 로컬 개발 환경 설정

```bash
# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm run dev

# 브라우저에서 http://localhost:5173 접속
```

### 로컬 모드 사용법

**현재 로컬 모드에서 완전한 회원가입/로그인이 가능합니다!**

1. **회원가입**:
   - 이메일, 비밀번호(6자 이상), 이름(2자 이상) 입력
   - 이메일 중복 체크 및 형식 검증
   - 비밀번호 암호화 저장

2. **로그인**:
   - 등록된 이메일과 비밀번호로 로그인
   - 자동 세션 유지

3. **데모 계정** (테스트용):
   - 이메일: `demo@company.com`
   - 비밀번호: `demo123`

### Supabase 클라우드 모드 설정

실제 배포 시 완전한 클라우드 기능을 사용하려면:

1. **Supabase 프로젝트 생성**:
   ```bash
   # https://supabase.com 에서 새 프로젝트 생성
   # 프로젝트 URL과 anon key 복사
   ```

2. **환경 변수 설정**:
   ```bash
   # .env 파일 생성
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **데이터베이스 스키마 설정**:
   ```sql
   -- Supabase SQL Editor에서 실행
   
   -- 사용자 프로필 테이블
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     name TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- 데일리 리포트 테이블
   CREATE TABLE daily_reports (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users NOT NULL,
     date DATE NOT NULL,
     achievements TEXT NOT NULL,
     completed_tasks TEXT NOT NULL,
     ideas_suggestions TEXT NOT NULL,
     tomorrow_tasks TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(user_id, date)
   );
   
   -- AI 요약 테이블
   CREATE TABLE ai_summaries (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     date DATE UNIQUE NOT NULL,
     content TEXT NOT NULL,
     report_count INTEGER NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- RLS 정책 설정
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
   ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;
   
   -- 프로필 정책
   CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
   CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
   
   -- 리포트 정책
   CREATE POLICY "Users can view all reports" ON daily_reports FOR SELECT USING (true);
   CREATE POLICY "Users can insert own reports" ON daily_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can update own reports" ON daily_reports FOR UPDATE USING (auth.uid() = user_id);
   
   -- AI 요약 정책
   CREATE POLICY "Users can view all summaries" ON ai_summaries FOR SELECT USING (true);
   ```

4. **OpenAI API 설정** (AI 요약 기능용):
   ```bash
   # .env 파일에 추가
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

## 🔧 빌드 및 배포

### 로컬 빌드
```bash
# 프로덕션 빌드
pnpm run build

# 빌드 결과 미리보기
pnpm run preview
```

### Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 환경 변수 설정
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_OPENAI_API_KEY
```

### Netlify 배포
```bash
# Netlify CLI 설치
npm i -g netlify-cli

# 배포
netlify deploy --prod --dir=dist
```

## 📊 사용 통계

- **로컬 모드**: 브라우저 localStorage 사용 (오프라인 작동)
- **클라우드 모드**: Supabase 실시간 데이터베이스 사용
- **데이터 보안**: 비밀번호 해싱, RLS 정책 적용
- **성능**: React 18 Concurrent Features, 코드 스플리팅

## 🐛 알려진 이슈

- ✅ **해결됨**: Babel traverse 스코프 충돌 오류
- ✅ **해결됨**: 모바일 UI 반응성 문제
- ✅ **해결됨**: 회원가입 기능 누락 문제

## 🔮 향후 계획

1. **PWA 기능 추가** - 모바일 앱처럼 설치 가능
2. **실시간 알림 시스템** - 새 리포트 작성 시 팀원 알림
3. **AI 요약 고도화** - 더 정확하고 유용한 요약 생성
4. **데이터 분석 대시보드** - 팀 생산성 트렌드 분석
5. **다국어 지원** - 영어, 일본어 등 추가 언어 지원

## 📞 지원

- **이슈 리포팅**: GitHub Issues
- **기능 요청**: GitHub Discussions
- **보안 문제**: 비공개 이메일로 연락

---

**현재 상태**: ✅ 프로덕션 준비 완료 (로컬 모드)
**배포 URL**: http://localhost:5173 (개발 서버)
**마지막 업데이트**: 2025-10-27