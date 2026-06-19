export interface PortfolioData {
  intro: {
    headline: string;
    bio: string;
    skills: string[];
  };
  projects: {
    name: string;
    description: string;
    techStack: string[];
    highlights: string[];
    type: 'personal' | 'team' | 'opensource';
  }[];
  stats: {
    totalProjects: number;
    mainLanguage: string;
    experienceLevel: 'Junior' | 'Mid' | 'Senior';
  };
}

export interface GithubRepo {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  fork: boolean;
  readme?: string | null;
  commits?: string[];
}

export interface GithubUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  followers: number;
  public_repos: number;
}
