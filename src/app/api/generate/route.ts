import { getServerSession } from 'next-auth';
import Anthropic from '@anthropic-ai/sdk';
import { authOptions } from '@/lib/auth';
import { getAuthenticatedUser, getRepositories, enrichTopRepositories } from '@/lib/github';
import type { GithubRepo, GithubUser } from '@/types/portfolio';

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
- 최근 커밋: ${repo.commits?.slice(0, 5).join(', ') || '없음'}
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
    "mainLanguage": "가장 많이 쓴 언어",
    "experienceLevel": "Junior | Mid | Senior"
  }
}

작성 기준:
- 채용담당자가 30초 안에 이 개발자를 이해할 수 있어야 함
- README가 없거나 부실해도 커밋 메시지로 유추해서 작성
- 기술적인 용어보다 임팩트와 가치 중심으로 서술
- 프로젝트는 스타/최신순으로 상위 5개만 선정
`;

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return Response.json({ error: 'auth_expired' }, { status: 401 });
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

    try {
      const json = content.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
      const portfolio = JSON.parse(json);
      return Response.json(portfolio);
    } catch {
      return Response.json({ error: 'ai_parse_failed' }, { status: 502 });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('rate limit') || msg.includes('403')) {
      return Response.json({ error: 'github_rate_limit' }, { status: 429 });
    }
    throw e;
  }
}
