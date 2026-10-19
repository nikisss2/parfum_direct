import express from 'express';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createHash, timingSafeEqual } from 'crypto';
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
import { startTelegramBot } from './telegramBot.js';

import {
  registerUser,
  loginUser,
  validateSession,
  destroySession,
  updateUserProfile,
  toClientUser,
  createOrderInDb,
  getUserOrdersFromDb,
  getAllOrdersFromDb,
  updateOrderStatusInDb,
  deleteOrderInDb,
  getAllUsersForAdmin,
  getAdminStats,
  getSecurityAudit,
  ensureAdminAccount,
  findOrderForTracking,
  getOrCreateBonusCard,
  addBonusPoints,
  useBonusPoints,
  exportOrdersToCsv,
  changeUserPasswordInDb,
  getUserCartFromDb,
  saveUserCartInDb,
  exportUserDataInDb,
  deleteUserAccountInDb,
} from './db.js';
import { syncOrderToSpreadsheets, triggerExcelUpdate, GOOGLE_SHEET_URL } from './sheetsSync.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || process.env.API_PORT || 3001);
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'parfum-admin-change-me';

const app = express();

// Trust reverse proxies (Nginx / Cloudflare / Caddy)
app.set('trust proxy', 1);

// Disable Express fingerprinting
app.disable('x-powered-by');

app.set('etag', 'strong');
app.use(compression({ level: 6 }));

// OWASP Security Headers Middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https: wss:; media-src 'self' blob:; object-src 'none'; frame-ancestors 'self';"
  );
  next();
});

// JSON body parser with limit
app.use(express.json({ limit: '15mb' }));

// Input sanitization against XSS & Prototype Pollution
function sanitizeInput(req: express.Request, _res: express.Response, next: express.NextFunction) {
  function sanitizeValue(val: any): any {
    if (typeof val === 'string') {
      return val
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:[^\s"']*/gi, '')
        .replace(/onerror\s*=\s*['"][^'"]*['"]/gi, '')
        .replace(/onload\s*=\s*['"][^'"]*['"]/gi, '');
    }
    if (Array.isArray(val)) {
      return val.map(sanitizeValue);
    }
    if (val !== null && typeof val === 'object') {
      const cleanObj: Record<string, any> = {};
      for (const [k, v] of Object.entries(val)) {
        if (k === '__proto__' || k === 'constructor' || k === 'prototype') {
          continue;
        }
        cleanObj[k] = sanitizeValue(v);
      }
      return cleanObj;
    }
    return val;
  }

  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params);
  }
  next();
}
app.use(sanitizeInput);

// ============================================================================
// DDoS И BRUTE-FORCE ЗАЩИТА (RATE LIMITING С АВТОМАТИЧЕСКИМ СБРОСОМ)
// ============================================================================
function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyPrefix?: string;
}) {
  const hits = new Map<string, { count: number; expiresAt: number }>();

  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (record.expiresAt <= now) {
        hits.delete(key);
      }
    }
  }, 120_000);
  interval.unref();

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const rawIp =
      (req.headers['cf-connecting-ip'] as string) ||
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown-ip';
    const key = `${options.keyPrefix || 'rl'}:${rawIp}`;
    const now = Date.now();

    let record = hits.get(key);
    if (!record || record.expiresAt <= now) {
      record = { count: 1, expiresAt: now + options.windowMs };
      hits.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, options.maxRequests - record.count);
    const resetSec = Math.ceil((record.expiresAt - now) / 1000);

    res.setHeader('X-RateLimit-Limit', options.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSec);

    if (record.count > options.maxRequests) {
      res.setHeader('Retry-After', resetSec);
      res.status(429).json({
        ok: false,
        error: options.message || 'Слишком много запросов. Пожалуйста, подождите немного перед повторной попыткой.',
        retryAfter: resetSec,
      });
      return;
    }

    next();
  };
}

const globalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 300,
  keyPrefix: 'global',
  message: 'Превышен лимит запросов к сайту (DDoS защита). Подождите 60 секунд.',
});

export const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  keyPrefix: 'auth',
  message: 'Слишком много попыток входа/регистрации. В целях безопасности доступ временно ограничен на 1 минуту.',
});

export const orderLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 10,
  keyPrefix: 'orders',
  message: 'Слишком частые заказы. Пожалуйста, подождите несколько минут или оформите в Telegram.',
});

app.use('/api', globalApiLimiter);

// Constant-time string comparison to prevent timing attacks
function safeCompareStrings(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  try {
    const hashA = createHash('sha256').update(a).digest();
    const hashB = createHash('sha256').update(b).digest();
    return timingSafeEqual(hashA, hashB);
  } catch {
    return false;
  }
}

function authAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = (req.headers['x-admin-token'] ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
    req.headers['x-auth-token']) as string | undefined;

  if (safeCompareStrings(token, ADMIN_TOKEN)) {
    return next();
  }
  if (token) {
    const user = validateSession(token);
    if (user && user.role === 'admin') {
      (req as any).user = user;
      return next();
    }
  }
  res.status(401).json({ error: 'Unauthorized: требуется доступ администратора' });
}

function authUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = (req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.headers['x-auth-token']) as string | undefined;
  if (!token) {
    res.status(401).json({ error: 'Необходима авторизация' });
    return;
  }
  const user = validateSession(token);
  if (!user) {
    res.status(401).json({ error: 'Сессия истекла или недействительна' });
    return;
  }
  (req as any).user = user;
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
  const brandsParam = req.query.brands || req.query.brand;
  const brands = brandsParam
    ? String(brandsParam)
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

      // Also mirror to dist if exists
      const distDir = path.join(__dirname, '..', 'dist', 'assets', 'products');
      if (fs.existsSync(path.join(__dirname, '..', 'dist'))) {
        fs.mkdirSync(distDir, { recursive: true });
        fs.writeFileSync(path.join(distDir, filename), Buffer.from(match[2], 'base64'));
      }

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

    const distDir = path.join(__dirname, '..', 'dist', 'assets', 'products');
    if (fs.existsSync(path.join(__dirname, '..', 'dist'))) {
      fs.mkdirSync(distDir, { recursive: true });
      fs.writeFileSync(path.join(distDir, filename), Buffer.from(match[2], 'base64'));
    }

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

// ============================================================================
// БЕЗОПАСНАЯ АВТОРИЗАЦИЯ, ЛИЧНЫЙ КАБИНЕТ И СЕССИИ (SQLITE)
// ============================================================================

app.post('/api/auth/register', authLimiter, (req, res) => {
  try {
    const result = registerUser(req.body || {});
    res.status(201).json({ ok: true, ...result });
  } catch (err: any) {
    res.status(400).json({ ok: false, error: err.message || 'Ошибка регистрации' });
  }
});

app.post('/api/auth/login', authLimiter, (req, res) => {
  try {
    const clientIp = ((req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || '') as string;
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400).json({ ok: false, error: 'Укажите email и пароль' });
      return;
    }
    const result = loginUser(email, password, clientIp);
    res.json({ ok: true, ...result });
  } catch (err: any) {
    res.status(400).json({ ok: false, error: err.message || 'Ошибка входа' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const token = (req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.headers['x-auth-token']) as string;
  if (!token) {
    res.status(401).json({ ok: false, error: 'Не авторизован' });
    return;
  }
  const user = validateSession(token);
  if (!user) {
    res.status(401).json({ ok: false, error: 'Сессия истекла' });
    return;
  }
  res.json({ ok: true, user: toClientUser(user) });
});

app.post('/api/auth/logout', (req, res) => {
  const token = (req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.headers['x-auth-token']) as string;
  if (token) destroySession(token);
  res.json({ ok: true });
});

app.put('/api/auth/profile', authUser, (req, res) => {
  try {
    const updated = updateUserProfile((req as any).user.id, req.body || {});
    res.json({ ok: true, user: updated });
  } catch (err: any) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.post('/api/auth/change-password', authUser, (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body || {};
    if (!oldPassword || !newPassword) {
      res.status(400).json({ ok: false, error: 'Укажите текущий и новый пароль' });
      return;
    }
    changeUserPasswordInDb((req as any).user.id, oldPassword, newPassword);
    res.json({ ok: true, message: 'Пароль успешно изменен' });
  } catch (err: any) {
    res.status(400).json({ ok: false, error: err.message || 'Ошибка смены пароля' });
  }
});

// Cart per-account sync
app.get('/api/user/cart', authUser, (req, res) => {
  try {
    const cart = getUserCartFromDb((req as any).user.id);
    res.json({ ok: true, cart });
  } catch (err: any) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.put('/api/user/cart', authUser, (req, res) => {
  try {
    const { cart } = req.body || {};
    saveUserCartInDb((req as any).user.id, cart || []);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// 152-ФЗ и GDPR: Выгрузка персональных данных (Право на доступ)
app.get('/api/user/export-data', authUser, (req, res) => {
  try {
    const data = exportUserDataInDb((req as any).user.id);
    res.setHeader('Content-Disposition', 'attachment; filename="maison-arome-user-data.json"');
    res.json({ ok: true, data });
  } catch (err: any) {
    res.status(400).json({ ok: false, error: err.message || 'Ошибка выгрузки данных' });
  }
});

// 152-ФЗ и GDPR: Удаление персональных данных и отзыв согласия (ст. 21 152-ФЗ)
app.post('/api/user/delete-account', authUser, (req, res) => {
  try {
    const result = deleteUserAccountInDb((req as any).user.id);
    res.json({ ok: true, ...result });
  } catch (err: any) {
    res.status(400).json({ ok: false, error: err.message || 'Ошибка удаления аккаунта' });
  }
});

// ============================================================================
// ЗАКАЗЫ: СОХРАНЕНИЕ В СЕРВЕРНУЮ БД И ИСТОРИЯ
// ============================================================================

app.post('/api/orders', orderLimiter, async (req, res) => {
  try {
    const orderData = req.body;
    if (!orderData || !orderData.items?.length) {
      res.status(400).json({ ok: false, error: 'Корзина пуста' });
      return;
    }

    // Если есть токен авторизации, привязываем заказ к аккаунту
    const token = (req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.headers['x-auth-token']) as string | undefined;
    let userId = orderData.userId;
    if (token) {
      const sessionUser = validateSession(token);
      if (sessionUser) {
        userId = sessionUser.id;
      }
    }

    const created = createOrderInDb({
      ...orderData,
      userId,
    });

    // Автоматическое списание баллов при наличии
    if (userId && Number(orderData.bonusPointsUsed) > 0) {
      try {
        useBonusPoints(userId, Number(orderData.bonusPointsUsed), created.id);
      } catch (e) {
        console.error('Ошибка списания бонусов при заказе:', e);
      }
    }

    // Автоматическая запись заказа в Excel (.xlsx) и Google Sheets
    syncOrderToSpreadsheets(created).catch(e => console.warn('Spreadsheet sync error:', e));

    // Отправляем мгновенное уведомление в Telegram менеджеру
    try {
      await sendOrderNotification(created);
    } catch (e) {
      console.error('Ошибка отправки уведомления в Telegram:', e);
    }

    res.status(201).json({ ok: true, order: created });
  } catch (err: any) {
    res.status(400).json({ ok: false, error: err.message || 'Ошибка оформления заказа' });
  }
});

app.get('/api/user/orders', (req, res) => {
  const token = (req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.headers['x-auth-token']) as string | undefined;
  const user = token ? validateSession(token) : null;
  const email = (req.query.email as string) || user?.email;
  const userId = user?.id || (req.query.userId as string);

  if (!userId && !email) {
    res.json({ ok: true, orders: [] });
    return;
  }
  const orders = getUserOrdersFromDb(userId, email);
  res.json({ ok: true, orders });
});

// Публичный трекер заказов для клиентов (автоматизация отслеживания)
app.get('/api/orders/track', (req, res) => {
  const q = (req.query.q as string || '').trim();
  if (!q) {
    res.status(400).json({ ok: false, error: 'Укажите номер заказа или телефон' });
    return;
  }
  const order = findOrderForTracking(q);
  if (!order) {
    res.status(404).json({ ok: false, error: 'Заказ не найден. Проверьте номер или свяжитесь с менеджером в Telegram: @nikisss2' });
    return;
  }
  res.json({
    ok: true,
    order: {
      orderNumber: order.orderNumber,
      date: order.date,
      createdAt: order.createdAt,
      status: order.status,
      statusLabel: order.statusLabel,
      trackingNumber: order.trackingNumber,
      deliveryMethod: order.deliveryMethod,
      deliveryPrice: order.deliveryPrice,
      totalAmount: order.totalAmount,
      itemsCount: order.items?.length || 0,
      items: order.items?.map((it: any) => ({
        name: it.name,
        brand: it.brand,
        volumeLabel: it.volumeLabel,
        quantity: it.quantity,
        price: it.price,
      })),
      city: order.recipient?.city,
      address: order.recipient?.address,
      recipientName: order.recipient?.fullName?.split(' ')[0] || 'Покупатель',
    },
  });
});

// ============================================================================
// АДМИН-ПАНЕЛЬ: УПРАВЛЕНИЕ ЗАКАЗАМИ, ПОЛЬЗОВАТЕЛЯМИ И АНАЛИТИКА
// ============================================================================

app.get('/api/admin/orders', authAdmin, (req, res) => {
  const limit = Number(req.query.limit) || 200;
  const status = req.query.status as string | undefined;
  const orders = getAllOrdersFromDb(limit, status);
  res.json({ ok: true, orders });
});

app.put('/api/admin/orders/:id/status', authAdmin, (req, res) => {
  try {
    const { status, trackingNumber } = req.body || {};
    const updated = updateOrderStatusInDb(req.params.id, status, trackingNumber);
    // Keep Excel spreadsheet in sync with order status
    triggerExcelUpdate();
    res.json({ ok: true, order: updated });
  } catch (err: any) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

app.delete('/api/admin/orders/:id', authAdmin, (req, res) => {
  const ok = deleteOrderInDb(req.params.id);
  if (ok) triggerExcelUpdate();
  res.json({ ok });
});

app.get('/api/admin/users', authAdmin, (_req, res) => {
  const users = getAllUsersForAdmin();
  res.json({ ok: true, users });
});

app.get('/api/admin/stats', authAdmin, (_req, res) => {
  const stats = getAdminStats();
  res.json({ ok: true, stats });
});

app.get('/api/admin/audit', authAdmin, (_req, res) => {
  const audit = getSecurityAudit();
  res.json({ ok: true, audit });
});

app.post('/api/admin/orders', authAdmin, async (req, res) => {
  try {
    const orderData = req.body;
    if (!orderData || !orderData.items || !orderData.recipient) {
      res.status(400).json({ ok: false, error: 'Необходимо указать позиции и получателя' });
      return;
    }
    const created = createOrderInDb(orderData);
    syncOrderToSpreadsheets(created).catch(() => {});
    res.status(201).json({ ok: true, order: created });
  } catch (err: any) {
    res.status(400).json({ ok: false, error: err.message || 'Ошибка создания заказа' });
  }
});

app.post('/api/orders/notify-telegram', orderLimiter, async (req, res) => {
  const order = req.body;
  if (!order) {
    res.status(400).json({ error: 'Order body required' });
    return;
  }
  const result = await sendOrderNotification(order);
  res.json(result);
});

// Экспорт базы заказов в CSV / Excel для Google Таблиц
app.get('/api/orders/export-csv', (req, res) => {
  const token = (req.query.token as string) || (req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.headers['x-auth-token']) as string | undefined;
  if (token) {
    const user = validateSession(token);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ ok: false, error: 'Доступ разрешен только администратору' });
      return;
    }
  }
  try {
    const csvData = exportOrdersToCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="maison_arome_orders.csv"');
    res.send(csvData);
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Скачать готовый файл Excel (.xlsx) с 4 листами и формулами
app.get('/api/orders/download-xlsx', (req, res) => {
  const xlsxPath = path.resolve(__dirname, '..', 'Таблица_Заказов_Maison_Arome.xlsx');
  if (fs.existsSync(xlsxPath)) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Таблица_Заказов_Maison_Arome.xlsx"');
    res.sendFile(xlsxPath);
  } else {
    res.status(404).json({ ok: false, error: 'Файл Excel еще не создан' });
  }
});

// Бонусная программа и виртуальная карта
app.get('/api/loyalty/card', (req, res) => {
  const token = (req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.headers['x-auth-token']) as string | undefined;
  const user = token ? validateSession(token) : null;
  const userId = user?.id || (req.query.userId as string);
  if (!userId) {
    res.status(401).json({ ok: false, error: 'Требуется авторизация' });
    return;
  }
  const card = getOrCreateBonusCard(userId);
  res.json({
    ok: true,
    card,
    cardNumber: card.card_number,
    balance: Number(card.balance ?? 500),
    points: Number(card.balance ?? 500),
    tier: card.tier,
    cashbackPercent: card.cashback_percent,
    totalSpent: card.total_spent,
    orderCount: (card as any).order_count || 0,
  });
});

app.post('/api/loyalty/use', (req, res) => {
  const token = (req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.headers['x-auth-token']) as string | undefined;
  const user = token ? validateSession(token) : null;
  const userId = user?.id || req.body?.userId;
  if (!userId) {
    res.status(401).json({ ok: false, error: 'Требуется авторизация' });
    return;
  }
  const { amount, orderId } = req.body || {};
  const result = useBonusPoints(userId, Number(amount) || 0, orderId);
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
  ensureAdminAccount();
  startTelegramBot();
  const { meta } = getCatalog();
  console.log(`API http://localhost:${PORT} — товаров: ${meta.count}`);
});
