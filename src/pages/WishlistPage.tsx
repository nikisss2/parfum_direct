import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { fetchProductsByIds, fetchProducts } from '../api/catalog';
import { Perfume, VolumeOption } from '../types';
import { ProductCard } from '../components/ProductCard';
import {
  Heart,
  Share2,
  Copy,
  Check,
  Send,
  ShoppingBag,
  Trash2,
  ArrowRight,
  BookmarkCheck,
} from 'lucide-react';

const PLACEHOLDER = '/assets/placeholder-product.svg';

interface WishlistCardProps {
  perfume: Perfume;
  onRemove: (id: string) => void;
  onAddToCart: (perfume: Perfume, volume: VolumeOption) => void;
}

const WishlistCard: React.FC<WishlistCardProps> = ({ perfume, onRemove, onAddToCart }) => {
  const defaultVolume: VolumeOption = perfume.volumes?.[0] || {
    type: 'standard',
    label: '100 мл',
    volumeMl: 100,
    price: perfume.minPrice || 0,
    inStock: true,
  };

  const [selectedVolume, setSelectedVolume] = useState<VolumeOption>(defaultVolume);
  const [isAdded, setIsAdded] = useState(false);

  const uniqueVolumes = useMemo(() => {
    const map = new Map<string, VolumeOption>();
    for (const v of perfume.volumes || []) {
      const key = v.label || `${v.volumeMl} мл`;
      const existing = map.get(key);
      if (!existing || v.price > existing.price) {
        map.set(key, v);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.volumeMl - b.volumeMl || a.price - b.price);
  }, [perfume.volumes]);

  useEffect(() => {
    if (uniqueVolumes.length > 0) {
      setSelectedVolume(uniqueVolumes[0]);
    }
  }, [uniqueVolumes]);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(perfume, selectedVolume);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  const currentPrice = selectedVolume?.price ?? perfume.minPrice ?? 0;
  const productUrl = `/product/${perfume.slug || perfume.id}`;

  return (
    // Clean White Card matching Reference 4 (Zero grey box, borderless)
    <div className="bg-white p-2 sm:p-3 relative flex flex-col justify-between group transition-all duration-300 select-none">
      <div>
        {/* Top Floating Area: Brand Kicker & Remove Button */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] sm:text-[11px] font-normal tracking-[0.14em] uppercase text-zinc-400">
            {perfume.genderLabel || 'Селектив'}
          </span>

          <button
            onClick={() => onRemove(perfume.id)}
            aria-label="Удалить из избранного"
            className="w-8 h-8 rounded-full bg-zinc-50 hover:bg-zinc-100 text-zinc-400 hover:text-black flex items-center justify-center transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Flacon Image on Pure White Background */}
        <Link to={productUrl} className="block relative aspect-square my-2 flex items-center justify-center overflow-hidden bg-white">
          <img
            src={perfume.images?.[0] || PLACEHOLDER}
            alt={`${perfume.brand || ''} ${perfume.name || ''}`}
            className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300 ease-out"
            loading="lazy"
            decoding="async"
            onError={e => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = PLACEHOLDER;
            }}
          />
        </Link>

        {/* Volume selector chips */}
        {uniqueVolumes.length > 1 && (
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap my-2">
            {uniqueVolumes.slice(0, 4).map(vol => {
              const isSelected = selectedVolume?.type === vol.type;
              return (
                <button
                  key={vol.type}
                  type="button"
                  onClick={() => setSelectedVolume(vol)}
                  className={`px-2.5 py-1 rounded-full text-[11px] transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-black text-white font-medium shadow-xs'
                      : 'bg-zinc-100/80 hover:bg-zinc-200/80 text-zinc-700 font-normal'
                  }`}
                >
                  {vol.label || `${vol.volumeMl} мл`}
                </button>
              );
            })}
          </div>
        )}

        {/* Product Info */}
        <div className="mt-2 space-y-0.5">
          <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-zinc-950 truncate">
            {perfume.brand}
          </div>

          <Link
            to={productUrl}
            className="block text-xs sm:text-sm font-light text-zinc-700 leading-snug line-clamp-2 hover:text-black transition-colors text-delicate"
          >
            {perfume.name}
          </Link>
        </div>
      </div>

      {/* Bottom Area: Price & Add to Cart button (Responsive: stacked on mobile, inline on sm+) */}
      <div className="mt-3 pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="text-sm sm:text-base font-semibold text-zinc-950 tabular-nums whitespace-nowrap">
          {currentPrice.toLocaleString('ru-RU')} ₽
        </span>

        <button
          type="button"
          onClick={handleAdd}
          className={`w-full sm:w-auto h-8 sm:h-9 px-3 sm:px-4 rounded-full bg-black text-white hover:bg-zinc-800 active:scale-[0.98] text-[11px] sm:text-xs font-medium uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap transition-all ${
            isAdded ? 'bg-emerald-700 hover:bg-emerald-800' : ''
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="whitespace-nowrap">В корзине</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">В корзину</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const WishlistPage: React.FC = () => {
  const {
    wishlist,
    toggleWishlist,
    importWishlist,
    clearWishlist,
    addToCart,
    showToast,
  } = useShop();

  const [searchParams, setSearchParams] = useSearchParams();

  const sharedItemsParam = searchParams.get('items');
  const sharedIds = useMemo(() => {
    if (!sharedItemsParam) return [];
    return sharedItemsParam
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }, [sharedItemsParam]);

  const isViewingShared = useMemo(() => {
    if (sharedIds.length === 0) return false;
    if (sharedIds.length !== wishlist.length) return true;
    return sharedIds.some(id => !wishlist.includes(id));
  }, [sharedIds, wishlist]);

  const activeIds = useMemo(() => {
    if (sharedIds.length > 0) return sharedIds;
    return wishlist;
  }, [sharedIds, wishlist]);

  const [products, setProducts] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularHits, setPopularHits] = useState<Perfume[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (activeIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchProductsByIds(activeIds)
      .then(items => {
        if (!cancelled) {
          setProducts(items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeIds]);

  useEffect(() => {
    if (activeIds.length === 0) {
      fetchProducts({ isHit: true, limit: 4 })
        .then(res => {
          setPopularHits(
            res.items.map(item => ({
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
              images: [item.image || PLACEHOLDER],
              notes: item.notes || { top: [], heart: [], base: [] },
              allNotes: item.allNotes || [],
              minPrice: item.minPrice,
              volumes: item.volumes,
              rating: item.rating,
              reviewsCount: item.reviewsCount,
            }))
          );
        })
        .catch(() => {});
    }
  }, [activeIds.length]);

  const shareableUrl = useMemo(() => {
    const idsToShare = activeIds.length > 0 ? activeIds : wishlist;
    if (idsToShare.length === 0) return '';
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}#/wishlist?items=${encodeURIComponent(idsToShare.join(','))}`;
  }, [activeIds, wishlist]);

  const handleCopyLink = useCallback(async () => {
    if (!shareableUrl) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareableUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareableUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedLink(true);
      showToast(
        'Ссылка скопирована',
        'Отправьте её друзьям или сохраните в заметках',
        'success'
      );
      setTimeout(() => setCopiedLink(false), 2400);
    } catch {
      showToast('Ошибка', 'Не удалось скопировать ссылку', 'error');
    }
  }, [shareableUrl, showToast]);

  const handleShareTelegram = useCallback(() => {
    if (!shareableUrl) return;
    const text = 'Мой вишлист ароматов в Maison Arôme:';
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareableUrl)}&text=${encodeURIComponent(text)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  }, [shareableUrl]);

  const handleSendToManager = useCallback(() => {
    if (products.length === 0) return;
    const listLines = products
      .map((p, idx) => {
        const v = p.volumes?.[0]?.label || '100 мл';
        const price = p.minPrice ? `${p.minPrice.toLocaleString('ru-RU')} ₽` : '';
        return `${idx + 1}. ${p.brand} ${p.name} (${v}) — ${price}`;
      })
      .join('\n');

    const totalEst = products.reduce((acc, p) => acc + (p.minPrice || 0), 0);

    const message =
      `Здравствуйте! Хочу заказать ароматы из вишлиста:\n\n` +
      `${listLines}\n\n` +
      `Итого ориентировочно: ~${totalEst.toLocaleString('ru-RU')} ₽\n` +
      `Ссылка на вишлист: ${shareableUrl || window.location.href}`;

    const tgUrl = `https://t.me/nikisss2?text=${encodeURIComponent(message)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  }, [products, shareableUrl]);

  const handleAddAllToCart = useCallback(() => {
    if (products.length === 0) return;
    products.forEach(p => {
      const vol = p.volumes?.[0] || {
        type: 'standard',
        label: '100 мл',
        volumeMl: 100,
        price: p.minPrice || 0,
        inStock: true,
      };
      addToCart(p, vol, 1);
    });
    showToast(
      'Все товары в корзине',
      `Добавлено ${products.length} ароматов в корзину`,
      'success'
    );
  }, [products, addToCart, showToast]);

  const handleImportShared = useCallback(() => {
    if (sharedIds.length === 0) return;
    importWishlist(sharedIds);
    setSearchParams({});
  }, [sharedIds, importWishlist, setSearchParams]);

  const handleRemoveItem = useCallback(
    (id: string) => {
      if (isViewingShared) {
        const next = sharedIds.filter(x => x !== id);
        if (next.length > 0) {
          setSearchParams({ items: next.join(',') });
        } else {
          setSearchParams({});
        }
      } else {
        toggleWishlist(id);
      }
    },
    [isViewingShared, sharedIds, setSearchParams, toggleWishlist]
  );

  const totalEstimate = useMemo(() => {
    return products.reduce((sum, p) => sum + (p.minPrice || 0), 0);
  }, [products]);

  return (
    <div className="min-h-screen bg-white">
      {/* Shared banner if viewing a shared list */}
      {isViewingShared && (
        <div className="bg-[#F7F7F8] border-b border-zinc-200/70 px-4 py-3 sm:py-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
            <div className="flex items-center gap-3">
              <BookmarkCheck className="w-5 h-5 shrink-0 text-black" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-zinc-950">
                  Список желаний по ссылке ({activeIds.length} позиций)
                </p>
                <p className="text-[11px] text-zinc-500 font-light text-delicate">
                  Сохраните подборку в свой профиль или согласуйте доставку
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleImportShared}
                className="pill-btn-black py-2 px-4 rounded-full text-xs font-light shadow-2xs"
              >
                Сохранить в моё избранное
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-zinc-200/70 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-normal uppercase tracking-[0.16em] text-zinc-400">
                Maison Arôme Wishlist
              </span>
              <h1 className="text-2xl sm:text-4xl font-light text-zinc-950 mt-0.5 tracking-tight">
                {isViewingShared ? 'Список желаний по ссылке' : 'Список желаний'}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 font-light mt-1 text-delicate">
                {products.length > 0
                  ? `${products.length} позиций на сумму от ${totalEstimate.toLocaleString('ru-RU')} ₽`
                  : 'Сохраняйте понравившиеся ароматы, чтобы познакомиться с ними позже'}
              </p>
            </div>

            {/* Sharing & Bulk Actions */}
            {products.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="pill-btn-outline py-2 px-4 rounded-full text-xs font-light flex items-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Скопировано!' : 'Поделиться'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendToManager}
                  className="pill-btn-outline py-2 px-4 rounded-full text-xs font-light flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Заказать в TG</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddAllToCart}
                  className="pill-btn-black py-2 px-5 rounded-full text-xs font-medium flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Добавить всё в корзину</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white p-4 animate-pulse space-y-3">
                <div className="aspect-square bg-zinc-100 rounded-[24px]" />
                <div className="h-3 bg-zinc-100 rounded-full w-1/2" />
                <div className="h-4 bg-zinc-100 rounded-full w-3/4" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="max-w-xl mx-auto py-16 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-zinc-100 flex items-center justify-center">
              <Heart className="w-7 h-7 text-zinc-400 stroke-[1.5]" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-light text-zinc-950">
                Ваш список желаний пуст
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 font-light leading-relaxed text-delicate">
                Нажимайте на сердечко в каталоге или карточке товара, чтобы сохранить понравившиеся флаконы и распивы.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/catalog"
                className="pill-btn-black py-3 px-8 rounded-full text-xs font-light inline-flex items-center gap-2"
              >
                <span>Перейти в каталог</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {popularHits.length > 0 && (
              <div className="pt-14 text-left border-t border-zinc-200/70">
                <h3 className="text-xs uppercase tracking-[0.16em] font-normal text-zinc-400 mb-6">
                  Популярные композиции для вдохновения
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                  {popularHits.map(hit => (
                    <ProductCard key={hit.id} perfume={hit} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {/* Pure White Borderless Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {products.map(perfume => (
                <WishlistCard
                  key={perfume.id}
                  perfume={perfume}
                  onRemove={handleRemoveItem}
                  onAddToCart={(p, v) => addToCart(p, v, 1)}
                />
              ))}
            </div>

            {/* Bottom Controls */}
            <div className="p-5 sm:p-6 rounded-[24px] bg-[#F7F7F8] border border-zinc-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-xs text-zinc-500 font-light text-delicate">
                <Share2 className="w-4 h-4 text-zinc-700" />
                <span>Ссылка сохраняет актуальный состав вишлиста и готова к отправке в мессенджерах.</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Очистить весь список желаний?')) {
                      clearWishlist();
                    }
                  }}
                  className="text-xs text-zinc-400 hover:text-black transition-colors font-light"
                >
                  Очистить список
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="pill-btn-black py-2.5 px-6 rounded-full text-xs font-light"
                >
                  {copiedLink ? 'Скопировано!' : 'Скопировать ссылку'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
