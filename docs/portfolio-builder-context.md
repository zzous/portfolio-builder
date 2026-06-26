# 개발자 포트폴리오 빌더 - 프로젝트 컨텍스트

## 나는 누구인가
- 15년차 프론트엔드 개발자
- AI 툴 이미 활용 중 (Claude, Cursor 등)
- 마이크로 SaaS로 수익화 목표
- 본인도 포트폴리오가 없어서 → 직접 첫 번째 유저

---

## 만들 것
**깃헙 연동 AI 포트폴리오 자동 생성 SaaS**

깃헙 로그인 하나로 AI가 레포를 분석해서 자동으로 포트폴리오 페이지를 만들어주는 서비스

### 타깃 유저
- 포트폴리오 만들기 귀찮은 취준 개발자
- 사이드 프로젝트는 많은데 정리가 안 된 개발자
- 이직 준비 중인 개발자 (시니어 포함)

### 핵심 문제
개발자들이 포트폴리오 못 만드는 이유 = "귀찮아서"
깃헙 연결 하나로 끝나면 그 문제가 해결됨

### 차별화 포인트
> "깃헙 커밋 히스토리 + README를 AI가 읽어서 프로젝트 설명을 자동으로 써준다"
- 기존 툴(read.cv, contra 등)은 수동 입력
- 이건 깃헙 연결만 하면 AI가 알아서 분석

---

## MVP 기능 (이것만 먼저)

```
깃헙 OAuth 로그인
        ↓
레포지토리 목록 불러오기
        ↓
AI가 자동 분석
  - 주요 사용 언어/스택 추출
  - 프로젝트별 한줄 설명 자동 생성 (README + 커밋 기반)
  - 기여도 분석
        ↓
포트폴리오 페이지 자동 생성
  - 본인 소개 (깃헙 bio 기반)
  - 프로젝트 카드들
  - 기술 스택 시각화
        ↓
{username}.도메인.com 으로 공유 링크 생성
```

### MVP에서 제외할 것들
- 커스텀 도메인 연결
- 테마 커스터마이징
- PDF 내보내기
- 애널리틱스
- 다국어 지원

---

## 기술 스택

| 역할 | 기술 |
|---|---|
| 프론트 | Next.js 14 (App Router) |
| 스타일 | Tailwind CSS |
| 인증 | NextAuth.js (GitHub OAuth) |
| AI | Claude API (claude-sonnet-4-6) |
| 깃헙 데이터 | GitHub REST API / GraphQL API |
| DB | Supabase (유저 정보, 생성된 포폴 저장) |
| 배포 | Netlify (추후 상업화 시 Vercel Pro 이전 고려) |
| 결제 | 미정 (현재 수익화 단계 아님) |

---

## 구현 방법

### 1. 깃헙 OAuth 로그인 (NextAuth.js)

```bash
npm i next-auth @auth/supabase-adapter
```

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          // 레포 읽기 권한 요청
          scope: 'read:user user:email repo',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // access_token 저장 → GitHub API 호출에 사용
      if (account) token.accessToken = account.access_token;
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
};
```

### 2. 깃헙 레포 데이터 가져오기

```typescript
// lib/github.ts

// 유저 레포 목록 가져오기
const getRepositories = async (accessToken: string) => {
  const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=30', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  return response.json();
};

// 레포 README 가져오기
const getReadme = async (owner: string, repo: string, accessToken: string) => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const data = await response.json();
    // base64 디코딩
    return Buffer.from(data.content, 'base64').toString('utf-8');
  } catch {
    return null; // README 없는 레포 처리
  }
};

// 최근 커밋 메시지 가져오기
const getRecentCommits = async (owner: string, repo: string, accessToken: string) => {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const commits = await response.json();
  return commits.map((c: any) => c.commit.message);
};
```

### 3. AI 프롬프트 설계

```typescript
// app/api/generate/route.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const buildPrompt = (githubUser: any, repositories: any[]) => `
당신은 개발자 포트폴리오를 자동으로 생성해주는 전문가입니다.
아래 깃헙 정보를 분석해서 매력적인 포트폴리오 데이터를 생성해주세요.

## 유저 정보
- 이름: ${githubUser.name}
- 깃헙 bio: ${githubUser.bio}
- 팔로워: ${githubUser.followers}명
- 공개 레포: ${githubUser.public_repos}개

## 레포지토리 목록
${repositories.map(repo => `
### ${repo.name}
- 설명: ${repo.description || '없음'}
- 주요 언어: ${repo.language}
- 스타: ${repo.stargazers_count}
- README: ${repo.readme?.slice(0, 500) || '없음'}
- 최근 커밋: ${repo.commits?.slice(0, 5).join(', ') || '없음'}
`).join('\n')}

다음 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요:

{
  "intro": {
    "headline": "한줄 자기소개 (50자 이내, 임팩트 있게)",
    "bio": "3~4줄 소개글 (경험, 관심사, 강점 중심)",
    "skills": ["기술스택1", "기술스택2"] // 전체 레포 분석해서 추출, 10개 이내
  },
  "projects": [
    {
      "name": "레포 이름",
      "description": "프로젝트 설명 (2~3줄, 무엇을 왜 만들었는지)",
      "techStack": ["React", "Node.js"],
      "highlights": ["핵심 특징1", "핵심 특징2"],
      "type": "personal | team | opensource"
    }
    // 상위 5개만
  ],
  "stats": {
    "totalProjects": 0,
    "mainLanguage": "가장 많이 쓴 언어",
    "experienceLevel": "Junior | Mid | Senior" // 레포 수, 커밋 패턴, 스택 다양성으로 판단
  }
}

작성 기준:
- 채용담당자가 30초 안에 이 개발자를 이해할 수 있어야 함
- README가 없거나 부실해도 커밋 메시지로 유추해서 작성
- 기술적인 용어보다 임팩트와 가치 중심으로 서술
`;

export async function POST(req: Request) {
  const { githubUser, repositories } = await req.json();

  const result = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{ role: 'user', content: buildPrompt(githubUser, repositories) }],
  });

  const content = result.content[0].type === 'text' ? result.content[0].text : '';
  return Response.json(JSON.parse(content));
}
```

### 4. 응답 타입 정의

```typescript
// types/portfolio.ts
interface PortfolioData {
  intro: {
    headline: string;
    bio: string;
    skills: string[];
  };
  projects: {
    name: string;
    description: string;
    techStack: string[];
    highlights: string[];
    type: 'personal' | 'team' | 'opensource';
  }[];
  stats: {
    totalProjects: number;
    mainLanguage: string;
    experienceLevel: 'Junior' | 'Mid' | 'Senior';
  };
}
```

---

## 폴더 구조

```
portfolio-builder/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # 깃헙 OAuth
│   │   ├── generate/route.ts            # AI 포폴 생성
│   │   └── portfolio/route.ts           # 포폴 저장/조회
│   ├── [username]/page.tsx              # 공개 포트폴리오 페이지
│   ├── admin/page.tsx                   # 관리자 대시보드 (ADMIN_USERNAME만 접근)
│   ├── dashboard/page.tsx               # 내 포폴 관리
│   └── page.tsx                         # 랜딩페이지
├── lib/
│   ├── github.ts                        # 깃헙 API 유틸
│   └── supabase.ts                      # DB 클라이언트
├── types/
│   └── portfolio.ts                     # 타입 정의
└── components/
    ├── Navbar.tsx
    ├── Footer.tsx
    ├── Toast.tsx
    ├── PortfolioCard.tsx
    ├── ProjectCard.tsx
    └── SkillBadge.tsx
```

---

## 환경변수 (.env.local)

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret          # openssl rand -base64 32

# GitHub OAuth — 로컬/프로덕션 각각 별도 OAuth App 사용
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Anthropic
ANTHROPIC_API_KEY=your-anthropic-api-key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Admin
ADMIN_USERNAME=zzous
```

---

## 4주 플랜

- **1주차** — 깃헙 OAuth + 레포 데이터 가져오기 + AI 분석 코어
- **2주차** — 포트폴리오 페이지 UI + 서브도메인 라우팅
- **3주차** — Supabase 저장 + 공유 링크 생성
- **4주차** — 실제 개발자 5명한테 보여주기

---

## 수익 전략

### 현재 단계: 수익화보다 유저 확보 우선

지금 당장 수익화보다 "이 서비스로 취업됐다"는 사례 1~2개가 훨씬 가치 있음.
그 사례가 생기면 바이럴도 되고 이후 B2B 피칭도 가능해짐.

### 왜 B2C(개발자 개인 과금)는 어려운가

- 취업 후 이탈 → LTV 낮음
- AI 생성 무제한 허용 시 Anthropic API 비용으로 적자 가능
- 개발자들은 무료 툴에 익숙, 결제 전환율 낮음
- 광고는 개발자 대부분이 광고 차단기 사용 + 재방문율 낮아 수익 미미

### 목표 방향: B2B (채용 담당자 과금)

| 대상 | 요금 | 기능 |
|---|---|---|
| 개발자 Free | 무료 | 포트폴리오 생성 월 5회, 공개 링크 |
| 개발자 Pro | 월 $X | 무제한 생성, 추후 결정 |
| 채용 담당자 / 회사 | 월 $29~49 | 포트폴리오 목록 열람 + 필터 + Contact |

#### 왜 B2B인가

- 채용 담당자는 지속적인 니즈 → 이탈률 낮음
- 개발자는 무료라 유입 쉬움 → DB에 포트폴리오 자연스럽게 쌓임
- 현재 admin 페이지가 이미 목록 뼈대로 활용 가능

#### Contact 구현 방향 (단계별)

1. GitHub 링크 노출 — 이미 구현됨
2. GitHub public email 노출 — GitHub API 활용, 간단
3. 인앱 메시지 — 별도 테이블 필요, 추후

### 로드맵

```
지금              →    1~2개월            →    유저 DB 충분히 쌓인 후
무료 오픈              AI 퀄리티 개선          채용 담당자 대상 B2B 전환
유저 유입 집중         취업 사례 만들기         유료 플랜 출시
```

### B2B 전환 조건

채용 담당자가 돈을 내려면 포트폴리오 DB가 최소 수백~수천 개 쌓여야 함.
그 전까지는 유저 확보 + 퀄리티 개선에 집중.

---

## 중요 원칙
> 4주 안에 실제 유저한테 보여주기
> 완성도 올리다가 혼자 6개월 날리지 않기
> 본인 포트폴리오도 이걸로 만들기 (먹고 마시는 독 금지 ㅋㅋ)
