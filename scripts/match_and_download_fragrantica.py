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

scraper = cloudscraper.create_scraper()

def clean_catalog_name(name):
    # Remove bracketed and parenthesized info
    n = re.sub(r'\[.*?\]', '', name)
    n = re.sub(r'\(.*?\)', '', n)
    # Remove volume strings
    n = re.sub(r'\b\d+(?:[.,]\d+)?\s*(?:мл|ml|г|g|л|l)\b', '', n, flags=re.I)
    n = re.sub(r'\b\d+\s*по\s*\d+\s*(?:мл|ml)\b', '', n, flags=re.I)
    # Remove packaging words
    n = re.sub(r'\b(отливант|тестер|пробник|драмминг|dramming|дезодорант|спрей|набор|гель|дымка|масло|запаска|декодированный)\b', '', n, flags=re.I)
    n = re.sub(r'\b(мужской|женский|унисекс)\b', '', n, flags=re.I)
    n = re.sub(r'\b(парфюмерная вода|туалетная вода|духи|edp|edt|parfum|extrait|cologne|колонь)\b', '', n, flags=re.I)
    n = re.sub(r'\s+', ' ', n).strip()
    return n

def normalize_text(text):
    t = text.lower().replace('ё', 'е')
    t = re.sub(r'[^a-z0-9а-я\s]', ' ', t)
    return re.sub(r'\s+', ' ', t).strip()

def download_and_optimize(img_url, dest_path):
    temp_path = dest_path + '.tmp'
    try:
        res = scraper.get(img_url, timeout=15)
        if res.status_code != 200 or len(res.content) < 1000:
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

# Distinctive flanker keywords that define distinct bottles
FLANKER_KEYWORDS = [
    'royal', 'elixir', 'parfum', 'absolu', 'cologne', 'intense', 'extreme', 
    'sport', 'lucky', 'prive', 'black', 'white', 'gold', 'golden', 'rose', 
    'oud', 'blanche', 'noir', 'fraiche', 'eau fraiche', 'zanzibar', 'qahwa', 
    'candy', 'tous', 'moi', 'night', 'sensuelle', 'velvet', 'crystal', 'flame',
    'hero', 'goddess', 'her', 'london', 'brit', 'touch', 'weekend', 'soleil',
    'lost cherry', 'tobacco vanille', 'bitter peach', 'oud wood', 'black orchid',
    'fabulous', 'ebene fume', 'rose prick', 'soleil blanc', 'grey vetiver',
    'angels share', 'good girl gone bad', 'black phantom', 'love don t be shy',
    'guidance', 'reflection', 'interlude', 'ganymede', 'baccarat', 'grand soir',
    'erba pura', 'naxos', 'lira', 'bal d afrique', 'blanche', 'gypsy water',
    'layton', 'delina', 'herod', 'haltane', 'valaya', 'bleu', 'coco mademoiselle',
    'chance', 'sauvage', 'fahrenheit', 'homme', 'jadore', 'miss dior', 'libre',
    'black opium', 'la nuit de l homme'
]
