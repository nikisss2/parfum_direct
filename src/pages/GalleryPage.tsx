import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  CheckCircle2,
  ShieldCheck,
  Truck,
  ArrowRight,
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Send,
  MapPin,
  Package
} from 'lucide-react';
import { ORDERS_GALLERY, OrderReport } from '../data/ordersGalleryData';
import { TELEGRAM_MANAGER_USERNAME } from './CheckoutPage';

export const GalleryPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'decant' | 'bottle' | 'box'>('all');
  const [selectedOrderIndex, setSelectedOrderIndex] = useState<number | null>(null);

  const filteredOrders = ORDERS_GALLERY.filter(ord => {
    if (activeFilter === 'all') return true;
    return ord.filterType === activeFilter;
  });

  const activeOrder: OrderReport | null =
    selectedOrderIndex !== null ? ORDERS_GALLERY[selectedOrderIndex] : null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedOrderIndex !== null) {
      setSelectedOrderIndex((selectedOrderIndex - 1 + ORDERS_GALLERY.length) % ORDERS_GALLERY.length);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedOrderIndex !== null) {
      setSelectedOrderIndex((selectedOrderIndex + 1) % ORDERS_GALLERY.length);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500">
        <Link to="/" className="hover:text-black transition-colors">Главная</Link>
        <span>/</span>
        <span className="text-zinc-900 font-medium">Галерея собранных заказов</span>
      </nav>

      {/* Hero Header */}
      <div className="rounded-none bg-zinc-950 text-white p-6 sm:p-10 relative overflow-hidden border border-zinc-900">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none border border-zinc-800 bg-white/5 text-[11px] font-bold uppercase tracking-widest text-amber-300">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>100% реальные фото перед каждой отправкой</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-normal font-serif tracking-tight leading-tight">
            Галерея заказов Maison Arôme
          </h1>

          <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-light">
            Каждая посылка собирается вручную в нашем бутике. Перед отправкой мы делаем детальные фотографии готовых отливантов, оригинальных коробок и батч-кодов, после чего направляем фото-отчёт клиенту в Telegram или WhatsApp.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Оплата после проверки фото</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <ShieldCheck className="w-4 h-4 text-white shrink-0" />
              <span>100% оригинальные флаконы</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <Truck className="w-4 h-4 text-white shrink-0" />
              <span>Доставка СДЭК / Яндекс / Почта</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Все фотоотчеты (10)' },
            { id: 'decant', label: 'Распивы и отливанты' },
            { id: 'bottle', label: 'Полные флаконы' },
            { id: 'box', label: 'Aroma Box наборы' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-4 py-2.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-black text-white border-black shadow-xs'
                  : 'bg-white text-zinc-700 border-zinc-300 hover:border-black hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-zinc-400 font-mono">
          Нажмите на карточку для просмотра в полном размере
        </div>
      </div>

      {/* Orders Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredOrders.map(order => {
          const globalIndex = ORDERS_GALLERY.findIndex(o => o.id === order.id);
          return (
            <div
              key={order.id}
              onClick={() => setSelectedOrderIndex(globalIndex)}
              className="group bg-white border border-zinc-200 hover:border-black transition-all flex flex-col justify-between overflow-hidden cursor-pointer shadow-xs hover:shadow-md"
            >
              {/* Photo Container */}
              <div className="relative aspect-[4/3] bg-zinc-100 overflow-hidden">
                <img
                  src={order.imageUrl}
                  alt={order.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Top Badge */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                  <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase tracking-wider font-mono">
                    {order.orderNumber}
                  </span>
                  <span className="px-2 py-0.5 bg-white/95 backdrop-blur-xs text-zinc-900 text-[9px] font-bold uppercase tracking-wider">
                    {order.badge}
                  </span>
                </div>

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3 py-1.5 bg-white text-zinc-950 text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-md">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Увеличить фото</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  {/* Customer and City Label */}
                  <div className="flex items-center gap-1.5 text-xs text-zinc-900 font-bold uppercase tracking-wide">
                    <MapPin className="w-3.5 h-3.5 text-[#5A6B32] shrink-0" />
                    <span>Заказ для {order.customerName} из {order.city}</span>
                  </div>

                  {/* Order Title */}
                  <div className="font-semibold text-xs text-zinc-800 mt-1 line-clamp-1">
                    {order.title}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed font-light line-clamp-2">
                    {order.description}
                  </p>

                  {/* Items mini chips */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {order.items.slice(0, 2).map((it, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 bg-zinc-100 text-[10px] text-zinc-700 font-mono truncate max-w-[200px]"
                      >
                        {it}
                      </span>
                    ))}
                    {order.items.length > 2 && (
                      <span className="px-1.5 py-0.5 bg-zinc-100 text-[10px] text-zinc-500 font-mono">
                        +{order.items.length - 2} еще
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Meta */}
                <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span className="flex items-center gap-1 text-emerald-600 font-bold uppercase">
                    <CheckCircle2 className="w-3 h-3" /> {order.status}
                  </span>
                  <span>{order.date}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE LIGHTBOX & CAROUSEL MODAL (Full 10-report inspection)        */}
      {/* ========================================================================= */}
      {activeOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedOrderIndex(null)}
        >
          <div
            className="relative bg-white border border-zinc-900 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedOrderIndex(null)}
              className="absolute top-3 right-3 z-20 p-2 bg-black/70 hover:bg-black text-white transition-colors cursor-pointer"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left/Right Carousel Controls */}
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/70 hover:bg-black text-white transition-colors cursor-pointer"
              title="Предыдущий заказ"
              aria-label="Предыдущий заказ"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-3 md:right-[43%] top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/70 hover:bg-black text-white transition-colors cursor-pointer"
              title="Следующий заказ"
              aria-label="Следующий заказ"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image Column */}
            <div className="relative md:w-3/5 bg-zinc-950 flex items-center justify-center overflow-hidden min-h-[280px] sm:min-h-[400px]">
              <img
                src={activeOrder.imageUrl}
                alt={activeOrder.title}
                className="w-full h-full object-contain max-h-[70vh]"
              />
              <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-black/80 backdrop-blur-xs text-white text-[11px] font-mono">
                {selectedOrderIndex! + 1} из {ORDERS_GALLERY.length} фотоотчетов
              </div>
            </div>

            {/* Content Column */}
            <div className="p-6 md:w-2/5 flex flex-col justify-between space-y-5 overflow-y-auto bg-white text-zinc-900">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-zinc-200">
                  <span className="font-bold text-black">{activeOrder.orderNumber}</span>
                  <span>{activeOrder.date}</span>
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs text-[#5A6B32] font-bold uppercase tracking-wider mb-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>Заказ для {activeOrder.customerName} ({activeOrder.city})</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold font-serif leading-snug">
                    {activeOrder.title}
                  </h3>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed font-light">
                  {activeOrder.description}
                </p>

                {/* Items List */}
                <div className="space-y-1.5 pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Состав отправления:
                  </div>
                  <ul className="space-y-1 text-xs">
                    {activeOrder.items.map((it, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-zinc-800">
                        <span className="text-[#5A6B32] font-bold font-mono">✓</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Logistics Info */}
                <div className="p-3 bg-zinc-50 border border-zinc-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">Логистика:</span>
                    <span className="font-bold font-mono text-zinc-900">{activeOrder.deliveryService}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">Контроль:</span>
                    <span className="text-emerald-600 font-bold uppercase">{activeOrder.status}</span>
                  </div>
                </div>
              </div>

              {/* Order Inquiry CTA */}
              <div className="pt-4 border-t border-zinc-200 space-y-2">
                <a
                  href={`https://t.me/${TELEGRAM_MANAGER_USERNAME}?text=${encodeURIComponent(
                    `Здравствуйте! Увидел в галерее заказ ${activeOrder.orderNumber} (для ${activeOrder.customerName}, г. ${activeOrder.city}): "${activeOrder.title}". Подскажите, есть ли такие позиции в наличии и какая актуальная стоимость?`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Заказать такой же набор в Telegram</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
