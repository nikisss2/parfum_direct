import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMeta, fetchProducts, listItemToPerfume } from '../api/catalog';
import { ProductCard } from '../components/ProductCard';
import { Perfume, PRODUCT_KIND_OPTIONS } from '../types';
import {
  ArrowRight,
  ShieldCheck,
  Camera,
  CheckCircle2,
  Truck,
  Droplet,
  Package,
  Check,
  Star,
  Gift
} from 'lucide-react';
import { FAQSection } from '../components/FAQSection';
import { ORDERS_GALLERY } from '../data/ordersGalleryData';
import { SEO } from '../components/SEO';

interface Category3DCard {
  id: string;
  label: string;
  subtitle: string;
  image: string;
  pngFallback: string;
  link: string;
}

const CATEGORY_3D_CARDS: Category3DCard[] = [
  {
    id: 'perfume',
    label: 'Парфюмерия',
    subtitle: 'Люкс, селектив, ниша',
    image: '/assets/categories/perfume.webp',
    pngFallback: '/assets/categories/perfume.png',
    link: '/catalog?kind=perfume',
  },
  {
    id: 'skincare',
    label: 'Уход за кожей',
    subtitle: 'Кремы, сыворотки, уход',
    image: '/assets/categories/skincare.webp',
    pngFallback: '/assets/categories/skincare.png',
    link: '/catalog?kind=skincare',
  },
  {
    id: 'haircare',
    label: 'Уход за волосами',
    subtitle: 'Шампуни, масла, стайлинг',
    image: '/assets/categories/haircare.webp',
    pngFallback: '/assets/categories/haircare.png',
    link: '/catalog?kind=haircare',
  },
  {
    id: 'makeup',
    label: 'Макияж',
    subtitle: 'Помады, тон, пудры',
    image: '/assets/categories/makeup.webp',
    pngFallback: '/assets/categories/makeup.png',
    link: '/catalog?kind=makeup',
  },
  {
    id: 'bodycare',
    label: 'Уход за телом',
    subtitle: 'Лосьоны, скрабы, масла',
    image: '/assets/categories/bodycare.webp',
    pngFallback: '/assets/categories/bodycare.png',
    link: '/catalog?kind=bodycare',
  },
];

export const HomePage: React.FC = () => {
  const [hitPerfumes, setHitPerfumes] = useState<Perfume[]>([]);
  const [newPerfumes, setNewPerfumes] = useState<Perfume[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  useEffect(() => {
    fetchMeta()
      .then(m => setTotalCount(m.count))
      .catch(() => setTotalCount(null));

    fetchProducts({ isHit: true, limit: 8, sort: 'popular' })
      .then(r => setHitPerfumes(r.items.map(listItemToPerfume)))
      .catch(() => setHitPerfumes([]));

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
      'Интернет-магазин оригинальной нишевой и люксовой парфюмерии. Распивы от 1 мл и целые флаконы с быстрой доставкой по России.',
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
    <div className="space-y-16 sm:space-y-24 pb-20">
      <SEO
        title="Maison Arôme — Оригинальная парфюмерия и распивы от 1 мл"
        description="Интернет-магазин оригинальной парфюмерии Maison Arôme. Распивы от 1 мл и целые флаконы. Более 44 000 товаров, 100% гарантия подлинности, доставка по всей России."
        canonical="https://maison-arome.ru"
        schema={homeSchema}
      />
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="/assets/hero-banner.jpg"
            alt="Maison Arôme"
            className="w-full h-full object-cover object-center filter brightness-50"
            decoding="async"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-24 lg:py-32">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-black/60 backdrop-blur-md border border-white/20 text-[10px] uppercase tracking-widest text-white font-sans font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Оригинальная продукция</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-normal font-serif tracking-tight leading-[1.1]">
              <span className="block text-amber-500 font-serif italic text-xl sm:text-2xl mb-2">Maison Arôme</span>
              {totalCount ? `${totalCount.toLocaleString('ru-RU')}+` : '100 000+'} позиций.
              <span className="block text-zinc-400 font-sans font-light text-2xl sm:text-4xl mt-2">
                Парфюмерия и профессиональный уход
              </span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-light max-w-xl">
              Духи, косметика, уход за кожей и волосами — с удобными фильтрами по бренду, объёму и категории.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                to="/catalog"
                className="px-7 py-4 rounded-none bg-white text-zinc-950 hover:bg-zinc-200 font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-colors"
              >
                <span>Перейти в каталог</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/catalog?type=decant"
                className="px-7 py-4 rounded-none bg-black border border-white text-white hover:bg-white hover:text-black font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-colors"
              >
                <Droplet className="w-4 h-4 text-amber-400" />
                <span>Распивы от 1 мл</span>
              </Link>
              <Link
                to="/catalog?kind=perfume"
                className="px-7 py-4 rounded-none border border-white/40 text-white text-xs font-semibold uppercase tracking-widest hover:border-white transition-colors"
              >
                Только парфюмерия
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Секция категорий с лаконичными 3D-плашками в строгом стиле Maison Arôme */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-3 pb-1 border-b border-zinc-200">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            Категории
          </h2>
          <Link
            to="/catalog"
            className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 hover:text-black transition-colors flex items-center gap-1"
          >
            Весь каталог <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Сетка плашек категорий: строгая геометрия (0px скруглений), лаконичный текст, товар слегка выглядывает снизу */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5 md:gap-4">
          {CATEGORY_3D_CARDS.map(cat => (
            <Link
              key={cat.id}
              to={cat.link}
              className="group relative rounded-none border border-zinc-200 bg-[#F8F8F9] hover:bg-[#F0F1F3] hover:border-black transition-all duration-300 p-4 sm:p-5 h-[165px] sm:h-[180px] md:h-[190px] flex flex-col justify-between overflow-hidden last:col-span-2 sm:last:col-span-1"
            >
              {/* Лаконичный текст: строго название и краткий подзаголовок без лишнего шума */}
              <div className="relative z-10">
                <h3 className="text-sm sm:text-base font-bold text-zinc-950 tracking-tight leading-snug">
                  {cat.label}
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-500 font-normal mt-0.5 leading-snug">
                  {cat.subtitle}
                </p>
              </div>

              {/* 3D мокап: аккуратно выглядывает из нижней границы плашки (overflow-hidden срезает низ флакона, как на референсе) */}
              <div className="absolute -bottom-2 sm:-bottom-3 inset-x-0 flex items-end justify-center pointer-events-none z-0 h-[105px] sm:h-[115px] md:h-[125px]">
                <picture className="h-full w-auto flex items-end justify-center">
                  <source srcSet={cat.image} type="image/webp" />
                  <img
                    src={cat.pngFallback}
                    alt={cat.label}
                    loading="lazy"
                    className="h-full w-auto max-w-[80%] object-contain object-bottom drop-shadow-[0_8px_16px_rgba(0,0,0,0.10)] group-hover:scale-105 group-hover:-translate-y-1 transition-transform duration-300 ease-out"
                  />
                </picture>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {hitPerfumes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-6 pb-2 border-b border-zinc-200">
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-zinc-950">Хиты продаж</h2>
            <Link to="/catalog?filter=hits" className="text-xs font-bold uppercase tracking-widest text-zinc-950 hover:underline flex items-center gap-1">
              В каталог <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {hitPerfumes.map(p => (
              <ProductCard key={p.id} perfume={p} />
            ))}
          </div>
        </section>
      )}

      {newPerfumes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-6 pb-2 border-b border-zinc-200">
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-zinc-950">Новинки</h2>
            <Link to="/catalog?filter=new" className="text-xs font-bold uppercase tracking-widest text-zinc-950 hover:underline flex items-center gap-1">
              Смотреть все <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {newPerfumes.map(p => (
              <ProductCard key={p.id} perfume={p} />
            ))}
          </div>
        </section>
      )}

      {/* Галерея собранных заказов */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-black bg-black text-white text-[10px] font-bold uppercase tracking-wider font-sans">
                <Camera className="w-3.5 h-3.5" />
                <span>Реальные фото перед отправкой</span>
              </span>
              <Link
                to="/reviews"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none border border-zinc-300 bg-white text-zinc-900 text-[10px] font-bold uppercase tracking-wider hover:border-black transition-colors font-sans"
              >
                <Star className="w-3.5 h-3.5 fill-black text-black" />
                <span>Отзывы 5.0 (1 420+)</span>
              </Link>
            </div>
            <h2 className="text-2xl sm:text-4xl font-normal font-serif text-zinc-950">
              Галерея наших заказов
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-2xl font-light">
              Каждую позицию мы собираем вручную, проверяем качество и отправляем покупателю фотоотчёт перед упаковкой.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/reviews"
              className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black flex items-center gap-1"
            >
              Смотреть отзывы <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/catalog"
              className="text-xs font-bold uppercase tracking-wider text-black hover:underline flex items-center gap-1"
            >
              Собрать свой заказ <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {ORDERS_GALLERY.slice(0, 4).map((item) => (
            <Link
              key={item.id}
              to="/gallery"
              className="group bg-white rounded-none overflow-hidden border border-zinc-200 hover:border-black hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-none font-sans tabular-nums">
                  {item.orderNumber}
                </span>
                <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-white/95 text-zinc-950 text-[10px] font-bold uppercase tracking-wider rounded-none font-sans shadow-xs backdrop-blur-xs">
                  г. {item.city}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mb-0.5 font-sans">
                    Заказ для {item.customerName}
                  </div>
                  <h3 className="font-bold text-sm text-zinc-950 group-hover:underline transition-colors uppercase tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed font-light line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-sans">
                  <span className="flex items-center gap-1 text-black font-semibold uppercase tracking-wider text-[10px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% оригинал
                  </span>
                  <span className="text-[10px] uppercase text-zinc-500">{item.badge}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: ShieldCheck, title: 'Оригинал', text: 'Работаем с проверенными поставщиками' },
            { icon: Camera, title: 'Фото перед отправкой', text: 'Покажем флакон перед упаковкой' },
            { icon: Truck, title: 'Доставка', text: 'СДЭК и курьер по России' },
            { icon: Droplet, title: 'Распив', text: 'Парфюмерия от 3 мл по запросу' },
          ].map(item => (
            <div key={item.title} className="p-5 rounded-none border border-zinc-200 bg-white hover:border-black transition-colors">
              <item.icon className="w-5 h-5 text-zinc-900 mb-2" />
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-950">{item.title}</div>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed font-light">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
        <Package className="w-8 h-8 mx-auto text-zinc-900" />
        <h2 className="text-2xl font-serif font-normal text-zinc-950">Как заказать</h2>
        <ol className="text-left sm:text-center text-xs uppercase tracking-wider font-semibold text-zinc-700 space-y-2.5 max-w-lg mx-auto">
          <li className="flex gap-2 sm:justify-center items-center">
            <Check className="w-4 h-4 text-black shrink-0" /> 1. Выберите товар в каталоге
          </li>
          <li className="flex gap-2 sm:justify-center items-center">
            <CheckCircle2 className="w-4 h-4 text-black shrink-0" /> 2. Оформите корзину и доставку
          </li>
          <li className="flex gap-2 sm:justify-center items-center">
            <Check className="w-4 h-4 text-black shrink-0" /> 3. Получите заказ с проверкой подлинности
          </li>
        </ol>
      </section>

      {/* Ответы на частые вопросы (FAQ) в конце главной страницы */}
      <FAQSection className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-6" />
    </div>
  );
};
