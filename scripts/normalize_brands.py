# -*- coding: utf-8 -*-
"""
Скрипт нормализации брендов в catalog.json и генерации полного brandsData.ts
"""

import json
import os
import re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CATALOG_PATH = os.path.join(ROOT, 'data', 'catalog.json')
BRANDS_DATA_TS = os.path.join(ROOT, 'src', 'data', 'brandsData.ts')

with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
    catalog = json.load(f)

products = catalog['products']
print(f"Загружено {len(products)} товаров из catalog.json")

# 1. Словарь точных восстановлений брендов по шаблонам в имени и бренде
BRAND_FIXES = [
    # Zielinski & Rozen
    (re.compile(r'(?:zielinski\s*(?:and|&)\s*rozen|зелински)', re.I), 'Zielinski & Rozen'),
    # Dolce & Gabbana
    (re.compile(r'dolce\s*(?:&|and)\s*gabbana', re.I), 'Dolce & Gabbana'),
    # Gritti
    (re.compile(r'(?:dr\.?\s*gritti|\bgritti\b)', re.I), 'Gritti'),
    # Franck Boclet
    (re.compile(r'franck\s*boclet', re.I), 'Franck Boclet'),
    # Antonio Banderas / Antonio Maretti
    (re.compile(r'antonio\s*banderas', re.I), 'Antonio Banderas'),
    (re.compile(r'antonio\s*maretti', re.I), 'Antonio Maretti'),
    # Les Bains Guerbois / Les Liquides Imaginaires
    (re.compile(r'les\s*bains\s*guerbois', re.I), 'Les Bains Guerbois'),
    (re.compile(r'les\s*liquides\s*imaginaires', re.I), 'Les Liquides Imaginaires'),
    # Jean Paul Gaultier / Jean Charles Brosseau
    (re.compile(r'jean\s*paul\s*gaultier', re.I), 'Jean Paul Gaultier'),
    (re.compile(r'jean\s*charles\s*brosseau', re.I), 'Jean Charles Brosseau'),
    # Victoria's Secret
    (re.compile(r"victoria['`\s]*s\s*secret", re.I), "Victoria's Secret"),
    # Yves Saint Laurent / Yves de Sistelle
    (re.compile(r'(?:yves\s*saint\s*laurent|\bysl\b)', re.I), 'Yves Saint Laurent'),
    (re.compile(r'yves\s*de\s*sistelle', re.I), 'Yves de Sistelle'),
    # Acqua di Parma / 4711
    (re.compile(r'acqua\s*di\s*parma', re.I), 'Acqua di Parma'),
    (re.compile(r'\b4711\b', re.I), '4711'),
    # Max Philip / Max Azria
    (re.compile(r'max\s*philip', re.I), 'Max Philip'),
    (re.compile(r'max\s*azria', re.I), 'Max Azria'),
    # Marc-Antoine Barrois
    (re.compile(r'marc[\s\-]antoine\s*barrois', re.I), 'Marc-Antoine Barrois'),
    # Etat Libre d'Orange
    (re.compile(r'etat\s*libre', re.I), "Etat Libre d'Orange"),
    # Bond No. 9
    (re.compile(r'bond\s*no\.?\s*9', re.I), 'Bond No. 9'),
    # Nina Ricci
    (re.compile(r'nina\s*ricci', re.I), 'Nina Ricci'),
    # Jil Sander
    (re.compile(r'jil\s*sander', re.I), 'Jil Sander'),
    # LM Parfums
    (re.compile(r'(?:lm\s*parfums|laurent\s*mazzone)', re.I), 'LM Parfums'),
    # The House of Oud
    (re.compile(r'the\s*house\s*of\s*oud', re.I), 'The House of Oud'),
    # Boadicea The Victorious
    (re.compile(r'boadicea\s*the\s*victorious', re.I), 'Boadicea The Victorious'),
    # Haute Fragrance Company
    (re.compile(r'(?:haute\s*fragrance\s*company|\bhfc\b)', re.I), 'Haute Fragrance Company'),
    # Juliette Has A Gun
    (re.compile(r'juliette\s*has\s*a\s*gun', re.I), 'Juliette Has A Gun'),
    # Escentric Molecules
    (re.compile(r'escentric\s*molecules', re.I), 'Escentric Molecules'),
    # Maison Francis Kurkdjian
    (re.compile(r'(?:maison\s*francis\s*kurkdjian|\bmfk\b)', re.I), 'Maison Francis Kurkdjian'),
    # Maison Margiela
    (re.compile(r'maison\s*(?:martin\s*)?margiela', re.I), 'Maison Margiela'),
    # Parfums de Marly
    (re.compile(r'parfums\s*de\s*marly', re.I), 'Parfums de Marly'),
    # Essential Parfums
    (re.compile(r'essential\s*parfums', re.I), 'Essential Parfums'),
    # Pierre Guillaume
    (re.compile(r'pierre\s*guillaume', re.I), 'Pierre Guillaume'),
    # Salvador Dali
    (re.compile(r'salvador\s*dali', re.I), 'Salvador Dali'),
    # Salvatore Ferragamo
    (re.compile(r'salvatore\s*ferragamo', re.I), 'Salvatore Ferragamo'),
    # Van Cleef & Arpels
    (re.compile(r'van\s*cleef', re.I), 'Van Cleef & Arpels'),
    # Serge Lutens
    (re.compile(r'serge\s*lutens', re.I), 'Serge Lutens'),
    # Frederic Malle
    (re.compile(r'frederic\s*malle', re.I), 'Frederic Malle'),
    # Vilhelm Parfumerie
    (re.compile(r'vilhelm\s*parfumerie', re.I), 'Vilhelm Parfumerie'),
    # By Kilian
    (re.compile(r'(?:by\s*kilian|\bkilian\b)', re.I), 'Kilian'),
    # Christian Dior
    (re.compile(r'(?:christian\s*dior|\bc\.dior\b|\bdior\b)', re.I), 'Dior'),
]

fixed_count = 0
for p in products:
    b = p.get('brand', '')
    n = p.get('name', '')
    combined = f"{b} {n}"
    for pat, proper_brand in BRAND_FIXES:
        if pat.search(combined):
            if p.get('brand') != proper_brand:
                p['brand'] = proper_brand
                fixed_count += 1
            break

print(f"Восстановлено и нормализовано брендов в товарах: {fixed_count}")

# 2. Собираем все уникальные чистые бренды из каталога
JUNK_BRAND_REGEX = re.compile(
    r'(?:^бренд$|^другое$|распродажа|ограниченное|специальные|тестер|пробник|уценка|скидк|акци|ликвидац|дисконт|воск|индивидуальная|парфюмерия|расходные|честный|!!!|\?\?\?)',
    re.I
)

brand_counts = {}
for p in products:
    b = p.get('brand', '').strip()
    if b and len(b) >= 2 and not JUNK_BRAND_REGEX.search(b):
        brand_counts[b] = brand_counts.get(b, 0) + 1

print(f"Всего чистых брендов в каталоге: {len(brand_counts)}")

# Топ популярных люксовых и нишевых домов
POPULAR_SEEDS = [
    ('Zielinski & Rozen', 'Израиль', 'niche'),
    ('Creed', 'Франция', 'niche'),
    ('Tom Ford', 'США', 'luxury'),
    ('Kilian', 'Франция', 'niche'),
    ('Amouage', 'Оман', 'niche'),
    ('Byredo', 'Швеция', 'niche'),
    ('Marc-Antoine Barrois', 'Франция', 'niche'),
    ('Xerjoff', 'Италия', 'niche'),
    ('Parfums de Marly', 'Франция', 'niche'),
    ('Maison Francis Kurkdjian', 'Франция', 'niche'),
    ('Chanel', 'Франция', 'luxury'),
    ('Dior', 'Франция', 'luxury'),
    ('Dolce & Gabbana', 'Италия', 'luxury'),
    ('French Avenue', 'ОАЭ', 'arabian'),
    ('Lattafa Perfumes', 'ОАЭ', 'arabian'),
    ('Armaf', 'ОАЭ', 'arabian'),
    ('Montale', 'Франция', 'niche'),
    ('Mancera', 'Франция', 'niche'),
    ('Yves Saint Laurent', 'Франция', 'luxury'),
    ('Gucci', 'Италия', 'luxury'),
    ('Givenchy', 'Франция', 'luxury'),
    ('Jean Paul Gaultier', 'Франция', 'luxury'),
    ('Louis Vuitton', 'Франция', 'luxury'),
    ('Nasomatto', 'Нидерланды', 'niche'),
    ('Clive Christian', 'Великобритания', 'niche'),
    ('Bvlgari', 'Италия', 'luxury'),
    ('Carolina Herrera', 'США', 'luxury'),
    ('Rabanne', 'Франция', 'luxury'),
    ('Tiziana Terenzi', 'Италия', 'niche'),
    ('Valentino', 'Италия', 'luxury'),
    ('Versace', 'Италия', 'luxury'),
    ("Victoria's Secret", 'США', 'beauty'),
    ('Ex Nihilo', 'Франция', 'niche'),
    ('Initio Parfums Prives', 'Франция', 'niche'),
    ('Jo Malone', 'Великобритания', 'niche'),
    ('Diptyque', 'Франция', 'niche'),
    ('Le Labo', 'США', 'niche'),
    ('Memo Paris', 'Франция', 'niche'),
    ('Vilhelm Parfumerie', 'Франция', 'niche'),
    ('Chopard', 'Швейцария', 'luxury'),
    ('Frederic Malle', 'Франция', 'niche'),
    ('Serge Lutens', 'Франция', 'niche'),
    ("Penhaligon's", 'Великобритания', 'niche'),
    ('Roja Dove', 'Великобритания', 'niche'),
    ('Maison Margiela', 'Франция', 'niche'),
    ('Attar Collection', 'ОАЭ', 'arabian'),
    ('Escentric Molecules', 'Великобритания', 'niche'),
    ('Juliette Has A Gun', 'Франция', 'niche'),
    ('Haute Fragrance Company', 'Франция', 'niche'),
    ('Boadicea The Victorious', 'Великобритания', 'niche'),
    ('Gritti', 'Италия', 'niche'),
    ('Franck Boclet', 'Франция', 'niche'),
    ('Essential Parfums', 'Франция', 'niche'),
    ('The House of Oud', 'Италия', 'niche'),
    ('Orto Parisi', 'Италия', 'niche'),
    ('Thomas Kosmala', 'Великобритания', 'niche'),
    ('M.Micallef', 'Франция', 'niche'),
    ('Les Liquides Imaginaires', 'Франция', 'niche'),
    ('Hermes', 'Франция', 'luxury'),
    ('Guerlain', 'Франция', 'luxury'),
    ('Lancome', 'Франция', 'luxury'),
    ('Cartier', 'Франция', 'luxury'),
    ('Prada', 'Италия', 'luxury'),
    ('Burberry', 'Великобритания', 'luxury'),
    ('Giorgio Armani', 'Италия', 'luxury'),
    ('Hugo Boss', 'Германия', 'luxury'),
    ('Acqua di Parma', 'Италия', 'niche'),
    ('Vertus', 'Франция', 'niche'),
    ('Widian', 'ОАЭ', 'arabian'),
    ('Afnan', 'ОАЭ', 'arabian'),
    ('Ajmal', 'ОАЭ', 'arabian'),
    ('Nishane', 'Турция', 'niche'),
    ('State of Mind', 'Франция', 'niche'),
    ('Pierre Guillaume', 'Франция', 'niche'),
]

popular_names = set(p[0] for p in POPULAR_SEEDS)

# Известные страны и категории
COUNTRY_MAP = {
    'оаэ': 'ОАЭ', 'дубай': 'ОАЭ', 'lattafa': 'ОАЭ', 'armaf': 'ОАЭ', 'afnan': 'ОАЭ', 'ajmal': 'ОАЭ',
    'attar': 'ОАЭ', 'al haramain': 'ОАЭ', 'anfas': 'ОАЭ', 'rasasi': 'ОАЭ', 'widian': 'ОАЭ',
    'франция': 'Франция', 'италия': 'Италия', 'сша': 'США', 'великобритания': 'Великобритания',
    'германия': 'Германия', 'швейцария': 'Швейцария', 'швеция': 'Швеция', 'япония': 'Япония',
    'израиль': 'Израиль', 'зелински': 'Израиль', 'zielinski': 'Израиль',
}

def slugify(s):
    s = s.lower().replace('&', 'and').replace('+', 'and')
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s or 'brand'

# Генерируем массив брендов
all_brands_list = []

# Сначала добавляем популярные
for bname, country, cat in POPULAR_SEEDS:
    all_brands_list.append({
        'name': bname,
        'slug': slugify(bname),
        'searchQuery': bname,
        'country': country,
        'category': cat,
        'isPopular': True,
        'count': brand_counts.get(bname, 1)
    })

# Затем добавляем все остальные чистые бренды из каталога
for bname, count in sorted(brand_counts.items(), key=lambda x: -x[1]):
    if bname in popular_names:
        continue
    # Определяем категорию
    b_low = bname.lower()
    cat = 'niche'
    if any(k in b_low for k in ['wella', 'schwarzkopf', 'estel', 'londa', 'lebel', 'goldwell', 'ollin', 'matrix', 'keune', 'kydra', 'kapous', 'bouticle']):
        cat = 'beauty'
    elif any(k in b_low for k in ['lattafa', 'armaf', 'afnan', 'ajmal', 'arab', 'haramain', 'rasasi', 'khaleej', 'khamrah', 'dubai', 'alhambra', 'ard al']):
        cat = 'arabian'
    elif any(k in b_low for k in ['dior', 'chanel', 'armani', 'gucci', 'prada', 'versace', 'hermes', 'guerlain', 'givenchy', 'lancome', 'boss', 'ferragamo']):
        cat = 'luxury'

    country = None
    if 'zielinski' in b_low:
        country = 'Израиль'
    elif any(k in b_low for k in ['lattafa', 'armaf', 'afnan', 'ajmal', 'alhambra', 'rasasi']):
        country = 'ОАЭ'

    all_brands_list.append({
        'name': bname,
        'slug': slugify(bname),
        'searchQuery': bname,
        'country': country,
        'category': cat,
        'isPopular': False,
        'count': count
    })

print(f"Итоговый реестр брендов: {len(all_brands_list)} брендов")

# Сохраняем обновленный catalog.json
with open(CATALOG_PATH, 'w', encoding='utf-8') as f:
    json.dump(catalog, f, ensure_ascii=False, indent=2)
print("Сохранен обновленный data/catalog.json")

# Генерируем TypeScript файл src/data/brandsData.ts
ts_content = f"""// AUTO-GENERATED: Comprehensive brand directory for Maison Arôme catalog
export interface BrandInfo {{
  name: string;
  slug: string;
  searchQuery: string;
  country?: string;
  category?: 'niche' | 'luxury' | 'arabian' | 'beauty';
  isPopular?: boolean;
  count?: number;
}}

export const JUNK_BRAND_REGEX = /(?:^бренд$|^другое$|распродажа|ограниченное|специальные|тестер|пробник|уценка|скидк|акци|ликвидац|дисконт|воск|индивидуальная|парфюмерия|расходные|честный|!!!|\\?\\?\\?)/i;

export function isPureBrand(brand: string): boolean {{
  if (!brand) return false;
  const trimmed = brand.trim();
  if (trimmed.length < 2) return false;
  return !JUNK_BRAND_REGEX.test(trimmed);
}}

// 60+ топ популярных домов (отображаются в быстрой панели)
export const POPULAR_BRANDS: BrandInfo[] = {json.dumps([b for b in all_brands_list if b.get('isPopular')], ensure_ascii=False, indent=2)};

// Полный каталог всех чистых брендов из catalog.json ({len(all_brands_list)} брендов)
export const ALL_PURE_BRANDS: BrandInfo[] = {json.dumps(all_brands_list, ensure_ascii=False, indent=2)};

// Дедупликация
const seen = new Set<string>();
export const UNIQUE_PURE_BRANDS = ALL_PURE_BRANDS.filter(b => {{
  const k = b.name.toLowerCase();
  if (seen.has(k)) return false;
  seen.add(k);
  return true;
}});

// Группировка брендов по первой букве (A-Z, А-Я)
export function getBrandsByLetter(): Record<string, BrandInfo[]> {{
  const groups: Record<string, BrandInfo[]> = {{}};
  for (const b of UNIQUE_PURE_BRANDS) {{
    const first = b.name[0]?.toUpperCase() || '#';
    const key = /[A-Z]/.test(first) ? first : /[А-Я]/.test(first) ? first : '#';
    if (!groups[key]) groups[key] = [];
    groups[key].push(b);
  }}
  return groups;
}}
"""

with open(BRANDS_DATA_TS, 'w', encoding='utf-8') as f:
    f.write(ts_content)
print(f"Сгенерирован {BRANDS_DATA_TS} ({len(all_brands_list)} брендов)")
