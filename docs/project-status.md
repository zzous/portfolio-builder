# 포트폴리오 빌더 - 현재 구현 상태

> 마지막 업데이트: 2026-06-19

---

## 프로젝트 한줄 요약

깃헙 로그인 → AI가 레포 분석 → 포트폴리오 페이지 자동 생성 → `/{username}` 공유 링크 발급

---

## 구현 완료된 것들

### 인프라 / 설정
- [x] Next.js 14 (App Router) 프로젝트 세팅
- [x] Tailwind CSS 적용
- [x] NextAuth.js GitHub OAuth (`read:user user:email repo` 스코프)
- [x] Supabase 클라이언트 연결 (lazy init)
- [x] Anthropic SDK 연결 (`claude-sonnet-4-6`)

### API 라우트 3개
| 라우트 | 메서드 | 역할 |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | GitHub OAuth 처리 |
| `/api/generate` | POST | AI 포트폴리오 생성 |
| `/api/portfolio` | GET/POST | Supabase 저장/조회 |

### 페이지 3개
| 경로 | 역할 |
|---|---|
| `/` | 랜딩페이지 (헤드라인 + 깃헙 로그인 버튼) |
| `/dashboard` | 포트폴리오 생성 & 공유 링크 발급 |
| `/[username]` | 공개 포트폴리오 페이지 (SSR) |

### 컴포넌트 4개
- `AuthButton` — 로그인/로그아웃 토글
- `PortfolioCard` — 전체 포트폴리오 레이아웃 (headline, stats, projects)
- `ProjectCard` — 프로젝트 카드 (설명, highlights, techStack)
- `SkillBadge` — 기술스택 뱃지

---

## 파일 구조 (현재)

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   ← OAuth 핸들러
│   │   ├── generate/route.ts             ← AI 생성 (핵심 로직)
│   │   └── portfolio/route.ts            ← Supabase CRUD
│   ├── [username]/page.tsx               ← 공개 포폴 페이지 (SSR)
│   ├── dashboard/page.tsx                ← 대시보드 (클라이언트)
│   ├── layout.tsx                        ← Providers 래핑
│   ├── page.tsx                          ← 랜딩페이지
│   └── globals.css
├── components/
│   ├── AuthButton.tsx
│   ├── PortfolioCard.tsx
│   ├── ProjectCard.tsx
│   ├── Providers.tsx                     ← SessionProvider 래퍼
│   └── SkillBadge.tsx
├── lib/
│   ├── auth.ts                           ← NextAuth 설정
│   ├── github.ts                         ← GitHub API 유틸
│   └── supabase.ts                       ← Supabase 클라이언트
└── types/
    ├── portfolio.ts                      ← PortfolioData, GithubRepo, GithubUser
    └── next-auth.d.ts                    ← accessToken 타입 확장
```

---

## 핵심 로직 흐름

### AI 생성 (`/api/generate`)
```
세션에서 accessToken 추출
        ↓
GitHub API: 유저 정보 + 레포 목록 (포크 제외, 최근 30개)
        ↓
상위 10개 레포 enrichment (README + 최근 커밋 10개 병렬 fetch)
        ↓
Claude에게 프롬프트 전송 (JSON only 응답 요구)
        ↓
PortfolioData JSON 파싱 후 반환
```

### 저장 & 공유 (`/api/portfolio`)
```
POST: portfolio JSON → Supabase portfolios 테이블 upsert (username이 PK)
GET:  ?username=xxx → Supabase에서 조회
```

### 공개 페이지 (`/[username]`)
```
SSR: Supabase에서 data 조회
        ↓
없으면 notFound() → 404
있으면 PortfolioCard 렌더
```

---

## 타입 구조 (`PortfolioData`)

```typescript
interface PortfolioData {
  intro: {
    headline: string;      // 50자 이내 한줄 소개
    bio: string;           // 3~4줄 소개글
    skills: string[];      // 최대 10개 기술스택
  };
  projects: {
    name: string;
    description: string;   // 2~3줄, 무엇을 왜 만들었는지
    techStack: string[];
    highlights: string[];  // 핵심 특징 목록
    type: 'personal' | 'team' | 'opensource';
  }[];                     // 상위 5개
  stats: {
    totalProjects: number;
    mainLanguage: string;
    experienceLevel: 'Junior' | 'Mid' | 'Senior';
  };
}
```

---

## 환경변수 (`.env.local` 필요)

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=                          # openssl rand -base64 32

GITHUB_ID=                                # github.com/settings/developers
GITHUB_SECRET=

ANTHROPIC_API_KEY=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Supabase 테이블 스키마 (미구현 — 직접 생성 필요)

```sql
create table portfolios (
  username    text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);
```

---

## 아직 안 된 것들 (MVP 기준)

| 항목 | 우선순위 | 비고 |
|---|---|---|
| Supabase 테이블 생성 | 즉시 | 위 SQL 실행 필요 |
| 환경변수 세팅 | 즉시 | `.env.local` 작성 |
| 에러 상태 UI 개선 | 낮음 | 현재 텍스트만 노출 |
| 로딩 스켈레톤 | 낮음 | AI 응답 최대 10~15초 |
| OG 이미지 / 메타태그 | 낮음 | 공유 링크 미리보기 |
| 재생성 버튼 | 중간 | 이미 포폴 있을 때 업데이트 |
| 네비게이션 바 | 낮음 | 현재 없음 |

---

## 4주 플랜 현황

- **1주차** ✅ — GitHub OAuth + 레포 데이터 + AI 분석 코어 구현 완료
- **2주차** 🔄 — 포트폴리오 UI 기본 완료, 서브도메인 라우팅은 미구현 (패스 경로로 대체)
- **3주차** ⬜ — Supabase 연결 코드는 있으나 테이블 생성 + 환경변수 세팅 필요
- **4주차** ⬜ — 실제 개발자 5명한테 보여주기
