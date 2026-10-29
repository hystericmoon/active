import { useEffect, useState } from 'react';
import Mark from './Mark';
import PlayButton from './PlayButton';
import { STORE_URL } from '../data';

/** A plain bar that arrives once the hero's own navigation has scrolled away. */
export default function Bar() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const on = () => setShown(window.scrollY > window.innerHeight * 0.85);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header className={`bar${shown ? ' is-shown' : ''}`} aria-hidden={!shown} {...((!shown ? { inert: '' } : {}) as object)}>
      <a className="wordmark" href="#top">
        <Mark size={30} />
        <span>Active Design</span>
      </a>
      <nav aria-label="Sections">
        <a href="#catalogue">Catalogue</a>
        <a href="#features">Features</a>
        <a href="#faq">Questions</a>
      </nav>
      <PlayButton href={STORE_URL} small>
        Google Play
      </PlayButton>
    </header>
  );
}
