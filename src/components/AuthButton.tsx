'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') return null;

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        로그아웃
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn('github')}
      className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
    >
      깃헙으로 시작하기
    </button>
  );
}
