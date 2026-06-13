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
