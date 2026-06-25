import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

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

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (session?.login !== ADMIN) redirect('/');

  const { data: portfolios } = await getSupabaseAdmin()
    .from('portfolios')
    .select('username, updated_at')
    .order('updated_at', { ascending: false });

  const rows = portfolios ?? [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 border-b border-zinc-100 pb-6 dark:border-zinc-800">
        <h1 className="text-xl font-semibold">관리자 대시보드</h1>
        <p className="mt-1 text-sm text-zinc-400">포트폴리오를 생성한 유저 목록</p>
      </div>

      <div className="mb-6 flex gap-6">
        <div className="rounded-xl border border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <p className="text-2xl font-bold">{rows.length}</p>
          <p className="text-xs text-zinc-400">총 유저</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-zinc-400">아직 생성된 포트폴리오가 없습니다.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">#</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">유저</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">포트폴리오</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">마지막 생성</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.username}
                  className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900/50 transition-colors"
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
                    <a
                      href={`/${row.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      /{row.username} ↗
                    </a>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{timeAgo(row.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
