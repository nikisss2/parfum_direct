import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  TrendingDown,
  Building2,
  PackageCheck,
  FlaskConical,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Scale
} from 'lucide-react';

export const WhyCheaperPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-zinc-100 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[11px] font-normal uppercase tracking-[0.18em] text-zinc-400">
            Прозрачность и честность
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-zinc-950 tracking-tight mt-1 leading-tight">
            Почему у нас выгоднее, чем в сетевых ритейлерах?
          </h1>
          <p className="mt-3 text-xs sm:text-sm md:text-base text-zinc-500 max-w-2xl mx-auto leading-relaxed font-light text-delicate">
            Тот же 100% оригинальный нишевый и люксовый парфюм, но без наценок за витрины в ТЦ, без платы сетям за полки и со свободным выбором объёма от 1 мл.
          </p>
        </div>
      </section>

      {/* Main Pillars Section */}
      <section className="py-12 sm:py-16 border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-xs font-normal uppercase tracking-[0.16em] text-zinc-400">
              4 главных фактора честной цены
            </h2>
            <div className="text-xl sm:text-2xl font-light text-zinc-950 mt-0.5">
              Откуда берётся честная стоимость
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Factor 1 */}
            <div className="p-6 sm:p-8 rounded-[28px] border border-zinc-200/80 bg-white hover:border-black transition-all shadow-2xs hover:shadow-md space-y-3.5">
              <div className="w-11 h-11 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center shadow-2xs">
                <PackageCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-zinc-950">
                1. Прямые поставки от официальных дистрибьюторов
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-light text-delicate">
                Мы закупаем парфюмерию напрямую у проверенных европейских и азиатских дистрибьюторов крупными партиями, минуя 3–4 цепочки перекупщиков и локальных дилеров. Каждый флакон имеет оригинальный батч-код производителя.
              </p>
            </div>

            {/* Factor 2 */}
            <div className="p-6 sm:p-8 rounded-[28px] border border-zinc-200/80 bg-white hover:border-black transition-all shadow-2xs hover:shadow-md space-y-3.5">
              <div className="w-11 h-11 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center shadow-2xs">
                <Building2 className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-zinc-950">
                2. Никакой аренды в премиальных ТЦ
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-light text-delicate">
                Аренда торговых площадей на первых этажах топовых торговых центров закладывается сетевиками в чек каждого покупателя — это от 25% до 40% стоимости каждого флакона. У нас современный закрытый логистический склад, поэтому вы платите только за сам аромат.
              </p>
            </div>

            {/* Factor 3 */}
            <div className="p-6 sm:p-8 rounded-[28px] border border-zinc-200/80 bg-white hover:border-black transition-all shadow-2xs hover:shadow-md space-y-3.5">
              <div className="w-11 h-11 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center shadow-2xs">
                <DollarSign className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-zinc-950">
                3. Мы не платим сетям за «полку товара» (ретро-бонусы)
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-light text-delicate">
                В крупных сетевых ритейлерах производители и поставщики обязаны выплачивать огромные маркетинговые взносы за то, чтобы их бренд стоял на уровне глаз покупателя. Мы работаем независимо и не платим сетям за полки.
              </p>
            </div>

            {/* Factor 4 */}
            <div className="p-6 sm:p-8 rounded-[28px] border border-zinc-200/80 bg-white hover:border-black transition-all shadow-2xs hover:shadow-md space-y-3.5">
              <div className="w-11 h-11 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center shadow-2xs">
                <FlaskConical className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-zinc-950">
                4. Умный формат распивов (отливантов)
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-light text-delicate">
                Вам не нужно тратить 35 000 — 50 000 ₽ на 100 мл флакон, который может надоесть через месяц. Мы разливаем оригинальные флаконы в качественные стеклянные спрей-атомайзеры по 1, 2, 3, 5, 10 и 15 мл в стерильных условиях.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 sm:py-16 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-light text-zinc-950">
              Наглядное сравнение
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-light text-delicate">
              Где формируется цена вашего любимого аромата
            </p>
          </div>

          <div className="rounded-[28px] border border-zinc-200/80 bg-white overflow-hidden shadow-2xs">
            <div className="grid grid-cols-3 p-4 sm:p-5 bg-zinc-50/80 border-b border-zinc-200/80 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
              <div>Параметр</div>
              <div className="text-center text-zinc-400">Сетевой ритейл</div>
              <div className="text-center text-black font-semibold">Maison Arôme</div>
            </div>

            <div className="divide-y divide-zinc-100 text-xs sm:text-sm font-light">
              <div className="grid grid-cols-3 p-4 sm:p-5 items-center">
                <div className="font-normal text-zinc-900">Подлинность флаконов</div>
                <div className="text-center text-zinc-600">100% Оригинал</div>
                <div className="text-center text-emerald-700 font-medium flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 100% Оригинал (батч-код)
                </div>
              </div>

              <div className="grid grid-cols-3 p-4 sm:p-5 items-center">
                <div className="font-normal text-zinc-900">Наценка за аренду ТЦ</div>
                <div className="text-center text-rose-600 font-medium">+25–40% к чеку</div>
                <div className="text-center text-emerald-700 font-medium">0% (складская модель)</div>
              </div>

              <div className="grid grid-cols-3 p-4 sm:p-5 items-center">
                <div className="font-normal text-zinc-900">Сборы ритейлера за «полку»</div>
                <div className="text-center text-rose-600 font-medium">Включены (+20–30%)</div>
                <div className="text-center text-emerald-700 font-medium">Отсутствуют</div>
              </div>

              <div className="grid grid-cols-3 p-4 sm:p-5 items-center">
                <div className="font-normal text-zinc-900">Выбор объёмов</div>
                <div className="text-center text-zinc-400">Только 50 / 100 мл флаконы</div>
                <div className="text-center text-black font-medium">Распивы от 1 мл + флаконы</div>
              </div>

              <div className="grid grid-cols-3 p-4 sm:p-5 items-center">
                <div className="font-normal text-zinc-900">Фото флакона перед отправкой</div>
                <div className="text-center text-zinc-400">Нет</div>
                <div className="text-center text-emerald-700 font-medium">Да (в Telegram)</div>
              </div>

              <div className="grid grid-cols-3 p-4 sm:p-5 items-center bg-zinc-50/50 font-normal">
                <div className="text-zinc-950 font-medium">Итоговая экономия</div>
                <div className="text-center text-zinc-400">Базовая розница</div>
                <div className="text-center text-emerald-700 font-semibold text-sm sm:text-base">До 45–60% выгоды</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authenticity Guarantee Banner */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-10 rounded-[32px] bg-zinc-950 text-white flex flex-col sm:flex-row items-center gap-6 justify-between shadow-xl">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-amber-300">
                <ShieldCheck className="w-4 h-4" />
                Гарантия честности 100%
              </div>
              <h3 className="text-xl sm:text-2xl font-light text-white">
                Сомневаетесь? Проверьте батч-код
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl font-light leading-relaxed">
                Перед отправкой заказа менеджер в Telegram пришлёт вам живое фото и видео вашего флакона и атомайзера с чётким батч-кодом для проверки на независимых сервисах.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to="/catalog?type=decant"
                className="px-7 py-3.5 bg-white text-zinc-950 hover:bg-zinc-100 rounded-full text-xs font-medium uppercase tracking-wider text-center transition-all shadow-md active:scale-95"
              >
                Смотреть распивы
              </Link>
              <Link
                to="/reviews"
                className="px-7 py-3.5 border border-white/60 hover:border-white bg-transparent text-white rounded-full text-xs font-light uppercase tracking-wider text-center transition-all hover:bg-white/10 active:scale-95"
              >
                Отзывы клиентов
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
