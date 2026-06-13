import { useReducer, useMemo } from 'react';
import type { Verdict, AppAction } from './lib/types';
import { dateToSeed, seededShuffle } from './lib/shuffle';
import type { Problem } from './lib/types';
import problemsData from './data/problems.json';
const problems = problemsData as Problem[];
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
