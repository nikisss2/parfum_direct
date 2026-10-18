import fs from 'fs';
import path from 'path';

const DEST_DIR = path.resolve('public', 'assets', 'categories');
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

interface BeautyCategoryAsset {
  filename: string;
  url: string;
  label: string;
}

const ASSETS: BeautyCategoryAsset[] = [
  // === MAKEUP ===
  {
    filename: 'makeup-lipstick.jpg',
    url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
    label: 'Помада для губ',
  },
  {
    filename: 'makeup-lipgloss.jpg',
    url: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&fit=crop&w=800&q=80',
    label: 'Блеск для губ',
  },
  {
    filename: 'makeup-mascara.jpg',
    url: 'https://images.unsplash.com/photo-1591360236480-4ed861025fa1?auto=format&fit=crop&w=800&q=80',
    label: 'Тушь для ресниц',
  },
  {
    filename: 'makeup-foundation.jpg',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    label: 'Тональный крем',
  },
  {
    filename: 'makeup-powder.jpg',
    url: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=800&q=80',
    label: 'Компактная пудра',
  },
  {
    filename: 'makeup-eyeshadow.jpg',
    url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
    label: 'Тени для век',
  },
  {
    filename: 'makeup-blush.jpg',
    url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80',
    label: 'Румяна',
  },
  {
    filename: 'makeup-brows.jpg',
    url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
    label: 'Карандаш для бровей',
  },

  // === HAIRCARE ===
  {
    filename: 'haircare-pomade.jpg',
    url: 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80',
    label: 'Помада для волос American Crew / глина / воск',
  },
  {
    filename: 'haircare-shampoo.jpg',
    url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
    label: 'Шампунь для волос',
  },
  {
    filename: 'haircare-conditioner.jpg',
    url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80',
    label: 'Кондиционер для волос',
  },
  {
    filename: 'haircare-mask.jpg',
    url: 'https://images.unsplash.com/photo-1608248597359-25f00eef0129?auto=format&fit=crop&w=800&q=80',
    label: 'Маска для волос',
  },
  {
    filename: 'haircare-oil.jpg',
    url: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=800&q=80',
    label: 'Масло / сыворотка для волос',
  },
  {
    filename: 'haircare-spray.jpg',
    url: 'https://images.unsplash.com/photo-1522337094846-8a818192de1f?auto=format&fit=crop&w=800&q=80',
    label: 'Спрей для укладки / термозащита',
  },
  {
    filename: 'haircare-color.jpg',
    url: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
    label: 'Краска для волос Wella / Estel / Londa',
  },

  // === SKINCARE ===
  {
    filename: 'skincare-cream.jpg',
    url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    label: 'Крем для лица в стеклянной баночке',
  },
  {
    filename: 'skincare-serum.jpg',
    url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    label: 'Сыворотка для лица с пипеткой',
  },
  {
    filename: 'skincare-cleanser.jpg',
    url: 'https://images.unsplash.com/photo-1556228722-d0b5de731748?auto=format&fit=crop&w=800&q=80',
    label: 'Пенка / гель для умывания',
  },
  {
    filename: 'skincare-toner.jpg',
    url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    label: 'Тоник / лосьон для лица',
  },
  {
    filename: 'skincare-eye.jpg',
    url: 'https://images.unsplash.com/photo-1512290900672-1f41d08e583a?auto=format&fit=crop&w=800&q=80',
    label: 'Крем вокруг глаз / патчи',
  },
  {
    filename: 'skincare-mask.jpg',
    url: 'https://images.unsplash.com/photo-1567928815116-2c5e7b57fa23?auto=format&fit=crop&w=800&q=80',
    label: 'Маска для лица',
  },

  // === BODYCARE ===
  {
    filename: 'bodycare-lotion.jpg',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    label: 'Лосьон / молочко для тела',
  },
  {
    filename: 'bodycare-shower-gel.jpg',
    url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80',
    label: 'Гель для душа',
  },
  {
    filename: 'bodycare-soap.jpg',
    url: 'https://images.unsplash.com/photo-1607006314644-8840833d7b05?auto=format&fit=crop&w=800&q=80',
    label: 'Итальянское мыло Nesti Dante',
  },
  {
    filename: 'bodycare-hand-cream.jpg',
    url: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80',
    label: 'Крем для рук в тюбике',
  },
  {
    filename: 'bodycare-scrub.jpg',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    label: 'Скраб для тела',
  },

  // === PERFUME FALLBACK ===
  {
    filename: 'perfume-luxury-flacon.jpg',
    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    label: 'Флакон нишевой парфюмерии',
  },
];

async function downloadAll() {
  console.log(`Загрузка ${ASSETS.length} эталонных фотографий косметики и ухода...`);
  for (const item of ASSETS) {
    const dest = path.join(DEST_DIR, item.filename);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
      console.log(`✓ Уже существует: ${item.filename} (${item.label})`);
      continue;
    }
    try {
      const res = await fetch(item.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      console.log(`✓ Скачано: ${item.filename} (${Math.round(buf.length / 1024)} КБ) — ${item.label}`);
    } catch (err: any) {
      console.error(`✗ Ошибка для ${item.filename}:`, err.message);
    }
  }
  console.log('Готово! Все фотографии категорий сохранены в public/assets/categories/');
}

downloadAll();
