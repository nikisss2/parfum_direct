import json

RULES_FILE = 'scripts/curated-image-rules.json'

with open(RULES_FILE, 'r', encoding='utf-8') as f:
    rules = json.load(f)

# Fix specific rules
fixed_rules = []
for r in rules:
    f = r.get('file', '')
    name = r.get('name', '')
    
    # 1. Rabanne Paco
    if f == 'rabanne-paco.jpg':
        r['must'] = ['paco']
        r['exclude'] = ['million', 'invictus', 'phantom', 'fame', 'olympea', 'pure xs', 'black xs', 'pour homme', 'pour elle', 'calandre', 'metal']
    
    # 2. Armaf White Imperiale
    elif 'white-imperiale' in f:
        r['must'] = ['armaf', 'imperiale']
    
    # 3. YSL Y
    elif f == 'yves-saint-laurent-y.jpg':
        r['must'] = ['y']
        r['anyBrand'] = ['ysl', 'saint laurent', 'yves saint']
        r['exclude'] = ['black opium', 'libre', 'mon paris', 'manifesto', 'cinema', 'opiume', 'la nuit', 'homme', 'kouros', 'jazz', 'myslf', 'm7']

    # 4. Givenchy Pi
    elif f == 'givenchy-pi.jpg':
        r['must'] = ['pi']
        r['anyBrand'] = ['givenchy']
        r['exclude'] = ['linterdit', 'gentleman', 'ange', 'organza', 'amarige', 'irresistible']

    # 5. YSL M7
    elif f == 'yves-saint-laurent-m7.jpg':
        r['must'] = ['m7']
        r['anyBrand'] = ['ysl', 'saint laurent', 'yves saint']

    # 6. Clive Christian No 1
    elif f == 'clive-christian-no-1.jpg':
        r['must'] = ['no 1']
        r['anyBrand'] = ['clive christian']

    # 7. Xerjoff P 33
    elif f == 'xerjoff-p-33.jpg':
        r['must'] = ['p 33']
        r['anyBrand'] = ['xerjoff']

    # 8. Pure brand collisions with no model tokens
    elif f in ['carolina-herrera-carolina-herrera.jpg', 'carolina-herrera-carolina-herrera-by-carolina-herrera.jpg', 'dior-dior-dior.jpg', 'dolce-gabbana-dolce-gabbana.jpg', 'dolce-gabbana-dolce.jpg']:
        # Skip generic self-named duplicates that would match all brand items
        continue
    elif f in ['dolce-gabbana-q-by-dolce-gabbana.jpg']:
        r['must'] = ['q by']
    elif f in ['dolce-gabbana-k-by-dolce-gabbana.jpg']:
        r['must'] = ['k by']
    
    # Exclusions for 1 Million base
    if f == 'rabanne-1-million.jpg':
        r['must'] = ['million']
        r['exclude'] = ['royal', 'elixir', 'lucky', 'black', 'golden', 'prive', 'intense', 'night', 'pac', 'absolutely']

    fixed_rules.append(r)

with open(RULES_FILE, 'w', encoding='utf-8') as f:
    json.dump(fixed_rules, f, ensure_ascii=False, indent=2)

print(f"Cleaned rules count: {len(fixed_rules)}")
