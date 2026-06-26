import { AuthButton } from '@/components/AuthButton';

const STEPS = [
  {
    step: '01',
    title: 'GitHub 로그인',
    desc: '버튼 하나로 GitHub 계정을 연결합니다. 별도 가입이 필요 없습니다.',
  },
  {
    step: '02',
    title: 'AI 분석',
    desc: '레포지토리, README, 커밋 히스토리를 Claude AI가 자동으로 분석합니다.',
  },
  {
    step: '03',
    title: '포트폴리오 완성',
    desc: '채용담당자가 30초 안에 이해할 수 있는 포트폴리오 페이지가 생성됩니다.',
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24 text-center">
      <section className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold leading-[1.3] sm:text-4xl">
          GitHub 연결 한 번으로
          <br />
          AI가 만들어주는 포트폴리오
        </h1>
        <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-base">
          레포지토리와 커밋 히스토리를 분석해서 채용담당자가 30초 안에 이해할 수 있는 <br className="hidden sm:inline" />
          포트폴리오 페이지를 자동으로 생성합니다.
        </p>
        <AuthButton />
        <a
          href="/zzous"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-400 underline underline-offset-4 hover:text-zinc-600 transition-colors dark:hover:text-zinc-300"
        >
          데모 포트폴리오 보기 →
        </a>
      </section>

      <section className="mt-24">
        <h2 className="mb-10 text-lg font-semibold">어떻게 작동하나요?</h2>
        <div className="grid gap-6 text-left sm:grid-cols-3">
          {STEPS.map(({ step, title, desc }) => (
            <div key={step} className="rounded-lg border border-zinc-100 p-5 dark:border-zinc-800">
              <span className="text-xs font-mono text-zinc-400">{step}</span>
              <h3 className="mt-2 font-semibold">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
