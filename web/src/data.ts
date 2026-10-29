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
