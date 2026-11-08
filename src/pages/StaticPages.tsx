import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Camera,
  Truck,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Send,
  Droplet,
  ArrowRight,
  Star,
  CreditCard,
  Package
} from 'lucide-react';
import { FAQSection, FAQ_ITEMS } from '../components/FAQSection';
import { SEO } from '../components/SEO';

/* 1. О нас */
export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pb-16">
      <SEO
        title="О бутике селективной парфюмерии | Maison Arôme"
        description="Maison Arôme — бутик оригинальной нишевой парфюмерии и распивов от 1 мл. Прямые поставки от официальных дистрибьюторов Европы и Ближнего Востока с проверкой заводских батч-кодов."
        canonical="https://maison-arome.ru/about"
      />
      {/* Hero */}
      <section className="border-b border-zinc-100 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[11px] font-normal uppercase tracking-[0.18em] text-zinc-400">
            О бутике
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-zinc-950 tracking-tight mt-1 leading-tight">
            Maison Arôme — селективная парфюмерия новой эпохи
          </h1>
          <p className="mt-3 text-xs sm:text-sm md:text-base text-zinc-500 max-w-2xl mx-auto leading-relaxed font-light text-delicate">
            Мы создали Maison Arôme для ценителей подлинного парфюмерного искусства, которые хотят свободно знакомиться с ароматами в распивах от 1 мл без переплаты за целый 100 мл флакон.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 sm:p-7 bg-white rounded-[28px] border border-zinc-200/80 shadow-2xs space-y-2 hover:border-black transition-all">
            <div className="text-3xl font-light text-zinc-950">100 000+</div>
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-900">Позиций парфюмерии</div>
            <p className="text-xs text-zinc-500 leading-relaxed font-light text-delicate">
              От культовой ниши Baccarat, Tom Ford и Creed до редких арабских изданий и селективных экстрактов.
            </p>
          </div>

          <div className="p-6 sm:p-7 bg-white rounded-[28px] border border-zinc-200/80 shadow-2xs space-y-2 hover:border-black transition-all">
            <div className="text-3xl font-light text-zinc-950">100%</div>
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-900">Гарантия подлинности</div>
            <p className="text-xs text-zinc-500 leading-relaxed font-light text-delicate">
              Прямые поставки от официальных европейских и ближневосточных дистрибьюторов. Проверка батч-кодов.
            </p>
          </div>

          <div className="p-6 sm:p-7 bg-white rounded-[28px] border border-zinc-200/80 shadow-2xs space-y-2 hover:border-black transition-all">
            <div className="text-3xl font-light text-zinc-950">45 000+</div>
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-900">Довольных клиентов</div>
            <p className="text-xs text-zinc-500 leading-relaxed font-light text-delicate">
              География доставок охватывает всю Россию и страны ЕАЭС с оперативной отправкой со склада в Москве.
            </p>
          </div>
        </div>

        {/* Principles */}
        <div className="p-8 sm:p-10 rounded-[32px] bg-zinc-950 text-white space-y-5 shadow-xl">
          <div className="text-xs font-medium uppercase tracking-wider text-amber-300">Наши стандарты</div>
          <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight">Принципы бескомпромиссного качества</h2>
          <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0" />
              <span><strong>Только оригинальные флаконы:</strong> Никаких копий, реплик или лицензий. Каждый флакон проходит строгий входной контроль подлинности.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0" />
              <span><strong>Стерильный распив:</strong> Отлив производится одноразовыми шприцами из медицинского пластика в чистые стеклянные атомайзеры с металлической форсункой.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0" />
              <span><strong>Фотоотчет перед отправкой:</strong> Мы присылаем фотографии готового заказа в Telegram перед тем, как посылка будет передана в доставку.</span>
            </li>
          </ul>
        </div>

        {/* Customer Unboxings */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-zinc-100">
            <div>
              <span className="text-[11px] font-normal uppercase tracking-[0.16em] text-zinc-400">
                Реальные распаковки
              </span>
              <h2 className="text-xl sm:text-2xl font-light text-zinc-950 mt-0.5">
                Фотоотчеты и отзывы клиентов
              </h2>
            </div>

            <Link
              to="/reviews"
              className="inline-flex items-center gap-1.5 text-xs font-normal uppercase tracking-wider text-black hover:underline"
            >
              <span>Все 1 420+ отзывов</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                img: '/assets/gallery/order-decants.jpg',
                name: 'Екатерина В.',
                city: 'Москва',
                fragrance: 'Ganymede + Baccarat Rouge 540',
                text: '«Атомайзеры очень качественные, тяжелый металл. Прислали фото заказа в Telegram через 40 минут. 100% оригинал!»',
              },
              {
                img: '/assets/gallery/order-bottles.jpg',
                name: 'Александр М.',
                city: 'Санкт-Петербург',
                fragrance: 'Creed Aventus (флакон 100 мл)',
                text: '«Флакон оригинальный, аромат стойкий и раскрывается невероятно. Доехало СДЭКом за 2 дня в идеальном виде.»',
              },
              {
                img: '/assets/gallery/order-arabian.jpg',
                name: 'Дарья К.',
                city: 'Екатеринбург',
                fragrance: 'Сет селективных распивов (5 шт)',
                text: '«Заказала подборку любимых ароматов в распивах. Премиальные стеклянные атомайзеры с металлической помпой и каллиграфическая открытка!»',
              },
              {
                img: '/assets/gallery/order-dispatch.jpg',
                name: 'Максим Т.',
                city: 'Казань',
                fragrance: 'Tom Ford Tobacco Vanille & Oud Wood',
                text: '«Упаковано намертво в 5 слоев пупырки. Прислали подробный фотоотчет перед отправкой. Стойкость табакованили — двое суток.»',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-[28px] bg-white border border-zinc-200/80 hover:border-black shadow-2xs transition-all flex gap-4 items-start"
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-2xl border border-zinc-100 shrink-0 p-1"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs text-zinc-950">{item.name}</span>
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-light">г. {item.city}</div>
                  <div className="text-xs font-normal text-black truncate">{item.fragrance}</div>
                  <p className="text-xs text-zinc-500 leading-snug line-clamp-2 font-light text-delicate">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* 2. Доставка и оплата */
export const DeliveryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pb-16">
      <SEO
        title="Доставка и оплата парфюмерии по России | Maison Arôme"
        description="Быстрая и бережная доставка оригинальной парфюмерии и отливантов по всей России (СДЭК, Яндекс Доставка, Boxberry, Почта). 100% страхование посылок, фотоконтроль перед отправкой."
        canonical="https://maison-arome.ru/delivery"
      />
      {/* Hero */}
      <section className="border-b border-zinc-100 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[11px] font-normal uppercase tracking-[0.18em] text-zinc-400">
            Сервис и логистика
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-zinc-950 tracking-tight mt-1 leading-tight">
            Доставка и оплата
          </h1>
          <p className="mt-3 text-xs sm:text-sm md:text-base text-zinc-500 max-w-xl mx-auto leading-relaxed font-light text-delicate">
            Бережная упаковка в 5 слоев защиты, фотоконтроль каждого флакона перед отправкой и быстрая доставка по всей России.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {/* Payment & Quality Assurance */}
        <div className="p-6 sm:p-8 rounded-[28px] bg-zinc-50/70 border border-zinc-200/80 space-y-4 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-black text-white shadow-2xs flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-normal text-zinc-950">Условия оплаты и фотоконтроль</h2>
              <div className="text-xs text-zinc-500 font-light text-delicate">Предоплата 30% и фотоотчет собранного заказа перед отправкой</div>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-zinc-600 leading-relaxed font-light text-delicate">
            <p>
              При оформлении заказа предусмотрена предоплата <strong>30%</strong> после подтверждения наличия позиций и согласования деталей с персональным менеджером в Telegram.
            </p>
            <p>
              Перед отправкой специалист собирает заказ, делает подробные фотографии каждого флакона, отливантов, этикеток и бланка с трек-номером. Фотоотчет направляется вам в Telegram. Оставшаяся часть (70%) оплачивается после согласования фото перед передачей посылки в курьерскую службу.
            </p>
            <div className="p-3 bg-white rounded-xl border border-zinc-200/70 text-xs text-zinc-500 font-light">
              Способы оплаты: Система быстрых платежей (СБП), банковский перевод, оплата по QR-коду без комиссии.
            </div>
          </div>
        </div>

        {/* Delivery Services */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
            <div>
              <span className="text-[11px] font-normal uppercase tracking-[0.16em] text-zinc-400">
                Тарифы
              </span>
              <h2 className="text-xl sm:text-2xl font-light text-zinc-950 mt-0.5">
                Службы доставки по России и СНГ
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-normal text-zinc-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80">
              <Package className="w-3.5 h-3.5 text-amber-700" />
              <span>Бесплатно от 25 000 ₽ (до 2 500 км)</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-[28px] border border-zinc-200/80 hover:border-black bg-white shadow-2xs space-y-2.5 transition-all">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm text-zinc-950">СДЭК (ПВЗ или курьер)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 font-medium text-xs font-sans tabular-nums text-zinc-900">от 0 ₽</span>
              </div>
              <p className="text-xs text-zinc-500 font-light leading-relaxed text-delicate">
                Срок: 2–4 рабочих дня. Самая разветвленная сеть пунктов выдачи по всей РФ и ЕАЭС. Бесплатно при заказе от 25 000 ₽.
              </p>
            </div>

            <div className="p-6 rounded-[28px] border border-zinc-200/80 hover:border-black bg-white shadow-2xs space-y-2.5 transition-all">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm text-zinc-950">Яндекс Доставка</span>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 font-medium text-xs font-sans tabular-nums text-zinc-900">от 0 ₽</span>
              </div>
              <p className="text-xs text-zinc-500 font-light leading-relaxed text-delicate">
                Срок: 1–2 дня. Быстрая доставка в ПВЗ Яндекс Маркета или экспресс до двери из московского склада.
              </p>
            </div>

            <div className="p-6 rounded-[28px] border border-zinc-200/80 hover:border-black bg-white shadow-2xs space-y-2.5 transition-all">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm text-zinc-950">5POST (Пятёрочка, Перекрёсток)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 font-medium text-xs font-sans tabular-nums text-zinc-900">от 0 ₽</span>
              </div>
              <p className="text-xs text-zinc-500 font-light leading-relaxed text-delicate">
                Срок: 2–4 дня. Получение в постаматах и на кассах магазинов «Пятёрочка» прямо рядом с домом.
              </p>
            </div>

            <div className="p-6 rounded-[28px] border border-zinc-200/80 hover:border-black bg-white shadow-2xs space-y-2.5 transition-all">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm text-zinc-950">Почта России (1 класс)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 font-medium text-xs font-sans tabular-nums text-zinc-900">от 0 ₽</span>
              </div>
              <p className="text-xs text-zinc-500 font-light leading-relaxed text-delicate">
                Срок: 3–6 дней. Авиа-доставка в любые удаленные и закрытые населенные пункты РФ.
              </p>
            </div>
          </div>
        </div>

        {/* Help CTA */}
        <div className="p-8 sm:p-10 rounded-[32px] bg-zinc-950 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="text-lg sm:text-xl font-light text-white">
              Остались вопросы по доставке?
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-light max-w-md">
              Напишите менеджеру в Telegram — мы подберем ближайший ПВЗ и оперативно рассчитаем точные сроки.
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
      </div>
    </div>
  );
};

/* 3. Как устроен распив */
export const HowToDecantPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Hero */}
      <section className="border-b border-zinc-100 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[11px] font-normal uppercase tracking-[0.18em] text-zinc-400">
            Гид по распивам
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-zinc-950 tracking-tight mt-1 leading-tight">
            Как устроен распив парфюмерии
          </h1>
          <p className="mt-3 text-xs sm:text-sm md:text-base text-zinc-500 max-w-xl mx-auto leading-relaxed font-light text-delicate">
            Распив — это возможность разносить дорогой селективный аромат на собственной коже в разных сезонах перед покупкой полного флакона.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {/* Volume Comparison Table */}
        <div className="space-y-6">
          <div className="text-center">
            <span className="text-[11px] font-normal uppercase tracking-[0.16em] text-zinc-400">
              Выбор формата
            </span>
            <h2 className="text-xl sm:text-2xl font-light text-zinc-950 mt-0.5">
              Сравнение объёмов распива
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 sm:p-7 rounded-[28px] bg-white border border-zinc-200/80 shadow-2xs space-y-3 hover:border-black transition-all">
              <div className="text-2xl font-light text-zinc-950">3 мл</div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-medium">~40–45 распылений</div>
              <p className="text-xs text-zinc-500 leading-relaxed font-light text-delicate">
                Идеальный объём для первого теста аромата: хватит на 1–2 недели ежедневного ношения в разную погоду.
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-[28px] bg-zinc-950 text-white space-y-3 shadow-md relative">
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-white text-zinc-950 text-[10px] font-medium uppercase tracking-wider shadow-xs">
                Популярный
              </div>
              <div className="text-2xl font-light text-white">5 мл</div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-medium">~70–75 распылений</div>
              <p className="text-xs text-zinc-300 leading-relaxed font-light">
                Золотой стандарт: комфортный объём на месяц активного использования или в небольшое путешествие.
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-[28px] bg-white border border-zinc-200/80 shadow-2xs space-y-3 hover:border-black transition-all">
              <div className="text-2xl font-light text-zinc-950">10 мл</div>
              <div className="text-xs text-zinc-400 uppercase tracking-wider font-medium">~140–150 распылений</div>
              <p className="text-xs text-zinc-500 leading-relaxed font-light text-delicate">
                Полноценная тревел-версия: хватает на 2–3 месяца регулярного нанесения без необходимости носить тяжелый флакон.
              </p>
            </div>
          </div>
        </div>

        {/* Process of sterile decanting */}
        <div className="p-8 sm:p-10 rounded-[32px] bg-white border border-zinc-200/80 shadow-2xs space-y-5">
          <div className="text-xs font-medium uppercase tracking-wider text-emerald-700">Лабораторный стандарт</div>
          <h2 className="text-xl sm:text-2xl font-light text-zinc-950">
            Стерильная технология отлива
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-600 leading-relaxed font-light">
            <div className="p-4 bg-zinc-50/80 border border-zinc-200/70 rounded-2xl space-y-1">
              <strong className="text-zinc-900 block font-medium uppercase tracking-wider text-[11px]">1. Боросиликатное стекло</strong>
              Атомайзеры выполнены из химически нейтрального боросиликатного стекла, которое не вступает в реакцию со спиртом.
            </div>
            <div className="p-4 bg-zinc-50/80 border border-zinc-200/70 rounded-2xl space-y-1">
              <strong className="text-zinc-900 block font-medium uppercase tracking-wider text-[11px]">2. Металлический спрей</strong>
              Распылитель выдает деликатное мелкодисперсное облако («пыльцу»), исключая крупные капли и протечки.
            </div>
            <div className="p-4 bg-zinc-50/80 border border-zinc-200/70 rounded-2xl space-y-1">
              <strong className="text-zinc-900 block font-medium uppercase tracking-wider text-[11px]">3. Одноразовый шприц</strong>
              Для каждого аромата используется индивидуальный новый стерильный медицинский шприц.
            </div>
            <div className="p-4 bg-zinc-50/80 border border-zinc-200/70 rounded-2xl space-y-1">
              <strong className="text-zinc-900 block font-medium uppercase tracking-wider text-[11px]">4. Водостойкая этикетка</strong>
              На каждый атомайзер наносится аккуратная этикетка с названием парфюмерного дома, аромата и концентрации.
            </div>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link
            to="/catalog?type=decant"
            className="pill-btn-black inline-flex items-center gap-2 py-3.5 px-8 rounded-full text-xs font-medium uppercase tracking-wider transition-all active:scale-95 shadow-xs"
          >
            <span>Выбрать распивы в каталоге</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

/* 4. Ответы на вопросы (FAQ) */
export const FAQPage: React.FC = () => {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          typeof item.answer === 'string'
            ? item.answer
            : 'Подробный ответ с описанием форматов, распивов и способов проверки подлинности по заводским батч-кодам на сайте интернет-бутика Maison Arôme.',
      },
    })),
  };

  return (
    <div className="min-h-screen bg-white pb-16">
      <SEO
        title="Вопросы и ответы (FAQ) — Распивы, оригиналы, батч-коды | Maison Arôme"
        description="Ответы на популярные вопросы о парфюмерии в Maison Arôme: что такое отливанты и тестеры, как проверить батч-код по базам, гарантия 100% подлинности и фотоотчет перед отправкой."
        canonical="https://maison-arome.ru/faq"
        schema={schemaData}
      />
      {/* Hero */}
      <section className="border-b border-zinc-100 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[11px] font-normal uppercase tracking-[0.18em] text-zinc-400">
            Справочный центр
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-zinc-950 tracking-tight mt-1 leading-tight">
            Вопросы и ответы
          </h1>
          <p className="mt-3 text-xs sm:text-sm md:text-base text-zinc-500 max-w-xl mx-auto leading-relaxed font-light text-delicate">
            Подробные ответы на все вопросы об оригинальности, распивах, доставке и согласовании фотоотчетов.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <FAQSection showTitle={false} />
      </div>
    </div>
  );
};

/* 5. Контакты */
export const ContactsPage: React.FC = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-white pb-16">
      <SEO
        title="Контакты и реквизиты | Maison Arôme"
        description="Свяжитесь с персональным парфюмерным консультантом Maison Arôme в Telegram или по почте. Реквизиты ИП Лаптев Н. В. (ИНН: 667221490551), адрес склада в Москве."
        canonical="https://maison-arome.ru/contacts"
      />
      {/* Hero */}
      <section className="border-b border-zinc-100 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[11px] font-normal uppercase tracking-[0.18em] text-zinc-400">
            Клиентский сервис
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-zinc-950 tracking-tight mt-1 leading-tight">
            Контакты
          </h1>
          <p className="mt-3 text-xs sm:text-sm md:text-base text-zinc-500 max-w-xl mx-auto leading-relaxed font-light text-delicate">
            Мы на связи ежедневно и с радостью поможем подобрать аромат или проконсультируем по заказу.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Info */}
          <div className="space-y-6">
            <div className="p-6 sm:p-7 rounded-[28px] bg-zinc-50/70 border border-zinc-200/80 space-y-5">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-normal uppercase tracking-wider text-zinc-400">Телефон / WhatsApp:</div>
                  <a href="tel:+79122879486" className="text-sm sm:text-base font-medium text-zinc-950 hover:underline">
                    8 (912) 287-94-86
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-normal uppercase tracking-wider text-zinc-400">Telegram поддержка и фотоотчеты:</div>
                  <a href="https://t.me/nikisss2" target="_blank" rel="noreferrer" className="text-sm sm:text-base font-medium text-zinc-900 hover:underline">
                    @nikisss2
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-normal uppercase tracking-wider text-zinc-400">Электронная почта:</div>
                  <a href="mailto:order@maisonarome.ru" className="text-sm sm:text-base font-medium text-zinc-900 hover:underline">
                    order@maisonarome.ru
                  </a>
                </div>
              </div>
            </div>

            {/* Legal Requisites Card */}
            <div className="p-6 rounded-[28px] bg-zinc-50/70 border border-zinc-200/80 space-y-3 text-xs text-zinc-600 font-light">
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-950">
                Реквизиты бутика
              </div>
              <div className="space-y-1.5 pt-1 text-delicate">
                <div><strong className="text-zinc-900 font-normal">Бренд:</strong> Maison Arôme</div>
                <div><strong className="text-zinc-900 font-normal">Исполнитель / Продавец:</strong> ИП Лаптев Н. В.</div>
                <div><strong className="text-zinc-900 font-normal">ИНН:</strong> 667221490551</div>
                <div><strong className="text-zinc-900 font-normal">Подтверждение подлинности:</strong> Заводские батч-коды (Batch Code)</div>
                <div><strong className="text-zinc-900 font-normal">Склад и отгрузка:</strong> г. Москва (доставка по всей РФ и ЕАЭС)</div>
                <div><strong className="text-zinc-900 font-normal">Режим обработки заказов:</strong> Ежедневно с 09:00 до 21:00 (МСК)</div>
              </div>
            </div>
          </div>

          {/* Message Form */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-white border border-zinc-200/80 shadow-2xs">
            <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-950 mb-4">
              Напишите нам
            </h2>

            {sent ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="font-medium text-sm text-zinc-950">Сообщение отправлено!</div>
                <p className="text-xs text-zinc-500 font-light text-delicate">Менеджер свяжется с вами в течение 15 минут.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-light uppercase tracking-wider text-zinc-600 mb-1.5">Ваше имя</label>
                  <input
                    type="text"
                    required
                    placeholder="Анна"
                    className="w-full text-xs px-4 py-3 rounded-full border border-zinc-200 outline-none focus:border-black font-light transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-light uppercase tracking-wider text-zinc-600 mb-1.5">Телефон или Telegram</label>
                  <input
                    type="text"
                    required
                    placeholder="+7 (999) 000-00-00 или @username"
                    className="w-full text-xs px-4 py-3 rounded-full border border-zinc-200 outline-none focus:border-black font-light transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-light uppercase tracking-wider text-zinc-600 mb-1.5">Вопрос или пожелание</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Хочу уточнить наличие Baccarat Rouge или заказать подбор аромата..."
                    className="w-full text-xs px-4 py-3 rounded-2xl border border-zinc-200 outline-none focus:border-black font-light transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="pill-btn-black w-full py-3.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all active:scale-95 shadow-xs cursor-pointer"
                >
                  Отправить запрос
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import { LegalPages } from './LegalPages';

/* 6. Правовые документы (152-ФЗ, Оферта, Соглашение) */
export const TermsPage: React.FC = () => <LegalPages initialTab="terms" />;
export const OfferPage: React.FC = () => <LegalPages initialTab="offer" />;
export const PrivacyPage: React.FC = () => <LegalPages initialTab="privacy" />;
