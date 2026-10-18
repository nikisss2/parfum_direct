import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PUBLIC_KEY = 'https://disk.yandex.ru/d/i8sg6AFzNo6krA';
const DEST_DIR = path.resolve('public', 'assets', 'gallery', 'real-orders');

if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

async function getItems() {
  const metaUrl = `https://cloud-api.yandex.net/v1/disk/public/resources?public_key=${encodeURIComponent(PUBLIC_KEY)}&limit=100`;
  const res = await fetch(metaUrl);
  const data = await res.json() as any;
  return data._embedded?.items || [];
}

async function getDownloadHref(filePath: string) {
  const url = `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(PUBLIC_KEY)}&path=${encodeURIComponent(filePath)}`;
  const res = await fetch(url);
  const data = await res.json() as any;
  return data.href;
}

async function main() {
  console.log('Получаем список файлов с Яндекс.Диска...');
  const items = await getItems();
  console.log(`Найдено ${items.length} файлов`);

  // Отбираем 15 качественных фото разных форматов
  const targetItems = items.slice(0, 20);

  for (let i = 0; i < targetItems.length; i++) {
    const item = targetItems[i];
    const ext = path.extname(item.name) || '.jpg';
    const filename = `order-real-${String(i + 1).padStart(2, '0')}${ext}`;
    const dest = path.join(DEST_DIR, filename);

    if (fs.existsSync(dest) && fs.statSync(dest).size > 50000) {
      console.log(`[${i + 1}/${targetItems.length}] Уже скачано: ${filename}`);
      continue;
    }

    try {
      console.log(`[${i + 1}/${targetItems.length}] Запрос ссылки для ${item.name}...`);
      const href = await getDownloadHref(item.path);
      if (!href) {
        console.warn(`Нет ссылки для ${item.name}`);
        continue;
      }
      execSync(`curl -L --retry 3 --max-time 30 -s "${href}" -o "${dest}"`);
      const size = fs.existsSync(dest) ? fs.statSync(dest).size : 0;
      console.log(`  -> Успешно скачано ${filename} (${Math.round(size / 1024)} КБ)`);
    } catch (err: any) {
      console.error(`Ошибка при скачивании ${item.name}:`, err.message);
    }
  }

  console.log('Загрузка реальных фотографий заказов завершена!');
}

main().catch(console.error);
