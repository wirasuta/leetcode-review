import type { Problem, Verdict } from '../lib/types';
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

      <div className={styles.category}>{problem.category} | {problem.difficulty}</div>
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
