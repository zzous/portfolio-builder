'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <nav className="mx-auto flex max-w-3xl items-center gap-6 px-6 py-3">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight hover:opacity-70 transition-opacity duration-200"
        >
          포트폴리오 빌더
        </Link>

        {session?.login && (
          <Link
            href={`/${session.login}`}
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200"
          >
            내 포트폴리오 보기
          </Link>
        )}

        {session && (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="ml-auto text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200"
          >
            로그아웃
          </button>
        )}
      </nav>
    </header>
  );
}
