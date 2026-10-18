import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import {
  CreditCard,
  Sparkles,
  Gift,
  Coins,
  ShieldCheck,
  Percent,
  CheckCircle2,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface LoyaltyCardData {
  cardNumber: string;
  points: number;
  tier: string;
  cashbackPercent: number;
  totalSpent: number;
}

export const LoyaltyPage: React.FC = () => {
  const { user, orders } = useShop();
  const [cardData, setCardData] = useState<LoyaltyCardData | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/loyalty/card?userId=${encodeURIComponent(user.id)}`)
        .then(r => r.json())
        .then(data => {
          if (data && data.cardNumber) {
            setCardData(data);
          }
        })
        .catch(() => {
          // Fallback based on order count
          const orderCount = orders.length;
          let tier = 'Базовый (5%)';
          let cashback = 5;
          if (orderCount >= 15) {
            tier = 'VIP Privilège (10%)';
            cashback = 10;
          } else if (orderCount >= 5) {
            tier = 'Постоянный клиент (7%)';
            cashback = 7;
          }
          setCardData({
            cardNumber: `MA-${user.id.slice(0, 4).toUpperCase()}-7781`,
            points: 500,
            tier,
            cashbackPercent: cashback,
            totalSpent: 0
          });
        });
    }
  }, [user?.id, orders.length]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-zinc-200 bg-zinc-50 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-[11px] font-bold uppercase tracking-widest mb-4">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            Клуб привилегий
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-normal text-zinc-950 tracking-tight leading-tight">
            Бонусная карта Maison Arôme
          </h1>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed font-light">
            Возвращайте от 5% до 10% с каждого заказа, копите баллы и оплачивайте до 30% стоимости любимых ароматов.
          </p>
        </div>
      </section>

      {/* Virtual Card Showcase */}
      <section className="py-12 sm:py-16 border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Card Presentation */}
          <div className="md:col-span-6">
            <div className="w-full aspect-[1.6/1] bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-800 text-white p-7 sm:p-9 flex flex-col justify-between shadow-2xl border border-zinc-700 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-44 h-44 bg-[#5A6B32]/30 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between z-10">
                <div>
                  <span className="font-serif tracking-widest text-sm sm:text-base font-bold uppercase">
                    MAISON ARÔME
                  </span>
                  <span className="block text-[9px] uppercase tracking-widest text-zinc-400">
                    Club Privilège
                  </span>
                </div>
                <div className="px-2 py-0.5 border border-zinc-600 text-[10px] font-mono uppercase font-bold text-amber-300">
                  {cardData ? cardData.tier : '500 бонусов в подарок'}
                </div>
              </div>

              <div className="my-auto z-10">
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 block mb-1">
                  Баланс бонусных баллов
                </span>
                <div className="text-3xl sm:text-4xl font-serif font-bold text-white flex items-baseline gap-2">
                  <span>{cardData ? cardData.points.toLocaleString('ru-RU') : '500'}</span>
                  <span className="text-xs uppercase text-[#5A6B32] font-mono font-bold tracking-widest">
                    баллов (₽)
                  </span>
                </div>
                {user && (
                  <div className="text-xs text-zinc-300 mt-1 truncate">
                    Владелец: <span className="font-semibold text-white">{user.fullName}</span>
                  </div>
                )}
              </div>

              <div className="flex items-end justify-between text-[11px] text-zinc-400 z-10 font-mono">
                <span>{cardData?.cardNumber || 'MA-CLUB-XXXX'}</span>
                <span>1 бонус = 1 рубль</span>
              </div>
            </div>
          </div>

          {/* Quick Explanation */}
          <div className="md:col-span-6 space-y-4">
            <h2 className="text-2xl font-serif text-zinc-950">
              {user ? 'Ваша карта активирована' : 'Получите 500 баллов прямо сейчас'}
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed font-light">
              Каждый зарегистрированный покупатель сразу получает 500 приветственных баллов на счёт. 
              Баллы начисляются автоматически за каждую покупку распивов, полноразмерных флаконов и наборов.
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-zinc-800">
                <CheckCircle2 className="w-4 h-4 text-[#5A6B32] shrink-0" />
                <span>1 бонус равен 1 реальному рублю скидки</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-800">
                <CheckCircle2 className="w-4 h-4 text-[#5A6B32] shrink-0" />
                <span>Оплата бонусами до 30% стоимости любого заказа</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-800">
                <CheckCircle2 className="w-4 h-4 text-[#5A6B32] shrink-0" />
                <span>Статус «Постоянный клиент» (7% кэшбэк) от 5 заказов, VIP (10% кэшбэк) — от 15 заказов</span>
              </div>
            </div>

            <div className="pt-4">
              {user ? (
                <Link
                  to="/catalog"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <span>Перейти в каталог</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/account"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Войти / Зарегистрироваться и забрать 500 ₽</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tiers Progression Section */}
      <section className="py-12 sm:py-16 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-serif text-center text-zinc-950 mb-3">
            Уровни привилегий
          </h2>
          <p className="text-sm text-zinc-500 text-center mb-8 font-light">
            Чем больше ароматов вы открываете для себя, тем выше ваш постоянный кэшбэк
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tier 1 */}
            <div className="p-6 border border-zinc-200 bg-white space-y-4 hover:border-black transition-colors">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
                  Уровень 1
                </span>
                <span className="px-2 py-0.5 bg-zinc-100 text-xs font-bold text-zinc-900 font-mono">
                  5% КЭШБЭК
                </span>
              </div>
              <h3 className="text-xl font-bold text-zinc-950">Базовый</h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-light">
                Присваивается сразу при регистрации. Включает 500 приветственных баллов и 5% возврат с каждой покупки.
              </p>
              <div className="text-[11px] font-mono text-zinc-400 pt-2 border-t border-zinc-100">
                Условие: 0–4 заказа
              </div>
            </div>

            {/* Tier 2 */}
            <div className="p-6 border-2 border-black bg-white space-y-4 shadow-sm relative">
              <div className="absolute -top-3 right-4 px-2 py-0.5 bg-[#5A6B32] text-white text-[9px] font-bold uppercase tracking-wider">
                Популярный
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5A6B32] font-mono">
                  Уровень 2
                </span>
                <span className="px-2 py-0.5 bg-[#5A6B32] text-xs font-bold text-white font-mono">
                  7% КЭШБЭК
                </span>
              </div>
              <h3 className="text-xl font-bold text-zinc-950">Постоянный клиент</h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-light">
                Активируется автоматически после оформления 5-го заказа. Повышенный кэшбэк 7% и подарки к праздникам.
              </p>
              <div className="text-[11px] font-mono text-black font-bold pt-2 border-t border-zinc-100">
                Условие: от 5 заказов
              </div>
            </div>

            {/* Tier 3 */}
            <div className="p-6 border border-zinc-200 bg-white space-y-4 hover:border-black transition-colors">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 font-mono">
                  Уровень 3
                </span>
                <span className="px-2 py-0.5 bg-zinc-950 text-xs font-bold text-amber-300 font-mono">
                  10% КЭШБЭК
                </span>
              </div>
              <h3 className="text-xl font-bold text-zinc-950">VIP Privilège</h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-light">
                Максимальный статус для ценителей парфюмерии: 10% кэшбэк, персональный парфюмерный консультант и закрытые предзаказы редких позиций.
              </p>
              <div className="text-[11px] font-mono text-zinc-400 pt-2 border-t border-zinc-100">
                Условие: от 15 заказов
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
