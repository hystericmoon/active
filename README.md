# Active Design: watch face catalogue

A catalogue site for the Wear OS watch faces Active Design publishes on
[Google Play](https://play.google.com/store/apps/dev?id=6754954524679457149).
Visitors browse all 63 faces, filter by style (digital, hybrid, analog) and by what is
on the dial, open a face to turn it on a 3D watch and try each of its colours, then
go to its Play listing.

## Run it

```bash
cd web
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in web/dist
```

The build is fully static. `npm run build` also writes a real HTML page per face
(`dist/face/<slug>/index.html`) with its own title, description, link-preview image and
structured data, plus `sitemap.xml`, `robots.txt` and a `404.html` fallback.

Two build variables control the URLs; the deploy workflow sets both from GitHub Pages:

| Variable | Example | Used for |
| --- | --- | --- |
| `BASE_PATH` | `/active/` | Where the site lives; asset and page paths. Default `/`. |
| `SITE_URL` | `https://hystericmoon.github.io/active` | Canonical and link-preview URLs, sitemap. Left out locally. |

`.github/workflows/deploy.yml` publishes to GitHub Pages on every push to `main`
once Pages is set to "GitHub Actions" in the repository settings.

## Where things live

| Path | What |
| --- | --- |
| `web/src/data/faces.json` | One record per face: name, category, price, installs, features, colour variants, store images, clip. |
| `web/public/faces/<slug>/` | `v*.webp` colour renders (round, 560px) and `t*.webp` thumbnails (256px), `p*.webp` wrist renders, `w*.webp` feature graphics, `icon.webp`, `og.jpg` link preview. |
| `web/public/video/<slug>.mp4` | The short preview clip from each Play listing, where one exists. |
| `web/src/components/` | Sections: `Hero` (specimen wall), `Showcase`, `Catalogue` (filters, grid, index view), `Features`, `Gallery`, `Faq`, `Cta`, `Footer`, and `Detail` (the face page). |
| `web/src/components/Watch3D.tsx` | The three.js watch; its dial is the face's real render. |

## Effects

From [libraries.dev](https://libraries.dev) (MIT): `border-beam` on the main action, the
search field and the hovered catalogue card; `thinking-orbs` for loading, search and the
empty state; `liquid-gooey` for the style tabs' liquid indicator and the colour picker;
`metal-fx` on every Google Play button. 3D via `@react-three/fiber`; motion via `motion`.

## Refreshing the catalogue

```bash
cd web
npm run refresh          # pull every Active Design listing from Google Play
node scripts/refresh.mjs --all   # also rebuild every face's images
```

The script finds faces through the developer page, Play search and each listing's
"similar apps", then writes `src/data/faces.json` and the images in `public/faces/`.
A face's images are rebuilt only when its store images change. Slugs, display names and
faces whose store squares are collages are set in `scripts/overrides.json`.

`.github/workflows/refresh-catalogue.yml` runs it every Monday and opens a PR when
anything changed. For that, allow Actions to create pull requests: Settings → Actions →
General → Workflow permissions → "Allow GitHub Actions to create and approve pull requests".

Prices come from the US store.
