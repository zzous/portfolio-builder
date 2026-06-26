import type { PortfolioData } from '@/types/portfolio';
import { SkillBadge } from './SkillBadge';

type Project = PortfolioData['projects'][number];

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{project.name}</h3>
        <span className="text-xs uppercase text-zinc-500">{project.type}</span>
      </div>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{project.description}</p>
      <ul className="mt-3 list-inside list-disc text-sm text-zinc-600 dark:text-zinc-400">
        {project.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.techStack.map((tech) => (
          <SkillBadge key={tech} skill={tech} />
        ))}
      </div>
    </div>
  );
}
