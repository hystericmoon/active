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

The build is fully static (relative paths), so `web/dist` can be hosted anywhere.
`.github/workflows/deploy.yml` publishes it to GitHub Pages on every push to `main`
once Pages is set to "GitHub Actions" in the repository settings.

## Where things live

| Path | What |
| --- | --- |
| `web/src/data/faces.json` | One record per face: name, category, price, installs, features, colour variants, store images, clip. |
| `web/public/faces/<slug>/` | `v*.webp` colour renders (round, 560px), `p*.webp` wrist renders, `w*.webp` feature graphics, `icon.webp`. |
| `web/public/video/<slug>.mp4` | The short preview clip from each Play listing, where one exists. |
| `web/src/components/` | Sections: `Hero` (specimen wall), `Showcase`, `Catalogue` (filters, grid, index view), `Features`, `Gallery`, `Faq`, `Cta`, `Footer`, and `Detail` (the face page). |
| `web/src/components/Watch3D.tsx` | The three.js watch; its dial is the face's real render. |

## Effects

From [libraries.dev](https://libraries.dev) (MIT): `border-beam` on the main action, the
search field and the hovered catalogue card; `thinking-orbs` for loading, search and the
empty state; `liquid-gooey` for the style tabs' liquid indicator and the colour picker;
`metal-fx` on every Google Play button. 3D via `@react-three/fiber`; motion via `motion`.

## Adding or refreshing faces

The data and images were pulled from the public Play listings. Add a face by appending a
record to `faces.json` and dropping its images in `public/faces/<slug>/` following the
same names; the catalogue, counts, filters and footer lists all read from that file.
Prices shown are from the US store.
