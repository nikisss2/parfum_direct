import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Perfume, VolumeOption } from '../types';
import { useShop } from '../context/ShopContext';
import { Heart, ShoppingBag, Check } from 'lucide-react';

const PLACEHOLDER = '/assets/placeholder-product.svg';

interface ProductCardProps {
  perfume: Perfume;
}

const getShortVolumeLabel = (vol: VolumeOption): string => {
  if (vol.label) {
    // Сокращаем длинные названия вроде "10 мл (отливант)" или "100 мл (флакон)" до лаконичных "10 мл", "100 мл"
    const match = vol.label.match(/^(\d+(?:\.\d+)?\s*(?:мл|ml))/i);
    if (match) return match[1];
    return vol.label;
  }
  return `${vol.volumeMl} мл`;
};

export const ProductCard: React.FC<ProductCardProps> = ({ perfume }) => {
  const { addToCart, isInWishlist, toggleWishlist } = useShop();

  const defaultVolume: VolumeOption = perfume.volumes?.[0] || {
    type: 'standard',
    label: '100 мл',
    volumeMl: 100,
    price: perfume.minPrice || 0,
    inStock: true,
  };

  const [selectedVolume, setSelectedVolume] = useState<VolumeOption>(defaultVolume);
  const [isAddedAnim, setIsAddedAnim] = useState(false);
  const isFavorite = isInWishlist(perfume.id);

  React.useEffect(() => {
    if (perfume.volumes?.length) {
      setSelectedVolume(perfume.volumes[0]);
    }
  }, [perfume.id, perfume.volumes]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(perfume, selectedVolume, 1);
    setIsAddedAnim(true);
    setTimeout(() => setIsAddedAnim(false), 1600);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(perfume.id, perfume);
  };

  const currentPrice = selectedVolume?.price ?? perfume.minPrice ?? 0;

  // Дедуплицируем объемы по миллилитрам, чтобы не было "2 мл" и "2 мл (отливант)" одновременно
  const uniqueVolumes = React.useMemo(() => {
    const map = new Map<number, VolumeOption>();
    for (const v of perfume.volumes || []) {
      const ml = Math.round(v.volumeMl);
      const existing = map.get(ml);
      if (!existing || v.price < existing.price) {
        map.set(ml, v);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.volumeMl - b.volumeMl || a.price - b.price);
  }, [perfume.volumes]);

  // На карточке товара в каталоге показываем максимум 3-4 ключевых объема, чтобы не загромождать карточку 16 кнопками
  const displayedVolumes = React.useMemo(() => {
    if (uniqueVolumes.length <= 4) {
      return uniqueVolumes;
    }
    // Если объемов много, отдаем приоритет популярным распивам (3, 5, 10) и полноразмерному флакону
    const priority = [3, 5, 10, 50, 100];
    const picked = uniqueVolumes.filter(v => priority.includes(Math.round(v.volumeMl)));
    if (picked.length >= 3) {
      return picked.slice(0, 4);
    }
    return uniqueVolumes.slice(0, 4);
  }, [uniqueVolumes]);

  const remainingVolumesCount = uniqueVolumes.length - displayedVolumes.length;

  // Calculate selective fake/strikethrough discount if applicable
  const hasDiscount = !!perfume.oldPrice || (perfume.discountPercent && perfume.discountPercent > 0);
  const baseMinPrice = perfume.minPrice ?? 0;
  const calculatedOldPrice = perfume.oldPrice
    ? (selectedVolume && baseMinPrice > 0
        ? Math.round((currentPrice * (perfume.oldPrice / baseMinPrice)) / 10) * 10
        : perfume.oldPrice)
    : (perfume.discountPercent ? Math.round((currentPrice * (1 + perfume.discountPercent / 100)) / 10) * 10 : undefined);
  const discountTag = perfume.discountPercent ? `-${perfume.discountPercent}%` : '-9%';

  // Normalize kind label (e.g. ПАРФЮМЕРНАЯ ВОДА / РАСПИВ / ДУХИ)
  const displayKind = perfume.kindLabel
    ? perfume.kindLabel.toUpperCase()
    : perfume.kind === 'perfume'
    ? 'ПАРФЮМЕРНАЯ ВОДА'
    : 'КОСМЕТИКА И УХОД';

  const productUrl = `/product/${encodeURIComponent(perfume.slug || perfume.id)}`;

  return (
    <div className="group relative flex flex-col bg-white border border-transparent hover:border-zinc-200 p-2 sm:p-3 transition-colors duration-200">
      {/* 1. Image Container (ЗЯ soft light-gray background #f4f4f5 with centered bottle) */}
      <div className="relative aspect-square sm:aspect-[4/5] bg-[#f4f4f5] flex items-center justify-center overflow-hidden">
        <Link to={productUrl} className="block w-full h-full p-3 sm:p-4">
          <img
            src={perfume.images?.[0] || PLACEHOLDER}
            alt={`${perfume.brand || ''} ${perfume.name || ''}`}
            className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
            decoding="async"
            onError={e => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = PLACEHOLDER;
            }}
          />
        </Link>

        {/* Top-left Badges in refined luxury OLIVE green (#5A6B32) */}
        <div className="absolute top-2.5 left-2.5 pointer-events-none flex flex-col gap-1 z-10">
          {perfume.isNew ? (
            <span className="bg-[#5A6B32] text-white font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 leading-none select-none shadow-xs">
              NEW
            </span>
          ) : perfume.isHit ? (
            <span className="bg-[#5A6B32] text-white font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 leading-none select-none shadow-xs">
              ХИТ
            </span>
          ) : hasDiscount ? (
            <span className="bg-[#5A6B32] text-white font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 leading-none select-none shadow-xs">
              {discountTag}
            </span>
          ) : null}
        </div>

        {/* Top-right Wishlist Heart (Minimalist outline, pure icon on gray background) */}
        <button
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
          className="absolute top-2.5 right-2.5 p-1 text-zinc-400 hover:text-black transition-colors z-10 cursor-pointer"
        >
          <Heart
            className={`w-5 h-5 transition-transform active:scale-125 ${
              isFavorite ? 'fill-black text-black stroke-black' : 'stroke-[1.5] text-zinc-400 hover:text-black'
            }`}
          />
        </button>
      </div>

      {/* 2. Content Container */}
      <div className="pt-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Row 1: Volume Chips row (compact and clean, max 4 chips + link if more) */}
          {displayedVolumes.length > 1 ? (
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {displayedVolumes.map(vol => {
                const isSelected = selectedVolume?.type === vol.type || selectedVolume?.volumeMl === vol.volumeMl;
                const shortLabel = getShortVolumeLabel(vol);
                return (
                  <button
                    key={vol.type || `${vol.volumeMl}`}
                    type="button"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedVolume(vol);
                    }}
                    className={`px-2 py-0.5 border text-[11px] transition-colors rounded-none leading-tight cursor-pointer ${
                      isSelected
                        ? 'bg-black text-white border-black font-bold shadow-xs'
                        : 'border-zinc-300 text-zinc-800 bg-white hover:border-black hover:text-black font-medium'
                    }`}
                  >
                    {shortLabel}
                  </button>
                );
              })}
              {remainingVolumesCount > 0 && (
                <Link
                  to={productUrl}
                  className="text-[11px] text-zinc-500 hover:text-black font-medium tracking-tight whitespace-nowrap pl-0.5"
                >
                  +{remainingVolumesCount}
                </Link>
              )}
            </div>
          ) : (perfume.rating || 0) > 0 ? (
            /* Or Star Rating Line (5.0 ★★★★★ — 1) */
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-900 mb-1.5">
              <span>{(Number(perfume.rating) || 5).toFixed(1)}</span>
              <span className="text-amber-400 tracking-tight text-xs">★★★★★</span>
              <span className="text-zinc-400">— {perfume.reviewsCount || 1}</span>
            </div>
          ) : null}

          {/* Row 2: Uppercase Product Kind Label (e.g. ПАРФЮМЕРНАЯ ВОДА) */}
          <div className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase mt-0.5 mb-1 truncate">
            {displayKind}
          </div>

          {/* Row 3: Product Title: BOLD UPPERCASE BRAND + regular perfume name (HIGH CONTRAST BLACK) */}
          <Link
            to={productUrl}
            className="block text-sm sm:text-[15px] leading-snug hover:underline line-clamp-2 mt-0.5"
          >
            <span className="font-bold uppercase text-zinc-950 tracking-tight">{perfume.brand}</span>{' '}
            <span className="font-normal text-zinc-800">{perfume.name}</span>
          </Link>

          {/* Row 4: Olive Discount Tag */}
          {hasDiscount && (
            <div className="mt-2">
              <span className="inline-flex items-center bg-[#5A6B32] text-white font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 leading-none rounded-none">
                СКИДКА {discountTag}
              </span>
            </div>
          )}

          {/* Row 5: Price display exactly as ЗЯ Screenshot: 2 371 ₽   2 790 ₽ */}
          <div className="mt-2 flex items-baseline gap-2.5 flex-wrap">
            <span className="text-lg sm:text-xl font-bold text-zinc-950 font-sans tracking-tight">
              {currentPrice.toLocaleString('ru-RU')} ₽
            </span>
            {hasDiscount && calculatedOldPrice && calculatedOldPrice > currentPrice && (
              <span className="text-sm sm:text-base text-zinc-400 line-through font-normal">
                {calculatedOldPrice.toLocaleString('ru-RU')} ₽
              </span>
            )}
            {hasDiscount && (
              <span className="text-[10px] font-bold text-[#5A6B32] uppercase">
                {discountTag}
              </span>
            )}
          </div>
        </div>

        {/* Row 6: Buy CTA Button with text "В корзину" (Solid Black / Green Added) */}
        <div className="mt-3 pt-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full py-2.5 px-3 border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors rounded-none cursor-pointer ${
              isAddedAnim
                ? 'bg-emerald-700 border-emerald-700 text-white'
                : 'border-black bg-black text-white hover:bg-zinc-800'
            }`}
          >
            {isAddedAnim ? (
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
