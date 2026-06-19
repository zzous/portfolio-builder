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

- [ ] Supabase 프로젝트 생성 + `portfolios` 테이블 생성
  ```sql
  create table portfolios (
    username    text primary key,
    data        jsonb not null,
    updated_at  timestamptz not null default now()
  );
  ```
- [ ] GitHub OAuth App 등록 (`github.com/settings/developers` → New OAuth App)
  - Homepage URL: `http://localhost:3000`
  - Callback URL: `http://localhost:3000/api/auth/callback/github`
- [ ] `.env.local` 파일 작성 (6개 환경변수)
  ```bash
  NEXTAUTH_URL=http://localhost:3000
  NEXTAUTH_SECRET=          # openssl rand -base64 32
  GITHUB_ID=
  GITHUB_SECRET=
  ANTHROPIC_API_KEY=
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  ```
- [ ] 로컬 end-to-end 테스트 — 로그인 → AI 생성 → Supabase 저장 → `/{username}` 공개 URL 확인

---

## Phase 1 — UI/UX 완성

- [ ] 대시보드 진입 시 기존 포트폴리오 불러오기
  - `GET /api/portfolio?username=xxx` 호출 → 화면에 렌더
  - 새로고침해도 기존 포폴 유지되도록
- [ ] AI 생성 중 로딩 UI 개선
  - 스피너 + `"레포 분석 중... (최대 30초 소요)"` 안내 메시지
  - 버튼 전체 비활성화 (현재는 `disabled` 처리만 있음)
- [ ] 에러 핸들링 UI 개선
  - 에러 종류별 메시지: 인증 만료 / GitHub API 한도 / AI 파싱 실패
  - 현재는 단순 텍스트만 노출
- [ ] 재생성 버튼 추가
  - 이미 포폴 있을 때 "다시 생성" 클릭 시 덮어쓰기 확인 모달
- [ ] 공개 포트폴리오 페이지 디자인 개선
  - 상단에 아바타 + 이름 + GitHub 링크 추가 (GitHub 유저 정보 저장 필요)
  - 모바일 반응형 점검
- [ ] 네비게이션 바 추가
  - 로고, 로그인 상태에 따라 "내 포트폴리오 보기" 링크 노출
- [ ] 랜딩페이지 개선
  - 데모 포트폴리오 링크 또는 스크린샷 추가
  - "어떻게 작동하나요?" 기능 설명 섹션 추가

---

## Phase 2 — 배포

- [ ] Vercel 프로젝트 연결 (`vercel link` 또는 GitHub 연동)
- [ ] Vercel에 환경변수 6개 등록
- [ ] GitHub OAuth App에 프로덕션 Callback URL 추가
  - `https://your-domain.vercel.app/api/auth/callback/github`
- [ ] `NEXTAUTH_URL`을 프로덕션 URL로 업데이트
- [ ] 프로덕션 배포 후 end-to-end 재테스트

---

## Phase 3 — 런치 준비

- [ ] OG 메타태그 추가 — `/[username]` 페이지에 `title`, `description`, `og:image` (깃헙 아바타 활용)
- [ ] 공유 링크 옆 "링크 복사" 버튼 추가
- [ ] 실제 개발자 5명한테 링크 공유 + 피드백 수집
