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
          {/* Free Shipping & Gift Progress Bar */}
          <div className="p-5 rounded-none border border-zinc-200 bg-zinc-50">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-none bg-black text-white flex items-center justify-center shrink-0">
                  {isFreeShippingUnlocked ? <Check className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
                </span>
                <div>
                  {isFreeShippingUnlocked ? (
                    <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-950">
                      🎉 Бесплатная доставка (0 ₽) и фирменный подарок активированы!
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-900">
                      До бесплатной доставки и подарка осталось{' '}
                      <span className="font-mono font-black">{remainingForGift.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  )}
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {isFreeShippingUnlocked
                      ? 'В заказ добавлен металлический атомайзер 10 мл + 2 тревел-семпла селектива (0 ₽)'
                      : 'При заказе от 15 000 ₽: доставка за 0 ₽ + тревел-атомайзер 10 мл и 2 семпла в подарок'}
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
            {/* Free Gift Row if unlocked */}
            {isFreeShippingUnlocked && (
              <div className="p-4 sm:p-5 flex items-start gap-4 bg-zinc-50/70 border-b border-zinc-200">
                <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-none bg-black text-white border border-zinc-900 flex flex-col items-center justify-center shrink-0">
                  <Gift className="w-8 h-8 text-white" />
                  <span className="text-[9px] font-bold uppercase tracking-widest mt-1">Подарок</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                    Бонус к заказу от 15 000 ₽
                  </div>
                  <div className="font-semibold text-sm sm:text-base text-zinc-950 mt-0.5 truncate">
                    Фирменный тревел-атомайзер (10 мл) + 2 нишевых семпла
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    Металлический футляр Soft-touch со стеклянной колбой и микрораспылителем
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none bg-black text-white text-[10px] font-bold uppercase tracking-wider font-mono">
                      <Check className="w-3 h-3" /> Включено в заказ
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-xs text-zinc-400 line-through">1 200 ₽</span>
                      <span className="text-sm font-bold text-black">0 ₽</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                    <div className="flex items-center border border-zinc-300 rounded-none bg-white">
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="w-8 h-8 text-zinc-700 hover:bg-zinc-100 transition-colors text-xs font-bold flex items-center justify-center"
                        aria-label="Уменьшить"
                      >
                        −
                      </button>
                      <span className="w-8 h-8 text-xs font-bold font-mono flex items-center justify-center border-x border-zinc-300">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="w-8 h-8 text-zinc-700 hover:bg-zinc-100 transition-colors text-xs font-bold flex items-center justify-center"
                        aria-label="Увеличить"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-base font-bold font-mono text-zinc-950">
                        {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-zinc-400 hover:text-black transition-colors"
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
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-black"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Продолжить покупки</span>
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-none bg-zinc-50 border border-zinc-200 space-y-5">
            <h2 className="text-base font-normal font-serif text-zinc-950">
              Сумма заказа
            </h2>

            {/* Promo Code Input */}
            <form onSubmit={applyPromo} className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                Промокод на скидку:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="PARFUM10 или WELCOME"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  className="flex-1 uppercase bg-white border border-zinc-300 text-xs px-3.5 py-2.5 rounded-none outline-none focus:border-black font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-none hover:bg-zinc-800 transition-colors"
                >
                  Применить
                </button>
              </div>
              {promoApplied && (
                <div className="text-xs text-black flex items-center gap-1 font-bold uppercase tracking-wider font-mono">
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
            <div className="space-y-3 pt-4 border-t border-zinc-200 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Товары ({cart.reduce((a, b) => a + b.quantity, 0)} шт.)</span>
                <span className="font-mono">{cartTotalPrice.toLocaleString('ru-RU')} ₽</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-zinc-900 font-bold">
                  <span>Скидка ({discountPercent}%)</span>
                  <span className="font-mono">−{discountAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}

              <div className="flex justify-between items-center text-zinc-600">
                <span>Доставка</span>
                <span className={isFreeShippingUnlocked ? "text-zinc-950 font-bold uppercase tracking-wider font-mono" : "text-zinc-500 font-mono"}>
                  {isFreeShippingUnlocked ? "0 ₽ (Бесплатно)" : "от 280 ₽ (0 ₽ от 15 000 ₽)"}
                </span>
              </div>

              <div className="pt-4 border-t border-zinc-200 flex justify-between text-base font-bold text-zinc-950">
                <span className="uppercase tracking-wider">Итого к оплате:</span>
                <span className="font-mono text-lg">{finalPrice.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => {
                navigate('/checkout', { state: { discountAmount } });
              }}
              className="w-full py-4 bg-black hover:bg-zinc-800 text-white rounded-none text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              <span>Перейти к оформлению</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Payment term reminder */}
            <div className="p-4 bg-white rounded-none border border-zinc-200 text-xs text-zinc-500 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-900 text-[11px]">
                <Camera className="w-3.5 h-3.5 text-zinc-900" />
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
