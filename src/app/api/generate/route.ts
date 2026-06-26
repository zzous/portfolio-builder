import { getServerSession } from 'next-auth';
import Anthropic from '@anthropic-ai/sdk';
import { authOptions } from '@/lib/auth';
import { getAuthenticatedUser, getRepositories, enrichTopRepositories } from '@/lib/github';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { GithubRepo, GithubUser } from '@/types/portfolio';

const FREE_LIMIT = 5;
const ADMIN = process.env.ADMIN_USERNAME ?? 'zzous';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const buildPrompt = (githubUser: GithubUser, repositories: GithubRepo[]) => `
당신은 개발자 포트폴리오를 자동으로 생성해주는 전문가입니다.
아래 깃헙 정보를 분석해서 매력적인 포트폴리오 데이터를 생성해주세요.

## 유저 정보
- 이름: ${githubUser.name}
- 깃헙 bio: ${githubUser.bio}
- 팔로워: ${githubUser.followers}명
- 공개 레포: ${githubUser.public_repos}개

## 레포지토리 목록
${repositories
  .map(
    (repo) => `
### ${repo.name}
- 설명: ${repo.description || '없음'}
- 주요 언어: ${repo.language}
- 스타: ${repo.stargazers_count}
- README: ${repo.readme?.slice(0, 500) || '없음'}
- 최근 커밋: ${repo.commits?.slice(0, 10).join(', ') || '없음'}
`
  )
  .join('\n')}

다음 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요:

{
  "intro": {
    "headline": "한줄 자기소개 (50자 이내, 임팩트 있게)",
    "bio": "3~4줄 소개글 (경험, 관심사, 강점 중심)",
    "skills": ["기술스택1", "기술스택2"]
  },
  "projects": [
    {
      "name": "레포 이름",
      "description": "프로젝트 설명 (2~3줄, 무엇을 왜 만들었는지)",
      "techStack": ["React", "Node.js"],
      "highlights": ["핵심 특징1", "핵심 특징2"],
      "type": "personal | team | opensource"
    }
  ],
  "stats": {
    "totalProjects": 0,
    "mainStack": ["주요 프레임워크1", "주요 프레임워크2"],
    "experienceLevel": "Junior | Mid | Senior"
  }
}

작성 기준:
- 채용담당자가 30초 안에 이 개발자를 이해할 수 있어야 함
- README가 없거나 부실해도 커밋 메시지로 유추해서 작성
- 기술적인 용어보다 임팩트와 가치 중심으로 서술
- 프로젝트는 스타/최신순으로 상위 10개만 선정
- mainStack 선정 기준:
  - 최대 2개, 배열로 반환
  - 프론트엔드: Vue / React / Angular / Svelte 등 프레임워크 우선. TypeScript · JavaScript는 도구이므로 절대 포함하지 말 것
  - 백엔드: Spring / Django / Rails / NestJS 등 프레임워크 우선. Java · Python · Ruby는 프레임워크가 없을 때만 포함
  - 풀스택: 프론트와 백엔드 각 1개씩 선정
`;

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || !session.login) {
    return Response.json({ error: 'auth_expired' }, { status: 401 });
  }

  const username = session.login;

  // 월별 생성 횟수 체크
  const { data: row } = await getSupabaseAdmin()
    .from('portfolios')
    .select('generated_count, last_reset_at')
    .eq('username', username)
    .single();

  const now = new Date();
  const lastReset = row?.last_reset_at ? new Date(row.last_reset_at) : null;
  const isNewMonth =
    !lastReset ||
    lastReset.getFullYear() !== now.getFullYear() ||
    lastReset.getMonth() !== now.getMonth();
  const currentCount = isNewMonth ? 0 : (row?.generated_count ?? 0);

  if (currentCount >= FREE_LIMIT && username !== ADMIN) {
    return Response.json({ error: 'generation_limit_exceeded' }, { status: 429 });
  }

  try {
    const [githubUser, repos] = await Promise.all([
      getAuthenticatedUser(session.accessToken),
      getRepositories(session.accessToken),
    ]);
    const repositories = await enrichTopRepositories(repos, session.accessToken);

    const result = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [{ role: 'user', content: buildPrompt(githubUser, repositories) }],
    });

    const content = result.content[0].type === 'text' ? result.content[0].text : '';

    let portfolio;
    try {
      const json = content.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
      portfolio = JSON.parse(json);
    } catch {
      return Response.json({ error: 'ai_parse_failed' }, { status: 502 });
    }

    // 포트폴리오 저장 + 횟수 업데이트
    const newCount = currentCount + 1;
    await getSupabaseAdmin()
      .from('portfolios')
      .upsert(
        {
          username,
          data: portfolio,
          updated_at: now.toISOString(),
          generated_count: newCount,
          last_reset_at: isNewMonth ? now.toISOString() : (row?.last_reset_at ?? now.toISOString()),
        },
        { onConflict: 'username' }
      );

    return Response.json({ portfolio, generatedCount: newCount });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('rate limit') || msg.includes('403')) {
      return Response.json({ error: 'github_rate_limit' }, { status: 429 });
    }
    throw e;
  }
}
