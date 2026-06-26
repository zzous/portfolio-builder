import type { PortfolioData } from '@/types/portfolio';
import { SkillBadge } from './SkillBadge';
import { ProjectCard } from './ProjectCard';

export function PortfolioCard({ portfolio }: { portfolio: PortfolioData }) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold leading-snug sm:text-3xl">{portfolio.intro.headline}</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-400">
          {portfolio.intro.bio}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {portfolio.intro.skills.map((skill) => (
            <SkillBadge key={skill} skill={skill} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 rounded-lg bg-zinc-50 p-4 text-center dark:bg-zinc-900">
        <div>
          <p className="text-xl font-bold sm:text-2xl">{portfolio.stats.totalProjects}</p>
          <p className="text-xs text-zinc-500">프로젝트</p>
        </div>
        <div>
          <p className="truncate text-xl font-bold sm:text-2xl">
            {portfolio.stats.mainStack?.join(' · ') ?? '—'}
          </p>
          <p className="text-xs text-zinc-500">주요 스택</p>
        </div>
        <div>
          <p className="text-xl font-bold sm:text-2xl">{portfolio.stats.experienceLevel}</p>
          <p className="text-xs text-zinc-500">경력 수준</p>
        </div>
      </section>

      <section className="space-y-4">
        {portfolio.projects.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </section>
    </div>
  );
}
