import pandas as pd
import re
import json
import hashlib
import random

# Загрузка прайс-листа
df = pd.read_excel('first-opt_23_09_26.xlsx', sheet_name='Price', header=1)
df_clean = df[['Код', 'Наименование', 'Цена']].dropna(subset=['Наименование', 'Цена']).copy()

# Базовые списки брендов
arabian_brands = ['Amouage', 'Attar Collection', 'Lattafa']
niche_brands = ['Tom Ford', 'Byredo', 'Creed', 'Kilian', 'Baccarat', 'Le Labo', 'Maison Francis Kurkdjian', 'Montale', 'Mancera', 'Tiziana Terenzi', 'Zarkoperfume', 'Xerjoff', 'Roja Dove']
known_brands = niche_brands + arabian_brands + ['Chanel', 'Dior', 'Gucci', 'Versace', 'Armand Basi', 'Burberry', 'Hugo Boss', 'Lacoste', 'Kenzo', 'Givenchy']

brand_pattern = re.compile('(?i)^(' + '|'.join(known_brands) + r')\s+')

def parse_row(name):
    brand_match = brand_pattern.search(name)
    if brand_match:
        brand = brand_match.group(1).title()
        rem = name[brand_match.end():]
    else:
        parts = name.split()
        brand = parts[0] if parts else "Unknown"
        rem = ' '.join(parts[1:])
        
    vol_match = re.search(r'(\d+(?:\.\d+)?)\s*(мл|г|g|ml)', rem, re.IGNORECASE)
    vol_str = vol_match.group(0) if vol_match else '1 шт'
    vol_num = float(vol_match.group(1)) if vol_match else 1
    
    gender_match = re.search(r'(Женский|Мужской|Унисекс)', rem, re.IGNORECASE)
    gender_str = gender_match.group(1).lower() if gender_match else 'унисекс'
    gender = 'female' if gender_str == 'женский' else 'male' if gender_str == 'мужской' else 'unisex'
    
    pname = rem[:gender_match.start()] if gender_match else rem
    pname = re.sub(r'\(.*?\)|\[.*?\]', '', pname).strip() or "Fragrance"
        
    return brand, pname, vol_str, vol_num, gender

print("Обработка строк...")
parsed = df_clean['Наименование'].apply(parse_row)
df_clean['Brand'], df_clean['Name'], df_clean['VolStr'], df_clean['VolNum'], df_clean['Gender'] = zip(*parsed)

perfumes = []
grouped = df_clean.groupby(['Brand', 'Name'])

image_pool = [
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=80'
]

print("Формирование карточек товаров...")
for (brand, name), group in grouped:
    cat = 'arabian' if brand in arabian_brands else 'niche' if brand in niche_brands else 'luxury'
    cat_name = 'Арабская' if cat == 'arabian' else 'Нишевая' if cat == 'niche' else 'Люкс'
    
    gender = group['Gender'].iloc[0]
    g_label = 'Для женщин' if gender == 'female' else 'Для мужчин' if gender == 'male' else 'Унисекс'
    
    volumes = []
    seen_types = set()
    
    for _, row in group.sort_values('VolNum').iterrows():
        v_type = f"vol_{str(row['VolStr']).strip().replace(' ', '_').replace('.', '_')}"
        if v_type not in seen_types:
            seen_types.add(v_type)
            volumes.append({
                'type': v_type,
                'label': str(row['VolStr']),
                'volumeMl': row['VolNum'],
                'price': float(row['Цена']),
                'inStock': True
            })
            
    if not volumes: continue
        
    pid = "p-" + hashlib.md5(f"{brand}-{name}".encode()).hexdigest()[:8]
    slug = re.sub(r'[^a-z0-9\-]', '', f"{brand}-{name}".lower().replace(' ', '-'))
    
    perfumes.append({
        'id': pid,
        'slug': slug,
        'name': name,
        'brand': brand,
        'category': cat,
        'categoryName': cat_name,
        'gender': gender,
        'genderLabel': g_label,
        'concentration': 'Eau de Parfum',
        'description': f"{brand} {name} - роскошный аромат, представленный в нашем каталоге. Подчеркните свою индивидуальность.",
        'images': [image_pool[int(pid[-1], 16) % len(image_pool)]],
        'notes': {'top': ['Верхние ноты'], 'heart': ['Ноты сердца'], 'base': ['Базовые ноты']},
        'allNotes': ['Верхние ноты', 'Ноты сердца', 'Базовые ноты'],
        'longevity': 4,
        'sillage': 'Средний',
        'isHit': random.random() < 0.05, # 5% товаров будут помечаться как хиты
        'isNew': random.random() < 0.05, # 5% товаров будут помечаться как новинки
        'rating': 5.0,
        'reviewsCount': 0,
        'volumes': volumes
    })

# Сохраняем в папку вашего сайта
import os
os.makedirs('src/data', exist_ok=True)
with open('src/data/perfumes.json', 'w', encoding='utf-8') as f:
    json.dump(perfumes, f, ensure_ascii=False)

print(f"Готово! Сохранено {len(perfumes)} товаров в src/data/perfumes.json")