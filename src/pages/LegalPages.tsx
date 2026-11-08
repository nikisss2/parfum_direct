import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, FileText, Lock, Scale, CheckCircle2 } from 'lucide-react';

type LegalTab = 'terms' | 'offer' | 'privacy';

interface LegalPagesProps {
  initialTab?: LegalTab;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ initialTab = 'terms' }) => {
  const location = useLocation();

  // Pick tab from prop or URL
  const determineTab = (): LegalTab => {
    if (location.pathname.includes('/offer')) return 'offer';
    if (location.pathname.includes('/privacy')) return 'privacy';
    if (location.pathname.includes('/terms')) return 'terms';
    return initialTab;
  };

  const [activeTab, setActiveTab] = useState<LegalTab>(determineTab());

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-8">
      {/* Editorial Header */}
      <div className="space-y-2 border-b border-zinc-200 pb-6">
        <div className="text-[11px] font-sans uppercase tracking-[0.16em] text-zinc-400">
          Правовая информация · Законодательство РФ
        </div>
        <h1 className="text-2xl sm:text-4xl font-light text-zinc-950 tracking-tight">
          {activeTab === 'terms' && 'Пользовательское соглашение'}
          {activeTab === 'offer' && 'Публичная оферта'}
          {activeTab === 'privacy' && 'Политика конфиденциальности (152-ФЗ)'}
        </h1>
        <p className="text-xs text-zinc-500 font-sans tabular-nums">
          Редакция от 15 октября 2026 г. · Действует на всей территории Российской Федерации
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-100 pb-3">
        <Link
          to="/terms"
          onClick={() => setActiveTab('terms')}
          className={`px-5 py-2.5 rounded-full text-xs font-light uppercase tracking-wider transition-all border cursor-pointer ${
            activeTab === 'terms'
              ? 'bg-black text-white border-black shadow-xs'
              : 'bg-white text-zinc-700 border-zinc-200 hover:border-black'
          }`}
        >
          Пользовательское соглашение
        </Link>
        <Link
          to="/offer"
          onClick={() => setActiveTab('offer')}
          className={`px-5 py-2.5 rounded-full text-xs font-light uppercase tracking-wider transition-all border cursor-pointer ${
            activeTab === 'offer'
              ? 'bg-black text-white border-black shadow-xs'
              : 'bg-white text-zinc-700 border-zinc-200 hover:border-black'
          }`}
        >
          Публичная оферта
        </Link>
        <Link
          to="/privacy"
          onClick={() => setActiveTab('privacy')}
          className={`px-5 py-2.5 rounded-full text-xs font-light uppercase tracking-wider transition-all border cursor-pointer ${
            activeTab === 'privacy'
              ? 'bg-black text-white border-black shadow-xs'
              : 'bg-white text-zinc-700 border-zinc-200 hover:border-black'
          }`}
        >
          Конфиденциальность (152-ФЗ)
        </Link>
      </div>

      {/* Content: Terms of Service */}
      {activeTab === 'terms' && (
        <div className="prose prose-zinc max-w-none text-xs sm:text-sm text-zinc-700 space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-medium text-zinc-950 tracking-tight">
              1. Общие положения
            </h2>
            <p>
              1.1. Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между интернет-магазином «Maison Arôme» (далее — «Администрация», «Продавец») и физическим лицом (далее — «Пользователь», «Покупатель»), использующим сайт maisonarome.ru и любые его сервисы.
            </p>
            <p>
              1.2. Использование Сайта, включая просмотр каталога, регистрацию учетной записи и оформление заказов, означает безоговорочное согласие Пользователя со всеми условиями настоящего Соглашения.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-zinc-950 tracking-tight">
              2. Учетная запись и безопасность
            </h2>
            <p>
              2.1. Для оформления заказов и сохранения истории покупок Пользователь вправе пройти регистрацию, указав актуальный адрес электронной почты, номер телефона и фамилию, имя.
            </p>
            <p>
              2.2. Пользователь обязуется не разглашать третьим лицам логин и пароль от своей учетной записи. Все действия, совершенные на Сайте с использованием учетной записи Пользователя, признаются совершенными лично Пользователем.
            </p>
            <p>
              2.3. Администрация сайта обеспечивает защиту персональных данных в соответствии с требованиями Федерального закона № 152-ФЗ «О персональных данных» и применяет шифрование паролей алгоритмом PBKDF2/SHA-256 с индивидуальной солью.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-zinc-950 tracking-tight">
              3. Интеллектуальная собственность
            </h2>
            <p>
              3.1. Все текстовые материалы, графические изображения флаконов, фотографии реальных заказов, логотипы, дизайн и программный код являются интеллектуальной собственностью Maison Arôme либо используются с согласия правообладателей.
            </p>
            <p>
              3.2. Любое копирование, распространение или воспроизведение материалов сайта без письменного согласия Администрации строго запрещено.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-zinc-950 tracking-tight">
              4. Ограничение ответственности
            </h2>
            <p>
              4.1. Администрация предпринимает все разумные меры для обеспечения бесперебойной и точной работы Сайта, однако Сайт предоставляется на условиях «как есть» (as is).
            </p>
            <p>
              4.2. Администрация оставляет за собой право вносить изменения в настоящее Соглашение в одностороннем порядке. Новая редакция вступает в силу с момента ее публикации на Сайте.
            </p>
          </section>
        </div>
      )}

      {/* Content: Public Offer */}
      {activeTab === 'offer' && (
        <div className="prose prose-zinc max-w-none text-xs sm:text-sm text-zinc-700 space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-medium text-zinc-950 tracking-tight">
              1. Предмет публичной оферты
            </h2>
            <p>
              1.1. В соответствии со статьями 435 и 437 Гражданского кодекса Российской Федерации настоящий документ является официальным публичным предложением (публичной офертой) бутика Maison Arôme заключить договор на оказание услуг по комплексному подбору, декантированию (распиву) парфюмерных композиций, комплектации и реализации оригинальных парфюмерных образцов и продукции дистанционным способом.
            </p>
            <p>
              1.2. Акцептом настоящей Оферты является нажатие Покупателем кнопки «Оформить заказ в Telegram» либо подтверждение заказа в диалоге с менеджером Продавца.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-zinc-950 tracking-tight">
              2. Информация о товарах, услугах и оригинальность
            </h2>
            <p>
              2.1. Исполнитель (Продавец) гарантирует 100% подлинность и оригинальность всей представленной парфюмерной продукции (как полноразмерных флаконов, так и распивов/отливантов).
            </p>
            <p>
              2.2. Подлинность подтверждается оригинальными фабричными батч-кодами (Batch code) производителя, нанесенными на оригинальную упаковку и продублированными лазерной гравировкой на дне флакона. Заказчик вправе сверить батч-код в независимых базах верификации парфюмерии (CheckFresh, Cosmetic Calculator).
            </p>
            <p>
              2.3. Распив (декантирование) парфюмерии производится стерильным способом из оригинальных флаконов в чистые стеклянные атомайзеры объемом 1, 2, 3, 5, 10 или 15 мл с металлическим микроспреем.
            </p>
            <p>
              2.4. Перед оплатой и отправкой каждого заказа Исполнитель направляет Заказчику подробный фотоотчет собранных флаконов, атомайзеров и батч-кодов в Telegram или WhatsApp.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-zinc-950 tracking-tight">
              3. Оплата, порядок расчетов и кассовые чеки (54-ФЗ)
            </h2>
            <p>
              3.1. Цены на Сайте указаны в валюте Российской Федерации (рублях). В стоимость товара не включена доставка, если не выполнено условие бесплатной доставки от 25 000 рублей (при расстоянии до 2 500 км от Москвы).
            </p>
            <p>
              3.2. Оплата производится безналичным расчетом через Систему быстрых платежей (СБП) или банковский перевод по реквизитам Продавца после согласования фотоотчета и подтверждения наличия всех позиций.
            </p>
            <p>
              3.3. В соответствии с Федеральным законом от 22.05.2003 № 54-ФЗ «О применении контрольно-кассовой техники» при осуществлении расчетов Продавец формирует электронный кассовый чек и направляет его Покупателю на предоставленный адрес электронной почты или номер телефона.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-zinc-950 tracking-tight">
              4. Доставка и передача товара
            </h2>
            <p>
              4.1. Склад отправки расположен в г. Москва. Доставка осуществляется транспортными компаниями: СДЭК, Яндекс Доставка (ПВЗ Яндекс Маркет), Boxberry, 5POST, Почта России.
            </p>
            <p>
              4.2. Стоимость доставки рассчитывается от 50 рублей в зависимости от города назначения и выбранного тарифа. Каждое отправление страхуется на полную стоимость.
            </p>
            <p>
              4.3. Риск случайной гибели или повреждения товара переходит к Покупателю с момента фактической передачи отправления в пункте выдачи (ПВЗ) или курьером.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-zinc-950 tracking-tight">
              5. Возврат, обмен и гарантия качества (ЗОЗПП, Постановление № 2463)
            </h2>
            <p>
              5.1. Порядок, сроки и условия возврата подробно регламентированы на специальной странице <Link to="/returns" className="text-black underline font-medium">«Возврат и гарантия»</Link>, являющейся неотъемлемой частью настоящей Оферты.
            </p>
            <p>
              5.2. В соответствии со ст. 26.1 Закона РФ «О защите прав потребителей» Покупатель вправе отказаться от товара надлежащего качества в течение 7 календарных дней с момента получения при условии сохранения товарного вида, фабричной слюды, упаковки и читаемых заводских батч-кодов.
            </p>
            <p>
              5.3. На основании Постановления Правительства РФ № 2463 парфюмерно-косметические товары надлежащего качества с нарушенной упаковкой, а также индивидуально изготовленные распивы (отливанты) возврату и обмену не подлежат.
            </p>
            <p>
              5.4. В случае выявления производственного брака атомайзера (неисправность спрея) или повреждения упаковки/флакона при транспортировке, возврат или замена товара осуществляется исключительно при предоставлении видеодоказательства (видеозаписи процесса распаковки отправления), на котором четко зафиксирован дефект или факт повреждения. Данное правило не распространяется на товары категории «Тестер», которые поставляются со специальным дисконтом в технической упаковке и обмену/возврату не подлежат. Покупатель вправе обратиться с видеодоказательством в течение 14 дней с момента получения. Возврат денежных средств производится в течение до 10 дней в соответствии со ст. 22 ЗОЗПП.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-zinc-950 tracking-tight">
              6. Реквизиты Продавца и порядок обращений
            </h2>
            <div className="p-4 bg-zinc-50 border border-zinc-200 font-sans tabular-nums text-xs space-y-1.5 text-zinc-800">
              <div><strong>Исполнитель / Продавец:</strong> Индивидуальный предприниматель Лаптев Н. В. (Maison Arôme)</div>
              <div><strong>ИНН:</strong> 667221490551</div>
              <div><strong>Склад комплектации и отгрузки:</strong> г. Москва</div>
              <div><strong>Подтверждение подлинности:</strong> Заводские батч-коды (Batch Code) производителей, проверка по базам CheckFresh</div>
              <div><strong>Электронная почта:</strong> <a href="mailto:order@maisonarome.ru" className="underline">order@maisonarome.ru</a></div>
              <div><strong>Контактный менеджер (Telegram / тел):</strong> @nikisss2 · 8 (912) 287-94-86</div>
              <div><strong>Режим приёма заказов:</strong> Онлайн 24/7. Обработка и фотоотчеты: ежедневно с 09:00 до 22:00 (МСК)</div>
            </div>
          </section>
        </div>
      )}

      {/* Content: Privacy Policy 152-FZ */}
      {activeTab === 'privacy' && (
        <div className="prose prose-zinc max-w-none text-xs sm:text-sm text-zinc-700 space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-medium text-zinc-950 tracking-tight">
              1. Правовые основания и цели обработки (152-ФЗ)
            </h2>
            <p>
              1.1. Настоящая Политика составлена в строгом соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных» и определяет порядок сбора, хранения, защиты и уничтожения персональных данных клиентов Maison Arôme.
            </p>
            <p>
              1.2. Целями обработки персональных данных являются:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Исполнение договора купли-продажи и доставка заказанного товара Покупателю;</li>
              <li>Связь с Покупателем в Telegram / по телефону для согласования состава и фотоотчета перед отправкой;</li>
              <li>Формирование транспортных накладных в службах доставки (СДЭК, Яндекс Доставка, Boxberry, Почта России);</li>
              <li>Информирование о статусе исполнения заказа.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-zinc-950 tracking-tight">
              2. Состав обрабатываемых данных
            </h2>
            <p>
              2.1. Оператор обрабатывает следующие персональные данные:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Фамилия, Имя Покупателя и получателя посылки;</li>
              <li>Контактный номер телефона;</li>
              <li>Имя пользователя (ник) в мессенджере Telegram;</li>
              <li>Адрес электронной почты;</li>
              <li>Адрес пункта выдачи (ПВЗ) или адрес доставки.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-zinc-950 tracking-tight">
              3. Передача третьим лицам и трансграничная передача
            </h2>
            <p>
              3.1. Оператор не передает и не продает персональные данные сторонним лицам, кроме уполномоченных служб доставки (ООО «СДЭК-Глобал», ООО «Яндекс.Доставка», АО «Почта России») строго в объеме, необходимом для вручения посылки.
            </p>
            <p>
              3.2. Базы данных с персональными данными граждан Российской Федерации размещены на серверах на территории РФ в соответствии со статьей 18 Федерального закона № 152-ФЗ.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-zinc-950 tracking-tight">
              4. Права субъекта персональных данных
            </h2>
            <p>
              4.1. Субъект персональных данных имеет право в любой момент запросить сведения об обработке своих данных, выгрузить их в машиночитаемом формате JSON или отозвать согласие в личном кабинете, либо направив запрос на электронную почту <a href="mailto:order@maisonarome.ru" className="text-black underline font-sans">order@maisonarome.ru</a> или в Telegram @nikisss2.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-medium text-zinc-950 tracking-tight">
              5. Реквизиты Оператора персональных данных
            </h2>
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 font-sans tabular-nums text-xs space-y-1.5 text-zinc-800">
              <div><strong>Оператор:</strong> Индивидуальный предприниматель Лаптев Н. В. (Maison Arôme)</div>
              <div><strong>ИНН:</strong> 667221490551</div>
              <div><strong>Склад комплектации и отправки:</strong> г. Москва</div>
              <div><strong>Контакты для отзыва согласия и реализации прав субъекта ПД:</strong> <a href="mailto:order@maisonarome.ru" className="underline">order@maisonarome.ru</a> или Telegram @nikisss2</div>
              <div className="text-[11px] text-zinc-500 pt-1">
                Обработка и хранение баз данных осуществляются исключительно в дата-центрах на территории Российской Федерации.
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Trust Signoff */}
      <div className="mt-8 rounded-2xl border border-zinc-200/80 p-5 bg-zinc-50 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-[#5A6B32] shrink-0" />
        <div className="text-xs text-zinc-600">
          Maison Arôme соблюдает законодательство РФ о защите прав потребителей и гарантирует конфиденциальность информации каждого клиента.
        </div>
      </div>
    </div>
  );
};
