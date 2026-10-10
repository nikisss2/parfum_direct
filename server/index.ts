import express from 'express';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import {
  appendCustomProduct,
  deleteCustomProduct,
  getCatalog,
  getPopularNotes,
  queryProducts,
  reloadCatalog,
  searchBrands,
  type CatalogProduct,
  type ProductKind,
} from './catalogStore.js';
import { resolveProductImage, withResolvedImage } from './imageResolver.js';
import {
  getTelegramConfig,
  saveTelegramConfig,
  sendTelegramMessage,
  sendOrderNotification,
} from './telegramNotifier.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || process.env.API_PORT || 3001);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'parfum-admin-change-me';

const app = express();
app.set('etag', 'strong');
app.use(compression({ level: 6 }));
app.use(express.json({ limit: '15mb' }));

function authAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers['x-admin-token'] || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (token !== ADMIN_TOKEN) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/meta', (_req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=1200');
  const { meta } = getCatalog();
  res.json(meta);
});

app.get('/api/products', (req, res) => {
  const brands = req.query.brands
    ? String(req.query.brands)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    : undefined;

  const notes = req.query.notes
    ? String(req.query.notes)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    : undefined;

  const result = queryProducts({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 24,
    q: req.query.q ? String(req.query.q) : undefined,
    kind: (req.query.kind as ProductKind) || 'all',
    category: req.query.category ? String(req.query.category) : undefined,
    gender: req.query.gender ? (String(req.query.gender) as 'all' | 'female' | 'male' | 'unisex') : 'all',
    brands,
    notes,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    sort: (req.query.sort as 'popular') || 'popular',
    isHit: req.query.isHit === '1' || req.query.isHit === 'true',
    isNew: req.query.isNew === '1' || req.query.isNew === 'true',
    isSale: req.query.isSale === '1' || req.query.isSale === 'true',
  });
  res.json(result);
});

app.get('/api/products/slug/:slug', (req, res) => {
  const { bySlug } = getCatalog();
  const product = bySlug.get(req.params.slug);
  if (!product) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(
    withResolvedImage({
      ...product,
      notes: product.notes ?? { top: [], heart: [], base: [] },
      allNotes: product.allNotes ?? [],
      concentration: product.concentration ?? (product.kind === 'perfume' ? 'Eau de Parfum' : ''),
    })
  );
});

app.get('/api/products/item/:id', (req, res) => {
  const { byId } = getCatalog();
  const product = byId.get(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(
    withResolvedImage({
      ...product,
      notes: product.notes ?? { top: [], heart: [], base: [] },
      allNotes: product.allNotes ?? [],
      concentration: product.concentration ?? (product.kind === 'perfume' ? 'Eau de Parfum' : ''),
    })
  );
});

app.get('/api/products/related/:slug', (req, res) => {
  const { bySlug, products } = getCatalog();
  const product = bySlug.get(req.params.slug);
  if (!product) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const related = products
    .filter(p => p.id !== product.id && (p.kind === product.kind || p.brand === product.brand))
    .slice(0, 8)
    .map(p => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      minPrice: p.minPrice,
      image: resolveProductImage(p),
      kindLabel: p.kindLabel,
      genderLabel: p.genderLabel,
      categoryName: p.categoryName,
      rating: p.rating,
      reviewsCount: p.reviewsCount,
      isHit: p.isHit,
      isNew: p.isNew,
      volumes: p.volumes,
    }));
  res.json(related);
});

app.post('/api/products/by-ids', (req, res) => {
  const ids: string[] = Array.isArray(req.body?.ids) ? req.body.ids : [];
  const { byId } = getCatalog();
  const items = ids
    .map(id => byId.get(id))
    .filter(Boolean)
    .map(p => withResolvedImage(p!));
  res.json(items);
});

app.get('/api/brands', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=180, stale-while-revalidate=600');
  res.json(
    searchBrands({
      q: req.query.q ? String(req.query.q) : undefined,
      kind: req.query.kind as ProductKind | undefined,
      limit: req.query.limit ? Number(req.query.limit) : 80,
    })
  );
});

app.get('/api/notes', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=1200');
  const limit = req.query.limit ? Number(req.query.limit) : 100;
  res.json(getPopularNotes({ limit }));
});

app.post('/api/admin/reload', authAdmin, (_req, res) => {
  reloadCatalog();
  res.json({ ok: true, meta: getCatalog().meta });
});

app.post('/api/admin/products', authAdmin, (req, res) => {
  const body = req.body as Partial<CatalogProduct>;
  if (!body.name?.trim() || !body.brand?.trim() || !body.sku?.trim()) {
    res.status(400).json({ error: 'name, brand, sku обязательны' });
    return;
  }

  const kind = (body.kind || 'other') as ProductKind;
  const price = Number(body.minPrice ?? body.volumes?.[0]?.price ?? 0);
  if (!Number.isFinite(price) || price <= 0) {
    res.status(400).json({ error: 'Укажите цену' });
    return;
  }

  const hash = createHash('md5').update(body.sku).digest('hex').slice(0, 8);
  const id = body.id || `p-${hash}-${body.sku}`;
  const slug =
    body.slug ||
    `${body.brand}-${body.name}`
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 160) +
      `-${body.sku}`;

  const vol = body.volumes?.[0] ?? {
    type: 'unit',
    label: '1 шт.',
    volumeMl: 1,
    price: Math.round(price),
    inStock: true,
  };

  const product: CatalogProduct = {
    id,
    sku: String(body.sku),
    slug,
    name: body.name.trim(),
    brand: body.brand.trim(),
    kind,
    kindLabel: body.kindLabel || kind,
    category: body.category || kind,
    categoryName: body.categoryName || body.kindLabel || kind,
    gender: body.gender || 'unisex',
    genderLabel: body.genderLabel || 'Унисекс',
    concentration: body.concentration,
    description: body.description || body.name,
    images: body.images?.length ? body.images : ['https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80'],
    allNotes: body.allNotes || [],
    notes: body.notes,
    longevity: body.longevity,
    sillage: body.sillage,
    isHit: Boolean(body.isHit),
    isNew: Boolean(body.isNew),
    rating: body.rating ?? 5,
    reviewsCount: body.reviewsCount ?? 0,
    minPrice: Math.round(price),
    volumes: [{ ...vol, price: Math.round(vol.price), inStock: vol.inStock !== false }],
    custom: true,
  };

  appendCustomProduct(product);
  res.status(201).json(product);
});

app.put('/api/admin/products/:id', authAdmin, (req, res) => {
  const { id } = req.params;
  const body = req.body as Partial<CatalogProduct> & { imageData?: string; imageUrl?: string };
  const { byId } = getCatalog();
  const existing = byId.get(id);
  if (!existing) {
    res.status(404).json({ error: 'Товар не найден в каталоге' });
    return;
  }

  let finalImages = Array.isArray(body.images) && body.images.length ? [...body.images] : [...existing.images];

  if (body.imageData && typeof body.imageData === 'string' && body.imageData.startsWith('data:image/')) {
    const match = body.imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (match) {
      const ext = match[1] === 'png' ? 'png' : 'jpg';
      const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `custom-${cleanId}-${Date.now()}.${ext}`;
      const filePath = path.join(__dirname, '..', 'public', 'assets', 'products', filename);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, Buffer.from(match[2], 'base64'));
      const uploadedUrl = `/assets/products/${filename}`;
      finalImages = [uploadedUrl, ...finalImages.filter(img => img !== uploadedUrl)];
    }
  } else if (body.imageUrl && typeof body.imageUrl === 'string' && body.imageUrl.trim()) {
    const url = body.imageUrl.trim();
    finalImages = [url, ...finalImages.filter(img => img !== url)];
  }

  const minPrice = body.minPrice !== undefined
    ? Number(body.minPrice)
    : (body.volumes?.[0]?.price ?? existing.minPrice);

  const updated: CatalogProduct = {
    ...existing,
    name: body.name ? body.name.trim() : existing.name,
    brand: body.brand ? body.brand.trim() : existing.brand,
    sku: body.sku ? String(body.sku).trim() : existing.sku,
    description: body.description !== undefined ? body.description.trim() : existing.description,
    images: finalImages,
    minPrice: Math.round(minPrice),
    oldPrice: body.oldPrice ? Math.round(Number(body.oldPrice)) : undefined,
    discountPercent: body.discountPercent ? Number(body.discountPercent) : undefined,
    volumes: Array.isArray(body.volumes) && body.volumes.length ? body.volumes : existing.volumes,
    notes: body.notes || existing.notes,
    allNotes: body.allNotes || existing.allNotes,
    isHit: body.isHit !== undefined ? Boolean(body.isHit) : existing.isHit,
    isNew: body.isNew !== undefined ? Boolean(body.isNew) : existing.isNew,
    gender: body.gender || existing.gender,
    genderLabel: body.genderLabel || existing.genderLabel,
    kind: body.kind || existing.kind,
    kindLabel: body.kindLabel || existing.kindLabel,
    category: body.category || existing.category,
    categoryName: body.categoryName || existing.categoryName,
    concentration: body.concentration || existing.concentration,
    custom: true,
  };

  appendCustomProduct(updated);
  res.json({ ok: true, product: updated });
});

app.delete('/api/admin/products/:id', authAdmin, (req, res) => {
  const ok = deleteCustomProduct(req.params.id);
  if (!ok) {
    res.status(404).json({ error: 'Товар не найден или не является пользовательским' });
    return;
  }
  res.json({ ok: true });
});

app.post('/api/admin/products/:id/image', authAdmin, (req, res) => {
  const { id } = req.params;
  const { imageUrl, imageData } = (req.body || {}) as { imageUrl?: string; imageData?: string };
  let finalUrl = '';

  if (imageData && typeof imageData === 'string' && imageData.startsWith('data:image/')) {
    const match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!match) {
      res.status(400).json({ error: 'Неверный формат изображения' });
      return;
    }
    const ext = match[1] === 'png' ? 'png' : 'jpg';
    const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `custom-${cleanId}.${ext}`;
    const filePath = path.join(__dirname, '..', 'public', 'assets', 'products', filename);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, Buffer.from(match[2], 'base64'));
    finalUrl = `/assets/products/${filename}`;
  } else if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) {
    finalUrl = imageUrl.trim();
  } else {
    res.status(400).json({ error: 'Укажите imageUrl или выберите файл изображения' });
    return;
  }

  const { byId } = getCatalog();
  const existing = byId.get(id);
  if (!existing) {
    res.status(404).json({ error: 'Товар не найден в каталоге' });
    return;
  }

  const updated: CatalogProduct = {
    ...existing,
    images: [finalUrl, ...(existing.images || []).filter(img => img !== finalUrl)],
    custom: true,
  };

  appendCustomProduct(updated);
  res.json({ ok: true, product: updated });
});

app.get('/api/admin/telegram-config', authAdmin, (_req, res) => {
  res.json({ ok: true, config: getTelegramConfig() });
});

app.post('/api/admin/telegram-config', authAdmin, (req, res) => {
  const updated = saveTelegramConfig(req.body || {});
  res.json({ ok: true, config: updated });
});

app.post('/api/admin/telegram-test', authAdmin, async (_req, res) => {
  const result = await sendTelegramMessage(
    '🔔 <b>Тестовое уведомление из админ-панели Maison Arôme!</b>\n\nTelegram-бот успешно подключен и готов мгновенно присылать новые заказы в личные сообщения.',
    [[{ text: 'Открыть чат с менеджером', url: 'https://t.me/nikisss2' }]]
  );
  if (!result.ok) {
    res.status(400).json({ ok: false, error: result.error });
    return;
  }
  res.json({ ok: true });
});

app.post('/api/orders/notify-telegram', async (req, res) => {
  const order = req.body;
  if (!order) {
    res.status(400).json({ error: 'Order body required' });
    return;
  }
  const result = await sendOrderNotification(order);
  res.json(result);
});

// Статика каталога и сборки для production с долгосрочным кешированием
const dist = path.join(__dirname, '..', 'dist');
const publicDir = path.join(__dirname, '..', 'public');

if (fs.existsSync(publicDir)) {
  app.use(
    express.static(publicDir, {
      maxAge: '7d',
      setHeaders: (res, filePath) => {
        if (filePath.match(/\.(png|jpg|jpeg|webp|svg|gif|ico)$/i)) {
          res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
        }
      },
    })
  );
}

app.use(
  express.static(dist, {
    maxAge: '1y',
    immutable: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else if (filePath.match(/\.(js|css|woff2|woff|ttf)$/i)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (filePath.match(/\.(png|jpg|jpeg|webp|svg|gif|ico)$/i)) {
        res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
      }
    },
  })
);

// SPA fallback для клиентских маршрутов React Router
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexHtml = path.join(dist, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(indexHtml);
  } else {
    next();
  }
});

app.listen(PORT, () => {
  reloadCatalog();
  const { meta } = getCatalog();
  console.log(`API http://localhost:${PORT} — товаров: ${meta.count}`);
});
