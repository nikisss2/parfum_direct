import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchBrands, fetchMeta, fetchProducts, fetchPopularNotes, listItemToPerfume } from '../api/catalog';
import { ProductCard } from '../components/ProductCard';
import { Gender, Perfume, ProductKind, PRODUCT_KIND_OPTIONS } from '../types';
import { isPureBrand } from '../data/brandsData';
import { SlidersHorizontal, X, Search, RotateCcw, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const PAGE_SIZE = 24;

const ProductCardSkeleton: React.FC = () => (
  <div className="flex flex-col bg-white border border-zinc-100 p-2 sm:p-3 animate-pulse">
    <div className="relative aspect-square sm:aspect-[4/5] bg-[#f4f4f5] flex items-center justify-center p-3 sm:p-4">
      <div className="w-1/3 h-3/5 bg-zinc-200/80 rounded-none" />
      <div className="absolute top-2.5 left-2.5 w-10 h-3.5 bg-zinc-200/70" />
    </div>
    <div className="pt-2.5 flex flex-col flex-1 space-y-2">
      <div className="h-2 w-1/4 bg-zinc-200" />
      <div className="h-3 w-1/2 bg-zinc-200" />
      <div className="space-y-1">
        <div className="h-3.5 w-4/5 bg-zinc-200" />
        <div className="h-3 w-2/3 bg-zinc-100" />
      </div>
      <div className="flex gap-1 pt-1">
        <div className="h-5 w-10 bg-zinc-100 border border-zinc-200" />
        <div className="h-5 w-10 bg-zinc-100 border border-zinc-200" />
        <div className="h-5 w-10 bg-zinc-100 border border-zinc-200" />
      </div>
      <div className="pt-2 flex items-baseline justify-between">
        <div className="h-5 w-1/3 bg-zinc-200" />
        <div className="h-3 w-1/4 bg-zinc-100" />
      </div>
      <div className="h-10 w-full bg-zinc-100 border border-zinc-200 mt-2" />
    </div>
  </div>
);

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialKind = (searchParams.get('kind') as ProductKind | 'all' | null) || 'all';
  const initialCategory = searchParams.get('category') || 'all';
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
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating' | 'new'>('popular');
  const [catalogSearch, setCatalogSearch] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');

  const [products, setProducts] = useState<Perfume[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<{ brand: string; count: number }[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  useEffect(() => {
    fetchMeta()
      .then(m => {
        setPriceMax(m.priceMax);
        setPriceRange(prev => (prev > m.priceMax ? m.priceMax : prev));
      })
      .catch(() => {});

    fetchPopularNotes({ limit: 80 })
      .then(res => setPopularNotes(res))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const kindParam = searchParams.get('kind') as ProductKind | 'all' | null;
    setSelectedKind(kindParam || 'all');
    const catParam = searchParams.get('category');
    setSelectedCategory(catParam || 'all');
    const qParam = searchParams.get('q');
    setCatalogSearch(qParam !== null ? qParam : '');
    if (searchParams.get('filter') === 'new') setSortBy('new');
    const isSale = searchParams.get('filter') === 'sale' || searchParams.get('filter') === 'discounts';
    setOnlySale(isSale);

    const brandsParam = searchParams.get('brands') || searchParams.get('brand');
    if (brandsParam) {
      setSelectedBrands(brandsParam.split(',').map(s => s.trim()).filter(Boolean));
    } else {
      setSelectedBrands([]);
    }

    const notesParam = searchParams.get('notes') || searchParams.get('note');
    if (notesParam) {
      setSelectedNotes(notesParam.split(',').map(s => s.trim()).filter(Boolean));
    } else {
      setSelectedNotes([]);
    }
  }, [searchParams]);

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
  }, [selectedKind, selectedCategory, selectedBrands, selectedNotes, onlySale, priceRange, catalogSearch, sortBy]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
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
      maxPrice: priceRange,
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
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, selectedKind, selectedCategory, selectedBrands, selectedNotes, onlySale, priceRange, catalogSearch, sortBy]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const toggleNote = (note: string) => {
    setSelectedNotes(prev =>
      prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note]
    );
  };

  const handleToggleOnlySale = (checked: boolean) => {
    setOnlySale(checked);
    const sp = new URLSearchParams(searchParams);
    if (checked) {
      sp.set('filter', 'sale');
    } else {
      sp.delete('filter');
    }
    setSearchParams(sp, { replace: true });
  };

  const handleCatalogSearchChange = (val: string) => {
    setCatalogSearch(val);
    const sp = new URLSearchParams(searchParams);
    if (val.trim()) {
      // Global search across the entire store: reset kind and category
      setSelectedKind('all');
      setSelectedCategory('all');
      sp.set('q', val.trim());
      sp.delete('kind');
      sp.delete('category');
    } else {
      sp.delete('q');
    }
    setSearchParams(sp, { replace: true });
  };

  const resetFilters = () => {
    setSelectedKind('all');
    setSelectedCategory('all');
    setSelectedBrands([]);
    setSelectedNotes([]);
    setOnlySale(false);
    setPriceRange(priceMax);
    setCatalogSearch('');
    setSortBy('popular');
    setPage(1);
    setSearchParams({});
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
    <>
      <div className="relative">
        <input
          type="text"
          placeholder="Поиск по всему каталогу..."
          value={catalogSearch}
          onChange={e => handleCatalogSearchChange(e.target.value)}
          className="w-full bg-white border border-zinc-300 text-xs rounded-none pl-8 pr-8 py-2.5 outline-none focus:border-black font-medium transition-colors"
        />
        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        {catalogSearch && (
          <button
            type="button"
            onClick={() => handleCatalogSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors"
            title="Очистить поиск"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="pt-4 border-t border-zinc-200">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-950 mb-2.5">Вид товара</div>
        <div className="space-y-1">
          <button
            onClick={() => {
              setSelectedKind('all');
              setSelectedCategory('all');
              setSelectedBrands([]);
            }}
            className={`w-full text-left px-3 py-2 rounded-none text-xs uppercase tracking-wider font-semibold transition-colors ${
              selectedKind === 'all' ? 'bg-black text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-black'
            }`}
          >
            Все товары
          </button>
          {PRODUCT_KIND_OPTIONS.map(k => (
            <button
              key={k.id}
              onClick={() => {
                setSelectedKind(k.id);
                setSelectedCategory('all');
                setSelectedBrands([]);
              }}
              className={`w-full text-left px-3 py-2 rounded-none text-xs uppercase tracking-wider font-semibold transition-colors ${
                selectedKind === k.id ? 'bg-black text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-black'
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>

      {selectedKind === 'perfume' && (
        <div className="pt-4 border-t border-zinc-200">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-950 mb-2.5">Сегмент парфюмерии</div>
          <div className="space-y-1">
            {[
              { id: 'all', label: 'Вся парфюмерия' },
              { id: 'niche', label: 'Нишевая' },
              { id: 'arabian', label: 'Арабская' },
              { id: 'luxury', label: 'Люксовая' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full text-left px-3 py-2 rounded-none text-xs uppercase tracking-wider font-semibold transition-colors ${
                  selectedCategory === cat.id ? 'bg-black text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-black'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-zinc-200">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlySale}
            onChange={e => handleToggleOnlySale(e.target.checked)}
            className="rounded-none border-zinc-400 accent-[#5A6B32] w-4 h-4 cursor-pointer"
          />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
            <span>Только со скидкой</span>
            <span className="text-[9px] bg-[#5A6B32] text-white px-1.5 py-0.2 font-mono">SALE</span>
          </span>
        </label>
      </div>

      <div className="pt-4 border-t border-zinc-200">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-950 mb-2">
          <span>Цена до:</span>
          <span>{priceRange.toLocaleString('ru-RU')} ₽</span>
        </div>
        <input
          type="range"
          min={500}
          max={priceMax}
          step={500}
          value={Math.min(priceRange, priceMax)}
          onChange={e => setPriceRange(Number(e.target.value))}
          className="w-full accent-black h-1.5 bg-zinc-200 rounded-none cursor-pointer"
        />
      </div>

      <div className="pt-4 border-t border-zinc-200">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-950 mb-2">
          <span>Ноты и аккорды</span>
          {selectedNotes.length > 0 && (
            <button
              onClick={() => setSelectedNotes([])}
              className="text-[10px] text-zinc-400 hover:text-black uppercase tracking-wider font-semibold"
            >
              Сброс ({selectedNotes.length})
            </button>
          )}
        </div>
        <input
          type="text"
          placeholder="Найти ноту (ваниль, уд, табак...)..."
          value={noteSearch}
          onChange={e => setNoteSearch(e.target.value)}
          className="w-full mb-2 bg-white border border-zinc-300 text-xs rounded-none px-2.5 py-2 outline-none focus:border-black font-medium"
        />
        <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto pr-1">
          {popularNotes
            .filter(n => !noteSearch.trim() || n.note.toLowerCase().includes(noteSearch.trim().toLowerCase()))
            .map(({ note, count }) => {
              const isSelected = selectedNotes.includes(note);
              return (
                <button
                  key={note}
                  type="button"
                  onClick={() => toggleNote(note)}
                  className={`text-[11px] px-2 py-0.5 uppercase tracking-wider font-medium border transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-black text-white border-black'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-black hover:text-black'
                  }`}
                >
                  <span>{note}</span>
                  <span className={`text-[9px] font-mono ${isSelected ? 'text-zinc-300' : 'text-zinc-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-200">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-950 mb-2">Бренды</div>
        <input
          type="text"
          placeholder="Найти бренд..."
          value={brandSearch}
          onChange={e => setBrandSearch(e.target.value)}
          className="w-full mb-2 bg-white border border-zinc-300 text-xs rounded-none px-2.5 py-2 outline-none focus:border-black"
        />
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {brands.map(({ brand, count }) => (
            <label key={brand} className="group flex items-center justify-between gap-2 text-xs text-zinc-700 hover:text-black cursor-pointer py-0.5">
              <div className="flex items-center gap-2 min-w-0">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="rounded-none border-zinc-400 accent-black"
                />
                <span className="font-medium truncate">{brand}</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400 group-hover:text-zinc-950 transition-colors shrink-0">
                {count}
              </span>
            </label>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl sm:text-4xl font-normal font-serif text-zinc-950">Каталог</h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-mono">
            Парфюмерия и профессиональный уход · найдено {total.toLocaleString('ru-RU')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2.5 rounded-none border border-black bg-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-black hover:text-white transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Фильтры {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="bg-white border border-zinc-300 text-xs font-bold uppercase tracking-wider rounded-none px-3.5 py-2.5 outline-none focus:border-black cursor-pointer"
          >
            <option value="popular">По популярности</option>
            <option value="price_asc">Дешевле</option>
            <option value="price_desc">Дороже</option>
            <option value="rating">По рейтингу</option>
            <option value="new">Новинки</option>
          </select>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        <aside className="hidden lg:block space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-widest text-zinc-950">Фильтры</span>
            {activeFiltersCount > 0 && (
              <button onClick={resetFilters} className="text-xs text-zinc-500 hover:text-black uppercase tracking-wider flex items-center gap-1 font-semibold">
                <RotateCcw className="w-3 h-3" /> Сбросить
              </button>
            )}
          </div>
          {filterPanel}
        </aside>

        <section className="lg:col-span-3 space-y-6">
          {error && (
            <div className="p-4 rounded-none bg-rose-50 text-rose-800 text-xs border border-rose-200">
              {error}. Запустите API: <code className="text-xs">npm run api</code> или{' '}
              <code className="text-xs">npm run dev:all</code>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center bg-zinc-50 rounded-none border border-zinc-200 space-y-4">
              <h3 className="font-serif text-lg text-zinc-900">По вашему запросу ничего не найдено</h3>
              <button onClick={resetFilters} className="px-6 py-3 bg-black text-white rounded-none text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors">
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                {products.map(perfume => (
                  <ProductCard key={perfume.id} perfume={perfume} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-6 border-t border-zinc-200">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="w-10 h-10 rounded-none border border-zinc-300 hover:border-black flex items-center justify-center disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs uppercase tracking-wider font-mono text-zinc-700 px-3">
                    Стр. {page} из {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="w-10 h-10 rounded-none border border-zinc-300 hover:border-black flex items-center justify-center disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative ml-auto w-full max-w-sm bg-white h-full p-6 overflow-y-auto shadow-2xl flex flex-col rounded-none border-l border-zinc-900">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <span className="font-bold text-xs uppercase tracking-widest text-zinc-950">Фильтры</span>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 space-y-4 py-4">{filterPanel}</div>
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-4 bg-black text-white rounded-none text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
            >
              Показать ({total.toLocaleString('ru-RU')})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
