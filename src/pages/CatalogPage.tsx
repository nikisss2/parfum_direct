import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchBrands, fetchMeta, fetchProducts, fetchPopularNotes, listItemToPerfume } from '../api/catalog';
import { ProductCard } from '../components/ProductCard';
import { SEO } from '../components/SEO';
import { Gender, Perfume, ProductKind, PRODUCT_KIND_OPTIONS } from '../types';
import { isPureBrand } from '../data/brandsData';
import { SlidersHorizontal, X, Search, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 24;

const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white p-2 sm:p-3 relative flex flex-col justify-between animate-pulse select-none">
    <div>
      {/* Top Floating Area */}
      <div className="flex items-center justify-between gap-1.5 mb-1 min-h-[26px]">
        <div className="h-5 w-12 bg-zinc-100 rounded-full" />
        <div className="h-5 w-5 bg-zinc-100 rounded-full" />
      </div>

      {/* Image Area */}
      <div className="relative aspect-square bg-[#F7F7F8] rounded-[24px] flex items-center justify-center p-4">
        <div className="w-1/3 h-3/5 bg-zinc-200/60 rounded-full" />
      </div>

      {/* Volume selector chips */}
      <div className="flex gap-1.5 mt-2">
        <div className="h-6 w-11 bg-zinc-100 rounded-full" />
        <div className="h-6 w-11 bg-zinc-100 rounded-full" />
        <div className="h-6 w-11 bg-zinc-100 rounded-full" />
      </div>

      {/* Product Info */}
      <div className="mt-2 space-y-1">
        <div className="h-3 w-1/3 bg-zinc-200/80 rounded-full" />
        <div className="h-4 w-3/4 bg-zinc-100 rounded-full" />
      </div>
    </div>

    {/* Bottom Area: Price & Action Button (Stacked, matching real card) */}
    <div className="mt-3 pt-2 space-y-2">
      <div className="h-5 w-1/3 bg-zinc-200/80 rounded-full" />
      <div className="w-full h-8 sm:h-9 bg-zinc-100 rounded-full" />
    </div>
  </div>
);

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialKind = (searchParams.get('kind') as ProductKind | 'all' | null) || 'all';
  const initialCategory = searchParams.get('category') || searchParams.get('type') || 'all';
  const initialQuery = searchParams.get('q') || '';
  const initialBrandsParam = searchParams.get('brands') || searchParams.get('brand');
  const initialBrands = initialBrandsParam
    ? initialBrandsParam.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const isSaleParam = searchParams.get('filter') === 'sale' || searchParams.get('filter') === 'discounts';
  const initialNotesParam = searchParams.get('notes') || searchParams.get('note');
  const initialNotes = initialNotesParam
    ? initialNotesParam.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const [selectedKind, setSelectedKind] = useState<ProductKind | 'all'>(initialKind);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrands);
  const [selectedNotes, setSelectedNotes] = useState<string[]>(initialNotes);
  const [popularNotes, setPopularNotes] = useState<{ note: string; count: number }[]>([]);
  const [noteSearch, setNoteSearch] = useState('');
  const [onlySale, setOnlySale] = useState(isSaleParam);
  const [priceMax, setPriceMax] = useState(200000);
  const [priceRange, setPriceRange] = useState(200000);
  const [debouncedPriceRange, setDebouncedPriceRange] = useState(200000);
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating' | 'new'>('popular');
  const [catalogSearch, setCatalogSearch] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');

  const [products, setProducts] = useState<Perfume[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<{ brand: string; count: number }[]>([]);

  // Smooth scroll on page change only
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  useEffect(() => {
    fetchMeta()
      .then(m => {
        setPriceMax(m.priceMax);
        setPriceRange(prev => (prev > m.priceMax ? m.priceMax : prev));
        setDebouncedPriceRange(prev => (prev > m.priceMax ? m.priceMax : prev));
      })
      .catch(() => {});

    fetchPopularNotes({ limit: 80 })
      .then(res => setPopularNotes(res))
      .catch(() => {});
  }, []);

  // Debounce price slider changes
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 250);
    return () => clearTimeout(t);
  }, [priceRange]);

  // Synchronize from searchParams when URL changes externally
  useEffect(() => {
    const kindParam = (searchParams.get('kind') as ProductKind | 'all' | null) || 'all';
    const catParam = searchParams.get('category') || searchParams.get('type') || 'all';
    const qParam = searchParams.get('q') || '';
    const isSale = searchParams.get('filter') === 'sale' || searchParams.get('filter') === 'discounts';
    const isNew = searchParams.get('filter') === 'new';
    const sortParam = (searchParams.get('sort') as any) || (isNew ? 'new' : 'popular');

    const brandsParam = searchParams.get('brands') || searchParams.get('brand');
    const parsedBrands = brandsParam ? brandsParam.split(',').map(s => s.trim()).filter(Boolean) : [];

    const notesParam = searchParams.get('notes') || searchParams.get('note');
    const parsedNotes = notesParam ? notesParam.split(',').map(s => s.trim()).filter(Boolean) : [];

    const maxPriceParam = searchParams.get('maxPrice');
    const parsedPrice = maxPriceParam ? Number(maxPriceParam) : priceMax;

    setSelectedKind(prev => (prev !== kindParam ? kindParam : prev));
    setSelectedCategory(prev => (prev !== catParam ? catParam : prev));
    setCatalogSearch(prev => (prev !== qParam ? qParam : prev));
    setOnlySale(prev => (prev !== isSale ? isSale : prev));
    setSortBy(prev => (prev !== sortParam ? sortParam : prev));
    setSelectedBrands(prev => {
      const prevStr = prev.slice().sort().join(',');
      const nextStr = parsedBrands.slice().sort().join(',');
      return prevStr !== nextStr ? parsedBrands : prev;
    });
    setSelectedNotes(prev => {
      const prevStr = prev.slice().sort().join(',');
      const nextStr = parsedNotes.slice().sort().join(',');
      return prevStr !== nextStr ? parsedNotes : prev;
    });
    if (maxPriceParam && Number(maxPriceParam) > 0) {
      setPriceRange(prev => (prev !== parsedPrice ? parsedPrice : prev));
    }
  }, [searchParams, priceMax]);

  // Sync state to URL without clobbering other active parameters
  const syncToUrl = useCallback((updates: {
    kind?: ProductKind | 'all';
    category?: string;
    brands?: string[];
    notes?: string[];
    onlySale?: boolean;
    priceRange?: number;
    sortBy?: string;
    catalogSearch?: string;
  }) => {
    const nextKind = updates.kind !== undefined ? updates.kind : selectedKind;
    const nextCat = updates.category !== undefined ? updates.category : selectedCategory;
    const nextBrands = updates.brands !== undefined ? updates.brands : selectedBrands;
    const nextNotes = updates.notes !== undefined ? updates.notes : selectedNotes;
    const nextSale = updates.onlySale !== undefined ? updates.onlySale : onlySale;
    const nextPrice = updates.priceRange !== undefined ? updates.priceRange : priceRange;
    const nextSort = updates.sortBy !== undefined ? updates.sortBy : sortBy;
    const nextSearch = updates.catalogSearch !== undefined ? updates.catalogSearch : catalogSearch;

    const sp = new URLSearchParams();
    if (nextSearch.trim()) sp.set('q', nextSearch.trim());
    if (nextKind && nextKind !== 'all') sp.set('kind', nextKind);
    if (nextCat && nextCat !== 'all') sp.set('category', nextCat);
    if (nextBrands.length) sp.set('brands', nextBrands.join(','));
    if (nextNotes.length) sp.set('notes', nextNotes.join(','));
    if (nextSale) sp.set('filter', 'sale');
    else if (nextSort === 'new') sp.set('filter', 'new');
    if (nextPrice < priceMax) sp.set('maxPrice', String(nextPrice));
    if (nextSort && nextSort !== 'popular' && nextSort !== 'new') sp.set('sort', nextSort);

    setSearchParams(sp, { replace: true });
  }, [selectedKind, selectedCategory, selectedBrands, selectedNotes, onlySale, priceRange, priceMax, sortBy, catalogSearch, setSearchParams]);

  const loadBrands = useCallback(() => {
    fetchBrands({
      q: brandSearch || undefined,
      kind: selectedKind === 'all' ? undefined : selectedKind,
      limit: 1000,
    }).then(res => {
      setBrands(res.filter(b => isPureBrand(b.brand)));
    });
  }, [brandSearch, selectedKind]);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  useEffect(() => {
    setPage(1);
  }, [selectedKind, selectedCategory, selectedBrands, selectedNotes, onlySale, debouncedPriceRange, catalogSearch, sortBy]);

  useEffect(() => {
    let cancelled = false;
    if (initialLoading) {
      setLoading(true);
    } else {
      setIsUpdating(true);
    }
    setError(null);

    const hasSearch = Boolean(catalogSearch.trim());
    fetchProducts({
      page,
      limit: PAGE_SIZE,
      q: hasSearch ? catalogSearch.trim() : undefined,
      kind: hasSearch ? 'all' : selectedKind,
      category: hasSearch ? undefined : (selectedCategory !== 'all' ? selectedCategory : undefined),
      brands: selectedBrands.length ? selectedBrands : undefined,
      notes: selectedNotes.length ? selectedNotes : undefined,
      maxPrice: debouncedPriceRange < priceMax ? debouncedPriceRange : undefined,
      sort: sortBy,
      isSale: onlySale,
    })
      .then(res => {
        if (cancelled) return;
        setProducts(res.items.map(listItemToPerfume));
        setTotal(res.total);
      })
      .catch(e => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Ошибка загрузки');
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          setInitialLoading(false);
          setIsUpdating(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, selectedKind, selectedCategory, selectedBrands, selectedNotes, onlySale, debouncedPriceRange, catalogSearch, sortBy, priceMax, initialLoading]);

  const toggleBrand = (brand: string) => {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(next);
    syncToUrl({ brands: next });
  };

  const toggleNote = (note: string) => {
    const next = selectedNotes.includes(note)
      ? selectedNotes.filter(n => n !== note)
      : [...selectedNotes, note];
    setSelectedNotes(next);
    syncToUrl({ notes: next });
  };

  const handleSelectKind = (k: ProductKind | 'all') => {
    setSelectedKind(k);
    setSelectedCategory('all');
    syncToUrl({ kind: k, category: 'all' });
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    syncToUrl({ category: cat });
  };

  const handleToggleOnlySale = (checked: boolean) => {
    setOnlySale(checked);
    syncToUrl({ onlySale: checked });
  };

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort);
    syncToUrl({ sortBy: newSort });
  };

  const handleCatalogSearchChange = (val: string) => {
    setCatalogSearch(val);
    syncToUrl({ catalogSearch: val });
  };

  const resetFilters = () => {
    setSelectedKind('all');
    setSelectedCategory('all');
    setSelectedBrands([]);
    setSelectedNotes([]);
    setOnlySale(false);
    setPriceRange(priceMax);
    setDebouncedPriceRange(priceMax);
    setCatalogSearch('');
    setSortBy('popular');
    setPage(1);
    setSearchParams({}, { replace: true });
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const activeFiltersCount =
    (selectedKind !== 'all' ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    selectedBrands.length +
    selectedNotes.length +
    (onlySale ? 1 : 0) +
    (priceRange < priceMax ? 1 : 0) +
    (catalogSearch ? 1 : 0);

  const filterPanel = (
    <div className="space-y-6">
      {/* Search Input in Pill Style */}
      <div className="relative">
        <input
          type="text"
          placeholder="Поиск по каталогу..."
          value={catalogSearch}
          onChange={e => handleCatalogSearchChange(e.target.value)}
          className="w-full bg-zinc-50 hover:bg-zinc-100/80 focus:bg-white border border-zinc-200/80 focus:border-black text-xs rounded-full pl-9 pr-9 py-2.5 outline-none font-light text-zinc-900 transition-all placeholder:text-zinc-400"
        />
        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        {catalogSearch && (
          <button
            type="button"
            onClick={() => handleCatalogSearchChange('')}
            className="w-6 h-6 rounded-full hover:bg-zinc-200 flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors"
            title="Очистить поиск"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Kind pills */}
      <div className="pt-4 border-t border-zinc-200/70">
        <div className="text-[11px] font-normal uppercase tracking-[0.16em] text-zinc-400 mb-2.5">
          Категория
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => handleSelectKind('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
              selectedKind === 'all'
                ? 'bg-black text-white font-normal shadow-2xs'
                : 'bg-zinc-100/70 hover:bg-zinc-200/70 text-zinc-700 font-light'
            }`}
          >
            Все
          </button>
          {PRODUCT_KIND_OPTIONS.map(k => (
            <button
              key={k.id}
              onClick={() => handleSelectKind(k.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                selectedKind === k.id
                  ? 'bg-black text-white font-normal shadow-2xs'
                  : 'bg-zinc-100/70 hover:bg-zinc-200/70 text-zinc-700 font-light'
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      {/* Segments if perfume */}
      {selectedKind === 'perfume' && (
        <div className="pt-4 border-t border-zinc-200/70">
          <div className="text-[11px] font-normal uppercase tracking-[0.16em] text-zinc-400 mb-2.5">
            Направление
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Все' },
              { id: 'decants', label: 'Распивы 1–20 мл' },
              { id: 'niche', label: 'Селектив & Ниша' },
              { id: 'arabian', label: 'Арабские' },
              { id: 'luxury', label: 'Люкс' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-black text-white font-normal shadow-2xs'
                    : 'bg-zinc-100/70 hover:bg-zinc-200/70 text-zinc-700 font-light'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sale filter */}
      <div className="pt-4 border-t border-zinc-200/70">
        <label className="flex items-center justify-between cursor-pointer select-none group">
          <span className="text-xs text-zinc-800 font-light group-hover:text-black transition-colors flex items-center gap-2">
            <span>Специальные предложения</span>
            <span className="text-[10px] bg-zinc-900 text-white px-2 py-0.5 rounded-full font-light">
              Sale
            </span>
          </span>
          <input
            type="checkbox"
            checked={onlySale}
            onChange={e => handleToggleOnlySale(e.target.checked)}
            className="w-4 h-4 rounded-full accent-black cursor-pointer"
          />
        </label>
      </div>

      {/* Price filter */}
      <div className="pt-4 border-t border-zinc-200/70">
        <div className="flex items-center justify-between text-xs text-zinc-900 mb-2">
          <span className="text-[11px] uppercase tracking-[0.14em] text-zinc-400 font-normal">
            Цена до:
          </span>
          <span className="font-medium tabular-nums">{priceRange.toLocaleString('ru-RU')} ₽</span>
        </div>
        <input
          type="range"
          min={500}
          max={priceMax}
          step={500}
          value={Math.min(priceRange, priceMax)}
          onChange={e => setPriceRange(Number(e.target.value))}
          className="w-full accent-black h-1.5 bg-zinc-200 rounded-full cursor-pointer"
        />
      </div>

      {/* Notes and chords */}
      <div className="pt-4 border-t border-zinc-200/70">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-[11px] uppercase tracking-[0.14em] text-zinc-400 font-normal">
            Ноты и аккорды
          </span>
          {selectedNotes.length > 0 && (
            <button
              onClick={() => {
                setSelectedNotes([]);
                syncToUrl({ notes: [] });
              }}
              className="text-[10px] text-zinc-400 hover:text-black uppercase tracking-wider font-light"
            >
              Сброс ({selectedNotes.length})
            </button>
          )}
        </div>
        <input
          type="text"
          placeholder="Поиск ноты (ваниль, уд...)..."
          value={noteSearch}
          onChange={e => setNoteSearch(e.target.value)}
          className="w-full mb-2.5 bg-zinc-50 border border-zinc-200/80 text-xs rounded-full px-3 py-1.5 outline-none focus:border-black focus:bg-white font-light text-zinc-800"
        />
        <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto pr-1 no-scrollbar">
          {popularNotes
            .filter(n => !noteSearch.trim() || n.note.toLowerCase().includes(noteSearch.trim().toLowerCase()))
            .map(({ note, count }) => {
              const isSelected = selectedNotes.includes(note);
              return (
                <button
                  key={note}
                  type="button"
                  onClick={() => toggleNote(note)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-black text-white border-black font-normal shadow-2xs'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-black hover:text-black font-light'
                  }`}
                >
                  <span>{note}</span>
                  <span className={`text-[9px] tabular-nums ${isSelected ? 'text-zinc-300' : 'text-zinc-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      {/* Brands list */}
      <div className="pt-4 border-t border-zinc-200/70">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-[11px] uppercase tracking-[0.14em] text-zinc-400 font-normal">
            Бренды
          </span>
          {selectedBrands.length > 0 && (
            <button
              onClick={() => {
                setSelectedBrands([]);
                syncToUrl({ brands: [] });
              }}
              className="text-[10px] text-zinc-400 hover:text-black uppercase tracking-wider font-light"
            >
              Сброс ({selectedBrands.length})
            </button>
          )}
        </div>
        <input
          type="text"
          placeholder="Поиск бренда..."
          value={brandSearch}
          onChange={e => setBrandSearch(e.target.value)}
          className="w-full mb-2.5 bg-zinc-50 border border-zinc-200/80 text-xs rounded-full px-3 py-1.5 outline-none focus:border-black focus:bg-white font-light text-zinc-800"
        />
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1 no-scrollbar">
          {brands.map(({ brand, count }) => (
            <label
              key={brand}
              className="group flex items-center justify-between gap-2 text-xs text-zinc-700 hover:text-black cursor-pointer py-1 px-2 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="rounded-full accent-black cursor-pointer"
                />
                <span className="font-light truncate text-delicate">{brand}</span>
              </div>
              <span className="text-[10px] tabular-nums text-zinc-400 group-hover:text-zinc-900 transition-colors shrink-0">
                {count}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const catalogTitle = selectedBrands.length === 1
    ? `Парфюмерия ${selectedBrands[0]} — оригиналы и распивы | Maison Arôme`
    : catalogSearch
    ? `Поиск: ${catalogSearch} | Maison Arôme`
    : selectedCategory !== 'all'
    ? `${selectedCategory} — каталог | Maison Arôme`
    : 'Каталог оригинальной парфюмерии и распивов | Maison Arôme';

  const catalogDesc = selectedBrands.length === 1
    ? `Оригинальная парфюмерия ${selectedBrands[0]} в интернет-магазине Maison Arôme. Распивы от 1 мл и целые флаконы. Доставка по всей России.`
    : `Каталог оригинальной парфюмерии и уходовой косметики Maison Arôme. Более ${total.toLocaleString('ru-RU')} товаров: ниша, селектив, люкс, распивы от 1 мл. Быстрая доставка по РФ.`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <SEO
        title={catalogTitle}
        description={catalogDesc}
        canonical="https://maison-arome.ru/catalog"
      />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-200/70">
        <div>
          <span className="text-[11px] font-normal uppercase tracking-[0.16em] text-zinc-400">
            Maison Arôme Collection
          </span>
          <h1 className="text-2xl sm:text-4xl font-light text-zinc-950 mt-0.5 tracking-tight">
            Каталог ароматов
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-light text-delicate">
            Оригинальные флаконы и распивы · найдено {total.toLocaleString('ru-RU')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden pill-btn-outline py-2 px-4 rounded-full text-xs font-light flex items-center gap-2"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Фильтры</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] font-medium flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <select
            value={sortBy}
            onChange={e => handleSortChange(e.target.value as typeof sortBy)}
            className="bg-white border border-zinc-200/80 hover:border-black text-xs font-light rounded-full px-4 py-2 outline-none cursor-pointer transition-colors shadow-2xs"
          >
            <option value="popular">По популярности</option>
            <option value="price_asc">Сначала доступные</option>
            <option value="price_desc">Сначала премиальные</option>
            <option value="rating">По рейтингу</option>
            <option value="new">Новинки</option>
          </select>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-10">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200/70">
            <span className="text-[11px] font-normal uppercase tracking-[0.16em] text-zinc-400">
              Фильтры
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-zinc-500 hover:text-black flex items-center gap-1 font-light cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Сбросить ({activeFiltersCount})</span>
              </button>
            )}
          </div>
          {filterPanel}
        </aside>

        {/* Product Grid Area */}
        <section className="lg:col-span-3 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 text-xs border border-rose-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center bg-zinc-50 rounded-[32px] border border-zinc-200/70 space-y-4 px-4">
              <h3 className="text-lg font-light text-zinc-900">По вашему запросу ничего не найдено</h3>
              <p className="text-xs text-zinc-500 font-light max-w-sm mx-auto">
                Попробуйте изменить параметры поиска или сбросить активные фильтры.
              </p>
              <button
                onClick={resetFilters}
                className="pill-btn-black py-2.5 px-6 rounded-full text-xs font-light inline-block cursor-pointer"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className={`relative transition-opacity duration-200 ${isUpdating ? 'opacity-60' : 'opacity-100'}`}>
              {isUpdating && (
                <div className="absolute -top-3 left-0 right-0 h-0.5 bg-black animate-pulse z-10" />
              )}
              {/* Clean White Borderless Product Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                {products.map(perfume => (
                  <ProductCard key={perfume.id} perfume={perfume} />
                ))}
              </div>

              {/* Minimal Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-10 border-t border-zinc-200/70 mt-8">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="w-9 h-9 rounded-full border border-zinc-200 hover:border-black flex items-center justify-center disabled:opacity-25 transition-colors cursor-pointer"
                    aria-label="Предыдущая страница"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-light text-zinc-600 px-3 tabular-nums">
                    Страница {page} из {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="w-9 h-9 rounded-full border border-zinc-200 hover:border-black flex items-center justify-center disabled:opacity-25 transition-colors cursor-pointer"
                    aria-label="Следующая страница"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-sm bg-white h-full p-6 overflow-y-auto shadow-2xl flex flex-col rounded-l-[32px] border-l border-zinc-200 z-10 transform transition-transform duration-300 ease-out animate-in slide-in-from-right">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200/70">
              <span className="text-xs font-normal uppercase tracking-[0.16em] text-zinc-950 flex items-center gap-2">
                <span>Фильтры</span>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 bg-black text-white text-[10px] rounded-full font-light tabular-nums">
                    {activeFiltersCount}
                  </span>
                )}
              </span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Закрыть фильтры"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4 py-4">{filterPanel}</div>

            <div className="pt-3 border-t border-zinc-200/70 flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="pill-btn-outline py-3 px-4 rounded-full text-xs font-light text-zinc-700 cursor-pointer"
                >
                  Сбросить
                </button>
              )}
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 pill-btn-black py-3 rounded-full text-xs font-light cursor-pointer text-center"
              >
                Показать {total.toLocaleString('ru-RU')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
