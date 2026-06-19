'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { AuthButton } from '@/components/AuthButton';
import { PortfolioCard } from '@/components/PortfolioCard';
import type { PortfolioData } from '@/types/portfolio';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate', { method: 'POST' });
      if (!res.ok) throw new Error('포트폴리오 생성에 실패했어요');
      setPortfolio(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했어요');
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    if (!portfolio) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portfolio),
      });
      if (!res.ok) throw new Error('공유 링크 생성에 실패했어요');
      const { username } = await res.json();
      setShareUrl(`/${username}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했어요');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'loading') return null;

  if (!session) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-zinc-600 dark:text-zinc-400">먼저 깃헙으로 로그인해주세요.</p>
        <AuthButton />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 포트폴리오</h1>
        <AuthButton />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
        >
          {loading ? '생성 중...' : 'AI로 포트폴리오 생성하기'}
        </button>
        {portfolio && (
          <button
            onClick={handlePublish}
            disabled={loading}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium disabled:opacity-50 dark:border-zinc-700"
          >
            공유 링크 생성
          </button>
        )}
        {shareUrl && (
          <a href={shareUrl} className="text-sm text-blue-600 underline">
            {shareUrl}
          </a>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {portfolio && <PortfolioCard portfolio={portfolio} />}
    </main>
  );
}
