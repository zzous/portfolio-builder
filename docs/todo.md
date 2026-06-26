# 포트폴리오 빌더 - Todo List

> 마지막 업데이트: 2026-06-19

---

## 완료

- [x] Next.js 14 (App Router) + Tailwind CSS 프로젝트 초기 세팅
- [x] NextAuth.js GitHub OAuth 설정 (`lib/auth.ts` + `/api/auth/[...nextauth]`)
- [x] GitHub API 유틸 구현 (`getRepositories`, `getReadme`, `getRecentCommits`, `enrichTopRepositories`)
- [x] AI 생성 API 구현 (`POST /api/generate` — Claude 프롬프트 설계 + JSON 파싱)
- [x] Supabase 클라이언트 연결 + 포트폴리오 저장/조회 API (`GET/POST /api/portfolio`)
- [x] 타입 정의 (`PortfolioData`, `GithubRepo`, `GithubUser`, `next-auth.d.ts`)
- [x] 컴포넌트 구현 (`AuthButton`, `PortfolioCard`, `ProjectCard`, `SkillBadge`, `Providers`)
- [x] 페이지 3개 구현 (랜딩 `/`, 대시보드 `/dashboard`, 공개 포트폴리오 `/[username]`)

---

## Phase 0 — 환경 세팅 (지금 당장 없으면 아무것도 안 됨)

- [x] Supabase 프로젝트 생성 + `portfolios` 테이블 생성 + RLS 설정

  ```sql
  -- 테이블 생성
  create table portfolios (
    username    text primary key,
    data        jsonb not null,
    updated_at  timestamptz not null default now()
  );

  -- RLS 활성화 (필수 — 없으면 anon key로 전체 데이터 접근 가능)
  alter table portfolios enable row level security;

  -- 누구나 읽기 허용 (공개 포트폴리오)
  create policy "public read"
    on portfolios for select
    using (true);

  -- 쓰기는 service_role key만 허용 (RLS 우회 → 서버에서만 호출)
  ```

- [x] `lib/supabase.ts`에 서버 전용 클라이언트 추가 (`SUPABASE_SERVICE_ROLE_KEY` 사용)
  - `/api/portfolio` POST는 서버 클라이언트로 교체해야 함
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`는 공개 읽기 전용으로만 사용

- [x] GitHub OAuth App 등록 (`github.com/settings/developers` → New OAuth App)
  - Homepage URL: `http://localhost:3000`
  - Callback URL: `http://localhost:3000/api/auth/callback/github`

- [x] `.env.local` 파일 작성 (7개 환경변수)

  ```bash
  NEXTAUTH_URL=http://localhost:3000
  NEXTAUTH_SECRET=                    # openssl rand -base64 32
  GITHUB_ID=
  GITHUB_SECRET=
  ANTHROPIC_API_KEY=
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=          # Supabase → Settings → API → service_role
  ```

- [x] 로컬 end-to-end 테스트 — 로그인 → AI 생성 → Supabase 저장 → `/{username}` 공개 URL 확인

---

## Phase 1 — UI/UX 완성

- [x] 대시보드 진입 시 기존 포트폴리오 불러오기
  - `GET /api/portfolio?username=xxx` 호출 → 화면에 렌더
  - 새로고침해도 기존 포폴 유지되도록
- [x] AI 생성 중 로딩 UI 개선
  - 스피너 + `"레포 분석 중... (최대 30초 소요)"` 안내 메시지
  - 버튼 전체 비활성화 (현재는 `disabled` 처리만 있음)
- [x] 에러 핸들링 UI 개선
  - 에러 종류별 메시지: 인증 만료 / GitHub API 한도 / AI 파싱 실패
  - 현재는 단순 텍스트만 노출
- [x] 재생성 버튼 추가
  - 이미 포폴 있을 때 "다시 생성" 클릭 시 덮어쓰기 확인 모달
- [x] 공개 포트폴리오 페이지 디자인 개선
  - 상단에 아바타 + 이름 + GitHub 링크 추가 (GitHub 유저 정보 저장 필요)
  - 모바일 반응형 점검
- [x] 네비게이션 바 추가
  - 로고, 로그인 상태에 따라 "내 포트폴리오 보기" 링크 노출
- [x] 랜딩페이지 개선
  - 데모 포트폴리오 링크 또는 스크린샷 추가
  - "어떻게 작동하나요?" 기능 설명 섹션 추가

---

## Phase 2 — UI/UX 개선

- [x] 생성 완료 토스트 메시지
  - 로딩 끝난 후 "✓ 포트폴리오가 생성됐어요" 피드백 노출
- [x] 공개 링크 클립보드 복사 버튼
  - 링크 옆 복사 아이콘 클릭 시 URL 복사 + "복사됨" 피드백
- [x] 대시보드 기존 포트폴리오 로딩 스켈레톤
  - 진입 시 데이터 불러오는 동안 빈 화면 대신 스켈레톤 UI
- [x] 공개 포트폴리오 하단 "나도 만들기" CTA
  - 다른 사람 포트폴리오 하단에 서비스 유입 버튼 추가
- [x] OG 메타태그
  - `/[username]` 페이지에 `title`, `description`, `og:image` (깃헙 아바타 활용)
  - SNS 공유 시 미리보기 노출

---

<!-- ## Phase 3 — 배포 (Vercel)

- [ ] Vercel 프로젝트 연결 (`vercel link` 또는 GitHub 연동)
- [ ] Vercel에 환경변수 7개 등록 (service_role key 포함)
- [ ] GitHub OAuth App에 프로덕션 Callback URL 추가
  - `https://your-domain.vercel.app/api/auth/callback/github`
- [ ] `NEXTAUTH_URL`을 프로덕션 URL로 업데이트
- [ ] 프로덕션 배포 후 end-to-end 재테스트 -->

## Phase 3 — 배포 (Netlify)

- [x] Netlify 프로젝트 연결 (GitHub 연동)
- [x] Netlify에 환경변수 8개 등록
  - `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`
  - `ANTHROPIC_API_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `ADMIN_USERNAME`
- [x] GitHub OAuth App에 프로덕션 Callback URL 추가
  - `https://your-domain.netlify.app/api/auth/callback/github`
- [x] `NEXTAUTH_URL`을 프로덕션 URL로 업데이트
- [x] 프로덕션 배포 후 end-to-end 재테스트

---

## Phase 4 — 런치 준비

- [x] OG 메타태그 추가 — `/[username]` 페이지에 `title`, `description`, `og:image` (깃헙 아바타 활용)
- [x] 공유 링크 옆 "링크 복사" 버튼 추가
- [ ] 실제 개발자 5명한테 링크 공유 + 피드백 수집

---

## Phase 5 — 수익화 (유저 확보 후 진행)

### 개발자 생성 횟수 제한 (Free 플랜)

- [x] Supabase `portfolios` 테이블에 `generated_count`, `last_reset_at` 컬럼 추가
- [x] `/api/generate` 에서 월 5회 초과 시 `429` 에러 반환
- [x] 대시보드에 남은 생성 횟수 표시 (예: "이번 달 3/5회 사용")
- [x] 횟수 초과 시 안내 메시지 노출

### 채용 담당자 전용 페이지 (B2B)

- [x] `/recruiters` 페이지 — 서비스 소개 + 유료 플랜 안내
- [x] admin 페이지 확장 — 스택/경력 수준 필터 추가
- [x] GitHub public email 노출 기능 — Contact 수단
- [ ] 채용 담당자 계정 플랜 관리 (Stripe 연동 시)

### 결제 연동 (타이밍 봐서)

> 사업자 없이 시작 가능한 **Lemon Squeezy** (MoR 방식, 세금 처리 위임) 사용 예정
> Stripe는 한국 계좌 연결 복잡 + 사업자 필요 → 초기에는 부적합

- [ ] Lemon Squeezy 가입 + 상품 2개 등록 (개발자 Pro / 채용 담당자)
- [ ] Lemon Squeezy Webhook → `/api/webhook/lemonsqueezy` 로 결제 완료 이벤트 수신
- [ ] 결제 완료 시 Supabase `users` 테이블 `plan` 컬럼 업데이트 (`free` → `pro` / `recruiter`)
- [ ] 플랜별 기능 분기 처리 (생성 횟수 제한 해제, 채용 담당자 목록 열람 등)
