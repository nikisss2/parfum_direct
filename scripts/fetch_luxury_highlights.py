import os
import re
import json
import subprocess
import cloudscraper

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_PRODUCTS = os.path.join(ROOT, 'public', 'assets', 'products')
RULES_FILE = os.path.join(ROOT, 'scripts', 'curated-image-rules.json')

scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'darwin', 'mobile': False})
HEADERS = {
    'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
    'Referer': 'https://www.google.com/',
}

TARGET_PERFUMES = [
    # Casamorati
    ('Casamorati Dama Bianca', 'https://fimgs.net/mdimg/perfume/375x500.15555.jpg', 'xerjoff-casamorati-dama-bianca.jpg', ['xerjoff', 'casamorati'], ['dama', 'bianca'], []),
    ('Casamorati Bouquet Ideale', 'https://fimgs.net/mdimg/perfume/375x500.11800.jpg', 'xerjoff-casamorati-bouquet-ideale.jpg', ['xerjoff', 'casamorati'], ['bouquet', 'ideale'], []),
    ('Casamorati Italica', 'https://fimgs.net/mdimg/perfume/375x500.65383.jpg', 'xerjoff-casamorati-italica.jpg', ['xerjoff', 'casamorati'], ['italica'], []),
    ('Casamorati Mefisto', 'https://fimgs.net/mdimg/perfume/375x500.6312.jpg', 'xerjoff-casamorati-mefisto.jpg', ['xerjoff', 'casamorati'], ['mefisto'], ['gentiluomo']),
    ('Casamorati Mefisto Gentiluomo', 'https://fimgs.net/mdimg/perfume/375x500.52331.jpg', 'xerjoff-casamorati-mefisto-gentiluomo.jpg', ['xerjoff', 'casamorati'], ['mefisto', 'gentiluomo'], []),
    ('Casamorati Gran Ballo', 'https://fimgs.net/mdimg/perfume/375x500.26708.jpg', 'xerjoff-casamorati-gran-ballo.jpg', ['xerjoff', 'casamorati'], ['gran', 'ballo'], []),
    ('Casamorati Dolce Amalfi', 'https://fimgs.net/mdimg/perfume/375x500.42988.jpg', 'xerjoff-casamorati-dolce-amalfi.jpg', ['xerjoff', 'casamorati'], ['dolce', 'amalfi'], []),
    
    # Parfums de Marly
    ('Parfums de Marly Althair', 'https://fimgs.net/mdimg/perfume/375x500.84109.jpg', 'pdm-althair.jpg', ['marly', 'parfums de marly'], ['althair'], ['exclusif']),
    ('Parfums de Marly Pegasus', 'https://fimgs.net/mdimg/perfume/375x500.16938.jpg', 'pdm-pegasus.jpg', ['marly', 'parfums de marly'], ['pegasus'], ['exclusif']),
    ('Parfums de Marly Pegasus Exclusif', 'https://fimgs.net/mdimg/perfume/375x500.63100.jpg', 'pdm-pegasus-exclusif.jpg', ['marly', 'parfums de marly'], ['pegasus', 'exclusif'], []),
    ('Parfums de Marly Percival', 'https://fimgs.net/mdimg/perfume/375x500.51037.jpg', 'pdm-percival.jpg', ['marly', 'parfums de marly'], ['percival'], []),
    ('Parfums de Marly Sedley', 'https://fimgs.net/mdimg/perfume/375x500.56273.jpg', 'pdm-sedley.jpg', ['marly', 'parfums de marly'], ['sedley'], []),
    ('Parfums de Marly Oajan', 'https://fimgs.net/mdimg/perfume/375x500.21632.jpg', 'pdm-oajan.jpg', ['marly', 'parfums de marly'], ['oajan'], []),
    ('Parfums de Marly Carlisle', 'https://fimgs.net/mdimg/perfume/375x500.33514.jpg', 'pdm-carlisle.jpg', ['marly', 'parfums de marly'], ['carlisle'], []),

    # Marc-Antoine Barrois
    ('Marc-Antoine Barrois B683', 'https://fimgs.net/mdimg/perfume/375x500.46802.jpg', 'barrois-b683.jpg', ['barrois', 'marc antoine', 'marc-antoine'], ['b683'], ['extrait']),
    ('Marc-Antoine Barrois B683 Extrait', 'https://fimgs.net/mdimg/perfume/375x500.64653.jpg', 'barrois-b683-extrait.jpg', ['barrois', 'marc antoine', 'marc-antoine'], ['b683', 'extrait'], []),
    ('Marc-Antoine Barrois Ganymede Extrait', 'https://fimgs.net/mdimg/perfume/375x500.79354.jpg', 'barrois-ganymede-extrait.jpg', ['barrois', 'marc antoine', 'marc-antoine'], ['ganymede', 'extrait'], []),

    # MFK
    ('Maison Francis Kurkdjian Oud Satin Mood', 'https://fimgs.net/mdimg/perfume/375x500.30352.jpg', 'mfk-oud-satin-mood.jpg', ['kurkdjian', 'mfk', 'francis'], ['satin', 'mood'], ['extrait']),
    ('Maison Francis Kurkdjian Oud Satin Mood Extrait', 'https://fimgs.net/mdimg/perfume/375x500.48463.jpg', 'mfk-oud-satin-mood-extrait.jpg', ['kurkdjian', 'mfk', 'francis'], ['satin', 'mood', 'extrait'], []),
    ('Maison Francis Kurkdjian Oud Silk Mood', 'https://fimgs.net/mdimg/perfume/375x500.17646.jpg', 'mfk-oud-silk-mood.jpg', ['kurkdjian', 'mfk', 'francis'], ['silk', 'mood'], []),
    ('Maison Francis Kurkdjian 724', 'https://fimgs.net/mdimg/perfume/375x500.75883.jpg', 'mfk-724.jpg', ['kurkdjian', 'mfk', 'francis'], ['724'], []),
    ('Maison Francis Kurkdjian Aqua Media', 'https://fimgs.net/mdimg/perfume/375x500.81792.jpg', 'mfk-aqua-media.jpg', ['kurkdjian', 'mfk', 'francis'], ['aqua', 'media'], []),

    # Creed
    ('Creed Carmina', 'https://fimgs.net/mdimg/perfume/375x500.83547.jpg', 'creed-carmina.jpg', ['creed'], ['carmina'], []),
    ('Creed Queen of Silk', 'https://fimgs.net/mdimg/perfume/375x500.89311.jpg', 'creed-queen-of-silk.jpg', ['creed'], ['queen', 'silk'], []),
    ('Creed Centaurus', 'https://fimgs.net/mdimg/perfume/375x500.95779.jpg', 'creed-centaurus.jpg', ['creed'], ['centaurus'], []),
    ('Creed Delphinus', 'https://fimgs.net/mdimg/perfume/375x500.95778.jpg', 'creed-delphinus.jpg', ['creed'], ['delphinus'], []),

    # Tom Ford
    ('Tom Ford Vanilla Sex', 'https://fimgs.net/mdimg/perfume/375x500.88725.jpg', 'tom-ford-vanilla-sex.jpg', ['tom ford'], ['vanilla', 'sex'], []),
    ('Tom Ford Cafe Rose', 'https://fimgs.net/mdimg/perfume/375x500.84074.jpg', 'tom-ford-cafe-rose.jpg', ['tom ford'], ['cafe', 'rose'], []),
    ('Tom Ford Myrrhe Mystere', 'https://fimgs.net/mdimg/perfume/375x500.85217.jpg', 'tom-ford-myrrhe-mystere.jpg', ['tom ford'], ['myrrhe', 'mystere'], []),
    ('Tom Ford Soleil Brulant', 'https://fimgs.net/mdimg/perfume/375x500.66277.jpg', 'tom-ford-soleil-brulant.jpg', ['tom ford'], ['soleil', 'brulant'], []),
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
        cmd = ['sips', '-Z', '800', '-s', 'format', 'jpeg', '-s', 'formatOptions', '85', temp_path, '--out', dest_path]
        sub = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return sub.returncode == 0
    except Exception as e:
        if os.path.exists(temp_path):
            try: os.remove(temp_path)
            except: pass
        return False

with open(RULES_FILE, 'r', encoding='utf-8') as f:
    rules = json.load(f)

rules_by_file = {r['file']: r for r in rules}

downloaded = 0
for name, img_url, filename, any_brand, must_tokens, exclude_tokens in TARGET_PERFUMES:
    dest = os.path.join(PUBLIC_PRODUCTS, filename)
    if download_and_optimize(img_url, dest):
        downloaded += 1
        rule = {
            'name': name,
            'file': filename,
            'anyBrand': any_brand,
            'must': must_tokens,
            'exclude': exclude_tokens
        }
        rules_by_file[filename] = rule

all_rules = list(rules_by_file.values())
all_rules.sort(key=lambda r: (-len(r.get('must', [])), len(r.get('exclude', [])), r.get('name', '')))

with open(RULES_FILE, 'w', encoding='utf-8') as f:
    json.dump(all_rules, f, ensure_ascii=False, indent=2)

print(f"Downloaded/checked {downloaded} targeted luxury perfumes.")
print(f"Total rules now in {RULES_FILE}: {len(all_rules)}")
