'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PortfolioCard } from '@/components/PortfolioCard';
import { Toast } from '@/components/Toast';
import type { PortfolioData } from '@/types/portfolio';

const LOADING_STEPS = [
  '레포지토리 분석 중',
  'README 읽는 중',
  '커밋 히스토리 파악 중',
  'AI가 포트폴리오 작성 중',
  '마무리 중',
];

function LoadingIndicator() {
  const [step, setStep] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotTimer = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 400);
    const stepTimer = setInterval(() => {
      setStep((s) => (s < LOADING_STEPS.length - 1 ? s + 1 : s));
    }, 5000);
    return () => {
      clearInterval(dotTimer);
      clearInterval(stepTimer);
    };
  }, []);

  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      <div className="flex gap-1.5">
        {LOADING_STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-8 rounded-full transition-all duration-500 ${
              i <= step ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700'
            }`}
          />
        ))}
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {LOADING_STEPS[step]}{dots}
      </p>
      <p className="text-xs text-zinc-400 dark:text-zinc-600">최대 30초 소요됩니다</p>
    </div>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="mt-8 space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-7 w-3/4 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-4 w-full rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-4 w-5/6 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        <div className="mt-4 flex gap-2">
          {[80, 64, 96, 72, 56].map((w) => (
            <div key={w} className={`h-6 w-${w / 4} rounded-full bg-zinc-100 dark:bg-zinc-800`} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2 text-center">
            <div className="mx-auto h-6 w-12 rounded bg-zinc-100 dark:bg-zinc-800" />
            <div className="mx-auto h-3 w-10 rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3 rounded-lg border border-zinc-100 p-5 dark:border-zinc-800">
          <div className="h-5 w-1/3 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-4 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-4 w-4/5 rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [generatedCount, setGeneratedCount] = useState<number | null>(null);

  useEffect(() => {
    if (!session?.login) return;
    setFetching(true);
    fetch(`/api/portfolio?username=${session.login}`)
      .then((r) => r.ok ? r.json() : null)
      .then((res) => {
        if (res?.data) {
          setPortfolio(res.data);
          setShareUrl(`/${session.login}`);
          // 월이 다르면 0으로 표시
          const lastReset = res.last_reset_at ? new Date(res.last_reset_at) : null;
          const now = new Date();
          const isNewMonth =
            !lastReset ||
            lastReset.getFullYear() !== now.getFullYear() ||
            lastReset.getMonth() !== now.getMonth();
          setGeneratedCount(isNewMonth ? 0 : (res.generated_count ?? 0));
        }
      })
      .finally(() => setFetching(false));
  }, [session]);

  const ERROR_MESSAGES: Record<string, string> = {
    auth_expired: '로그인이 만료됐어요. 로그아웃 후 다시 로그인해주세요.',
    github_rate_limit: 'GitHub API 호출 한도에 걸렸어요. 잠시 후 다시 시도해주세요.',
    ai_parse_failed: 'AI 응답 파싱에 실패했어요. 다시 시도해주세요.',
    generation_limit_exceeded: '이번 달 생성 횟수(5회)를 모두 사용했어요. 다음 달에 다시 이용해주세요.',
  };

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setConfirmRegen(false);
    try {
      const res = await fetch('/api/generate', { method: 'POST' });
      const body = await res.json();
      if (!res.ok) {
        const msg = ERROR_MESSAGES[body?.error] ?? '포트폴리오 생성에 실패했어요. 다시 시도해주세요.';
        throw new Error(msg);
      }
      // generate API가 저장까지 처리하므로 별도 save 불필요
      setPortfolio(body.portfolio);
      setGeneratedCount(body.generatedCount);
      setShareUrl(`/${session?.login}`);
      setToast('✓ 포트폴리오가 생성됐어요');
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
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl py-12 px-6">
      <div className="mb-8 border-b border-zinc-100 pb-6 dark:border-zinc-800">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">내 포트폴리오</h1>
        <p className="mt-1 text-sm text-zinc-400">GitHub 레포지토리를 분석해 AI가 포트폴리오를 생성합니다.</p>

        {generatedCount !== null && (
          <p className="mt-3 text-xs text-zinc-400">
            이번 달 <span className={generatedCount >= 5 ? 'text-red-500 font-medium' : ''}>{generatedCount}/5회</span> 사용
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {!portfolio && !loading && (
            <button
              onClick={handleGenerate}
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:opacity-70 transition-all duration-200 dark:bg-white dark:text-zinc-900"
            >
              AI로 포트폴리오 생성하기
            </button>
          )}
          {portfolio && !loading && (
            <>
              {confirmRegen ? (
                <>
                  <span className="text-sm text-zinc-500">다시 생성할까요?</span>
                  <button
                    onClick={handleGenerate}
                    className="rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white hover:opacity-70 transition-all duration-200"
                  >
                    생성
                  </button>
                  <button
                    onClick={() => setConfirmRegen(false)}
                    className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium hover:opacity-70 transition-all duration-200 dark:border-zinc-700"
                  >
                    취소
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmRegen(true)}
                  className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium hover:opacity-70 transition-all duration-200 dark:border-zinc-700"
                >
                  다시 생성
                </button>
              )}
            </>
          )}
        </div>

        {shareUrl && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
            <span className="text-xs text-zinc-400">공개 링크</span>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 transition-colors"
            >
              {typeof window !== 'undefined' ? window.location.host : 'localhost:3000'}{shareUrl} ↗
            </a>
            <button
              onClick={() => {
                const url = `${window.location.origin}${shareUrl}`;
                navigator.clipboard.writeText(url);
                setToast('링크가 복사됐어요');
              }}
              className="ml-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              title="링크 복사"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {loading && <LoadingIndicator />}
      {fetching && !loading && <PortfolioSkeleton />}
      {!loading && !fetching && portfolio && <PortfolioCard portfolio={portfolio} />}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </main>
  );
}
