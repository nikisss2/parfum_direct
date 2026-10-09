import React, { useState } from 'react';
import { Send, ChevronDown, HelpCircle } from 'lucide-react';

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
        <p className="text-zinc-600 leading-relaxed">
          В нашем каталоге доступны 4 формата выпуска оригинальной парфюмерии:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 bg-zinc-50 border border-zinc-200">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-1.5 mb-1.5">
              <span className="w-2 h-2 bg-[#5A6B32] inline-block" />
              <span>Отливант (распив)</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-light">
              Оригинальный аромат, перелитый из оригинального флакона во флакон меньшего объема — атомайзер (от 2 до 30 мл). Отлив производится стерильным методом в стеклянные флаконы с металлической форсункой. Позволяет разносить аромат без покупки полного объема.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-50 border border-zinc-200">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-1.5 mb-1.5">
              <span className="w-2 h-2 bg-black inline-block" />
              <span>Флакон (товарный)</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-light">
              Полноразмерный товарный флакон в заводской брендовой коробке, со слюдой (если предусмотрена производителем) и оригинальной крышкой. Идеальный вариант для подарка и личной коллекции.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-50 border border-zinc-200">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-1.5 mb-1.5">
              <span className="w-2 h-2 bg-amber-600 inline-block" />
              <span>Тестер</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-light">
              Тот же оригинальный флакон, но без товарной упаковки (поставляется в простой технической коробке) и часто без крышки, также под тестером может быть замятая товарная позиция. Аромат внутри на 100% оригинальный, а цена на 20–40% выгоднее.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-50 border border-zinc-200">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-1.5 mb-1.5">
              <span className="w-2 h-2 bg-zinc-600 inline-block" />
              <span>Запаска (рефил / refill)</span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed font-light">
              Тара с оригинальным ароматом для пополнения товарного флакона, перезаправки. Предназначена для тех, у кого уже есть основной флакон и требуется пополнить запас парфюма.
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
      'Тестер — тот же оригинальный флакон, но без товарной упаковки и часто без крышки, также под тестером может быть замятая товарная позиция. Сам аромат на 100% идентичен: та же концентрация, стойкость и формула с того же завода бренда. Это лучший способ сэкономить, если вы берете аромат для личного использования.',
  },
  {
    id: 'refill-detail',
    question: 'Что такое запаска (рефил)?',
    answer:
      'Запаска (refill) — тара с оригинальным ароматом для пополнения товарного флакона, перезаправки. Такие флаконы выпускаются самими брендами (Kilian, Mugler, Dior, Guerlain и др.) для многоразового наполнения фирменного флакона.',
  },
  {
    id: 'decant-detail',
    question: 'Что такое отливант и как он создается?',
    answer:
      'Оригинальный аромат, перелитый из оригинального флакона во флакон меньшего объема — атомайзер. Мы производим отлив стерильными одноразовыми инструментами в стеклянные флаконы с металлическим спреем. Доступны 2, 5, 10, 15 и 30 мл.',
  },
  {
    id: 'ordering-flow',
    question: 'Как оформить заказ и как проходит оплата?',
    answer:
      'Вы выбираете позиции в корзину и заполняете форму. Данные копируются в буфер обмена, и вы в 1 клик переходите в личные сообщения в Telegram к менеджеру (@nikisss2). В диалоге мы подтверждаем наличие, рассчитываем доставку, высылаем фото собранного заказа и направляем реквизиты для оплаты. Оплата происходит напрямую в диалоге.',
  },
  {
    id: 'authenticity',
    question: 'Оригинальная ли у вас парфюмерия?',
    answer:
      'Да, на 100%. Мы работаем исключительно с оригинальной сертифицированной продукцией от проверенных европейских и ближневосточных официальных дистрибьюторов. Мы категорически не продаем копии, реплики или дубликаты. Каждая позиция проверяется перед отправкой.',
  },
  {
    id: 'photo-proof',
    question: 'Высылаете ли вы фотографии перед отправкой?',
    answer:
      'Обязательно! Мы понимаем, насколько важно доверие, поэтому перед отправкой каждого заказа мы высылаем в Telegram детальные фотографии ваших атомайзеров и флаконов, подготовленных к упаковке.',
  },
  {
    id: 'delivery-terms',
    question: 'Как осуществляется доставка и сколько она длится?',
    answer:
      'Мы доставляем заказы СДЭК, Почтой России и Яндекс Доставкой по всей территории РФ, Беларуси и Казахстана. Отправка осуществляется в день заказа или на следующий рабочий день. Доставка по Москве занимает 1–2 дня, в регионы — от 2 до 5 дней.',
  },
  {
    id: 'aromabox-builder',
    question: 'Как работает конструктор Аромабоксов?',
    answer:
      'В разделе «Конструктор ароматов» вы можете выбрать размер сета (3, 5 или 8 атомайзеров по 5 мл) со скидкой до 20%. Вы можете выбрать готовый кураторский сет или наполнить бокс любыми парфюмами каталога на свой вкус.',
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
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#5A6B32] font-mono">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>База знаний & FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-normal font-serif text-zinc-950 uppercase tracking-wide">
            Ответы на частые вопросы
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-light max-w-2xl">
            Всё об отличиях отливантов, флаконов, тестеров и запасок, согласовании заказов и гарантиях подлинности.
          </p>
        </div>
      )}

      {/* Accordion list */}
      <div className="divide-y divide-zinc-200 border-y border-zinc-200 bg-white">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.id} className="py-4 sm:py-5">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between text-left gap-4 group"
              >
                <span className="font-serif text-base sm:text-lg text-zinc-950 group-hover:text-zinc-600 transition-colors">
                  {item.question}
                </span>
                <span
                  className={`text-xl font-mono text-zinc-400 group-hover:text-black shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-black' : ''
                  }`}
                >
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen && (
                <div className="mt-3.5 text-xs sm:text-sm text-zinc-600 leading-relaxed font-light animate-in fade-in duration-200 pr-4 sm:pr-8">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Telegram Help CTA */}
      <div className="p-6 sm:p-8 bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="font-serif text-base sm:text-lg text-zinc-950 font-normal">
            Не нашли ответ на свой вопрос?
          </div>
          <p className="text-xs text-zinc-500 font-light">
            Наш менеджер на связи ежедневно в Telegram и поможет подобрать аромат или объем.
          </p>
        </div>
        <a
          href="https://t.me/nikisss2"
          target="_blank"
          rel="noreferrer"
          className="px-6 py-3 bg-black hover:bg-zinc-800 text-white rounded-none text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors shrink-0 shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Написать @nikisss2</span>
        </a>
      </div>
    </section>
  );
};
