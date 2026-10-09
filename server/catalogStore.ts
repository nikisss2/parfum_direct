import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveProductImage } from './imageResolver.js';
import { resolveNotesForProduct } from './notesData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

export type ProductKind = 'perfume' | 'skincare' | 'haircare' | 'makeup' | 'bodycare' | 'other';
export type Gender = 'unisex' | 'female' | 'male';

export interface VolumeOption {
  type: string;
  label: string;
  volumeMl: number;
  price: number;
  inStock: boolean;
}

export interface CatalogProduct {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  kind: ProductKind;
  kindLabel: string;
  category: string;
  categoryName: string;
  gender: Gender;
  genderLabel: string;
  concentration?: string;
  description: string;
  images: string[];
  notes?: { top: string[]; heart: string[]; base: string[] };
  allNotes: string[];
  longevity?: number;
  sillage?: string;
  isHit?: boolean;
  isNew?: boolean;
  rating: number;
  reviewsCount: number;
  minPrice: number;
  oldPrice?: number;
  discountPercent?: number;
  volumes: VolumeOption[];
  sourceName?: string;
  custom?: boolean;
  _hitPriority?: number;
}

export interface CatalogMeta {
  importedAt: string;
  sourceFile: string;
  count: number;
  kinds: string[];
  priceMax: number;
}

interface CatalogFile {
  meta: CatalogMeta;
  products: CatalogProduct[];
}

let cache: {
  products: CatalogProduct[];
  byId: Map<string, CatalogProduct>;
  bySlug: Map<string, CatalogProduct>;
  meta: CatalogMeta;
} | null = null;

function catalogPath() {
  return path.join(ROOT, 'data', 'catalog.json');
}

function customPath() {
  return path.join(ROOT, 'data', 'catalog.custom.json');
}

function loadFile(): CatalogFile {
  const mainPath = catalogPath();
  if (!fs.existsSync(mainPath)) {
    return {
      meta: {
        importedAt: '',
        sourceFile: '',
        count: 0,
        kinds: [],
        priceMax: 200000,
      },
      products: [],
    };
  }
  const main = JSON.parse(fs.readFileSync(mainPath, 'utf-8')) as CatalogFile;
  if (fs.existsSync(customPath())) {
    const custom = JSON.parse(fs.readFileSync(customPath(), 'utf-8')) as {
      products: CatalogProduct[];
    };
    const byId = new Map(main.products.map(p => [p.id, p]));
    for (const p of custom.products) {
      byId.set(p.id, { ...p, custom: true });
    }
    main.products = Array.from(byId.values());
    main.meta.count = main.products.length;
  }
  return main;
}

function extractVolumeOption(name: string, price: number, existing?: VolumeOption, isPerfume: boolean = true): VolumeOption {
  const m = name.match(/(\d+(?:[.,]\d+)?)\s*(мл|ml|г|g|л|l)(?:[\s,;\.\]\)]|$)/i);
  let volMl = existing?.volumeMl ?? 1;
  let unit = 'мл';
  if (m) {
    volMl = parseFloat(m[1].replace(',', '.'));
    const u = m[2].toLowerCase();
    if (u === 'l' || u === 'л') volMl *= 1000;
    else if (u === 'g' || u === 'г') unit = 'г';
  } else if (existing?.volumeMl && existing.volumeMl > 0) {
    volMl = existing.volumeMl;
  }

  const isTester = /тестер|\(тестер\)/i.test(name) || (existing?.label ? /тестер/i.test(existing.label) : false);
  const isDecant = (/отливант|\(отливант|пробник/i.test(name) || (existing?.label ? /отливант|пробник/i.test(existing.label) : false)) && volMl <= 30;

  let format: 'tester' | 'decant' | 'bottle' = 'bottle';
  let label = `${volMl} ${unit}`;
  if (isTester) {
    format = 'tester';
    label += ' (тестер)';
  } else if (isDecant) {
    format = 'decant';
    label += ' (отливант)';
  } else if (isPerfume && volMl >= 30) {
    format = 'bottle';
    label += ' (флакон)';
  }

  const type = `vol_${volMl}_${unit}_${format}`;
  return {
    type,
    label,
    volumeMl: volMl,
    price: Math.round(price),
    inStock: true,
  };
}

export const KNOWN_HOUSES = [
  "Tom Ford", "By Kilian", "Kilian", "Yves Saint Laurent", "YSL", "Dolce & Gabbana", "Dolce and Gabbana", "D&G",
  "French Avenue", "Attar Collection", "Escentric Molecules", "Juliette Has A Gun", "Haute Fragrance Company", "HFC",
  "Boadicea The Victorious", "Marc-Antoine Barrois", "Jean Paul Gaultier", "Hugo Boss", "Giorgio Armani", "Emporio Armani",
  "Clive Christian", "Carolina Herrera", "Paco Rabanne", "Rabanne", "Tiziana Terenzi", "Victoria's Secret",
  "Ex Nihilo", "Initio Parfums Prives", "Initio", "Jo Malone", "Le Labo", "Memo Paris", "Memo", "Vilhelm Parfumerie",
  "Frederic Malle", "Serge Lutens", "Penhaligon's", "Roja Dove", "Roja", "Maison Martin Margiela", "Maison Margiela",
  "Maison Francis Kurkdjian", "Acqua di Parma", "Atelier Cologne", "Atelier des Ors", "Bond No. 9", "Bottega Veneta",
  "Carner Barcelona", "Costume National", "Essential Parfums", "Etat Libre d'Orange", "Fragrance World", "Parfums de Marly",
  "Lattafa Perfumes", "Lattafa", "Paris Corner", "Maison Alhambra", "Alhambra", "Ard Al Zaafaran", "Swiss Arabian",
  "Al Haramain", "Christian Dior", "C.Dior", "Dior", "Chanel", "Creed", "Amouage", "Byredo", "Xerjoff",
  "Versace", "Armaf", "Gucci", "Givenchy", "Montale", "Mancera", "Nasomatto", "Bvlgari", "Bulgari",
  "Valentino", "Diptyque", "Chopard", "Hermes", "Guerlain", "Prada", "Burberry", "Davines", "Kerastase",
  "Matrix", "Redken", "Wella", "Estel", "Schwarzkopf", "Goldwell", "Lebel", "Olaplex",
  "Ahjaar", "Aigner", "Afnan", "Ajmal", "Rasasi", "Kajal", "Zimaya", "Nishane", "Vertus", "Orto Parisi",
  "Moschino", "Mugler", "Cartier", "Chloe", "Lanvin", "Lancome", "Lalique", "Kenzo", "Azzaro", "Caron",
  "Houbigant", "Frapin", "Jovoy Paris", "Jovoy", "Mizensir", "Stephane Humbert Lucas", "Thomas Kosmala",
  "The Merchant of Venice", "The Different Company", "Tauer Perfumes", "Van Cleef & Arpels", "Van Cleef",
  "Zarkoperfume", "Laboratorio Olfattivo", "L'Artisan Parfumeur", "Liquides Imaginaires", "Lorenzo Villoresi",
  "Maison Crivelli", "Maison Tahite", "Miller Harris", "Ormonde Jayne", "Profumum Roma", "BDK Parfums",
  "Alexandre.J", "Amouroud", "Anfas", "Annick Goutal", "Goutal", "Birkholz", "Bois 1920", "Calvin Klein",
  "Davidoff", "Electimuss", "Floraiku", "Gritti", "Histoires de Parfums", "Jacques Zolty", "Jardins d'Ecrivains",
  "Jimmy Choo", "Keiko Mecheri", "Kemi", "Korloff", "Les Liquides Imaginaires", "Linari", "Loewe", "M.Micallef",
  "Micallef", "Masque Milano", "Molinard", "Montblanc", "Narciso Rodriguez", "Nicolai", "Nobile 1942",
  "Ojar", "Perris Monte Carlo", "Pierre Guillaume", "Plume Impression", "Ramon Monegal", "Rance 1795",
  "Reminiscence", "Simone Andreoli", "Sospiro", "Teo Cabanel", "The House of Oud", "THOO", "Une Nuit Nomade",
  "Vilhelm", "Widian", "X-Ray", "Aesop", "Yves de Sistelle", "Yves Rocher", "The 7 Virtues", "The Beautiful Mind",
  "The Harmonist", "Parfums de Marly", "Maison 21G", "Maison Asrar", "Maison Alhambra"
];

const SORTED_HOUSES = [...KNOWN_HOUSES].sort((a, b) => b.length - a.length);

export function normalizeBrand(raw: string): string {
  if (!raw) return 'Другое';
  let b = raw.trim();
  b = b.replace(/^!+\s*/, '').replace(/^\d+\s+/, '').trim();
  const lower = b.toLowerCase();
  if (lower === 'бренд' || lower === 'другое') return 'Другое';
  for (const house of SORTED_HOUSES) {
    const hLow = house.toLowerCase();
    if (lower === hLow || lower.startsWith(hLow + ' ') || lower.startsWith(hLow + "'") || lower.startsWith(hLow + '-')) {
      if (/^kilian|^by kilian/i.test(house)) return 'Kilian';
      if (/^c\.dior|^christian dior|^dior/i.test(house)) return 'Dior';
      if (/^yves saint|^ysl/i.test(house)) return 'Yves Saint Laurent';
      if (/^yves de/i.test(house)) return 'Yves de Sistelle';
      if (/^dolce|^d&g/i.test(house)) return 'Dolce & Gabbana';
      if (/^lattafa/i.test(house)) return 'Lattafa Perfumes';
      if (/^bulgari|^bvlgari/i.test(house)) return 'Bvlgari';
      if (/^paco rabanne|^rabanne/i.test(house)) return 'Rabanne';
      if (/^roja/i.test(house)) return 'Roja Dove';
      if (/^margiela/i.test(house)) return 'Maison Martin Margiela';
      if (/^kurkdjian/i.test(house)) return 'Maison Francis Kurkdjian';
      if (/^hfc/i.test(house)) return 'Haute Fragrance Company';
      if (/^barrois/i.test(house)) return 'Marc-Antoine Barrois';
      if (/^armani/i.test(house)) return 'Giorgio Armani';
      if (/^boss/i.test(house)) return 'Hugo Boss';
      if (/^memo/i.test(house)) return 'Memo Paris';
      if (/^vilhelm/i.test(house)) return 'Vilhelm Parfumerie';
      if (/^initio/i.test(house)) return 'Initio Parfums Prives';
      if (/^jovoy/i.test(house)) return 'Jovoy Paris';
      if (/^van cleef/i.test(house)) return 'Van Cleef & Arpels';
      if (/^aesop/i.test(house)) return 'Aesop';
      return house;
    }
  }
  const words = b.split(/\s+/);
  if (lower.startsWith('the ') && words.length >= 2) return words.slice(0, 3).join(' ');
  if (lower.startsWith('maison ') && words.length >= 2) return words.slice(0, 2).join(' ');
  if (lower.startsWith('parfums ') && words.length >= 2) return words.slice(0, 3).join(' ');
  return words[0] || b;
}

function cleanBaseModelName(name: string): string {
  return name
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\((?:тестер|отливант[^\)]*|пробник|драмминг[^\)]*|декодированный|запаска|без спрея|без крышки|с носиком[^\)]*)\)/gi, '')
    .replace(/(?:^|\s)\d+(?:[.,]\d+)?\s*(?:мл|ml|г|g|л|l)(?:[\s,;\.\]\)]|$)/gi, ' ')
    .replace(/(?:^|\s)\d+\s*по\s*\d+\s*(?:мл|ml)(?:[\s,;\.\]\)]|$)/gi, ' ')
    .replace(/\b(отливант|тестер|пробник|драмминг|dramming|запаска)\b/gi, '')
    .replace(/\b\d+\s*\+\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const ARABIAN_BRAND_SUBSTRINGS = [
  'lattafa', 'afnan', 'armaf', 'attar collection', 'attar al', 'attar', 'al haramain', 'haramain',
  'rasasi', 'ajmal', 'kajal', 'swiss arabian', 'norana', 'arabesque', 'khalis', 'fragrance world',
  'paris corner', 'alhambra', 'maison alhambra', 'zaafaran', 'ard al zaafaran', 'zimaya', 'riiffs',
  'rovena', 'orientica', 'al rehab', 'al-rehab', 'ahmed al maghribi', 'naseem', 'asdaaf', 'emper',
  'sterling', 'vurv', 'taif al emarat', 'louis cardin', 'junaid', 'my perfumes'
];

const LUXURY_BRAND_SUBSTRINGS = [
  'chanel', 'dior', 'tom ford', 'ysl', 'saint laurent', 'yves saint', 'guerlain', 'hermes', 'kilian',
  'versace', 'hugo boss', 'boss', 'armani', 'giorgio armani', 'gucci', 'givenchy', 'dolce', 'd&g',
  'burberry', 'paco rabanne', 'prada', 'valentino', 'calvin klein', 'lacoste', 'carolina herrera',
  'narciso rodriguez', 'bvlgari', 'bulgari', 'kenzo', 'cartier', 'lanvin', 'moschino', 'chloe',
  'lancome', 'mugler', 'montblanc', 'trussardi', 'rochas', 'ferragamo', 'jimmy choo', 'marc jacobs',
  'jean paul gaultier', 'viktor & rolf', 'nina ricci', 'azzaro'
];

export function classifyProduct(p: CatalogProduct): {
  kind: ProductKind;
  kindLabel: string;
  category: string;
  categoryName: string;
} {
  if (p.custom && p.kind) {
    return {
      kind: p.kind,
      kindLabel: p.kindLabel || p.kind,
      category: p.category || 'niche',
      categoryName: p.categoryName || 'Парфюмерия',
    };
  }

  const text = `${p.brand} ${p.name}`.toLowerCase();

  // 1. Check non-perfume kinds first
  if (
    /(?:шампун|кондиционер|краска\s+для\s+волос|бальзам\s+для\s+волос|маска\s+для\s+волос|окислител|оксид|стайлинг|лак\s+для\s+волос|сыворотка\s+для\s+волос|масло\s+для\s+волос|kerastase|wella|schwarzkopf|loreal\s+prof|matrix|olaplex|redken|moroccanoil|lebel|davines|londa|dewal|bouticle|ollin|estel|concept|kapous|keune|selective|chi|tigi|goldwell|constant delight|alfaparf)/i.test(
      text
    )
  ) {
    return {
      kind: 'haircare',
      kindLabel: 'Уход за волосами',
      category: 'haircare',
      categoryName: 'Уход за волосами',
    };
  }
  if (
    /(?:помада|lipstick|тушь|mascara|тональн|concealer|консилер|румян|тени|блеск\s+для\s+губ|пудра|подводк|карандаш\s+для\s+губ|хайлайтер|бронзер)/i.test(
      text
    )
  ) {
    return {
      kind: 'makeup',
      kindLabel: 'Макияж',
      category: 'makeup',
      categoryName: 'Макияж',
    };
  }
  if (
    /(?:крем\s+для\s+лица|сыворотк\w*\s+для\s+лица|тоник|лосьон\s+для\s+лица|маска\s+для\s+лица|скраб\s+для\s+лица|пилинг|патчи|солнцезащит|уход\s+за\s+кожей|крем\s+для\s+век|вокруг\s+глаз)/i.test(
      text
    )
  ) {
    return {
      kind: 'skincare',
      kindLabel: 'Уход за кожей',
      category: 'skincare',
      categoryName: 'Уход за кожей',
    };
  }
  if (
    /(?:гель\s+для\s+душа|мыло|лосьон\s+для\s+тела|крем\s+для\s+тела|скраб\s+для\s+тела|масло\s+для\s+тела|body\s+wash|shower\s+gel)/i.test(
      text
    )
  ) {
    return {
      kind: 'bodycare',
      kindLabel: 'Уход за телом',
      category: 'bodycare',
      categoryName: 'Уход за телом',
    };
  }

  // 2. Everything else in this fragrance catalog is perfume
  const kind: ProductKind = 'perfume';
  const kindLabel = 'Парфюмерия';

  if (ARABIAN_BRAND_SUBSTRINGS.some(b => text.includes(b))) {
    return { kind, kindLabel, category: 'arabian', categoryName: 'Арабская парфюмерия' };
  }
  if (LUXURY_BRAND_SUBSTRINGS.some(b => text.includes(b))) {
    return { kind, kindLabel, category: 'luxury', categoryName: 'Люксовая парфюмерия' };
  }
  return { kind, kindLabel, category: 'niche', categoryName: 'Нишевая парфюмерия' };
}

interface IconicHitSpec {
  key: string;
  rank: number;
  match: (b: string, n: string) => boolean;
}

const ICONIC_SPECS: IconicHitSpec[] = [
  { key: 'creed-aventus', rank: 100, match: (b, n) => b.includes('creed') && n.includes('aventus') && !n.includes('absolu') && !n.includes('cologne') && !n.includes('her') },
  { key: 'tom-ford-lost-cherry', rank: 99, match: (b, n) => b.includes('tom ford') && n.includes('lost cherry') && !n.includes('набор') && !n.includes('спрей') },
  { key: 'french-avenue-royal-blend', rank: 98, match: (b, n) => b.includes('french avenue') && n.includes('royal blend') },
  { key: 'kilian-angels-share', rank: 97, match: (b, n) => b.includes('kilian') && (n.includes('angel') || n.includes('angels')) && !n.includes('набор') },
  { key: 'barrois-ganymede', rank: 96, match: (b, n) => (b.includes('barrois') || b.includes('marc antoine')) && n.includes('ganymede') },
  { key: 'amouage-guidance', rank: 95, match: (b, n) => b.includes('amouage') && n.includes('guidance') },
  { key: 'french-avenue-after-effect', rank: 94, match: (b, n) => b.includes('french avenue') && n.includes('after effect') },
  { key: 'creed-absolu-aventus', rank: 93, match: (b, n) => b.includes('creed') && n.includes('absolu') },
  { key: 'tom-ford-tobacco-vanille', rank: 92, match: (b, n) => b.includes('tom ford') && n.includes('tobacco vanille') && !n.includes('набор') },
  { key: 'lattafa-khamrah', rank: 91, match: (b, n) => b.includes('lattafa') && n.includes('khamrah') },
  { key: 'armaf-cdn-intense', rank: 90, match: (b, n) => b.includes('armaf') && n.includes('club de nuit') && !n.includes('woman') && !n.includes('женск') },
  { key: 'amouage-reflection', rank: 89, match: (b, n) => b.includes('amouage') && n.includes('reflection') },
  { key: 'afnan-9pm', rank: 88, match: (b, n) => b.includes('afnan') && n.includes('9 pm') },
  { key: 'attar-musk-kashmir', rank: 87, match: (b, n) => b.includes('attar') && n.includes('musk kashmir') },
  { key: 'tom-ford-bitter-peach', rank: 86, match: (b, n) => b.includes('tom ford') && n.includes('bitter peach') && !n.includes('набор') },
  { key: 'lattafa-asad', rank: 85, match: (b, n) => b.includes('lattafa') && n.includes('asad') },
  { key: 'lattafa-yara', rank: 84, match: (b, n) => b.includes('lattafa') && n.includes('yara') },
  { key: 'creed-silver-mountain', rank: 83, match: (b, n) => b.includes('creed') && n.includes('silver mountain') },
  { key: 'kilian-good-girl', rank: 82, match: (b, n) => b.includes('kilian') && n.includes('good girl') },
  { key: 'byredo-bal-dafrique', rank: 81, match: (b, n) => b.includes('byredo') && n.includes('bal d afrique') },
  { key: 'xerjoff-erba-pura', rank: 80, match: (b, n) => b.includes('xerjoff') && n.includes('erba pura') },
  { key: 'dior-sauvage', rank: 79, match: (b, n) => (b.includes('dior') || b.includes('c.dior')) && n.includes('sauvage') },
  { key: 'chanel-bleu', rank: 78, match: (b, n) => b.includes('chanel') && n.includes('bleu') },
  { key: 'creed-aventus-cologne', rank: 77, match: (b, n) => b.includes('creed') && n.includes('cologne') },
  { key: 'creed-aventus-for-her', rank: 76, match: (b, n) => b.includes('creed') && n.includes('for her') },
  { key: 'armaf-cdn-woman', rank: 75, match: (b, n) => b.includes('armaf') && n.includes('club de nuit') && (n.includes('woman') || n.includes('женск')) },
];

function groupProductsByModel(rawList: CatalogProduct[]): {
  grouped: CatalogProduct[];
  byId: Map<string, CatalogProduct>;
  bySlug: Map<string, CatalogProduct>;
} {
  const groups = new Map<string, CatalogProduct[]>();
  for (const p of rawList) {
    if (p.custom) {
      // Keep custom user products as-is
      groups.set(`custom|||${p.id}`, [p]);
      continue;
    }
    const canonicalBrand = normalizeBrand(p.brand);
    const cls = classifyProduct(p);
    const b = canonicalBrand.toLowerCase().trim();
    const base = cleanBaseModelName(p.name).toLowerCase();
    const key = `${cls.kind}|||${b}|||${base}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }

  const grouped: CatalogProduct[] = [];
  const byId = new Map<string, CatalogProduct>();
  const bySlug = new Map<string, CatalogProduct>();

  for (const list of groups.values()) {
    const primary = list[0];
    const canonicalBrand = normalizeBrand(primary.brand);
    const cleanName = cleanBaseModelName(primary.name) || primary.name;
    const cls = classifyProduct(primary);

    const volumeMap = new Map<string, VolumeOption>();
    const isPerfumeKind = cls.kind === 'perfume';

    for (const item of list) {
      const sourceVolumes: VolumeOption[] = (item.volumes && item.volumes.length > 0)
        ? item.volumes
        : [extractVolumeOption(item.name, item.minPrice, undefined, isPerfumeKind)];

      for (const rawVol of sourceVolumes) {
        const vol = extractVolumeOption(
          `${item.name} ${rawVol.label || ''}`,
          rawVol.price || item.minPrice,
          rawVol,
          isPerfumeKind
        );

        const key = vol.type;
        // Keep the one that costs more if duplicate volume & format
        if (!volumeMap.has(key)) {
          volumeMap.set(key, vol);
        } else {
          const existing = volumeMap.get(key)!;
          if (vol.price > existing.price) {
            volumeMap.set(key, vol);
          }
        }
      }
    }

    // Safety pass: ensure no duplicate visible labels exist, keeping the higher price
    const labelMap = new Map<string, VolumeOption>();
    for (const vol of volumeMap.values()) {
      if (!labelMap.has(vol.label)) {
        labelMap.set(vol.label, vol);
      } else {
        const existing = labelMap.get(vol.label)!;
        if (vol.price > existing.price) {
          labelMap.set(vol.label, vol);
        }
      }
    }

    const volumes = Array.from(labelMap.values()).sort(
      (a, b) => a.volumeMl - b.volumeMl || a.price - b.price
    );
    const minPrice = volumes[0]?.price ?? primary.minPrice;

    const resolvedNotes = resolveNotesForProduct(canonicalBrand, cleanName);
    const prod: CatalogProduct = {
      ...primary,
      brand: canonicalBrand,
      name: cleanName,
      kind: cls.kind,
      kindLabel: cls.kindLabel,
      category: cls.category,
      categoryName: cls.categoryName,
      minPrice,
      volumes: volumes.length ? volumes : primary.volumes,
      notes: resolvedNotes ? { top: resolvedNotes.top, heart: resolvedNotes.heart, base: resolvedNotes.base } : primary.notes,
      allNotes: resolvedNotes ? resolvedNotes.all : (primary.allNotes || []),
    };

    grouped.push(prod);
    byId.set(prod.id, prod);
    bySlug.set(prod.slug, prod);

    // Map all variant IDs and slugs to this master product
    for (const item of list) {
      byId.set(item.id, prod);
      bySlug.set(item.slug, prod);
    }
  }

  // Apply iconic hit priorities & sanitize non-perfume hits
  for (const prod of grouped) {
    if (prod.custom) {
      prod._hitPriority = prod.isHit ? 200 : 0;
      continue;
    }
    // Only perfume products can be hits
    if (prod.kind !== 'perfume') {
      prod.isHit = false;
      prod._hitPriority = 0;
      continue;
    }
    // Retain original isHit with low base priority if already perfume
    if (prod.isHit) {
      prod._hitPriority = 10;
    } else {
      prod._hitPriority = 0;
    }
  }

  // Assign high priority to iconic fragrance bestsellers
  for (const spec of ICONIC_SPECS) {
    const matches = grouped.filter(p => {
      if (p.kind !== 'perfume') return false;
      if (p.name.includes('аналог') || p.name.includes('мотив')) return false;
      const b = (p.brand || '').toLowerCase();
      const n = (p.name || '').toLowerCase();
      return spec.match(b, n);
    });

    if (matches.length > 0) {
      // Pick best representative: prefer highest number of volume variants, then price
      matches.sort(
        (a, b) => (b.volumes?.length || 0) - (a.volumes?.length || 0) || b.minPrice - a.minPrice
      );
      const topRep = matches[0];
      topRep.isHit = true;
      topRep._hitPriority = 1000 + spec.rank;

      // Other variations get secondary hit priority
      for (let i = 1; i < matches.length; i++) {
        matches[i].isHit = true;
        matches[i]._hitPriority = 500 + spec.rank;
      }
    }
  }

  // Apply selective realistic discounts (5-10% crossed out) on luxury perfumes (Kilian, Creed, Tom Ford, etc.)
  for (const prod of grouped) {
    if (prod.kind === 'perfume' && prod.minPrice >= 1200) {
      const bLower = (prod.brand || '').toLowerCase();
      const isLuxury = /kilian|creed|tom ford|marly|xerjoff|amouage|kurkdjian|baccarat|chanel|dior|clive|roja|french avenue|lattafa|byredo|memo|le labo|initio|vilhelm|frederic malle|roja|hermes|guerlain|prada/i.test(bLower) || prod.minPrice >= 5000;
      if (isLuxury) {
        // Deterministic selection on ~50% of luxury perfumes
        const charSum = prod.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        if (charSum % 8 < 4) {
          const discountPercent = 7 + (charSum % 5); // 7% to 11%
          const multiplier = 1 + discountPercent / 100;
          const oldPrice = Math.round((prod.minPrice * multiplier) / 10) * 10;
          prod.oldPrice = oldPrice;
          prod.discountPercent = discountPercent;
        }
      }
    }
  }

  return { grouped, byId, bySlug };
}

export function reloadCatalog() {
  cache = null;
  return getCatalog();
}

export function getCatalog() {
  if (cache) return cache;
  const file = loadFile();
  const { grouped, byId, bySlug } = groupProductsByModel(file.products);
  cache = {
    products: grouped,
    byId,
    bySlug,
    meta: {
      ...file.meta,
      count: grouped.length,
    },
  };
  return cache;
}

export function appendCustomProduct(product: CatalogProduct) {
  const cPath = customPath();
  let list: CatalogProduct[] = [];
  if (fs.existsSync(cPath)) {
    list = (JSON.parse(fs.readFileSync(cPath, 'utf-8')) as { products: CatalogProduct[] }).products;
  }
  const idx = list.findIndex(p => p.id === product.id || p.sku === product.sku);
  if (idx >= 0) list[idx] = product;
  else list.push(product);
  fs.mkdirSync(path.dirname(cPath), { recursive: true });
  fs.writeFileSync(cPath, JSON.stringify({ products: list }, null, 2), 'utf-8');
  reloadCatalog();
}

export function deleteCustomProduct(id: string) {
  const cPath = customPath();
  if (!fs.existsSync(cPath)) return false;
  const data = JSON.parse(fs.readFileSync(cPath, 'utf-8')) as { products: CatalogProduct[] };
  const next = data.products.filter(p => p.id !== id);
  if (next.length === data.products.length) return false;
  fs.writeFileSync(cPath, JSON.stringify({ products: next }, null, 2), 'utf-8');
  reloadCatalog();
  return true;
}

export type ProductQuery = {
  page?: number;
  limit?: number;
  q?: string;
  kind?: ProductKind | 'all';
  category?: string;
  gender?: Gender | 'all';
  brands?: string[];
  notes?: string[];
  family?: string;
  maxPrice?: number;
  sort?: 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'new';
  isHit?: boolean;
  isNew?: boolean;
  isSale?: boolean;
};

export function queryProducts(query: ProductQuery) {
  const { products, meta } = getCatalog();
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(96, Math.max(1, query.limit ?? 24));
  const q = query.q?.trim().toLowerCase() ?? '';
  const brands = query.brands?.filter(Boolean) ?? [];

  let list = products;

  // Search query `q` searches across the whole catalog of the store, not constrained to kind/category
  if (!q) {
    if (query.kind && query.kind !== 'all') {
      list = list.filter(p => p.kind === query.kind);
    }
    if (query.category && query.category !== 'all') {
      list = list.filter(p => p.category === query.category || p.kind === query.category);
    }
    if (query.gender && query.gender !== 'all') {
      list = list.filter(p => p.gender === query.gender);
    }
  }
  if (brands.length) {
    const brandLower = brands.map(b => b.toLowerCase().trim()).filter(Boolean);
    list = list.filter(p => {
      const pb = p.brand.toLowerCase();
      return brandLower.some(b => pb === b || pb.startsWith(b + ' ') || pb.includes(b));
    });
  }
  if (query.notes && query.notes.length) {
    const targetNotes = query.notes.map(n => n.toLowerCase().trim()).filter(Boolean);
    list = list.filter(p => {
      const pNotes = (p.allNotes || []).map(n => n.toLowerCase());
      return targetNotes.every(tn => pNotes.some(pn => pn.includes(tn)));
    });
  }
  if (query.maxPrice != null && query.maxPrice > 0) {
    list = list.filter(p => p.minPrice <= query.maxPrice!);
  }
  if (query.isHit) list = list.filter(p => p.isHit);
  if (query.isNew) list = list.filter(p => p.isNew);
  if (query.isSale) list = list.filter(p => !!p.oldPrice);
const TRANSLIT_DICT: Record<string, string[]> = {
  авентус: ['aventus'],
  авентусы: ['aventus'],
  авентуса: ['aventus'],
  крид: ['creed'],
  крида: ['creed'],
  криды: ['creed'],
  диор: ['dior'],
  диоры: ['dior'],
  саваж: ['sauvage'],
  соваж: ['sauvage'],
  шанель: ['chanel'],
  версаче: ['versace'],
  эрос: ['eros'],
  брайт: ['bright'],
  кристал: ['crystal'],
  кристалл: ['crystal'],
  абсолю: ['absolu'],
  том: ['tom'],
  форд: ['ford'],
  лост: ['lost'],
  черри: ['cherry'],
  тобако: ['tobacco'],
  табако: ['tobacco'],
  ваниль: ['vanille', 'vanilla'],
  босс: ['boss'],
  хьюго: ['hugo'],
  килиан: ['kilian'],
  мансера: ['mancera'],
  монталь: ['montale'],
  байредо: ['byredo'],
  биредо: ['byredo'],
  баккара: ['baccarat'],
  бакара: ['baccarat'],
  руж: ['rouge'],
  молекула: ['molecule', 'escentric'],
  ганимед: ['ganymede'],
  аттар: ['attar'],
  кашмир: ['kashmir'],
  хаяти: ['hayati'],
  латтафа: ['lattafa'],
  латафа: ['lattafa'],
  хамра: ['khamrah'],
  камра: ['khamrah'],
  асад: ['asad'],
  яра: ['yara'],
  афнан: ['afnan'],
  армаф: ['armaf'],
  мильстон: ['milestone'],
  майлстоун: ['milestone'],
  силлаж: ['sillage'],
  унтолд: ['untold'],
  харамейн: ['haramain'],
  расаси: ['rasasi'],
  хавас: ['hawas'],
  аджмал: ['ajmal'],
  каджал: ['kajal'],
  клуб: ['club'],
  интенс: ['intense'],
  селектив: ['niche'],
  ниша: ['niche'],
  духи: ['parfum', 'духи', 'eau'],
  парфюм: ['perfume', 'parfum', 'eau'],
  амуаж: ['amouage'],
  амуажи: ['amouage'],
  гайданс: ['guidance'],
  интерлюд: ['interlude'],
  рефлекшн: ['reflection'],
  френч: ['french'],
  авеню: ['avenue'],
  роял: ['royal'],
  бленд: ['blend'],
  афтер: ['after'],
  эффект: ['effect'],
  ангел: ['angel', 'angels'],
  ангелы: ['angel', 'angels'],
  шер: ['share'],
  шаре: ['share'],
  тилия: ['tilia'],
  энцелад: ['encelade'],
  ерба: ['erba'],
  пура: ['pura'],
  наксос: ['naxos'],
  лира: ['lira'],
  демарли: ['marly'],
  марли: ['marly'],
  делина: ['delina'],
  лейтон: ['layton'],
  инитио: ['initio'],
  сайд: ['side'],
  куркджан: ['kurkdjian'],
  куркджян: ['kurkdjian'],
};

function stemRussian(word: string): string {
  return word.replace(/(?:ы|и|а|я|ов|ев|ом|ем|е|у|ю|ах|ях|ам|ям|ами|ями|ой|ей|ий|ый|ая|яя|ое|ее)$/, '');
}

function translitCyrillic(str: string): string {
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i',
    й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's',
    т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
    ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya'
  };
  return str.split('').map(c => map[c] || c).join('');
}

function getQueryTokenVariants(token: string): string[] {
  const t = token.toLowerCase().trim();
  const variants = new Set<string>([t]);
  const stem = stemRussian(t);
  if (stem.length >= 3) variants.add(stem);
  if (TRANSLIT_DICT[t]) TRANSLIT_DICT[t].forEach(v => variants.add(v));
  if (TRANSLIT_DICT[stem]) TRANSLIT_DICT[stem].forEach(v => variants.add(v));
  const tr = translitCyrillic(t);
  if (tr !== t) variants.add(tr);
  const trStem = translitCyrillic(stem);
  if (trStem !== stem) variants.add(trStem);
  return Array.from(variants);
}

  if (q) {
    const rawTokens = q.split(/\s+/).filter(Boolean);
    const tokenVariantsList = rawTokens.map(getQueryTokenVariants);

    list = list.filter(p => {
      const hay = `${p.name} ${p.brand} ${p.sku} ${p.kindLabel} ${p.categoryName} ${(p.allNotes || []).join(' ')}`.toLowerCase();
      return tokenVariantsList.every(variants => variants.some(v => hay.includes(v)));
    });
  }

  const sorted = [...list];
  const sort = query.sort ?? 'popular';
  sorted.sort((a, b) => {
    if (sort === 'popular') {
      const aRank = a._hitPriority ?? 0;
      const bRank = b._hitPriority ?? 0;
      if (aRank !== bRank) return bRank - aRank;
      return b.reviewsCount * b.rating - a.reviewsCount * a.rating;
    }
    if (sort === 'rating') return b.rating - a.rating;
    if (sort === 'new') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    if (sort === 'price_asc') return a.minPrice - b.minPrice;
    if (sort === 'price_desc') return b.minPrice - a.minPrice;
    return 0;
  });

  const total = sorted.length;
  const start = (page - 1) * limit;
  const items = sorted.slice(start, start + limit).map(toListItem);

  return { items, total, page, limit, meta };
}

export function toListItem(p: CatalogProduct) {
  const image = resolveProductImage(p);
  return {
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    brand: p.brand,
    kind: p.kind,
    kindLabel: p.kindLabel,
    category: p.category,
    categoryName: p.categoryName,
    gender: p.gender,
    genderLabel: p.genderLabel,
    minPrice: p.minPrice,
    oldPrice: p.oldPrice,
    discountPercent: p.discountPercent,
    image,
    isHit: p.isHit,
    isNew: p.isNew,
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    volumes: p.volumes,
    notes: p.notes,
    allNotes: p.allNotes,
  };
}

const JUNK_BRAND_FILTER = /(?:^бренд$|^другое$|распродажа|ограниченное|специальные|тестер|пробник|уценка|скидк|акци|ликвидац|дисконт|воск|индивидуальная|парфюмерия|расходные|честный|!!!|\?\?\?)/i;

export function searchBrands(opts: { q?: string; kind?: ProductKind; limit?: number }) {
  const { products } = getCatalog();
  const q = opts.q?.trim().toLowerCase() ?? '';
  const limit = Math.min(2000, opts.limit ?? 1000);
  const counts = new Map<string, number>();

  for (const p of products) {
    if (opts.kind && p.kind !== opts.kind) continue;
    if (!p.brand || JUNK_BRAND_FILTER.test(p.brand.trim()) || p.brand.trim().length < 2) continue;
    if (q && !p.brand.toLowerCase().includes(q)) continue;
    counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ru'))
    .slice(0, limit)
    .map(([brand, count]) => ({ brand, count }));
}

export function getPopularNotes(opts?: { limit?: number }) {
  const { products } = getCatalog();
  const limit = opts?.limit ?? 100;
  const counts = new Map<string, number>();

  for (const p of products) {
    if (p.allNotes && p.allNotes.length) {
      for (const note of p.allNotes) {
        const clean = note.trim();
        if (clean.length >= 2) {
          counts.set(clean, (counts.get(clean) ?? 0) + 1);
        }
      }
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ru'))
    .slice(0, limit)
    .map(([note, count]) => ({ note, count }));
}
