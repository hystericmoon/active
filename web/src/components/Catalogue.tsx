import { useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Liquid } from 'liquid-gooey';
import { BorderBeam } from 'border-beam';
import { ThinkingOrb } from 'thinking-orbs';
import { CATEGORIES, FILTER_TAGS, TAG_LABEL, asset, categoryLabel, faces, fieldFor, type Category, type Face, type Tag } from '../data';
import { faceHref } from '../router';

type Sort = 'new' | 'popular' | 'colours' | 'name';
const FIRST = 17;
const SORTS: { id: Sort; label: string }[] = [
  { id: 'new', label: 'Newest first' },
  { id: 'popular', label: 'Most installed' },
  { id: 'colours', label: 'Most colours' },
  { id: 'name', label: 'Name, A to Z' },
];

export default function Catalogue() {
  const [cat, setCat] = useState<'all' | Category>('all');
  const [tags, setTags] = useState<Tag[]>([]);
  const [freeOnly, setFreeOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('new');
  const [view, setView] = useState<'grid' | 'index'>('grid');
  const [expanded, setExpanded] = useState(false);
  const deferred = useDeferredValue(query);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!query) return setTyping(false);
    setTyping(true);
    const t = setTimeout(() => setTyping(false), 420);
    return () => clearTimeout(t);
  }, [query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: faces.length };
    for (const f of faces) c[f.category] = (c[f.category] ?? 0) + 1;
    return c;
  }, []);

  const list = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    const out = faces.filter(
      (f) =>
        (cat === 'all' || f.category === cat) &&
        tags.every((t) => f.tags.includes(t)) &&
        (!freeOnly || f.free) &&
        (!q || `${f.name} ${f.title} ${f.category} ${f.features.join(' ')}`.toLowerCase().includes(q)),
    );
    const by: Record<Sort, (a: Face, b: Face) => number> = {
      new: (a, b) => b.releasedTs - a.releasedTs,
      popular: (a, b) => b.minInstalls - a.minInstalls || b.releasedTs - a.releasedTs,
      colours: (a, b) => b.colorCount - a.colorCount,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return out.sort(by[sort]);
  }, [cat, tags, freeOnly, deferred, sort]);

  const toggleTag = (t: Tag) => setTags((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));
  const reset = () => {
    setCat('all');
    setTags([]);
    setFreeOnly(false);
    setQuery('');
  };
  const filtered = cat !== 'all' || tags.length > 0 || freeOnly || deferred !== '';

  return (
    <section className="catalogue" id="catalogue" aria-labelledby="catalogue-h">
      <div className="catalogue__head">
        <h2 id="catalogue-h">The catalogue</h2>
        <p className="lead">
          Every face Active Design has on Google Play. Choose a style, narrow it by what you want on the dial, then open a
          face to see all of its colours.
        </p>
      </div>

      <div className="controls">
        <Tabs value={cat} onChange={setCat} counts={counts} />

        <div className="controls__row">
          <div className="chips" role="group" aria-label="Must have">
            {FILTER_TAGS.map((t) => (
              <button key={t} type="button" className="chip" aria-pressed={tags.includes(t)} onClick={() => toggleTag(t)}>
                {TAG_LABEL[t]}
              </button>
            ))}
            <button type="button" className="chip" aria-pressed={freeOnly} onClick={() => setFreeOnly((v) => !v)}>
              Free
            </button>
          </div>

          <div className="controls__tools">
            <BorderBeam size="line" colorVariant="forest" theme="dark" active={typing} className="search-beam">
              <label className="search">
                <span className="sr-only">Search watch faces</span>
                <span className="search__orb" aria-hidden="true">
                  <ThinkingOrb state={typing ? 'searching' : 'breathing'} size={20} theme="dark" paused={!typing} />
                </span>
                <input
                  type="search"
                  placeholder="Search by name or feature"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            </BorderBeam>
            <label className="select">
              <span className="sr-only">Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="seg" role="group" aria-label="Layout">
              <button type="button" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>
                Specimens
              </button>
              <button type="button" aria-pressed={view === 'index'} onClick={() => setView('index')}>
                Index
              </button>
            </div>
          </div>
        </div>

        <p className="controls__count" aria-live="polite">
          {list.length === faces.length ? `All ${faces.length} faces` : `${list.length} of ${faces.length} faces`}
          {filtered && (
            <button type="button" className="link" onClick={reset}>
              Clear filters
            </button>
          )}
        </p>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <ThinkingOrb state="shaping" size={64} theme="dark" aria-label="Nothing matches yet" />
          <p>
            No face has all of that yet. Remove a filter, or ask for it at{' '}
            <a className="link" href="mailto:activewatchdesign@gmail.com?subject=A%20watch%20face%20idea">
              activewatchdesign@gmail.com
            </a>
            .
          </p>
          <button type="button" className="btn btn--accent" onClick={reset}>
            Show all {faces.length} faces
          </button>
        </div>
      ) : view === 'grid' ? (
        <>
          <Grid list={expanded || filtered ? list : list.slice(0, FIRST)} />
          {!expanded && !filtered && list.length > FIRST && (
            <div className="more">
              <button type="button" className="btn btn--ghost" onClick={() => setExpanded(true)}>
                Show all {list.length} faces
              </button>
              <span className="soft">{list.length - FIRST} more in this order</span>
            </div>
          )}
        </>
      ) : (
        <Index list={list} />
      )}
    </section>
  );
}

function Tabs({
  value,
  onChange,
  counts,
}: {
  value: 'all' | Category;
  onChange: (c: 'all' | Category) => void;
  counts: Record<string, number>;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ x: 0, w: 0 });

  useLayoutEffect(() => {
    const measure = () => {
      const el = wrap.current?.querySelector<HTMLElement>(`[data-cat="${value}"]`);
      if (el) setBox({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener('resize', measure);
  }, [value]);

  const onKey = (e: React.KeyboardEvent) => {
    const i = CATEGORIES.findIndex((c) => c.id === value);
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = CATEGORIES[(i + d + CATEGORIES.length) % CATEGORIES.length].id;
    onChange(next);
    wrap.current?.querySelector<HTMLElement>(`[data-cat="${next}"]`)?.focus();
  };

  return (
    <div className="tabs" ref={wrap} role="tablist" aria-label="Style" onKeyDown={onKey}>
      <Liquid fill="var(--accent)" blur={7} contrast={20} className="tabs__goo" aria-hidden="true">
        <Liquid.Item effect="move" move={{ springiness: 0.45, trail: 0.6, wobble: 0.55 }}>
          <div className="tabs__blob" style={{ transform: `translateX(${box.x}px)`, width: box.w }} />
        </Liquid.Item>
      </Liquid>
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          type="button"
          role="tab"
          data-cat={c.id}
          aria-selected={value === c.id}
          tabIndex={value === c.id ? 0 : -1}
          className="tab"
          onClick={() => onChange(c.id)}
        >
          {c.label}
          <span className="tab__n">{counts[c.id] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

function Grid({ list }: { list: Face[] }) {
  return (
    <motion.ul className="grid" layout>
      <AnimatePresence mode="popLayout">
        {list.map((f, i) => (
          <motion.li
            key={f.slug}
            layout
            className={i % 7 === 1 ? 'grid__big' : undefined}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.45, delay: Math.min(i, 12) * 0.03, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Specimen face={f} field={fieldFor(i)} big={i % 7 === 1} />
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}

/** One face on its card. Hovering turns through its colours and tilts it toward the pointer. */
function Specimen({ face, field, big }: { face: Face; field: string; big: boolean }) {
  const [hover, setHover] = useState(false);
  const [v, setV] = useState(0);
  const card = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!hover || face.variants.length < 2) return;
    const t = setInterval(() => setV((x) => (x + 1) % face.variants.length), 650);
    return () => clearInterval(t);
  }, [hover, face.variants.length]);

  const tilt = (e: React.PointerEvent) => {
    const el = card.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--tx', `${((e.clientX - r.left) / r.width - 0.5) * 18}deg`);
    el.style.setProperty('--ty', `${((e.clientY - r.top) / r.height - 0.5) * -18}deg`);
  };

  return (
    <article className="specimen">
      <BorderBeam size="md" colorVariant="colorful" theme="dark" active={hover} strength={0.85} borderRadius={0} className="specimen__beam">
        <a
          ref={card}
          href={faceHref(face.slug)}
          className="specimen__card"
          style={{ background: field }}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => {
            setHover(false);
            setV(0);
            card.current?.style.setProperty('--tx', '0deg');
            card.current?.style.setProperty('--ty', '0deg');
          }}
          onPointerMove={tilt}
          onFocus={() => setHover(true)}
          onBlur={() => {
            setHover(false);
            setV(0);
          }}
          aria-label={`${face.name}, ${categoryLabel(face)} watch face, ${face.priceText}`}
        >
          <span className="specimen__dial">
            {face.variants.map((vr, i) => (
              <img
                key={vr.src}
                src={asset(vr.src)}
                alt=""
                width={big ? 560 : 320}
                height={big ? 560 : 320}
                loading={i === 0 ? 'lazy' : 'lazy'}
                decoding="async"
                className={i === v ? 'is-on' : undefined}
                style={i > 0 && !hover && v === 0 ? { display: 'none' } : undefined}
              />
            ))}
          </span>
          {face.free && <span className="specimen__free">Free</span>}
        </a>
      </BorderBeam>
      <div className="specimen__meta">
        <h3>
          <a href={faceHref(face.slug)} tabIndex={-1}>
            {face.name}
          </a>
        </h3>
        <p className="soft">
          {categoryLabel(face)} · {face.colorCount} colours · {face.priceText}
        </p>
        <ul className="swatches" aria-label={`${face.variants.length} colours shown`}>
          {face.variants.slice(0, 10).map((vr, i) => (
            <li key={i} className={hover && i === v ? 'is-on' : undefined} style={{ background: vr.color }} />
          ))}
        </ul>
      </div>
    </article>
  );
}

/** The signature move: the names are the navigation, and the pointed face lights up in one frame. */
function Index({ list }: { list: Face[] }) {
  const [active, setActive] = useState(list[0]);
  useEffect(() => setActive(list[0]), [list]);

  return (
    <div className="index">
      <ol className="index__list" onPointerLeave={() => setActive(list[0])}>
        {list.map((f) => (
          <li key={f.slug} className={active?.slug === f.slug ? 'is-on' : undefined}>
            <a href={faceHref(f.slug)} onPointerEnter={() => setActive(f)} onFocus={() => setActive(f)}>
              <img className="index__thumb" src={asset(f.variants[0].src)} alt="" width={64} height={64} loading="lazy" />
              <span className="index__name">{f.name}</span>
              <span className="index__cat">{categoryLabel(f)}</span>
              <span className="index__col">{f.colorCount} colours</span>
              <span className="index__price">{f.priceText}</span>
            </a>
          </li>
        ))}
      </ol>
      <div className="index__frame" aria-hidden="true">
        <div className="index__sticky">
          <AnimatePresence mode="popLayout" initial={false}>
            {active && (
              <motion.img
                key={active.slug}
                src={asset(active.variants[0].src)}
                alt=""
                width={560}
                height={560}
                initial={{ opacity: 0, rotateY: -70, scale: 0.92 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, rotateY: 70, scale: 0.92 }}
                transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
              />
            )}
          </AnimatePresence>
          {active && (
            <p className="index__caption">
              {active.title}
              <br />
              <span className="soft">
                {active.installs} installs · released {active.released}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
