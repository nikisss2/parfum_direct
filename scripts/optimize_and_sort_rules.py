import json
import re

RULES_FILE = 'scripts/curated-image-rules.json'

with open(RULES_FILE, 'r', encoding='utf-8') as f:
    rules = json.load(f)

print(f"Total rules before optimization: {len(rules)}")

# 1. Deduplicate by file and must
deduped = []
seen_keys = set()
for r in rules:
    key = (r.get('file'), tuple(sorted(r.get('must', []))))
    if key not in seen_keys:
        seen_keys.add(key)
        deduped.append(r)

print(f"Deduped rules: {len(deduped)}")

# 2. Add specific flanker exclusions to base models
# Group by base token family (e.g. 'million', 'sauvage', 'male', 'khamrah', 'asad', 'yara', 'aventus')
FLANKER_FAMILIES = {
    'million': ['royal', 'elixir', 'lucky', 'black', 'golden', 'prive', 'intense', 'night', 'absolutely', 'pac', 'cologne'],
    'sauvage': ['elixir', 'eau'],
    'le male': ['elixir', 'parfum', 'ultra', 'beau', 'lover', 'pride', 'collector'],
    'khamrah': ['qahwa', 'dukhan'],
    'asad': ['zanzibar'],
    'yara': ['candy', 'tous', 'moi'],
    'invictus': ['victory', 'platinum', 'parfum', 'aqua', 'legend', 'onyx'],
    'phantom': ['parfum', 'intense', 'legion'],
    'fame': ['parfum', 'intense'],
    'olympea': ['flora', 'blossom', 'solar', 'legend', 'aqua'],
    'pure xs': ['night'],
    'black xs': ['lexces', 'potion', 'afrodisiac', 'be a legend', 'los angeles'],
    'interlude': ['black iris', '53'],
    'reflection': ['45'],
    'honor': ['43'],
    'jubilation': ['40', 'xxv'],
    'dia': ['40'],
    'epic': ['56'],
}

for r in deduped:
    must_str = ' '.join(r.get('must', [])).lower()
    for base_word, flankers in FLANKER_FAMILIES.items():
        # If rule is for the base model (contains base_word, but none of the flankers)
        if base_word in must_str and not any(fl in must_str for fl in flankers):
            existing_ex = set(r.get('exclude', []))
            for fl in flankers:
                existing_ex.add(fl)
            r['exclude'] = sorted(existing_ex)

# 3. Sort rules: most specific MUST length first, then longer names
def rule_specificity_score(r):
    must = r.get('must', [])
    exclude = r.get('exclude', [])
    # Rules with more tokens are more specific and must be checked first
    score = len(must) * 10
    if exclude:
        # Base rules with exclusions should be checked after flankers
        score -= len(exclude) * 2
    return score

deduped.sort(key=rule_specificity_score, reverse=True)

with open(RULES_FILE, 'w', encoding='utf-8') as f:
    json.dump(deduped, f, ensure_ascii=False, indent=2)

print(f"Optimized and sorted {len(deduped)} rules in {RULES_FILE}")
