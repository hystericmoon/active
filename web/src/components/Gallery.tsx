import { motion } from 'motion/react';
import { asset, categoryLabel, faces } from '../data';
import { faceHref } from '../router';

/** Store renders on real watches, sheeted like a contact print. */
const shots = faces
  .filter((f) => f.promos.length)
  .flatMap((f, i) => {
    const p = f.promos[(i % 3) + 1] ?? f.promos[0];
    return [{ f, p }];
  })
  .slice(0, 24);
const features = faces.filter((f) => f.wides.length).slice(0, 3);

export default function Gallery() {
  return (
    <section className="gallery" aria-labelledby="gallery-h">
      <div className="gallery__head">
        <h2 id="gallery-h">On the wrist</h2>
        <p className="lead">
          Each face as it appears in its Play listing, on a Galaxy Watch. Every layout is drawn for the round display
          and its black.
        </p>
      </div>
      <motion.div
        className="gallery__sheet"
        initial="out"
        whileInView="in"
        viewport={{ once: true, amount: 0.05 }}
        transition={{ staggerChildren: 0.035 }}
      >
        <div className="gallery__features">
          {features.map((f) => (
            <figure key={f.slug}>
              <a href={faceHref(f.slug)}>
                <img src={asset(f.wides[0].src)} alt={`${f.name} feature graphic`} width={f.wides[0].w} height={f.wides[0].h} loading="lazy" />
              </a>
              <figcaption>
                {f.name}
                <span className="soft">, {categoryLabel(f).toLowerCase()}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        {shots.map(({ f, p }) => (
          <motion.figure
            key={f.slug}
            variants={{ out: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5 }}
          >
            <a href={faceHref(f.slug)}>
              <img src={asset(p.src)} alt={`${f.name} on a Galaxy Watch`} width={p.w} height={p.h} loading="lazy" />
            </a>
            <figcaption>
              {f.name}
              <span className="soft">, {categoryLabel(f).toLowerCase()}</span>
            </figcaption>
          </motion.figure>
        ))}
      </motion.div>
    </section>
  );
}
