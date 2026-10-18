import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  TrendingDown,
  Building2,
  PackageCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Scale
} from 'lucide-react';

export const WhyCheaperPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-zinc-200 bg-zinc-50 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-[11px] font-bold uppercase tracking-widest mb-4">
            <Scale className="w-3.5 h-3.5 text-[#5A6B32]" />
            Честное ценообразование
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-normal text-zinc-950 tracking-tight leading-tight">
            Почему у нас дешевле, чем в Золотом Яблоке или Л'Этуаль?
          </h1>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed font-light">
            Тот же 100% оригинальный нишевый и люксовый парфюм, но без наценок за витрины в ТЦ, без платы за бренд-полку и со свободным выбором объёма от 3 мл.
          </p>
        </div>
      </section>

      {/* Main Pillars Section */}
      <section className="py-12 sm:py-16 border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-8 text-center font-mono">
            4 главных фактора честной цены
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Factor 1 */}
            <div className="p-6 sm:p-8 border border-zinc-200 bg-white hover:border-black transition-colors space-y-3">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center">
                <PackageCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">
                1. Прямые поставки от официальных дистрибьюторов
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed font-light">
                Мы закупаем парфюмерию напрямую у проверенных европейских и азиатских дистрибьюторов крупными партиями, минуя 3–4 цепочки перекупщиков и локальных дилеров. Каждый флакон имеет оригинальный батч-код производителя.
              </p>
            </div>

            {/* Factor 2 */}
            <div className="p-6 sm:p-8 border border-zinc-200 bg-white hover:border-black transition-colors space-y-3">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center">
                <Building2 className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">
                2. Никакой аренды в премиальных ТЦ
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed font-light">
                Аренда торговых площадей на первых этажах топовых торговых центров Москвы и миллионников закладывается сетевиками в чек каждого покупателя — это от 25% до 40% стоимости каждого флакона. У нас современный закрытый логистический склад, поэтому вы платите только за сам аромат.
              </p>
            </div>

            {/* Factor 3 */}
            <div className="p-6 sm:p-8 border border-zinc-200 bg-white hover:border-black transition-colors space-y-3">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">
                3. Мы не платим сетям за «полку товара» (ретро-бонусы)
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed font-light">
                В крупных сетевых ритейлерах производители и поставщики обязаны выплачивать огромные маркетинговые взносы и так называемые «ретро-бонусы» за то, чтобы их бренд стоял на уровне глаз покупателя. Мы работаем независимо и не платим сетям за полки.
              </p>
            </div>

            {/* Factor 4 */}
            <div className="p-6 sm:p-8 border border-zinc-200 bg-white hover:border-black transition-colors space-y-3">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#5A6B32]" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950">
                4. Умный формат распивов (отливантов)
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed font-light">
                Вам не нужно тратить 35 000 — 50 000 ₽ на 100 мл флакон, который может надоесть через месяц. Мы разливаем оригинальные флаконы в качественные стеклянные спрей-атомайзеры по 3, 5, 10, 15 и 30 мл в стерильных лабораторных условиях с видеофиксацией.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 sm:py-16 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-serif text-center text-zinc-950 mb-3">
            Наглядное сравнение
          </h2>
          <p className="text-sm text-zinc-500 text-center mb-8 font-light">
            Где формируется цена вашего любимого аромата
          </p>

          <div className="border border-zinc-300 bg-white overflow-hidden shadow-xs">
            <div className="grid grid-cols-3 p-4 bg-zinc-100 border-b border-zinc-300 text-xs font-bold uppercase tracking-wider text-zinc-800">
              <div>Параметр</div>
              <div className="text-center text-zinc-500">Сетевой ритейл (ЗЯ / Л'Этуаль)</div>
              <div className="text-center text-black font-extrabold">Maison Arôme</div>
            </div>

            <div className="divide-y divide-zinc-200 text-xs sm:text-sm">
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-semibold text-zinc-900">Подлинность флаконов</div>
                <div className="text-center text-emerald-700 font-medium">100% Оригинал</div>
                <div className="text-center text-emerald-700 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> 100% Оригинал (батч-код)
                </div>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-semibold text-zinc-900">Наценка за аренду ТЦ</div>
                <div className="text-center text-rose-600 font-bold">+25–40% к цене</div>
                <div className="text-center text-emerald-700 font-bold">0% (складская модель)</div>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-semibold text-zinc-900">Сборы ритейлера за «полку»</div>
                <div className="text-center text-rose-600 font-bold">Включены в чек (+20–30%)</div>
                <div className="text-center text-emerald-700 font-bold">Отсутствуют</div>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-semibold text-zinc-900">Выбор объёмов</div>
                <div className="text-center text-zinc-500">Только 50 / 100 мл флаконы</div>
                <div className="text-center text-black font-bold">3, 5, 10, 15, 30 и флаконы</div>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-semibold text-zinc-900">Фото флакона перед отправкой</div>
                <div className="text-center text-zinc-400">Нет</div>
                <div className="text-center text-emerald-700 font-bold">Да (в Telegram-диалоге)</div>
              </div>

              <div className="grid grid-cols-3 p-4 items-center bg-zinc-50 font-bold">
                <div className="text-zinc-950">Итоговая экономия</div>
                <div className="text-center text-zinc-400">Базовая розница</div>
                <div className="text-center text-[#5A6B32] text-base">До 45–60% выгоды</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authenticity Guarantee Banner */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="p-8 sm:p-10 border-2 border-black bg-white flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#5A6B32]">
                <ShieldCheck className="w-4 h-4" />
                Гарантия честности 100%
              </div>
              <h3 className="text-xl sm:text-2xl font-serif text-zinc-950">
                Сомневаетесь? Проверьте батч-код
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 max-w-xl font-light">
                Перед отправкой заказа менеджер в Telegram пришлёт вам живое фото и видео вашего флакона и атомайзера с чётким батч-кодом для проверки на независимых сервисах.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to="/catalog?category=decants"
                className="px-6 py-3.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-widest text-center transition-colors shadow-xs"
              >
                Смотреть распивы
              </Link>
              <Link
                to="/reviews"
                className="px-6 py-3.5 border border-black hover:bg-zinc-100 text-black text-xs font-bold uppercase tracking-widest text-center transition-colors"
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
