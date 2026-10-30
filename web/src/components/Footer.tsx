import { CONTACT, faces, STORE_URL } from '../data';
import { faceHref } from '../router';
import PlayButton from './PlayButton';

export default function Footer() {
  const newest = faces.slice(0, 4);
  const popular = [...faces].sort((a, b) => b.minInstalls - a.minInstalls).slice(0, 4);
  return (
    <footer className="footer">
      <div className="footer__links">
        <div>
          <h2>Newest</h2>
          <ul>
            {newest.map((f) => (
              <li key={f.slug}>
                <a href={faceHref(f.slug)}>{f.name}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Most installed</h2>
          <ul>
            {popular.map((f) => (
              <li key={f.slug}>
                <a href={faceHref(f.slug)}>{f.name}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Browse</h2>
          <ul>
            <li><a href="#catalogue">Catalogue</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#faq">Questions</a></li>
          </ul>
        </div>
        <div>
          <h2>Elsewhere</h2>
          <ul>
            <li><a href={STORE_URL} target="_blank" rel="noreferrer">Google Play</a></li>
            <li><a href="https://sites.google.com/view/activewatchdesign/home" target="_blank" rel="noreferrer">Privacy policy</a></li>
          </ul>
        </div>
        <div className="footer__contact">
          <h2>Write</h2>
          <p><a href={`mailto:${CONTACT}`}>{CONTACT}</a></p>
          <p className="soft">Prices are from the US Google Play store and differ by country.</p>
        </div>
      </div>
      <div className="footer__last">
        <p className="soft">© {new Date().getFullYear()} Active Design. Wear OS is a trademark of Google LLC.</p>
        <PlayButton href={STORE_URL} small preset="silver">
          Google Play
        </PlayButton>
      </div>
    </footer>
  );
}
