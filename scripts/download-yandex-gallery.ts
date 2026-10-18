import https from 'https';
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.resolve('public', 'assets', 'gallery', 'real-orders');
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    function follow(currentUrl: string) {
      https.get(currentUrl, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return follow(res.headers.location);
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }
    follow(url);
  });
}

async function main() {
  const publicUrl = 'https://disk.yandex.ru/d/i8sg6AFzNo6krA';
  console.log('Запрос файлов с Яндекс.Диска...');
  const res = await fetchJson(`https://cloud-api.yandex.net/v1/disk/public/resources?public_key=${encodeURIComponent(publicUrl)}&limit=100`);
  const items = res._embedded?.items || [];
  console.log(`Найдено ${items.length} фото в папке Яндекс.Диска`);

  let count = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.file) continue;
    const ext = path.extname(item.name) || (item.mime_type?.includes('png') ? '.png' : '.jpg');
    const localName = `real-order-${String(i + 1).padStart(3, '0')}${ext}`;
    const dest = path.join(PUBLIC_DIR, localName);

    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      // already downloaded
      count++;
      continue;
    }

    try {
      console.log(`[${i + 1}/${items.length}] Скачиваем: ${item.name} -> ${localName}`);
      await downloadFile(item.file, dest);
      count++;
    } catch (err) {
      console.error(`Ошибка при скачивании ${item.name}:`, err);
    }
  }

  console.log(`Успешно скачано ${count} реальных фотографий заказов в public/assets/gallery/real-orders/!`);
}

main().catch(console.error);
