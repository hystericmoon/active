import { motion } from 'motion/react';
import { asset, countBy, faces, maxColours, type Tag } from '../data';

const pick = (slug: string) => faces.find((f) => f.slug === slug) ?? faces[0];

type Spec = { name: string; fact: string; slug: string; v?: number; field: string; wide?: boolean; tag?: Tag };

const of = (t: Tag) => `On ${countBy((f) => f.tags.includes(t))} of ${faces.length} faces`;
const richest = faces.reduce((a, b) => (b.colorCount > a.colorCount ? b : a));

const SPECS: Spec[] = [
  { name: 'Always-on display', fact: of('aod'), slug: 'essentials-digital', v: 0, field: 'var(--field-1)' },
  {
    name: 'Colour, chosen on the watch',
    fact: `Up to ${maxColours} combinations on ${richest.name}`,
    slug: 'rush-3',
    field: 'var(--field-2)',
    wide: true,
  },
  { name: 'Heart rate', fact: `${of('heart')}, tap to measure`, slug: 'stratos', v: 2, field: 'var(--field-3)' },
  { name: 'Moon phase', fact: of('moon'), slug: 'odyssey-2', v: 1, field: 'var(--field-2)' },
  { name: 'Shortcuts', fact: `${of('shortcuts')}, up to four`, slug: 'celestrix', v: 3, field: 'var(--field-1)' },
  { name: 'Weather', fact: of('weather'), slug: 'equinox', v: 4, field: 'var(--field-3)' },
  { name: 'Complications', fact: `${of('complications')}, set from the watch`, slug: 'vision-3', v: 5, field: 'var(--field-2)' },
];

export default function Features() {
  return (
    <section className="features" id="features" aria-labelledby="features-h">
      <div className="features__side">
        <h2 id="features-h">What’s on the dial</h2>
        <p className="lead">
          Every face is built in Watch Face Studio for Wear OS, drawn for AMOLED black and tuned to stay readable in a
          glance.
        </p>
      </div>
      <ul className="features__grid">
        {SPECS.map((s, i) => {
          const f = pick(s.slug);
          return (
            <motion.li
              key={s.name}
              className={s.wide ? 'is-wide' : undefined}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.55, delay: i * 0.07, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="features__tile" style={{ background: s.field }}>
                {s.wide ? (
                  <div className="features__strip">
                    {f.variants.slice(0, 5).map((v, k) => (
                      <img key={k} src={asset(v.src)} alt="" width={200} height={200} loading="lazy" style={{ ['--k' as string]: k }} />
                    ))}
                  </div>
                ) : (
                  <img
                    src={asset(f.variants[Math.min(s.v ?? 0, f.variants.length - 1)].src)}
                    alt={`${f.name} dial`}
                    width={400}
                    height={400}
                    loading="lazy"
                  />
                )}
              </div>
              <h3>{s.name}</h3>
              <p className="soft">{s.fact}</p>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
