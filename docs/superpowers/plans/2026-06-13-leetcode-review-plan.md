# LeetCode Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a daily LeetCode code review challenge app — 5 shuffled problems per day, user classifies each solution as correct/incorrect, results with explanations deferred to the end.

**Architecture:** Single-page React app with no router. A `useReducer` tracks answers array; phase and current index are derived from array length. CSS Modules with design tokens inherited from brix-coffee-tds (dark monospace theme, orange accent).

**Tech Stack:** Vite + React + TypeScript, highlight.js, CSS Modules, GitHub Pages via gh-pages

---

## File Map

```
leetcode-review/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── src/
│   ├── main.tsx                          # ReactDOM.createRoot, renders <App />
│   ├── App.tsx                           # useReducer + phase switch → QuestionCard | ResultsScreen
│   ├── App.module.css                    # :root tokens, body, .container, global resets
│   ├── vite-env.d.ts                     # Vite types (scaffolded)
│   ├── data/
│   │   └── problems.json                 # Array of 75 Problem objects (populated in Task 13)
│   ├── lib/
│   │   ├── types.ts                      # Verdict, Problem, AppAction, etc.
│   │   └── shuffle.ts                    # dateToSeed(), seededShuffle()
│   └── components/
│       ├── Header.tsx                    # App title + today's date
│       ├── Header.module.css
│       ├── SolutionCode.tsx              # highlight.js code block wrapper
│       ├── SolutionCode.module.css
│       ├── VerdictButtons.tsx            # "✓ Correct" / "✗ Incorrect" buttons
│       ├── VerdictButtons.module.css
│       ├── QuestionCard.tsx              # Problem desc + SolutionCode + VerdictButtons
│       ├── QuestionCard.module.css
│       ├── ResultsScreen.tsx             # Score + per-question breakdown
│       └── ResultsScreen.module.css
```

---

## Tasks

### Task 1: Scaffold Vite + React + TypeScript Project

**Files:**
- Create: `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `src/main.tsx`, `src/vite-env.d.ts`

- [ ] **Step 1: Create project with Vite**

```bash
npm create vite@latest leetcode-review -- --template react-ts
```

- [ ] **Step 2: Verify scaffold runs**

```bash
cd leetcode-review && npm install && npm run dev
```

Expected: Vite dev server starts on localhost:5173 with default React counter page.

- [ ] **Step 3: Clean up scaffold defaults**

Delete `src/App.css`, `src/index.css`, `src/assets/react.svg`, and `public/vite.svg`. Clear `src/App.tsx` to a minimal component. Update `src/main.tsx` to remove default CSS imports.

- [ ] **Step 4: Verify clean scaffold**

```bash
npm run dev
```

Expected: Blank page, no errors.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: scaffold vite + react-ts project"
```

---

### Task 2: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install highlight.js**

```bash
npm install highlight.js
```

- [ ] **Step 2: Install gh-pages (dev dependency)**

```bash
npm install -D gh-pages
```

- [ ] **Step 3: Verify installations**

```bash
npm ls highlight.js gh-pages
```

Expected: Both packages listed with versions.

- [ ] **Step 4: Add deploy script to package.json**

In `package.json`, add to scripts:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

Also set `"homepage": "https://wirasuta.github.io/leetcode-review/"` at the top level of package.json.

- [ ] **Step 5: Verify build works**

```bash
npm run build
```

Expected: `dist/` directory created with `index.html` and assets.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: add highlight.js and gh-pages dependencies"
```

---

### Task 3: Type Definitions

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Write types**

```ts
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
```

- [ ] **Step 2: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts && git commit -m "feat: add type definitions"
```

---

### Task 4: Seeded Shuffle Utility

**Files:**
- Create: `src/lib/shuffle.ts`

- [ ] **Step 1: Write shuffle utility**

```ts
/**
 * Deterministic date-to-seed converter.
 * e.g., 2026-06-13 → 20260613
 */
export function dateToSeed(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

/**
 * Simple seeded PRNG (mulberry32).
 */
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle using seeded PRNG.
 * Returns first `count` elements from shuffled copy.
 */
export function seededShuffle<T>(items: T[], seed: number, count: number): T[] {
  const rng = mulberry32(seed);
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
```

- [ ] **Step 2: Write a quick smoke test**

In `src/lib/shuffle.test.ts`:
```ts
import { dateToSeed, seededShuffle } from './shuffle';

const items = ['a', 'b', 'c', 'd', 'e'];

// Same seed → same output
const run1 = seededShuffle(items, 42, 3);
const run2 = seededShuffle(items, 42, 3);
console.assert(
  run1.join(',') === run2.join(','),
  'Same seed must produce same output'
);

// Different seed → likely different output
const run3 = seededShuffle(items, 99, 5);
// Extremely unlikely to be identical for 5 elements from 5
console.assert(
  run1.join(',') !== run3.join(','),
  'Different seeds should produce different output'
);

// Count must not exceed input
const run4 = seededShuffle(items, 1, 5);
console.assert(run4.length === 5, 'Should return all items');
console.assert(
  run4.sort().join(',') === items.sort().join(','),
  'Should contain all original items'
);

// dateToSeed sanity
const seed = dateToSeed(new Date(2026, 5, 13)); // June 13, 2026
console.assert(seed === 20260613, `Expected 20260613, got ${seed}`);

console.log('All shuffle tests passed');
```

- [ ] **Step 3: Run smoke test**

```bash
npx tsx src/lib/shuffle.test.ts
```

Expected: "All shuffle tests passed"

- [ ] **Step 4: Remove test file and commit**

```bash
rm src/lib/shuffle.test.ts
git add src/lib/shuffle.ts && git commit -m "feat: add seeded shuffle utility"
```

---

### Task 5: Design Tokens and Global Styles

**Files:**
- Create: `src/App.module.css`

- [ ] **Step 1: Write global styles with design tokens**

```css
:root {
  --bg: #1a1a1a;
  --surface: #222222;
  --surface-deep: #111111;
  --border: #333333;
  --text: #ffffff;
  --text-secondary: #888888;
  --accent: #ff6b35;
  --green: #40f080;
  --yellow: #f0c040;
  --red: #f04040;

  --font-mono: 'JetBrains Mono', 'IBM Plex Mono', 'SF Mono', 'Fira Code', ui-monospace, monospace;
  --fs-xs: 11px;
  --fs-sm: 12px;
  --fs-base: 14px;
  --fs-md: 16px;
  --fs-lg: 18px;
  --fs-xl: 24px;
  --fs-2xl: 32px;

  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 20px;
  --space-2xl: 24px;
  --space-3xl: 32px;
  --space-4xl: 40px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: var(--fs-base);
  line-height: 1.5;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

.container {
  max-width: 560px;
  margin: 0 auto;
  padding: var(--space-2xl) var(--space-lg);
}
```

- [ ] **Step 2: Verify styles load**

Run `npm run dev` and confirm no CSS import errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.module.css && git commit -m "feat: add design tokens and global styles"
```

---

### Task 6: Header Component

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/Header.module.css`

- [ ] **Step 1: Write Header CSS**

```css
.header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: var(--space-3xl);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--border);
}

.title {
  font-size: var(--fs-base);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.date {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
}
```

- [ ] **Step 2: Write Header component**

```tsx
import styles from './Header.module.css';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function Header() {
  return (
    <header className={styles.header}>
      <span className={styles.title}>LEETCODE REVIEW</span>
      <span className={styles.date}>{formatDate(new Date())}</span>
    </header>
  );
}
```

- [ ] **Step 3: Render Header in App to verify**

In `src/App.tsx`:
```tsx
import Header from './components/Header';
import styles from './App.module.css';

export default function App() {
  return (
    <div className={styles.container}>
      <Header />
    </div>
  );
}
```

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Expected: Dark page with "LEETCODE REVIEW" title on left, today's date on right, with bottom-border separator.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.tsx src/components/Header.module.css src/App.tsx && git commit -m "feat: add header component"
```

---

### Task 7: SolutionCode Component

**Files:**
- Create: `src/components/SolutionCode.tsx`
- Create: `src/components/SolutionCode.module.css`

- [ ] **Step 1: Write SolutionCode CSS**

```css
.wrapper {
  margin-bottom: var(--space-xl);
}

.label {
  font-size: var(--fs-xs);
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  margin-bottom: var(--space-xs);
  display: block;
}

.code {
  background: var(--bg);
  border: 1px solid var(--border);
  padding: var(--space-lg);
  font-family: var(--font-mono);
  font-size: var(--fs-sm);
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre;
}

/* highlight.js theme overrides — ensure it blends with dark theme */
.code :global(.hljs) {
  background: transparent;
  color: var(--text);
}

.code :global(.hljs-keyword) {
  color: #c792ea;
}
.code :global(.hljs-string) {
  color: #c3e88d;
}
.code :global(.hljs-number) {
  color: #f78c6c;
}
.code :global(.hljs-comment) {
  color: #546e7a;
  font-style: italic;
}
.code :global(.hljs-built_in) {
  color: #82aaff;
}
.code :global(.hljs-function) .hljs-title {
  color: #82aaff;
}
```

- [ ] **Step 2: Write SolutionCode component**

```tsx
import { useRef, useEffect } from 'react';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import styles from './SolutionCode.module.css';

hljs.registerLanguage('python', python);

interface SolutionCodeProps {
  code: string;
}

export default function SolutionCode({ code }: SolutionCodeProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [code]);

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>SOLUTION</span>
      <pre className={styles.code}>
        <code ref={codeRef} className="language-python">
          {code}
        </code>
      </pre>
    </div>
  );
}
```

- [ ] **Step 3: Smoke test — render a sample in App**

Temporarily update `App.tsx`:
```tsx
import Header from './components/Header';
import SolutionCode from './components/SolutionCode';
import styles from './App.module.css';

const sampleCode = `def twoSum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        diff = target - n
        if diff in seen:
            return [seen[diff], i]
        seen[n] = i`;

export default function App() {
  return (
    <div className={styles.container}>
      <Header />
      <SolutionCode code={sampleCode} />
    </div>
  );
}
```

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Expected: Code block with syntax highlighting (keywords purple, strings green, numbers orange).

- [ ] **Step 5: Revert App.tsx temporary code and commit**

```bash
git add src/components/SolutionCode.tsx src/components/SolutionCode.module.css && git commit -m "feat: add solution code component with syntax highlighting"
```

---

### Task 8: VerdictButtons Component

**Files:**
- Create: `src/components/VerdictButtons.tsx`
- Create: `src/components/VerdictButtons.module.css`

- [ ] **Step 1: Write VerdictButtons CSS**

```css
.buttons {
  display: flex;
  gap: var(--space-md);
}

.btn {
  flex: 1;
  background: none;
  border: 1px solid var(--border);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: var(--fs-base);
  padding: var(--space-md) var(--space-xl);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.correct:hover {
  border-color: var(--green);
  color: var(--green);
}
```

- [ ] **Step 2: Write VerdictButtons component**

```tsx
import { Verdict } from '../lib/types';
import styles from './VerdictButtons.module.css';

interface VerdictButtonsProps {
  disabled: boolean;
  onAnswer: (verdict: Verdict) => void;
}

export default function VerdictButtons({ disabled, onAnswer }: VerdictButtonsProps) {
  return (
    <div className={styles.buttons}>
      <button
        className={`${styles.btn} ${styles.correct}`}
        disabled={disabled}
        onClick={() => onAnswer('correct')}
      >
        ✓ Correct
      </button>
      <button
        className={styles.btn}
        disabled={disabled}
        onClick={() => onAnswer('incorrect')}
      >
        ✗ Incorrect
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/VerdictButtons.tsx src/components/VerdictButtons.module.css && git commit -m "feat: add verdict buttons component"
```

---

### Task 9: QuestionCard Component

**Files:**
- Create: `src/components/QuestionCard.tsx`
- Create: `src/components/QuestionCard.module.css`

- [ ] **Step 1: Write QuestionCard CSS**

```css
.card {
  border: 1px solid var(--border);
  background: var(--surface);
  padding: var(--space-xl);
  margin-bottom: var(--space-2xl);
}

.progress {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  margin-bottom: var(--space-xl);
}

.category {
  font-size: var(--fs-xs);
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--accent);
  margin-bottom: var(--space-sm);
}

.title {
  font-size: var(--fs-lg);
  font-weight: 600;
  margin-bottom: var(--space-lg);
}

.description {
  color: var(--text-secondary);
  font-size: var(--fs-sm);
  line-height: 1.7;
  margin-bottom: var(--space-xl);
  white-space: pre-wrap;
}

.examplesHeading {
  font-size: var(--fs-xs);
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  margin-bottom: var(--space-sm);
}

.examples {
  margin-bottom: var(--space-xl);
}

.example {
  background: var(--bg);
  border: 1px solid var(--border);
  padding: var(--space-md);
  margin-bottom: var(--space-sm);
  font-size: var(--fs-sm);
  line-height: 1.6;
}

.exampleLabel {
  font-weight: 600;
  color: var(--text);
}

.exampleInput,
.exampleOutput {
  color: var(--text-secondary);
}

.exampleExplanation {
  color: var(--text-secondary);
  font-style: italic;
  margin-top: var(--space-xs);
}

.constraintsHeading {
  font-size: var(--fs-xs);
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  margin-bottom: var(--space-sm);
}

.constraintsList {
  list-style: none;
  margin-bottom: var(--space-2xl);
}

.constraintItem {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
  padding: 2px 0;
  padding-left: var(--space-md);
  position: relative;
}

.constraintItem::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--border);
}
```

- [ ] **Step 2: Write QuestionCard component**

```tsx
import { Problem, Verdict } from '../lib/types';
import SolutionCode from './SolutionCode';
import VerdictButtons from './VerdictButtons';
import styles from './QuestionCard.module.css';

interface QuestionCardProps {
  problem: Problem;
  questionNumber: number;
  totalQuestions: number;
  answered: boolean;
  onAnswer: (verdict: Verdict) => void;
}

export default function QuestionCard({
  problem,
  questionNumber,
  totalQuestions,
  answered,
  onAnswer,
}: QuestionCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.progress}>
        Question {questionNumber} of {totalQuestions}
      </div>

      <div className={styles.category}>{problem.category}</div>
      <h2 className={styles.title}>{problem.title}</h2>

      <p className={styles.description}>{problem.description}</p>

      {problem.examples.length > 0 && (
        <>
          <div className={styles.examplesHeading}>EXAMPLES</div>
          <div className={styles.examples}>
            {problem.examples.map((ex, i) => (
              <div key={i} className={styles.example}>
                <div>
                  <span className={styles.exampleLabel}>Input: </span>
                  <span className={styles.exampleInput}>{ex.input}</span>
                </div>
                <div>
                  <span className={styles.exampleLabel}>Output: </span>
                  <span className={styles.exampleOutput}>{ex.output}</span>
                </div>
                {ex.explanation && (
                  <div className={styles.exampleExplanation}>{ex.explanation}</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {problem.constraints.length > 0 && (
        <>
          <div className={styles.constraintsHeading}>CONSTRAINTS</div>
          <ul className={styles.constraintsList}>
            {problem.constraints.map((c, i) => (
              <li key={i} className={styles.constraintItem}>
                {c}
              </li>
            ))}
          </ul>
        </>
      )}

      <SolutionCode code={problem.solution} />
      <VerdictButtons disabled={answered} onAnswer={onAnswer} />
    </div>
  );
}
```

- [ ] **Step 3: Smoke test with sample data in App.tsx**

Temporarily update `App.tsx`:
```tsx
import Header from './components/Header';
import QuestionCard from './components/QuestionCard';
import styles from './App.module.css';

const sampleProblem = {
  title: 'Two Sum',
  titleSlug: 'two-sum',
  category: 'Array / Hash Table',
  description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
  examples: [
    { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
    { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
  ],
  constraints: [
    '2 <= nums.length <= 10^4',
    '-10^9 <= nums[i] <= 10^9',
    'Only one valid answer exists.',
  ],
  solution: 'def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in seen:\n            return [seen[diff], i]\n        seen[n] = i',
  groundTruth: 'correct' as const,
  reviewNote: '',
};

export default function App() {
  return (
    <div className={styles.container}>
      <Header />
      <QuestionCard
        problem={sampleProblem}
        questionNumber={1}
        totalQuestions={5}
        answered={false}
        onAnswer={(v) => console.log('answered:', v)}
      />
    </div>
  );
}
```

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Expected: Full question card rendering with problem description, examples, constraints, syntax-highlighted solution, and two verdict buttons below.

- [ ] **Step 5: Revert App.tsx temporary code and commit**

```bash
git add src/components/QuestionCard.tsx src/components/QuestionCard.module.css && git commit -m "feat: add question card component"
```

---

### Task 10: ResultsScreen Component

**Files:**
- Create: `src/components/ResultsScreen.tsx`
- Create: `src/components/ResultsScreen.module.css`

- [ ] **Step 1: Write ResultsScreen CSS**

```css
.screen {
  /* results take over the main content area */
}

.score {
  text-align: center;
  margin-bottom: var(--space-3xl);
}

.scoreNumber {
  font-size: var(--fs-2xl);
  font-weight: 700;
}

.scoreLabel {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
  margin-top: var(--space-xs);
}

.breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.round {
  border: 1px solid var(--border);
  background: var(--surface);
  padding: var(--space-lg);
}

.roundHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xs);
}

.roundTitle {
  font-size: var(--fs-base);
  font-weight: 600;
}

.badge {
  font-size: var(--fs-xs);
  font-weight: 600;
  padding: 2px var(--space-sm);
  border: 1px solid;
}

.badgeCorrect {
  color: var(--green);
  border-color: var(--green);
}

.badgeWrong {
  color: var(--red);
  border-color: var(--red);
}

.roundMeta {
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  margin-bottom: var(--space-sm);
}

.note {
  margin-top: var(--space-md);
  padding: var(--space-md);
  background: var(--bg);
  border: 1px solid var(--border);
  font-size: var(--fs-sm);
  line-height: 1.6;
  color: var(--text-secondary);
}

.noteLabel {
  font-size: var(--fs-xs);
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--text);
  margin-bottom: var(--space-xs);
}
```

- [ ] **Step 2: Write ResultsScreen component**

```tsx
import { Problem, Verdict } from '../lib/types';
import styles from './ResultsScreen.module.css';

interface ResultsScreenProps {
  questions: Problem[];
  answers: Verdict[];
}

function isCorrect(userAnswer: Verdict, groundTruth: Verdict): boolean {
  return userAnswer === groundTruth;
}

export default function ResultsScreen({ questions, answers }: ResultsScreenProps) {
  const score = answers.filter((a, i) => isCorrect(a, questions[i].groundTruth)).length;

  return (
    <div className={styles.screen}>
      <div className={styles.score}>
        <div className={styles.scoreNumber}>{score} / {questions.length}</div>
        <div className={styles.scoreLabel}>
          {score === questions.length
            ? 'Perfect!'
            : score >= questions.length - 1
              ? 'Almost there!'
              : 'Keep practicing!'}
        </div>
      </div>

      <div className={styles.breakdown}>
        {questions.map((q, i) => {
          const gotItRight = isCorrect(answers[i], q.groundTruth);
          return (
            <div key={i} className={styles.round}>
              <div className={styles.roundHeader}>
                <span className={styles.roundTitle}>{q.title}</span>
                <span className={`${styles.badge} ${gotItRight ? styles.badgeCorrect : styles.badgeWrong}`}>
                  {gotItRight ? 'CORRECT' : 'WRONG'}
                </span>
              </div>
              <div className={styles.roundMeta}>
                You said: {answers[i]} &nbsp;|&nbsp; Actual: {q.groundTruth}
              </div>
              {!gotItRight && (
                <div className={styles.note}>
                  <div className={styles.noteLabel}>WHY</div>
                  {q.reviewNote}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Smoke test in App.tsx**

Temporarily update `App.tsx`:
```tsx
import Header from './components/Header';
import ResultsScreen from './components/ResultsScreen';
import styles from './App.module.css';

const sampleQuestions = [
  {
    title: 'Two Sum', titleSlug: 'two-sum', category: 'Array / Hash Table',
    description: '', examples: [], constraints: [],
    solution: '',
    groundTruth: 'correct' as const,
    reviewNote: 'The hash map approach is optimal O(n).',
  },
  {
    title: 'Merge Strings Alternately', titleSlug: 'merge-strings-alternately', category: 'Two Pointers',
    description: '', examples: [], constraints: [],
    solution: '',
    groundTruth: 'incorrect' as const,
    reviewNote: 'The loop condition is off-by-one — it misses the last character when strings have different lengths.',
  },
];

const sampleAnswers: ('correct' | 'incorrect')[] = ['correct', 'correct'];

export default function App() {
  return (
    <div className={styles.container}>
      <Header />
      <ResultsScreen questions={sampleQuestions} answers={sampleAnswers} />
    </div>
  );
}
```

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Expected: Score "1 / 2" with "Almost there!" label. Two rounds: first shows CORRECT badge (green, no note), second shows WRONG badge (red, with "WHY" note explaining the off-by-one).

- [ ] **Step 5: Revert App.tsx temporary code and commit**

```bash
git add src/components/ResultsScreen.tsx src/components/ResultsScreen.module.css && git commit -m "feat: add results screen component"
```

---

### Task 11: App Component (Reducer + Composition)

**Files:**
- Create/modify: `src/App.tsx`
- Create: `src/data/problems.json` (placeholder)

- [ ] **Step 1: Create problems.json placeholder**

```json
[]
```

- [ ] **Step 2: Write App component with reducer**

```tsx
import { useReducer, useMemo } from 'react';
import { Verdict, AppAction } from './lib/types';
import { dateToSeed, seededShuffle } from './lib/shuffle';
import problems from './data/problems.json';
import Header from './components/Header';
import QuestionCard from './components/QuestionCard';
import ResultsScreen from './components/ResultsScreen';
import styles from './App.module.css';

const QUESTIONS_PER_DAY = 5;

function reducer(answers: Verdict[], action: AppAction): Verdict[] {
  if (action.type === 'ANSWER') {
    return [...answers, action.verdict];
  }
  return answers;
}

export default function App() {
  const [answers, dispatch] = useReducer(reducer, []);

  const todayQuestions = useMemo(() => {
    const seed = dateToSeed(new Date());
    return seededShuffle(problems, seed, QUESTIONS_PER_DAY);
  }, []);

  const currentIndex = answers.length;
  const phase = currentIndex >= todayQuestions.length ? 'results' : 'reviewing';

  const handleAnswer = (verdict: Verdict) => {
    dispatch({ type: 'ANSWER', verdict });
  };

  // No problems loaded yet — show a simple message
  if (todayQuestions.length === 0) {
    return (
      <div className={styles.container}>
        <Header />
        <p style={{ color: 'var(--text-secondary)' }}>No problems loaded. Run the data generation task.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      {phase === 'reviewing' ? (
        <QuestionCard
          problem={todayQuestions[currentIndex]}
          questionNumber={currentIndex + 1}
          totalQuestions={todayQuestions.length}
          answered={false}
          onAnswer={handleAnswer}
        />
      ) : (
        <ResultsScreen questions={todayQuestions} answers={answers} />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Update main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 4: Verify TypeScript compilation**

```bash
npx tsc --noEmit
```

Expected: No errors. The problems.json empty array is compatible with `Problem[]`.

- [ ] **Step 5: Verify app runs**

```bash
npm run dev
```

Expected: "No problems loaded" message displayed in the dark theme with header.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/main.tsx src/data/problems.json && git commit -m "feat: add app reducer and composition"
```

---

### Task 12: Vite Config for GitHub Pages

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Update vite.config.ts for GitHub Pages**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/leetcode-review/',
})
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: `dist/` with correct asset paths prefixed with `/leetcode-review/`.

- [ ] **Step 3: Commit**

```bash
git add vite.config.ts && git commit -m "chore: configure vite base for github pages"
```

---

### Task 13: Generate Problems Data

**Files:**
- Modify: `src/data/problems.json`

- [ ] **Step 1: Fetch LeetCode 75 problem list**

Run the curl command to get the list of 75 problems from LeetCode's study plan GraphQL API. Extract title slugs and categories.

- [ ] **Step 2: Dispatch parallel subagents for solution authoring**

For each problem, dispatch a separate pi session using deepseek-v4-flash to generate:
- Problem description (summarized from LeetCode)
- Example inputs/outputs
- Constraints
- Python solution (the one shown to the user)
- Ground truth (`correct` or `incorrect`)
- Review note (explanation for why an incorrect solution is wrong, or empty for correct ones)

Split the 75 problems across multiple tmux sessions to parallelize.

- [ ] **Step 3: Consolidate into problems.json**

Merge all generated problem objects into the single `src/data/problems.json` file. Validate JSON structure against the `Problem` type.

- [ ] **Step 4: Verify full app flow**

```bash
npm run dev
```

Expected: 5 problems displayed. Clicking Correct/Incorrect advances through all 5. Results screen shows with score and breakdown.

- [ ] **Step 5: Commit**

```bash
git add src/data/problems.json && git commit -m "feat: add all 75 leetcode review problems"
```

---

### Task 14: Deploy to GitHub Pages

- [ ] **Step 1: Build for production**

```bash
npm run build
```

- [ ] **Step 2: Deploy**

```bash
npm run deploy
```

Expected: `gh-pages` branch pushed to origin. Site live at `https://wirasuta.github.io/leetcode-review/`.

- [ ] **Step 3: Smoke test live site**

Open the URL and verify the app loads and functions.

- [ ] **Step 4: Commit any final changes**

```bash
git add -A && git commit -m "chore: final deployment prep"
```

---

## Plan Self-Review Checklist

- [ ] Spec coverage — every requirement maps to a task
- [ ] No placeholders — all steps have concrete code/commands
- [ ] Type consistency — types defined in Task 3 used consistently through Tasks 6–11
- [ ] Task order respects dependencies (types before components, components before App)
