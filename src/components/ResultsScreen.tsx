import type { Problem, Verdict } from '../lib/types';
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
                You said: {answers[i]} | Actual: {q.groundTruth}
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
