import { useEffect, useState } from 'react';

/** Hash routes: `#/` is the catalogue, `#/face/<slug>` opens one face. */
export function useRoute() {
  const read = () => window.location.hash.replace(/^#/, '') || '/';
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export const faceHref = (slug: string) => `#/face/${slug}`;

export function closeFace() {
  if (window.history.state?.fromCatalogue) window.history.back();
  else window.location.hash = '/';
}

export function openFace(slug: string) {
  window.history.pushState({ fromCatalogue: true }, '', faceHref(slug));
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}
