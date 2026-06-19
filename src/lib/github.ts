import type { GithubRepo, GithubUser } from '@/types/portfolio';

const GITHUB_API = 'https://api.github.com';

function githubHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github.v3+json',
  };
}

export async function getAuthenticatedUser(accessToken: string): Promise<GithubUser> {
  const response = await fetch(`${GITHUB_API}/user`, {
    headers: githubHeaders(accessToken),
  });
  if (!response.ok) throw new Error(`Failed to fetch GitHub user: ${response.status}`);
  return response.json();
}

export async function getRepositories(accessToken: string): Promise<GithubRepo[]> {
  const response = await fetch(
    `${GITHUB_API}/user/repos?sort=updated&per_page=30`,
    { headers: githubHeaders(accessToken) }
  );
  if (!response.ok) throw new Error(`Failed to fetch repositories: ${response.status}`);
  const repos: GithubRepo[] = await response.json();
  return repos.filter((repo) => !repo.fork);
}

export async function getReadme(
  owner: string,
  repo: string,
  accessToken: string
): Promise<string | null> {
  try {
    const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/readme`, {
      headers: githubHeaders(accessToken),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return Buffer.from(data.content, 'base64').toString('utf-8');
  } catch {
    return null;
  }
}

export async function getRecentCommits(
  owner: string,
  repo: string,
  accessToken: string
): Promise<string[]> {
  try {
    const response = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/commits?per_page=10`,
      { headers: githubHeaders(accessToken) }
    );
    if (!response.ok) return [];
    const commits = await response.json();
    return commits.map((c: { commit: { message: string } }) => c.commit.message);
  } catch {
    return [];
  }
}

// Enriches the top N repos (by recency) with README + commit data for the AI prompt.
export async function enrichTopRepositories(
  repos: GithubRepo[],
  accessToken: string,
  limit = 10
): Promise<GithubRepo[]> {
  const top = repos.slice(0, limit);
  const enriched = await Promise.all(
    top.map(async (repo) => {
      const [owner, name] = repo.full_name.split('/');
      const [readme, commits] = await Promise.all([
        getReadme(owner, name, accessToken),
        getRecentCommits(owner, name, accessToken),
      ]);
      return { ...repo, readme, commits };
    })
  );
  return enriched;
}
