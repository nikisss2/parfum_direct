export interface BrandInfo {
  name: string;
  slug: string;
  searchQuery: string;
  country?: string;
  category?: 'niche' | 'luxury' | 'arabian' | 'beauty';
  isPopular?: boolean;
}

export const JUNK_BRAND_REGEX = /(?:^бренд$|^другое$|распродажа|ограниченное|специальные|тестер|пробник|уценка|скидк|акци|ликвидац|дисконт|воск|индивидуальная|парфюмерия|расходные|честный|!!!|\?\?\?)/i;

export function isPureBrand(brand: string): boolean {
  if (!brand) return false;
  const trimmed = brand.trim();
  if (trimmed.length < 2) return false;
  return !JUNK_BRAND_REGEX.test(trimmed);
}

// Curated luxury & niche brand directory requested by user & ЗЯ catalog
export const POPULAR_BRANDS: BrandInfo[] = [
  { name: 'Creed', slug: 'creed', searchQuery: 'Creed', country: 'Франция', category: 'niche', isPopular: true },
  { name: 'Tom Ford', slug: 'tom-ford', searchQuery: 'Tom Ford', country: 'США', category: 'luxury', isPopular: true },
  { name: 'Kilian', slug: 'kilian', searchQuery: 'Kilian', country: 'Франция', category: 'niche', isPopular: true },
  { name: 'Amouage', slug: 'amouage', searchQuery: 'Amouage', country: 'Оман', category: 'niche', isPopular: true },
  { name: 'Byredo', slug: 'byredo', searchQuery: 'Byredo', country: 'Швеция', category: 'niche', isPopular: true },
  { name: 'Marc-Antoine Barrois', slug: 'marc-antoine-barrois', searchQuery: 'Barrois', country: 'Франция', category: 'niche', isPopular: true },
  { name: 'Xerjoff', slug: 'xerjoff', searchQuery: 'Xerjoff', country: 'Италия', category: 'niche', isPopular: true },
  { name: 'Parfums de Marly', slug: 'parfums-de-marly', searchQuery: 'Marly', country: 'Франция', category: 'niche', isPopular: true },
  { name: 'Maison Francis Kurkdjian', slug: 'maison-francis-kurkdjian', searchQuery: 'Kurkdjian', country: 'Франция', category: 'niche', isPopular: true },
  { name: 'Chanel', slug: 'chanel', searchQuery: 'Chanel', country: 'Франция', category: 'luxury', isPopular: true },
  { name: 'Christian Dior', slug: 'dior', searchQuery: 'Dior', country: 'Франция', category: 'luxury', isPopular: true },
  { name: 'Dolce & Gabbana', slug: 'dolce-gabbana', searchQuery: 'Dolce', country: 'Италия', category: 'luxury', isPopular: true },
  { name: 'French Avenue', slug: 'french-avenue', searchQuery: 'French Avenue', country: 'ОАЭ', category: 'arabian', isPopular: true },
  { name: 'Lattafa Perfumes', slug: 'lattafa-perfumes', searchQuery: 'Lattafa', country: 'ОАЭ', category: 'arabian', isPopular: true },
  { name: 'Armaf', slug: 'armaf', searchQuery: 'Armaf', country: 'ОАЭ', category: 'arabian', isPopular: true },
  { name: 'Montale', slug: 'montale', searchQuery: 'Montale', country: 'Франция', category: 'niche', isPopular: true },
  { name: 'Mancera', slug: 'mancera', searchQuery: 'Mancera', country: 'Франция', category: 'niche', isPopular: true },
  { name: 'Yves Saint Laurent', slug: 'yves-saint-laurent', searchQuery: 'YSL', country: 'Франция', category: 'luxury', isPopular: true },
  { name: 'Gucci', slug: 'gucci', searchQuery: 'Gucci', country: 'Италия', category: 'luxury', isPopular: true },
  { name: 'Givenchy', slug: 'givenchy', searchQuery: 'Givenchy', country: 'Франция', category: 'luxury', isPopular: true },
  { name: 'Jean Paul Gaultier', slug: 'jean-paul-gaultier', searchQuery: 'Jean Paul Gaultier', country: 'Франция', category: 'luxury', isPopular: true },
  { name: 'Louis Vuitton', slug: 'louis-vuitton', searchQuery: 'Louis Vuitton', country: 'Франция', category: 'luxury', isPopular: true },
  { name: 'Nasomatto', slug: 'nasomatto', searchQuery: 'Nasomatto', country: 'Нидерланды', category: 'niche', isPopular: true },
  { name: 'Clive Christian', slug: 'clive-christian', searchQuery: 'Clive Christian', country: 'Великобритания', category: 'niche', isPopular: true },
  { name: 'Bvlgari', slug: 'bvlgari', searchQuery: 'Bvlgari', country: 'Италия', category: 'luxury', isPopular: true },
  { name: 'Carolina Herrera', slug: 'carolina-herrera', searchQuery: 'Carolina Herrera', country: 'США', category: 'luxury', isPopular: true },
  { name: 'Rabanne', slug: 'rabanne', searchQuery: 'Rabanne', country: 'Франция', category: 'luxury', isPopular: true },
  { name: 'Tiziana Terenzi', slug: 'tiziana-terenzi', searchQuery: 'Tiziana Terenzi', country: 'Италия', category: 'niche', isPopular: true },
  { name: 'Valentino', slug: 'valentino', searchQuery: 'Valentino', country: 'Италия', category: 'luxury', isPopular: true },
  { name: 'Versace', slug: 'versace', searchQuery: 'Versace', country: 'Италия', category: 'luxury', isPopular: true },
  { name: "Victoria's Secret", slug: 'victorias-secret', searchQuery: "Victoria's Secret", country: 'США', category: 'beauty', isPopular: true },
  { name: 'Ex Nihilo', slug: 'ex-nihilo', searchQuery: 'Ex Nihilo', country: 'Франция', category: 'niche', isPopular: true },
  { name: 'Initio Parfums Prives', slug: 'initio-parfums-prives', searchQuery: 'Initio', country: 'Франция', category: 'niche', isPopular: true },
  { name: 'Jo Malone', slug: 'jo-malone', searchQuery: 'Jo Malone', country: 'Великобритания', category: 'niche', isPopular: true },
  { name: 'Diptyque', slug: 'diptyque', searchQuery: 'Diptyque', country: 'Франция', category: 'niche', isPopular: true },
  { name: 'Le Labo', slug: 'le-labo', searchQuery: 'Le Labo', country: 'США', category: 'niche', isPopular: true },
  { name: 'Memo Paris', slug: 'memo-paris', searchQuery: 'Memo', country: 'Франция', category: 'niche', isPopular: true },
  { name: 'Vilhelm Parfumerie', slug: 'vilhelm-parfumerie', searchQuery: 'Vilhelm Parfumerie', country: 'Франция', category: 'niche', isPopular: true },
  { name: 'Chopard', slug: 'chopard', searchQuery: 'Chopard', country: 'Швейцария', category: 'luxury', isPopular: true },
  { name: 'Frederic Malle', slug: 'frederic-malle', searchQuery: 'Frederic Malle', country: 'Франция', category: 'niche', isPopular: true },
  { name: 'Serge Lutens', slug: 'serge-lutens', searchQuery: 'Serge Lutens', country: 'Франция', category: 'niche', isPopular: true },
  { name: "Penhaligon's", slug: 'penhaligons', searchQuery: "Penhaligon", country: 'Великобритания', category: 'niche', isPopular: true },
  { name: 'Roja Dove', slug: 'roja-dove', searchQuery: 'Roja Dove', country: 'Великобритания', category: 'niche', isPopular: true },
  { name: 'Maison Martin Margiela', slug: 'maison-martin-margiela', searchQuery: 'Margiela', country: 'Франция', category: 'niche', isPopular: true },
  { name: 'Attar Collection', slug: 'attar-collection', searchQuery: 'Attar Collection', country: 'ОАЭ', category: 'arabian', isPopular: true },
  { name: 'Escentric Molecules', slug: 'escentric-molecules', searchQuery: 'Escentric Molecules', country: 'Великобритания', category: 'niche', isPopular: true },
  { name: 'Juliette Has A Gun', slug: 'juliette-has-a-gun', searchQuery: 'Juliette Has', country: 'Франция', category: 'niche', isPopular: true },
  { name: 'Haute Fragrance Company', slug: 'hfc-paris', searchQuery: 'Haute Fragrance', country: 'Франция', category: 'niche', isPopular: true },
  { name: 'Boadicea The Victorious', slug: 'boadicea-the-victorious', searchQuery: 'Boadicea', country: 'Великобритания', category: 'niche', isPopular: true }
];

// Comprehensive authentic brand catalog
export const ALL_PURE_BRANDS: BrandInfo[] = [
  ...POPULAR_BRANDS,
  { name: 'Acqua di Parma', slug: 'acqua-di-parma', searchQuery: 'Acqua di Parma', country: 'Италия' },
  { name: 'Aeronot', slug: 'aeronot', searchQuery: 'Aeronot', country: 'ОАЭ' },
  { name: 'Afnan', slug: 'afnan', searchQuery: 'Afnan', country: 'ОАЭ' },
  { name: 'Ajmal', slug: 'ajmal', searchQuery: 'Ajmal', country: 'ОАЭ' },
  { name: 'Al Haramain', slug: 'al-haramain', searchQuery: 'Haramain', country: 'ОАЭ' },
  { name: 'Alexandre.J', slug: 'alexandre-j', searchQuery: 'Alexandre.J', country: 'Франция' },
  { name: 'Amouroud', slug: 'amouroud', searchQuery: 'Amouroud', country: 'США' },
  { name: 'Anfas', slug: 'anfas', searchQuery: 'Anfas', country: 'ОАЭ' },
  { name: 'Annick Goutal', slug: 'annick-goutal', searchQuery: 'Goutal', country: 'Франция' },
  { name: 'Atelier Cologne', slug: 'atelier-cologne', searchQuery: 'Atelier Cologne', country: 'Франция' },
  { name: 'Atelier des Ors', slug: 'atelier-des-ors', searchQuery: 'Atelier des Ors', country: 'Франция' },
  { name: 'Birkholz', slug: 'birkholz', searchQuery: 'Birkholz', country: 'Германия' },
  { name: 'Bois 1920', slug: 'bois-1920', searchQuery: 'Bois 1920', country: 'Италия' },
  { name: 'Bond No. 9', slug: 'bond-no-9', searchQuery: 'Bond No. 9', country: 'США' },
  { name: 'Bottega Veneta', slug: 'bottega-veneta', searchQuery: 'Bottega Veneta', country: 'Италия' },
  { name: 'Burberry', slug: 'burberry', searchQuery: 'Burberry', country: 'Великобритания' },
  { name: 'Calvin Klein', slug: 'calvin-klein', searchQuery: 'Calvin Klein', country: 'США' },
  { name: 'Cartier', slug: 'cartier', searchQuery: 'Cartier', country: 'Франция' },
  { name: 'Carner Barcelona', slug: 'carner-barcelona', searchQuery: 'Carner Barcelona', country: 'Испания' },
  { name: 'Chloe', slug: 'chloe', searchQuery: 'Chloe', country: 'Франция' },
  { name: 'Costume National', slug: 'costume-national', searchQuery: 'Costume National', country: 'Италия' },
  { name: 'Davidoff', slug: 'davidoff', searchQuery: 'Davidoff', country: 'Швейцария' },
  { name: 'Electimuss', slug: 'electimuss', searchQuery: 'Electimuss', country: 'Великобритания' },
  { name: 'Essential Parfums', slug: 'essential-parfums', searchQuery: 'Essential Parfums', country: 'Франция' },
  { name: 'Etat Libre d Orange', slug: 'etat-libre-d-orange', searchQuery: 'Etat Libre', country: 'Франция' },
  { name: 'Fragrance World', slug: 'fragrance-world', searchQuery: 'Fragrance World', country: 'ОАЭ' },
  { name: 'Francesca Bianchi', slug: 'francesca-bianchi', searchQuery: 'Francesca Bianchi', country: 'Италия' },
  { name: 'Giorgio Armani', slug: 'giorgio-armani', searchQuery: 'Giorgio Armani', country: 'Италия' },
  { name: 'Gritti', slug: 'gritti', searchQuery: 'Gritti', country: 'Италия' },
  { name: 'Hermes', slug: 'hermes', searchQuery: 'Hermes', country: 'Франция' },
  { name: 'Houbigant', slug: 'houbigant', searchQuery: 'Houbigant', country: 'Франция' },
  { name: 'Hugo Boss', slug: 'hugo-boss', searchQuery: 'Hugo Boss', country: 'Германия' },
  { name: 'Issey Miyake', slug: 'issey-miyake', searchQuery: 'Issey Miyake', country: 'Япония' },
  { name: 'Jimmy Choo', slug: 'jimmy-choo', searchQuery: 'Jimmy Choo', country: 'Великобритания' },
  { name: 'Kajal', slug: 'kajal', searchQuery: 'Kajal', country: 'ОАЭ' },
  { name: 'Kenzo', slug: 'kenzo', searchQuery: 'Kenzo', country: 'Франция' },
  { name: 'Kilian Paris', slug: 'kilian-paris', searchQuery: 'Kilian', country: 'Франция' },
  { name: 'Laboratorio Olfattivo', slug: 'laboratorio-olfattivo', searchQuery: 'Laboratorio Olfattivo', country: 'Италия' },
  { name: 'Lacoste', slug: 'lacoste', searchQuery: 'Lacoste', country: 'Франция' },
  { name: 'Lalique', slug: 'lalique', searchQuery: 'Lalique', country: 'Франция' },
  { name: 'Lancome', slug: 'lancome', searchQuery: 'Lancome', country: 'Франция' },
  { name: 'Lanvin', slug: 'lanvin', searchQuery: 'Lanvin', country: 'Франция' },
  { name: 'Lorenzo Villoresi', slug: 'lorenzo-villoresi', searchQuery: 'Lorenzo Villoresi', country: 'Италия' },
  { name: 'Maison Crivelli', slug: 'maison-crivelli', searchQuery: 'Maison Crivelli', country: 'Франция' },
  { name: 'Maison Tahite', slug: 'maison-tahite', searchQuery: 'Maison Tahite', country: 'Италия' },
  { name: 'Matiere Premiere', slug: 'matiere-premiere', searchQuery: 'Matiere Premiere', country: 'Франция' },
  { name: 'Max Philip', slug: 'max-philip', searchQuery: 'Max Philip', country: 'Франция' },
  { name: 'Montblanc', slug: 'montblanc', searchQuery: 'Montblanc', country: 'Германия' },
  { name: 'Moschino', slug: 'moschino', searchQuery: 'Moschino', country: 'Италия' },
  { name: 'Mugler', slug: 'mugler', searchQuery: 'Mugler', country: 'Франция' },
  { name: 'Narciso Rodriguez', slug: 'narciso-rodriguez', searchQuery: 'Narciso Rodriguez', country: 'США' },
  { name: 'Nishane', slug: 'nishane', searchQuery: 'Nishane', country: 'Турция' },
  { name: 'Ormonde Jayne', slug: 'ormonde-jayne', searchQuery: 'Ormonde Jayne', country: 'Великобритания' },
  { name: 'Orto Parisi', slug: 'orto-parisi', searchQuery: 'Orto Parisi', country: 'Италия' },
  { name: 'Perris Monte Carlo', slug: 'perris-monte-carlo', searchQuery: 'Perris Monte Carlo', country: 'Монако' },
  { name: 'Prada', slug: 'prada', searchQuery: 'Prada', country: 'Италия' },
  { name: 'Rasasi', slug: 'rasasi', searchQuery: 'Rasasi', country: 'ОАЭ' },
  { name: 'Ramon Monegal', slug: 'ramon-monegal', searchQuery: 'Ramon Monegal', country: 'Испания' },
  { name: 'Shiseido', slug: 'shiseido', searchQuery: 'Shiseido', country: 'Япония' },
  { name: 'Stephane Humbert Lucas 777', slug: 'stephane-humbert-lucas', searchQuery: 'Stephane Humbert', country: 'Франция' },
  { name: 'The Different Company', slug: 'the-different-company', searchQuery: 'The Different Company', country: 'Франция' },
  { name: 'Thomas Kosmala', slug: 'thomas-kosmala', searchQuery: 'Thomas Kosmala', country: 'Великобритания' },
  { name: 'Trussardi', slug: 'trussardi', searchQuery: 'Trussardi', country: 'Италия' },
  { name: 'Vertus', slug: 'vertus', searchQuery: 'Vertus', country: 'Франция' },
  { name: 'Widian', slug: 'widian', searchQuery: 'Widian', country: 'ОАЭ' },
  { name: 'Zoologist', slug: 'zoologist', searchQuery: 'Zoologist', country: 'Канада' }
].sort((a, b) => a.name.localeCompare(b.name, 'en'));

// Deduplicate brands
const seen = new Set<string>();
export const UNIQUE_PURE_BRANDS = ALL_PURE_BRANDS.filter(b => {
  const k = b.name.toLowerCase();
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
});

// Group brands by first character
export function getBrandsByLetter(): Record<string, BrandInfo[]> {
  const groups: Record<string, BrandInfo[]> = {};
  for (const b of UNIQUE_PURE_BRANDS) {
    const first = b.name[0]?.toUpperCase() || '#';
    const key = /[A-Z]/.test(first) ? first : '#';
    if (!groups[key]) groups[key] = [];
    groups[key].push(b);
  }
  return groups;
}
