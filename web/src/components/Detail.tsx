import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Liquid } from 'liquid-gooey';
import { asset, categoryLabel, faces, fieldFor, TAG_LABEL, type Face } from '../data';
import { closeFace, faceHref } from '../router';
import PlayButton from './PlayButton';
import Watch3D from './Watch3D';

export default function Detail({ face }: { face: Face }) {
  const [v, setV] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);

  const i = faces.indexOf(face);
  const prev = faces[(i - 1 + faces.length) % faces.length];
  const next = faces[(i + 1) % faces.length];
  const related = useMemo(
    () => faces.filter((f) => f.category === face.category && f.slug !== face.slug).slice(0, 4),
    [face],
  );

  useEffect(() => {
    setV(0);
    sheet.current?.scrollTo({ top: 0 });
    closeRef.current?.focus({ preventScroll: true });
  }, [face]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFace();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const colour = face.variants[v]?.color ?? '#fff';

  return (
    <motion.div
      className="detail"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-h"
      ref={sheet}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      style={{ ['--face' as string]: colour }}
    >
      <div className="detail__bar">
        <button ref={closeRef} type="button" className="btn btn--ghost" onClick={closeFace}>
          <span aria-hidden="true">←</span> All faces
        </button>
        <nav className="detail__step" aria-label="Other faces">
          <a href={faceHref(prev.slug)}>Previous: {prev.name}</a>
          <a href={faceHref(next.slug)}>Next: {next.name}</a>
        </nav>
      </div>

      <div className="detail__top">
        <div className="detail__stage">
          <Watch3D
            className="detail__watch"
            textures={face.variants.map((x) => asset(x.src))}
            index={v}
            distance={7.4}
            label={`${face.name} on a 3D watch, colour ${v + 1} of ${face.variants.length}. Drag to turn it.`}
          />
          <p className="detail__hint soft">
            <span className="hint--fine">Drag to turn the watch</span>
            <span className="hint--coarse">Pick a colour below to see it on the watch</span>
          </p>
        </div>

        <div className="detail__info">
          <p className="detail__kicker soft">
            {categoryLabel(face)} · released {face.released}
          </p>
          <h1 id="detail-h">{face.name}</h1>
          <p className="lead">{face.summary || face.title}</p>

          <div className="detail__buy">
            <span className="detail__price">{face.priceText}</span>
            <PlayButton href={face.url}>Get it on Google Play</PlayButton>
          </div>

          <dl className="detail__facts">
            <div>
              <dt>Colours</dt>
              <dd>{face.colorCount}</dd>
            </div>
            <div>
              <dt>Installs</dt>
              <dd>{face.installs}</dd>
            </div>
            <div>
              <dt>Rating</dt>
              <dd>{face.rating ? `${face.rating} (${face.ratings.toLocaleString()})` : 'Not yet rated'}</dd>
            </div>
          </dl>

          <Swatches face={face} value={v} onChange={setV} />

          <h2 className="detail__sub">On the dial</h2>
          <ul className="detail__features">
            {face.features.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <ul className="detail__tags" aria-label="Features">
            {face.tags.map((t) => (
              <li key={t}>{TAG_LABEL[t]}</li>
            ))}
          </ul>
        </div>
      </div>

      {(face.clip || face.promos.length > 0) && (
        <section className="detail__media" aria-labelledby="media-h">
          <h2 id="media-h" className="detail__sub">
            {face.name} on the wrist
          </h2>
          <div className="detail__run">
            {face.clip && (
              <figure className="detail__clip">
                <video src={asset(face.clip)} autoPlay muted loop playsInline aria-label={`${face.name} preview clip`} />
              </figure>
            )}
            {face.promos.map((p, k) => (
              <figure key={p.src}>
                <img src={asset(p.src)} alt={`${face.name} store image ${k + 1}`} width={p.w} height={p.h} loading="lazy" />
              </figure>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="detail__related" aria-labelledby="rel-h">
          <h2 id="rel-h" className="detail__sub">
            More {categoryLabel(face).toLowerCase()} faces
          </h2>
          <ul>
            {related.map((f, k) => (
              <li key={f.slug}>
                <a href={faceHref(f.slug)} style={{ background: fieldFor(k) }}>
                  <img src={asset(f.variants[0].src)} alt="" width={240} height={240} loading="lazy" />
                </a>
                <p>
                  <a href={faceHref(f.slug)}>{f.name}</a>
                  <span className="soft">
                    {' '}
                    · {f.colorCount} colours · {f.priceText}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </motion.div>
  );
}

/** Colour dots on one liquid surface: the chosen one swells and the goo bridges to its neighbours. */
function Swatches({ face, value, onChange }: { face: Face; value: number; onChange: (i: number) => void }) {
  const onKey = (e: React.KeyboardEvent) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (value + d + face.variants.length) % face.variants.length;
    onChange(n);
    (e.currentTarget.querySelectorAll('button')[n] as HTMLButtonElement | undefined)?.focus();
  };
  return (
    <div className="detail__colours">
      <h2 className="detail__sub" id="colours-h">
        Colour {value + 1} of {face.variants.length} shown
        {face.colorCount > face.variants.length && <span className="soft"> · {face.colorCount} on the watch</span>}
      </h2>
      <div className="swatchbar" role="radiogroup" aria-labelledby="colours-h" onKeyDown={onKey}>
        <Liquid fill="#262626" blur={6} contrast={18}>
          {face.variants.map((vr, i) => (
            <Liquid.Item key={vr.src} scale={i === value ? 1.32 : 1} transition="bouncy" morph={{ bounce: 0.6 }}>
              <button
                type="button"
                role="radio"
                aria-checked={i === value}
                aria-label={`Colour ${i + 1}, ${vr.color}`}
                tabIndex={i === value ? 0 : -1}
                className="swatch"
                onClick={() => onChange(i)}
              >
                <span style={{ background: vr.color }} />
              </button>
            </Liquid.Item>
          ))}
        </Liquid>
      </div>
      <div className="detail__dials">
        {face.variants.map((vr, i) => (
          <button
            key={vr.src}
            type="button"
            className={`detail__dial${i === value ? ' is-on' : ''}`}
            onClick={() => onChange(i)}
            aria-label={`Show colour ${i + 1}`}
            tabIndex={-1}
          >
            <img src={asset(vr.src)} alt="" width={120} height={120} loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );
}
