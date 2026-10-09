import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { groupProductsByModel, type CatalogFile, type CatalogProduct } from '../server/catalogStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CATALOG_PATH = path.join(ROOT, 'data', 'catalog.json');

export function compileCatalog() {
  console.log('Loading raw catalog...');
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error('File data/catalog.json not found!');
    return;
  }

  const raw = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8')) as CatalogFile;
  console.log(`Grouping ${raw.products.length} products...`);

  const { grouped } = groupProductsByModel(raw.products);
  console.log(`Grouped into ${grouped.length} master products.`);

  const compiledProducts = grouped.map((p: CatalogProduct) => {
    const isDefaultUnsplash = p.images?.length === 1 && p.images[0].includes('images.unsplash.com');
    return {
      id: p.id,
      sku: p.sku,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      kind: p.kind,
      kindLabel: p.kindLabel,
      category: p.category,
      categoryName: p.categoryName,
      gender: p.gender,
      genderLabel: p.genderLabel,
      concentration: p.concentration || undefined,
      description: p.description && !p.description.endsWith('— другое, оригинальная продукция.') ? p.description : undefined,
      images: isDefaultUnsplash ? [] : p.images,
      notes: p.notes,
      allNotes: p.allNotes?.length ? p.allNotes : undefined,
      longevity: p.longevity,
      sillage: p.sillage,
      isHit: p.isHit || undefined,
      isNew: p.isNew || undefined,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      minPrice: p.minPrice,
      oldPrice: p.oldPrice,
      discountPercent: p.discountPercent,
      volumes: p.volumes,
      _hitPriority: p._hitPriority || undefined,
    };
  });

  const out = {
    meta: {
      ...raw.meta,
      count: compiledProducts.length,
      isCompiled: true,
    },
    products: compiledProducts,
  };

  const jsonStr = JSON.stringify(out);
  fs.writeFileSync(CATALOG_PATH, jsonStr, 'utf-8');
  console.log(`Compiled catalog written to data/catalog.json (${(jsonStr.length / 1024 / 1024).toFixed(2)} MB)`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  compileCatalog();
}
