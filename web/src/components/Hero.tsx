import { useEffect, useMemo, useRef } from 'react';
import { BorderBeam } from 'border-beam';
import { asset, faces, fieldFor, STORE_URL } from '../data';
import { openFace } from '../router';
import Mark from './Mark';

const ROWS = 8;
const PER_ROW = 16;

/**
 * The specimen wall: every face in the collection, laid as brickwork on
 * coloured card. Rows drift in opposite directions and the whole wall leans
 * toward the pointer, so it reads as a physical board you are standing at.
 */
export default function Hero() {
  const wall = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => {
    const out: { face: (typeof faces)[number]; v: number; field: string }[][] = [];
    let k = 0;
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < PER_ROW; c++) {
        const face = faces[(r * 7 + c * 3) % faces.length];
        row.push({ face, v: (r + c) % face.variants.length, field: fieldFor(k++ + r) });
      }
      out.push(row);
    }
    return out;
  }, []);

  useEffect(() => {
    const el = wall.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let tx = 0, ty = 0, x = 0, y = 0;
    const move = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const tick = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      el.style.setProperty('--rx', `${(-y * 6 + 14).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
    };
  }, []);

  return (
    <section className="hero" id="top">
      <div className="hero__stage" aria-hidden="true">
        <div className="hero__wall" ref={wall}>
          {rows.map((row, r) => (
            <div className={`hero__row${r % 2 ? ' is-rev' : ''}`} key={r} style={{ ['--d' as string]: `${70 + r * 6}s` }}>
              {[...row, ...row].map(({ face, v, field }, i) => (
                <button
                  type="button"
                  tabIndex={-1}
                  className="hero__tile"
                  style={{ background: field, ['--i' as string]: i % PER_ROW }}
                  key={i}
                  onClick={() => openFace(face.slug)}
                >
                  <span className="hero__coin">
                    <img src={asset(face.variants[v].thumb)} alt="" width={140} height={140} decoding="async" />
                    <img
                      className="hero__back"
                      src={asset(face.variants[(v + 1) % face.variants.length].thumb)}
                      alt=""
                      width={140}
                      height={140}
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="hero__panel">
        <div className="hero__copy">
          <h1>{faces.length} watch faces for Wear OS</h1>
          <p>Digital, analog and hybrid dials by Active Design. Pick a face, try every colour, install from Google Play.</p>
        </div>
        <BorderBeam size="md" colorVariant="colorful" theme="dark" strength={0.9} className="hero__beam">
          <a className="btn btn--accent" href="#catalogue">
            Browse the catalogue
          </a>
        </BorderBeam>
        <nav className="hero__nav" aria-label="Main">
          <a className="wordmark" href="#top">
            <Mark size={26} />
            <span>Active Design</span>
          </a>
          <a href="#catalogue">Catalogue</a>
          <a href="#features">Features</a>
          <a href="#faq">Questions</a>
          <a href={STORE_URL} target="_blank" rel="noreferrer">
            Google Play
          </a>
        </nav>
      </div>
    </section>
  );
}
