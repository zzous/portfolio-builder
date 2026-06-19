import { AuthButton } from '@/components/AuthButton';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-bold sm:text-5xl">
        깃헙 연결 한 번으로
        <br />
        AI가 만들어주는 포트폴리오
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        레포지토리와 커밋 히스토리를 분석해서 채용담당자가 30초 안에 이해할 수 있는
        포트폴리오 페이지를 자동으로 생성합니다.
      </p>
      <AuthButton />
    </main>
  );
}
