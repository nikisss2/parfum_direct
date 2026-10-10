/**
 * Скачивает фото брендов/хитов в public/assets (опционально, для офлайн и скорости).
 * npm run images:fetch
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const manifest = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'curated-image-urls.json'), 'utf-8')
) as {
  brands: Record<string, string>;
  products: { match: string[]; file: string; url: string }[];
};

function download(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const mod = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    mod
      .get(url, { headers: { 'User-Agent': 'MaisonAromeCatalog/1.0' } }, res => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlinkSync(dest);
          download(res.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          reject(new Error(`HTTP ${res.statusCode} ${url}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve()));
      })
      .on('error', err => {
        file.close();
        try {
          fs.unlinkSync(dest);
        } catch {
          /* ignore */
        }
        reject(err);
      });
  });
}

/** Fallback: те же URL, что в server/imageResolver.ts (Unsplash) */
const UNSPLASH_FALLBACK: Record<string, string> = {
  'tom-ford.jpg':
    'https://images.unsplash.com/photo-1592945403245-b0e5434874b9?auto=format&fit=crop&w=900&q=80',
  'versace.jpg':
    'https://images.unsplash.com/photo-1595425970380-9c852094a712?auto=format&fit=crop&w=900&q=80',
  'boss.jpg':
    'https://images.unsplash.com/photo-1587016490005-ef0c0a0b2f30?auto=format&fit=crop&w=900&q=80',
  'afnan.jpg':
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80',
  'armaf.jpg':
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=80',
  'burberry.jpg':
    'https://images.unsplash.com/photo-1541647601244-99a0401921a3?auto=format&fit=crop&w=900&q=80',
  'mancera.jpg':
    'https://images.unsplash.com/photo-1615634267032-b3ad4644468c?auto=format&fit=crop&w=900&q=80',
  'clive-christian.jpg':
    'https://images.unsplash.com/photo-1619994403073-2d3a36f0c4b2?auto=format&fit=crop&w=900&q=80',
  'dior.jpg':
    'https://images.unsplash.com/photo-1587016490005-ef0c0a0b2f30?auto=format&fit=crop&w=900&q=80',
  'thomas-kosmala.jpg':
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=80',
  'chanel.jpg':
    'https://images.unsplash.com/photo-1541647601244-99a0401921a3?auto=format&fit=crop&w=900&q=80',
  'ysl.jpg':
    'https://images.unsplash.com/photo-1595425970380-9c852094a712?auto=format&fit=crop&w=900&q=80',
  'kilian.jpg':
    'https://images.unsplash.com/photo-1615634267032-b3ad4644468c?auto=format&fit=crop&w=900&q=80',
  'creed.jpg':
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=80',
  'xerjoff.jpg':
    'https://images.unsplash.com/photo-1619994403073-2d3a36f0c4b2?auto=format&fit=crop&w=900&q=80',
  'lattafa.jpg':
    'https://images.unsplash.com/photo-1592945403245-b0e5434874b9?auto=format&fit=crop&w=900&q=80',
  'montale.jpg':
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=900&q=80',
  'initio.jpg':
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80',
  'byredo.jpg':
    'https://images.unsplash.com/photo-1541647601244-99a0401921a3?auto=format&fit=crop&w=900&q=80',
  'parfums-de-marly.jpg':
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=80',
  'maison-francis.jpg':
    'https://images.unsplash.com/photo-1619994403073-2d3a36f0c4b2?auto=format&fit=crop&w=900&q=80',
};

const brandFiles: Record<string, string> = {
  'tom ford': 'tom-ford.jpg',
  versace: 'versace.jpg',
  'hugo boss': 'boss.jpg',
  boss: 'boss.jpg',
  afnan: 'afnan.jpg',
  armaf: 'armaf.jpg',
  burberry: 'burberry.jpg',
  mancera: 'mancera.jpg',
  'clive christian': 'clive-christian.jpg',
  dior: 'dior.jpg',
  'thomas kosmala': 'thomas-kosmala.jpg',
  chanel: 'chanel.jpg',
  'yves saint': 'ysl.jpg',
  kilian: 'kilian.jpg',
  creed: 'creed.jpg',
  xerjoff: 'xerjoff.jpg',
  lattafa: 'lattafa.jpg',
  montale: 'montale.jpg',
  initio: 'initio.jpg',
  byredo: 'byredo.jpg',
  'parfums de marly': 'parfums-de-marly.jpg',
  'maison francis': 'maison-francis.jpg',
};

async function main() {
  let ok = 0;
  let fail = 0;

  for (const [key, file] of Object.entries(brandFiles)) {
    const dest = path.join(ROOT, 'public', 'assets', 'brands', file);
    const primary = manifest.brands[key];
    const fallback = UNSPLASH_FALLBACK[file];
    try {
      await download(primary, dest);
      ok++;
      console.log('OK brand', file);
    } catch {
      try {
        await download(fallback, dest);
        ok++;
        console.log('OK brand (fallback unsplash)', file);
      } catch (e) {
        fail++;
        console.warn('FAIL brand', file, e);
      }
    }
  }

  for (const item of manifest.products) {
    const dest = path.join(ROOT, 'public', 'assets', 'products', item.file);
    try {
      await download(item.url, dest);
      ok++;
      console.log('OK product', item.file);
    } catch (e) {
      fail++;
      console.warn('FAIL product', item.file, e);
    }
  }

  console.log(`Done: ${ok} saved, ${fail} failed`);
}

main();
