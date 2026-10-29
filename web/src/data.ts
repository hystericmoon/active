import raw from './data/faces.json';

export type Category = 'digital' | 'hybrid' | 'analog';
export type Tag =
  | 'aod'
  | 'heart'
  | 'steps'
  | 'weather'
  | 'battery'
  | 'moon'
  | 'shortcuts'
  | 'complications'
  | 'timezone';

export interface Variant {
  src: string;
  /** 256px version for small placements. */
  thumb: string;
  color: string;
}
export interface Shot {
  src: string;
  w: number;
  h: number;
}
export interface Face {
  id: string;
  slug: string;
  name: string;
  title: string;
  category: Category;
  diver: boolean;
  price: number;
  priceText: string;
  free: boolean;
  rating: number | null;
  ratings: number;
  installs: string;
  minInstalls: number;
  released: string;
  releasedTs: number;
  summary: string;
  features: string[];
  tags: Tag[];
  colorCount: number;
  icon: string;
  header: string | null;
  og: string;
  variants: Variant[];
  promos: Shot[];
  wides: Shot[];
  video: string | null;
  clip: string | null;
  url: string;
}

export const faces = raw as Face[];

export const STORE_URL = 'https://play.google.com/store/apps/dev?id=6754954524679457149';
export const CONTACT = 'activewatchdesign@gmail.com';

export const CATEGORIES: { id: 'all' | Category; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'digital', label: 'Digital' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'analog', label: 'Analog' },
];

export const TAG_LABEL: Record<Tag, string> = {
  aod: 'Always-on',
  heart: 'Heart rate',
  steps: 'Steps',
  weather: 'Weather',
  battery: 'Battery',
  moon: 'Moon phase',
  shortcuts: 'Shortcuts',
  complications: 'Complications',
  timezone: 'Time zone',
};

export const FILTER_TAGS: Tag[] = ['aod', 'heart', 'steps', 'weather', 'moon', 'complications'];

export const countBy = (pred: (f: Face) => boolean) => faces.filter(pred).length;

export const maxColours = Math.max(...faces.map((f) => f.colorCount));

/** The three tile fields rotate through the catalogue, like specimens on coloured card. */
export const FIELDS = ['var(--field-1)', 'var(--field-2)', 'var(--field-3)', 'var(--field-4)'];
export const fieldFor = (i: number) => FIELDS[i % FIELDS.length];

export const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

export const categoryLabel = (f: Face) =>
  f.diver ? 'Diver' : f.category[0].toUpperCase() + f.category.slice(1);

export const HOME_TITLE = 'Active Design: Watch Faces for Wear OS';
export const faceTitle = (f: Face) => `${f.name}: ${categoryLabel(f)} Watch Face for Wear OS · Active Design`;

/** Black or white, whichever reads better on a face's swatch colour (WCAG relative luminance). */
export function inkOn(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // Contrast against black is (L + 0.05) / 0.05, against white 1.05 / (L + 0.05); pick the larger.
  return (L + 0.05) / 0.05 >= 1.05 / (L + 0.05) ? '#000000' : '#ffffff';
}
