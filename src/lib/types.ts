export type Verdict = 'correct' | 'incorrect';

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  title: string;
  titleSlug: string;
  category: string;
  difficulty: string;
  description: string;
  examples: Example[];
  constraints: string[];
  solution: string;          // Python code
  groundTruth: Verdict;
  reviewNote: string;
}

export interface AppAction {
  type: 'ANSWER';
  verdict: Verdict;
}

export type AppPhase = 'reviewing' | 'results';
