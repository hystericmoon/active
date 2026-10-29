// Runs after `vite build`. Writes one real HTML page per face (dist/face/<slug>/index.html)
// with its own title, description, link-preview tags, structured data and readable content,
// plus sitemap.xml, robots.txt, a 404 fallback and the home page's preview image.
//
// SITE_URL (e.g. https://hystericmoon.github.io/active) makes canonical and preview URLs
// absolute; without it they are left out, which is fine for local builds.
import sharp from 'sharp';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const faces = JSON.parse(readFileSync(join(ROOT, 'src/data/faces.json'), 'utf8'));
// Only the origin is used; paths already carry BASE_PATH.
const SITE = process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : '';
const BASE = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');
const STORE = 'https://play.google.com/store/apps/dev?id=6754954524679457149';
const shell = readFileSync(join(DIST, 'index.html'), 'utf8');

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const abs = (p) => (SITE ? `${SITE}${p}` : null);
const label = (f) => (f.diver ? 'Diver' : f.category[0].toUpperCase() + f.category.slice(1));
const counts = faces.reduce((c, f) => ((c[f.category] = (c[f.category] || 0) + 1), c), {});

function page({ title, description, path, image, jsonld, body }) {
  const url = abs(path);
  const img = image && abs(image);
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    url && `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Active Design" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    url && `<meta property="og:url" content="${esc(url)}" />`,
    img && `<meta property="og:image" content="${esc(img)}" />`,
    img && `<meta property="og:image:width" content="1200" />`,
    img && `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>`,
  ]
    .filter(Boolean)
    .join('\n    ');
  return shell
    .replace(/<title>[\s\S]*?<\/title>\s*/, '')
    .replace(/<meta name="description"[^>]*>\s*/, '')
    .replace('<!--seo-->', head)
    .replace('<!--ssr-->', `<div class="ssr">${body}</div>`);
}

const faceUrl = (f) => `${BASE}face/${f.slug}/`;

// ---------- face pages ----------
for (const f of faces) {
  const description = `${f.name} is a ${label(f).toLowerCase()} watch face for Wear OS by Active Design: ${f.colorCount} colours, ${f.tags
    .slice(0, 4)
    .map((t) => ({ aod: 'always-on display', heart: 'heart rate', steps: 'steps', weather: 'weather', battery: 'battery', moon: 'moon phase', shortcuts: 'shortcuts', complications: 'complications', timezone: 'second time zone' })[t])
    .join(', ')}. ${f.priceText} on Google Play.`;
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: f.title,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Wear OS',
    description,
    image: abs(`${BASE}${f.variants[0].src}`) ?? undefined,
    url: abs(faceUrl(f)) ?? undefined,
    downloadUrl: f.url,
    datePublished: new Date(f.releasedTs * 1000).toISOString().slice(0, 10),
    author: { '@type': 'Organization', name: 'Active Design' },
    offers: { '@type': 'Offer', price: f.price.toFixed(2), priceCurrency: 'USD', url: f.url },
    ...(f.rating && f.ratings > 0
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: f.rating, ratingCount: f.ratings } }
      : {}),
  };
  const body = `
      <p><a href="${BASE}">All Active Design watch faces</a></p>
      <h1>${esc(f.name)}</h1>
      <p>${esc(label(f))} watch face for Wear OS · ${esc(f.colorCount)} colours · ${esc(f.priceText)}</p>
      <img src="${BASE}${f.variants[0].src}" alt="${esc(f.name)} watch face" width="280" height="280" />
      <p>${esc(f.summary || f.title)}</p>
      <ul>${f.features.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      <p><a href="${esc(f.url)}">Get ${esc(f.name)} on Google Play</a></p>`;
  const out = join(DIST, 'face', f.slug, 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(
    out,
    page({
      title: `${f.name}: ${label(f)} Watch Face for Wear OS · Active Design`,
      description,
      path: faceUrl(f),
      image: `${BASE}${f.og}`,
      jsonld,
      body,
    }),
  );
}

// ---------- home ----------
const homeDescription = `Browse ${faces.length} watch faces for Wear OS by Active Design: ${counts.digital ?? 0} digital, ${counts.hybrid ?? 0} hybrid and ${counts.analog ?? 0} analog. Filter by feature, preview every colour, get them on Google Play.`;
const home = page({
  title: 'Active Design: Watch Faces for Wear OS',
  description: homeDescription,
  path: BASE,
  image: `${BASE}og.jpg`,
  jsonld: {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Active Design watch faces for Wear OS',
    numberOfItems: faces.length,
    itemListElement: faces.map((f, i) => ({ '@type': 'ListItem', position: i + 1, name: f.name, url: abs(faceUrl(f)) ?? faceUrl(f) })),
  },
  body: `
      <h1>${faces.length} watch faces for Wear OS</h1>
      <p>${esc(homeDescription)}</p>
      <ul>${faces.map((f) => `<li><a href="${faceUrl(f)}">${esc(f.name)}</a>, ${esc(label(f).toLowerCase())}, ${esc(f.priceText)}</li>`).join('')}</ul>
      <p><a href="${STORE}">All faces on Google Play</a></p>`,
});
writeFileSync(join(DIST, 'index.html'), home);
// GitHub Pages serves 404.html for unknown paths; the app then shows the catalogue.
writeFileSync(join(DIST, '404.html'), home);

// ---------- link preview for the home page: a sheet of dials on the brand fields ----------
const FIELDS = ['#c5c5c5', '#a7ff9c', '#ff6831', '#1b1b1b'];
const tiles = [];
const T = 150;
for (let r = 0; r < 4; r++)
  for (let c = 0; c < 8; c++) {
    const f = faces[(r * 8 + c) % faces.length];
    const left = c * (T + 4) - 20;
    const top = r * (T + 4) + 10;
    tiles.push({ input: { create: { width: T, height: T, channels: 3, background: FIELDS[(r + c) % 4] } }, left, top });
    tiles.push({ input: await sharp(join(DIST, f.variants[0].thumb)).resize(110, 110).toBuffer(), left: left + 20, top: top + 20 });
  }
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#000' } })
  .composite(tiles.filter((t) => t.left >= -T && t.left < 1200 && t.left + T > 0).map((t) => ({ ...t, left: Math.max(0, t.left) })))
  .jpeg({ quality: 82 })
  .toFile(join(DIST, 'og.jpg'));

// ---------- sitemap and robots ----------
if (SITE) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [abs(BASE), ...faces.map((f) => abs(faceUrl(f)))];
  writeFileSync(
    join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${esc(u)}</loc><lastmod>${today}</lastmod></url>`)
      .join('\n')}\n</urlset>\n`,
  );
  writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${abs(`${BASE}sitemap.xml`)}\n`);
}
console.log(`prerendered ${faces.length} face pages${SITE ? ` for ${SITE}${BASE}` : ' (no SITE_URL: relative tags, no sitemap)'}`);
