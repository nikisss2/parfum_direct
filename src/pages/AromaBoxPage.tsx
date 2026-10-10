import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { fetchProducts, listItemToPerfume } from '../api/catalog';
import { Perfume } from '../types';
import {
  Sparkles,
  Plus,
  X,
  Check,
  ShoppingBag,
  ArrowRight,
  Search,
  Gift,
  HelpCircle,
  ShieldCheck,
  Truck,
  Camera,
  Star,
  RefreshCw,
  Trash2,
} from 'lucide-react';

interface BoxTier {
  id: 'mini' | 'standard' | 'premium';
  name: string;
  count: number;
  price: number;
  regularPrice: number;
  discountBadge: string;
  isPopular?: boolean;
}

interface AromaPreset {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  badge: string;
  queries: string[];
}

const BOX_TIERS: BoxTier[] = [
  {
    id: 'mini',
    name: 'Сет «Знакомство»',
    count: 3,
    price: 3890,
    regularPrice: 4400,
    discountBadge: '−10%',
  },
  {
    id: 'standard',
    name: 'Сет «Парфюмерный гардероб»',
    count: 5,
    price: 5990,
    regularPrice: 7200,
    discountBadge: '−15%',
    isPopular: true,
  },
  {
    id: 'premium',
    name: 'Сет «Гран-При Ниши»',
    count: 8,
    price: 8990,
    regularPrice: 11400,
    discountBadge: '−20%',
  },
];

const AROMA_PRESETS: AromaPreset[] = [
  {
    id: 'niche-hits',
    emoji: '🌟',
    title: 'Главные хиты ниши',
    subtitle: 'Angels\' Share · Ganymede · Baccarat 540 · Guidance · Aventus',
    badge: 'Топ продаж ЗЯ',
    queries: ['angels share', 'barrois ganymede', 'baccarat rouge 540', 'amouage guidance', 'creed aventus'],
  },
  {
    id: 'tobacco-cherry',
    emoji: '🍒',
    title: 'Табак, вишня и ваниль',
    subtitle: 'Lost Cherry · Tobacco Vanille · Royal Blend Bourbon · After Effect · Herod',
    badge: 'Пряный шлейф',
    queries: ['lost cherry', 'tobacco vanille', 'royal blend bourbon', 'after effect', 'parfums de marly herod'],
  },
  {
    id: 'masculine-status',
    emoji: '👔',
    title: 'Мужской статус и харизма',
    subtitle: 'Aventus · Reflection Man · Interlude 53 · Ganymede · Percival',
    badge: 'Мужской выбор',
    queries: ['creed aventus', 'reflection man', 'interlude 53', 'barrois ganymede', 'percival'],
  },
  {
    id: 'feminine-seductive',
    emoji: '🌸',
    title: 'Женственность и шлейф',
    subtitle: 'Good Girl Gone Bad · Delina · Guidance · Bal d\'Afrique · Tilia',
    badge: 'Женские хиты',
    queries: ['good girl gone bad', 'delina', 'amouage guidance', 'bal d afrique', 'tilia'],
  },
  {
    id: 'clean-fresh',
    emoji: '🌿',
    title: 'Чистота, воздух и свежесть',
    subtitle: 'Blanche · Silver Mountain Water · Molecule 02 · Gypsy Water · Greenley',
    badge: 'Чистота & молекулы',
    queries: ['blanche', 'silver mountain water', 'molecule 02', 'gypsy water', 'greenley'],
  },
];

export const AromaBoxPage: React.FC = () => {
  const { addCustomCartItem } = useShop();
  const navigate = useNavigate();

  const [selectedTier, setSelectedTier] = useState<BoxTier>(BOX_TIERS[1]); // 5 by default
  const [slots, setSlots] = useState<(Perfume | null)[]>([null, null, null, null, null]);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);

  // Preset loading state
  const [applyingPresetId, setApplyingPresetId] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // Selector modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalCategory, setModalCategory] = useState<'all' | 'niche' | 'arabian' | 'luxury'>('all');
  const [catalogItems, setCatalogItems] = useState<Perfume[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Resize slots when tier changes
  useEffect(() => {
    setSlots(prev => {
      const next = Array(selectedTier.count).fill(null);
      for (let i = 0; i < Math.min(prev.length, selectedTier.count); i++) {
        next[i] = prev[i];
      }
      return next;
    });
  }, [selectedTier]);

  // Load catalog items for modal (only 5ml decantable perfumes and deduplicated)
  useEffect(() => {
    if (!modalOpen) return;
    setLoadingItems(true);
    fetchProducts({
      q: modalSearch || undefined,
      kind: 'perfume',
      category: modalCategory === 'all' ? undefined : modalCategory,
      limit: 80,
      sort: 'popular',
    })
      .then(r => {
        const raw = r.items.map(listItemToPerfume);
        // 1. Filter only perfumes where 5ml decant is available
        const with5ml = raw.filter(p => {
          if (p.kind !== 'perfume') return false;
          const has5 = p.volumes?.some(
            v => v.volumeMl === 5 || (v.label && (v.label.includes('5') || v.label.includes('отливант')))
          );
          return has5 || (p.volumes && p.volumes.length > 1);
        });

        // 2. Deduplicate identical fragrances into 1 single card
        const seen = new Set<string>();
        const unique: Perfume[] = [];
        for (const p of with5ml) {
          const cleanName = p.name
            .replace(/\[[^\]]*\]/g, '')
            .replace(/\((?:тестер|отливант|пробник|запаска|без спрея)[^\)]*\)/gi, '')
            .replace(/\d+\s*(?:мл|ml).*$/i, '')
            .trim()
            .toLowerCase();
          const key = `${p.brand.toLowerCase()}___${cleanName}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(p);
          }
        }
        setCatalogItems(unique);
      })
      .catch(() => setCatalogItems([]))
      .finally(() => setLoadingItems(false));
  }, [modalOpen, modalSearch, modalCategory]);

  const openSlotPicker = (index: number) => {
    setActiveSlotIndex(index);
    setModalOpen(true);
  };

  const handleApplyPreset = async (preset: AromaPreset) => {
    setApplyingPresetId(preset.id);
    setSelectedTier(BOX_TIERS[1]); // 5-slot standard tier

    try {
      const items = await Promise.all(
        preset.queries.map(q =>
          fetchProducts({ q, kind: 'perfume', limit: 1 }).then(r =>
            r.items[0] ? listItemToPerfume(r.items[0]) : null
          )
        )
      );

      setSlots(items);
      setActivePresetId(preset.id);

      setTimeout(() => {
        const el = document.getElementById('box-visualizer-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      console.error('Failed to load preset', err);
    } finally {
      setApplyingPresetId(null);
    }
  };

  const handleClearAllSlots = () => {
    setSlots(Array(selectedTier.count).fill(null));
    setActivePresetId(null);
  };

  const handleSelectPerfume = (perfume: Perfume) => {
    if (activeSlotIndex === null) return;
    const next = [...slots];
    next[activeSlotIndex] = perfume;
    setSlots(next);
    setModalOpen(false);
    setActiveSlotIndex(null);
  };

  const handleRemoveSlot = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = [...slots];
    next[index] = null;
    setSlots(next);
  };

  const filledCount = slots.filter(Boolean).length;
  const isComplete = filledCount === selectedTier.count;

  const handleAddToCart = () => {
    if (!isComplete) return;

    const names = slots
      .filter((p): p is Perfume => p !== null)
      .map(p => `${p.brand} ${p.name}`)
      .join(', ');

    addCustomCartItem({
      name: `Аромабокс «${selectedTier.name}» (${selectedTier.count} ароматов по 5 мл)`,
      brand: 'MAISON ARÔME STUDIO',
      image: slots[0]?.images[0] || 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=600&q=80',
      volumeLabel: `Набор из ${selectedTier.count} ароматов по 5 мл: ${names}`,
      price: selectedTier.price,
      quantity: 1,
    });

    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-black text-white border border-black text-[10px] font-bold uppercase tracking-widest font-mono">
          <Gift className="w-4 h-4 text-amber-400" />
          <span>Конструктор сетов со скидкой до 20%</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-normal font-serif tracking-tight text-zinc-950">
          Собери свой Аромабокс
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 font-light leading-relaxed">
          Выберите любимые ароматы из коллекции мировых бестселлеров в удобном формате атомайзеров по 5 мл. Мы бережно упакуем их в наш фирменный дизайнерский бокс с мягким ложементом.
        </p>
      </div>

      {/* Curated Presets Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
            <Sparkles className="w-4 h-4 text-[#5A6B32]" />
            <span>Готовые пресеты от шеф-парфюмера</span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            1 клик — и все 5 слотов заполнены культовыми бестселлерами
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {AROMA_PRESETS.map(preset => {
            const isActive = activePresetId === preset.id;
            const isApplying = applyingPresetId === preset.id;
            return (
              <div
                key={preset.id}
                className={`p-4 rounded-none border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-black bg-zinc-950 text-white shadow-xl'
                    : 'border-zinc-200 bg-white hover:border-black text-zinc-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-2xl">{preset.emoji}</span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 border ${
                        isActive
                          ? 'border-amber-400/40 text-amber-400 bg-amber-400/10'
                          : 'border-[#5A6B32]/30 text-[#5A6B32] bg-[#5A6B32]/10'
                      }`}
                    >
                      {preset.badge}
                    </span>
                  </div>
                  <div className={`font-serif text-base font-bold leading-snug ${isActive ? 'text-white' : 'text-zinc-950'}`}>
                    {preset.title}
                  </div>
                  <p className={`text-[11px] mt-1.5 leading-relaxed line-clamp-3 ${isActive ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {preset.subtitle}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isApplying}
                  onClick={() => handleApplyPreset(preset)}
                  className={`mt-4 w-full py-2.5 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 rounded-none transition-all ${
                    isActive
                      ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                      : 'bg-black text-white hover:bg-zinc-800'
                  }`}
                >
                  {isApplying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Загрузка...</span>
                    </>
                  ) : isActive ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Сет в боксе</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Применить сет</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Tier Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
          <span className="w-6 h-6 rounded-none bg-black text-white flex items-center justify-center text-xs font-mono font-bold">1</span>
          <span>Выберите размер аромабокса</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BOX_TIERS.map(tier => {
            const isSelected = selectedTier.id === tier.id;
            return (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier)}
                className={`cursor-pointer relative p-6 rounded-none border transition-all ${
                  isSelected
                    ? 'border-2 border-black bg-white shadow-xl'
                    : 'border-zinc-200 bg-white hover:border-black'
                }`}
              >
                <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-none bg-black text-white text-[10px] font-bold uppercase tracking-widest font-mono">
                  {tier.discountBadge}
                </span>

                <div className="font-serif text-lg text-zinc-950">{tier.name}</div>
                <div className="text-xs uppercase tracking-wider text-zinc-500 mt-1 font-mono">{tier.count} атомайзеров по 5 мл</div>

                <div className="mt-4 pt-4 border-t border-zinc-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-xl font-black font-mono text-zinc-950">{tier.price.toLocaleString('ru-RU')} ₽</span>
                    <span className="text-xs font-mono text-zinc-400 line-through ml-2">{tier.regularPrice.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 font-mono">
                    Выгода {(tier.regularPrice - tier.price).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Interactive Box Slots */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
            <span className="w-6 h-6 rounded-none bg-black text-white flex items-center justify-center text-xs font-mono font-bold">2</span>
            <span>Заполните ароматами ({filledCount} из {selectedTier.count})</span>
          </div>

          <span className="text-xs uppercase tracking-wider text-zinc-500 font-mono">
            Нажмите на слот для выбора
          </span>
        </div>

        {/* Box Interior Visualizer */}
        <div
          id="box-visualizer-section"
          className="relative p-6 sm:p-10 rounded-none bg-zinc-950 text-white shadow-2xl border-2 border-zinc-800 transition-colors"
        >
          {/* Subtle inner box border */}
          <div className="absolute inset-2 border border-zinc-800/80 pointer-events-none" />

          {/* Luxury Box Header Plate */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-none border border-amber-400/40 bg-black flex items-center justify-center text-amber-400">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <div className="font-serif uppercase tracking-widest text-sm text-white font-medium">
                  MAISON ARÔME COUTURE ATELIER
                </div>
                <div className="font-mono uppercase text-[10px] text-zinc-400 mt-0.5">
                  Эксклюзивный бархатный бокс · {selectedTier.count} атомайзеров по 5 мл
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span
                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border ${
                  isComplete
                    ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-300'
                }`}
              >
                {isComplete ? '✓ Бокс укомплектован' : `Заполнено ${filledCount} из ${selectedTier.count}`}
              </span>

              {filledCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllSlots}
                  className="px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors flex items-center gap-1.5"
                  title="Очистить все слоты"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Очистить</span>
                </button>
              )}
            </div>
          </div>

          {/* Velvet Cradle Slots Grid */}
          <div className="relative mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {slots.map((perfume, idx) => {
              const isFilled = perfume !== null;
              return (
                <div
                  key={idx}
                  onClick={() => openSlotPicker(idx)}
                  className={`group relative rounded-none flex flex-col justify-between p-3.5 transition-all cursor-pointer min-h-[300px] ${
                    isFilled
                      ? 'bg-zinc-900/90 border border-zinc-700/80 hover:border-white shadow-[inset_0_4px_16px_rgba(0,0,0,0.85)]'
                      : 'border border-dashed border-zinc-700 hover:border-white bg-zinc-900/40 hover:bg-zinc-900/70 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)]'
                  }`}
                >
                  {/* Slot Top Header */}
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono z-20">
                    <span className="px-1.5 py-0.5 bg-black/60 border border-zinc-800 text-[10px]">
                      ЛОЖЕМЕНТ #{idx + 1}
                    </span>
                    {isFilled && (
                      <button
                        onClick={e => handleRemoveSlot(idx, e)}
                        className="p-1 rounded-none bg-black/80 hover:bg-rose-600 text-zinc-300 hover:text-white transition-colors border border-zinc-800"
                        title="Удалить аромат"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Slot Center: Realistic 5ml Atomizer Bottle */}
                  {isFilled ? (
                    <div className="relative flex flex-col items-center justify-center my-auto py-2 z-10">
                      {/* Atomizer Cap & Spray Head */}
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-1.5 bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 border border-zinc-500 rounded-none mb-[1px]" />
                        <div className="w-5 h-2 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 border border-amber-600/50 shadow-xs" />
                        <div className="w-7 h-5 bg-gradient-to-b from-zinc-800 via-zinc-900 to-black border border-zinc-700 shadow-md flex items-center justify-center">
                          <div className="w-4 h-[1px] bg-amber-400/40" />
                        </div>
                      </div>

                      {/* Atomizer Glass Body */}
                      <div className="relative w-24 sm:w-28 h-36 sm:h-40 bg-zinc-900/90 border border-zinc-700/80 shadow-[0_10px_25px_rgba(0,0,0,0.8)] flex flex-col justify-between p-2 overflow-hidden group-hover:border-white transition-colors">
                        {/* Sheen highlight */}
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 via-transparent to-white/5" />
                        <div className="absolute top-0 bottom-0 left-1 w-[2px] bg-white/20 pointer-events-none" />

                        {/* Perfume Artwork Window */}
                        <div className="relative w-full aspect-square overflow-hidden bg-black/40 border border-zinc-800">
                          <img
                            src={perfume.images[0] || '/assets/placeholder-product.svg'}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>

                        {/* Boutique Flacon Label */}
                        <div className="relative bg-white text-zinc-950 p-1.5 text-center shadow-xs">
                          <div className="text-[9px] uppercase font-bold tracking-widest text-zinc-600 truncate font-mono">
                            {perfume.brand}
                          </div>
                          <div className="text-[11px] font-bold text-zinc-950 truncate leading-tight">
                            {perfume.name}
                          </div>
                          <div className="text-[8px] uppercase tracking-wider text-zinc-500 font-mono mt-0.5">
                            5 ML · EXTRAIT
                          </div>
                        </div>
                      </div>

                      {/* Pedestal Shadow */}
                      <div className="w-16 h-1.5 bg-black/80 rounded-full blur-[2px] mt-1" />
                    </div>
                  ) : (
                    <div className="text-center my-auto space-y-3 text-zinc-500 group-hover:text-white transition-colors py-6 z-10">
                      <div className="w-12 h-16 rounded-none border-2 border-dashed border-zinc-700 group-hover:border-white flex flex-col items-center justify-center mx-auto group-hover:scale-105 transition-all bg-zinc-900/30">
                        <Plus className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                        <span className="text-[9px] font-mono uppercase text-zinc-500 mt-1">5 мл</span>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider font-bold text-zinc-300">Свободный слот</div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Нажмите для выбора</div>
                      </div>
                    </div>
                  )}

                  {/* Slot Bottom Action Indicator */}
                  <div className="text-center pt-2 border-t border-zinc-800/80 z-20">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 group-hover:text-white tracking-widest transition-colors">
                      {isFilled ? 'Заменить аромат' : '+ Добавить флакон'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Box Inclusions Info Footnote */}
          <div className="mt-8 pt-6 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-none shrink-0" />
              <span>Стеклянные флаконы 5 мл с микроспреем</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-none shrink-0" />
              <span>Дизайнерский матовый бокс с ложементом</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-none shrink-0" />
              <span>Фирменные карточки с описанием нот</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Action Bar */}
      <div className="p-6 sm:p-8 rounded-none bg-zinc-950 text-white flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl border border-zinc-800">
        <div className="space-y-1 text-center lg:text-left">
          <div className="text-xs uppercase tracking-wider text-zinc-400 font-mono">
            Итого за набор ({selectedTier.count} ароматов по 5 мл в коробке):
          </div>
          <div className="flex items-baseline justify-center lg:justify-start gap-3">
            <span className="text-3xl font-black font-mono">{selectedTier.price.toLocaleString('ru-RU')} ₽</span>
            <span className="text-sm font-mono text-zinc-500 line-through">{selectedTier.regularPrice.toLocaleString('ru-RU')} ₽</span>
            <span className="px-2 py-0.5 rounded-none border border-[#A3B18A] bg-[#5A6B32]/30 text-[#C5D86D] text-xs font-mono font-bold">
              Выгода {(selectedTier.regularPrice - selectedTier.price).toLocaleString('ru-RU')} ₽
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 pt-1">
            {isComplete ? 'Все слоты заполнены, бокс готов к сборке' : `Заполните еще ${selectedTier.count - filledCount} слота для оформления`}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">

          <button
            disabled={!isComplete}
            onClick={handleAddToCart}
            className={`w-full sm:w-auto px-8 py-4 rounded-none text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              isComplete
                ? 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-xl'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Добавить Аромабокс в корзину</span>
          </button>
        </div>
      </div>

      {/* Catalog Selector Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-3xl bg-white rounded-none p-6 sm:p-8 shadow-2xl border border-black max-h-[90vh] flex flex-col relative"
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div>
                <h3 className="font-serif text-xl text-zinc-950">
                  Выберите аромат для слота #{activeSlotIndex !== null ? activeSlotIndex + 1 : ''}
                </h3>
                <p className="text-xs uppercase tracking-wider text-zinc-500 font-mono mt-0.5">Доступно 45 000+ оригинальных ароматов</p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-none border border-transparent hover:border-zinc-300 text-zinc-400 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search & Filters */}
            <div className="py-4 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Поиск по аромату или бренду (Creed, Tom Ford, Ganymede, Khamrah)..."
                  value={modalSearch}
                  onChange={e => setModalSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-none border border-zinc-300 text-xs outline-none focus:border-black bg-white transition-colors"
                />
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { id: 'all', label: 'Все' },
                  { id: 'niche', label: 'Ниша' },
                  { id: 'arabian', label: 'Арабские' },
                  { id: 'luxury', label: 'Люкс' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setModalCategory(cat.id as any)}
                    className={`px-3.5 py-1.5 rounded-none font-bold uppercase tracking-wider text-[11px] transition-colors ${
                      modalCategory === cat.id
                        ? 'bg-black text-white'
                        : 'border border-zinc-200 text-zinc-700 hover:border-black'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products List in Modal */}
            <div className="flex-1 overflow-y-auto pr-1">
              {loadingItems ? (
                <div className="py-20 text-center text-xs text-zinc-400 uppercase tracking-wider font-mono">
                  Загрузка ароматов каталога...
                </div>
              ) : catalogItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {catalogItems.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPerfume(p)}
                      className="group p-3 rounded-none border border-zinc-200 hover:border-black hover:shadow-md transition-all cursor-pointer flex flex-col justify-between bg-white"
                    >
                      <div>
                        <div className="aspect-square rounded-none overflow-hidden bg-zinc-100 border border-zinc-200 mb-2.5">
                          <img
                            src={p.images[0] || '/assets/placeholder-product.svg'}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="text-[10px] uppercase font-bold text-zinc-400 truncate tracking-wider">{p.brand}</div>
                        <div className="text-xs font-semibold text-zinc-900 truncate mt-0.5">{p.name}</div>
                      </div>
                      <button
                        type="button"
                        className="mt-3 w-full py-2 bg-black group-hover:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-none transition-colors"
                      >
                        В бокс
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-xs text-zinc-400 font-mono">
                  По запросу «{modalSearch}» ничего не найдено.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
