import os
import re
import json

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
RULES_FILE = os.path.join(ROOT, 'scripts', 'curated-image-rules.json')
PUBLIC_PRODUCTS = os.path.join(ROOT, 'public', 'assets', 'products')

with open(RULES_FILE, 'r', encoding='utf-8') as f:
    rules = json.load(f)

STOP_WORDS = {
    'the', 'a', 'an', 'of', 'de', 'du', 'la', 'le', 'les', 'pour', 'for', 'par',
    'et', 'and', 'in', 'on', 'with', 'to', 'by', 'at', 'from', 'd', 'l'
}

FLANKER_WORDS = {
    'extreme', 'fraiche', 'eau fraiche', 'paradis', 'rocks', 'elixir', 'parfum',
    'absolu', 'cologne', 'intense', 'black', 'gold', 'white', 'rose', 'extract',
    'flame', 'royal', 'candy', 'splash', 'noir', 'silver', 'blue', 'green', 'red',
    'night', 'sport', 'qahwa', 'zanzibar', 'tous', 'moi', 'iris', 'black iris',
    '46', '53', '45', '11', '10', '01', '02', '03', '04', '05', '06', '07', '08',
    'woman', 'femme', 'man', 'homme', 'extrait', 'edp', 'edt', 'cologne', 'soie',
    'hair', 'mist', 'velvet', 'crystal', 'prive', 'amber', 'cuir', 'leather'
}

def normalize(text: str) -> str:
    t = text.lower().replace('ё', 'е')
    t = re.sub(r'[^a-z0-9а-я\s]', ' ', t)
    return re.sub(r'\s+', ' ', t).strip()

def extract_tokens(name: str, brand_hints: list) -> list:
    norm = normalize(name)
    raw_tokens = norm.split()
    
    # Filter out brand tokens from model name tokens
    brand_tokens = set()
    for b in brand_hints:
        for bt in normalize(b).split():
            brand_tokens.add(bt)
    
    tokens = []
    for t in raw_tokens:
        if t in STOP_WORDS:
            continue
        # Preserve numbers (01, 02, 46, 53, 540, etc.)
        if t.isdigit():
            tokens.append(t)
        elif len(t) >= 3 and t not in brand_tokens:
            tokens.append(t)
        elif len(t) == 2 and t in {'pm', 'am', 'ii', 'iv', 'vi', 'no'}:
            tokens.append(t)
            
    return tokens

# Verify which images actually exist on disk
valid_rules = []
for r in rules:
    fpath = os.path.join(PUBLIC_PRODUCTS, r['file'])
    if os.path.exists(fpath) and os.path.getsize(fpath) > 1000:
        valid_rules.append(r)

print(f"Total existing valid image rules: {len(valid_rules)}")

# Re-compute 'must' tokens for each rule based on full name
refined_rules = []
for r in valid_rules:
    name = r.get('name', '')
    brands = r.get('anyBrand', [])
    tokens = extract_tokens(name, brands)
    
    # If tokens were empty (e.g. name only had brand words), fallback to existing must
    if not tokens:
        tokens = r.get('must', [])
    
    refined_rules.append({
        'name': r['name'],
        'file': r['file'],
        'anyBrand': r.get('anyBrand', []),
        'must': tokens,
        'exclude': list(r.get('exclude', []))
    })

# Group by brand to detect base vs flanker relationships
brand_groups = {}
for r in refined_rules:
    bkey = tuple(sorted(r.get('anyBrand', [])))
    brand_groups.setdefault(bkey, []).append(r)

# For each rule, if other rules in the same brand have the exact same tokens + flanker tokens,
# add those flanker tokens to exclude of the base rule!
for bkey, b_rules in brand_groups.items():
    for base_rule in b_rules:
        base_set = set(base_rule['must'])
        if not base_set:
            continue
        
        # Check if other rules are strict supersets of base_rule['must']
        excludes = set(base_rule.get('exclude', []))
        for other in b_rules:
            if other['file'] == base_rule['file']:
                continue
            other_set = set(other['must'])
            # If other contains all base tokens plus additional flanker tokens
            if base_set.issubset(other_set) and len(other_set) > len(base_set):
                diff = other_set - base_set
                # If the difference contains flanker words, exclude them in base
                for d in diff:
                    if d in FLANKER_WORDS or len(d) >= 3 or d.isdigit():
                        excludes.add(d)
        
        if excludes:
            base_rule['exclude'] = sorted(list(excludes))

# Sort rules:
# 1. Rules with more 'must' tokens first
# 2. Rules with excludes after flankers
refined_rules.sort(key=lambda r: (-len(r['must']), len(r.get('exclude', [])), r['name']))

with open(RULES_FILE, 'w', encoding='utf-8') as f:
    json.dump(refined_rules, f, ensure_ascii=False, indent=2)

print(f"Refined {len(refined_rules)} rules and saved to {RULES_FILE}")
