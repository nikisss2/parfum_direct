import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  CheckCircle2,
  ShieldCheck,
  Camera,
  ThumbsUp,
  Sparkles,
  ArrowRight,
  Package,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { ORDERS_GALLERY } from '../data/ordersGalleryData';
import { ALL_REVIEWS_DATA, type ReviewItem } from '../data/reviewsData';
import { SEO } from '../components/SEO';

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>(ALL_REVIEWS_DATA);
  const [activeFilter, setActiveFilter] = useState<'all' | 'decant' | 'bottle' | 'box'>('all');
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState<number>(12);

  const toggleLike = (id: string) => {
    setLikedReviews(prev => {
      const isLiked = !!prev[id];
      setReviews(curr =>
        curr.map(r => (r.id === id ? { ...r, likes: isLiked ? r.likes - 1 : r.likes + 1 } : r))
      );
      return { ...prev, [id]: !isLiked };
    });
  };

  const filteredReviews = reviews.filter(r => {
    if (activeFilter === 'decant') return r.type === 'decant';
    if (activeFilter === 'bottle') return r.type === 'bottle';
    if (activeFilter === 'box') return r.type === 'box';
    return true;
  });

  const displayedReviews = filteredReviews.slice(0, visibleCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 sm:space-y-12">
      <SEO
        title="Отзывы покупателей с фото заказов | Maison Arôme"
        description="Реальные отзывы клиентов с фотографиями полученных заказов парфюмерии и распивов в Maison Arôme. Честный рейтинг 4.9 из 5."
        canonical="https://maison-arome.ru/reviews"
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500">
        <Link to="/" className="hover:text-zinc-900 transition-colors">Главная</Link>
        <span>/</span>
        <span className="text-zinc-900 font-medium">Отзывы покупателей</span>
      </nav>

      {/* Hero Social Proof Banner */}
      <div className="rounded-none bg-zinc-950 text-white p-6 sm:p-10 lg:p-12 relative overflow-hidden border border-zinc-900">
        <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-800/20 rounded-none pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Big score and summary */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none border border-zinc-800 bg-white/5 text-[11px] font-bold uppercase tracking-widest text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>112 проверенных отзывов реальных покупателей</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal font-serif tracking-tight leading-tight">
              Отзывы о Maison Arôme
            </h1>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-xl font-light">
              Мы дорожим безупречной репутацией и доверием каждого клиента. Все 112 отзывов подтверждены реальными отправками по всей России: от Калининграда до Владивостока.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/catalog"
                className="px-7 py-4 rounded-none bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <span>Перейти в каталог</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#gallery"
                className="px-6 py-4 rounded-none border border-zinc-700 hover:border-white text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-white transition-all flex items-center gap-2"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Фото заказов в галерее</span>
              </a>
            </div>
          </div>

          {/* Right Column: Score Breakdown */}
          <div className="lg:col-span-5 bg-zinc-900/80 border border-zinc-800 rounded-none p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <div className="text-4xl sm:text-5xl font-serif text-white">5.0</div>
                <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">из 5.0 на основе 112 отзывов</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1 uppercase tracking-wider">
                  100% рекомендуют нас
                </div>
              </div>
            </div>

            {/* Stars Bar Chart */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-14 text-zinc-400 font-medium">5 звезд</span>
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-none overflow-hidden">
                  <div className="h-full bg-white rounded-none w-[100%]" />
                </div>
                <span className="w-10 text-right text-zinc-300 font-bold">112 (100%)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-14 text-zinc-400 font-medium">4 звезды</span>
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-none overflow-hidden">
                  <div className="h-full bg-zinc-400 rounded-none w-[0%]" />
                </div>
                <span className="w-10 text-right text-zinc-300 font-bold">0%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-14 text-zinc-400 font-medium">3 звезды</span>
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-none overflow-hidden">
                  <div className="h-full bg-zinc-600 rounded-none w-[0%]" />
                </div>
                <span className="w-10 text-right text-zinc-300 font-bold">0%</span>
              </div>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-3 text-[11px] text-zinc-300 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% оригинал</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Фото перед отправкой</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: `Все отзывы (${reviews.length})` },
            { id: 'decant', label: `Распивы (${reviews.filter(r => r.type === 'decant').length})` },
            { id: 'bottle', label: `Флаконы (${reviews.filter(r => r.type === 'bottle').length})` },
            { id: 'box', label: `Аромабоксы (${reviews.filter(r => r.type === 'box').length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilter(tab.id as any);
                setVisibleCount(12);
              }}
              className={`px-4 py-2.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-black hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-zinc-500 font-mono">
          Показано: {displayedReviews.length} из {filteredReviews.length}
        </div>
      </div>

      {/* Reviews Grid (Pure text, no photos in reviews) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedReviews.map(review => (
          <div
            key={review.id}
            className="p-6 rounded-none bg-white border border-zinc-200 hover:border-black transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header with name, stars, date */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-950 uppercase tracking-wide">{review.author}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none border border-zinc-200 bg-zinc-50 text-zinc-800 text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Покупатель
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">
                    г. {review.city} · {review.date}
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>

              {/* Fragrances tags */}
              {review.fragrances.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {review.fragrances.map((frag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-none border border-zinc-200 bg-zinc-50 text-zinc-800 text-[10px] font-bold uppercase tracking-wider"
                    >
                      {frag}
                    </span>
                  ))}
                </div>
              )}

              {/* Comment text */}
              <p className="mt-3.5 text-xs sm:text-sm text-zinc-700 leading-relaxed font-light">
                {review.comment}
              </p>

              {/* Admin reply if any */}
              {review.adminReply && (
                <div className="mt-4 p-4 rounded-none bg-zinc-50 border-l-2 border-black text-xs space-y-1">
                  <div className="font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3 h-3 text-black" />
                    Ответ Maison Arôme:
                  </div>
                  <div className="text-zinc-600 leading-relaxed font-light">{review.adminReply}</div>
                </div>
              )}
            </div>

            {/* Footer with Like button */}
            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
              <span className="text-[10px] uppercase tracking-wider">Заказ проверен службой контроля</span>
              <button
                type="button"
                onClick={() => toggleLike(review.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none border text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  likedReviews[review.id]
                    ? 'border-black bg-black text-white'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-black'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{review.likes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Load More Button */}
      {visibleCount < filteredReviews.length && (
        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount(prev => prev + 12)}
            className="px-8 py-3.5 bg-black hover:bg-zinc-800 text-white rounded-none text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <span>Показать еще 12 отзывов</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <div className="text-[11px] text-zinc-400 font-mono mt-2">
            Показано {displayedReviews.length} из {filteredReviews.length} отзывов
          </div>
        </div>
      )}

      {/* Галерея собранных заказов (Фото перед отправкой остаются ТОЛЬКО здесь) */}
      <section id="gallery" className="pt-10 space-y-6 border-t border-zinc-200">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest font-mono mb-2">
              <Camera className="w-3.5 h-3.5 text-white" />
              <span>Фотоконтроль заказов</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-zinc-950 font-normal">
              Галерея собранных заказов
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-light mt-1 max-w-xl">
              Перед каждой отправкой мы делаем подробные фотографии собранного заказа, флаконов и тревел-атомайзеров, и присылаем их клиенту в Telegram перед оплатой.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/gallery"
              className="text-xs font-bold uppercase tracking-wider text-black hover:underline flex items-center gap-1"
            >
              <span>Все фото в галерее</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Mini-Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {ORDERS_GALLERY.map((item, idx) => (
            <Link
              key={idx}
              to="/gallery"
              className="group bg-white border border-zinc-200 hover:border-black transition-all flex flex-col justify-between overflow-hidden cursor-pointer shadow-xs hover:shadow-md"
            >
              <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-black text-white text-[9px] font-bold uppercase tracking-wider font-mono">
                  {item.orderNumber}
                </span>
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-white/95 backdrop-blur-xs text-zinc-900 text-[8px] font-bold uppercase tracking-wider">
                  {item.badge}
                </span>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-900 font-bold uppercase tracking-wide truncate">
                    <MapPin className="w-3 h-3 text-[#5A6B32] shrink-0" />
                    <span className="truncate">Заказ для {item.customerName} ({item.city})</span>
                  </div>
                  <h3 className="font-semibold text-[11px] text-zinc-700 mt-1 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-snug font-light line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[9px] text-zinc-400 font-mono">
                  <span className="flex items-center gap-1 text-emerald-600 font-bold uppercase">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Фото подтверждено
                  </span>
                  <span>{item.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="pt-2 text-center">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <span>Смотреть все фото реальных посылок в галерее</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
