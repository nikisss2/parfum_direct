import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMeta, fetchProducts, listItemToPerfume } from '../api/catalog';
import { ProductCard } from '../components/ProductCard';
import { Perfume, PRODUCT_KIND_OPTIONS } from '../types';
import {
  Sparkles,
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

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      <section className="relative bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=2000&q=80"
            alt="Parfum Direct"
            className="w-full h-full object-cover object-center filter brightness-50"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent z-10" />

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-32 lg:py-36">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-black/60 backdrop-blur-md border border-white/20 text-[10px] uppercase tracking-widest text-white font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Оригинальная продукция</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-normal font-serif tracking-tight leading-[1.1]">
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
                to="/aromabox"
                className="px-7 py-4 rounded-none bg-black border border-white text-white hover:bg-white hover:text-black font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Конструктор ароматов (−15%)</span>
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Категории</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {PRODUCT_KIND_OPTIONS.map(k => (
            <Link
              key={k.id}
              to={`/catalog?kind=${k.id}`}
              className="px-3 py-4 rounded-none border border-zinc-200 text-center text-xs font-bold uppercase tracking-wider text-zinc-900 hover:border-black hover:bg-black hover:text-white transition-all bg-white"
            >
              {k.label}
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

      {/* Интерактивный баннер конструктора «Собери свой аромабокс» */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-none bg-zinc-950 text-white p-6 sm:p-10 lg:p-12 overflow-hidden border border-zinc-800">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-black/60 border border-amber-400/40 text-[10px] font-bold uppercase tracking-widest text-amber-300">
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>Индивидуальный парфюмерный гардероб</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-normal font-serif tracking-tight leading-tight">
                Конструктор «Собери свой Аромабокс»
              </h2>
              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-light">
                Выберите 3, 5 или 8 любых нишевых и люксовых ароматов от 3 мл в стильный фирменный бокс с магнитным клапаном. Пакетная скидка до <strong>−20%</strong> и премиальный стеклянный атомайзер с металлической помпой в каждом слоте.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/aromabox"
                  className="px-7 py-4 rounded-none bg-white text-zinc-950 hover:bg-zinc-200 font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Собрать свой аромабокс</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="text-xs uppercase tracking-wider text-zinc-400 flex items-center gap-2 font-mono">
                  <span className="w-2 h-2 rounded-none bg-[#A3B18A]" />
                  <span>Скидка от 10% до 20% считается автоматически</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-zinc-900/90 border border-zinc-800 rounded-none p-6 space-y-3">
              <div className="text-xs font-bold uppercase tracking-widest text-amber-300">
                Что внутри бокса:
              </div>
              <ul className="space-y-2 text-xs text-zinc-300 font-light">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#A3B18A] shrink-0" />
                  <span>3, 5 или 8 атомайзеров по 5 мл или 10 мл</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#A3B18A] shrink-0" />
                  <span>Премиальная подарочная коробка на скрытом магните</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#A3B18A] shrink-0" />
                  <span>Стеклянные флаконы со стойкими гравировками</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#A3B18A] shrink-0" />
                  <span>Бесплатная доставка от 15 000 ₽</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

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
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none border border-black bg-black text-white text-[10px] font-bold uppercase tracking-wider font-mono">
                <Camera className="w-3.5 h-3.5" />
                <span>Реальные фото перед отправкой</span>
              </span>
              <Link
                to="/reviews"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none border border-zinc-300 bg-white text-zinc-900 text-[10px] font-bold uppercase tracking-wider hover:border-black transition-colors"
              >
                <Star className="w-3.5 h-3.5 fill-black text-black" />
                <span>Отзывы 4.9 (1 420+)</span>
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
          {[
            {
              src: '/assets/gallery/order-decants.jpg',
              badge: 'Заказ №84920',
              title: 'Сет премиальных отливантов',
              desc: '4 флакона по 10 мл в фирменном ложементе, ручная каллиграфия с пожеланием',
            },
            {
              src: '/assets/gallery/order-bottles.jpg',
              badge: 'Фотоконтроль флаконов',
              title: 'Проверка перед отправкой',
              desc: 'Полноразмерные оригинальные флаконы с фиксацией состояния перед упаковкой',
            },
            {
              src: '/assets/gallery/order-arabian.jpg',
              badge: 'Заказ №84912',
              title: 'Коллекция арабских ароматов',
              desc: 'Флакон восточной селекции + сет дорожных спреев в крафтовом боксе с древесной стружкой',
            },
            {
              src: '/assets/gallery/order-dispatch.jpg',
              badge: 'СДЭК и курьер',
              title: 'Бережная подготовка к отправке',
              desc: 'Надежная многослойная защита, сургучная печать и отправка в день оформления',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-none overflow-hidden border border-zinc-200 hover:border-black hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-none font-mono">
                  {item.badge}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="font-bold text-sm text-zinc-950 group-hover:underline transition-colors uppercase tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span className="flex items-center gap-1 text-black font-semibold uppercase tracking-wider text-[10px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% оригинал
                  </span>
                  <span className="text-[10px] uppercase">Клиентский заказ</span>
                </div>
              </div>
            </div>
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
