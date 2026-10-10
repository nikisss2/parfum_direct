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
  Sparkles,
  ArrowRight,
  Star
} from 'lucide-react';
import { FAQSection } from '../components/FAQSection';

/* 1. О нас */
export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="space-y-3">
        <span className="text-[11px] uppercase font-bold tracking-widest text-zinc-500">
          О проекте
        </span>
        <h1 className="text-3xl sm:text-4xl font-normal font-serif text-zinc-950 uppercase tracking-wide">
          Maison Arôme — парфюмерный бутик новой эпохи
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed pt-2 font-light">
          Мы создали Maison Arôme для людей, которые ценят подлинное парфюмерное искусство и не хотят переплачивать за невскрытый 100-миллилитровый флакон, не распробовав аромат в повседневной жизни.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 bg-zinc-50 rounded-none border border-zinc-200 space-y-2">
          <div className="text-2xl font-normal font-serif text-zinc-950">100 000+</div>
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-900">Позиций парфюмерии</div>
          <p className="text-xs text-zinc-500 leading-relaxed font-light">
            От культовой ниши Baccarat и Tom Ford до редких арабских аттаров и селективных изданий.
          </p>
        </div>

        <div className="p-6 bg-zinc-50 rounded-none border border-zinc-200 space-y-2">
          <div className="text-2xl font-normal font-serif text-zinc-950">100%</div>
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-900">Гарантия подлинности</div>
          <p className="text-xs text-zinc-500 leading-relaxed font-light">
            Мы работаем напрямую с проверенными европейскими и ближневосточными поставщиками.
          </p>
        </div>

        <div className="p-6 bg-zinc-50 rounded-none border border-zinc-200 space-y-2">
          <div className="text-2xl font-normal font-serif text-zinc-950">45 000+</div>
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-900">Довольных клиентов</div>
          <p className="text-xs text-zinc-500 leading-relaxed font-light">
            География доставок охватывает всю Россию, Беларусь и Казахстан с отправкой в день заказа.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-none bg-zinc-950 text-white border border-zinc-900 space-y-4">
        <h2 className="text-lg font-normal font-serif uppercase tracking-wide">Наши принципы работы</h2>
        <ul className="space-y-3 text-xs sm:text-sm text-zinc-300 leading-relaxed font-light">
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-none bg-amber-400 mt-2 shrink-0" />
            <span><strong>Только оригинальные флаконы:</strong> Никаких копий, реплик или лицензий. Каждый флакон проходит строгий входной контроль подлинности.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-none bg-amber-400 mt-2 shrink-0" />
            <span><strong>Стерильный распив:</strong> Отлив производится одноразовыми шприцами из медицинского пластика в чистые стеклянные атомайзеры с металлической форсункой.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-none bg-amber-400 mt-2 shrink-0" />
            <span><strong>Фотоотчет перед оплатой:</strong> Мы присылаем фотографии готового заказа в Telegram или WhatsApp перед тем, как вы внесете оплату.</span>
          </li>
        </ul>
      </div>

      {/* Фотоотчеты и отзывы покупателей */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black mb-1">
              <Camera className="w-3.5 h-3.5" />
              <span>Реальные распаковки</span>
            </div>
            <h2 className="text-2xl font-normal font-serif text-zinc-950 uppercase tracking-wide">
              Фотоотчеты и отзывы клиентов
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-light">
              Нам доверяют более 45 000 ценителей парфюмерии по всей России и СНГ
            </p>
          </div>

          <Link
            to="/reviews"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-black hover:text-zinc-600 transition-colors"
          >
            <span>Все 1 420+ отзывов</span>
            <ArrowRight className="w-4 h-4" />
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
              fragrance: 'Собранный Аромабокс (5 шт)',
              text: '«Собрала аромабокс в конструкторе со скидкой 15%. Шикарная коробка на магните и каллиграфическая открытка!»',
            },
            {
              img: '/assets/gallery/order-dispatch.jpg',
              name: 'Максим Т.',
              city: 'Казань',
              fragrance: 'Tom Ford Tobacco Vanille & Oud Wood',
              text: '«Упаковано намертво в 5 слоев пупырки. Оплата только после фотоотчета. Стойкость табакованили — двое суток.»',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-none bg-zinc-50 border border-zinc-200 hover:border-black transition-all flex gap-4 items-start"
            >
              <img
                src={item.img}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-none border border-zinc-200 shrink-0"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wide text-zinc-950">{item.name}</span>
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
                <div className="text-[11px] text-zinc-400 uppercase tracking-wider text-[10px]">г. {item.city}</div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-black truncate">{item.fragrance}</div>
                <p className="text-xs text-zinc-600 leading-snug line-clamp-2 font-light">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* 2. Доставка и оплата */
export const DeliveryPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="space-y-3">
        <span className="text-[11px] uppercase font-bold tracking-widest text-zinc-500">
          Условия сервиса
        </span>
        <h1 className="text-3xl sm:text-4xl font-normal font-serif text-zinc-950 uppercase tracking-wide">
          Доставка и оплата
        </h1>
        <p className="text-sm text-zinc-600 leading-relaxed font-light">
          Мы позаботились о том, чтобы процесс покупки был максимально безопасным, прозрачным и комфортным.
        </p>
      </div>

      {/* Оплата */}
      <div className="p-6 sm:p-8 rounded-none bg-zinc-50 border border-zinc-200 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-black text-amber-400 flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold uppercase tracking-wide text-zinc-950">Оплата по факту сборки заказа</h2>
            <div className="text-xs text-zinc-500 font-light">Без предоплаты вслепую</div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-light">
          После оформления заказа на сайте наш специалист собирает ваш набор, фотографирует флаконы, наклеенные этикетки, атомайзеры и бланк посылки с трек-номером. Фотоотчет отправляется вам в Telegram или WhatsApp. Только после вашего одобрения вы оплачиваете заказ через Систему быстрых платежей (СБП), банковской картой или безналичным расчетом.
        </p>
      </div>

      {/* Службы доставки */}
      <div className="space-y-4">
        <h2 className="text-lg font-normal font-serif text-zinc-950 uppercase tracking-wide">
          Службы доставки и тарифы
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-none border border-zinc-200 hover:border-black bg-white space-y-2 transition-colors">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs uppercase tracking-wide text-zinc-950">СДЭК (ПВЗ или курьер)</span>
              <span className="font-bold text-xs font-mono text-zinc-900">350 ₽</span>
            </div>
            <p className="text-xs text-zinc-500 font-light">
              Срок: 2–4 рабочих дня. Самая разветвленная сеть пунктов выдачи по всей РФ и ЕАЭС.
            </p>
          </div>

          <div className="p-5 rounded-none border border-zinc-200 hover:border-black bg-white space-y-2 transition-colors">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs uppercase tracking-wide text-zinc-950">Яндекс Доставка</span>
              <span className="font-bold text-xs font-mono text-zinc-900">390 ₽</span>
            </div>
            <p className="text-xs text-zinc-500 font-light">
              Срок: 1–2 дня. Быстрая доставка в ПВЗ Яндекс Маркета или экспресс до двери.
            </p>
          </div>

          <div className="p-5 rounded-none border border-zinc-200 hover:border-black bg-white space-y-2 transition-colors">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs uppercase tracking-wide text-zinc-950">Ozon Доставка</span>
              <span className="font-bold text-xs font-mono text-zinc-900">290 ₽</span>
            </div>
            <p className="text-xs text-zinc-500 font-light">
              Срок: 2–3 дня. Выдача в любом отделении Ozon прямо у вашего дома.
            </p>
          </div>

          <div className="p-5 rounded-none border border-zinc-200 hover:border-black bg-white space-y-2 transition-colors">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs uppercase tracking-wide text-zinc-950">5POST (Пятёрочка)</span>
              <span className="font-bold text-xs font-mono text-zinc-900">280 ₽</span>
            </div>
            <p className="text-xs text-zinc-500 font-light">
              Срок: 2–4 дня. Получение в постаматах и на кассах магазинов «Пятёрочка» и «Перекрёсток».
            </p>
          </div>

          <div className="p-5 rounded-none border border-zinc-200 hover:border-black bg-white space-y-2 transition-colors">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs uppercase tracking-wide text-zinc-950">Почта России (1 класс)</span>
              <span className="font-bold text-xs font-mono text-zinc-900">320 ₽</span>
            </div>
            <p className="text-xs text-zinc-500 font-light">
              Срок: 3–6 дней. Авиа-доставка в любые удаленные населенные пункты РФ.
            </p>
          </div>

          <div className="p-5 rounded-none border border-zinc-200 hover:border-black bg-white space-y-2 transition-colors">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs uppercase tracking-wide text-zinc-950">Авито Доставка</span>
              <span className="font-bold text-xs font-mono text-zinc-900">300 ₽</span>
            </div>
            <p className="text-xs text-zinc-500 font-light">
              Срок: 2–5 дней. Безопасная партнерская сделка с отслеживанием через сервис Авито.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* 3. Как заказать распив */
export const HowToDecantPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="space-y-3">
        <span className="text-[11px] uppercase font-bold tracking-widest text-zinc-500">
          Руководство
        </span>
        <h1 className="text-3xl sm:text-4xl font-normal font-serif text-zinc-950 uppercase tracking-wide">
          Как устроен распив парфюмерии
        </h1>
        <p className="text-sm text-zinc-600 leading-relaxed font-light">
          Распив — это возможность познакомиться с дорогим нишевым ароматом, протестировать его стойкость и посадку на собственной коже перед покупкой полноценного флакона.
        </p>
      </div>

      {/* Volume Comparison Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-normal font-serif text-zinc-950 uppercase tracking-wide">
          Сравнение объёмов распива
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-none bg-zinc-50 border border-zinc-200 space-y-3">
            <div className="text-xl font-normal font-serif text-zinc-950">3 мл</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">~40–45 распылений</div>
            <p className="text-xs text-zinc-600 leading-relaxed font-light">
              Идеальный объём для первого теста аромата: хватит на 1–2 недели ежедневного ношения в разную погоду.
            </p>
          </div>

          <div className="p-6 rounded-none bg-zinc-950 text-white border border-zinc-900 space-y-3">
            <div className="text-xl font-normal font-serif">5 мл</div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider font-medium">~70–75 распылений</div>
            <p className="text-xs text-zinc-300 leading-relaxed font-light">
              Золотой стандарт: комфортный объём на месяц активного использования или в небольшое путешествие.
            </p>
          </div>

          <div className="p-6 rounded-none bg-zinc-50 border border-zinc-200 space-y-3">
            <div className="text-xl font-normal font-serif text-zinc-950">10 мл</div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">~140–150 распылений</div>
            <p className="text-xs text-zinc-600 leading-relaxed font-light">
              Полноценная тревел-версия: хватает на 2–3 месяца регулярного нанесения без необходимости носить тяжелый флакон.
            </p>
          </div>
        </div>
      </div>

      {/* Process of sterile decanting */}
      <div className="p-8 rounded-none bg-white border border-zinc-200 space-y-4">
        <h2 className="text-base font-bold font-serif text-zinc-950 uppercase tracking-wide">
          Стерильная технология отлива
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-600 leading-relaxed font-light">
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-none space-y-1">
            <strong className="text-zinc-900 block font-bold uppercase tracking-wider text-[11px]">1. Медицинские атомайзеры</strong>
            Колбы выполнены из боросиликатного стекла высокой химической стойкости. Стекло не вступает в реакцию со спиртом и сохраняет первоначальный букет.
          </div>
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-none space-y-1">
            <strong className="text-zinc-900 block font-bold uppercase tracking-wider text-[11px]">2. Металлический спрей</strong>
            Распылитель выдает мелкодисперсное облако («пыльцу»), исключая крупные капли и подтекания.
          </div>
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-none space-y-1">
            <strong className="text-zinc-900 block font-bold uppercase tracking-wider text-[11px]">3. Одноразовый инструмент</strong>
            Для каждого аромата используется новый стерильный шприц. Никакого смешивания нот разных парфюмов.
          </div>
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-none space-y-1">
            <strong className="text-zinc-900 block font-bold uppercase tracking-wider text-[11px]">4. Фирменная маркировка</strong>
            На каждый атомайзер наносится водостойкая наклейка с названием парфюмерного дома, аромата и концентрации.
          </div>
        </div>
      </div>

      <div className="text-center pt-2">
        <Link
          to="/catalog?type=decant"
          className="inline-flex items-center gap-2 px-7 py-4 bg-black text-white rounded-none text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <span>Выбрать распивы в каталоге</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

/* 3.1. Ответы на вопросы (FAQ) */
export const FAQPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <FAQSection className="space-y-12" />
    </div>
  );
};

/* 4. Контакты */
export const ContactsPage: React.FC = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="space-y-3">
        <span className="text-[11px] uppercase font-bold tracking-widest text-zinc-500">
          Связь с нами
        </span>
        <h1 className="text-3xl sm:text-4xl font-normal font-serif text-zinc-950 uppercase tracking-wide">
          Контакты и шоурум
        </h1>
        <p className="text-sm text-zinc-600 leading-relaxed font-light">
          Мы всегда на связи и с радостью поможем подобрать аромат под ваш вкус или сезон.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Info */}
        <div className="space-y-6">
          <div className="p-6 rounded-none bg-zinc-50 border border-zinc-200 space-y-4">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-black shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Бесплатный звонок по РФ:</div>
                <a href="tel:+78005553590" className="text-base font-bold text-zinc-950 hover:underline">
                  8 (800) 555-35-90
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Send className="w-5 h-5 text-black shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Telegram поддержка и фотоотчеты:</div>
                <a href="https://t.me/nikisss2" target="_blank" rel="noreferrer" className="text-sm font-bold text-zinc-900 hover:underline">
                  @nikisss2
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-black shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Электронная почта:</div>
                <a href="mailto:order@maisonarome.ru" className="text-sm font-bold text-zinc-900 hover:underline">
                  order@maisonarome.ru
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-black shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Шоурум и пункт выдачи:</div>
                <div className="text-xs font-bold uppercase tracking-wide text-zinc-900 mt-1">
                  Москва, Пресненская наб., 12, Башня «Федерация», этаж 3
                </div>
                <div className="text-[11px] text-zinc-500 mt-1 font-light">
                  Ежедневно с 10:00 до 21:00 (по предварительной записи)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="p-6 sm:p-8 rounded-none bg-white border border-zinc-200">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950 mb-4">
            Напишите нам
          </h2>

          {sent ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 bg-zinc-100 text-black border border-zinc-900 rounded-none flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="font-bold text-sm uppercase tracking-wider text-zinc-950">Сообщение отправлено!</div>
              <p className="text-xs text-zinc-500 font-light">Менеджер свяжется с вами в течение 15 минут.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">Ваше имя</label>
                <input
                  type="text"
                  required
                  placeholder="Анна"
                  className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">Телефон или Telegram</label>
                <input
                  type="text"
                  required
                  placeholder="+7 (999) 000-00-00 или @username"
                  className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">Вопрос или пожелание</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Хочу уточнить наличие Baccarat Rouge или заказать подбор аромата..."
                  className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-black text-white rounded-none text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-sm"
              >
                Отправить запрос
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

/* 5. Политика конфиденциальности */
export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6 text-xs sm:text-sm text-zinc-600 leading-relaxed">
      <h1 className="text-2xl sm:text-3xl font-bold font-serif text-zinc-950">
        Политика обработки персональных данных
      </h1>
      <p className="text-zinc-500">Дата публикации: 4 октября 2026 г.</p>

      <p>
        Настоящая Политика регламентирует обработку и защиту персональных данных пользователей интернет-магазина Maison Arôme в соответствии с Федеральным законом № 152-ФЗ «О персональных данных».
      </p>

      <h2 className="text-base font-bold text-zinc-900 pt-2">1. Сбор информации</h2>
      <p>
        Мы собираем исключительно те данные, которые необходимы для выполнения заказа и отправки посылки: имя получателя, номер телефона, адрес электронной почты и адрес доставки.
      </p>

      <h2 className="text-base font-bold text-zinc-900 pt-2">2. Использование данных</h2>
      <p>
        Данные используются для связи с клиентом, отправки фотоотчетов собранных заказов в Telegram/WhatsApp, оформления накладных транспортных компаний (СДЭК, Яндекс, Почта России) и уведомлений об изменении статуса доставки.
      </p>

      <h2 className="text-base font-bold text-zinc-900 pt-2">3. Безопасность и третьи лица</h2>
      <p>
        Мы не передаем персональные данные третьим лицам за исключением уполномоченных служб доставки исключительно в рамках исполнения конкретного заказа.
      </p>
    </div>
  );
};
