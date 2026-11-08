import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, RotateCcw, AlertCircle, CheckCircle2, PackageCheck, Send, Mail, ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { BatchCodeModal } from '../components/BatchCodeModal';

export const ReturnsPage: React.FC = () => {
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Возврат и гарантия | Maison Arôme',
    description: 'Правила возврата, обмена и гарантия подлинности парфюмерии в интернет-бутике Maison Arôme по Закону РФ «О защите прав потребителей» и Постановлению № 2463.',
    url: 'https://maison-arome.ru/returns',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Главная',
          item: 'https://maison-arome.ru/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Возврат и гарантия',
          item: 'https://maison-arome.ru/returns',
        },
      ],
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
      <SEO
        title="Возврат и гарантия — Правила обмена и подлинности | Maison Arôme"
        description="Официальные правила возврата, обмена и гарантия подлинности парфюмерии в интернет-бутике Maison Arôme. Законодательство РФ (2300-1 ЗОЗПП, Постановление № 2463, проверка батч-кодов)."
        canonical="https://maison-arome.ru/returns"
        schema={schemaData}
      />

      {/* Header */}
      <div className="space-y-3 border-b border-zinc-200/80 pb-6">
        <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-400">
          Законодательство РФ · Ст. 26.1 ЗОЗПП · Постановление № 2463
        </div>
        <h1 className="text-2xl sm:text-4xl font-light text-zinc-950 tracking-tight">
          Возврат и гарантия подлинности
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 font-light leading-relaxed max-w-2xl">
          Мы гарантируем 100% оригинальность каждого флакона и строго соблюдаем Закон РФ «О защите прав потребителей».
          Ниже подробно описан порядок обмена, возврата и компенсаций.
        </p>
      </div>

      {/* 3 Pillars Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setIsBatchModalOpen(true)}
          className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2 text-left hover:border-black/50 transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-black group-hover:bg-[#5A6B32] text-white flex items-center justify-center transition-colors">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-sm font-medium text-zinc-950 flex items-center justify-between">
            <span>100% Оригинал</span>
            <span className="text-[10px] text-zinc-400 group-hover:text-black font-light underline">
              Инструкция
            </span>
          </div>
          <div className="text-xs text-zinc-500 leading-relaxed font-light">
            Только подлинная парфюмерия с оригинальными заводскими батч-кодами (Batch code) и фотоотчетом перед отправкой.
          </div>
        </button>

        <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
          <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div className="text-sm font-medium text-zinc-950">7 дней на возврат</div>
          <div className="text-xs text-zinc-500 leading-relaxed font-light">
            Для нераспечатанных целых флаконов с сохранением заводской слюды и пломб (ст. 26.1 ЗОЗПП).
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
          <div className="w-9 h-9 rounded-full bg-[#5A6B32] text-white flex items-center justify-center">
            <PackageCheck className="w-4 h-4" />
          </div>
          <div className="text-sm font-medium text-zinc-950">100% Защита от брака</div>
          <div className="text-xs text-zinc-500 leading-relaxed font-light">
            При протечке, бое в пути или неисправности атомайзера — мгновенная бесплатная замена или возврат.
          </div>
        </div>
      </div>

      {/* Section 1: Proper Quality Goods */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-normal text-zinc-950 tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center font-mono">1</span>
          Возврат товара надлежащего качества
        </h2>
        
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200/80 space-y-4 text-xs sm:text-sm text-zinc-700 leading-relaxed font-light">
          <p>
            В соответствии со <strong>статьей 26.1 Закона РФ от 07.02.1992 № 2300-1 «О защите прав потребителей»</strong> (дистанционный способ продажи товара), покупатель вправе отказаться от товара в любое время до его передачи, а после передачи товара — в течение <strong>7 календарных дней</strong>.
          </p>

          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-zinc-800 space-y-1.5 text-xs">
            <div className="font-medium text-amber-950 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              Условия возврата целых флаконов:
            </div>
            <ul className="list-disc pl-5 space-y-1 text-zinc-600">
              <li>Сохранен товарный вид, фабричная коробка, заводская слюда (термоусадочная пленка) и защитные пломбы;</li>
              <li>Товар не был в употреблении, сохранены потребительские свойства, оригинальная упаковка и читаемые заводские батч-коды производителя;</li>
              <li>Имеется документ либо подтверждение заказа (электронный чек по 54-ФЗ, номер накладной СДЭК / Яндекс).</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs text-zinc-600 space-y-1.5">
            <div className="font-medium text-zinc-900">Особенности распивов и отливантов (1–20 мл):</div>
            <p>
              На основании <strong>Постановления Правительства РФ от 31.12.2020 № 2463</strong> парфюмерно-косметические товары надлежащего качества не подлежат обмену и возврату после вскрытия упаковки. Распивы (отливанты) изготавливаются индивидуально для каждого клиента методом отбора парфюмерной жидкости из оригинального флакона в стерильный стеклянный атомайзер. В связи с этим распивы надлежащего качества обмену и возврату не подлежат.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Defective Goods */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-normal text-zinc-950 tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center font-mono">2</span>
          Возврат и замена при браке или повреждении (ненадлежащее качество)
        </h2>

        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200/80 space-y-4 text-xs sm:text-sm text-zinc-700 leading-relaxed font-light">
          <p>
            Каждое отправление Maison Arôme страхуется на 100% стоимости. Если в процессе доставки посылка пострадала или обнаружен дефект:
          </p>

          {/* Video proof requirement callout */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 border border-amber-500/25 space-y-2">
            <div className="font-medium text-amber-950 flex items-center gap-2 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              Обязательное условие возврата поврежденного товара:
            </div>
            <p className="text-xs text-zinc-700 leading-relaxed font-light">
              Возврат или обмен осуществляется строго при наличии <strong>видеодоказательства</strong> того, что товар был поврежден (видеозапись непрерывного процесса распаковки отправления при получении, на которой четко зафиксирован дефект флакона, протечка или неисправность распылителя).
            </p>
            <p className="text-xs text-amber-950 font-medium">
              Обратите внимание: данное правило не распространяется на товары категории <strong>«Тестер»</strong>. Тестеры поставляются в технической коробке со специальным дисконтом и обмену или возврату не подлежат.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1.5">
              <div className="font-medium text-zinc-950 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5A6B32]" />
                Что считается браком:
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-zinc-600">
                <li>Бой стекла или трещина флакона/атомайзера при транспортировке;</li>
                <li>Протечка парфюмерной жидкости;</li>
                <li>Неисправность распылительного механизма (спрей не нажимается или заедает);</li>
                <li>Ошибочное вложение другой позиции.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 space-y-1.5">
              <div className="font-medium text-zinc-950 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#5A6B32]" />
                Ваши права (ст. 18 ЗОЗПП):
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-zinc-600">
                <li>Бесплатная повторная отправка аналогичного товара за наш счет;</li>
                <li>100% возврат уплаченных денежных средств, включая стоимость доставки;</li>
                <li>Соразмерное уменьшение стоимости заказа.</li>
              </ul>
            </div>
          </div>

          <p className="text-xs text-zinc-500 pt-1">
            Срок обращения с претензией по качеству: <strong>в течение 14 календарных дней</strong> с момента вручения посылки.
          </p>
        </div>
      </section>

      {/* Section 3: Step by step instructions */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-normal text-zinc-950 tracking-tight flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center font-mono">3</span>
          Порядок оформления возврата (3 простых шага)
        </h2>

        <div className="space-y-3">
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-4">
            <span className="text-sm font-semibold font-mono text-zinc-400 pt-0.5">01</span>
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="font-medium text-zinc-950">Зафиксируйте видеодоказательство повреждения</div>
              <div className="text-zinc-500 font-light text-xs">
                Снимите видео распаковки посылки, подтверждающее повреждение флакона или дефект спрея при получении. Видеодоказательство обязательно для оформления возврата (не распространяется на товары категории «Тестер»).
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-4">
            <span className="text-sm font-semibold font-mono text-zinc-400 pt-0.5">02</span>
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="font-medium text-zinc-950">Направьте обращение менеджеру</div>
              <div className="text-zinc-500 font-light text-xs">
                Напишите в Telegram <a href="https://t.me/nikisss2" target="_blank" rel="noopener noreferrer" className="text-black underline font-medium">@nikisss2</a> либо на email <a href="mailto:order@maisonarome.ru" className="text-black underline font-medium">order@maisonarome.ru</a>, указав номер заказа и приложив фото. Мы отвечаем ежедневно с 09:00 до 22:00 (МСК).
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-4">
            <span className="text-sm font-semibold font-mono text-zinc-400 pt-0.5">03</span>
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="font-medium text-zinc-950">Получите замену или возврат денег</div>
              <div className="text-zinc-500 font-light text-xs">
                По ст. 22 Закона РФ «О защите прав потребителей» возврат денежных средств производится в течение <strong>до 10 календарных дней</strong> на банковскую карту или по СБП, с которой производилась оплата.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Mandatory Legal Info & Receipts */}
      <section className="p-5 sm:p-6 rounded-2xl bg-zinc-950 text-white space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.14em] text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-[#5A6B32]" />
          Подлинность по заводским батч-кодам и фискальные чеки (54-ФЗ)
        </div>
        <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
          В соответствии с Федеральным законом № 54-ФЗ при каждой покупке формируется фискальный электронный чек, направляемый на электронную почту или телефон клиента. Все поставки парфюмерии поступают напрямую от проверенных европейских и ближневосточных дистрибьюторов: каждый флакон имеет заводской батч-код, совпадающий на коробке и дне флакона, проверяемый в международных реестрах CheckFresh и Cosmetic Calculator.
        </p>
      </section>

      {/* Contact Callout */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-200/80 bg-zinc-50">
        <div>
          <div className="text-sm font-medium text-zinc-900">Остались вопросы по заказу?</div>
          <div className="text-xs text-zinc-500 font-light">Служба заботы о клиентах всегда на связи</div>
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href="https://t.me/nikisss2"
            target="_blank"
            rel="noopener noreferrer"
            className="pill-btn-black py-2.5 px-5 rounded-full text-xs font-light flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-white" />
            <span>Написать в Telegram</span>
          </a>
          <Link
            to="/faq"
            className="pill-btn-outline py-2.5 px-5 rounded-full text-xs font-light flex items-center gap-1.5"
          >
            <span>Частые вопросы (FAQ)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <BatchCodeModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
      />
    </div>
  );
};
