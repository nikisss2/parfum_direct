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

  // Pipeline step calculation
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
          Служба заботы · Онлайн-отслеживание
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif text-zinc-950 uppercase tracking-wide">
          Отследить статус заказа
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 font-light leading-relaxed">
          Введите номер заказа (например, ORD-12345) или контактный телефон для мгновенной проверки статуса сборки и трек-номера.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
        <div className="flex border-2 border-black bg-white shadow-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Номер заказа (ORD-XXXXX) или телефон..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 text-xs outline-none bg-white text-zinc-950 font-mono"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-widest transition-colors shrink-0 flex items-center gap-2"
          >
            {loading ? 'Поиск...' : 'Проверить'}
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="max-w-xl mx-auto p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Заказ не найден</div>
            <div className="mt-0.5 text-rose-700">{error}</div>
            <div className="mt-2 text-[11px]">
              Нужна помощь? Напишите нам в Telegram: <a href="https://t.me/nikisss2" target="_blank" rel="noreferrer" className="underline font-bold">@nikisss2</a>
            </div>
          </div>
        </div>
      )}

      {/* Order Result Card */}
      {order && (
        <div className="border border-black bg-white shadow-xl p-6 sm:p-8 space-y-8 animate-in fade-in">
          {/* Top Order Badge & Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-200 gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase">Заказ</span>
                <span className="text-xl font-serif font-bold text-zinc-950">№ {order.orderNumber}</span>
              </div>
              <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                Оформлен: {order.date} · Получатель: {order.recipientName}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-zinc-900 text-white text-xs font-mono font-bold uppercase tracking-wider">
                {order.statusLabel || 'В обработке'}
              </span>
            </div>
          </div>

          {/* 5-Step Pipeline */}
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Этапы выполнения заказа
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { step: 1, title: 'Принят', desc: 'Заказ зарегистрирован' },
                { step: 2, title: 'Согласован', desc: 'Оплата и подтверждение' },
                { step: 3, title: 'Сборка & отлив', desc: 'Стерильный розлив 5 мл' },
                { step: 4, title: 'В доставке', desc: 'Передан курьеру/в ПВЗ' },
                { step: 5, title: 'Вручен', desc: 'Успешно получен' },
              ].map(s => {
                const isPassed = currentStep >= s.step;
                const isCurrent = currentStep === s.step;
                return (
                  <div
                    key={s.step}
                    className={`p-3 border transition-colors ${
                      isCurrent
                        ? 'border-black bg-zinc-950 text-white shadow-md'
                        : isPassed
                        ? 'border-emerald-500/40 bg-emerald-50 text-emerald-950'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 font-mono text-[10px]">
                      <span className="font-bold">0{s.step}</span>
                      {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <div className="font-serif font-bold text-xs">{s.title}</div>
                    <div className={`text-[10px] mt-0.5 ${isCurrent ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {s.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery & Tracking Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-200 text-xs">
            <div className="space-y-2">
              <div className="font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-zinc-900" />
                <span>Доставка</span>
              </div>
              <div className="text-zinc-700">
                <span className="font-semibold">{order.deliveryMethod}</span>
              </div>
              {order.address && (
                <div className="text-zinc-500 flex items-start gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span>{order.address}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-zinc-900" />
                <span>Трек-номер отправления</span>
              </div>
              {order.trackingNumber ? (
                <div className="space-y-2">
                  <div className="font-mono text-sm font-bold text-black bg-zinc-100 p-2 border border-zinc-300 inline-block">
                    {order.trackingNumber}
                  </div>
                  <div>
                    <a
                      href={`https://www.cdek.ru/ru/tracking?order_id=${order.trackingNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-black underline font-semibold hover:text-zinc-600"
                    >
                      <span>Отследить на сайте службы доставки</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-zinc-500 text-[11px] leading-relaxed">
                  Трек-номер будет сформирован после завершения упаковки и передан в ваш Telegram @nikisss2.
                </div>
              )}
            </div>
          </div>

          {/* Items in Order */}
          {order.items && order.items.length > 0 && (
            <div className="pt-4 border-t border-zinc-200 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                Состав заказа ({order.items.length} поз.)
              </div>
              <div className="divide-y divide-zinc-100 border border-zinc-200 bg-zinc-50 p-3 space-y-2 max-h-48 overflow-y-auto">
                {order.items.map((it, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-[10px] text-zinc-400 uppercase mr-1.5">{it.brand}</span>
                      <span className="font-bold text-zinc-900">{it.name}</span>
                      <span className="text-[10px] text-zinc-500 ml-2 font-mono">({it.volumeLabel}) × {it.quantity}</span>
                    </div>
                    <div className="font-mono font-bold text-zinc-950">
                      {(it.price * it.quantity).toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Telegram Action Bar */}
          <div className="pt-4 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50 p-4 border border-zinc-200">
            <div className="flex items-center gap-2.5 text-xs text-zinc-600">
              <Camera className="w-4 h-4 text-[#5A6B32] shrink-0" />
              <span>Фото собранных флаконов направляются лично менеджеру в Telegram перед отправкой.</span>
            </div>

            <a
              href={`https://t.me/nikisss2?text=${encodeURIComponent(`Здравствуйте! Хочу уточнить статус заказа №${order.orderNumber}`)}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Написать менеджеру</span>
            </a>
          </div>
        </div>
      )}

      {/* Helpful Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-zinc-200 text-xs">
        <div className="p-4 border border-zinc-200 bg-zinc-50 space-y-1">
          <div className="font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-[#5A6B32]" />
            <span>Фотоотчет флаконов</span>
          </div>
          <p className="text-zinc-500 leading-relaxed font-light">
            Перед оплатой и запечатыванием посылки мы делаем реальные фото ваших атомайзеров и флаконов.
          </p>
        </div>

        <div className="p-4 border border-zinc-200 bg-zinc-50 space-y-1">
          <div className="font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#5A6B32]" />
            <span>Страховка на 100%</span>
          </div>
          <p className="text-zinc-500 leading-relaxed font-light">
            Каждое отправление застраховано от повреждения или утери транспортной компанией.
          </p>
        </div>

        <div className="p-4 border border-zinc-200 bg-zinc-50 space-y-1">
          <div className="font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#5A6B32]" />
            <span>Отправка от 1 дня</span>
          </div>
          <p className="text-zinc-500 leading-relaxed font-light">
            Заказы собираются на складе в Москве и передаются в СДЭК и Яндекс Доставку ежедневно.
          </p>
        </div>
      </div>
    </div>
  );
};
