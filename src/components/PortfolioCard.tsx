import type { PortfolioData } from '@/types/portfolio';
import { SkillBadge } from './SkillBadge';
import { ProjectCard } from './ProjectCard';

export function PortfolioCard({ portfolio }: { portfolio: PortfolioData }) {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-12">
      <section>
        <h1 className="text-3xl font-bold">{portfolio.intro.headline}</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">{portfolio.intro.bio}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {portfolio.intro.skills.map((skill) => (
            <SkillBadge key={skill} skill={skill} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-4 rounded-xl bg-zinc-50 p-4 text-center dark:bg-zinc-900">
        <div>
          <p className="text-2xl font-bold">{portfolio.stats.totalProjects}</p>
          <p className="text-xs text-zinc-500">프로젝트</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{portfolio.stats.mainLanguage}</p>
          <p className="text-xs text-zinc-500">주요 언어</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{portfolio.stats.experienceLevel}</p>
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
