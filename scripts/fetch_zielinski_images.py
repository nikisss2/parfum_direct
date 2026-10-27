# -*- coding: utf-8 -*-
"""
Парсер и загрузчик оригинальных фотографий Zielinski & Rozen с Fragrantica в высоком разрешении.
"""

import os
import re
import json
import time
import cloudscraper
from bs4 import BeautifulSoup

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_PRODUCTS = os.path.join(ROOT, 'public', 'assets', 'products')
os.makedirs(PUBLIC_PRODUCTS, exist_ok=True)

scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'darwin', 'mobile': False})
HEADERS = {
    'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
    'Referer': 'https://www.google.com/',
}

def clean_slug(s):
    s = s.lower().replace('&', 'and').replace('+', 'and')
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s

def fetch_and_save_zielinski():
    url = 'https://www.fragrantica.ru/designers/Zielinski-Rozen.html'
    print(f"Запрос страницы бренда Zielinski & Rozen: {url}")
    resp = scraper.get(url, headers=HEADERS)
    if resp.status_code != 200:
        print(f"Ошибка получения страницы: HTTP {resp.status_code}")
        return []

    soup = BeautifulSoup(resp.text, 'html.parser')
    perfumes = []
    seen = set()

    for a in soup.find_all('a', href=True):
        if '/perfume/Zielinski-Rozen/' in a['href']:
            img = a.find('img')
            name = a.text.strip() or (img.get('alt') if img else '')
            src = img.get('src') if img else None
            if not name or not src:
                continue

            first_line = name.split('\n')[0].strip()
            first_line = re.sub(r'\s+', ' ', first_line.replace('Zielinski & Rozen', '').replace('perfume', '').strip())
            if not first_line or first_line in seen:
                continue
            seen.add(first_line)

            # Высокое разрешение: заменяем превью на 375x500
            hi_res_url = src.replace('perfume-thumbs/270x270.', 'perfume/375x500.').replace('perfume-thumbs/m.', 'perfume/375x500.')
            # Убираем query params
            hi_res_url = hi_res_url.split('?')[0]

            perfumes.append({
                'name': first_line,
                'url': a['href'],
                'img_url': hi_res_url,
                'slug': clean_slug(first_line)
            })

    print(f"Найдено уникальных ароматов Zielinski & Rozen: {len(perfumes)}")

    saved_rules = []
    # Загружаем существующие правила
    rules_path = os.path.join(ROOT, 'scripts', 'curated-image-rules.json')
    curated_rules = []
    if os.path.exists(rules_path):
        with open(rules_path, 'r', encoding='utf-8') as f:
            curated_rules = json.load(f)

    # Удаляем старые правила Zielinski если были
    curated_rules = [r for r in curated_rules if not ('zielinski' in (r.get('name') or '').lower() or any('zielinski' in b.lower() for b in r.get('anyBrand', [])))]

    for idx, p in enumerate(perfumes, 1):
        filename = f"zielinski-rozen-{p['slug']}.jpg"
        dest_path = os.path.join(PUBLIC_PRODUCTS, filename)

        if not os.path.exists(dest_path):
            print(f"[{idx}/{len(perfumes)}] Скачивание: {p['name']} -> {filename}")
            try:
                img_resp = scraper.get(p['img_url'], headers=HEADERS)
                if img_resp.status_code == 200 and len(img_resp.content) > 1000:
                    with open(dest_path, 'wb') as f:
                        f.write(img_resp.content)
                    print(f"  OK ({len(img_resp.content)} байт)")
                else:
                    # Попробуем скачать миниатюру если 375x500 недоступен
                    fallback_url = p['img_url'].replace('perfume/375x500.', 'perfume-thumbs/270x270.')
                    img_resp2 = scraper.get(fallback_url, headers=HEADERS)
                    if img_resp2.status_code == 200 and len(img_resp2.content) > 1000:
                        with open(dest_path, 'wb') as f:
                            f.write(img_resp2.content)
                        print(f"  OK (миниатюра {len(img_resp2.content)} байт)")
                    else:
                        print(f"  Ошибка скачивания: HTTP {img_resp.status_code}")
                time.sleep(0.3)
            except Exception as e:
                print(f"  Исключение при скачивании: {e}")

        # Создаем правило сопоставления
        tokens = [t for t in re.findall(r'[a-z0-9]+', p['name'].lower()) if len(t) > 1 and t not in ('and', 'the', 'for', 'with', 'perfume', 'de')]
        if tokens:
            rule = {
                'name': f"Zielinski & Rozen {p['name']}",
                'file': filename,
                'anyBrand': ['zielinski', 'rozen', 'zielinski & rozen', 'зелински', 'зелинский'],
                'must': tokens
            }
            curated_rules.append(rule)
            saved_rules.append(rule)

    # Сигнатурный флакон для бренда: берем самый знаменитый "Black Pepper & Amber, Neroli"
    signature_src = os.path.join(PUBLIC_PRODUCTS, "zielinski-rozen-black-pepper-amber-neroli.jpg")
    signature_dest = os.path.join(PUBLIC_PRODUCTS, "zielinski-rozen-signature.jpg")
    if os.path.exists(signature_src) and not os.path.exists(signature_dest):
        import shutil
        shutil.copyfile(signature_src, signature_dest)
        print("Создан сигнатурный флакон: zielinski-rozen-signature.jpg")

    with open(rules_path, 'w', encoding='utf-8') as f:
        json.dump(curated_rules, f, ensure_ascii=False, indent=2)
    print(f"Сохранено {len(curated_rules)} правил в curated-image-rules.json (добавлено {len(saved_rules)} для Zielinski)")

    return saved_rules

if __name__ == '__main__':
    fetch_and_save_zielinski()
