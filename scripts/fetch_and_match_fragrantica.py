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

with open(CACHE_FILE, 'r', encoding='utf-8') as f:
    f_cache = json.load(f)

with open(CATALOG_FILE, 'r', encoding='utf-8') as f:
    catalog = json.load(f)

scraper = cloudscraper.create_scraper()

BRAND_MAP = {
    'Armaf': ['armaf'],
    'Bvlgari': ['bvlgari', 'bulgari'],
    'By Kilian': ['kilian'],
    'Carolina Herrera': ['carolina herrera'],
    'Chanel': ['chanel'],
    'Creed': ['creed'],
    'Clive Christian': ['clive christian'],
    'Dior': ['dior', 'c.dior', 'c dior'],
    'Dolce & Gabbana': ['dolce', 'd&g'],
    'French Avenue': ['french avenue'],
    'Givenchy': ['givenchy'],
    'Gucci': ['gucci'],
    'Jean Paul Gaultier': ['gaultier', 'jean paul'],
    'Lattafa Perfumes': ['lattafa'],
    'Louis Vuitton': ['louis vuitton', 'vuitton'],
    'Mancera': ['mancera'],
    'Maison Martin Margiela': ['margiela'],
    'Maison Francis Kurkdjian': ['kurkdjian', 'francis kurkdjian'],
    'Montale': ['montale'],
    'Nasomatto': ['nasomatto'],
    'Parfums de Marly': ['marly'],
    'Rabanne': ['rabanne', 'paco rabanne'],
    'Tom Ford': ['tom ford'],
    'Tiziana Terenzi': ['terenzi', 'tiziana'],
    'Valentino': ['valentino'],
    'Versace': ['versace'],
    'Victoria Secret': ['victoria s secret', 'victoria secret'],
    'Xerjoff': ['xerjoff', 'casamorati'],
    'Yves Saint Laurent': ['ysl', 'saint laurent', 'yves saint laurent'],
}

def clean_catalog_name(name):
    n = re.sub(r'\[.*?\]', '', name)
    n = re.sub(r'\(.*?\)', '', n)
    n = re.sub(r'\b\d+(?:[.,]\d+)?\s*(?:мл|ml|г|g|л|l)\b', '', n, flags=re.I)
    n = re.sub(r'\b\d+\s*по\s*\d+\s*(?:мл|ml)\b', '', n, flags=re.I)
    n = re.sub(r'\b(отливант|тестер|пробник|драмминг|dramming|дезодорант|спрей|набор|гель|дымка|масло|запаска|декодированный)\b', '', n, flags=re.I)
    n = re.sub(r'\b(мужской|женский|унисекс)\b', '', n, flags=re.I)
    n = re.sub(r'\b(парфюмерная вода|туалетная вода|духи|edp|edt|parfum|extrait|cologne|колонь)\b', '', n, flags=re.I)
    n = re.sub(r'\s+', ' ', n).strip()
    return n

def normalize(text):
    t = text.lower().replace('ё', 'е')
    t = re.sub(r'[^a-z0-9а-я\s]', ' ', t)
    return re.sub(r'\s+', ' ', t).strip()

def download_and_optimize(img_url, dest_path):
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 3000:
        return True
    temp_path = dest_path + '.tmp'
    try:
        res = scraper.get(img_url, timeout=15)
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
    except Exception as e:
        if os.path.exists(temp_path):
            try: os.remove(temp_path)
            except: pass
        return False

# Group catalog products by (brand_key, clean_model)
catalog_models = {}
for p in catalog['products']:
    # Avoid analogs
    if 'аналог' in p.get('name', '').lower() or 'мотив' in p.get('name', '').lower():
        continue
    b_raw = p.get('brand', '').lower()
    matched_fbrand = None
    for f_brand, patterns in BRAND_MAP.items():
        if any(pat in b_raw for pat in patterns):
            matched_fbrand = f_brand
            break
    if not matched_fbrand:
        continue
    clean_m = clean_catalog_name(p.get('name', ''))
    if len(clean_m) >= 3:
        key = (matched_fbrand, clean_m)
        catalog_models.setdefault(key, []).append(p)

print(f"Total distinct catalog models for target brands: {len(catalog_models)}")

# Sort Fragrantica perfumes by name length descending (match specific flankers first!)
for f_brand in f_cache:
    f_cache[f_brand].sort(key=lambda x: len(x['name']), reverse=True)

# Matching and downloading
new_rules = []
downloaded_count = 0
matched_models_count = 0

existing_rules = []
if os.path.exists(RULES_FILE):
    try:
        with open(RULES_FILE, 'r', encoding='utf-8') as f:
            existing_rules = json.load(f)
    except:
        pass

existing_files = {r.get('file') for r in existing_rules}

for (f_brand, clean_m), prods in sorted(catalog_models.items(), key=lambda x: -len(x[1])):
    norm_m = normalize(clean_m)
    f_perfumes = f_cache.get(f_brand, [])
    
    best_match = None
    # 1. Exact or high-precision token match
    for fp in f_perfumes:
        if not fp.get('image'):
            continue
        fp_name = normalize(fp['name'])
        fp_tokens = fp_name.split()
        if len(fp_tokens) == 0:
            continue
        
        # Flanker check: if Fragrantica perfume has flanker keywords (e.g. royal, elixir, intense, absolu, cologne)
        # the catalog name MUST contain that keyword!
        is_flanker = any(kw in fp_tokens for kw in ['royal', 'elixir', 'parfum', 'absolu', 'cologne', 'intense', 'extreme', 'sport', 'lucky', 'zanzibar', 'qahwa', 'candy', 'tous', 'moi', 'woman', 'femme', 'man', 'homme'])
        if is_flanker:
            # Check if all flanker tokens are in catalog model
            flanker_tokens = [kw for kw in fp_tokens if kw in ['royal', 'elixir', 'parfum', 'absolu', 'cologne', 'intense', 'extreme', 'sport', 'lucky', 'zanzibar', 'qahwa', 'candy', 'tous', 'moi', 'woman', 'femme', 'man', 'homme']]
            if not all(ft in norm_m.split() for ft in flanker_tokens):
                continue
        
        # Check if all tokens of fp_name are in norm_m
        if all(token in norm_m.split() for token in fp_tokens):
            best_match = fp
            break
        
        # Or if norm_m is contained in fp_name
        if norm_m in fp_name or fp_name in norm_m:
            # Avoid mismatching base model to flanker
            if not is_flanker or all(ft in norm_m.split() for ft in ['royal', 'elixir', 'absolu', 'cologne']):
                best_match = fp
                break

    if best_match:
        matched_models_count += 1
        safe_brand = re.sub(r'[^a-z0-9]+', '-', f_brand.lower()).strip('-')
        safe_slug = re.sub(r'[^a-z0-9]+', '-', best_match['slug'].lower()).strip('-')
        filename = f"{safe_brand}-{safe_slug}.jpg"
        dest_path = os.path.join(PUBLIC_PRODUCTS, filename)
        
        if download_and_optimize(best_match['image'], dest_path):
            downloaded_count += 1
            # Generate rule
            must_tokens = [w for w in normalize(best_match['name']).split() if len(w) >= 3][:4]
            rule = {
                'name': f"{f_brand} {best_match['name']}",
                'file': filename,
                'anyBrand': BRAND_MAP[f_brand],
                'must': must_tokens
            }
            if filename not in existing_files:
                new_rules.append(rule)
                existing_files.add(filename)

print(f"\nMatched catalog models: {matched_models_count}")
print(f"Downloaded / verified images: {downloaded_count}")
print(f"New rules to prepend: {len(new_rules)}")

if new_rules:
    merged = new_rules + existing_rules
    with open(RULES_FILE, 'w', encoding='utf-8') as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
    print(f"Updated {RULES_FILE}, total rules now: {len(merged)}")
