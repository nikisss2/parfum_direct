import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { fetchProducts, listItemToPerfume } from '../api/catalog';
import { Perfume } from '../types';
import {
  Plus,
  X,
  Check,
  ShoppingBag,
  ArrowRight,
  Search,
  RefreshCw,
  Trash2,
  Box,
} from 'lucide-react';

export function get5mlPrice(perfume: Perfume | null | undefined): number {
  if (!perfume) return 0;
  if (perfume.volumes && Array.isArray(perfume.volumes) && perfume.volumes.length > 0) {
    // 1. Ищем точный объем 5 мл (или с пометкой 5 мл / отливант)
    const v5 = perfume.volumes.find(
      v => v.volumeMl === 5 || (v.label && /(?:^|[^\d])5\s*(?:мл|ml)(?:[^\d]|$)/i.test(v.label))
    );
    if (v5 && v5.price > 0) return Math.round(v5.price);

    // 2. Ищем объем 10 мл (5 мл рассчитывается как ~55% от 10 мл)
    const v10 = perfume.volumes.find(
      v => v.volumeMl === 10 || (v.label && /(?:^|[^\d])10\s*(?:мл|ml)(?:[^\d]|$)/i.test(v.label))
    );
    if (v10 && v10.price > 0) return Math.round(v10.price * 0.55);

    // 3. Любой малый отливант или пробник (от 1 до 15 мл)
    const smallDecants = perfume.volumes
      .filter(v => v.volumeMl && v.volumeMl > 0 && v.volumeMl <= 15 && v.price > 0)
      .sort((a, b) => Math.abs((a.volumeMl || 0) - 5) - Math.abs((b.volumeMl || 0) - 5));

    if (smallDecants.length > 0) {
      const best = smallDecants[0];
      const ml = best.volumeMl || 5;
      return Math.round((best.price / ml) * 5);
    }

    // 4. Если в карточке только полноразмерные флаконы (> 30 мл):
    // рассчитываем честную стоимость распива 5 мл от объема флакона + атомайзер,
    // но НИКОГДА не возвращаем цену целого флакона 7000-8000 ₽!
    const bottle = perfume.volumes.find(v => v.volumeMl && v.volumeMl >= 30 && v.price > 0);
    if (bottle && bottle.volumeMl && bottle.price) {
      const estimated = Math.round((bottle.price / bottle.volumeMl) * 5 * 1.35 + 150);
      return Math.max(350, Math.min(2400, estimated));
    }
  }

  // Защита от возврата стоимости флакона из minPrice
  if (perfume.minPrice && perfume.minPrice > 0) {
    if (perfume.minPrice > 2500) {
      return Math.max(450, Math.min(2200, Math.round(perfume.minPrice * 0.12 + 200)));
    }
    return Math.round(perfume.minPrice);
  }
  return 850;
}

interface BoxTier {
  id: 'mini' | 'standard' | 'premium';
  name: string;
  count: number;
  subtitle: string;
  badge?: string;
  isPopular?: boolean;
}

interface AromaPreset {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  queries: string[];
}

const BOX_TIERS: BoxTier[] = [
  {
    id: 'mini',
    name: 'Сет 3 флакона',
    count: 3,
    subtitle: '3 × 5 мл',
  },
  {
    id: 'standard',
    name: 'Сет 5 флаконов',
    count: 5,
    subtitle: '5 × 5 мл',
    badge: 'Выбор гостей',
    isPopular: true,
  },
  {
    id: 'premium',
    name: 'Сет 8 флаконов',
    count: 8,
    subtitle: '8 × 5 мл',
    badge: 'Полный гардероб',
  },
];

const AROMA_PRESETS: AromaPreset[] = [
  {
    id: 'niche-icons',
    title: 'Иконы нишевой парфюмерии',
    subtitle: 'Angels\' Share · Ganymede · Baccarat Rouge 540 · Guidance · Aventus',
    badge: 'Нишевая классика',
    queries: ['angels share', 'barrois ganymede', 'baccarat rouge 540', 'amouage guidance', 'creed aventus'],
  },
  {
    id: 'warm-amber',
    title: 'Табак, вишня и теплая амбра',
    subtitle: 'Lost Cherry · Tobacco Vanille · Royal Blend · After Effect · Herod',
    badge: 'Гурманские аккорды',
    queries: ['lost cherry', 'tobacco vanille', 'royal blend bourbon', 'after effect', 'parfums de marly herod'],
  },
  {
    id: 'mineral-wood',
    title: 'Древесный шлейф и статус',
    subtitle: 'Aventus · Reflection Man · Interlude 53 · Bois Imperial · Percival',
    badge: 'Древесные & кожа',
    queries: ['creed aventus', 'reflection man', 'interlude 53', 'bois imperial', 'percival'],
  },
  {
    id: 'floral-couture',
    title: 'Цветочный кутюр',
    subtitle: 'Good Girl Gone Bad · Delina · Fleur Narcotique · Bal d\'Afrique · Tilia',
    badge: 'Цветочные & мускусы',
    queries: ['good girl gone bad', 'delina', 'fleur narcotique', 'bal d afrique', 'tilia'],
  },
  {
    id: 'pure-fresh',
    title: 'Чистота и минеральная свежесть',
    subtitle: 'Blanche · Silver Mountain Water · Molecule 02 · Gypsy Water · Greenley',
    badge: 'Свежие & озон',
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
        // 1. Исключаем непарфюмерные форматы (дезодоранты, спреи для тела, косметички, пакеты)
        const isPerfumeOnly = (p: Perfume) => {
          if (p.kind !== 'perfume') return false;
          const lower = p.name.toLowerCase();
          if (
            lower.includes('дезодорант') ||
            lower.includes('спрей для тела') ||
            lower.includes('дымка для тела') ||
            lower.includes('набор') ||
            lower.includes('косметичка') ||
            lower.includes('пакет') ||
            lower.includes('гель для душа')
          ) {
            return false;
          }
          return true;
        };

        const candidates = raw.filter(isPerfumeOnly);

        // 2. Нормализация ключа аромата для объединения дублей (парф. вода, туалетная вода, тестер, флакон) в одну карточку
        const normalizeKey = (brand: string, name: string) => {
          const cleanBrand = (brand || '').trim().toLowerCase();
          let cleanName = (name || '')
            .toLowerCase()
            .replace(/\[[^\]]*\]/g, '')
            .replace(/\([^\)]*\)/g, '')
            .replace(/(?:^|[^\p{L}\p{N}])(?:мужской|женский|унисекс|men|women|pour homme|pour femme)(?:[^\p{L}\p{N}]|$)/gui, ' ')
            .replace(/(?:^|[^\p{L}\p{N}])(?:парфюмерная вода|туалетная вода|духи|дезодорант-спрей|дезодорант|спрей для тела|дымка для тела|одеколон|edp|edt|parfum|extrait)(?:[^\p{L}\p{N}]|$)/gui, ' ')
            .replace(/(?:^|[^\p{L}\p{N}])(?:отливант|пробник|тестер|флакон|миниатюра|спрей)(?:[^\p{L}\p{N}]|$)/gui, ' ')
            .replace(/\b\d+\s*(?:мл|ml)\b/gi, '')
            .replace(/[^\p{L}\p{N}\s]/gui, ' ')
            .replace(/\s+/g, ' ')
            .trim();

          if (cleanName.startsWith(cleanBrand)) {
            cleanName = cleanName.slice(cleanBrand.length).trim();
          }
          return `${cleanBrand}___${cleanName}`;
        };

        // 3. Дедупликация: объединяем одинаковые ароматы и отдаем предпочтение карточке с реальным распивом 5 мл
        const perfumeMap = new Map<string, Perfume>();
        for (const p of candidates) {
          const key = normalizeKey(p.brand, p.name);
          const hasExplicit5 = p.volumes?.some(
            v => v.volumeMl === 5 || (v.label && /(?:^|[^\d])5\s*(?:мл|ml)(?:[^\d]|$)/i.test(v.label))
          );

          if (!perfumeMap.has(key)) {
            perfumeMap.set(key, p);
          } else {
            const current = perfumeMap.get(key)!;
            const currentHas5 = current.volumes?.some(
              v => v.volumeMl === 5 || (v.label && /(?:^|[^\d])5\s*(?:мл|ml)(?:[^\d]|$)/i.test(v.label))
            );
            if (!currentHas5 && hasExplicit5) {
              perfumeMap.set(key, p);
            } else if (get5mlPrice(p) < get5mlPrice(current)) {
              perfumeMap.set(key, p);
            }
          }
        }

        setCatalogItems(Array.from(perfumeMap.values()));
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
  const boxTotalPrice = slots.reduce((acc, p) => acc + (p ? get5mlPrice(p) : 0), 0);

  const handleAddToCart = () => {
    if (!isComplete) return;

    const names = slots
      .filter((p): p is Perfume => p !== null)
      .map(p => `${p.brand} ${p.name} (${get5mlPrice(p)} ₽)`)
      .join(', ');

    addCustomCartItem({
      name: `Аромабокс «${selectedTier.name}» (${selectedTier.count} ароматов по 5 мл)`,
      brand: 'MAISON ARÔME ATELIER',
      image: slots[0]?.images[0] || '/assets/gallery/real-order-04.jpg',
      volumeLabel: `Набор из ${selectedTier.count} ароматов по 5 мл: ${names}`,
      price: boxTotalPrice,
      quantity: 1,
    });

    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12 sm:space-y-16">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400">
          Maison Arôme Atelier · Discovery Set
        </div>
        <h1 className="text-3xl sm:text-5xl font-normal font-serif tracking-tight text-zinc-950">
          Конструктор сета
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 font-light leading-relaxed">
          Персональный набор флаконов по 5 мл в фирменном матовом футляре. Выберите 3, 5 или 8 композиций из коллекции бутика.
        </p>
      </div>

      {/* Curated Presets Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-zinc-200 pb-2">
          <div className="text-xs font-bold uppercase tracking-widest text-zinc-950">
            Готовые подборки
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            Заполнить 5 слотов сбалансированным сетом
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {AROMA_PRESETS.map(preset => {
            const isActive = activePresetId === preset.id;
            const isApplying = applyingPresetId === preset.id;
            return (
              <div
                key={preset.id}
                className={`p-4 border transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-black bg-zinc-950 text-white'
                    : 'border-zinc-200 bg-white hover:border-black text-zinc-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      Сет 5 × 5 мл
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 border ${
                        isActive
                          ? 'border-white/30 text-white bg-white/10'
                          : 'border-zinc-200 text-zinc-600 bg-zinc-50'
                      }`}
                    >
                      {preset.badge}
                    </span>
                  </div>
                  <div className={`font-serif text-base leading-snug ${isActive ? 'text-white' : 'text-zinc-950'}`}>
                    {preset.title}
                  </div>
                  <p className={`text-[11px] mt-1.5 leading-relaxed line-clamp-3 font-light ${isActive ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {preset.subtitle}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isApplying}
                  onClick={() => handleApplyPreset(preset)}
                  className={`mt-4 w-full py-2.5 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors ${
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
                      <span>Сет выбран</span>
                    </>
                  ) : (
                    <span>Выбрать набор</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Tier Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-950 border-b border-zinc-200 pb-2">
          <span className="font-mono text-zinc-400">01</span>
          <span>Формат бокса</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BOX_TIERS.map(tier => {
            const isSelected = selectedTier.id === tier.id;
            return (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier)}
                className={`cursor-pointer relative p-5 border transition-all ${
                  isSelected
                    ? 'border-2 border-black bg-white shadow-sm'
                    : 'border-zinc-200 bg-white hover:border-black'
                }`}
              >
                {tier.badge && (
                  <span className="absolute -top-2.5 right-4 px-2 py-0.5 bg-black text-white text-[9px] font-bold uppercase tracking-widest font-mono">
                    {tier.badge}
                  </span>
                )}

                <div className="font-serif text-lg text-zinc-950">{tier.name}</div>
                <div className="text-xs uppercase tracking-wider text-zinc-400 mt-0.5 font-mono">{tier.subtitle}</div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-light">Фирменный футляр:</span>
                  <span className="font-mono text-emerald-700 font-semibold">0 ₽ (в комплекте)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Interactive Box Slots */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-950">
            <span className="font-mono text-zinc-400">02</span>
            <span>Наполнение сета ({filledCount} из {selectedTier.count})</span>
          </div>

          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono">
            Нажмите на слот для выбора
          </span>
        </div>

        {/* Box Interior Visualizer */}
        <div
          id="box-visualizer-section"
          className="relative p-6 sm:p-8 bg-zinc-950 text-white border border-zinc-800"
        >
          {/* Box Header Plate */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-zinc-800 gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-300">
                <Box className="w-4 h-4" />
              </div>
              <div>
                <div className="font-serif uppercase tracking-widest text-xs text-white">
                  Maison Arôme Atelier
                </div>
                <div className="font-mono text-[10px] text-zinc-400">
                  Футляр · {selectedTier.count} атомайзеров по 5 мл
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <span
                className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border ${
                  isComplete
                    ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                }`}
              >
                {isComplete ? 'Комплект собран' : `${filledCount} из ${selectedTier.count}`}
              </span>

              {filledCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllSlots}
                  className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors flex items-center gap-1"
                  title="Очистить все слоты"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Очистить</span>
                </button>
              )}
            </div>
          </div>

          {/* Slots Grid */}
          <div className="relative mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
            {slots.map((perfume, idx) => {
              const isFilled = perfume !== null;
              return (
                <div
                  key={idx}
                  onClick={() => openSlotPicker(idx)}
                  className={`group relative flex flex-col justify-between p-3 transition-all cursor-pointer min-h-[280px] ${
                    isFilled
                      ? 'bg-zinc-900 border border-zinc-700 hover:border-white'
                      : 'border border-dashed border-zinc-800 hover:border-zinc-500 bg-zinc-900/40'
                  }`}
                >
                  {/* Slot Top Header */}
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono z-20">
                    <span className="text-zinc-500">
                      #{String(idx + 1).padStart(2, '0')}
                    </span>
                    {isFilled && (
                      <button
                        onClick={e => handleRemoveSlot(idx, e)}
                        className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        title="Удалить аромат"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Slot Center: Decant Bottle Artwork */}
                  {isFilled ? (
                    <div className="relative flex flex-col items-center justify-center my-auto py-2 z-10 w-full">
                      {/* Atomizer Body */}
                      <div className="relative w-full aspect-square max-w-[140px] overflow-hidden bg-black/40 border border-zinc-800">
                        <img
                          src={perfume.images[0] || '/assets/placeholder-product.svg'}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>

                      {/* Flacon Label */}
                      <div className="relative bg-white text-zinc-950 p-2 text-center w-full mt-2.5">
                        <div className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 truncate font-mono">
                          {perfume.brand}
                        </div>
                        <div className="text-xs font-serif font-bold text-zinc-950 truncate leading-snug">
                          {perfume.name}
                        </div>
                        <div className="text-[11px] font-mono text-zinc-900 mt-1 font-semibold">
                          {get5mlPrice(perfume).toLocaleString('ru-RU')} ₽ <span className="font-sans font-normal text-[9px] text-zinc-500">/ 5 мл</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center my-auto space-y-2 text-zinc-500 group-hover:text-zinc-300 transition-colors py-8 z-10">
                      <div className="w-10 h-10 border border-zinc-700 group-hover:border-white flex items-center justify-center mx-auto transition-colors">
                        <Plus className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-wider font-semibold text-zinc-300">Флакон {idx + 1}</div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">5 мл · нажать для выбора</div>
                      </div>
                    </div>
                  )}

                  {/* Slot Bottom Action Indicator */}
                  <div className="text-center pt-2 border-t border-zinc-800/80 z-20">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 group-hover:text-white tracking-widest transition-colors">
                      {isFilled ? 'Заменить' : '+ Добавить'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Box Inclusions Info Footnote */}
          <div className="mt-6 pt-5 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-zinc-400 font-light">
            <div>· Стеклянные флаконы 5 мл со спреем</div>
            <div>· Дизайнерский футляр с ложементом</div>
            <div>· Карточки с пирамидами нот</div>
          </div>
        </div>
      </div>

      {/* Order Action Bar */}
      <div className="p-6 sm:p-8 bg-zinc-950 text-white flex flex-col lg:flex-row items-center justify-between gap-6 border border-zinc-800">
        <div className="space-y-1 text-center lg:text-left">
          <div className="text-xs uppercase tracking-wider text-zinc-400 font-mono">
            Итого ({selectedTier.count} ароматов по 5 мл):
          </div>
          <div className="flex items-baseline justify-center lg:justify-start gap-3">
            <span className="text-3xl font-light font-mono text-white">
              {boxTotalPrice > 0 ? `${boxTotalPrice.toLocaleString('ru-RU')} ₽` : '0 ₽'}
            </span>
            <span className="text-xs font-mono text-zinc-400">
              Футляр — в комплекте
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 pt-0.5">
            {isComplete
              ? `Все ${selectedTier.count} ароматов укомплектованы`
              : `Заполнено ${filledCount} из ${selectedTier.count} слотов`}
          </div>
        </div>

        <div className="w-full lg:w-auto">
          <button
            disabled={!isComplete}
            onClick={handleAddToCart}
            className={`w-full sm:w-auto px-8 py-3.5 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${
              isComplete
                ? 'bg-white text-zinc-950 hover:bg-zinc-200 cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-60'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Добавить сет в корзину ({boxTotalPrice.toLocaleString('ru-RU')} ₽)</span>
          </button>
        </div>
      </div>

      {/* Catalog Selector Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-3xl bg-white p-6 sm:p-8 border border-black max-h-[90vh] flex flex-col relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div>
                <h3 className="font-serif text-lg text-zinc-950">
                  Выбор аромата · Слот #{activeSlotIndex !== null ? activeSlotIndex + 1 : ''}
                </h3>
                <p className="text-[11px] text-zinc-400 font-mono mt-0.5">Оригинальные ароматы бутика (5 мл)</p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search & Filters */}
            <div className="py-3.5 space-y-2.5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Поиск по аромату или бренду (Creed, Tom Ford, Ganymede)..."
                  value={modalSearch}
                  onChange={e => setModalSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-zinc-300 text-xs outline-none focus:border-black bg-white transition-colors"
                />
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex flex-wrap gap-1.5 text-xs">
                {[
                  { id: 'all', label: 'Все' },
                  { id: 'niche', label: 'Ниша' },
                  { id: 'arabian', label: 'Восток' },
                  { id: 'luxury', label: 'Люкс' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setModalCategory(cat.id as any)}
                    className={`px-3 py-1 font-bold uppercase tracking-wider text-[10px] transition-colors ${
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
                <div className="py-20 text-center text-xs text-zinc-400 font-mono">
                  Загрузка каталога...
                </div>
              ) : catalogItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {catalogItems.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPerfume(p)}
                      className="group p-2.5 border border-zinc-200 hover:border-black transition-all cursor-pointer flex flex-col justify-between bg-white"
                    >
                      <div>
                        <div className="aspect-square overflow-hidden bg-zinc-50 border border-zinc-100 mb-2">
                          <img
                            src={p.images[0] || '/assets/placeholder-product.svg'}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="text-[9px] uppercase font-bold text-zinc-400 truncate tracking-wider font-mono">{p.brand}</div>
                        <div className="text-xs font-serif font-bold text-zinc-900 truncate mt-0.5">{p.name}</div>
                        <div className="text-xs font-mono text-zinc-950 mt-1 font-semibold">
                          {get5mlPrice(p).toLocaleString('ru-RU')} ₽ <span className="text-[10px] font-normal text-zinc-400 font-sans">/ 5 мл</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="mt-2.5 w-full py-1.5 bg-black group-hover:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
                      >
                        Выбрать
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
