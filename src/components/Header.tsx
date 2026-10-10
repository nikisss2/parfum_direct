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
  ArrowRight
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

  // Search autocomplete state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<Perfume[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close menus on route change or Escape
  useEffect(() => {
    setNavDrawerTab(null);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNavDrawerTab(null);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
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
      if (q && !b.name.toLowerCase().includes(q)) return false;
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
        {/* Main Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4 sm:gap-6 relative">
          {/* Left section: Hamburger (Mobile) + Logo */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <button
              onClick={() => setNavDrawerTab(navDrawerTab ? null : 'catalog')}
              className="lg:hidden p-1.5 text-zinc-800 hover:text-black transition-colors"
              aria-label="Меню навигации"
            >
              {navDrawerTab ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo: 2 letters "PD" */}
            <Link to="/" className="flex items-center select-none group" aria-label="Maison Arôme — На главную">
              <span className="text-xl sm:text-2xl font-black font-serif tracking-tight text-zinc-950 group-hover:text-zinc-600 transition-colors leading-none uppercase">
                Maison Arôme
              </span>
            </Link>
          </div>

          {/* Desktop ЗЯ Primary Triggers: каталог, бренды, скидки, другое, конструктор (Hidden when search is expanded) */}
          {!searchOpen && (
            <div className="hidden lg:flex items-center gap-6">
              <button
                type="button"
                onClick={() => setNavDrawerTab(navDrawerTab === 'catalog' ? null : 'catalog')}
                className={`text-base font-medium tracking-normal transition-colors py-2 relative lowercase select-none ${
                  navDrawerTab === 'catalog'
                    ? 'text-black font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-black'
                    : 'text-zinc-800 hover:text-black'
                }`}
              >
                каталог
              </button>

              <button
                type="button"
                onClick={() => setNavDrawerTab(navDrawerTab === 'brands' ? null : 'brands')}
                className={`text-base font-medium tracking-normal transition-colors py-2 relative lowercase select-none ${
                  navDrawerTab === 'brands'
                    ? 'text-black font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-black'
                    : 'text-zinc-800 hover:text-black'
                }`}
              >
                бренды
              </button>

              <Link
                to="/catalog?filter=sale"
                className="text-base font-medium tracking-normal text-zinc-800 hover:text-black transition-colors py-2 lowercase select-none"
              >
                скидки
              </Link>

              {/* "Другое" Dropdown: FAQ and Contacts */}
              <div className="relative group">
                <button
                  type="button"
                  className="text-base font-medium tracking-normal text-zinc-800 hover:text-black transition-colors py-2 lowercase select-none flex items-center gap-1"
                >
                  <span>другое</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-black transition-transform group-hover:rotate-180" />
                </button>

                <div className="absolute left-0 top-full hidden group-hover:block pt-1 z-50">
                  <div className="bg-white border border-black shadow-2xl py-2 min-w-[220px] animate-in fade-in">
                    <Link
                      to="/faq"
                      className="block px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-950 hover:bg-zinc-100 transition-colors"
                    >
                      Ответы на вопросы
                    </Link>
                    <Link
                      to="/contacts"
                      className="block px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-950 hover:bg-zinc-100 transition-colors"
                    >
                      Контакты
                    </Link>
                    <div className="my-1 border-t border-zinc-100" />
                    <Link
                      to="/how-to-decant"
                      className="block px-4 py-2 text-xs text-zinc-600 hover:text-black hover:bg-zinc-50 transition-colors"
                    >
                      Как устроен распив
                    </Link>
                    <Link
                      to="/delivery"
                      className="block px-4 py-2 text-xs text-zinc-600 hover:text-black hover:bg-zinc-50 transition-colors"
                    >
                      Доставка и оплата
                    </Link>
                    <Link
                      to="/about"
                      className="block px-4 py-2 text-xs text-zinc-600 hover:text-black hover:bg-zinc-50 transition-colors"
                    >
                      О бутике
                    </Link>
                  </div>
                </div>
              </div>

              <Link
                to="/aromabox"
                className="bg-black text-white hover:bg-zinc-800 px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors select-none inline-flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>Конструктор ароматов</span>
              </Link>
            </div>
          )}

          {/* Desktop Search Bar: Expands across header to cover navigation when focused/clicked */}
          <div
            ref={searchRef}
            className={`hidden md:block relative transition-all duration-200 ${
              searchOpen ? 'flex-1 mx-4' : 'w-64 lg:w-72'
            }`}
          >
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Поиск по аромату, бренду или ноте..."
                value={searchValue}
                autoFocus={searchOpen}
                onFocus={() => setSearchOpen(true)}
                onChange={e => {
                  setSearchValue(e.target.value);
                  setSearchOpen(true);
                }}
                className={`w-full bg-[#f4f4f5] hover:bg-white focus:bg-white text-xs text-zinc-900 placeholder:text-zinc-400 pl-9 ${
                  searchOpen ? 'pr-24 py-2.5 border-2 border-black' : 'pr-4 py-2.5 border border-zinc-200 focus:border-black'
                } outline-none transition-all`}
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

              {searchOpen && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchValue && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchValue('');
                        setSearchResults([]);
                      }}
                      className="p-1 text-zinc-400 hover:text-black text-xs"
                      title="Очистить"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="px-2.5 py-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-900 text-[11px] font-bold uppercase tracking-wider transition-colors"
                  >
                    Закрыть
                  </button>
                </div>
              )}
            </form>

            {/* Autocomplete Dropdown */}
            {searchOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white shadow-2xl border border-zinc-200 overflow-hidden z-50 animate-in fade-in">
                {searchValue.trim() ? (
                  searchResults.length > 0 ? (
                    <div className="divide-y divide-zinc-100">
                      <div className="p-2.5 bg-zinc-50 text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-between border-b border-zinc-100">
                        <span>Результаты поиска ({searchResults.length})</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchValue('');
                            setSearchResults([]);
                          }}
                          className="text-zinc-400 hover:text-black text-[10px] uppercase font-bold tracking-wider"
                        >
                          Очистить
                        </button>
                      </div>
                      {searchResults.map(perf => (
                        <Link
                          key={perf.id}
                          to={`/product/${perf.slug}`}
                          onClick={() => setSearchOpen(false)}
                          className="p-3 flex items-center gap-3 hover:bg-zinc-50 transition-colors"
                        >
                          <img
                            src={perf.images[0]}
                            alt=""
                            className="w-10 h-10 object-contain bg-[#f4f4f5] border border-zinc-200 shrink-0 p-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider truncate">
                              {perf.brand}
                            </div>
                            <div className="text-xs font-semibold text-zinc-950 truncate">
                              {perf.name}
                            </div>
                            <div className="text-[11px] text-zinc-600 font-sans">
                              {perf.volumes[0]?.label} {perf.volumes[0]?.price.toLocaleString('ru-RU')} ₽
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                        </Link>
                      ))}
                      <div className="p-2.5 bg-zinc-50 text-center border-t border-zinc-100">
                        <button
                          onClick={handleSearchSubmit}
                          className="text-xs font-bold uppercase tracking-wider text-black hover:underline"
                        >
                          Смотреть все результаты в каталоге →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-zinc-500">
                      По запросу «{searchValue}» ничего не найдено.
                    </div>
                  )
                ) : (
                  <div className="p-4 space-y-3">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Популярные запросы
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Baccarat 540',
                        'Creed Aventus',
                        'Tom Ford',
                        'Ganymede',
                        'Lattafa Khamrah',
                        'Delina',
                        'Fleur Narcotique'
                      ].map(chip => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => {
                            setSearchValue(chip);
                            setSearchOpen(true);
                          }}
                          className="px-3 py-1.5 border border-zinc-200 hover:border-black bg-white text-xs text-zinc-900 font-medium transition-colors"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2.5 border border-transparent hover:border-zinc-200 hover:bg-zinc-50 text-zinc-900 transition-colors relative"
              aria-label="Избранное"
            >
              <Heart className="w-5 h-5 stroke-[1.5]" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 px-1.5 py-0.2 bg-black text-[9px] text-white font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Account */}
            <Link
              to="/account"
              className="p-2.5 border border-transparent hover:border-zinc-200 hover:bg-zinc-50 text-zinc-900 transition-colors flex items-center gap-1.5"
              aria-label="Личный кабинет"
            >
              <UserIcon className="w-5 h-5 stroke-[1.5]" />
              {user && (
                <span className="hidden xl:inline text-xs font-semibold uppercase tracking-wider text-zinc-900 max-w-[100px] truncate">
                  {user.fullName.split(' ')[0]}
                </span>
              )}
            </Link>

            {/* Cart (Sharp Black Rectangle Button) */}
            <Link
              to="/cart"
              className="p-2.5 sm:px-4 sm:py-2.5 bg-black text-white hover:bg-zinc-800 border border-black transition-colors flex items-center gap-2"
              aria-label="Корзина"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartTotalCount > 0 && (
                  <span className="absolute -top-2 -right-2 px-1 py-0.2 bg-[#5A6B32] text-white text-[9px] font-bold flex items-center justify-center">
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

        {/* Mobile Search Input */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Поиск по аромату, бренду..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="w-full bg-[#f4f4f5] text-xs text-zinc-900 pl-9 pr-4 py-2 border border-zinc-200 outline-none focus:border-black"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* FULL GOLDEN APPLE (ЗЯ) NAVIGATION MEGA-MENU DRAWER (Screenshot 2 style)   */}
      {/* ========================================================================= */}
      {navDrawerTab && (
        <div className="fixed inset-0 top-[72px] z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-start animate-in fade-in duration-200">
          <div
            className="w-full bg-white border-b border-zinc-200 shadow-2xl max-h-[82vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Top Navigation Tabs Header (Screenshot 2: каталог | бренды | акции) */}
            <div className="border-b border-zinc-200 px-4 sm:px-8 bg-white flex items-center justify-between">
              <div className="flex items-center gap-8 sm:gap-12">
                <button
                  type="button"
                  onClick={() => setNavDrawerTab('catalog')}
                  className={`py-4 text-base sm:text-lg tracking-tight lowercase transition-all select-none relative ${
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
                  className={`py-4 text-base sm:text-lg tracking-tight lowercase transition-all select-none relative ${
                    navDrawerTab === 'brands'
                      ? 'font-bold text-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-black'
                      : 'font-normal text-zinc-500 hover:text-black'
                  }`}
                >
                  бренды
                </button>

                <Link
                  to="/faq"
                  onClick={() => setNavDrawerTab(null)}
                  className="py-4 text-base sm:text-lg tracking-tight lowercase font-normal text-zinc-500 hover:text-black transition-all select-none"
                >
                  вопросы
                </Link>

                <Link
                  to="/contacts"
                  onClick={() => setNavDrawerTab(null)}
                  className="py-4 text-base sm:text-lg tracking-tight lowercase font-normal text-zinc-500 hover:text-black transition-all select-none"
                >
                  контакты
                </Link>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setNavDrawerTab(null)}
                className="p-2 text-zinc-400 hover:text-black transition-colors"
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
                            : 'text-zinc-800 hover:text-black font-medium'
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
                            className="block text-zinc-700 hover:text-black font-semibold text-amber-700"
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
                          <Link to="/catalog?kind=skincare" onClick={() => setNavDrawerTab(null)} className="block font-bold text-zinc-950">Все средства для лица</Link>
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
                          <Link to="/catalog?kind=haircare" onClick={() => setNavDrawerTab(null)} className="block font-bold text-zinc-950">Все средства для волос</Link>
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
                        <Link to="/catalog" onClick={() => setNavDrawerTab(null)} className="block font-bold text-zinc-950">
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
                          className="px-3 py-1.5 border border-zinc-200 hover:border-black bg-white hover:bg-black hover:text-white text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5"
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
