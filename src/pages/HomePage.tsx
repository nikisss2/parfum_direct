import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMeta, fetchProducts, fetchBudgetHits, listItemToPerfume } from '../api/catalog';
import { ProductCard } from '../components/ProductCard';
import { Perfume } from '../types';
import {
  ArrowRight,
  ShieldCheck,
  Camera,
  CheckCircle2,
  Truck,
  Droplet,
  ArrowUpRight,
  Check
} from 'lucide-react';
import { FAQSection } from '../components/FAQSection';
import { ORDERS_GALLERY } from '../data/ordersGalleryData';
import { SEO } from '../components/SEO';

interface CategoryCardItem {
  id: string;
  label: string;
  subtitle: string;
  image: string;
  link: string;
}

const CATEGORY_ITEMS: CategoryCardItem[] = [
  {
    id: 'niche',
    label: 'Селектив & Ниша',
    subtitle: 'Creed, Byredo, Tom Ford, MFK, Kilian',
    image: '/assets/renders/tom_ford_3d_1793863567514.png',
    link: '/catalog?category=niche',
  },
  {
    id: 'arabian',
    label: 'Арабский эксклюзив',
    subtitle: 'Lattafa, Afnan, Armaf, Attar Collection',
    image: '/assets/renders/arabic_crown_3d_1793863593163.png',
    link: '/catalog?category=arabian',
  },
  {
    id: 'testers',
    label: 'Оригинальные тестеры',
    subtitle: 'Флаконы в тех. коробках со скидкой до 40%',
    image: '/assets/renders/tester_bottle_3d_1793863624145.png',
    link: '/catalog?type=decant',
  },
  {
    id: 'decants',
    label: 'Распивы & Отливанты',
    subtitle: 'Стеклянные атомайзеры 1–20 мл от 490 ₽',
    image: '/assets/renders/decant_atomizer_3d_1793863658833.png',
    link: '/catalog?type=decant',
  },
];

export const HomePage: React.FC = () => {
  const [hitPerfumes, setHitPerfumes] = useState<Perfume[]>([]);
  const [budgetPerfumes, setBudgetPerfumes] = useState<Perfume[]>([]);
  const [newPerfumes, setNewPerfumes] = useState<Perfume[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  useEffect(() => {
    fetchMeta()
      .then(m => setTotalCount(m.count))
      .catch(() => setTotalCount(null));

    fetchProducts({ isHit: true, limit: 12, sort: 'popular' })
      .then(r => setHitPerfumes(r.items.map(listItemToPerfume)))
      .catch(() => setHitPerfumes([]));

    fetchBudgetHits()
      .then(r => setBudgetPerfumes(r.items.map(listItemToPerfume)))
      .catch(() => setBudgetPerfumes([]));

    fetchProducts({ isNew: true, limit: 8, sort: 'new' })
      .then(r => setNewPerfumes(r.items.map(listItemToPerfume)))
      .catch(() => setNewPerfumes([]));
  }, []);

  const homeSchema = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: 'Maison Arôme',
    url: 'https://maison-arome.ru',
    logo: 'https://maison-arome.ru/favicon-512.png',
    description:
      'Концептуальный интернет-магазин оригинальной парфюмерии и распивов от 1 мл. Более 100 000 позиций, 100% оригинал, доставка по всей России.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'RU',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://maison-arome.ru/catalog?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="space-y-14 sm:space-y-20 md:space-y-24 pb-16 sm:pb-24">
      <SEO
        title="Maison Arôme — Чистая эстетика оригинальной парфюмерии"
        description="Концептуальный интернет-магазин оригинальной парфюмерии Maison Arôme. Распивы от 1 мл и целые флаконы. 100% оригинал, проверка батч-кодов, доставка по РФ."
        canonical="https://maison-arome.ru"
        schema={homeSchema}
      />

      {/* 1. HERO BANNER: Full-Width edge-to-edge as on theact.ru with Photo 5 (Amouage model) */}
      <section className="relative w-full overflow-hidden bg-black min-h-[500px] sm:min-h-[600px] md:min-h-[680px] lg:min-h-[740px] flex items-center">
        {/* Full-bleed Photo 5 */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/hero-original.png"
            alt="Maison Arôme Селективная парфюмерия"
            className="w-full h-full object-cover object-[78%_center] sm:object-center"
            decoding="async"
          />
        </div>

        {/* Cinematic dark overlay to make white text pop on the left */}
        <div className="absolute inset-0 z-1 bg-gradient-to-r from-black/85 via-black/55 to-black/20 sm:from-black/80 sm:via-black/40 sm:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent z-1" />

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 w-full py-16 sm:py-24 md:py-32 flex flex-col justify-between h-full min-h-[500px] sm:min-h-[600px] md:min-h-[680px] lg:min-h-[740px]">
          {/* Top subtle bar inside banner */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-light uppercase tracking-[0.24em] text-white/80">
              Maison Arôme
            </span>
            <div className="hidden sm:flex items-center gap-6 text-[11px] uppercase tracking-[0.14em] text-white/70 font-light">
              <span>Селектив</span>
              <span>·</span>
              <span>Распивы от 1 мл</span>
              <span>·</span>
              <span>Оригинал</span>
            </div>
          </div>

          {/* Center-Left Content */}
          <div className="max-w-2xl space-y-4 sm:space-y-6 my-auto pt-8 sm:pt-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/25 text-[11px] sm:text-xs text-white font-medium tracking-wide w-fit shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>Оригинал 100% · Сертифицированный бутик</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.08]">
              44 730+ позиций. <br className="hidden sm:inline" />
              Парфюмерия и профессиональный уход
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-white font-normal leading-relaxed max-w-xl drop-shadow-md">
              Оригинальные флаконы от мировых нишевых домов и распивы от 1 мл. 100% оригинал с гарантией подлинности и проверкой каждого батч-кода перед отправкой.
            </p>

            {/* Two Pill Buttons: White Solid + Outlined with Arrow */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/catalog"
                className="bg-white text-zinc-950 hover:bg-zinc-100 rounded-full py-3 px-7 sm:py-3.5 sm:px-8 text-xs sm:text-sm font-medium transition-all shadow-lg active:scale-95"
              >
                В каталог
              </Link>

              <Link
                to="/catalog?type=decant"
                className="border border-white/70 hover:border-white bg-black/25 backdrop-blur-xs text-white hover:bg-white/10 rounded-full py-3 px-6 sm:py-3.5 sm:px-7 text-xs sm:text-sm font-light transition-all flex items-center gap-2 active:scale-95"
              >
                <span>Распивы от 1 мл</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bottom right indicator dots */}
          <div className="hidden sm:flex items-center gap-1.5 self-end opacity-60">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY SWITCHER (Clean white cards, zero white squares, no superscripts) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-6 pb-2.5 border-b border-zinc-200/70">
          <h2 className="text-[11px] font-normal uppercase tracking-[0.16em] text-zinc-400">
            Коллекция
          </h2>
          <div className="text-xl sm:text-2xl font-light text-zinc-950 mt-0.5">
            Направления парфюмерии
          </div>
        </div>

        {/* 4 Clean Category Cards on Pure White (Zero visible image squares) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {CATEGORY_ITEMS.map((cat) => (
            <Link
              key={cat.id}
              to={cat.link}
              className="bg-white rounded-[24px] sm:rounded-[28px] border border-zinc-200/70 hover:border-black p-4 sm:p-6 h-[220px] sm:h-[270px] flex flex-col justify-between overflow-hidden relative group transition-all duration-300 shadow-2xs hover:shadow-md"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base lg:text-lg font-normal text-zinc-900 tracking-tight">
                    {cat.label}
                  </h3>
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-zinc-100 text-zinc-500 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                    <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>
                <p className="text-[11px] sm:text-xs text-zinc-500 mt-1 leading-relaxed text-delicate line-clamp-2">
                  {cat.subtitle}
                </p>
              </div>

              {/* Centered 3D Flacon with bottom cut off by card boundary (example in photo 5) */}
              <div className="relative w-full h-[240px] sm:h-[278px] -mb-4 sm:-mb-6 flex items-end justify-center z-0 overflow-hidden pointer-events-none">
                <img
                  src={cat.image}
                  alt={cat.label}
                  loading="lazy"
                  className="h-full w-auto object-contain object-bottom translate-y-[27px] sm:translate-y-[37px] group-hover:translate-y-[21px] sm:group-hover:translate-y-[29px] group-hover:scale-105 transition-transform duration-300 ease-out"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. BESTSELLERS (Хиты продаж: pure white borderless cards) */}
      {hitPerfumes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-4 sm:mb-6 pb-2.5 border-b border-zinc-200/70">
            <div>
              <h2 className="text-[11px] font-normal uppercase tracking-[0.16em] text-zinc-400">
                Бестселлеры
              </h2>
              <div className="text-xl sm:text-3xl font-light text-zinc-950 mt-0.5">
                Ароматы, покорившие сердца
              </div>
            </div>
            <Link
              to="/catalog?filter=hits"
              className="pill-btn-outline py-1.5 px-3.5 sm:py-2 sm:px-5 text-[11px] whitespace-nowrap"
            >
              <span>Все хиты</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {hitPerfumes.slice(0, 12).map((p) => (
              <ProductCard key={p.id} perfume={p} />
            ))}
          </div>
        </section>
      )}

      {/* 4. BUDGET HITS (Бюджетные хиты: Lacoste, French Avenue, Versace, Coach) */}
      {budgetPerfumes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-4 sm:mb-6 pb-2.5 border-b border-zinc-200/70">
            <div>
              <h2 className="text-[11px] font-normal uppercase tracking-[0.16em] text-zinc-400">
                Доступный люкс
              </h2>
              <div className="text-xl sm:text-3xl font-light text-zinc-950 mt-0.5">
                Бюджетные хиты
              </div>
            </div>
            <Link
              to="/catalog?brands=French Avenue,Lacoste,Versace,Coach,Lattafa"
              className="pill-btn-outline py-1.5 px-3.5 sm:py-2 sm:px-5 text-[11px] whitespace-nowrap"
            >
              <span>Смотреть все</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {budgetPerfumes.slice(0, 12).map((p) => (
              <ProductCard key={p.id} perfume={p} />
            ))}
          </div>
        </section>
      )}

      {/* 4. "ПОЧЕМУ МЫ?" / ФИЛОСОФИЯ (TK Beauty reference) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-[28px] sm:rounded-[36px] md:rounded-[44px] bg-[#F7F7F9] border border-zinc-200/70 p-6 sm:p-12 lg:p-16">
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12 space-y-1.5 sm:space-y-2">
            <span className="text-[10px] sm:text-[11px] font-normal uppercase tracking-[0.2em] text-zinc-400">
              Стандарты Maison Arôme
            </span>
            <h2 className="text-2xl sm:text-4xl font-light text-zinc-950">
              Почему ценители выбирают нас?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-light text-delicate">
              Прозрачность, контроль каждого миллилитра и бережное отношение к оригинальной композиции.
            </p>
          </div>

          {/* 4 Frosted Glass Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5 md:gap-6">
            <div className="glass-card p-5 sm:p-7 md:p-8 rounded-[24px] sm:rounded-[28px] border border-white/90 bg-white/80 hover:bg-white transition-all shadow-xs">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-normal uppercase tracking-[0.16em] text-zinc-400">
                  01
                </span>
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900">
                  <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-normal text-zinc-900 mb-1.5">
                100% Подлинность и батч-коды
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-light text-delicate">
                Прямые поставки от проверенных дистрибьюторов Европы и Ближнего Востока. На каждом целом флаконе присутствует заводской батч-код, который легко проверить в международных базах.
              </p>
            </div>

            <div className="glass-card p-5 sm:p-7 md:p-8 rounded-[24px] sm:rounded-[28px] border border-white/90 bg-white/80 hover:bg-white transition-all shadow-xs">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-normal uppercase tracking-[0.16em] text-zinc-400">
                  02
                </span>
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900">
                  <Camera className="w-4 h-4 stroke-[1.5]" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-normal text-zinc-900 mb-1.5">
                Фотоотчет перед отправкой
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-light text-delicate">
                Никаких неприятных сюрпризов. Перед передачей посылки курьеру мы отправляем подробные фотографии собранного заказа, атомайзеров и упаковки вам в Telegram или WhatsApp.
              </p>
            </div>

            <div className="glass-card p-5 sm:p-7 md:p-8 rounded-[24px] sm:rounded-[28px] border border-white/90 bg-white/80 hover:bg-white transition-all shadow-xs">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-normal uppercase tracking-[0.16em] text-zinc-400">
                  03
                </span>
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900">
                  <Droplet className="w-4 h-4 stroke-[1.5]" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-normal text-zinc-900 mb-1.5">
                Стерильный распив от 1 мл
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-light text-delicate">
                Используем только итальянские стеклянные флаконы с металлическим мелкодисперсным распылителем. Стерильный забор шприцем исключает контакт аромата с воздухом.
              </p>
            </div>

            <div className="glass-card p-5 sm:p-7 md:p-8 rounded-[24px] sm:rounded-[28px] border border-white/90 bg-white/80 hover:bg-white transition-all shadow-xs">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-normal uppercase tracking-[0.16em] text-zinc-400">
                  04
                </span>
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900">
                  <Truck className="w-4 h-4 stroke-[1.5]" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-normal text-zinc-900 mb-1.5">
                Бережная экспресс-доставка
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-light text-delicate">
                Многослойная защитная упаковка в воздушно-пузырчатую пленку и жесткие крафтовые тубусы. Доставка СДЭК, Яндекс или курьером прямо до двери или в удобный ПВЗ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EDITORIAL: "Curated Scent Experience" */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center py-4 sm:py-6">
          <div className="lg:col-span-5 space-y-3 sm:space-y-4">
            <span className="text-[10px] sm:text-[11px] font-normal uppercase tracking-[0.2em] text-zinc-400">
              Философия осознанности
            </span>
            <h2 className="text-2xl sm:text-4xl font-light text-zinc-950 leading-tight">
              Искусство <br />
              <span className="font-serif italic font-normal text-zinc-800">
                слышать аромат
              </span>
            </h2>
            <div className="pt-1">
              <Link
                to="/catalog?type=decant"
                className="pill-btn-outline py-2 px-5 text-xs inline-flex items-center gap-2"
              >
                <span>Собрать сет распивов</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs sm:text-sm text-zinc-500 leading-relaxed font-light text-delicate">
            <p>
              Высокая нишевая парфюмерия раскрывается индивидуально на каждом человеке. Формат распивов от 1 мл освобождает от необходимости покупать флакон за 30 000 ₽ вслепую. Вы знакомитесь со шлейфом в привычном ритме жизни — на прогулке, в офисе или вечером.
            </p>
            <p>
              Мы заботимся о каждой детали: от чистоты стерильного розлива до удобной маркировки с названием и концентрацией. Это делает коллекционирование редких ароматов доступным, эстетичным и осознанным ритуалом.
            </p>
          </div>
        </div>
      </section>

      {/* 6. NEW ARRIVALS (Новинки) */}
      {newPerfumes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-4 sm:mb-6 pb-2.5 border-b border-zinc-200/70">
            <div>
              <h2 className="text-[11px] font-normal uppercase tracking-[0.16em] text-zinc-400">
                Свежие поступления
              </h2>
              <div className="text-xl sm:text-3xl font-light text-zinc-950 mt-0.5">
                Новинки сезона
              </div>
            </div>
            <Link
              to="/catalog?filter=new"
              className="pill-btn-outline py-1.5 px-3.5 sm:py-2 sm:px-5 text-[11px] whitespace-nowrap"
            >
              <span>Все новинки</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {newPerfumes.slice(0, 8).map((p) => (
              <ProductCard key={p.id} perfume={p} />
            ))}
          </div>
        </section>
      )}

      {/* 7. REAL CUSTOMER ORDERS GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 sm:mb-8 pb-2.5 border-b border-zinc-200/70">
          <div>
            <h2 className="text-[11px] font-normal uppercase tracking-[0.16em] text-zinc-400">
              Прозрачность
            </h2>
            <div className="text-xl sm:text-3xl font-light text-zinc-950 mt-0.5">
              Галерея собранных заказов
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-light text-delicate">
              Каждую позицию мы собираем вручную и отправляем фотоотчёт покупателю перед передачей курьеру.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              to="/reviews"
              className="pill-btn-outline py-1.5 px-3.5 sm:py-2 sm:px-4 text-[11px]"
            >
              Отзывы
            </Link>
            <Link
              to="/gallery"
              className="pill-btn-black py-1.5 px-3.5 sm:py-2 sm:px-4 text-[11px]"
            >
              Вся галерея
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {ORDERS_GALLERY.slice(0, 4).map((item) => (
            <Link
              key={item.id}
              to="/gallery"
              className="bg-white rounded-[24px] sm:rounded-[28px] border border-zinc-200/70 hover:border-black overflow-hidden flex flex-col justify-between group transition-all duration-300 shadow-2xs hover:shadow-md"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-zinc-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-black/80 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-normal uppercase tracking-[0.12em] rounded-full">
                  {item.orderNumber}
                </span>
                <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 bg-white/90 backdrop-blur-xs text-zinc-900 text-[9px] sm:text-[10px] font-normal tracking-wide rounded-full shadow-2xs">
                  г. {item.city}
                </span>
              </div>
              <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                <div>
                  <div className="text-[9px] sm:text-[10px] uppercase font-normal tracking-[0.14em] text-zinc-400 mb-0.5">
                    Заказ для {item.customerName}
                  </div>
                  <h3 className="font-normal text-xs sm:text-sm text-zinc-900 group-hover:text-zinc-600 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-zinc-500 mt-0.5 leading-relaxed font-light text-delicate line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1 text-zinc-900 font-normal">
                    <Check className="w-3 h-3 text-zinc-900" /> Оригинал
                  </span>
                  <span className="font-light">{item.badge}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <FAQSection className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-2" />
    </div>
  );
};
