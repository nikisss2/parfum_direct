import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { fetchProducts, listItemToPerfume } from '../api/catalog';
import { POPULAR_BRANDS, UNIQUE_PURE_BRANDS, isPureBrand } from '../data/brandsData';
import type { Perfume } from '../types';
import {
  Search,
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Camera,
  Truck,
  Star,
  ArrowRight,
  Check,
  Gift,
  CreditCard
} from 'lucide-react';

export const Header: React.FC = () => {
  const { cartTotalCount, cartTotalPrice, wishlist, user } = useShop();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation drawer state ('catalog' | 'brands' | null)
  const [navDrawerTab, setNavDrawerTab] = useState<'catalog' | 'brands' | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string>('perfume');
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string>('ALL');

  // "Клиентам" dropdown menu state
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Search autocomplete state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<Perfume[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close menus on route change or Escape
  useEffect(() => {
    setNavDrawerTab(null);
    setSearchOpen(false);
    setMoreMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNavDrawerTab(null);
        setSearchOpen(false);
        setMoreMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close search, city, and client dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autocomplete fetch
  useEffect(() => {
    const q = searchValue.trim();
    if (!q || q.length < 2) {
      setSearchResults([]);
      return;
    }
    const t = window.setTimeout(() => {
      fetchProducts({ q, limit: 5, sort: 'popular' })
        .then(r => setSearchResults(r.items.map(listItemToPerfume)))
        .catch(() => setSearchResults([]));
    }, 250);
    return () => window.clearTimeout(t);
  }, [searchValue]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setSearchOpen(false);
      navigate(`/catalog?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  // Filter pure brands by search query and letter
  const filteredBrands = useMemo(() => {
    const q = brandSearchQuery.trim().toLowerCase();
    return UNIQUE_PURE_BRANDS.filter(b => {
      if (!isPureBrand(b.name)) return false;
      if (q) {
        const bName = b.name.toLowerCase();
        const bQuery = b.searchQuery.toLowerCase();
        const isLvSearch = q.includes('vitton') || q.includes('vuitton') || q.includes('виттон') || q.includes('витон') || q.includes('луи');
        const isLvBrand = bName.includes('vuitton') || bName.includes('vitton');
        const matches = bName.includes(q) || bQuery.includes(q) || (isLvSearch && isLvBrand);
        if (!matches) return false;
      }
      if (selectedLetter !== 'ALL') {
        const first = b.name[0]?.toUpperCase();
        if (selectedLetter === '#') {
          if (/[A-ZА-Я]/.test(first)) return false;
        } else if (first !== selectedLetter) {
          return false;
        }
      }
      return true;
    });
  }, [brandSearchQuery, selectedLetter]);

  // Available alphabet letters
  const alphabet = useMemo(() => {
    return [
      'ALL',
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      '#'
    ];
  }, []);

  const handleBrandClick = (searchQuery: string) => {
    setNavDrawerTab(null);
    navigate(`/catalog?brands=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
        {/* Row 1: City selector (Left) | Centered Logo (Center) | 4 Clean Icons (Right) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4 relative">
          {/* Left section: Hamburger (Mobile) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-[40px] sm:min-w-[170px]">
            <button
              type="button"
              onClick={() => setNavDrawerTab(navDrawerTab ? null : 'catalog')}
              className="md:hidden p-1.5 text-zinc-800 hover:text-black transition-colors cursor-pointer"
              aria-label="Меню навигации"
            >
              {navDrawerTab ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Center section: Logo Centered prominently */}
          <div className="flex-1 flex justify-center items-center">
            <Link
              to="/"
              className="flex items-center justify-center select-none group py-1"
              aria-label="Maison Arôme — На главную"
            >
              <img
                src="/assets/branding/логотип_2.png"
                alt="Maison Arôme"
                className="h-9 sm:h-11 md:h-12 w-auto object-contain transition-opacity duration-200"
              />
            </Link>
          </div>

          {/* Right section: 4 Clean Icons: Search, Wishlist, Account, Cart */}
          <div className="flex items-center gap-0.5 sm:gap-2 shrink-0 min-w-[120px] sm:min-w-[170px] justify-end">
            {/* 1. Search Icon */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="p-2 sm:p-2.5 text-zinc-900 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
              aria-label="Поиск по ароматам"
              title="Поиск"
            >
              <Search className="w-5 h-5 stroke-[1.7]" />
            </button>

            {/* 2. Wishlist Icon */}
            <Link
              to="/wishlist"
              className="p-2 sm:p-2.5 text-zinc-900 hover:text-black hover:bg-zinc-100 transition-colors relative"
              aria-label="Избранное"
              title="Избранное"
            >
              <Heart className="w-5 h-5 stroke-[1.7]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-black text-[10px] text-white font-bold flex items-center justify-center leading-none rounded-none shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* 3. Account / Profile Icon */}
            <Link
              to="/account"
              className="p-2 sm:p-2.5 text-zinc-900 hover:text-black hover:bg-zinc-100 transition-colors flex items-center gap-1.5"
              aria-label="Личный кабинет"
              title="Профиль"
            >
              <UserIcon className="w-5 h-5 stroke-[1.7]" />
              {user && (
                <span className="hidden xl:inline text-xs font-semibold uppercase tracking-wider text-zinc-900 max-w-[90px] truncate">
                  {user.fullName.split(' ')[0]}
                </span>
              )}
            </Link>

            {/* 4. Cart Button */}
            <Link
              to="/cart"
              className="p-2 sm:px-3 sm:py-2 bg-black text-white hover:bg-zinc-800 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              aria-label="Корзина"
              title="Корзина"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartTotalCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-[#5A6B32] text-white text-[10px] font-bold flex items-center justify-center leading-none rounded-none shadow-xs">
                    {cartTotalCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">
                {cartTotalPrice > 0 ? `${cartTotalPrice.toLocaleString('ru-RU')} ₽` : 'Корзина'}
              </span>
            </Link>
          </div>
        </div>

        {/* Row 2: Clean Golden Apple Style Navigation Bar - Centered & Compact, NO horizontal scrolling */}
        <div className="hidden md:block border-t border-zinc-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <nav className="flex items-center justify-center gap-7 lg:gap-10 py-2.5 text-sm lg:text-[15px] tracking-wide select-none">
              {/* 1. КАТАЛОГ */}
              <button
                type="button"
                onClick={() => setNavDrawerTab(navDrawerTab === 'catalog' ? null : 'catalog')}
                className={`transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 lowercase ${
                  navDrawerTab === 'catalog' ? 'text-black font-bold' : 'text-zinc-800 hover:text-black font-medium'
                }`}
              >
                <span>каталог</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${navDrawerTab === 'catalog' ? 'rotate-180' : ''}`} />
              </button>

              {/* 2. БРЕНДЫ */}
              <button
                type="button"
                onClick={() => setNavDrawerTab(navDrawerTab === 'brands' ? null : 'brands')}
                className={`transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 lowercase ${
                  navDrawerTab === 'brands' ? 'text-black font-bold' : 'text-zinc-800 hover:text-black font-medium'
                }`}
              >
                <span>бренды</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${navDrawerTab === 'brands' ? 'rotate-180' : ''}`} />
              </button>

              {/* 3. КОНСТРУКТОР */}
              <Link
                to="/aromabox"
                className="text-zinc-800 hover:text-black transition-colors whitespace-nowrap flex items-center gap-1.5 lowercase font-medium"
              >
                <span>конструктор</span>
                <span className="text-[9px] bg-black text-white px-1 py-0.2 uppercase font-bold tracking-wider">box</span>
              </Link>

              {/* 4. АКЦИИ */}
              <Link
                to="/catalog?filter=sale"
                className="text-zinc-800 hover:text-black transition-colors whitespace-nowrap lowercase font-medium"
              >
                акции
              </Link>

              {/* 5. РАСПИВЫ */}
              <Link
                to="/catalog?category=decants"
                className="text-zinc-800 hover:text-black transition-colors whitespace-nowrap lowercase font-medium"
              >
                распивы
              </Link>

              {/* 6. ГРУППА: КЛИЕНТАМ (Сертификаты, карта лояльности, почему дешевле, отзывы, галерея, доставка) */}
              <div ref={moreMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  onMouseEnter={() => setMoreMenuOpen(true)}
                  className={`transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 lowercase font-medium py-1 ${
                    moreMenuOpen ? 'text-black font-bold' : 'text-zinc-800 hover:text-black'
                  }`}
                >
                  <span>клиентам</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Popover */}
                {moreMenuOpen && (
                  <div
                    onMouseLeave={() => setMoreMenuOpen(false)}
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-72 bg-white border border-zinc-200 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-4 py-2 border-b border-zinc-100 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Сервисы и привилегии
                    </div>

                    <Link
                      to="/certificates"
                      onClick={() => setMoreMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-zinc-50 transition-colors text-zinc-800 hover:text-black group"
                    >
                      <div className="w-7 h-7 rounded-none bg-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                        <Gift className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-950">Подарочные сертификаты</div>
                        <div className="text-[11px] text-zinc-500">Электронные от 3 000 ₽</div>
                      </div>
                    </Link>

                    <Link
                      to="/loyalty"
                      onClick={() => setMoreMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-zinc-50 transition-colors text-zinc-800 hover:text-black group"
                    >
                      <div className="w-7 h-7 rounded-none bg-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-950">Бонусная карта</div>
                        <div className="text-[11px] text-zinc-500">Кэшбэк до 10% за заказы</div>
                      </div>
                    </Link>

                    <Link
                      to="/why-cheaper"
                      onClick={() => setMoreMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-zinc-50 transition-colors text-zinc-800 hover:text-black group"
                    >
                      <div className="w-7 h-7 rounded-none bg-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-950">Почему дешевле?</div>
                        <div className="text-[11px] text-zinc-500">Прямой импорт без наценок</div>
                      </div>
                    </Link>

                    <div className="my-1 border-t border-zinc-100"></div>

                    <Link
                      to="/reviews"
                      onClick={() => setMoreMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-zinc-50 transition-colors text-zinc-800 hover:text-black group"
                    >
                      <div className="w-7 h-7 rounded-none bg-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                        <Star className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-950">Отзывы покупателей</div>
                        <div className="text-[11px] text-zinc-500">Рейтинг 5.0★ от клиентов</div>
                      </div>
                    </Link>

                    <Link
                      to="/gallery"
                      onClick={() => setMoreMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-zinc-50 transition-colors text-zinc-800 hover:text-black group"
                    >
                      <div className="w-7 h-7 rounded-none bg-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                        <Camera className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-950">Галерея заказов</div>
                        <div className="text-[11px] text-zinc-500">Фото готовых посылок</div>
                      </div>
                    </Link>

                    <Link
                      to="/delivery"
                      onClick={() => setMoreMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-zinc-50 transition-colors text-zinc-800 hover:text-black group"
                    >
                      <div className="w-7 h-7 rounded-none bg-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-950">Доставка и оплата</div>
                        <div className="text-[11px] text-zinc-500">СДЭК и Яндекс по всей РФ</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* GOLDEN APPLE (ЗЯ) SEARCH OVERLAY (DESKTOP & MOBILE WITH FULL AUTOCOMPLETE) */}
      {/* ========================================================================= */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300 flex flex-col justify-start">
          <div
            ref={searchRef}
            className="bg-white border-b border-black shadow-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-top duration-300 ease-out"
          >
            {/* Search Input Bar */}
            <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-4 pb-3 flex items-center gap-3">
              <form onSubmit={handleSearchSubmit} className="relative flex-1">
                <Search className="w-5 h-5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Поиск по аромату, бренду или нотам..."
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-zinc-100 border border-zinc-300 focus:border-black text-sm text-zinc-950 outline-none rounded-none"
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchValue('');
                      setSearchResults([]);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-black cursor-pointer"
                    title="Очистить"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="px-4 py-3 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
              >
                Закрыть
              </button>
            </div>

            {/* Results or Popular Queries */}
            <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pb-6 overflow-y-auto">
              {searchValue.trim() ? (
                searchResults.length > 0 ? (
                  <div className="divide-y divide-zinc-100 pt-2">
                    <div className="py-2 text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex justify-between">
                      <span>Результаты поиска ({searchResults.length})</span>
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="text-black hover:underline cursor-pointer font-bold"
                      >
                        Смотреть все в каталоге →
                      </button>
                    </div>
                    {searchResults.map(perf => (
                      <Link
                        key={perf.id}
                        to={`/product/${perf.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="py-3 px-2 flex items-center gap-3 hover:bg-zinc-50 transition-colors group"
                      >
                        <img
                          src={perf.images[0] || '/assets/placeholder-product.svg'}
                          alt=""
                          className="w-12 h-12 object-contain bg-zinc-50 border border-zinc-200 shrink-0 p-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider truncate">
                            {perf.brand}
                          </div>
                          <div className="text-sm font-semibold text-zinc-950 truncate group-hover:text-black">
                            {perf.name}
                          </div>
                          <div className="text-xs text-zinc-600 mt-0.5">
                            {perf.volumes?.[0]?.label} · от {(perf.minPrice || 0).toLocaleString('ru-RU')} ₽
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-black shrink-0" />
                      </Link>
                    ))}
                    <div className="pt-3 text-center">
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-xs font-bold uppercase tracking-wider text-black transition-colors cursor-pointer"
                      >
                        Показать все результаты для «{searchValue}»
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm text-zinc-500">
                    По запросу «{searchValue}» ничего не найдено.
                  </div>
                )
              ) : (
                <div className="pt-2 space-y-3">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    Популярные запросы
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Baccarat Rouge 540',
                      'Creed Aventus',
                      'Tom Ford Tobacco Vanille',
                      'Ganymede',
                      'Lattafa Khamrah',
                      'Delina',
                      'Fleur Narcotique',
                      'Lost Cherry',
                      'Angels Share',
                      'Le Labo Santal 33'
                    ].map(chip => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          setSearchValue(chip);
                        }}
                        className="px-3 py-1.5 border border-zinc-200 hover:border-black bg-white hover:bg-zinc-50 text-xs text-zinc-900 transition-colors cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULL GOLDEN APPLE (ЗЯ) NAVIGATION MEGA-MENU DRAWER (Screenshot 2 style)   */}
      {/* ========================================================================= */}
      {navDrawerTab && (
        <div className="fixed inset-0 top-[64px] md:top-[105px] z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-start animate-in fade-in duration-300">
          <div
            className="w-full bg-white border-b border-zinc-200 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-top duration-300 ease-out"
            onClick={e => e.stopPropagation()}
          >
            {/* Top Navigation Tabs Header (каталог | бренды | конструктор | акции) */}
            <div className="border-b border-zinc-200 px-4 sm:px-8 bg-white flex items-center justify-between">
              <div className="flex items-center gap-6 sm:gap-10">
                <button
                  type="button"
                  onClick={() => setNavDrawerTab('catalog')}
                  className={`py-3.5 sm:py-4 text-base sm:text-lg tracking-tight lowercase transition-all select-none relative cursor-pointer ${
                    navDrawerTab === 'catalog'
                      ? 'font-bold text-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-black'
                      : 'font-normal text-zinc-500 hover:text-black'
                  }`}
                >
                  каталог
                </button>

                <button
                  type="button"
                  onClick={() => setNavDrawerTab('brands')}
                  className={`py-3.5 sm:py-4 text-base sm:text-lg tracking-tight lowercase transition-all select-none relative cursor-pointer ${
                    navDrawerTab === 'brands'
                      ? 'font-bold text-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-black'
                      : 'font-normal text-zinc-500 hover:text-black'
                  }`}
                >
                  бренды
                </button>

                <Link
                  to="/aromabox"
                  onClick={() => setNavDrawerTab(null)}
                  className="py-3.5 sm:py-4 text-base sm:text-lg tracking-tight lowercase font-normal text-zinc-500 hover:text-black transition-all select-none flex items-center gap-1"
                >
                  <span>конструктор</span>
                  <span className="text-[9px] bg-black text-white px-1 py-0.2 uppercase font-bold tracking-wider">box</span>
                </Link>

                <Link
                  to="/catalog?filter=sale"
                  onClick={() => setNavDrawerTab(null)}
                  className="py-3.5 sm:py-4 text-base sm:text-lg tracking-tight lowercase font-normal text-zinc-500 hover:text-black transition-all select-none"
                >
                  акции
                </Link>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setNavDrawerTab(null)}
                className="p-2 text-zinc-400 hover:text-black transition-colors cursor-pointer"
                aria-label="Закрыть меню"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB CONTENT 1: КАТАЛОГ (Screenshot 2 vertical list) */}
            {navDrawerTab === 'catalog' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Category List (Clean vertical list in ЗЯ lowercase style) */}
                <div className="lg:col-span-4 space-y-1 sm:space-y-1.5 border-b lg:border-b-0 lg:border-r border-zinc-100 pb-4 lg:pb-0 lg:pr-8">
                  {[
                    { id: 'sale', label: 'скидки', path: '/catalog?filter=sale', badge: '−10%' },
                    { id: 'new', label: 'новинки', path: '/catalog?filter=new', badge: 'NEW' },
                    { id: 'hits', label: 'подборки', path: '/catalog?filter=hits', badge: 'ТОП' },
                    { id: 'perfume', label: 'парфюмерия', path: '/catalog?kind=perfume' },
                    { id: 'decant', label: 'распивы (3, 5, 10, 15 мл)', path: '/catalog?type=decant', badge: 'ХИТ' },
                    { id: 'aromabox', label: 'конструктор аромабоксов', path: '/aromabox' },
                    { id: 'skincare', label: 'уход за кожей', path: '/catalog?kind=skincare' },
                    { id: 'haircare', label: 'уход за волосами', path: '/catalog?kind=haircare' },
                    { id: 'makeup', label: 'макияж', path: '/catalog?kind=makeup' },
                    { id: 'bodycare', label: 'уход за телом', path: '/catalog?kind=bodycare' },
                    { id: 'mini', label: 'мини-форматы', path: '/catalog?type=decant' },
                  ].map(cat => (
                    <div
                      key={cat.id}
                      onMouseEnter={() => setHoveredCategory(cat.id)}
                      className="group"
                    >
                      <Link
                        to={cat.path}
                        onClick={() => setNavDrawerTab(null)}
                        className={`flex items-center justify-between py-2 px-3 transition-colors ${
                          hoveredCategory === cat.id
                            ? 'bg-zinc-100 font-bold text-black'
                            : 'text-zinc-800 hover:text-black hover:bg-zinc-50 font-medium'
                        } text-sm sm:text-base lowercase tracking-normal`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{cat.label}</span>
                          {cat.badge && (
                            <span className="text-[9px] uppercase font-bold bg-[#5A6B32] text-white px-1.5 py-0.2 tracking-wider">
                              {cat.badge}
                            </span>
                          )}
                        </span>
                        <ChevronRight className={`w-4 h-4 transition-transform ${hoveredCategory === cat.id ? 'translate-x-1 text-black' : 'text-zinc-400 group-hover:text-black'}`} />
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Right Category Details & Subcategories */}
                <div className="lg:col-span-8 flex flex-col justify-between">
                  {hoveredCategory === 'perfume' || hoveredCategory === 'decant' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          Направления ароматов
                        </div>
                        <div className="space-y-2 text-sm">
                          <Link
                            to="/catalog?kind=perfume"
                            onClick={() => setNavDrawerTab(null)}
                            className="block font-bold text-zinc-950 hover:underline"
                          >
                            Все ароматы каталога →
                          </Link>
                          <Link
                            to="/catalog?category=niche"
                            onClick={() => setNavDrawerTab(null)}
                            className="block text-zinc-700 hover:text-black"
                          >
                            Нишевая и селективная парфюмерия
                          </Link>
                          <Link
                            to="/catalog?category=arabian"
                            onClick={() => setNavDrawerTab(null)}
                            className="block text-zinc-700 hover:text-black"
                          >
                            Арабские хиты (Lattafa, Armaf, French Avenue)
                          </Link>
                          <Link
                            to="/catalog?category=luxury"
                            onClick={() => setNavDrawerTab(null)}
                            className="block text-zinc-700 hover:text-black"
                          >
                            Люксовые дома (Dior, Chanel, Tom Ford, Gucci)
                          </Link>
                          <Link
                            to="/catalog?type=decant"
                            onClick={() => setNavDrawerTab(null)}
                            className="block text-amber-700 hover:text-black font-semibold"
                          >
                            Распивы и отливанты (от 3 мл)
                          </Link>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          Подборки по нотам и сезону
                        </div>
                        <div className="space-y-2 text-sm">
                          <Link
                            to="/catalog?q=ваниль"
                            onClick={() => setNavDrawerTab(null)}
                            className="block text-zinc-700 hover:text-black"
                          >
                            Гурманские и ванильные ароматы
                          </Link>
                          <Link
                            to="/catalog?q=свежий"
                            onClick={() => setNavDrawerTab(null)}
                            className="block text-zinc-700 hover:text-black"
                          >
                            Свежие цитрусовые и морские
                          </Link>
                          <Link
                            to="/catalog?q=древесный"
                            onClick={() => setNavDrawerTab(null)}
                            className="block text-zinc-700 hover:text-black"
                          >
                            Древесные, кожаные и восточные
                          </Link>
                          <Link
                            to="/catalog?filter=hits"
                            onClick={() => setNavDrawerTab(null)}
                            className="block text-zinc-700 hover:text-black"
                          >
                            Хиты продаж и бестселлеры
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : hoveredCategory === 'skincare' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          Уход за лицом
                        </div>
                        <div className="space-y-2 text-sm">
                          <Link to="/catalog?kind=skincare" onClick={() => setNavDrawerTab(null)} className="block font-bold text-zinc-950 hover:underline">Все средства для лица</Link>
                          <Link to="/catalog?kind=skincare&q=крем" onClick={() => setNavDrawerTab(null)} className="block text-zinc-700 hover:text-black">Кремы и увлажнение</Link>
                          <Link to="/catalog?kind=skincare&q=сыворотка" onClick={() => setNavDrawerTab(null)} className="block text-zinc-700 hover:text-black">Сыворотки и концентраты</Link>
                          <Link to="/catalog?kind=skincare&q=очищение" onClick={() => setNavDrawerTab(null)} className="block text-zinc-700 hover:text-black">Очищение и пенки</Link>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          Специальный уход
                        </div>
                        <div className="space-y-2 text-sm">
                          <Link to="/catalog?kind=skincare&q=маска" onClick={() => setNavDrawerTab(null)} className="block text-zinc-700 hover:text-black">Маски и патчи</Link>
                          <Link to="/catalog?kind=skincare&q=глаз" onClick={() => setNavDrawerTab(null)} className="block text-zinc-700 hover:text-black">Уход вокруг глаз</Link>
                        </div>
                      </div>
                    </div>
                  ) : hoveredCategory === 'haircare' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          Средства для волос
                        </div>
                        <div className="space-y-2 text-sm">
                          <Link to="/catalog?kind=haircare" onClick={() => setNavDrawerTab(null)} className="block font-bold text-zinc-950 hover:underline">Все средства для волос</Link>
                          <Link to="/catalog?kind=haircare&q=шампунь" onClick={() => setNavDrawerTab(null)} className="block text-zinc-700 hover:text-black">Профессиональные шампуни</Link>
                          <Link to="/catalog?kind=haircare&q=бальзам" onClick={() => setNavDrawerTab(null)} className="block text-zinc-700 hover:text-black">Бальзамы и кондиционеры</Link>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                          Питание и блеск
                        </div>
                        <div className="space-y-2 text-sm">
                          <Link to="/catalog?kind=haircare&q=масло" onClick={() => setNavDrawerTab(null)} className="block text-zinc-700 hover:text-black">Масла и несмываемый уход</Link>
                          <Link to="/catalog?kind=haircare&q=маска" onClick={() => setNavDrawerTab(null)} className="block text-zinc-700 hover:text-black">Интенсивные маски</Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Быстрый переход
                      </div>
                      <div className="space-y-2 text-sm">
                        <Link to="/catalog" onClick={() => setNavDrawerTab(null)} className="block font-bold text-zinc-950 hover:underline">
                          Перейти в общий каталог всех 100 000+ товаров →
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Banner Card: Аромабокс */}
                  <div className="mt-8 p-4 bg-zinc-950 text-white flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Конструктор аромабокса</span>
                      </div>
                      <div className="text-sm font-semibold mt-1">
                        Соберите набор из 5 любимых ароматов со скидкой 15%
                      </div>
                    </div>
                    <Link
                      to="/aromabox"
                      onClick={() => setNavDrawerTab(null)}
                      className="px-4 py-2 bg-[#5A6B32] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors shrink-0"
                    >
                      Собрать бокс
                    </Link>
                  </div>

                  {/* Quick links to services in drawer */}
                  <div className="mt-6 pt-4 border-t border-zinc-100 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-zinc-600">
                    <Link to="/certificates" onClick={() => setNavDrawerTab(null)} className="hover:text-black transition-colors">Подарочные сертификаты</Link>
                    <Link to="/loyalty" onClick={() => setNavDrawerTab(null)} className="hover:text-black transition-colors">Бонусная карта</Link>
                    <Link to="/why-cheaper" onClick={() => setNavDrawerTab(null)} className="hover:text-black transition-colors">Почему дешевле?</Link>
                    <Link to="/reviews" onClick={() => setNavDrawerTab(null)} className="hover:text-black transition-colors">Отзывы покупателей</Link>
                    <Link to="/gallery" onClick={() => setNavDrawerTab(null)} className="hover:text-black transition-colors">Галерея заказов</Link>
                    <Link to="/delivery" onClick={() => setNavDrawerTab(null)} className="hover:text-black transition-colors">Доставка и оплата</Link>
                    <Link to="/faq" onClick={() => setNavDrawerTab(null)} className="hover:text-black transition-colors">Вопросы и ответы</Link>
                    <Link to="/contacts" onClick={() => setNavDrawerTab(null)} className="hover:text-black transition-colors">Контакты</Link>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: БРЕНДЫ (Strictly pure brands only, no promo junk!) */}
            {navDrawerTab === 'brands' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
                {/* Search Bar + Alphabet row */}
                <div className="space-y-4 border-b border-zinc-100 pb-4">
                  {/* Brand Search input */}
                  <div className="relative max-w-lg">
                    <input
                      type="text"
                      placeholder="Поиск бренда (например: Creed, Tom Ford, Kilian, Chanel)..."
                      value={brandSearchQuery}
                      onChange={e => setBrandSearchQuery(e.target.value)}
                      className="w-full bg-[#f4f4f5] text-xs text-zinc-900 placeholder:text-zinc-400 pl-9 pr-4 py-2.5 border border-zinc-200 outline-none focus:border-black font-medium"
                    />
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    {brandSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setBrandSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-black font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Alphabet letters jump bar */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {alphabet.map(letter => (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => setSelectedLetter(letter)}
                        className={`px-2.5 py-1 text-xs font-semibold tracking-wider transition-colors ${
                          selectedLetter === letter
                            ? 'bg-black text-white font-bold'
                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-black'
                        }`}
                      >
                        {letter === 'ALL' ? 'Все' : letter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Brands Quick Highlights (Zero junk, pure luxury houses) */}
                {!brandSearchQuery && selectedLetter === 'ALL' && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Популярные парфюмерные дома
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_BRANDS.slice(0, 24).map(b => (
                        <button
                          key={b.slug}
                          type="button"
                          onClick={() => handleBrandClick(b.searchQuery)}
                          className="px-3 py-1.5 border border-zinc-200 hover:border-black bg-white text-zinc-900 hover:bg-black hover:text-white text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5"
                        >
                          <span>{b.name}</span>
                          {b.country && (
                            <span className="text-[10px] opacity-60">· {b.country}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filtered Pure Brands Multi-Column Directory */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    <span>
                      {selectedLetter === 'ALL'
                        ? `Все бренды каталога (${filteredBrands.length})`
                        : `Бренды на букву «${selectedLetter}» (${filteredBrands.length})`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNavDrawerTab(null);
                        navigate('/catalog');
                      }}
                      className="text-black hover:underline flex items-center gap-1"
                    >
                      Смотреть весь каталог <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {filteredBrands.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-2.5 text-xs">
                      {filteredBrands.map(b => (
                        <button
                          key={b.slug}
                          type="button"
                          onClick={() => handleBrandClick(b.searchQuery)}
                          className="text-left font-medium text-zinc-800 hover:text-black hover:underline truncate py-0.5"
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-zinc-500">
                      По запросу ничего не найдено. Попробуйте другой фильтр.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Click on backdrop closes drawer */}
          <div className="flex-1" onClick={() => setNavDrawerTab(null)} />
        </div>
      )}
    </>
  );
};
