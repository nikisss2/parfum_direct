import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Check,
  Truck,
  Plus,
  Minus
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
      setPromoError('Неверный промокод');
    }
  };

  const discountAmount = Math.round(cartTotalPrice * (discountPercent / 100));
  const finalPrice = cartTotalPrice - discountAmount;

  const FREE_SHIPPING_THRESHOLD = 25000;
  const remainingForGift = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotalPrice);
  const progressPercent = Math.min(100, Math.round((cartTotalPrice / FREE_SHIPPING_THRESHOLD) * 100));
  const isFreeShippingUnlocked = cartTotalPrice >= FREE_SHIPPING_THRESHOLD;

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-zinc-100 text-zinc-900 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl font-light text-zinc-950">Ваша корзина пуста</h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mx-auto font-light text-delicate">
            В корзине пока нет ароматов. Выберите распивы от 1 мл или оригинальные флаконы в каталоге.
          </p>
        </div>
        <div>
          <Link
            to="/catalog"
            className="pill-btn-black py-3.5 px-8 text-xs inline-flex items-center gap-2"
          >
            <span>Перейти в каталог</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-200/70 gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-light text-zinc-950">Корзина</h1>
          <div className="text-xs uppercase tracking-[0.14em] text-zinc-400 mt-1 font-light">
            {cart.length} {cart.length === 1 ? 'наименование' : 'наименований'} в заказе
          </div>
        </div>

        <button
          onClick={clearCart}
          className="text-xs uppercase tracking-[0.12em] text-zinc-400 hover:text-rose-600 transition-colors flex items-center gap-1.5 self-start sm:self-center font-normal cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Очистить корзину</span>
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Cart Items List */}
        <div className="lg:col-span-7 space-y-6">
          {/* Free Shipping Progress Bar */}
          <div className="p-5 sm:p-6 rounded-[24px] bg-[#F7F7F9] border border-zinc-200/60">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                  {isFreeShippingUnlocked ? <Check className="w-4 h-4 stroke-[2]" /> : <Truck className="w-4 h-4 stroke-[1.5]" />}
                </span>
                <div>
                  {isFreeShippingUnlocked ? (
                    <div className="text-xs sm:text-sm font-medium text-zinc-950">
                      Бесплатная доставка (0 ₽) активирована!
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm font-normal text-zinc-900">
                      До бесплатной доставки осталось{' '}
                      <span className="font-medium tabular-nums">{remainingForGift.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  )}
                  <div className="text-[11px] text-zinc-500 mt-0.5 text-delicate">
                    {isFreeShippingUnlocked
                      ? 'Доставка за наш счет СДЭК / Яндекс по РФ'
                      : 'При заказе от 25 000 ₽ доставка бесплатна'}
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium tabular-nums text-zinc-900 shrink-0">
                {progressPercent}%
              </span>
            </div>

            {/* Progress Bar Line */}
            <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden mt-3">
              <div
                className="h-full rounded-full transition-all duration-500 bg-black"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="divide-y divide-zinc-200/60 border border-zinc-200/60 rounded-[28px] bg-white overflow-hidden shadow-2xs">
            {cart.map(item => (
              <div key={item.id} className="p-4 sm:p-6 flex items-start gap-4">
                <div className="w-16 h-20 sm:w-20 sm:h-24 bg-zinc-50 rounded-[16px] overflow-hidden flex items-center justify-center shrink-0 p-1">
                  <img
                    src={item.image}
                    alt=""
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase font-medium text-zinc-400 tracking-[0.12em]">
                    {item.brand}
                  </div>
                  <div className="font-normal text-sm sm:text-base text-zinc-950 mt-0.5 truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5 tabular-nums text-delicate">
                    <span className="font-medium text-zinc-800">{item.volumeLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.price.toLocaleString('ru-RU')} ₽ / шт</span>
                  </div>

                  {/* Quantity and subtotal */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="h-8 rounded-full border border-zinc-200 bg-zinc-50 px-2 flex items-center gap-2 shadow-2xs">
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="w-5 h-5 rounded-full hover:bg-zinc-200 flex items-center justify-center text-zinc-800 transition-colors cursor-pointer"
                        aria-label="Уменьшить"
                      >
                        <Minus className="w-3 h-3 stroke-[2]" />
                      </button>
                      <span className="w-6 text-xs font-medium tabular-nums text-center text-zinc-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="w-5 h-5 rounded-full hover:bg-zinc-200 flex items-center justify-center text-zinc-800 transition-colors cursor-pointer"
                        aria-label="Увеличить"
                      >
                        <Plus className="w-3 h-3 stroke-[2]" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-sm sm:text-base font-medium tabular-nums text-zinc-950">
                        {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-zinc-400 hover:text-black transition-colors cursor-pointer"
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
              className="pill-btn-outline py-2.5 px-5 text-xs inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Продолжить покупки</span>
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 rounded-[28px] bg-[#F7F7F9] border border-zinc-200/70 space-y-6 shadow-2xs">
            <h2 className="text-lg font-light text-zinc-950">
              Сумма заказа
            </h2>

            {/* Promo Code Input */}
            <form onSubmit={applyPromo} className="space-y-2">
              <label className="block text-[11px] font-normal uppercase tracking-[0.14em] text-zinc-500">
                Промокод на скидку:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Введите промокод"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  className="flex-1 uppercase bg-white border border-zinc-200 text-xs text-zinc-900 px-4 py-2.5 rounded-full outline-none focus:border-black tracking-wider shadow-2xs font-light"
                />
                <button
                  type="submit"
                  className="pill-btn-black py-2.5 px-5 text-xs"
                >
                  Применить
                </button>
              </div>
              {promoApplied && (
                <div className="text-xs text-emerald-600 flex items-center gap-1 font-normal tracking-wide">
                  <Check className="w-3.5 h-3.5" />
                  Скидка {discountPercent}% успешно применена!
                </div>
              )}
              {promoError && (
                <div className="text-xs text-rose-600 font-light">
                  {promoError}
                </div>
              )}
            </form>

            {/* Calculations Breakdown */}
            <div className="space-y-3 pt-4 border-t border-zinc-200/60 text-xs sm:text-sm text-zinc-600 text-delicate">
              <div className="flex justify-between">
                <span>Товары ({cart.reduce((sum, item) => sum + item.quantity, 0)} шт):</span>
                <span className="font-normal text-zinc-950 tabular-nums">{cartTotalPrice.toLocaleString('ru-RU')} ₽</span>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Скидка по промокоду ({discountPercent}%):</span>
                  <span className="tabular-nums font-normal">−{discountAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Доставка:</span>
                <span className="font-normal text-zinc-950">
                  {isFreeShippingUnlocked ? (
                    <span className="text-emerald-600 font-medium">Бесплатно (0 ₽)</span>
                  ) : (
                    'по тарифам СДЭК'
                  )}
                </span>
              </div>

              <div className="pt-4 border-t border-zinc-200/80 flex items-baseline justify-between text-base sm:text-xl font-normal text-zinc-950">
                <span>Итого к оплате:</span>
                <span className="font-medium text-xl sm:text-2xl tabular-nums">{finalPrice.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>

            {/* Checkout Action */}
            <div className="pt-2 space-y-3">
              <button
                onClick={() => navigate('/checkout')}
                className="pill-btn-black w-full py-3.5 rounded-full text-xs uppercase tracking-[0.14em] flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Перейти к оформлению</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 font-light text-delicate pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
                <span>100% гарантия подлинности каждого флакона</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
