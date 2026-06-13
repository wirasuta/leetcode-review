# LeetCode Review — Design Spec

## Overview

A daily code review challenge web app. Each day, 5 problems from LeetCode 75 are randomly selected (seeded by date). For each problem, the user sees the problem description, examples, and a pre-authored solution. The solution may be correct, subtly incorrect, or completely wrong. The user must classify each as **correct** or **incorrect**. After all 5 rounds, results are shown — with explanations for any mislabeled solutions.

## Tech Stack

- **Vite + React** (TypeScript)
- **CSS Modules** for styling
- **highlight.js** for syntax highlighting
- **GitHub Pages** for deployment
- No router — single-page state machine

## Design System (inherited from brix-coffee-tds)

### Tokens

| Token | Value |
|---|---|
| `--bg` | `#1a1a1a` |
| `--surface` | `#222222` |
| `--border` | `#333333` |
| `--text` | `#ffffff` |
| `--text-secondary` | `#888888` |
| `--accent` | `#ff6b35` |
| `--green` | `#40f080` |
| `--red` | `#f04040` |
| `--yellow` | `#f0c040` |
| Font | JetBrains Mono, IBM Plex Mono, SF Mono, Fira Code, ui-monospace |
| Container | `max-width: 560px`, centered |

### Reusable Patterns
- **Rows**: Bordered surface blocks (`border: 1px solid var(--border)`, `background: var(--surface)`, padding `20px`)
- **Headers**: Title + small icon-button actions, bottom border separator
- **Labels**: Uppercase, `font-size: 11px`, `letter-spacing: 0.1em`, `color: var(--text-secondary)`
- **Buttons**: Border-styled, hover → orange accent, monospace font
- **Status indicators**: Green/red/yellow for positive/negative/warning states

## Data

### Problems JSON (`src/data/problems.json`)

An array of 75 problem objects, each with:

```ts
interface Problem {
  title: string;
  titleSlug: string;
  category: string;
  description: string;            // Markdown-ish problem statement
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  solution: string;               // Python code block (the one shown to user)
  groundTruth: 'correct' | 'incorrect';
  reviewNote: string;             // Explanation shown if user mislabels. For correct solutions, optional.
  // Future: language support — solutions in other languages
}
```

**Authoring strategy:** Problems are authored independently in separate pi sessions using deepseek-v4-flash, then consolidated into the single JSON file.

**Data source:** Problem metadata (title, slug, category) fetched from LeetCode's `studyPlanProgress` GraphQL query for the "leetcode-75" study plan. Solution code and review notes are hand-authored.

### Seeded Shuffle

```ts
function dateToSeed(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}
```

Daily deterministic shuffle: `seed → PRNG → Fisher-Yates`. Same day = same 5 problems for all users.

## State Management

### Reducer

```ts
type Verdict = 'correct' | 'incorrect';
type Action = { type: 'ANSWER'; verdict: Verdict };

// The only mutable state: accumulated answers
// Empty at start. Each ANSWER appends one verdict.
type AnswerState = Verdict[];
```

### Derived Values

- **`currentIndex`** = `answers.length` — which question the user is on (0–4)
- **`phase`** = `answers.length >= 5 ? 'results' : 'reviewing'` — which screen to render

### Questions

Derived via `useMemo`: `dateToSeed(today)` → PRNG → pick 5 from `problems.json`. Questions never change during a session.

## Component Tree

```
App
├── Header (title, date)
├── phase === 'reviewing'
│   └── QuestionCard
│       ├── ProblemDescription (title, description, examples, constraints)
│       ├── SolutionCode (highlight.js code block)
│       └── VerdictButtons (Correct / Incorrect)
└── phase === 'results'
    └── ResultsScreen
        ├── ScoreSummary (e.g., "4/5")
        └── RoundBreakdown[] (per-question: user verdict, ground truth, review note if mismatch)
```

## Screen Flow

### Question Screen (×5)
- No start screen — user lands directly on question 1
- Problem description at top, formatted with examples and constraints
- Solution code block below, Python with syntax highlighting
- Two buttons: **✓ Correct** / **✗ Incorrect**
- No immediate feedback on answer
- After answering, auto-advance to next question (or results if last)
- Progress indicator (e.g., "Question 2 of 5") shown

### Results Screen
- Score: X/5
- Per-question breakdown in a list:
  - Question title
  - User's verdict badge (green if matches ground truth, red if wrong)
  - For mislabeled questions: the review note explaining why
  - For correct answers: the green badge alone serves as confirmation; no extra text needed
- No retry / replay needed (daily challenge concept — come back tomorrow)

## Future Considerations

- **Language toggle**: A selector at the bottom of the page to switch solution language (Python, Java, C++, etc.). Requires extending `Problem` with multi-language solutions. Not in v1.
- **Persistence**: LocalStorage to remember which days the user has completed.
- **Streak tracking**: If persistence is added, show consecutive days completed.

## Deployment

- `vite build` produces static output in `dist/`
- `gh-pages` npm package deploys `dist/` to the `gh-pages` branch
- Repository: `wirasuta/leetcode-review`
- URL: `https://wirasuta.github.io/leetcode-review/`
