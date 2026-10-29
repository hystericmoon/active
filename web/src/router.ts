import { useEffect, useState } from 'react';

/**
 * Real paths, so every face has a page search engines and link previews can read:
 * `<base>` is the catalogue, `<base>face/<slug>/` opens one face. Each face path
 * also exists as a prerendered HTML file (scripts/prerender.mjs).
 */
const BASE = import.meta.env.BASE_URL;

export const faceHref = (slug: string) => `${BASE}face/${slug}/`;

function read() {
  const path = window.location.pathname;
  const rest = path.startsWith(BASE) ? path.slice(BASE.length) : path.replace(/^\//, '');
  const m = rest.match(/^face\/([^/]+)\/?$/);
  return m ? m[1] : null;
}

function go(url: string, state: object | null = null) {
  window.history.pushState(state, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/** The slug of the open face, or null on the catalogue. */
export function useFaceRoute() {
  const [slug, setSlug] = useState(read);
  useEffect(() => {
    // Links shared before the switch to real paths used `#/face/<slug>`.
    const legacy = () => {
      const m = window.location.hash.match(/^#\/face\/([^/]+)/);
      if (m) window.history.replaceState(null, '', faceHref(m[1]));
      setSlug(read());
    };
    legacy();
    const on = () => setSlug(read());
    // Face links are ordinary anchors; inside the app they open without a page load.
    const click = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.('a');
      if (!a || a.target === '_blank' || a.origin !== window.location.origin) return;
      if (!a.pathname.startsWith(`${BASE}face/`)) return;
      e.preventDefault();
      openPath(a.pathname);
    };
    window.addEventListener('popstate', on);
    window.addEventListener('hashchange', legacy);
    document.addEventListener('click', click);
    return () => {
      window.removeEventListener('popstate', on);
      window.removeEventListener('hashchange', legacy);
      document.removeEventListener('click', click);
    };
  }, []);
  return slug;
}

/**
 * Each face opened inside the app records how many faces deep it is and whether
 * the visit started on the catalogue, so "All faces" can return there in one step.
 */
function openPath(path: string) {
  const prev = window.history.state as { depth?: number; fromCatalogue?: boolean } | null;
  go(path, {
    depth: (prev?.depth ?? 0) + 1,
    fromCatalogue: prev?.depth ? prev.fromCatalogue : read() === null,
  });
}

export function closeFace() {
  const s = window.history.state as { depth?: number; fromCatalogue?: boolean } | null;
  if (s?.depth && s.fromCatalogue) window.history.go(-s.depth);
  else go(BASE);
}

export function openFace(slug: string) {
  openPath(faceHref(slug));
}
