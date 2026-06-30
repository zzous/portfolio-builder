import type { Metadata } from 'next';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { AdminFilters } from '@/components/AdminFilters';
import type { PortfolioData } from '@/types/portfolio';

export const metadata: Metadata = {
  title: '개발자 목록 — 포트폴리오 빌더',
  description: 'AI가 분석한 개발자 포트폴리오 목록. 스택·경력 수준별로 필터링해보세요.',
};

const LEVEL_COLOR: Record<string, string> = {
  Junior: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  Mid: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  Senior: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
};

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { level?: string; lang?: string };
}) {
  const { data: portfolios } = await getSupabase()
    .from('portfolios')
    .select('username, data, updated_at')
    .eq('is_public', true)
    .order('updated_at', { ascending: false });

  const rows = (portfolios ?? []) as {
    username: string;
    updated_at: string;
    data: PortfolioData;
  }[];

  const levels = Array.from(new Set(rows.map((r) => r.data?.stats?.experienceLevel).filter(Boolean))) as string[];
  const languages = Array.from(new Set(rows.flatMap((r) => r.data?.stats?.mainStack ?? []).filter(Boolean))) as string[];

  const filtered = rows.filter((r) => {
    const levelMatch = !searchParams.level || r.data?.stats?.experienceLevel === searchParams.level;
    const langMatch = !searchParams.lang || (r.data?.stats?.mainStack ?? []).includes(searchParams.lang);
    return levelMatch && langMatch;
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 border-b border-zinc-100 pb-6 dark:border-zinc-800">
        <h1 className="text-xl font-semibold">개발자 목록</h1>
        <p className="mt-1 text-sm text-zinc-400">
          GitHub 레포 기반으로 AI가 분석한 포트폴리오입니다.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <AdminFilters
          levels={levels}
          languages={languages}
          selectedLevel={searchParams.level ?? ''}
          selectedLang={searchParams.lang ?? ''}
        />
        <p className="text-sm text-zinc-400">
          {filtered.length}명
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-400">조건에 맞는 개발자가 없습니다.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">개발자</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">한줄 소개</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">경력</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">주요 언어</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const level = row.data?.stats?.experienceLevel;
                const lang = row.data?.stats?.mainStack?.join(' · ');
                const headline = row.data?.intro?.headline;
                return (
                  <tr
                    key={row.username}
                    className="border-b border-zinc-50 last:border-0 transition-colors hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900/50"
                  >
                    <td className="px-4 py-3 font-medium">@{row.username}</td>
                    <td className="max-w-xs px-4 py-3 text-zinc-500">
                      <span className="line-clamp-1">{headline ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      {level ? (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${LEVEL_COLOR[level] ?? 'bg-zinc-100 text-zinc-600'}`}>
                          {level}
                        </span>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{lang ?? <span className="text-zinc-300">—</span>}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/${row.username}`}
                        className="text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                      >
                        보기 ↗
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
