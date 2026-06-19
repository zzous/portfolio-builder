export function SkillBadge({ skill }: { skill: string }) {
  return (
    <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
      {skill}
    </span>
  );
}
