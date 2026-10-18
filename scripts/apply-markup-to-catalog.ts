import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  applyMarkupToProduct,
  calculateRetailPrice,
  isPerfumeProduct,
  isArabianPerfume,
} from '../server/pricing.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const CATALOG_PATH = path.join(ROOT, 'data', 'catalog.json');
const CUSTOM_CATALOG_PATH = path.join(ROOT, 'data', 'catalog.custom.json');
const PERFUMES_JSON_PATH = path.join(ROOT, 'src', 'data', 'perfumes.json');

export function applyMarkupToAllCatalogs() {
  console.log('--- 🚀 НАЧАЛО ПОЛНОГО ОБНОВЛЕНИЯ ЦЕН (ПРИМЕНЕНИЕ НАЦЕНКИ) ---');

  // 1. Обновление data/catalog.json
  if (fs.existsSync(CATALOG_PATH)) {
    console.log(`\n[1/3] Обработка основного каталога: ${CATALOG_PATH}`);
    const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
    const products = catalog.products || [];

    let updatedPerfumes = 0;
    let updatedArabian = 0;
    let unchangedOther = 0;
    let totalVolumesUpdated = 0;

    for (const prod of products) {
      const isPerf = isPerfumeProduct(prod.kind, prod.category);
      const isArab = isArabianPerfume(prod.category, prod.brand, prod.name);
      if (isPerf) {
        if (isArab) updatedArabian++;
        else updatedPerfumes++;
      } else {
        unchangedOther++;
      }
      applyMarkupToProduct(prod);
      if (Array.isArray(prod.volumes)) {
        totalVolumesUpdated += prod.volumes.length;
      }
    }

    const allPrices = products.map((p: any) => p.minPrice || 0);
    catalog.meta = {
      ...catalog.meta,
      markupApplied: true,
      pricingRule: 'tier_markup_2026_10',
      priceMax: Math.max(...allPrices, 100000),
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog), 'utf-8');
    console.log(`✅ data/catalog.json: ${products.length} товаров (${totalVolumesUpdated} объемов) успешно обновлено!`);
  }

  // 2. Обновление data/catalog.custom.json (пользовательские/кастомные товары, включая Creed Aventus)
  if (fs.existsSync(CUSTOM_CATALOG_PATH)) {
    console.log(`\n[2/3] Обработка кастомного каталога: ${CUSTOM_CATALOG_PATH}`);
    const customData = JSON.parse(fs.readFileSync(CUSTOM_CATALOG_PATH, 'utf-8'));
    const customProducts = customData.products || [];

    for (const prod of customProducts) {
      applyMarkupToProduct(prod);
    }

    fs.writeFileSync(CUSTOM_CATALOG_PATH, JSON.stringify(customData, null, 2), 'utf-8');
    console.log(`✅ data/catalog.custom.json: ${customProducts.length} кастомных товаров обновлено!`);
  }

  // 3. Обновление src/data/perfumes.json (клиентский каталог)
  if (fs.existsSync(PERFUMES_JSON_PATH)) {
    console.log(`\n[3/3] Обработка клиентского каталога: ${PERFUMES_JSON_PATH}`);
    const rawData = JSON.parse(fs.readFileSync(PERFUMES_JSON_PATH, 'utf-8'));
    const isArray = Array.isArray(rawData);
    const perfumes = isArray ? rawData : (rawData.perfumes || rawData.products || []);

    let clientPerfumesUpdated = 0;
    for (const prod of perfumes) {
      applyMarkupToProduct(prod);
      clientPerfumesUpdated++;
    }

    fs.writeFileSync(PERFUMES_JSON_PATH, JSON.stringify(rawData), 'utf-8');
    console.log(`✅ src/data/perfumes.json: ${clientPerfumesUpdated} товаров успешно обновлено!`);
  }

  console.log('\n🎉 ВСЕ КАТАЛОГИ УСПЕШНО ОБНОВЛЕНЫ С НОВОЙ НАЦЕНКОЙ!');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  applyMarkupToAllCatalogs();
}
