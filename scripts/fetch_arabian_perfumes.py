import os
import re
import ssl
import time
import json
import urllib.request
import urllib.parse
import subprocess

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT_DIR = os.path.join(ROOT, 'public', 'assets', 'products')
os.makedirs(OUT_DIR, exist_ok=True)

with open(os.path.join(ROOT, 'data', 'catalog.json'), 'r', encoding='utf-8') as f:
    catalog = json.load(f)

products = catalog['products']
arabian_brands = [
    'lattafa', 'afnan', 'armaf', 'attar collection', 'al haramain', 
    'rasasi', 'ajmal', 'kajal', 'swiss arabian', 'arabesque', 'norana'
]

def clean_model_name(name):
    n = re.sub(r'\[[^\]]*\]', '', name)
    n = re.sub(r'\([^\)]*\)', '', n)
    n = re.sub(r'\b\d+(?:[.,]\d+)?\s*(?:мл|ml|г|g|л|l)\b', '', n, flags=re.I)
    n = re.sub(r'\b\d+\s*по\s*\d+\s*(?:мл|ml)\b', '', n, flags=re.I)
    n = re.sub(r'\b\d+\s*\+\s*\d+.*$', '', n, flags=re.I)
    n = re.sub(r'\b(отливант|тестер|пробник|драмминг|dramming|дезодорант-спрей|набор|парфюмированный гель|дымка для тела|автопарфюм)\b', '', n, flags=re.I)
    n = re.sub(r'\b(мужской|женский|унисекс)\b', '', n, flags=re.I)
    n = re.sub(r'\b(парфюмерная вода|туалетная вода|духи|edp|edt|parfum|extrait|масляные духи)\b', '', n, flags=re.I)
    n = re.sub(r'\s+', ' ', n).strip()
    return n

def slugify(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')[:60]

# Group models
models_map = {}
for p in products:
    b = p.get('brand', '')
    if any(ab in b.lower() for ab in arabian_brands):
        m = clean_model_name(p.get('name', ''))
        if len(m) >= 4:
            c_brand = 'Lattafa'
            for ab in ['Attar Collection', 'Al Haramain', 'Afnan', 'Armaf', 'Rasasi', 'Ajmal', 'Kajal', 'Swiss Arabian', 'Arabesque', 'Norana', 'Lattafa']:
                if ab.lower() in b.lower():
                    c_brand = ab
                    break
            models_map.setdefault((c_brand, m), []).append(p)

# Sort models by count of products (descending)
sorted_models = sorted(models_map.items(), key=lambda x: -len(x[1]))
print(f"Total distinct Arabian models: {len(sorted_models)}")

def search_perfume_image(query):
    url = 'https://yandex.com/images/search?text=' + urllib.parse.quote(query + ' флакон парфюм духи')
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as r:
            raw = r.read().decode('utf-8', errors='ignore')
        
        urls = re.findall(r'\"(https://avatars\.mds\.yandex\.net/get-mpic/[^\"]+?/orig)\"', raw)
        if not urls:
            urls = re.findall(r'\"(https://avatars\.mds\.yandex\.net/get-yabs_performance/[^\"]+?/huge)\"', raw)
        if not urls:
            urls = re.findall(r'\"(https://avatars\.mds\.yandex\.net/[^\"]+?)\"', raw)
            urls = [u for u in urls if 'images-thumbs' not in u and ('/orig' in u or '/huge' in u or 'get-mpic' in u)]
        
        if urls:
            return urls[0]
            
        any_avatar = re.findall(r'(https://avatars\.mds\.yandex\.net/get-mpic/[^\s\"\'<>]+)', raw)
        if any_avatar:
            return any_avatar[0].split('&')[0]
    except Exception as e:
        pass
    return None

def download_and_optimize(img_url, dest_path):
    temp_path = dest_path + '.tmp'
    req = urllib.request.Request(img_url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=12) as r:
            with open(temp_path, 'wb') as f:
                f.write(r.read())
        
        cmd = [
            'sips',
            '-Z', '800',
            '-s', 'format', 'jpeg',
            '-s', 'formatOptions', '85',
            temp_path,
            '--out', dest_path
        ]
        res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return res.returncode == 0
    except Exception as e:
        if os.path.exists(temp_path):
            try: os.remove(temp_path)
            except: pass
        return False

# Target top 180 models covering 75%+ of all Arabian perfumery
TARGET_MODELS = sorted_models[:180]
print(f"Fetching images for top {len(TARGET_MODELS)} Arabian perfume lines...")

results = []
success = 0
skipped = 0
failed = 0

for idx, ((brand, model), prods) in enumerate(TARGET_MODELS):
    filename = f"arab-{slugify(brand)}-{slugify(model)}.jpg"
    dest = os.path.join(OUT_DIR, filename)
    
    # Generate match keywords
    # brand keyword + key words from model
    m_clean = re.sub(r'[^a-zA-Zа-яА-Я0-9\s]', ' ', model).lower()
    words = [w for w in m_clean.split() if len(w) > 2 and w not in ['men', 'pour', 'femme', 'homme', 'edp', 'edt', 'the']]
    match_keys = words[:3]
    
    results.append({
        'brand': brand,
        'model': model,
        'filename': filename,
        'match_keys': match_keys,
        'product_count': len(prods)
    })
    
    if os.path.exists(dest) and os.path.getsize(dest) > 3000:
        skipped += 1
        continue
        
    query = f"{brand} {model}"
    img_url = search_perfume_image(query)
    if not img_url:
        time.sleep(0.3)
        img_url = search_perfume_image(model)
        
    if img_url:
        ok = download_and_optimize(img_url, dest)
        if ok and os.path.exists(dest) and os.path.getsize(dest) > 1000:
            success += 1
            print(f"[{idx+1}/{len(TARGET_MODELS)}] OK: {filename} ({len(prods)} items)")
        else:
            failed += 1
            print(f"[{idx+1}/{len(TARGET_MODELS)}] FAIL to save: {query}")
    else:
        failed += 1
        print(f"[{idx+1}/{len(TARGET_MODELS)}] NOT FOUND: {query}")
        
    time.sleep(0.2)

# Save manifest
with open(os.path.join(ROOT, 'scripts', 'arabian_image_rules.json'), 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\nCompleted! Success: {success}, Skipped: {skipped}, Failed: {failed}")
