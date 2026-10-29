import { motion } from 'motion/react';
import { asset, categoryLabel, faces } from '../data';
import { faceHref } from '../router';

const latest = faces.find((f) => f.clip && f.promos.length >= 2) ?? faces[0];

/** The newest face, seen as a run of frames: on the wrist, in motion, and in its colours. */
export default function Showcase() {
  const f = latest;
  const frames: { kind: 'img' | 'clip'; src: string; w: number; h: number; name: string; fact: string; lifted?: boolean }[] = [
    ...(f.clip ? [{ kind: 'clip' as const, src: f.clip, w: 4, h: 5, name: 'In motion', fact: 'From the Play listing', lifted: true }] : []),
    ...(f.promos[0] ? [{ kind: 'img' as const, ...f.promos[0], name: 'On the wrist', fact: 'Galaxy Watch' }] : []),
    ...f.variants.slice(0, 5).map((v, i) => ({
      kind: 'img' as const,
      src: v.src,
      w: 560,
      h: 560,
      name: `Colour ${i + 1}`,
      fact: v.color.toUpperCase(),
    })),
    ...(f.promos[2] ? [{ kind: 'img' as const, ...f.promos[2], name: 'Detail', fact: 'Store render' }] : []),
  ];

  return (
    <section className="showcase" aria-labelledby="showcase-h">
      <div className="showcase__side">
        <h2 id="showcase-h">Latest: {f.name}</h2>
        <a className="link" href={faceHref(f.slug)}>
          Open {f.name}
        </a>
        <p className="showcase__note">
          {categoryLabel(f)} face, released {f.released}. {f.colorCount} colours, {f.priceText} on Google Play.
        </p>
        <p className="showcase__note showcase__note--low">{f.summary || f.features[0]}</p>
      </div>
      <motion.div
        className="showcase__run"
        initial="out"
        whileInView="in"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ staggerChildren: 0.07 }}
      >
        {frames.map((fr, i) => (
          <motion.figure
            key={i}
            className={`frame${fr.lifted ? ' frame--lifted' : ''}`}
            variants={{ out: { opacity: 0, y: 28 }, in: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="frame__media" style={{ aspectRatio: `${fr.w} / ${fr.h}` }}>
              {fr.kind === 'clip' ? (
                <video src={asset(fr.src)} poster={asset(f.header ?? f.variants[0].src)} autoPlay muted loop playsInline aria-label={`${f.name} preview clip`} />
              ) : (
                <img src={asset(fr.src)} alt={`${f.name}, ${fr.name.toLowerCase()}`} width={fr.w} height={fr.h} />
              )}
            </div>
            <figcaption>
              <span>{fr.name}</span>
              <span className="soft">{fr.fact}</span>
            </figcaption>
          </motion.figure>
        ))}
      </motion.div>
    </section>
  );
}
