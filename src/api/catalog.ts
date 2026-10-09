import type { Perfume, ProductKind, Gender } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';

export interface CatalogListItem {
  id: string;
  slug: string;
  sku: string;
  name: string;
  brand: string;
  kind: ProductKind;
  kindLabel: string;
  category: string;
  categoryName: string;
  gender: Gender;
  genderLabel: string;
  minPrice: number;
  oldPrice?: number;
  discountPercent?: number;
  image: string;
  isHit?: boolean;
  isNew?: boolean;
  rating: number;
  reviewsCount: number;
  volumes: Perfume['volumes'];
  notes?: Perfume['notes'];
  allNotes?: string[];
}

export interface CatalogMeta {
  importedAt: string;
  sourceFile: string;
  count: number;
  kinds: string[];
  priceMax: number;
}

export interface ProductsResponse {
  items: CatalogListItem[];
  total: number;
  page: number;
  limit: number;
  meta: CatalogMeta;
}

export type ProductsQuery = {
  page?: number;
  limit?: number;
  q?: string;
  kind?: ProductKind | 'all';
  category?: string;
  gender?: Gender | 'all';
  brands?: string[];
  notes?: string[];
  maxPrice?: number;
  sort?: 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'new';
  isHit?: boolean;
  isNew?: boolean;
  isSale?: boolean;
};

function buildQuery(params: ProductsQuery): string {
  const sp = new URLSearchParams();
  if (params.page) sp.set('page', String(params.page));
  if (params.limit) sp.set('limit', String(params.limit));
  if (params.q) sp.set('q', params.q);
  if (params.kind && params.kind !== 'all') sp.set('kind', params.kind);
  if (params.category && params.category !== 'all') sp.set('category', params.category);
  if (params.gender && params.gender !== 'all') sp.set('gender', params.gender);
  if (params.brands?.length) sp.set('brands', params.brands.join(','));
  if (params.notes?.length) sp.set('notes', params.notes.join(','));
  if (params.maxPrice != null) sp.set('maxPrice', String(params.maxPrice));
  if (params.sort) sp.set('sort', params.sort);
  if (params.isHit) sp.set('isHit', '1');
  if (params.isNew) sp.set('isNew', '1');
  if (params.isSale) sp.set('isSale', '1');
  return sp.toString();
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function listItemToPerfume(item: CatalogListItem): Perfume {
  return {
    id: item.id,
    slug: item.slug,
    sku: item.sku,
    name: item.name,
    brand: item.brand,
    kind: item.kind,
    kindLabel: item.kindLabel,
    category: item.category as Perfume['category'],
    categoryName: item.categoryName,
    gender: item.gender,
    genderLabel: item.genderLabel,
    concentration: item.kind === 'perfume' ? 'Eau de Parfum' : '',
    description: '',
    images: [item.image || '/assets/placeholder-product.svg'],
    notes: item.notes || { top: [], heart: [], base: [] },
    allNotes: item.allNotes || [],
    longevity: item.kind === 'perfume' ? 4 : undefined,
    sillage: item.kind === 'perfume' ? 'Средний' : undefined,
    isHit: item.isHit,
    isNew: item.isNew,
    rating: item.rating,
    reviewsCount: item.reviewsCount,
    minPrice: item.minPrice,
    oldPrice: item.oldPrice,
    discountPercent: item.discountPercent,
    volumes: item.volumes,
  };
}

export function fetchProducts(query: ProductsQuery) {
  const qs = buildQuery(query);
  return apiFetch<ProductsResponse>(`/api/products?${qs}`);
}

export function fetchProductBySlug(slug: string) {
  return apiFetch<Perfume>(`/api/products/slug/${encodeURIComponent(slug)}`);
}

export function fetchProductById(id: string) {
  return apiFetch<Perfume>(`/api/products/item/${encodeURIComponent(id)}`);
}

export function fetchRelated(slug: string) {
  return apiFetch<CatalogListItem[]>(`/api/products/related/${encodeURIComponent(slug)}`);
}

export function fetchProductsByIds(ids: string[]) {
  if (!ids.length) return Promise.resolve([] as Perfume[]);
  return apiFetch<Perfume[]>('/api/products/by-ids', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
}

export function fetchBrands(opts?: { q?: string; kind?: ProductKind; limit?: number }) {
  const sp = new URLSearchParams();
  if (opts?.q) sp.set('q', opts.q);
  if (opts?.kind) sp.set('kind', opts.kind);
  if (opts?.limit) sp.set('limit', String(opts.limit));
  const qs = sp.toString();
  return apiFetch<{ brand: string; count: number }[]>(`/api/brands${qs ? `?${qs}` : ''}`);
}

export function fetchPopularNotes(opts?: { limit?: number }) {
  const sp = new URLSearchParams();
  if (opts?.limit) sp.set('limit', String(opts.limit));
  const qs = sp.toString();
  return apiFetch<{ note: string; count: number }[]>(`/api/notes${qs ? `?${qs}` : ''}`);
}

export function fetchMeta() {
  return apiFetch<CatalogMeta>('/api/meta');
}

export function adminSaveProduct(token: string, product: Record<string, unknown>) {
  return apiFetch<Perfume>('/api/admin/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': token,
    },
    body: JSON.stringify(product),
  });
}

export function adminUpdateProductImage(
  token: string,
  productId: string,
  payload: { imageUrl?: string; imageData?: string }
) {
  return apiFetch<{ ok: boolean; product: Perfume }>(
    `/api/admin/products/${encodeURIComponent(productId)}/image`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token,
      },
      body: JSON.stringify(payload),
    }
  );
}

export function adminUpdateProduct(
  token: string,
  productId: string,
  payload: Record<string, unknown>
) {
  return apiFetch<{ ok: boolean; product: Perfume }>(
    `/api/admin/products/${encodeURIComponent(productId)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token,
      },
      body: JSON.stringify(payload),
    }
  );
}

export function adminDeleteProduct(token: string, productId: string) {
  return apiFetch<{ ok: boolean }>(
    `/api/admin/products/${encodeURIComponent(productId)}`,
    {
      method: 'DELETE',
      headers: {
        'x-admin-token': token,
      },
    }
  );
}

export function fetchTelegramConfig(token: string) {
  return apiFetch<{ ok: boolean; config: { enabled: boolean; botToken: string; chatId: string; managerUsername: string } }>(
    '/api/admin/telegram-config',
    {
      headers: {
        'x-admin-token': token,
      },
    }
  );
}

export function saveTelegramConfigApi(
  token: string,
  config: { enabled: boolean; botToken: string; chatId: string; managerUsername?: string }
) {
  return apiFetch<{ ok: boolean; config: any }>('/api/admin/telegram-config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': token,
    },
    body: JSON.stringify(config),
  });
}

export function sendTelegramTestApi(token: string) {
  return apiFetch<{ ok: boolean }>('/api/admin/telegram-test', {
    method: 'POST',
    headers: {
      'x-admin-token': token,
    },
  });
}
