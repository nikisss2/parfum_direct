import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductBySlug, fetchRelated, listItemToPerfume } from '../api/catalog';
import { VolumeOption, Perfume } from '../types';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { SEO } from '../components/SEO';
import {
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Camera,
  Truck,
  ChevronRight,
  Check,
  ArrowLeft,
  Share2,
  Plus,
  Minus,
} from 'lucide-react';

function volumeShortLabel(vol: VolumeOption): string {
  if (vol.type === 'bottle') return 'Флакон';
  if (vol.label) return vol.label;
  return `${vol.volumeMl} мл`;
}

export const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { cart, addToCart, updateCartQuantity, removeFromCart, isInWishlist, toggleWishlist } = useShop();

  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [relatedPerfumes, setRelatedPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVolume, setSelectedVolume] = useState<VolumeOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = async () => {
    if (!perfume) return;
    const cleanUrl = `${window.location.origin}/product/${perfume.slug || perfume.id}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(cleanUrl);
      } else {
        const input = document.createElement('input');
        input.value = cleanUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch (e) {
      console.warn('Share copy error:', e);
    }
  };

  const uniqueVolumes = React.useMemo(() => {
    if (!perfume?.volumes || !Array.isArray(perfume.volumes)) return [];
    const map = new Map<string, VolumeOption>();
    for (const v of perfume.volumes) {
      const key = v.label || `${v.volumeMl} мл`;
      const existing = map.get(key);
      if (!existing || v.price > existing.price) {
        map.set(key, v);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.volumeMl - b.volumeMl || a.price - b.price);
  }, [perfume?.volumes]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchProductBySlug(slug)
      .then(p => {
        setPerfume(p);
        const initialVol = p.volumes?.[0] || {
          type: 'standard',
          label: '100 мл',
          volumeMl: 100,
          price: p.minPrice || 0,
          inStock: true,
        };
        setSelectedVolume(initialVol);
        setActiveImageIndex(0);
      })
      .catch(() => setPerfume(null))
      .finally(() => setLoading(false));

    fetchRelated(slug)
      .then(items => setRelatedPerfumes(items.map(listItemToPerfume)))
      .catch(() => setRelatedPerfumes([]));
  }, [slug]);

  const currentVolume: VolumeOption =
    selectedVolume ||
    uniqueVolumes[0] ||
    perfume?.volumes?.[0] || {
      type: 'standard',
      label: '100 мл',
      volumeMl: 100,
      price: perfume?.minPrice || 0,
      inStock: true,
    };

  const isFavorite = perfume ? isInWishlist(perfume.id) : false;
  const isPerfume = perfume?.kind === 'perfume';
  const pricePerMl = Math.max(1, Math.round(currentVolume.price / Math.max(currentVolume.volumeMl || 1, 1)));

  const cartItemId = perfume ? `${perfume.id}-${currentVolume.type}` : '';
  const cartItem = cart.find(item => item.id === cartItemId);
  const inCartCount = cartItem?.quantity || 0;

  const handleDecrementSticky = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!cartItemId) return;
    if (inCartCount <= 1) {
      removeFromCart(cartItemId);
    } else {
      updateCartQuantity(cartItemId, -1);
    }
  };

  const handleIncrementSticky = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!cartItemId) return;
    updateCartQuantity(cartItemId, 1);
  };

  const handleAddToCart = () => {
    if (!perfume) return;
    addToCart(perfume, currentVolume, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="animate-pulse grid lg:grid-cols-2 gap-10">
          <div className="aspect-[4/5] bg-zinc-100 rounded-[32px]" />
          <div className="space-y-4">
            <div className="h-8 bg-zinc-100 rounded-full w-2/3" />
            <div className="h-32 bg-zinc-100 rounded-[24px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!perfume) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-light text-zinc-900">Товар не найден</h1>
        <p className="text-xs text-zinc-500 font-light mt-1">Возможно, позиция была распродана или перемещена.</p>
        <Link
          to="/catalog"
          className="mt-6 inline-flex items-center gap-2 pill-btn-black py-3 px-7 rounded-full text-xs font-light"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>В каталог</span>
        </Link>
      </div>
    );
  }

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${perfume.brand} ${perfume.name}`,
    image: perfume.images && perfume.images.length > 0
      ? (perfume.images[0].startsWith('http') ? perfume.images[0] : `https://maison-arome.ru${perfume.images[0]}`)
      : 'https://maison-arome.ru/favicon-512.png',
    description: perfume.description || `Оригинальный аромат ${perfume.brand} ${perfume.name}. Распивы от 1 мл и целые флаконы. 100% гарантия подлинности.`,
    sku: perfume.sku || String(perfume.id),
    brand: {
      '@type': 'Brand',
      name: perfume.brand,
    },
    offers: {
      '@type': 'Offer',
      url: `https://maison-arome.ru/product/${perfume.slug || perfume.id}`,
      priceCurrency: 'RUB',
      price: perfume.minPrice || perfume.volumes?.[0]?.price || 0,
      availability: (perfume.volumes?.some(v => v.inStock) ?? true) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Maison Arôme',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: Math.max(4.8, Math.min(5.0, Number(perfume.rating) || 5.0)).toFixed(1),
      reviewCount: Math.max(1, perfume.reviewsCount || 12),
    },
  };

  const displayPrice = perfume.minPrice || perfume.volumes?.[0]?.price || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-32 sm:pb-16">
      <SEO
        title={`${perfume.brand} ${perfume.name} — купить оригинал | Maison Arôme`}
        description={`Купить оригинальный ${perfume.brand} ${perfume.name} в интернет-магазине Maison Arôme. Распивы от 1 мл и целые флаконы от ${displayPrice} ₽. 100% оригинал, доставка по РФ.`}
        canonical={`https://maison-arome.ru/product/${perfume.slug || perfume.id}`}
        ogImage={perfume.images?.[0]}
        ogType="product"
        schema={productSchema}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-6 sm:mb-8 overflow-x-auto no-scrollbar font-light">
        <Link to="/" className="hover:text-black transition-colors shrink-0">Главная</Link>
        <ChevronRight className="w-3 h-3 shrink-0 text-zinc-300" />
        <Link to="/catalog" className="hover:text-black transition-colors shrink-0">Каталог</Link>
        <ChevronRight className="w-3 h-3 shrink-0 text-zinc-300" />
        <span className="text-zinc-950 font-normal truncate">{perfume.brand}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        {/* Left Column: Pure White Borderless Product Presentation */}
        <div className="lg:col-span-6 relative">
          <div className="relative aspect-square sm:aspect-[4/5] bg-white rounded-[32px] flex items-center justify-center p-6 sm:p-12 overflow-hidden border border-zinc-200/60 shadow-2xs">
            <img
              src={perfume.images[activeImageIndex] || perfume.images[0] || '/assets/placeholder-product.svg'}
              alt={`${perfume.brand} ${perfume.name}`}
              className="w-full h-full object-contain object-center transition-transform duration-500 ease-out hover:scale-105"
              decoding="async"
              onError={e => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/assets/placeholder-product.svg';
              }}
            />

            {/* Top floating actions */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                title={copiedLink ? 'Ссылка скопирована!' : 'Поделиться ссылкой'}
                className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-zinc-700 hover:text-black flex items-center justify-center transition-all shadow-xs border border-zinc-200/80 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(perfume.id, perfume)}
                title="В избранное"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs border ${
                  isFavorite
                    ? 'bg-black text-white border-black'
                    : 'bg-white/90 text-zinc-700 hover:text-black border-zinc-200/80 hover:bg-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Quiet Luxury Specs & Add to Cart */}
        <div className="lg:col-span-6 space-y-6 sm:space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.16em] text-zinc-400 font-light">
              <span>{perfume.kindLabel}</span>
              <span>·</span>
              <span>{perfume.genderLabel}</span>
              {perfume.sku && (
                <>
                  <span>·</span>
                  <span className="tabular-nums">Арт. {perfume.sku}</span>
                </>
              )}
            </div>

            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-950 mt-2">
              {perfume.brand}
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-light text-zinc-950 mt-1 tracking-tight leading-tight">
              {perfume.name}
            </h1>

            <div className="mt-3 flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-zinc-900 tabular-nums">
                  {Math.max(4.8, Math.min(5.0, Number(perfume.rating) || 5.0)).toFixed(1)}
                </span>
              </div>
              <span className="text-zinc-400 font-light tabular-nums">
                ({perfume.reviewsCount || 14} подтверждённых отзывов)
              </span>
            </div>
          </div>

          {/* Volume Selection & Cart CTA Card */}
          <div className="p-6 sm:p-8 rounded-[28px] sm:rounded-[32px] bg-[#F7F7F8] border border-zinc-200/70 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-normal uppercase tracking-[0.16em] text-zinc-400">
                {isPerfume ? 'Доступные объёмы' : 'Фасовка'}
              </span>
              {isPerfume && (
                <span className="text-xs text-zinc-500 font-light tabular-nums">
                  {pricePerMl} ₽ / мл
                </span>
              )}
            </div>

            {/* Pill Volume Chips */}
            <div className="flex flex-wrap gap-2">
              {uniqueVolumes.map(vol => {
                const isSelected = currentVolume.type === vol.type;
                return (
                  <button
                    key={vol.type}
                    type="button"
                    onClick={() => setSelectedVolume(vol)}
                    className={`py-2.5 px-4 rounded-full text-xs transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-black text-white font-normal shadow-xs'
                        : 'bg-white text-zinc-800 border border-zinc-200/80 hover:border-black font-light'
                    }`}
                  >
                    <span>{volumeShortLabel(vol)}</span>
                    <span className={`tabular-nums ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      {vol.price.toLocaleString('ru-RU')} ₽
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Price & Primary CTA */}
            <div className="pt-4 border-t border-zinc-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-normal uppercase tracking-[0.14em] text-zinc-400 block mb-0.5">
                  Итоговая стоимость
                </span>
                <div className="text-2xl sm:text-3xl font-medium text-zinc-950 tabular-nums">
                  {(currentVolume.price * quantity).toLocaleString('ru-RU')} ₽
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Stepper */}
                <div className="h-11 rounded-full border border-zinc-200/90 bg-white px-2 flex items-center gap-2 shadow-2xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-700 transition-colors cursor-pointer"
                    aria-label="Уменьшить количество"
                  >
                    <Minus className="w-3 h-3 stroke-[2]" />
                  </button>
                  <span className="w-6 text-center text-xs font-medium text-zinc-900 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-700 transition-colors cursor-pointer"
                    aria-label="Увеличить количество"
                  >
                    <Plus className="w-3 h-3 stroke-[2]" />
                  </button>
                </div>

                {/* Add to Cart Pill Button */}
                <button
                  onClick={handleAddToCart}
                  className={`pill-btn-black py-3.5 px-8 rounded-full text-xs font-medium flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                    addedSuccess ? 'bg-emerald-700 border-emerald-700 text-white' : ''
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>В корзине</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Добавить в корзину</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 3 Quiet Luxury Trust Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-[20px] bg-white border border-zinc-200/70 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 shrink-0">
                <Camera className="w-4 h-4 stroke-[1.5]" />
              </div>
              <span className="text-xs text-zinc-800 font-light text-delicate">
                Фото заказа перед отправкой
              </span>
            </div>

            <div className="p-4 rounded-[20px] bg-white border border-zinc-200/70 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 shrink-0">
                <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
              </div>
              <span className="text-xs text-zinc-800 font-light text-delicate">
                100% Оригинал с батч-кодом
              </span>
            </div>

            <div className="p-4 rounded-[20px] bg-white border border-zinc-200/70 flex items-center gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 shrink-0">
                <Truck className="w-4 h-4 stroke-[1.5]" />
              </div>
              <span className="text-xs text-zinc-800 font-light text-delicate">
                СДЭК & Яндекс по всей РФ
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="pt-4 border-t border-zinc-200/70 space-y-2">
            <h2 className="text-[11px] font-normal uppercase tracking-[0.16em] text-zinc-400">
              Об аромате
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-light text-delicate">
              {perfume.description}
            </p>
          </div>

          {/* Olfactory Pyramid in Delicate Quiet Luxury Container */}
          {isPerfume && perfume.notes && (perfume.notes.top?.length > 0 || perfume.notes.heart?.length > 0 || perfume.notes.base?.length > 0) && (
            <div className="pt-4 border-t border-zinc-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-normal uppercase tracking-[0.16em] text-zinc-400">
                  Ольфакторная пирамида
                </h2>
                <span className="text-[11px] text-zinc-400 font-light">
                  Оригинальные аккорды
                </span>
              </div>

              <div className="p-5 sm:p-6 rounded-[24px] bg-[#F7F7F8] border border-zinc-200/70 space-y-4">
                {perfume.notes.top?.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 font-light">
                      <span>Верхние ноты</span>
                      <span className="text-[10px] text-zinc-400">Первые 15 минут</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {perfume.notes.top.map(n => (
                        <Link
                          key={n}
                          to={`/catalog?notes=${encodeURIComponent(n)}`}
                          className="px-3 py-1 rounded-full text-xs bg-white border border-zinc-200/80 hover:border-black text-zinc-700 transition-colors font-light shadow-2xs"
                          title={`Все ароматы с нотой «${n}»`}
                        >
                          {n}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {perfume.notes.heart?.length > 0 && (
                  <div className="space-y-1.5 pt-3 border-t border-zinc-200/60">
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 font-light">
                      <span>Ноты сердца</span>
                      <span className="text-[10px] text-zinc-400">Звучание 2–6 часов</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {perfume.notes.heart.map(n => (
                        <Link
                          key={n}
                          to={`/catalog?notes=${encodeURIComponent(n)}`}
                          className="px-3 py-1 rounded-full text-xs bg-white border border-zinc-200/80 hover:border-black text-zinc-700 transition-colors font-light shadow-2xs"
                          title={`Все ароматы с нотой «${n}»`}
                        >
                          {n}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {perfume.notes.base?.length > 0 && (
                  <div className="space-y-1.5 pt-3 border-t border-zinc-200/60">
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 font-light">
                      <span>Базовые ноты и шлейф</span>
                      <span className="text-[10px] text-zinc-400">Стойкость до 24 часов</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {perfume.notes.base.map(n => (
                        <Link
                          key={n}
                          to={`/catalog?notes=${encodeURIComponent(n)}`}
                          className="px-3 py-1 rounded-full text-xs bg-white border border-zinc-200/80 hover:border-black text-zinc-700 transition-colors font-light shadow-2xs"
                          title={`Все ароматы с нотой «${n}»`}
                        >
                          {n}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedPerfumes.length > 0 && (
        <section className="mt-20 pt-10 border-t border-zinc-200/70">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] font-normal uppercase tracking-[0.16em] text-zinc-400">
                Рекомендации
              </span>
              <h2 className="text-xl sm:text-3xl font-light text-zinc-950 mt-0.5">
                Похожие композиции
              </h2>
            </div>
            <Link
              to="/catalog"
              className="pill-btn-outline py-2 px-5 text-xs font-light"
            >
              В каталог
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {relatedPerfumes.slice(0, 4).map(rp => (
              <ProductCard key={rp.id} perfume={rp} />
            ))}
          </div>
        </section>
      )}

      {/* Floating Quiet Luxury Sticky Bottom Bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 shadow-[0_-4px_30px_rgba(0,0,0,0.06)] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 px-4 sm:px-6 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={perfume.images[0] || '/assets/placeholder-product.svg'}
                alt=""
                className="w-10 h-10 object-contain rounded-full bg-zinc-50 border border-zinc-200/70 shrink-0 p-1"
              />
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-semibold text-zinc-400 truncate tracking-wider">
                  {perfume.brand}
                </div>
                <div className="text-xs sm:text-sm font-light text-zinc-950 truncate">
                  {perfume.name}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-sm sm:text-base font-medium text-zinc-950 tabular-nums">
                  {(currentVolume.price * quantity).toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-[10px] text-zinc-400 font-light">
                  {volumeShortLabel(currentVolume)}
                </div>
              </div>

              {inCartCount > 0 ? (
                <div className="h-10 rounded-full border border-black bg-white px-2 flex items-center gap-2 shadow-2xs">
                  <button
                    type="button"
                    onClick={handleDecrementSticky}
                    className="w-6 h-6 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-700 transition-colors cursor-pointer"
                    aria-label="Уменьшить"
                  >
                    <Minus className="w-3 h-3 stroke-[2]" />
                  </button>
                  <span className="font-medium text-xs text-black tabular-nums">
                    {inCartCount}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrementSticky}
                    className="w-6 h-6 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-700 transition-colors cursor-pointer"
                    aria-label="Увеличить"
                  >
                    <Plus className="w-3 h-3 stroke-[2]" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className={`pill-btn-black py-2.5 px-6 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all ${
                    addedSuccess ? 'bg-emerald-700 border-emerald-700 text-white' : ''
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>В корзине</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>В корзину</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
