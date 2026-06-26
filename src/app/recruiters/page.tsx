import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '개발자 찾기 — 포트폴리오 빌더',
  description: 'AI가 분석한 개발자 포트폴리오를 한눈에. 스택·경력별 필터로 빠르게 찾아보세요.',
};

const CONTACT_EMAIL = 'smilejjou@gmail.com';

const FEATURES = [
  {
    title: 'GitHub 기반 실제 데이터',
    desc: '자기소개서가 아닌 실제 커밋·레포 분석 결과입니다. 과장 없는 스택과 활동량을 확인할 수 있어요.',
  },
  {
    title: '스택 · 경력 수준 필터',
    desc: 'Junior / Mid / Senior 구분과 주요 언어 기준으로 원하는 개발자를 빠르게 추릴 수 있어요.',
  },
  {
    title: '바로 Contact',
    desc: 'GitHub 프로필과 공개 이메일이 포트폴리오에 포함됩니다. 별도 지원 없이 바로 연락 가능해요.',
  },
];

const STEPS = [
  { step: '01', title: '개발자가 깃헙 로그인', desc: 'AI가 레포·커밋을 자동 분석해 포트폴리오를 생성합니다.' },
  { step: '02', title: '목록 열람', desc: '스택·경력 필터로 원하는 개발자를 찾아요.' },
  { step: '03', title: '직접 Contact', desc: 'GitHub 또는 이메일로 바로 연락합니다.' },
];

export default function RecruitersPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      {/* Hero */}
      <div className="mb-16 text-center">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          AI가 분석한 개발자 포트폴리오,
          <br />
          한 곳에서 찾아보세요
        </h1>
        <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
          자기소개서 대신 GitHub 레포와 커밋 히스토리 기반으로 AI가 작성한 포트폴리오입니다.
          <br />
          스택·경력 수준별 필터로 원하는 개발자를 빠르게 찾을 수 있어요.
        </p>
        <Link
          href="/browse"
          className="mt-8 inline-block rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-70 dark:bg-white dark:text-zinc-900"
        >
          개발자 목록 보기 →
        </Link>
      </div>

      {/* Features */}
      <div className="mb-16">
        <h2 className="mb-8 text-center text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          왜 포트폴리오 빌더인가요
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-zinc-100 p-5 dark:border-zinc-800"
            >
              <p className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{f.title}</p>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="mb-16">
        <h2 className="mb-8 text-center text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          어떻게 작동하나요
        </h2>
        <div className="space-y-4">
          {STEPS.map((s) => (
            <div key={s.step} className="flex gap-4 rounded-lg bg-zinc-50 p-5 dark:bg-zinc-900">
              <span className="text-2xl font-bold text-zinc-200 dark:text-zinc-700">{s.step}</span>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{s.title}</p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-lg bg-zinc-50 p-8 text-center dark:bg-zinc-900">
        <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          문의 또는 데모 요청
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          서비스 소개나 데모 포트폴리오 열람이 필요하시면 편하게 연락해주세요.
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="mt-4 inline-block text-sm font-medium text-zinc-900 underline underline-offset-4 hover:opacity-60 dark:text-zinc-100"
        >
          {CONTACT_EMAIL}
        </a>
      </div>
    </main>
  );
}
