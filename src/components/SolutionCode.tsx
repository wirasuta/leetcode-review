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
      codeRef.current.removeAttribute('data-highlighted');
      codeRef.current.className = 'language-python';
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
