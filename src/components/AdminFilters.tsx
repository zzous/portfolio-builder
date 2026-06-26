'use client';

import { useRouter } from 'next/navigation';

interface Props {
  levels: string[];
  languages: string[];
  selectedLevel: string;
  selectedLang: string;
}

export function AdminFilters({ levels, languages, selectedLevel, selectedLang }: Props) {
  const router = useRouter();

  function update(key: 'level' | 'lang', value: string) {
    const params = new URLSearchParams();
    const next = { level: selectedLevel, lang: selectedLang, [key]: value };
    if (next.level) params.set('level', next.level);
    if (next.lang) params.set('lang', next.lang);
    router.push(`/admin?${params.toString()}`);
  }

  const selectClass =
    'rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={selectedLevel}
        onChange={(e) => update('level', e.target.value)}
        className={selectClass}
      >
        <option value="">전체 경력</option>
        {levels.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>
      <select
        value={selectedLang}
        onChange={(e) => update('lang', e.target.value)}
        className={selectClass}
      >
        <option value="">전체 언어</option>
        {languages.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>
      {(selectedLevel || selectedLang) && (
        <button
          onClick={() => router.push('/admin')}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:border-zinc-700 dark:hover:text-zinc-100"
        >
          초기화
        </button>
      )}
    </div>
  );
}
