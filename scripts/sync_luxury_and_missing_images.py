import os
import re
import json
import time
import subprocess
import cloudscraper

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_PRODUCTS = os.path.join(ROOT, 'public', 'assets', 'products')
os.makedirs(PUBLIC_PRODUCTS, exist_ok=True)

CACHE_FILE = os.path.join(ROOT, 'scripts', 'fragrantica_cache.json')
CATALOG_FILE = os.path.join(ROOT, 'data', 'catalog.json')
RULES_FILE = os.path.join(ROOT, 'scripts', 'curated-image-rules.json')

scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'darwin', 'mobile': False})
HEADERS = {
    'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
    'Referer': 'https://www.google.com/',
}

# 1. Load or initialize cache
f_cache = {}
if os.path.exists(CACHE_FILE):
    try:
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            f_cache = json.load(f)
    except Exception as e:
        print(f"Error loading cache: {e}")

# Target designer URLs on fragrantica.ru
DESIGNERS = [
    ('Amouage', 'https://www.fragrantica.ru/designers/Amouage.html', ['amouage']),
    ('By Kilian', 'https://www.fragrantica.ru/designers/By-Kilian.html', ['kilian', 'by kilian']),
    ('Creed', 'https://www.fragrantica.ru/designers/Creed.html', ['creed']),
    ('Tom Ford', 'https://www.fragrantica.ru/designers/Tom-Ford.html', ['tom ford']),
    ('Xerjoff', 'https://www.fragrantica.ru/designers/Xerjoff.html', ['xerjoff', 'casamorati']),
    ('Parfums de Marly', 'https://www.fragrantica.ru/designers/Parfums-de-Marly.html', ['marly', 'parfums de marly']),
    ('Maison Francis Kurkdjian', 'https://www.fragrantica.ru/designers/Maison-Francis-Kurkdjian.html', ['kurkdjian', 'francis kurkdjian', 'mfk']),
    ('Byredo', 'https://www.fragrantica.ru/designers/Byredo.html', ['byredo']),
    ('Initio Parfums Prives', 'https://www.fragrantica.ru/designers/Initio-Parfums-Prives.html', ['initio']),
    ('Marc-Antoine Barrois', 'https://www.fragrantica.ru/designers/Marc-Antoine-Barrois.html', ['barrois', 'marc antoine', 'marc-antoine']),
    ('Roja Dove', 'https://www.fragrantica.ru/designers/Roja-Dove.html', ['roja', 'roja dove']),
    ('Clive Christian', 'https://www.fragrantica.ru/designers/Clive-Christian.html', ['clive christian']),
    ('Vilhelm Parfumerie', 'https://www.fragrantica.ru/designers/Vilhelm-Parfumerie.html', ['vilhelm']),
    ('Memo Paris', 'https://www.fragrantica.ru/designers/Memo-Paris.html', ['memo', 'memo paris']),
    ('Le Labo', 'https://www.fragrantica.ru/designers/Le-Labo.html', ['le labo']),
    ('Diptyque', 'https://www.fragrantica.ru/designers/Diptyque.html', ['diptyque']),
    ('Jo Malone', 'https://www.fragrantica.ru/designers/Jo-Malone-London.html', ['jo malone']),
    ('Thomas Kosmala', 'https://www.fragrantica.ru/designers/Thomas-Kosmala.html', ['thomas kosmala', 'kosmala']),
    ('Attar Collection', 'https://www.fragrantica.ru/designers/Attar-Collection.html', ['attar collection', 'attar']),
    ('Escentric Molecules', 'https://www.fragrantica.ru/designers/Escentric-Molecules.html', ['escentric', 'molecules', 'molecule']),
    ('Juliette Has A Gun', 'https://www.fragrantica.ru/designers/Juliette-Has-A-Gun.html', ['juliette has a gun', 'juliette']),
    ('Haute Fragrance Company', 'https://www.fragrantica.ru/designers/Haute-Fragrance-Company.html', ['haute fragrance', 'hfc']),
    ('Montale', 'https://www.fragrantica.ru/designers/Montale.html', ['montale']),
    ('Mancera', 'https://www.fragrantica.ru/designers/Mancera.html', ['mancera']),
    ('Lattafa Perfumes', 'https://www.fragrantica.ru/designers/Lattafa-Perfumes.html', ['lattafa']),
    ('French Avenue', 'https://www.fragrantica.ru/designers/French-Avenue.html', ['french avenue']),
    ('Fragrance World', 'https://www.fragrantica.ru/designers/Fragrance-World.html', ['fragrance world']),
    ('Armaf', 'https://www.fragrantica.ru/designers/Armaf.html', ['armaf']),
    ('Afnan', 'https://www.fragrantica.ru/designers/Afnan.html', ['afnan']),
    ('Ajmal', 'https://www.fragrantica.ru/designers/Ajmal.html', ['ajmal']),
    ('Kajal', 'https://www.fragrantica.ru/designers/Kajal.html', ['kajal']),
    ('Orto Parisi', 'https://www.fragrantica.ru/designers/Orto-Parisi.html', ['orto parisi']),
    ('Nasomatto', 'https://www.fragrantica.ru/designers/Nasomatto.html', ['nasomatto']),
    ('Nishane', 'https://www.fragrantica.ru/designers/Nishane.html', ['nishane']),
    ('Tiziana Terenzi', 'https://www.fragrantica.ru/designers/Tiziana-Terenzi.html', ['tiziana terenzi', 'terenzi']),
    ('Vertus', 'https://www.fragrantica.ru/designers/Vertus.html', ['vertus']),
    ('Chanel', 'https://www.fragrantica.ru/designers/Chanel.html', ['chanel']),
    ('Dior', 'https://www.fragrantica.ru/designers/Dior.html', ['dior', 'c.dior', 'christian dior']),
    ('Yves Saint Laurent', 'https://www.fragrantica.ru/designers/Yves-Saint-Laurent.html', ['ysl', 'yves saint laurent', 'saint laurent']),
    ('Dolce & Gabbana', 'https://www.fragrantica.ru/designers/Dolce-Gabbana.html', ['dolce', 'd&g', 'dolce & gabbana']),
    ('Givenchy', 'https://www.fragrantica.ru/designers/Givenchy.html', ['givenchy']),
    ('Gucci', 'https://www.fragrantica.ru/designers/Gucci.html', ['gucci']),
    ('Versace', 'https://www.fragrantica.ru/designers/Versace.html', ['versace']),
    ('Hermes', 'https://www.fragrantica.ru/designers/Hermes.html', ['hermes']),
    ('Guerlain', 'https://www.fragrantica.ru/designers/Guerlain.html', ['guerlain']),
    ('Prada', 'https://www.fragrantica.ru/designers/Prada.html', ['prada']),
    ('Jean Paul Gaultier', 'https://www.fragrantica.ru/designers/Jean-Paul-Gaultier.html', ['gaultier', 'jean paul gaultier']),
    ('Rabanne', 'https://www.fragrantica.ru/designers/Rabanne.html', ['rabanne', 'paco rabanne']),
]

BRAND_KEY_MAP = {}
for brand_name, _, patterns in DESIGNERS:
    BRAND_KEY_MAP[brand_name] = patterns

print("--- Step 1: Checking and fetching designer catalogs from Fragrantica ---")
for brand_name, url, _ in DESIGNERS:
    # If already cached with at least 10 items, skip fetch
    if brand_name in f_cache and len(f_cache[brand_name]) >= 10:
        print(f"[{brand_name}] Already cached: {len(f_cache[brand_name])} items")
        continue

    print(f"[{brand_name}] Fetching catalog from {url}...")
    try:
        r = scraper.get(url, headers=HEADERS, timeout=12)
        if r.status_code == 200:
            # Matches /perfume/Brand/Slug-ID.html
            items = []
            seen_ids = set()
            matches = re.findall(r'/perfume/[^/]+/([^/]+)-(\d+)\.html', r.text)
            for slug, pid in matches:
                if pid in seen_ids:
                    continue
                seen_ids.add(pid)
                # Pretty name from slug (e.g. Good-Girl-Gone-Bad -> Good Girl Gone Bad)
                name = slug.replace('-', ' ')
                items.append({
                    'name': name,
                    'slug': slug,
                    'id': pid,
                    'image': f"https://fimgs.net/mdimg/perfume/375x500.{pid}.jpg"
                })
            f_cache[brand_name] = items
            print(f"  -> Extracted {len(items)} perfumes for {brand_name}")
            time.sleep(1)
        else:
            print(f"  -> Failed: HTTP {r.status_code}")
    except Exception as e:
        print(f"  -> Exception: {e}")

# Save updated cache
with open(CACHE_FILE, 'w', encoding='utf-8') as f:
    json.dump(f_cache, f, ensure_ascii=False, indent=2)

print("\n--- Step 2: Matching catalog models with specific flanker accuracy ---")

with open(CATALOG_FILE, 'r', encoding='utf-8') as f:
    catalog = json.load(f)

def clean_catalog_name(name: str) -> str:
    n = re.sub(r'\[.*?\]', '', name)
    n = re.sub(r'\(.*?\)', '', n)
    n = re.sub(r'\b\d+(?:[.,]\d+)?\s*(?:мл|ml|г|g|л|l)\b', '', n, flags=re.I)
    n = re.sub(r'\b\d+\s*по\s*\d+\s*(?:мл|ml)\b', '', n, flags=re.I)
    n = re.sub(r'\b(отливант|тестер|пробник|драмминг|dramming|дезодорант|спрей|набор|гель|дымка|масло|запаска|декодированный)\b', '', n, flags=re.I)
    n = re.sub(r'\b(мужской|женский|унисекс)\b', '', n, flags=re.I)
    n = re.sub(r'\b(парфюмерная вода|туалетная вода|духи|edp|edt|parfum|extrait|cologne|колонь)\b', '', n, flags=re.I)
    n = re.sub(r'\s+', ' ', n).strip()
    return n

def normalize(text: str) -> str:
    t = text.lower().replace('ё', 'е')
    t = re.sub(r'[^a-z0-9а-я\s]', ' ', t)
    return re.sub(r'\s+', ' ', t).strip()

FLANKER_KEYWORDS = [
    'extreme', 'paradis', 'rocks', 'fraiche', 'eau fraiche', 'elixir', 'parfum',
    'absolu', 'cologne', 'intense', 'black', 'gold', 'white', 'rose', 'extract',
    'flame', 'royal', 'candy', 'anniversary', 'splash', 'noir', 'silver', 'blue',
    'green', 'red', 'night', 'sport', 'qahwa', 'zanzibar', 'tous', 'moi', 'iris',
    'man', 'woman', 'homme', 'femme'
]

def download_and_optimize(img_url: str, dest_path: str) -> bool:
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 3000:
        return True
    temp_path = dest_path + '.tmp'
    try:
        res = scraper.get(img_url, headers=HEADERS, timeout=12)
        if res.status_code != 200 or len(res.content) < 1500:
            return False
        with open(temp_path, 'wb') as f:
            f.write(res.content)
        
        cmd = [
            'sips',
            '-Z', '800',
            '-s', 'format', 'jpeg',
            '-s', 'formatOptions', '85',
            temp_path,
            '--out', dest_path
        ]
        sub = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return sub.returncode == 0
    except Exception:
        if os.path.exists(temp_path):
            try: os.remove(temp_path)
            except: pass
        return False

# Group catalog products by (brand_key, clean_model)
catalog_models = {}
for p in catalog['products']:
    if 'аналог' in p.get('name', '').lower() or 'мотив' in p.get('name', '').lower():
        continue
    b_raw = p.get('brand', '').lower()
    matched_fbrand = None
    for f_brand, patterns in BRAND_KEY_MAP.items():
        if any(pat in b_raw for pat in patterns):
            matched_fbrand = f_brand
            break
    if not matched_fbrand:
        continue
    clean_m = clean_catalog_name(p.get('name', ''))
    if len(clean_m) >= 3:
        key = (matched_fbrand, clean_m)
        catalog_models.setdefault(key, []).append(p)

print(f"Total distinct models in catalog for target brands: {len(catalog_models)}")

# Sort Fragrantica perfumes by name length descending (flankers first)
for f_brand in f_cache:
    f_cache[f_brand].sort(key=lambda x: len(x['name']), reverse=True)

existing_rules = []
if os.path.exists(RULES_FILE):
    try:
        with open(RULES_FILE, 'r', encoding='utf-8') as f:
            existing_rules = json.load(f)
    except Exception:
        pass

existing_files = {r.get('file') for r in existing_rules}
new_rules = []
matched_count = 0
downloaded_count = 0

for (f_brand, clean_m), prods in sorted(catalog_models.items(), key=lambda x: -len(x[1])):
    norm_m = normalize(clean_m)
    m_tokens = set(norm_m.split())
    f_perfumes = f_cache.get(f_brand, [])
    
    best_match = None
    for fp in f_perfumes:
        if not fp.get('image'):
            continue
        fp_name = normalize(fp['name'])
        fp_tokens = fp_name.split()
        if not fp_tokens:
            continue
        
        # Check flanker consistency:
        # If fp has flanker keywords, catalog model MUST have all of them!
        fp_flankers = [kw for kw in FLANKER_KEYWORDS if kw in fp_tokens]
        if fp_flankers:
            if not all(kw in m_tokens for kw in fp_flankers):
                continue
        
        # Check if all fp_tokens are in m_tokens
        if all(token in m_tokens for token in fp_tokens):
            best_match = fp
            break
        
        # Substring match
        if norm_m in fp_name or fp_name in norm_m:
            if not fp_flankers or all(kw in m_tokens for kw in fp_flankers):
                best_match = fp
                break

    if best_match:
        matched_count += 1
        safe_brand = re.sub(r'[^a-z0-9]+', '-', f_brand.lower()).strip('-')
        safe_slug = re.sub(r'[^a-z0-9]+', '-', best_match['slug'].lower()).strip('-')
        filename = f"{safe_brand}-{safe_slug}.jpg"
        dest_path = os.path.join(PUBLIC_PRODUCTS, filename)
        
        # Download and optimize
        if download_and_optimize(best_match['image'], dest_path):
            downloaded_count += 1
            must_tokens = [w for w in normalize(best_match['name']).split() if len(w) >= 3][:4]
            rule = {
                'name': f"{f_brand} {best_match['name']}",
                'file': filename,
                'anyBrand': BRAND_KEY_MAP[f_brand],
                'must': must_tokens
            }
            if filename not in existing_files:
                new_rules.append(rule)
                existing_files.add(filename)

print(f"\nSuccessfully matched models: {matched_count}")
print(f"Downloaded / verified model images: {downloaded_count}")
print(f"New precise rules added: {len(new_rules)}")

if new_rules:
    merged = new_rules + existing_rules
    # Deduplicate rules by file
    seen_f = set()
    deduped = []
    for r in merged:
        if r['file'] not in seen_f:
            seen_f.add(r['file'])
            deduped.append(r)
    with open(RULES_FILE, 'w', encoding='utf-8') as f:
        json.dump(deduped, f, ensure_ascii=False, indent=2)
    print(f"Updated {RULES_FILE}, total rules now: {len(deduped)}")

print("Done sync!")
