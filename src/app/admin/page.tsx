import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { AdminFilters } from '@/components/AdminFilters';
import type { PortfolioData } from '@/types/portfolio';

const ADMIN = process.env.ADMIN_USERNAME ?? 'zzous';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (mins > 0) return `${mins}분 전`;
  return '방금 전';
}

const LEVEL_COLOR: Record<string, string> = {
  Junior: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  Mid: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  Senior: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { level?: string; lang?: string };
}) {
  const session = await getServerSession(authOptions);
  if (session?.login !== ADMIN) redirect('/');

  const { data: portfolios } = await getSupabaseAdmin()
    .from('portfolios')
    .select('username, updated_at, data, is_public')
    .order('updated_at', { ascending: false });

  const rows = (portfolios ?? []) as {
    username: string;
    updated_at: string;
    data: PortfolioData;
    is_public: boolean;
  }[];

  // 필터 옵션 추출
  const levels = Array.from(new Set(rows.map((r) => r.data?.stats?.experienceLevel).filter(Boolean))) as string[];
  const languages = Array.from(new Set(rows.flatMap((r) => r.data?.stats?.mainStack ?? []).filter(Boolean))) as string[];

  const publicCount = rows.filter((r) => r.is_public).length;

  // 필터 적용
  const filtered = rows.filter((r) => {
    const levelMatch = !searchParams.level || r.data?.stats?.experienceLevel === searchParams.level;
    const langMatch = !searchParams.lang || (r.data?.stats?.mainStack ?? []).includes(searchParams.lang);
    return levelMatch && langMatch;
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 border-b border-zinc-100 pb-6 dark:border-zinc-800">
        <h1 className="text-xl font-semibold">관리자 대시보드</h1>
        <p className="mt-1 text-sm text-zinc-400">포트폴리오를 생성한 유저 목록</p>
      </div>

      <div className={`mb-6 grid gap-4 ${searchParams.level || searchParams.lang ? 'grid-cols-4' : 'grid-cols-3'}`}>
        <div className="rounded-lg border border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <p className="text-2xl font-bold">{rows.length}</p>
          <p className="text-xs text-zinc-400">총 유저</p>
        </div>
        <div className="rounded-lg border border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{publicCount}</p>
          <p className="text-xs text-zinc-400">공개</p>
        </div>
        <div className="rounded-lg border border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <p className="text-2xl font-bold text-zinc-500">{rows.length - publicCount}</p>
          <p className="text-xs text-zinc-400">비공개</p>
        </div>
        {searchParams.level || searchParams.lang ? (
          <div className="rounded-lg border border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <p className="text-2xl font-bold">{filtered.length}</p>
            <p className="text-xs text-zinc-400">필터 결과</p>
          </div>
        ) : null}
      </div>

      <div className="mb-4">
        <AdminFilters
          levels={levels}
          languages={languages}
          selectedLevel={searchParams.level ?? ''}
          selectedLang={searchParams.lang ?? ''}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-400">조건에 맞는 포트폴리오가 없습니다.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">#</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">유저</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">경력</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">주요 언어</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">공개</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">포트폴리오</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">마지막 생성</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const level = row.data?.stats?.experienceLevel;
                const lang = row.data?.stats?.mainStack?.join(' · ');
                return (
                  <tr
                    key={row.username}
                    className="border-b border-zinc-50 last:border-0 transition-colors hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900/50"
                  >
                    <td className="px-4 py-3 text-zinc-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">
                      <a
                        href={`https://github.com/${row.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        @{row.username}
                      </a>
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
                      {row.is_public ? (
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600 dark:bg-green-900/30 dark:text-green-400">
                          공개
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                          비공개
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/${row.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                      >
                        /{row.username} ↗
                      </a>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{timeAgo(row.updated_at)}</td>
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
