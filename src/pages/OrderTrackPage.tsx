import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Camera,
  MapPin,
  Send,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface TrackedOrder {
  orderNumber: string;
  date: string;
  createdAt: string;
  status: string;
  statusLabel: string;
  trackingNumber?: string;
  deliveryMethod: string;
  deliveryPrice: number;
  totalAmount: number;
  itemsCount: number;
  items: Array<{
    name: string;
    brand: string;
    volumeLabel: string;
    quantity: number;
    price: number;
  }>;
  city?: string;
  address?: string;
  recipientName?: string;
}

export const OrderTrackPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('order') || '';

  const [query, setQuery] = useState(initialQuery);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrack = (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    fetch(`/api/orders/track?q=${encodeURIComponent(q.trim())}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Заказ не найден');
        }
        setOrder(data.order);
      })
      .catch(err => {
        setOrder(null);
        setError(err.message || 'Ошибка поиска заказа');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (initialQuery) {
      fetchTrack(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      fetchTrack(query.trim());
    }
  };

  const getStepIndex = (status?: string): number => {
    switch (status) {
      case 'new':
      case 'created':
        return 1;
      case 'paid':
        return 2;
      case 'assembling':
        return 3;
      case 'sent':
        return 4;
      case 'delivered':
        return 5;
      default:
        return 2;
    }
  };

  const currentStep = getStepIndex(order?.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10 sm:space-y-12">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[11px] font-normal uppercase tracking-[0.16em] text-zinc-400">
          Служба заботы · Maison Arôme
        </span>
        <h1 className="text-2xl sm:text-4xl font-light text-zinc-950 tracking-tight">
          Отследить статус заказа
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 font-light leading-relaxed text-delicate">
          Введите номер заказа (напр. ORD-12345) или контактный телефон для быстрой проверки статуса сборки.
        </p>
      </div>

      {/* Pill Search Input Box */}
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
        <div className="relative flex items-center p-1.5 bg-zinc-50 hover:bg-zinc-100/70 rounded-full border border-zinc-200/80 focus-within:border-black focus-within:bg-white transition-all shadow-2xs">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Номер заказа или телефон..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 text-xs outline-none bg-transparent text-zinc-950 font-light placeholder:text-zinc-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="pill-btn-black py-2.5 px-6 rounded-full text-xs font-light transition-colors shrink-0 cursor-pointer"
          >
            {loading ? 'Поиск...' : 'Проверить'}
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="max-w-xl mx-auto p-5 bg-rose-50 rounded-[20px] border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-medium">Заказ не найден</div>
            <div className="mt-0.5 text-rose-700 font-light">{error}</div>
            <div className="mt-2 text-[11px]">
              Нужна помощь? Напишите нам в Telegram:{' '}
              <a href="https://t.me/nikisss2" target="_blank" rel="noreferrer" className="underline font-medium">
                @nikisss2
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Order Result Card */}
      {order && (
        <div className="rounded-[32px] border border-zinc-200/70 bg-white shadow-2xs p-6 sm:p-8 space-y-8 animate-in fade-in">
          {/* Top Order Badge & Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-200/70 gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-normal uppercase tracking-wider text-zinc-400">Заказ</span>
                <span className="text-xl font-light text-zinc-950">№ {order.orderNumber}</span>
              </div>
              <div className="text-xs text-zinc-500 font-light mt-0.5 text-delicate">
                Оформлен: {order.date} · Получатель: {order.recipientName}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 rounded-full bg-black text-white text-xs font-light">
                {order.statusLabel || 'В обработке'}
              </span>
            </div>
          </div>

          {/* 5-Step Pipeline */}
          <div className="space-y-4">
            <div className="text-[11px] font-normal uppercase tracking-[0.16em] text-zinc-400">
              Этапы выполнения заказа
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {[
                { step: 1, title: 'Принят', desc: 'Заказ зарегистрирован' },
                { step: 2, title: 'Согласован', desc: 'Оплата и подтверждение' },
                { step: 3, title: 'Сборка', desc: 'Стерильный розлив' },
                { step: 4, title: 'В доставке', desc: 'Передан курьеру/в ПВЗ' },
                { step: 5, title: 'Вручен', desc: 'Успешно получен' },
              ].map(s => {
                const isPassed = currentStep >= s.step;
                const isCurrent = currentStep === s.step;
                return (
                  <div
                    key={s.step}
                    className={`p-3.5 rounded-[20px] border transition-all ${
                      isCurrent
                        ? 'border-black bg-zinc-950 text-white shadow-2xs'
                        : isPassed
                        ? 'border-emerald-200 bg-emerald-50/60 text-emerald-950'
                        : 'border-zinc-200/70 bg-zinc-50/60 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 tabular-nums text-[10px]">
                      <span className="font-light">0{s.step}</span>
                      {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <div className="text-xs font-medium">{s.title}</div>
                    <div className={`text-[10px] mt-0.5 font-light ${isCurrent ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {s.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery & Tracking Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-200/70 text-xs">
            <div className="space-y-1.5">
              <div className="text-[11px] font-normal uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-zinc-700" />
                <span>Доставка</span>
              </div>
              <div className="text-zinc-900 font-medium">
                {order.deliveryMethod}
              </div>
              {order.address && (
                <div className="text-zinc-500 flex items-start gap-1.5 pt-0.5 font-light text-delicate">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span>{order.address}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-normal uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-zinc-700" />
                <span>Трек-номер отправления</span>
              </div>
              {order.trackingNumber ? (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-black bg-zinc-100 rounded-full px-3 py-1 inline-block tracking-wider tabular-nums">
                    {order.trackingNumber}
                  </div>
                  <div>
                    <a
                      href={`https://www.cdek.ru/ru/tracking?order_id=${order.trackingNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-black underline font-light hover:text-zinc-600"
                    >
                      <span>Отследить на сайте службы доставки</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-zinc-400 text-xs font-light leading-relaxed text-delicate">
                  Трек-номер будет направлен в диалог Telegram после передачи посылки курьеру.
                </div>
              )}
            </div>
          </div>

          {/* Items in Order */}
          {order.items && order.items.length > 0 && (
            <div className="pt-4 border-t border-zinc-200/70 space-y-3">
              <div className="text-[11px] font-normal uppercase tracking-wider text-zinc-400">
                Состав заказа ({order.items.length} поз.)
              </div>
              <div className="divide-y divide-zinc-100 rounded-[24px] bg-zinc-50/70 p-4 space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                {order.items.map((it, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase mr-1.5 font-semibold">{it.brand}</span>
                      <span className="font-light text-zinc-900">{it.name}</span>
                      <span className="text-[10px] text-zinc-400 ml-2 font-light tabular-nums">
                        ({it.volumeLabel}) × {it.quantity}
                      </span>
                    </div>
                    <div className="font-medium text-zinc-950 tabular-nums">
                      {(it.price * it.quantity).toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Telegram Action Bar */}
          <div className="pt-4 border-t border-zinc-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 p-5 rounded-[24px] bg-[#F7F7F8]">
            <div className="flex items-center gap-2.5 text-xs text-zinc-500 font-light text-delicate">
              <Camera className="w-4 h-4 text-zinc-800 shrink-0" />
              <span>Фото собранных флаконов и упаковки отправляются в диалог Telegram.</span>
            </div>

            <a
              href={`https://t.me/nikisss2?text=${encodeURIComponent(`Здравствуйте! Хочу уточнить статус заказа №${order.orderNumber}`)}`}
              target="_blank"
              rel="noreferrer"
              className="pill-btn-black py-2.5 px-6 rounded-full text-xs font-light flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Написать в Telegram</span>
            </a>
          </div>
        </div>
      )}

      {/* Helpful Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-200/70 text-xs">
        <div className="p-5 rounded-[24px] bg-[#F7F7F8] border border-zinc-200/60 space-y-1 shadow-2xs">
          <div className="font-normal uppercase tracking-wider text-zinc-900 flex items-center gap-2 text-[11px]">
            <Camera className="w-4 h-4 text-zinc-900" />
            <span>Фотоотчет перед отправкой</span>
          </div>
          <p className="text-zinc-500 leading-relaxed font-light text-delicate">
            Перед упаковкой и передачей курьеру мы отправляем реальные фото флаконов в Telegram.
          </p>
        </div>

        <div className="p-5 rounded-[24px] bg-[#F7F7F8] border border-zinc-200/60 space-y-1 shadow-2xs">
          <div className="font-normal uppercase tracking-wider text-zinc-900 flex items-center gap-2 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-zinc-900" />
            <span>100% Оригинал с батч-кодом</span>
          </div>
          <p className="text-zinc-500 leading-relaxed font-light text-delicate">
            Каждое отправление застраховано от повреждения или утери транспортной компанией.
          </p>
        </div>

        <div className="p-5 rounded-[24px] bg-[#F7F7F8] border border-zinc-200/60 space-y-1 shadow-2xs">
          <div className="font-normal uppercase tracking-wider text-zinc-900 flex items-center gap-2 text-[11px]">
            <Clock className="w-4 h-4 text-zinc-900" />
            <span>Отправка от 1 дня</span>
          </div>
          <p className="text-zinc-500 leading-relaxed font-light text-delicate">
            Заказы собираются на складе в Москве и передаются в СДЭК и Яндекс Доставку ежедневно.
          </p>
        </div>
      </div>
    </div>
  );
};
