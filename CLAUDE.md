# Active Design catalogue: working notes

Live site: https://hystericmoon.github.io/active/ (GitHub Pages). See README.md for how
to run, build, refresh the data and where files live.

## Workflow
- Branch from `main`, open a draft PR, and merge only when the user says so.
- Merging to `main` deploys via `.github/workflows/deploy.yml` (Pages source = GitHub Actions).
- `.github/workflows/refresh-catalogue.yml` runs weekly and opens a data-refresh PR.
- Before a PR: `cd web && npm run build`, plus the design lint
  `node .agents/skills/design-taste-frontend/scripts/lint.mjs web/src`.
- The taste-skill inspector needs `CHROME_PATH` pointing at a wrapper script that adds
  `--no-sandbox` for `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`. It flags the
  closing 3D section as blank on tablet because it can't see the WebGL watch; that's expected.

## Current look (monochrome, PR #3)
- Black page, near-black tiles (`#0e0e0e`) everywhere, hero wall included; only the watch
  dials carry colour. White accent. Plus Jakarta Sans only.
- Footer has link columns only (no wordmark or logo). The face page stage isn't tinted
  by the selected colour. The Cta 3D watch uses neutral lighting.
- Effects (libraries.dev): `border-beam` hover glow on catalogue cards
  (`size="pulse-inner"`, `colorVariant="colorful"`), also on the main CTA and the search
  field; `thinking-orbs` for loaders, search and the empty state; `liquid-gooey` for the
  style tabs indicator and the colour picker; `metal-fx` on Google Play buttons (silver
  preset, no glow).

## Open question
- "The normal Google Play button" was read as the silver metal-fx ring without glow. The
  user may have meant a plain button with no metal effect; confirm before changing it.

## User
Senior UI designer, mid-level in UX. Use a professional tone, explain the reasoning
behind UX recommendations, and always flag accessibility issues.
