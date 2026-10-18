/**
 * Модуль расчета наценки и розничной стоимости товаров Maison Arôme
 *
 * Правила наценки от закупочной цены:
 *
 * 1. Люксовая и нишевая парфюмерия:
 *    - 0 – 2 000 ₽:       + 700 ₽
 *    - 2 000 – 5 000 ₽:   + 1 200 ₽
 *    - 5 000 – 10 000 ₽:  + 2 000 ₽
 *    - 10 000 – 15 000 ₽: + 3 000 ₽
 *    - 15 000 – 20 000 ₽: + 4 000 ₽
 *    - 20 000 – 25 000 ₽: + 4 500 ₽
 *    - 25 000 – 30 000 ₽: + 5 000 ₽
 *    - более 30 000 ₽:    + 6 000 ₽
 *
 * 2. Арабская парфюмерия:
 *    - 0 – 2 000 ₽:       + 750 ₽
 *    - 2 000 – 5 000 ₽:   + 1 200 ₽
 *    - 5 000 – 7 000 ₽:   + 2 000 ₽
 *    - 7 000 – 10 000 ₽:  + 3 000 ₽
 *    - 10 000 – 15 000 ₽: + 3 500 ₽
 *    - 15 000 – 20 000 ₽: + 4 000 ₽
 *    - более 20 000 ₽:    + 5 000 ₽
 *
 * 3. Все остальное кроме парфюмерии (косметика, макияж, уход и др.):
 *    - Наценка = 0 ₽ (остается исходная цена)
 *
 * Условия применяются ко всем объемам от 0 мл до 1000+ мл.
 */

export const ARABIAN_BRAND_SUBSTRINGS = [
  'lattafa', 'afnan', 'armaf', 'attar collection', 'attar al', 'attar', 'al haramain', 'haramain',
  'rasasi', 'ajmal', 'kajal', 'swiss arabian', 'norana', 'arabesque', 'khalis', 'fragrance world',
  'paris corner', 'alhambra', 'maison alhambra', 'zaafaran', 'ard al zaafaran', 'zimaya', 'riiffs',
  'rovena', 'orientica', 'al rehab', 'al-rehab', 'ahmed al maghribi', 'naseem', 'asdaaf', 'emper',
  'sterling', 'vurv', 'taif al emarat', 'louis cardin', 'junaid', 'my perfumes'
];

export function isArabianPerfume(category?: string, brand?: string, name?: string): boolean {
  if (category === 'arabian') return true;
  const hay = `${brand || ''} ${name || ''}`.toLowerCase();
  return ARABIAN_BRAND_SUBSTRINGS.some(b => hay.includes(b));
}

export function isPerfumeProduct(kind?: string, category?: string): boolean {
  if (kind === 'perfume') return true;
  if (category === 'arabian' || category === 'luxury' || category === 'niche' || category === 'decants' || category === 'decant') {
    return true;
  }
  return false;
}

export function getPriceMarkup(
  costPrice: number,
  kind: string = 'perfume',
  category: string = 'niche',
  brand?: string,
  name?: string
): number {
  if (!Number.isFinite(costPrice) || costPrice <= 0) return 0;
  const p = Math.round(costPrice);

  // Все остальное кроме парфюмерии: без наценки (+ 0 руб)
  if (!isPerfumeProduct(kind, category)) {
    return 0;
  }

  // Арабская парфюмерия
  if (isArabianPerfume(category, brand, name)) {
    if (p < 2000) return 750;
    if (p < 5000) return 1200;
    if (p < 7000) return 2000;
    if (p < 10000) return 3000;
    if (p < 15000) return 3500;
    if (p <= 20000) return 4000;
    return 5000;
  }

  // Люксовая и нишевая парфюмерия
  if (p < 2000) return 700;
  if (p < 5000) return 1200;
  if (p < 10000) return 2000;
  if (p < 15000) return 3000;
  if (p < 20000) return 4000;
  if (p < 25000) return 4500;
  if (p <= 30000) return 5000;
  return 6000;
}

export function calculateRetailPrice(
  costPrice: number,
  kind: string = 'perfume',
  category: string = 'niche',
  brand?: string,
  name?: string
): number {
  if (!Number.isFinite(costPrice) || costPrice <= 0) return 0;
  const p = Math.round(costPrice);
  const markup = getPriceMarkup(p, kind, category, brand, name);
  return p + markup;
}

export function applyMarkupToProduct<T extends { kind?: any; category?: any; brand?: any; name?: any; volumes?: any[]; minPrice?: number; costPrice?: number; oldPrice?: number; discountPercent?: number }>(prod: T): T {
  const isPerf = isPerfumeProduct(prod.kind, prod.category);
  const isArab = isArabianPerfume(prod.category, prod.brand, prod.name);
  const kind = isPerf ? 'perfume' : (prod.kind || 'other');
  const category = isArab ? 'arabian' : (prod.category || (isPerf ? 'niche' : 'other'));

  if (Array.isArray(prod.volumes) && prod.volumes.length > 0) {
    for (const vol of prod.volumes) {
      const costPrice = (vol.costPrice !== undefined && vol.costPrice > 0)
        ? vol.costPrice
        : vol.price;

      const retailPrice = calculateRetailPrice(
        costPrice,
        kind,
        category,
        prod.brand,
        prod.name
      );

      vol.costPrice = costPrice;
      vol.price = retailPrice;
    }

    prod.minPrice = Math.min(...prod.volumes.map((v: any) => v.price));
  } else if (prod.minPrice !== undefined) {
    const costPrice = (prod.costPrice !== undefined && prod.costPrice > 0)
      ? prod.costPrice
      : prod.minPrice;
    prod.costPrice = costPrice;
    prod.minPrice = calculateRetailPrice(costPrice, kind, category, prod.brand, prod.name);
  }

  if (prod.oldPrice && prod.discountPercent) {
    const multiplier = 1 + prod.discountPercent / 100;
    prod.oldPrice = Math.round((prod.minPrice * multiplier) / 10) * 10;
  }

  return prod;
}
