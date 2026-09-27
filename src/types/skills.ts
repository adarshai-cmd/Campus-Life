export type SkillLevel =
  | 'Beginner'
  | 'Elementary'
  | 'Intermediate'
  | 'Advanced'
  | 'Proficient'
  | 'Mastery';

export const SKILL_LEVELS: SkillLevel[] = [
  'Beginner',
  'Elementary',
  'Intermediate',
  'Advanced',
  'Proficient',
  'Mastery',
];

export type SkillCategory =
  | 'Programming'
  | 'Web Development'
  | 'Data & ML'
  | 'Core CS / DSA'
  | 'System Design'
  | 'DevOps & Tools'
  | 'Communication'
  | 'Design'
  | 'Other';

export const SKILL_CATEGORIES: SkillCategory[] = [
  'Programming',
  'Web Development',
  'Data & ML',
  'Core CS / DSA',
  'System Design',
  'DevOps & Tools',
  'Communication',
  'Design',
  'Other',
];

export interface SkillMilestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  progress: number; // 0 to 100
  startDate: string; // YYYY-MM-DD
  notes?: string;
  milestones: SkillMilestone[];
  createdAt: string;
  lastUpdated: string;
}

export interface SkillsSummary {
  totalSkills: number;
  inProgressCount: number;
  completedMilestonesCount: number;
  totalMilestonesCount: number;
  averageProgress: number;
  currentFocusSkill: Skill | null;
}
