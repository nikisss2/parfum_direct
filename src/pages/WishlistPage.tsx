import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { fetchProductsByIds, fetchProducts } from '../api/catalog';
import { Perfume, VolumeOption } from '../types';
import {
  Heart,
  Share2,
  Copy,
  Check,
  Send,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ExternalLink,
  Sparkles,
  BookmarkCheck,
  RotateCcw,
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

  // Filter unique volumes
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

  const handleAdd = () => {
    onAddToCart(perfume, selectedVolume);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  const currentPrice = selectedVolume?.price ?? perfume.minPrice ?? 0;

  return (
    <div className="group relative flex flex-col bg-white border border-zinc-200 hover:border-black transition-all duration-200 p-3 sm:p-4">
      {/* Image container */}
      <div className="relative aspect-square bg-[#f4f4f5] flex items-center justify-center overflow-hidden mb-3">
        <Link to={`/product/${perfume.slug}`} className="block w-full h-full p-4">
          <img
            src={perfume.images[0] || PLACEHOLDER}
            alt={`${perfume.brand} ${perfume.name}`}
            className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            decoding="async"
            onError={e => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = PLACEHOLDER;
            }}
          />
        </Link>

        {/* Delete from wishlist button */}
        <button
          onClick={() => onRemove(perfume.id)}
          aria-label="Удалить из избранного"
          title="Удалить из избранного"
          className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 hover:bg-black hover:text-white text-zinc-500 flex items-center justify-center transition-colors border border-zinc-200"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Brand tag */}
        <div className="absolute bottom-2 left-2 pointer-events-none">
          <span className="bg-white/90 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 border border-zinc-200 text-zinc-700">
            {perfume.genderLabel || 'Унисекс'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 truncate mb-1">
            {perfume.brand}
          </div>
          <Link
            to={`/product/${perfume.slug}`}
            className="block text-sm font-serif font-medium text-zinc-950 hover:underline line-clamp-2 leading-tight"
          >
            {perfume.name}
          </Link>
        </div>

        {/* Volume selector chips */}
        {uniqueVolumes.length > 1 && (
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Объем:
            </span>
            <div className="flex flex-wrap gap-1">
              {uniqueVolumes.map(vol => {
                const isSelected = selectedVolume?.type === vol.type;
                const shortLabel = vol.label || `${vol.volumeMl} мл`;
                return (
                  <button
                    key={vol.type}
                    type="button"
                    onClick={() => setSelectedVolume(vol)}
                    className={`text-[10px] font-mono px-2 py-1 transition-all ${
                      isSelected
                        ? 'bg-black text-white font-bold'
                        : 'bg-[#f4f4f5] text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {shortLabel}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price & Add to Cart button */}
        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-base font-bold text-zinc-950">
              {currentPrice.toLocaleString('ru-RU')} ₽
            </div>
            {selectedVolume?.label && (
              <div className="text-[10px] text-zinc-400 truncate">
                {selectedVolume.label}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
              isAdded
                ? 'bg-[#5A6B32] text-white'
                : 'bg-black text-white hover:bg-zinc-800'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>В корзине</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>В корзину</span>
              </>
            )}
          </button>
        </div>
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
  const navigate = useNavigate();

  // Parse items from search params (e.g. ?items=id1,id2)
  const sharedItemsParam = searchParams.get('items');
  const sharedIds = useMemo(() => {
    if (!sharedItemsParam) return [];
    return sharedItemsParam
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }, [sharedItemsParam]);

  // Determine if viewing a shared wishlist that differs from own
  const isViewingShared = useMemo(() => {
    if (sharedIds.length === 0) return false;
    if (sharedIds.length !== wishlist.length) return true;
    return sharedIds.some(id => !wishlist.includes(id));
  }, [sharedIds, wishlist]);

  // Which IDs should we display?
  const activeIds = useMemo(() => {
    if (sharedIds.length > 0) return sharedIds;
    return wishlist;
  }, [sharedIds, wishlist]);

  const [products, setProducts] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularHits, setPopularHits] = useState<Perfume[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch active products
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

  // If empty, fetch popular hits to recommend
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

  // Generate shareable link
  const shareableUrl = useMemo(() => {
    const idsToShare = activeIds.length > 0 ? activeIds : wishlist;
    if (idsToShare.length === 0) return '';
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}#/wishlist?items=${encodeURIComponent(idsToShare.join(','))}`;
  }, [activeIds, wishlist]);

  // Copy link
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

  // Share to Telegram channel/friend
  const handleShareTelegram = useCallback(() => {
    if (!shareableUrl) return;
    const text = 'Мой вишлист ароматов в Parfum Direct ✨';
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareableUrl)}&text=${encodeURIComponent(text)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  }, [shareableUrl]);

  // Send direct order request to Telegram manager @nikisss2
  const handleSendToManager = useCallback(() => {
    if (products.length === 0) return;
    const listLines = products
      .map((p, idx) => {
        const v = p.volumes?.[0]?.label || '100 мл';
        const price = p.minPrice ? `${p.minPrice.toLocaleString('ru-RU')} ₽` : '';
        return `${idx + 1}. ${p.brand} ${p.name} (${v}) — ${price}`;
      })
      .join('\n');

    const totalEstimate = products.reduce((acc, p) => acc + (p.minPrice || 0), 0);

    const message =
      `Здравствуйте! Хочу заказать ароматы из вишлиста:\n\n` +
      `${listLines}\n\n` +
      `Итого ориентировочно: ~${totalEstimate.toLocaleString('ru-RU')} ₽\n` +
      `Ссылка на вишлист: ${shareableUrl || window.location.href}`;

    const tgUrl = `https://t.me/nikisss2?text=${encodeURIComponent(message)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  }, [products, shareableUrl]);

  // Add all items to cart
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

  // Save shared wishlist to my own wishlist
  const handleImportShared = useCallback(() => {
    if (sharedIds.length === 0) return;
    importWishlist(sharedIds);
    // Switch URL back to personal wishlist
    setSearchParams({});
  }, [sharedIds, importWishlist, setSearchParams]);

  // Switch to personal wishlist
  const handleViewPersonal = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  // Remove single item
  const handleRemoveItem = useCallback(
    (id: string) => {
      if (isViewingShared) {
        // If viewing shared link, remove from local display list and update URL
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

  // Total estimate sum
  const totalEstimate = useMemo(() => {
    return products.reduce((sum, p) => sum + (p.minPrice || 0), 0);
  }, [products]);

  return (
    <div className="min-h-screen bg-white">
      {/* Shared banner if viewing a shared list */}
      {isViewingShared && (
        <div className="bg-[#5A6B32] text-white px-4 py-3 sm:py-4 border-b border-zinc-900 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
            <div className="flex items-center gap-3">
              <BookmarkCheck className="w-5 h-5 shrink-0 text-white" />
              <div>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                  Вы просматриваете список желаний по ссылке ({activeIds.length}{' '}
                  {activeIds.length === 1 ? 'аромат' : 'ароматов'})
                </p>
                <p className="text-[11px] text-zinc-200 font-light">
                  Вы можете сохранить эту подборку в своё избранное или оформить заказ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleImportShared}
                className="px-4 py-2 bg-white text-zinc-950 hover:bg-zinc-100 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
              >
                Сохранить в моё избранное
              </button>
              <button
                type="button"
                onClick={handleViewPersonal}
                className="px-3 py-2 bg-black/30 hover:bg-black/50 text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Мой личный список ({wishlist.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumbs & Header */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-widest mb-3">
            <Link to="/" className="hover:text-black transition-colors">
              Главная
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-semibold">Список желаний</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-serif font-light text-zinc-950 uppercase tracking-tight">
                {isViewingShared ? 'Поделенный список желаний' : 'Список желаний'}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 font-light mt-1">
                {products.length > 0
                  ? `${products.length} ${
                      products.length === 1 ? 'сохраненный аромат' : 'сохраненных ароматов'
                    } на сумму от ${totalEstimate.toLocaleString('ru-RU')} ₽`
                  : 'Сохраняйте понравившиеся ароматы, чтобы не потерять их'}
              </p>
            </div>

            {/* Sharing & Bulk Actions Bar */}
            {products.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {/* Copy Link Button */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2.5 bg-white border border-zinc-300 hover:border-black text-zinc-900 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                  title="Скопировать постоянную ссылку на вишлист"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#5A6B32]" />
                      <span className="text-[#5A6B32]">Ссылка скопирована!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-600" />
                      <span>Поделиться ссылкой</span>
                    </>
                  )}
                </button>

                {/* Share to Telegram */}
                <button
                  type="button"
                  onClick={handleShareTelegram}
                  className="px-3 py-2.5 bg-[#229ED9] hover:bg-[#1E88E5] text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                  title="Отправить ссылку друзьям в Telegram"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">В Telegram</span>
                </button>

                {/* Send Order to Manager @nikisss2 */}
                <button
                  type="button"
                  onClick={handleSendToManager}
                  className="px-3.5 py-2.5 bg-[#5A6B32] hover:bg-[#4E5D2B] text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                  title="Заказать эти ароматы у менеджера в Telegram @nikisss2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Заказать в TG</span>
                </button>

                {/* Add All to Cart */}
                <button
                  type="button"
                  onClick={handleAddAllToCart}
                  className="px-4 py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
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
          /* High-performance Skeleton Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-zinc-200 p-4 animate-pulse space-y-3"
              >
                <div className="aspect-square bg-zinc-100" />
                <div className="h-3 bg-zinc-100 w-1/2" />
                <div className="h-4 bg-zinc-100 w-3/4" />
                <div className="h-8 bg-zinc-100 w-full mt-4" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <div className="max-w-xl mx-auto py-12 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-[#f4f4f5] border border-zinc-200 flex items-center justify-center">
              <Heart className="w-8 h-8 text-zinc-400 stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-serif text-zinc-950 uppercase tracking-tight">
                {isViewingShared ? 'По ссылке не найдено товаров' : 'Ваш список желаний пуст'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 font-light leading-relaxed">
                {isViewingShared
                  ? 'Возможно, ссылка устарела или содержит некорректные идентификаторы ароматов.'
                  : 'Нажимайте на сердечко в каталоге или карточке товара, чтобы сохранить понравившиеся ароматы, сравнивать их и делиться ссылкой с друзьями.'}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                to="/catalog"
                className="px-6 py-3.5 bg-black text-white hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
              >
                <span>Перейти в каталог</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/aromabox"
                className="px-6 py-3.5 bg-white border border-zinc-300 hover:border-black text-zinc-950 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-zinc-700" />
                <span>Конструктор аромабокса</span>
              </Link>
            </div>

            {/* Popular perfumes carousel / grid preview */}
            {popularHits.length > 0 && (
              <div className="pt-12 text-left border-t border-zinc-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950">
                    Популярные ароматы для вдохновения
                  </h3>
                  <Link
                    to="/catalog?isHit=1"
                    className="text-xs text-zinc-500 hover:text-black uppercase tracking-wider font-semibold"
                  >
                    Все хиты →
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {popularHits.map(hit => (
                    <div
                      key={hit.id}
                      className="border border-zinc-200 p-2.5 hover:border-black transition-colors flex flex-col justify-between"
                    >
                      <Link to={`/product/${hit.slug}`} className="block">
                        <div className="aspect-square bg-[#f4f4f5] p-2 mb-2 flex items-center justify-center">
                          <img
                            src={hit.images[0] || PLACEHOLDER}
                            alt={hit.name}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <div className="text-[10px] font-bold uppercase text-zinc-400 truncate">
                          {hit.brand}
                        </div>
                        <div className="text-xs font-serif font-medium text-zinc-950 truncate">
                          {hit.name}
                        </div>
                      </Link>
                      <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-950">
                          {(hit.minPrice ?? 0).toLocaleString('ru-RU')} ₽
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(hit.id, hit)}
                          className="p-1 text-zinc-400 hover:text-black"
                          title="Добавить в вишлист"
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Products Grid */
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
            <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50 p-4 sm:p-6">
              <div className="flex items-center gap-3 text-xs text-zinc-600">
                <Share2 className="w-4 h-4 text-zinc-500" />
                <span>
                  Этим списком можно делиться в любых мессенджерах. Ссылка сохраняет актуальные
                  позиции.
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {!isViewingShared && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Вы уверены, что хотите очистить список желаний?')) {
                        clearWishlist();
                      }
                    }}
                    className="text-xs text-zinc-400 hover:text-rose-600 transition-colors uppercase tracking-wider font-bold"
                  >
                    Очистить список
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-black text-white hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Скопировано!' : 'Скопировать ссылку'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
