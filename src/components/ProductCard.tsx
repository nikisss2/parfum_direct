import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Perfume, VolumeOption } from '../types';
import { useShop } from '../context/ShopContext';
import { Heart, Plus, Minus, Check } from 'lucide-react';

const PLACEHOLDER = '/assets/placeholder-product.svg';

interface ProductCardProps {
  perfume: Perfume;
}

const getShortVolumeLabel = (vol: VolumeOption): string => {
  if (vol.label) {
    const match = vol.label.match(/^(\d+(?:[.,]\d+)?\s*(?:мл|ml|г|g|л|l))/i);
    if (match) return match[1].replace(/ml/i, 'мл').replace(/g/i, 'г').replace(/l/i, 'л');
    const cleaned = vol.label.replace(/\s*\((?:отливант|флакон|тестер|пробник)[^\)]*\)/gi, '').trim();
    if (cleaned) return cleaned;
    return vol.label;
  }
  if (vol.volumeMl) {
    return `${Math.round(vol.volumeMl)} мл`;
  }
  return '100 мл';
};

export const ProductCard: React.FC<ProductCardProps> = ({ perfume }) => {
  const { cart, addToCart, updateCartQuantity, removeFromCart, isInWishlist, toggleWishlist } = useShop();

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

  const cartItemId = `${perfume.id}-${selectedVolume.type}`;
  const cartItem = cart.find(item => item.id === cartItemId);
  const inCartCount = cartItem?.quantity || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(perfume, selectedVolume, 1);
    setIsAddedAnim(true);
    setTimeout(() => setIsAddedAnim(false), 1600);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCartCount <= 1) {
      removeFromCart(cartItemId);
    } else {
      updateCartQuantity(cartItemId, -1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateCartQuantity(cartItemId, 1);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(perfume.id, perfume);
  };

  const currentPrice = selectedVolume?.price ?? perfume.minPrice ?? 0;
  const isDecantCategory = perfume.category === 'decants' || perfume.category === 'decant' || perfume.kindLabel === 'РАСПИВ';

  const uniqueVolumes = React.useMemo(() => {
    const map = new Map<number, VolumeOption>();
    for (const v of perfume.volumes || []) {
      if (isDecantCategory && v.volumeMl > 30) continue;
      const ml = Math.round(v.volumeMl);
      const existing = map.get(ml);
      if (!existing || v.price < existing.price) {
        map.set(ml, v);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.volumeMl - b.volumeMl || a.price - b.price);
  }, [perfume.volumes, isDecantCategory]);

  const displayedVolumes = React.useMemo(() => {
    if (uniqueVolumes.length <= 4) return uniqueVolumes;
    const priority = isDecantCategory ? [3, 5, 10, 15, 20, 30] : [3, 5, 10, 50, 100];
    const picked = uniqueVolumes.filter(v => priority.includes(Math.round(v.volumeMl)));
    if (picked.length >= 3) return picked.slice(0, 4);
    return uniqueVolumes.slice(0, 4);
  }, [uniqueVolumes, isDecantCategory]);

  const hasDiscount = !!perfume.oldPrice || (perfume.discountPercent && perfume.discountPercent > 0);
  const baseMinPrice = perfume.minPrice ?? 0;
  const calculatedOldPrice = perfume.oldPrice
    ? (selectedVolume && baseMinPrice > 0
        ? Math.round((currentPrice * (perfume.oldPrice / baseMinPrice)) / 10) * 10
        : perfume.oldPrice)
    : (perfume.discountPercent ? Math.round((currentPrice * (1 + perfume.discountPercent / 100)) / 10) * 10 : undefined);
  const discountTag = perfume.discountPercent ? `-${perfume.discountPercent}%` : '-10%';

  const productUrl = `/product/${encodeURIComponent(perfume.slug || perfume.id)}`;

  return (
    // Clean White Card with NO Grey Box, NO Borders, NO Contour (The Act & Blissful Reference 4)
    <div className="bg-white p-2 sm:p-3 relative flex flex-col justify-between group transition-all duration-300 select-none">
      <div>
        {/* Top Floating Area: Badges & Wishlist */}
        <div className="flex items-center justify-between gap-1.5 mb-1 min-h-[26px]">
          <div className="flex items-center gap-1.5 flex-wrap">
            {perfume.isHit ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black text-white shadow-xs">
                ХИТ
              </span>
            ) : perfume.isNew ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-zinc-100 text-zinc-700">
                Новинка
              </span>
            ) : null}

            {hasDiscount && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#5A6B32] text-white shadow-xs">
                {discountTag}
              </span>
            )}

            {!perfume.isHit && !perfume.isNew && !hasDiscount && (
              <span className="text-[10px] sm:text-[11px] font-normal tracking-[0.14em] uppercase text-zinc-400">
                Селектив
              </span>
            )}
          </div>

          <button
            onClick={handleToggleFavorite}
            aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
            className="w-8 h-8 rounded-full bg-zinc-50 hover:bg-zinc-100 text-zinc-400 hover:text-black flex items-center justify-center transition-all cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 transition-all ${
                isFavorite ? 'fill-black text-black scale-110' : 'stroke-[1.5]'
              }`}
            />
          </button>
        </div>

        {/* 1. Flacon Image on Pure White Background (Zero boxes/rectangles) */}
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

        {/* 2. Volume Selectors: Clean Pill Chips */}
        {displayedVolumes.length > 1 && (
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap my-2">
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
                  className={`px-2.5 py-1 rounded-full text-[11px] transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-black text-white font-medium shadow-xs'
                      : 'bg-zinc-100/80 hover:bg-zinc-200/80 text-zinc-700 font-normal'
                  }`}
                >
                  {shortLabel}
                </button>
              );
            })}
          </div>
        )}

        {/* 3. Product Info: Bold Clean Brand + Name */}
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

      {/* 4. Bottom Area: Price & Action Button (Stacked cleanly, guaranteed zero overlap on all screens) */}
      <div className="mt-3 pt-2 space-y-2">
        <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
          <span className="text-sm sm:text-base font-semibold text-zinc-950 tabular-nums whitespace-nowrap">
            {currentPrice.toLocaleString('ru-RU')} ₽
          </span>
          {hasDiscount && calculatedOldPrice && calculatedOldPrice > currentPrice && (
            <span className="text-[11px] sm:text-xs text-zinc-400 line-through font-light whitespace-nowrap">
              {calculatedOldPrice.toLocaleString('ru-RU')} ₽
            </span>
          )}
        </div>

        {/* Action Button: Stepper or Minimalist Pill Button - Full width for comfortable tapping */}
        <div className="w-full">
          {inCartCount > 0 ? (
            <div className="h-8 sm:h-9 w-full rounded-full border border-black bg-white px-2 flex items-center justify-between shadow-xs transition-all">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-6 h-6 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-800 transition-colors cursor-pointer"
                aria-label="Уменьшить"
              >
                <Minus className="w-3 h-3 stroke-[2]" />
              </button>
              <span className="font-medium text-xs text-black tabular-nums min-w-[16px] text-center">
                {inCartCount}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-6 h-6 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-800 transition-colors cursor-pointer"
                aria-label="Увеличить"
              >
                <Plus className="w-3 h-3 stroke-[2]" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className={`w-full h-8 sm:h-9 px-3 rounded-full bg-black text-white hover:bg-zinc-800 active:scale-[0.98] text-[11px] sm:text-xs font-medium uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap transition-all ${
                isAddedAnim ? 'bg-emerald-700 hover:bg-emerald-800' : ''
              }`}
            >
              {isAddedAnim ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="whitespace-nowrap">В корзине</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="whitespace-nowrap">В корзину</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
