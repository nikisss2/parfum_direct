import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductBySlug, fetchRelated, listItemToPerfume } from '../api/catalog';
import { VolumeOption, Perfume } from '../types';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
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
} from 'lucide-react';

function volumeShortLabel(vol: VolumeOption): string {
  if (vol.type === 'bottle') return 'Флакон';
  if (vol.label) return vol.label;
  return `${vol.volumeMl} мл`;
}

export const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart, isInWishlist, toggleWishlist } = useShop();

  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [relatedPerfumes, setRelatedPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVolume, setSelectedVolume] = useState<VolumeOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Compute unique volumes unconditionally before any early returns
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
      if (window.scrollY > 200) {
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

  // Guaranteed safe non-null volume
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
          <div className="aspect-[4/5] bg-zinc-100 rounded-none" />
          <div className="space-y-4">
            <div className="h-8 bg-zinc-100 rounded-none w-2/3" />
            <div className="h-32 bg-zinc-100 rounded-none" />
          </div>
        </div>
      </div>
    );
  }

  if (!perfume) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold font-serif text-zinc-900">Товар не найден</h1>
        <Link
          to="/catalog"
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white rounded-none text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          В каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 sm:pb-10">
      <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-4 sm:mb-6 overflow-x-auto">
        <Link to="/" className="hover:text-zinc-900 shrink-0">Главная</Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <Link to="/catalog" className="hover:text-zinc-900 shrink-0">Каталог</Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="text-zinc-900 font-medium truncate">{perfume.brand}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        <div className="space-y-4">
          <div className="relative aspect-[4/5] rounded-none overflow-hidden bg-zinc-50 border border-zinc-200">
            <img
              src={perfume.images[activeImageIndex] || perfume.images[0] || '/assets/placeholder-product.svg'}
              alt={`${perfume.brand} ${perfume.name}`}
              className="w-full h-full object-cover"
              decoding="async"
              onError={e => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/assets/placeholder-product.svg';
              }}
            />
            <button
              onClick={() => toggleWishlist(perfume.id, perfume)}
              className={`absolute top-4 right-4 w-10 h-10 rounded-none border border-zinc-200 flex items-center justify-center transition-colors ${
                isFavorite ? 'bg-black text-white border-black' : 'bg-white text-zinc-700 hover:border-black'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-zinc-400 font-mono">
              <span>{perfume.kindLabel}</span>
              <span>·</span>
              <span>{perfume.genderLabel}</span>
              {perfume.sku && (
                <>
                  <span>·</span>
                  <span>Арт. {perfume.sku}</span>
                </>
              )}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-2">{perfume.brand}</div>
            <h1 className="text-2xl sm:text-4xl font-normal font-serif text-zinc-950 mt-1">{perfume.name}</h1>
            <div className="mt-3 flex items-center gap-2 text-xs font-mono">
              <Star className="w-4 h-4 fill-black text-black" />
              <span className="font-bold">{perfume.rating}</span>
              <span className="text-zinc-400">({perfume.reviewsCount} отзывов)</span>
            </div>
          </div>

          <div className="p-6 rounded-none bg-zinc-50 border border-zinc-200 space-y-5">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-zinc-900">
              <span>{isPerfume ? 'Выберите объём' : 'Фасовка'}</span>
              {isPerfume && <span className="text-zinc-500 font-mono font-normal">{pricePerMl} ₽ / мл</span>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {uniqueVolumes.map(vol => (
                <button
                  key={vol.type}
                  type="button"
                  onClick={() => setSelectedVolume(vol)}
                  className={`p-3.5 rounded-none border text-left text-xs transition-colors ${
                    currentVolume.type === vol.type
                      ? 'border-black bg-black text-white'
                      : 'border-zinc-300 bg-white text-zinc-900 hover:border-black'
                  }`}
                >
                  <div className="font-bold uppercase tracking-wider">{volumeShortLabel(vol)}</div>
                  <div className="font-mono font-bold mt-1.5">{vol.price.toLocaleString('ru-RU')} ₽</div>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-2xl sm:text-3xl font-black font-mono">
                {(currentVolume.price * quantity).toLocaleString('ru-RU')} ₽
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex border border-zinc-300 rounded-none bg-white">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-11 flex items-center justify-center hover:bg-zinc-100 font-bold text-sm">−</button>
                  <span className="w-10 h-11 flex items-center justify-center text-xs font-bold font-mono border-x border-zinc-300">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-11 flex items-center justify-center hover:bg-zinc-100 font-bold text-sm">+</button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 sm:flex-none px-8 py-3.5 rounded-none text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
                    addedSuccess ? 'bg-emerald-600 text-white' : 'bg-black hover:bg-zinc-800 text-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {addedSuccess ? 'Добавлено!' : 'В корзину'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2.5 p-3.5 border border-zinc-200 bg-white rounded-none">
              <Camera className="w-4 h-4 text-zinc-900 shrink-0" />
              <span className="font-semibold uppercase tracking-wider text-[11px]">Фото перед отправкой</span>
            </div>
            <div className="flex items-center gap-2.5 p-3.5 border border-zinc-200 bg-white rounded-none">
              <ShieldCheck className="w-4 h-4 text-zinc-900 shrink-0" />
              <span className="font-semibold uppercase tracking-wider text-[11px]">100% Оригинал</span>
            </div>
            <div className="flex items-center gap-2.5 p-3.5 border border-zinc-200 bg-white rounded-none">
              <Truck className="w-4 h-4 text-zinc-900 shrink-0" />
              <span className="font-semibold uppercase tracking-wider text-[11px]">Доставка по РФ</span>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200">
            <h2 className="text-sm font-bold uppercase mb-2">Описание</h2>
            <p className="text-sm text-zinc-600 leading-relaxed">{perfume.description}</p>
          </div>

          {isPerfume && perfume.notes && (perfume.notes.top?.length > 0 || perfume.notes.heart?.length > 0 || perfume.notes.base?.length > 0) && (
            <div className="pt-6 border-t border-zinc-200 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900">
                  Ольфакторная пирамида
                </h2>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#5A6B32] font-semibold bg-[#5A6B32]/10 px-2 py-0.5 border border-[#5A6B32]/30">
                  Fragrantica Verified
                </span>
              </div>

              <div className="space-y-3.5 bg-zinc-50 p-4 border border-zinc-200">
                {perfume.notes.top?.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                      <span>🌿 Верхние ноты</span>
                      <span className="text-[10px] text-zinc-400">Первые 15 минут</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {perfume.notes.top.map(n => (
                        <Link
                          key={n}
                          to={`/catalog?notes=${encodeURIComponent(n)}`}
                          className="px-2.5 py-1 text-xs border border-zinc-300 bg-white hover:border-black hover:bg-black hover:text-white transition-colors font-medium text-zinc-800"
                          title={`Смотреть все ароматы с нотой «${n}»`}
                        >
                          {n}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {perfume.notes.heart?.length > 0 && (
                  <div className="space-y-1.5 pt-2.5 border-t border-zinc-200">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                      <span>🌸 Ноты сердца</span>
                      <span className="text-[10px] text-zinc-400">Звучание 2–6 часов</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {perfume.notes.heart.map(n => (
                        <Link
                          key={n}
                          to={`/catalog?notes=${encodeURIComponent(n)}`}
                          className="px-2.5 py-1 text-xs border border-zinc-300 bg-white hover:border-black hover:bg-black hover:text-white transition-colors font-medium text-zinc-800"
                          title={`Смотреть все ароматы с нотой «${n}»`}
                        >
                          {n}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {perfume.notes.base?.length > 0 && (
                  <div className="space-y-1.5 pt-2.5 border-t border-zinc-200">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                      <span>🪵 Базовые ноты / Шлейф</span>
                      <span className="text-[10px] text-zinc-400">Стойкость до 24 часов</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {perfume.notes.base.map(n => (
                        <Link
                          key={n}
                          to={`/catalog?notes=${encodeURIComponent(n)}`}
                          className="px-2.5 py-1 text-xs border border-zinc-300 bg-white hover:border-black hover:bg-black hover:text-white transition-colors font-medium text-zinc-800"
                          title={`Смотреть все ароматы с нотой «${n}»`}
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

      {relatedPerfumes.length > 0 && (
        <section className="mt-16 pt-10 border-t border-zinc-200">
          <h2 className="text-xl font-bold font-serif mb-6">Похожие товары</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedPerfumes.map(rp => (
              <ProductCard key={rp.id} perfume={rp} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky Bottom Bar */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-black shadow-[0_-4px_25px_rgba(0,0,0,0.12)] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 px-4 sm:px-6 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
            {/* Desktop: Product info */}
            <div className="hidden sm:flex items-center gap-3 min-w-0">
              <img
                src={perfume.images[0] || '/assets/placeholder-product.svg'}
                alt=""
                className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-none border border-zinc-200 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold text-zinc-400 truncate tracking-wider">
                  {perfume.brand}
                </div>
                <div className="text-xs sm:text-sm font-bold text-zinc-900 truncate">
                  {perfume.name}
                </div>
              </div>
            </div>

            {/* Mobile: Price & Selected Volume */}
            <div className="sm:hidden flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] uppercase font-bold text-zinc-500 font-mono truncate">
                  {volumeShortLabel(currentVolume)}
                </span>
                <span className="text-[10px] text-zinc-400">·</span>
                <span className="text-[10px] text-emerald-600 font-mono font-bold">В наличии</span>
              </div>
              <div className="text-base font-black font-mono text-zinc-950 leading-tight">
                {(currentVolume.price * quantity).toLocaleString('ru-RU')} ₽
              </div>
            </div>

            {/* Volume selector & CTA */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Desktop volume chips */}
              <div className="hidden md:flex items-center gap-1 bg-zinc-100 p-1 rounded-none border border-zinc-200">
                {uniqueVolumes.map(vol => (
                  <button
                    key={vol.type}
                    type="button"
                    onClick={() => setSelectedVolume(vol)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-none transition-all ${
                      currentVolume.type === vol.type
                        ? 'bg-black text-white'
                        : 'text-zinc-600 hover:text-black'
                    }`}
                  >
                    {volumeShortLabel(vol)}
                  </button>
                ))}
              </div>

              {/* Mobile Volume select dropdown */}
              <select
                aria-label="Выбрать объём"
                value={currentVolume.type}
                onChange={e => {
                  const found = uniqueVolumes.find(v => v.type === e.target.value);
                  if (found) setSelectedVolume(found);
                }}
                className="md:hidden text-[11px] bg-zinc-100 border border-zinc-300 rounded-none px-2 py-2.5 font-bold uppercase tracking-wider outline-none text-zinc-900"
              >
                {uniqueVolumes.map(vol => (
                  <option key={vol.type} value={vol.type}>
                    {volumeShortLabel(vol)} — {vol.price.toLocaleString('ru-RU')} ₽
                  </option>
                ))}
              </select>

              <div className="text-right hidden sm:block">
                <div className="text-sm sm:text-base font-black font-mono text-zinc-950">
                  {(currentVolume.price * quantity).toLocaleString('ru-RU')} ₽
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className={`px-5 sm:px-7 py-3 rounded-none text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-md ${
                  addedSuccess ? 'bg-emerald-600 text-white' : 'bg-black hover:bg-zinc-800 text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{addedSuccess ? 'Добавлено!' : 'В корзину'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
