# Portfolio Builder

깃헙 로그인 한 번으로 AI가 포트폴리오 페이지를 자동으로 만들어주는 서비스.

---

## 사전 준비

시작 전에 아래 계정/키가 필요합니다.

| 항목 | 발급 위치 |
| --- | --- |
| GitHub OAuth App | [github.com/settings/developers](https://github.com/settings/developers) → New OAuth App |
| Anthropic API Key | [console.anthropic.com](https://console.anthropic.com) |
| Supabase 프로젝트 | [supabase.com](https://supabase.com) → New Project |

---

## 1. Supabase 테이블 생성

Supabase 대시보드 → SQL Editor에서 실행:

```sql
create table portfolios (
  username    text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);
```

---

## 2. GitHub OAuth App 설정

[github.com/settings/developers](https://github.com/settings/developers) → **New OAuth App**

- **Homepage URL**: `http://localhost:3000`
- **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

등록 후 **Client ID**와 **Client Secret** 복사.

---

## 3. 환경변수 설정

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

NEXT_PUBLIC_SUPABASE_URL=       # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anon key
```

---

## 4. 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속.

---

## 사용 방법

1. **로그인** — "깃헙으로 시작하기" 클릭
2. **생성** — 대시보드에서 "AI로 포트폴리오 생성하기" 클릭 (레포 분석에 최대 30초 소요)
3. **공유** — "공유 링크 생성" 클릭 → `/{깃헙 유저명}` URL 발급
4. **확인** — 발급된 링크로 공개 포트폴리오 페이지 확인

---

## 폴더 구조

```text
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # GitHub OAuth
│   │   ├── generate/route.ts             # AI 포트폴리오 생성
│   │   └── portfolio/route.ts            # Supabase 저장/조회
│   ├── [username]/page.tsx               # 공개 포트폴리오 페이지
│   ├── dashboard/page.tsx                # 대시보드
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
    ├── PortfolioCard.tsx
    ├── ProjectCard.tsx
    ├── SkillBadge.tsx
    └── Providers.tsx
```
