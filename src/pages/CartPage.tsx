import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Camera,
  Tag,
  Check,
  Gift,
  Truck,
  Sparkles
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, cartTotalPrice } = useShop();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    if (promoCode.trim().toUpperCase() === 'PARFUM10') {
      setDiscountPercent(10);
      setPromoApplied(true);
    } else if (promoCode.trim().toUpperCase() === 'WELCOME') {
      setDiscountPercent(15);
      setPromoApplied(true);
    } else {
      setPromoError('Неверный промокод. Попробуйте промокод PARFUM10 или WELCOME');
    }
  };

  const discountAmount = Math.round(cartTotalPrice * (discountPercent / 100));
  const finalPrice = cartTotalPrice - discountAmount;

  const FREE_SHIPPING_THRESHOLD = 15000;
  const remainingForGift = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotalPrice);
  const progressPercent = Math.min(100, Math.round((cartTotalPrice / FREE_SHIPPING_THRESHOLD) * 100));
  const isFreeShippingUnlocked = cartTotalPrice >= FREE_SHIPPING_THRESHOLD;

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-none border border-zinc-200 bg-zinc-50 text-zinc-900 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-normal font-serif text-zinc-950">Ваша корзина пуста</h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto font-light">
            В корзине пока нет товаров. Выберите распивы от 3 мл или оригинальные флаконы в каталоге.
          </p>
        </div>
        <div>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-7 py-4 bg-black text-white rounded-none text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
          >
            <span>Перейти в каталог</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-normal font-serif text-zinc-950">Корзина</h1>
          <div className="text-xs uppercase tracking-wider text-zinc-400 mt-1 font-mono">
            {cart.length} {cart.length === 1 ? 'наименование' : 'наименований'} в заказе
          </div>
        </div>

        <button
          onClick={clearCart}
          className="text-xs uppercase tracking-wider font-bold text-zinc-400 hover:text-rose-600 transition-colors flex items-center gap-1 self-start sm:self-center"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Очистить корзину</span>
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Free Shipping Progress Bar */}
          <div className="p-5 rounded-none border border-zinc-200 bg-zinc-50">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-none bg-black text-white flex items-center justify-center shrink-0">
                  {isFreeShippingUnlocked ? <Check className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                </span>
                <div>
                  {isFreeShippingUnlocked ? (
                    <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-950">
                      🎉 Бесплатная доставка (0 ₽) активирована!
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-900">
                      До бесплатной доставки осталось{' '}
                      <span className="font-mono font-black">{remainingForGift.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  )}
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {isFreeShippingUnlocked
                      ? 'Доставка по РФ и СНГ за наш счет (СДЭК / Яндекс / Почта)'
                      : 'При заказе от 15 000 ₽ доставка по РФ и СНГ бесплатна'}
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold font-mono text-zinc-900 shrink-0">
                {progressPercent}%
              </span>
            </div>

            {/* Progress Bar Line */}
            <div className="w-full h-2 bg-zinc-200 rounded-none overflow-hidden mt-3">
              <div
                className="h-full rounded-none transition-all duration-500 bg-black"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-none bg-white overflow-hidden shadow-xs">

            {cart.map(item => (
              <div key={item.id} className="p-4 sm:p-5 flex items-start gap-4">
                <img
                  src={item.image}
                  alt=""
                  className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-none border border-zinc-200 shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">
                    {item.brand}
                  </div>
                  <div className="font-semibold text-sm sm:text-base text-zinc-950 mt-0.5 truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5 font-mono">
                    <span className="font-medium text-zinc-800">{item.volumeLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.price.toLocaleString('ru-RU')} ₽ / шт</span>
                  </div>

                  {/* Quantity and subtotal */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-none bg-white dark:bg-zinc-800">
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="w-8 h-8 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-xs font-bold flex items-center justify-center"
                        aria-label="Уменьшить"
                      >
                        −
                      </button>
                      <span className="w-8 h-8 text-xs font-bold font-mono flex items-center justify-center border-x border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="w-8 h-8 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-xs font-bold flex items-center justify-center"
                        aria-label="Увеличить"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-base font-bold font-mono text-zinc-950 dark:text-white">
                        {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                        aria-label="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Продолжить покупки</span>
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-none bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-5">
            <h2 className="text-base font-normal font-serif text-zinc-950 dark:text-white">
              Сумма заказа
            </h2>

            {/* Promo Code Input */}
            <form onSubmit={applyPromo} className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Промокод на скидку:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Введите промокод"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  className="flex-1 uppercase bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white px-3.5 py-2.5 rounded-none outline-none focus:border-black dark:focus:border-white font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider rounded-none hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Применить
                </button>
              </div>
              {promoApplied && (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold uppercase tracking-wider font-mono">
                  <Check className="w-3.5 h-3.5" />
                  Скидка {discountPercent}% применена!
                </div>
              )}
              {promoError && (
                <div className="text-xs text-rose-600 font-medium">
                  {promoError}
                </div>
              )}
            </form>

            {/* Price Calculations */}
            <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Товары ({cart.reduce((a, b) => a + b.quantity, 0)} шт.)</span>
                <span className="font-mono text-zinc-950 dark:text-white">{cartTotalPrice.toLocaleString('ru-RU')} ₽</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-zinc-900 dark:text-white font-bold">
                  <span>Скидка ({discountPercent}%)</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">−{discountAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}

              <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400">
                <span>Доставка</span>
                <span className={isFreeShippingUnlocked ? "text-zinc-950 dark:text-white font-bold uppercase tracking-wider font-mono" : "text-zinc-500 font-mono"}>
                  {isFreeShippingUnlocked ? "0 ₽ (Бесплатно)" : "от 280 ₽ (0 ₽ от 15 000 ₽)"}
                </span>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between text-base font-bold text-zinc-950 dark:text-white">
                <span className="uppercase tracking-wider">Итого к оплате:</span>
                <span className="font-mono text-lg">{finalPrice.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => {
                navigate('/checkout', { state: { discountAmount } });
              }}
              className="w-full py-4 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-none text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              <span>Перейти к оформлению</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Payment term reminder */}
            <div className="p-4 bg-white dark:bg-zinc-800/50 rounded-none border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-900 dark:text-white text-[11px]">
                <Camera className="w-3.5 h-3.5 text-zinc-900 dark:text-white" />
                Оплата по факту сборки
              </div>
              <p className="leading-relaxed font-light">
                Перед оплатой мы пришлем вам подробные фото собранного заказа и флаконов в Telegram или WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
