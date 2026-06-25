'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthButton() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.push('/dashboard');
  }, [session, router]);

  const visible = status !== 'loading';

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className={`rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium transition-all duration-200 hover:opacity-70 dark:border-zinc-700 ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        로그아웃
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn('github')}
      className={`rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:opacity-70 dark:bg-white dark:text-zinc-900 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      깃헙으로 시작하기
    </button>
  );
}
