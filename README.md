# Portfolio Builder

깃헙 로그인 한 번으로, AI가 내 레포를 분석해 포트폴리오를 자동으로 만들어줍니다.

🔗 **[p-builder.netlify.app](https://p-builder.netlify.app/)**

---

## 이런 분께

- 포트폴리오 만들기 귀찮은 취준·이직 준비 개발자
- 사이드 프로젝트는 많은데 정리가 안 된 개발자
- 자기소개서 쓰기 전에 내 깃헙이 어떻게 보이는지 궁금한 개발자

자기소개서를 새로 쓸 필요 없이, 이미 깃헙에 쌓아둔 커밋과 레포가 곧 포트폴리오가 됩니다.

---

## 무엇을 해주나요

- **자동 분석** — 깃헙 레포·README·커밋 히스토리를 AI가 읽고 정리
- **한눈에 보이는 프로필** — 한줄 소개, 주요 스택, 경력 수준, 대표 프로젝트 자동 생성
- **공유 링크** — `p-builder.netlify.app/{내 깃헙 아이디}` 주소로 바로 공유
- **공개 / 비공개 전환** — 노출하고 싶을 때만 공개, 언제든 다시 숨기기
- **개발자 둘러보기** — 다른 개발자들의 공개 포트폴리오를 스택·경력별로 탐색

---

## 사용 방법

1. **로그인** — "깃헙으로 시작하기" 클릭
2. **생성** — 대시보드에서 "AI로 포트폴리오 생성하기" 클릭 (레포 분석에 최대 30초 소요)
3. **공유** — 생성되면 `/{내 깃헙 아이디}` 공개 링크가 자동으로 발급됩니다
4. **공개 설정** — 대시보드의 공개/비공개 토글로 노출 여부를 직접 관리

생성된 포트폴리오는 자동 저장되며, 언제든 "다시 생성"으로 갱신할 수 있어요.
무료 플랜은 월 5회까지 생성할 수 있습니다.

---

## 직접 둘러보기

- 랜딩: [p-builder.netlify.app](https://p-builder.netlify.app/)
- 개발자 목록: [p-builder.netlify.app/browse](https://p-builder.netlify.app/browse)

---

## 로컬 개발

> 직접 띄워보거나 기여하려는 분들을 위한 안내입니다.

### 사전 준비

| 항목 | 발급 위치 |
| --- | --- |
| GitHub OAuth App | [github.com/settings/developers](https://github.com/settings/developers) → New OAuth App |
| Anthropic API Key | [console.anthropic.com](https://console.anthropic.com) |
| Supabase 프로젝트 | [supabase.com](https://supabase.com) → New Project |

### 1. Supabase 테이블 생성

Supabase 대시보드 → SQL Editor에서 실행:

```sql
create table portfolios (
  username        text primary key,
  data            jsonb not null,
  updated_at      timestamptz not null default now(),
  generated_count integer not null default 0,
  last_reset_at   timestamptz not null default now(),
  is_public       boolean not null default true
);
```

### 2. GitHub OAuth App 설정

[github.com/settings/developers](https://github.com/settings/developers) → **New OAuth App**

- **Homepage URL**: `http://localhost:3000`
- **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

등록 후 **Client ID**와 **Client Secret** 복사.

### 3. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 열어서 값 채우기:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=        # 터미널에서 `openssl rand -base64 32` 실행해서 복사

GITHUB_ID=              # OAuth App Client ID
GITHUB_SECRET=          # OAuth App Client Secret

ANTHROPIC_API_KEY=      # sk-ant-...

NEXT_PUBLIC_SUPABASE_URL=        # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service_role key (서버 전용)

ADMIN_USERNAME=         # 관리자 페이지 접근용 깃헙 아이디
```

### 4. 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속.

---

## 기술 스택

Next.js 14 (App Router) · Tailwind CSS · NextAuth.js · Anthropic Claude API · Supabase · Netlify

## 폴더 구조

```text
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # GitHub OAuth
│   │   ├── generate/route.ts             # AI 포트폴리오 생성
│   │   └── portfolio/route.ts            # Supabase 저장/조회/공개 설정
│   ├── [username]/page.tsx               # 공개 포트폴리오 페이지
│   ├── browse/page.tsx                   # 개발자 목록 (공개)
│   ├── recruiters/page.tsx               # 채용 담당자 소개 페이지
│   ├── admin/page.tsx                    # 관리자 대시보드
│   ├── dashboard/page.tsx                # 내 포트폴리오 대시보드
│   └── page.tsx                          # 랜딩페이지
├── lib/
│   ├── auth.ts
│   ├── github.ts
│   └── supabase.ts
├── types/
│   ├── portfolio.ts
│   └── next-auth.d.ts
└── components/
    ├── AuthButton.tsx
    ├── Navbar.tsx
    ├── Footer.tsx
    ├── Toast.tsx
    ├── PortfolioCard.tsx
    ├── ProjectCard.tsx
    ├── SkillBadge.tsx
    ├── AdminFilters.tsx
    └── Providers.tsx
```
