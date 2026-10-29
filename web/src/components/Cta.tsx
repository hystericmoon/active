import { useEffect, useMemo, useState } from 'react';
import { asset, faces, STORE_URL } from '../data';
import PlayButton from './PlayButton';
import Watch3D from './Watch3D';
import InView from './InView';

/** The watch from the hero comes back as an object, turning through the collection. */
export default function Cta() {
  const set = useMemo(() => faces.filter((_, i) => i % 4 === 0).slice(0, 10), []);
  const [i, setI] = useState(0);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % set.length), 2600);
    return () => clearInterval(t);
  }, [set.length, paused]);

  return (
    <section className="cta" aria-labelledby="cta-h">
      <div className="cta__watch">
        <img
          className={`cta__poster${ready ? ' is-gone' : ''}`}
          src={asset(set[i].variants[0].src)}
          alt=""
          width={560}
          height={560}
        />
        <InView className="cta__stage">
          <Watch3D
            className="cta__canvas"
            textures={set.map((f) => asset(f.variants[0].src))}
            index={i}
            spin
            distance={7.4}
            onReady={() => setReady(true)}
            label={`A 3D watch showing ${set[i].name}; drag to turn it`}
          />
        </InView>
      </div>
      <div className="cta__text">
        <h2 id="cta-h">Find yours on Google Play</h2>
        <p>All {faces.length} faces are listed under Active Design Watch Face. Most cost {faces.find((f) => !f.free)?.priceText}; {faces.filter((f) => f.free).length} are free.</p>
        <p className="cta__fact">
          Now showing: <strong>{set[i].name}</strong>
        </p>
        <div className="cta__picks" role="group" aria-label="Show a face on the watch">
          {set.map((f, k) => (
            <button
              key={f.slug}
              type="button"
              aria-pressed={k === i}
              aria-label={f.name}
              onClick={() => {
                setI(k);
                setPaused(true);
              }}
            >
              <img src={asset(f.variants[0].src)} alt="" width={48} height={48} loading="lazy" />
            </button>
          ))}
        </div>
        <PlayButton href={STORE_URL}>See all on Google Play</PlayButton>
      </div>
    </section>
  );
}
