# Portfolio Builder

깃헙 OAuth 로그인 → 레포/README/커밋 분석 → Claude가 포트폴리오 데이터 생성 → `{username}` 경로로 공유.

## 시작하기

```bash
cp .env.local.example .env.local   # 값 채워넣기
npm run dev
```

<http://localhost:3000> 에서 확인.

## 흐름

1. `/` 에서 깃헙으로 로그인 (`src/app/api/auth/[...nextauth]/route.ts`)
2. `/dashboard` 에서 "AI로 포트폴리오 생성하기" 클릭 → `POST /api/generate` 가 깃헙 레포/README/커밋을 모아 Claude에 보내고 JSON 포트폴리오를 받음
3. "공유 링크 생성" 클릭 → `POST /api/portfolio` 가 Supabase `portfolios` 테이블에 저장
4. `/{username}` 에서 공개 포트폴리오 페이지 렌더링

## Supabase 테이블

```sql
create table portfolios (
  username text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
```

## 환경변수

`.env.local.example` 참고. GitHub OAuth 앱은 <https://github.com/settings/developers> 에서 생성하고,
Authorization callback URL은 `http://localhost:3000/api/auth/callback/github` 로 설정.

## 폴더 구조

```text
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── generate/route.ts
│   │   └── portfolio/route.ts
│   ├── [username]/page.tsx
│   ├── dashboard/page.tsx
│   └── page.tsx
├── lib/
│   ├── auth.ts
│   ├── github.ts
│   └── supabase.ts
├── types/
│   ├── portfolio.ts
│   └── next-auth.d.ts
└── components/
    ├── AuthButton.tsx
    ├── Providers.tsx
    ├── PortfolioCard.tsx
    ├── ProjectCard.tsx
    └── SkillBadge.tsx
```

## 제외된 것 (MVP 이후)

커스텀 도메인, 테마 커스터마이징, PDF 내보내기, 애널리틱스, 다국어 지원, 결제(Paddle/토스).
