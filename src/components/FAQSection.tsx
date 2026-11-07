import React, { useState } from 'react';
import { Send, ChevronDown } from 'lucide-react';

export interface FAQItem {
  id: string;
  question: string;
  answer: string | React.ReactNode;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'formats-comparison',
    question: 'В чём разница между отливантом, флаконом, тестером и запаской?',
    answer: (
      <div className="space-y-3.5">
        <p className="text-zinc-600 leading-relaxed font-light text-delicate">
          В нашем каталоге доступны 4 формата выпуска оригинальной парфюмерии:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-4 sm:p-5 bg-zinc-50/80 rounded-2xl border border-zinc-200/80 space-y-1.5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-950 flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#5A6B32] inline-block" />
              <span>Отливант (распив)</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed font-light text-delicate">
              Оригинальный аромат, перелитый из фабричного флакона во флакон меньшего объема — стеклянный атомайзер (от 1 до 15 мл). Отлив производится стерильным методом в чистые флаконы с металлическим распылителем.
            </p>
          </div>

          <div className="p-4 sm:p-5 bg-zinc-50/80 rounded-2xl border border-zinc-200/80 space-y-1.5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-950 flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-black inline-block" />
              <span>Флакон (товарный)</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed font-light text-delicate">
              Полноразмерный товарный флакон в заводской брендовой коробке, со слюдой и оригинальной крышкой. Идеальный вариант для подарка и личной коллекции.
            </p>
          </div>

          <div className="p-4 sm:p-5 bg-zinc-50/80 rounded-2xl border border-zinc-200/80 space-y-1.5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-950 flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span>Тестер</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed font-light text-delicate">
              Тот же оригинальный флакон, но в технической картонной коробке бренда. Аромат внутри на 100% идентичен, а стоимость на 20–40% выгоднее.
            </p>
          </div>

          <div className="p-4 sm:p-5 bg-zinc-50/80 rounded-2xl border border-zinc-200/80 space-y-1.5">
            <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-950 flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-zinc-500 inline-block" />
              <span>Запаска (рефил / refill)</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed font-light text-delicate">
              Специальная тара с оригинальным ароматом от производителя для пополнения и перезаправки основного флакона.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'tester-detail',
    question: 'Что такое тестер и почему он дешевле товарного флакона?',
    answer:
      'Тестер — это 100% подлинный флакон, предназначенный брендами для демонстрации аромата. Он поставляется в простой белой или крафтовой коробке и иногда без декоративной крышки. Концентрация, компоненты и стойкость парфюма абсолютно одинаковы с витринным флаконом.',
  },
  {
    id: 'refill-detail',
    question: 'Что такое запаска (рефил)?',
    answer:
      'Запаска (refill) — оригинальный сменный флакон для перезаправки. Такие форматы официально выпускают Kilian, Mugler, Dior, Guerlain, Byredo для удобного обновления аромата по более выгодной цене.',
  },
  {
    id: 'decant-detail',
    question: 'Что такое отливант и как он создается?',
    answer:
      'Оригинальный аромат, аккуратно перелитый из официального флакона в компактный стеклянный атомайзер. Мы производим распив исключительно медицинскими стерильными инструментами в стерильных условиях. Доступны объёмы 1, 2, 3, 5, 10 и 15 мл.',
  },
  {
    id: 'ordering-flow',
    question: 'Как оформить заказ и как проходит оплата?',
    answer:
      'Вы добавляете позиции в корзину и нажимаете кнопку оформления. Данные сформированного заказа копируются, и открывается прямой диалог с персональным менеджером в Telegram (@nikisss2). В диалоге мы подтверждаем наличие, присылаем детальные фото собранных флаконов и реквизиты для безопасной оплаты (СБП, карта).',
  },
  {
    id: 'authenticity',
    question: 'Оригинальная ли у вас парфюмерия?',
    answer:
      'Да, на 100%. Мы работаем исключительно с оригинальной сертифицированной продукцией от проверенных европейских и ближневосточных официальных дистрибьюторов. Мы категорически не продаем реплики или копии. Каждый флакон имеет оригинальный батч-код, который можно проверить.',
  },
  {
    id: 'photo-proof',
    question: 'Высылаете ли вы фотографии перед отправкой?',
    answer:
      'Обязательно! Мы понимаем важность абсолютного доверия, поэтому перед передачей каждого заказа в службу доставки менеджер в Telegram высылает реальные макро-фотографии ваших флаконов и атомайзеров с накладной.',
  },
  {
    id: 'delivery-terms',
    question: 'Как осуществляется доставка и сколько она длится?',
    answer:
      'Мы доставляем заказы Яндекс Доставкой, СДЭК, 5POST, Boxberry и Почтой России по всей территории РФ, Беларуси и Казахстана. Отправка осуществляется в день заказа или на следующий рабочий день со склада в Москве.',
  },
];

interface FAQSectionProps {
  showTitle?: boolean;
  className?: string;
  defaultOpenIndex?: number | null;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  showTitle = true,
  className = '',
  defaultOpenIndex = 0,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpenIndex);

  return (
    <section className={`space-y-8 ${className}`}>
      {showTitle && (
        <div className="space-y-1.5 text-center sm:text-left">
          <span className="text-[11px] font-normal uppercase tracking-[0.18em] text-zinc-400">
            Справочник
          </span>
          <h2 className="text-2xl sm:text-3xl font-light text-zinc-950 tracking-tight">
            Ответы на частые вопросы
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-light max-w-2xl text-delicate">
            Всё об отличиях отливантов, флаконов, тестеров и запасок, согласовании заказов и гарантиях подлинности.
          </p>
        </div>
      )}

      {/* Accordion list in rounded quiet luxury cards */}
      <div className="space-y-3">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'border-zinc-300 bg-white shadow-2xs'
                  : 'border-zinc-200/80 hover:border-zinc-300 bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between text-left p-4 sm:p-5 gap-4 group cursor-pointer"
              >
                <span className="text-sm sm:text-base font-normal text-zinc-900 group-hover:text-black transition-colors leading-snug">
                  {item.question}
                </span>
                <span
                  className={`w-7 h-7 rounded-full bg-zinc-100 group-hover:bg-zinc-200 text-zinc-600 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-black text-white group-hover:bg-black' : ''
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </span>
              </button>
              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm text-zinc-600 leading-relaxed font-light border-t border-zinc-100 pt-3 animate-in fade-in duration-200 text-delicate">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Telegram Help CTA Banner */}
      <div className="p-8 sm:p-10 rounded-[32px] bg-zinc-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="text-lg sm:text-xl font-light text-white">
            Не нашли ответ на свой вопрос?
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-md">
            Наш менеджер на связи ежедневно в Telegram и поможет подобрать аромат или объем.
          </p>
        </div>
        <a
          href="https://t.me/nikisss2"
          target="_blank"
          rel="noreferrer"
          className="pill-btn-white py-3.5 px-8 rounded-full text-xs font-medium uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Написать</span>
        </a>
      </div>
    </section>
  );
};
