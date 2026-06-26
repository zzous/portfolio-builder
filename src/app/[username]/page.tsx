import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getSupabase } from '@/lib/supabase';
import { PortfolioCard } from '@/components/PortfolioCard';
import { Footer } from '@/components/Footer';
import type { PortfolioData } from '@/types/portfolio';

async function getGithubUser(username: string) {
  const res = await fetch(`https://api.github.com/users/${username}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json() as Promise<{
    login: string;
    name: string | null;
    avatar_url: string;
    html_url: string;
    bio: string | null;
    email: string | null;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const [{ data }, githubUser] = await Promise.all([
    getSupabase().from('portfolios').select('data').eq('username', params.username).single(),
    getGithubUser(params.username),
  ]);

  const portfolio = data?.data as PortfolioData | undefined;
  const name = githubUser?.name ?? params.username;
  const headline = portfolio?.intro?.headline ?? `${name}의 포트폴리오`;
  const description = portfolio?.intro?.bio ?? `${name}의 개발자 포트폴리오`;
  const image = githubUser?.avatar_url ?? '';

  return {
    title: `${name} — ${headline}`,
    description,
    openGraph: {
      title: `${name} — ${headline}`,
      description,
      images: image ? [{ url: image, width: 400, height: 400 }] : [],
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: `${name} — ${headline}`,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function PublicPortfolio({
  params,
}: {
  params: { username: string };
}) {
  const [{ data }, githubUser] = await Promise.all([
    getSupabase().from('portfolios').select('data').eq('username', params.username).single(),
    getGithubUser(params.username),
  ]);

  if (!data) notFound();

  return (
    <main className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-6">
        {githubUser && (
          <div className="mb-10 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <Image
              src={githubUser.avatar_url}
              alt={githubUser.login}
              width={80}
              height={80}
              className="rounded-full ring-2 ring-zinc-200 dark:ring-zinc-700"
            />
            <div>
              <h1 className="text-2xl font-bold">{githubUser.name ?? githubUser.login}</h1>
              {githubUser.bio && (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{githubUser.bio}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                <a
                  href={githubUser.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  @{githubUser.login}
                </a>
                {githubUser.email && (
                  <a
                    href={`mailto:${githubUser.email}`}
                    className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </svg>
                    {githubUser.email}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
        <PortfolioCard portfolio={data.data as PortfolioData} />
        <Footer />
      </div>
    </main>
  );
}
