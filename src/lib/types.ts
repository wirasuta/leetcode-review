export enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export enum ReviewStatus {
  New = 'New',
  Reviewing = 'Reviewing',
  Reviewed = 'Reviewed',
  Mastered = 'Mastered',
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  tags: string[];
  link?: string;
}

export interface CodeSnippet {
  language: string;
  code: string;
}

export interface Solution {
  id: string;
  problemId: string;
  approach: string;
  code: CodeSnippet;
  notes?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
}

export interface ReviewEntry {
  id: string;
  solutionId: string;
  date: Date;
  status: ReviewStatus;
  notes?: string;
}
