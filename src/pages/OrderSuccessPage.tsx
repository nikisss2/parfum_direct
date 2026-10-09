import React, { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import {
  CheckCircle2,
  Camera,
  Truck,
  ArrowRight,
  User,
  Package,
  ShieldCheck,
  Send,
  Copy,
  Check,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { TELEGRAM_MANAGER_USERNAME } from './CheckoutPage';

export const OrderSuccessPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const { orders, allOrders } = useShop();

  const order =
    (location.state as any)?.order ||
    orders.find(o => o.orderNumber === orderNumber) ||
    allOrders.find(o => o.orderNumber === orderNumber);

  const initialOrderText = (location.state as any)?.orderText || '';
  const [copied, setCopied] = useState(true);

  // Generate fallback order text if not in location state
  const orderText =
    initialOrderText ||
    (order
      ? `🛍️ ЗАКАЗ №${order.orderNumber}
PARFUM DIRECT (parfum-direct.ru)

👤 Покупатель: ${order.recipient.fullName}
📱 Телефон: ${order.recipient.phone}
💬 Telegram: ${order.recipient.telegram || 'Не указан'}
📍 Город: ${order.recipient.city}
🚚 Доставка: ${order.deliveryMethod}
🏠 Адрес: ${order.recipient.address}
${order.recipient.comment ? `📝 Комментарий: ${order.recipient.comment}\n` : ''}
🛒 СОСТАВ:
${order.items.map((it: any, idx: number) => `${idx + 1}. ${it.brand} ${it.name} — ${it.volumeLabel} × ${it.quantity} = ${(it.price * it.quantity).toLocaleString('ru-RU')} ₽`).join('\n')}

💰 ИТОГО: ${order.totalAmount.toLocaleString('ru-RU')} ₽`
      : '');

  const handleCopyAgain = async () => {
    if (!orderText) return;
    try {
      await navigator.clipboard.writeText(orderText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  const telegramUrl = orderText
    ? `https://t.me/${TELEGRAM_MANAGER_USERNAME}?text=${encodeURIComponent(orderText)}`
    : `https://t.me/${TELEGRAM_MANAGER_USERNAME}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center space-y-3.5">
        <div className="w-16 h-16 rounded-none bg-zinc-100 text-black border border-zinc-900 mx-auto flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none border border-emerald-300 bg-emerald-50 text-emerald-900 text-[11px] font-bold uppercase tracking-wider">
          <Check className="w-3.5 h-3.5 text-emerald-700" />
          <span>Текст заказа скопирован в буфер обмена</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-normal font-serif text-zinc-950 uppercase tracking-wide">
          Заказ №{orderNumber || (order ? order.orderNumber : 'PD-84210')}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 max-w-lg mx-auto font-light leading-relaxed">
          Заказ успешно сформирован! Перейдите в диалог Telegram с нашим менеджером и отправьте скопированный текст.
        </p>
      </div>

      {/* Main Telegram Action CTA Card */}
      <div className="mt-8 p-6 sm:p-8 rounded-none bg-zinc-950 text-white space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs font-bold uppercase tracking-widest text-[#C5D86D] flex items-center justify-center sm:justify-start gap-1.5">
              <Send className="w-3.5 h-3.5" />
              <span>Личный менеджер в Telegram</span>
            </div>
            <div className="text-sm font-semibold text-white">
              Менеджер онлайн: ответит и согласует отправку за 5 минут
            </div>
          </div>

          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-zinc-950 hover:bg-[#C5D86D] hover:text-black rounded-none text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Открыть диалог в Telegram</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>

        {/* 3 Step Instruction */}
        <div className="pt-6 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-[#C5D86D] uppercase tracking-wider text-[11px]">
              1. Откройте чат
            </div>
            <div className="text-zinc-400 leading-relaxed font-light">
              Нажмите кнопку выше или перейдите по ссылке @{TELEGRAM_MANAGER_USERNAME}
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-[#C5D86D] uppercase tracking-wider text-[11px]">
              2. Вставьте текст
            </div>
            <div className="text-zinc-400 leading-relaxed font-light">
              Вставьте скопированный заказ (Ctrl+V или «Вставить» на телефоне) и отправьте.
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-[#C5D86D] uppercase tracking-wider text-[11px]">
              3. Согласование
            </div>
            <div className="text-zinc-400 leading-relaxed font-light">
              Менеджер пришлет фото флаконов перед отправкой и согласует оплату (СБП/карта).
            </div>
          </div>
        </div>
      </div>

      {/* Copy Fallback Box */}
      {orderText && (
        <div className="mt-6 p-5 rounded-none bg-zinc-50 border border-zinc-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Текст сообщения для отправки в Telegram:
            </span>
            <button
              type="button"
              onClick={handleCopyAgain}
              className="px-3 py-1.5 bg-white hover:bg-black hover:text-white border border-zinc-300 rounded-none text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Скопировано!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Скопировать ещё раз</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-3 bg-white border border-zinc-200 text-xs font-mono text-zinc-800 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
            {orderText}
          </pre>
        </div>
      )}

      {/* Order preview breakdown */}
      {order && (
        <div className="mt-6 p-6 sm:p-8 rounded-none bg-white border border-zinc-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              Состав заказа
            </span>
            <span className="text-xs text-zinc-500 uppercase tracking-wider text-[11px] font-mono">
              {order.date}
            </span>
          </div>

          <div className="divide-y divide-zinc-100">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 truncate">
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      className="w-10 h-10 object-contain bg-zinc-50 rounded-none border border-zinc-200 shrink-0 p-0.5"
                    />
                  )}
                  <div className="truncate">
                    <span className="font-bold text-zinc-900 uppercase tracking-tight">{item.brand}</span>{' '}
                    <span className="text-zinc-700">{item.name}</span>
                    <span className="text-zinc-500 uppercase tracking-wider text-[11px] font-mono">
                      {' '}· {item.volumeLabel} × {item.quantity}
                    </span>
                  </div>
                </div>
                <div className="font-bold text-zinc-900 shrink-0 font-mono">
                  {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-sm font-bold text-zinc-950 uppercase tracking-wide">
            <span>Итого к оплате:</span>
            <span className="text-base font-serif">{order.totalAmount.toLocaleString('ru-RU')} ₽</span>
          </div>

          <div className="pt-2 text-xs text-zinc-600 space-y-1 font-light border-t border-zinc-100">
            <div>
              <strong className="font-bold uppercase tracking-wider text-[11px]">Получатель:</strong>{' '}
              {order.recipient.fullName} ({order.recipient.phone})
            </div>
            {order.recipient.telegram && (
              <div>
                <strong className="font-bold uppercase tracking-wider text-[11px]">Telegram:</strong>{' '}
                {order.recipient.telegram}
              </div>
            )}
            <div>
              <strong className="font-bold uppercase tracking-wider text-[11px]">Доставка:</strong>{' '}
              {order.deliveryMethod}, {order.recipient.city}, {order.recipient.address}
            </div>
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/account?tab=orders"
          className="px-7 py-4 rounded-none bg-black text-white hover:bg-zinc-800 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm"
        >
          <User className="w-4 h-4" />
          <span>Смотреть заказы в личном кабинете</span>
        </Link>
        <Link
          to="/catalog"
          className="px-7 py-4 rounded-none border border-black bg-white hover:bg-black hover:text-white text-zinc-900 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all"
        >
          <span>Вернуться в каталог</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
