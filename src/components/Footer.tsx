import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-100 px-6 py-10 text-center dark:border-zinc-800">
      <p className="text-sm text-zinc-400">포트폴리오 빌더로 만들었어요</p>
      <Link
        href="/"
        className="mt-3 inline-block rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-70 dark:bg-white dark:text-zinc-900"
      >
        나도 만들기 →
      </Link>
    </footer>
  );
}
