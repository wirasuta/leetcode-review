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
        Correct
      </button>
      <button
        className={styles.btn}
        disabled={disabled}
        onClick={() => onAnswer('incorrect')}
      >
        Incorrect
      </button>
    </div>
  );
}
