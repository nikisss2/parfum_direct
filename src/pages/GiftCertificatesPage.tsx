import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import {
  Gift,
  Check,
  ShoppingBag,
  CreditCard,
  Mail,
  ShieldCheck,
  Heart
} from 'lucide-react';

const DENOMINATIONS = [3000, 5000, 10000, 15000, 25000, 50000];

const DESIGNS = [
  {
    id: 'noir',
    name: 'Classic Noir',
    bgColor: 'bg-zinc-950',
    textColor: 'text-white',
    accentColor: 'text-amber-300',
    borderColor: 'border-zinc-800'
  },
  {
    id: 'olive',
    name: 'Signature Olive',
    bgColor: 'bg-[#3b471f]',
    textColor: 'text-white',
    accentColor: 'text-[#d6e897]',
    borderColor: 'border-[#50602c]'
  },
  {
    id: 'gold',
    name: 'Imperial Gold',
    bgColor: 'bg-gradient-to-br from-amber-700 via-amber-900 to-zinc-950',
    textColor: 'text-white',
    accentColor: 'text-amber-200',
    borderColor: 'border-amber-700'
  },
  {
    id: 'minimal',
    name: 'Pure White',
    bgColor: 'bg-white',
    textColor: 'text-zinc-950',
    accentColor: 'text-zinc-500',
    borderColor: 'border-zinc-300'
  }
];

export const GiftCertificatesPage: React.FC = () => {
  const { addCustomCartItem } = useShop();
  const navigate = useNavigate();

  const [selectedAmount, setSelectedAmount] = useState<number>(5000);
  const [selectedDesign, setSelectedDesign] = useState(DESIGNS[0]);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();

    const certTitle = `Подарочный сертификат Maison Arôme — ${selectedAmount.toLocaleString('ru-RU')} ₽`;
    const certSubtitle = `Электронный сертификат · ${selectedDesign.name}${
      recipientName ? ` для ${recipientName}` : ''
    }`;

    addCustomCartItem({
      name: certTitle,
      brand: 'Maison Arôme Certificates',
      image: '/assets/branding/логотип_2.png',
      volumeLabel: certSubtitle,
      price: selectedAmount,
      quantity: 1
    });

    setAddedSuccess(true);
    setTimeout(() => {
      navigate('/cart');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-zinc-100 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[11px] font-normal uppercase tracking-[0.18em] text-zinc-400">
            Maison Arôme
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-zinc-950 tracking-tight mt-1">
            Подарочные сертификаты
          </h1>
          <p className="mt-3 text-xs sm:text-sm md:text-base text-zinc-500 max-w-xl mx-auto leading-relaxed font-light text-delicate">
            Подарите свободу выбора любимого аромата. Сертификат действует на весь каталог: оригинальные полноразмерные флаконы и распивы от 1 мл.
          </p>
        </div>
      </section>

      {/* Main Builder & Preview */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Live Card Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-24">
              <h2 className="text-[11px] font-normal uppercase tracking-[0.16em] text-zinc-400 mb-4">
                Предпросмотр сертификата
              </h2>

              {/* The Virtual Card */}
              <div
                className={`w-full aspect-[1.6/1] ${selectedDesign.bgColor} ${selectedDesign.textColor} p-6 sm:p-8 flex flex-col justify-between rounded-3xl shadow-xl border ${selectedDesign.borderColor} transition-all duration-300 relative overflow-hidden`}
              >
                {/* Subtle Luxury Pattern Overlay */}
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between z-10">
                  <div>
                    <span className="font-serif tracking-widest text-sm sm:text-base font-bold uppercase">
                      MAISON ARÔME
                    </span>
                    <span className="block text-[9px] uppercase tracking-widest opacity-60">
                      Haute Parfumerie
                    </span>
                  </div>
                  <Gift className={`w-5 h-5 ${selectedDesign.accentColor}`} />
                </div>

                <div className="my-auto py-2 z-10">
                  <span className="text-[10px] uppercase tracking-widest opacity-70 block mb-1">
                    Номинал сертификата
                  </span>
                  <div className={`text-3xl sm:text-4xl font-serif font-bold ${selectedDesign.accentColor}`}>
                    {selectedAmount.toLocaleString('ru-RU')} ₽
                  </div>
                  {recipientName && (
                    <div className="mt-2 text-xs opacity-80 truncate">
                      Для кого: <span className="font-bold underline">{recipientName}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-end justify-between text-[10px] opacity-70 z-10 font-sans tabular-nums">
                  <span>№ MA-{selectedAmount}-CERT</span>
                  <span>Без срока действия</span>
                </div>
              </div>

              {/* Card Perks */}
              <div className="mt-6 space-y-2.5 text-xs text-zinc-600 bg-zinc-50/70 p-5 rounded-2xl border border-zinc-200/80">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-light text-delicate">Действует на все распивы, флаконы и наборы</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-light text-delicate">Срок действия не ограничен</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-light text-delicate">Можно расходовать баланс за несколько заказов</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Customization Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleAddToCart} className="space-y-8">
              {/* Step 1: Denomination */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-950">
                  1. Выберите номинал сертификата *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {DENOMINATIONS.map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSelectedAmount(amt)}
                      className={`py-3 px-4 rounded-full text-xs font-medium font-sans tabular-nums uppercase tracking-wider transition-all cursor-pointer ${
                        selectedAmount === amt
                          ? 'border border-black bg-black text-white shadow-xs'
                          : 'border border-zinc-200/80 bg-white text-zinc-900 hover:border-black'
                      }`}
                    >
                      {amt.toLocaleString('ru-RU')} ₽
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Design */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-950">
                  2. Дизайн карты
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DESIGNS.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDesign(d)}
                      className={`p-3.5 rounded-2xl border text-xs font-medium text-left transition-all cursor-pointer ${
                        selectedDesign.id === d.id
                          ? 'border-black ring-1 ring-black bg-zinc-50'
                          : 'border-zinc-200/80 hover:border-zinc-400 bg-white'
                      }`}
                    >
                      <div className={`w-full h-8 rounded-xl ${d.bgColor} border ${d.borderColor} mb-2 shadow-2xs`} />
                      <div className="text-[11px] font-medium text-zinc-900 truncate">{d.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Format */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-950">
                  3. Формат получения
                </label>
                <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200/80 bg-zinc-50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase text-zinc-950">Электронный сертификат</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5 font-light text-delicate">
                        Мгновенная отправка в дизайнерском PDF на e-mail или в Telegram сразу после оплаты
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-medium uppercase tracking-wider shrink-0">
                    Мгновенно
                  </span>
                </div>
              </div>

              {/* Step 4: Personalization */}
              <div className="space-y-4 pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-950">
                  4. Персонализация (по желанию)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-zinc-600 mb-1 font-light text-delicate">Имя получателя</label>
                    <input
                      type="text"
                      placeholder="Например: Анастасия"
                      value={recipientName}
                      onChange={e => setRecipientName(e.target.value)}
                      className="w-full text-xs px-4 py-2.5 rounded-full border border-zinc-200 focus:border-black outline-none bg-white font-light"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-600 mb-1 font-light text-delicate">E-mail получателя (или ваш)</label>
                    <input
                      type="email"
                      placeholder="friend@mail.ru"
                      value={recipientEmail}
                      onChange={e => setRecipientEmail(e.target.value)}
                      className="w-full text-xs px-4 py-2.5 rounded-full border border-zinc-200 focus:border-black outline-none bg-white font-light"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-600 mb-1 font-light text-delicate">Тёплые пожелания</label>
                  <textarea
                    rows={2}
                    placeholder="С днём рождения! Пусть этот аромат напоминает о самых счастливых моментах..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full text-xs px-4 py-3 rounded-2xl border border-zinc-200 focus:border-black outline-none bg-white font-light"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-zinc-100">
                <button
                  type="submit"
                  className={`w-full py-3.5 sm:py-4 rounded-full text-xs font-medium uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                    addedSuccess ? 'bg-emerald-700 text-white' : 'bg-black hover:bg-zinc-800 text-white active:scale-[0.99]'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {addedSuccess
                      ? 'Сертификат добавлен в корзину!'
                      : `Добавить сертификат на ${selectedAmount.toLocaleString('ru-RU')} ₽ в корзину`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
