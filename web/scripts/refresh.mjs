// Refreshes src/data/faces.json and public/faces/* from the live Google Play listings.
//
//   node scripts/refresh.mjs            # update changed faces, add new ones
//   node scripts/refresh.mjs --all      # rebuild every face's images
//
// A face's images are only rebuilt when its store image URLs change, so a weekly
// run with nothing new on Play leaves the repository untouched.
import gplay from 'google-play-scraper';
import sharp from 'sharp';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'src/data/faces.json');
const SOURCES = join(ROOT, 'scripts/sources.json');
const PUB = join(ROOT, 'public');
const CACHE = join(ROOT, '.cache/play');
const O = JSON.parse(readFileSync(join(ROOT, 'scripts/overrides.json'), 'utf8'));
const ALL = process.argv.includes('--all');

const old = existsSync(DATA) ? JSON.parse(readFileSync(DATA, 'utf8')) : [];
const oldById = Object.fromEntries(old.map((f) => [f.id, f]));
const sources = existsSync(SOURCES) ? JSON.parse(readFileSync(SOURCES, 'utf8')) : {};

const ours = (a) => a && (a.developerId === O.developerId || /Active Design/i.test(a.developer || ''));
const log = (...a) => console.log(...a);

// ---------- discover ----------
async function discover() {
  const ids = new Set(old.map((f) => f.id));
  try {
    for (const a of await gplay.developer({ devId: O.developerId, num: 200 })) ids.add(a.appId);
  } catch (e) {
    log('developer list failed:', e.message);
  }
  for (const term of O.searches) {
    try {
      for (const a of await gplay.search({ term, num: 250 })) if (ours(a)) ids.add(a.appId);
    } catch (e) {
      log('search failed:', term, e.message);
    }
  }
  const details = {};
  const queue = [...ids];
  while (queue.length) {
    const id = queue.shift();
    if (details[id]) continue;
    try {
      const d = await gplay.app({ appId: id, lang: 'en', country: 'us' });
      if (!ours(d)) continue;
      details[id] = d;
      for (const s of await gplay.similar({ appId: id }).catch(() => []))
        if (ours(s) && !details[s.appId] && !queue.includes(s.appId)) queue.push(s.appId);
    } catch (e) {
      // A listing that disappeared (unpublished) drops out of the catalogue.
      log('gone or failed:', id, e.message);
    }
  }
  return details;
}

// ---------- helpers ----------
function slugOf(id) {
  const raw = id.startsWith('com.watchfacestudio.') ? id.split('.')[2] : id.split('.').pop();
  return O.slugs[raw] ?? raw;
}
const EMO = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{2190}-\u{21FF}\u{2300}-\u{23FF}]/gu;
const TAGS = {
  aod: /always[- ]on|\baod\b/i,
  heart: /heart/i,
  steps: /\bsteps?\b|step count/i,
  weather: /weather|temperature/i,
  battery: /battery/i,
  moon: /moon/i,
  shortcuts: /shortcut/i,
  complications: /complication/i,
  timezone: /time ?zone|world time|dual time/i,
};
const TAG_TEXT = {
  aod: 'Always-on display',
  heart: 'Heart rate, tap to measure',
  steps: 'Step counter',
  weather: 'Weather and temperature',
  battery: 'Battery level',
  moon: 'Moon phase',
  shortcuts: 'Customisable shortcuts',
  complications: 'Customisable complications',
  timezone: 'Second time zone',
};
function category(a) {
  const t = a.title.toLowerCase();
  const d = a.description.toLowerCase();
  for (const c of ['diver', 'hybrid', 'analog', 'digital']) if (t.includes(c)) return c === 'diver' ? 'analog' : c;
  for (const c of ['hybrid', 'analog', 'digital']) if (d.includes(`${c} watch face`) || d.includes(`${c} design`)) return c;
  return 'digital';
}
function features(desc, tags) {
  const out = [];
  for (const line of desc.split('\n')) {
    const raw = line.trim();
    if (!raw) continue;
    const bullet = '•-*–·'.includes(raw[0]) || /^\p{Extended_Pictographic}/u.test(raw);
    let t = raw.replace(EMO, '').trim().replace(/^[\s•\-*–·:]+|[\s•\-*–·:]+$/g, '').replace(/\s+/g, ' ').replace(/\*$/, '');
    if (bullet && t.length > 4 && t.length < 110 && !/galaxy watch|pixel watch|wear os [0-9]|compatible|tizen|search|google play|download|today/i.test(t)) {
      t = t[0].toUpperCase() + t.slice(1);
      if (!out.includes(t)) out.push(t);
    }
  }
  return out.length >= 4 ? out.slice(0, 10) : tags.map((k) => TAG_TEXT[k]);
}
const nameOf = (title) => title.split(/:| Watch Face| Hybrid Watch| Digital Watch| Analog Watch/)[0].trim();

async function fetchTo(url, file) {
  if (existsSync(file)) return file;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  return file;
}

async function pixels(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const at = (x, y) => {
    const i = (y * info.width + x) * 3;
    return [data[i], data[i + 1], data[i + 2]];
  };
  return { w: info.width, h: info.height, at };
}

/** The dial's dominant saturated hue, brightened to read as a swatch; grey dials give a light grey. */
async function accent(file) {
  const { data } = await sharp(file).removeAlpha().resize(120, 120, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  const bins = new Map();
  let total = 0;
  for (let i = 0; i < data.length; i += 3) {
    const [r, g, b] = [data[i] / 255, data[i + 1] / 255, data[i + 2] / 255];
    const max = Math.max(r, g, b), min = Math.min(r, g, b), v = max, s = max ? (max - min) / max : 0;
    if (v < 0.3) continue;
    let h = 0;
    if (max !== min) {
      const d = max - min;
      h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) / 6 : max === g ? ((b - r) / d + 2) / 6 : ((r - g) / d + 4) / 6;
    }
    const k = s < 0.28 ? 'grey' : Math.floor(h * 24);
    const w = (s * s + 0.05) * v;
    const e = bins.get(k) ?? [0, 0, 0, 0];
    e[0] += w; e[1] += r * w; e[2] += g * w; e[3] += b * w;
    bins.set(k, e);
    total += w;
  }
  const colourful = [...bins.entries()].filter(([k]) => k !== 'grey').sort((a, b) => b[1][0] - a[1][0]);
  if (colourful.length && (colourful[0][1][0] > 0.12 * total || !bins.has('grey'))) {
    const e = colourful[0][1];
    let [r, g, b] = [e[1] / e[0], e[2] / e[0], e[3] / e[0]];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const s = Math.min(1, (max ? (max - min) / max : 0) * 1.1), v = Math.max(max, 0.85);
    // rebuild from hue with the boosted saturation and value
    let h = 0;
    if (max !== min) {
      const d = max - min;
      h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) / 6 : max === g ? ((b - r) / d + 2) / 6 : ((r - g) / d + 4) / 6;
    }
    const f = (n) => {
      const k = (n + h * 6) % 6;
      return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    };
    return '#' + [f(5), f(3), f(1)].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
  }
  return '#e8e8e8';
}

const CIRCLE = (n) => Buffer.from(`<svg width="${n}" height="${n}"><circle cx="${n / 2}" cy="${n / 2}" r="${n / 2}" fill="#fff"/></svg>`);
async function dial(src, out, size, quality) {
  await sharp(src)
    .removeAlpha()
    .resize(size, size, { fit: 'fill' })
    .composite([{ input: CIRCLE(size), blend: 'dest-in' }])
    .webp({ quality })
    .toFile(out);
}

/** Store square shots are either single round renders on white, square renders on black, or collages. */
async function classify(file) {
  const { w, h, at } = await pixels(file);
  if (Math.abs(w - h) >= 6) return h > w ? 'promo' : 'wide';
  const corners = [at(3, 3), at(w - 4, 3), at(3, h - 4), at(w - 4, h - 4)];
  const edges = [at(w >> 1, 3), at(3, h >> 1), at(w >> 1, h - 4)];
  if (Math.min(...corners.flat()) >= 248 && Math.max(...edges.map((p) => p[0] + p[1] + p[2])) < 600) return 'render';
  if (Math.max(...corners.flat()) < 40) return 'dark';
  return 'wide';
}

// ---------- build one face ----------
async function buildMedia(a, slug) {
  const dir = join(PUB, 'faces', slug);
  const cache = join(CACHE, slug);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  mkdirSync(cache, { recursive: true });

  const shots = [];
  for (const [i, url] of a.screenshots.entries()) {
    const f = await fetchTo(`${url}=w900`, join(cache, `s${String(i).padStart(2, '0')}`));
    shots.push({ f, kind: await classify(f) });
  }
  const icon = await fetchTo(`${a.icon}=w512`, join(cache, 'icon'));
  let renders = shots.filter((s) => s.kind === 'render').map((s) => s.f);
  if (renders.length < 3) renders = shots.filter((s) => s.kind === 'dark').map((s) => s.f);
  if (!renders.length || O.iconOnly.includes(slug)) renders = [icon];
  renders = renders.slice(0, 12);

  const variants = [];
  for (const [i, f] of renders.entries()) {
    await dial(f, join(dir, `v${i}.webp`), 560, 86);
    await dial(f, join(dir, `t${i}.webp`), 256, 82);
    variants.push({ src: `faces/${slug}/v${i}.webp`, thumb: `faces/${slug}/t${i}.webp`, color: await accent(f) });
  }

  const promosAll = shots.filter((s) => s.kind === 'promo').map((s) => s.f);
  const pick = promosAll.length ? Array.from({ length: Math.min(4, promosAll.length) }, (_, i) => promosAll[Math.floor((i * promosAll.length) / 4)]) : [];
  const promos = [];
  for (const [i, f] of pick.entries()) {
    const o = await sharp(f).removeAlpha().resize(560, 1000, { fit: 'inside' }).webp({ quality: 80 }).toFile(join(dir, `p${i}.webp`));
    promos.push({ src: `faces/${slug}/p${i}.webp`, w: o.width, h: o.height });
  }
  const wides = [];
  for (const [i, f] of shots.filter((s) => s.kind === 'wide').map((s) => s.f).slice(0, 3).entries()) {
    const o = await sharp(f).removeAlpha().resize(1200, 800, { fit: 'inside' }).webp({ quality: 80 }).toFile(join(dir, `w${i}.webp`));
    wides.push({ src: `faces/${slug}/w${i}.webp`, w: o.width, h: o.height });
  }

  await sharp(icon).resize(320, 320).webp({ quality: 88 }).toFile(join(dir, 'icon.webp'));

  let header = null;
  if (a.headerImage) {
    const h = await fetchTo(`${a.headerImage}=w1600`, join(cache, 'header'));
    await sharp(h).removeAlpha().resize(1400, 800, { fit: 'inside' }).webp({ quality: 80 }).toFile(join(dir, 'header.webp'));
    header = `faces/${slug}/header.webp`;
    // Link previews: the store's feature graphic, cropped to 1200x630.
    await sharp(h).removeAlpha().resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 82 }).toFile(join(dir, 'og.jpg'));
  } else {
    await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#000' } })
      .composite([{ input: await sharp(renders[0]).removeAlpha().resize(560, 560).composite([{ input: CIRCLE(560), blend: 'dest-in' }]).png().toBuffer() }])
      .jpeg({ quality: 82 })
      .toFile(join(dir, 'og.jpg'));
  }

  let clip = null;
  if (a.previewVideo) {
    const out = join(PUB, 'video', `${slug}.mp4`);
    mkdirSync(dirname(out), { recursive: true });
    try {
      rmSync(out, { force: true });
      await fetchTo(a.previewVideo, out);
      clip = `video/${slug}.mp4`;
    } catch (e) {
      log('clip failed', slug, e.message);
    }
  }
  return { icon: `faces/${slug}/icon.webp`, header, og: `faces/${slug}/og.jpg`, variants, promos, wides, clip };
}

// ---------- main ----------
const details = await discover();
log(`found ${Object.keys(details).length} faces on Google Play`);
const faces = [];
const nextSources = {};
for (const [id, a] of Object.entries(details)) {
  const slug = slugOf(id);
  const src = { icon: a.icon, header: a.headerImage ?? null, screenshots: a.screenshots, video: a.previewVideo ?? null };
  nextSources[slug] = src;
  const prev = oldById[id];
  const same = !ALL && prev && JSON.stringify(sources[slug]) === JSON.stringify(src) && existsSync(join(PUB, 'faces', slug, 'og.jpg'));
  const media = same
    ? { icon: prev.icon, header: prev.header, og: prev.og, variants: prev.variants, promos: prev.promos, wides: prev.wides, clip: prev.clip }
    : await buildMedia(a, slug);
  if (!same) log(prev ? 'updated' : 'added', slug);

  const desc = a.description;
  const tags = Object.keys(TAGS).filter((k) => TAGS[k].test(desc));
  const m = desc.match(/(\d+)\s*(?:vibrant |unique |different |beautiful )?colou?r/i);
  const colorCount = m && +m[1] < 1000 ? +m[1] : media.variants.length;
  faces.push({
    id,
    slug,
    name: O.names[slug] ?? nameOf(a.title),
    title: a.title,
    category: category(a),
    diver: /diver/i.test(a.title),
    price: a.price,
    priceText: a.free ? 'Free' : `$${a.price.toFixed(2)}`,
    free: a.free,
    rating: a.score ? Math.round(a.score * 10) / 10 : null,
    ratings: a.ratings ?? 0,
    installs: a.installs,
    minInstalls: a.minInstalls,
    released: a.released,
    releasedTs: Math.floor(new Date(a.released).getTime() / 1000),
    summary: (a.summary ?? '').replace(EMO, '').trim(),
    features: features(desc, tags),
    tags,
    colorCount,
    ...media,
    video: a.video ? a.video.split('?')[0] : null,
    url: `https://play.google.com/store/apps/details?id=${id}`,
  });
}

// Faces no longer on Play lose their images too.
for (const dir of readdirSync(join(PUB, 'faces'))) if (!faces.find((f) => f.slug === dir)) {
  log('removed', dir);
  rmSync(join(PUB, 'faces', dir), { recursive: true, force: true });
  rmSync(join(PUB, 'video', `${dir}.mp4`), { force: true });
}

faces.sort((a, b) => b.releasedTs - a.releasedTs || a.slug.localeCompare(b.slug));
writeFileSync(DATA, JSON.stringify(faces, null, 1) + '\n');
writeFileSync(SOURCES, JSON.stringify(nextSources, null, 1) + '\n');
log(`wrote ${faces.length} faces`);
