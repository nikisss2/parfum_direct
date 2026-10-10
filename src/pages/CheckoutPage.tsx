import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import {
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Sparkles,
  Check,
  Gift,
  Building,
  Send,
  Copy,
  Camera,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { SavedAddress } from '../types';

export const TELEGRAM_MANAGER_USERNAME = 'nikisss2'; // Telegram юзернейм для связи (без @)

interface CityData {
  name: string;
  region: string;
  deliveryDays: string;
}

const RUSSIAN_CITIES: CityData[] = [
  { name: 'Москва', region: 'г. Москва', deliveryDays: '1 день' },
  { name: 'Санкт-Петербург', region: 'г. Санкт-Петербург', deliveryDays: '1–2 дня' },
  { name: 'Екатеринбург', region: 'Свердловская область', deliveryDays: '2–3 дня' },
  { name: 'Новосибирск', region: 'Новосибирская область', deliveryDays: '3–4 дня' },
  { name: 'Казань', region: 'Республика Татарстан', deliveryDays: '2–3 дня' },
  { name: 'Нижний Новгород', region: 'Нижегородская область', deliveryDays: '1–2 дня' },
  { name: 'Челябинск', region: 'Челябинская область', deliveryDays: '2–3 дня' },
  { name: 'Красноярск', region: 'Красноярский край', deliveryDays: '3–4 дня' },
  { name: 'Самара', region: 'Самарская область', deliveryDays: '2–3 дня' },
  { name: 'Уфа', region: 'Республика Башкортостан', deliveryDays: '2–3 дня' },
  { name: 'Ростов-на-Дону', region: 'Ростовская область', deliveryDays: '2–3 дня' },
  { name: 'Омск', region: 'Омская область', deliveryDays: '3–4 дня' },
  { name: 'Краснодар', region: 'Краснодарский край', deliveryDays: '2–3 дня' },
  { name: 'Воронеж', region: 'Воронежская область', deliveryDays: '1–2 дня' },
  { name: 'Пермь', region: 'Пермский край', deliveryDays: '2–3 дня' },
  { name: 'Волгоград', region: 'Волгоградская область', deliveryDays: '2–3 дня' },
  { name: 'Саратов', region: 'Саратовская область', deliveryDays: '2–3 дня' },
  { name: 'Тюмень', region: 'Тюменская область', deliveryDays: '2–3 дня' },
  { name: 'Тольятти', region: 'Самарская область', deliveryDays: '2–3 дня' },
  { name: 'Барнаул', region: 'Алтайский край', deliveryDays: '3–4 дня' },
  { name: 'Ижевск', region: 'Удмуртская Республика', deliveryDays: '2–3 дня' },
  { name: 'Махачкала', region: 'Республика Дагестан', deliveryDays: '3–4 дня' },
  { name: 'Хабаровск', region: 'Хабаровский край', deliveryDays: '4–6 дней' },
  { name: 'Ульяновск', region: 'Ульяновская область', deliveryDays: '2–3 дня' },
  { name: 'Иркутск', region: 'Иркутская область', deliveryDays: '3–5 дней' },
  { name: 'Владивосток', region: 'Приморский край', deliveryDays: '4–6 дней' },
  { name: 'Ярославль', region: 'Ярославская область', deliveryDays: '1–2 дня' },
  { name: 'Кемерово', region: 'Кемеровская область', deliveryDays: '3–4 дня' },
  { name: 'Томск', region: 'Томская область', deliveryDays: '3–4 дня' },
  { name: 'Набережные Челны', region: 'Республика Татарстан', deliveryDays: '2–3 дня' },
  { name: 'Севастополь', region: 'г. Севастополь', deliveryDays: '3–4 дня' },
  { name: 'Ставрополь', region: 'Ставропольский край', deliveryDays: '2–3 дня' },
  { name: 'Оренбург', region: 'Оренбургская область', deliveryDays: '2–3 дня' },
  { name: 'Новокузнецк', region: 'Кемеровская область', deliveryDays: '3–4 дня' },
  { name: 'Рязань', region: 'Рязанская область', deliveryDays: '1–2 дня' },
  { name: 'Балашиха', region: 'Московская область', deliveryDays: '1 день' },
  { name: 'Пенза', region: 'Пензенская область', deliveryDays: '2–3 дня' },
  { name: 'Чебоксары', region: 'Чувашская Республика', deliveryDays: '2–3 дня' },
  { name: 'Липецк', region: 'Липецкая область', deliveryDays: '1–2 дня' },
  { name: 'Калининград', region: 'Калининградская область', deliveryDays: '2–4 дня' },
  { name: 'Астрахань', region: 'Астраханская область', deliveryDays: '2–3 дня' },
  { name: 'Тула', region: 'Тульская область', deliveryDays: '1–2 дня' },
  { name: 'Киров', region: 'Кировская область', deliveryDays: '2–3 дня' },
  { name: 'Сочи', region: 'Краснодарский край', deliveryDays: '2–3 дня' },
  { name: 'Курск', region: 'Курская область', deliveryDays: '1–2 дня' },
  { name: 'Улан-Удэ', region: 'Республика Бурятия', deliveryDays: '4–5 дней' },
  { name: 'Тверь', region: 'Тверская область', deliveryDays: '1–2 дня' },
  { name: 'Магнитогорск', region: 'Челябинская область', deliveryDays: '2–3 дня' },
  { name: 'Сургут', region: 'ХМАО — Югра', deliveryDays: '3–4 дня' },
  { name: 'Брянск', region: 'Брянская область', deliveryDays: '1–2 дня' },
  { name: 'Иваново', region: 'Ивановская область', deliveryDays: '1–2 дня' },
  { name: 'Владимир', region: 'Владимирская область', deliveryDays: '1–2 дня' },
  { name: 'Симферополь', region: 'Республика Крым', deliveryDays: '3–4 дня' },
  { name: 'Белгород', region: 'Белгородская область', deliveryDays: '1–2 дня' },
  { name: 'Калуга', region: 'Калужская область', deliveryDays: '1–2 дня' },
  { name: 'Смоленск', region: 'Смоленская область', deliveryDays: '1–2 дня' },
  { name: 'Архангельск', region: 'Архангельская область', deliveryDays: '2–3 дня' },
  { name: 'Мурманск', region: 'Мурманская область', deliveryDays: '2–3 дня' },
  { name: 'Петрозаводск', region: 'Республика Карелия', deliveryDays: '2–3 дня' },
];

interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  time: string;
  price: number;
}

const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: 'cdek',
    name: 'СДЭК Доставка',
    description: 'До пункта выдачи заказов (ПВЗ) или постамата',
    time: '2–4 дня',
    price: 350,
  },
  {
    id: 'yandex',
    name: 'Яндекс Доставка',
    description: 'В пункт выдачи Яндекс Маркет или курьером',
    time: '1–2 дня',
    price: 390,
  },
  {
    id: 'ozon',
    name: 'Ozon Доставка',
    description: 'В удобный пункт выдачи заказов Ozon рядом с домом',
    time: '2–3 дня',
    price: 290,
  },
  {
    id: 'fivepost',
    name: '5POST (Пятёрочка / Перекрёсток)',
    description: 'Выдача на кассе или в постамате у дома',
    time: '2–4 дня',
    price: 280,
  },
  {
    id: 'post',
    name: 'Почта России (1 класс)',
    description: 'Ускоренное авиа-отправление по РФ и СНГ',
    time: '3–6 дней',
    price: 320,
  },
];

export const CheckoutPage: React.FC = () => {
  const { cart, cartTotalPrice, createOrder, user, addSavedAddress } = useShop();
  const navigate = useNavigate();
  const location = useLocation();

  const discountAmount = (location.state as any)?.discountAmount || 0;
  const isFreeShipping = cartTotalPrice >= 15000;

  // Form states
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [telegram, setTelegram] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState(user?.city || 'Москва');
  const [cityDeliveryDays, setCityDeliveryDays] = useState('1–2 дня');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [address, setAddress] = useState(user?.defaultAddress || '');
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption>(DELIVERY_OPTIONS[0]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cityRef = useRef<HTMLDivElement>(null);

  // Filter city autocomplete
  const filteredCities = RUSSIAN_CITIES.filter(c =>
    c.name.toLowerCase().includes(city.trim().toLowerCase()) ||
    c.region.toLowerCase().includes(city.trim().toLowerCase())
  ).slice(0, 6);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setCityDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = (c: CityData) => {
    setCity(c.name);
    setCityDeliveryDays(c.deliveryDays);
    setCityDropdownOpen(false);
  };

  const handleSelectSavedAddress = (saved: SavedAddress) => {
    setCity(saved.city);
    setAddress(saved.address);
    if (saved.type === 'cdek_pvz') {
      const opt = DELIVERY_OPTIONS.find(o => o.id === 'cdek');
      if (opt) setSelectedDelivery(opt);
    } else if (saved.type === 'yandex_pvz') {
      const opt = DELIVERY_OPTIONS.find(o => o.id === 'yandex');
      if (opt) setSelectedDelivery(opt);
    } else if (saved.type === 'ozon_pvz') {
      const opt = DELIVERY_OPTIONS.find(o => o.id === 'ozon');
      if (opt) setSelectedDelivery(opt);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const effectiveDeliveryPrice = isFreeShipping ? 0 : selectedDelivery.price;
  const finalTotal = cartTotalPrice - discountAmount + effectiveDeliveryPrice;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Укажите ваше имя и фамилию';
    if (!phone.trim() || phone.length < 8) errs.phone = 'Укажите действующий телефон';
    if (!telegram.trim()) errs.telegram = 'Укажите ник в Telegram (@username или номер)';
    if (!city.trim()) errs.city = 'Укажите ваш город';
    if (!address.trim()) errs.address = 'Укажите адрес ПВЗ или улицу/дом';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    const cleanTelegram = telegram.trim().startsWith('@')
      ? telegram.trim()
      : `@${telegram.trim()}`;

    // 1. Build items list
    const orderItems = cart.map(item => ({
      name: item.name,
      brand: item.brand,
      volumeLabel: item.volumeLabel,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

    // 2. Save address to profile if checked
    if (user && saveAddressToProfile) {
      addSavedAddress({
        label: `${selectedDelivery.name} (${city})`,
        type: selectedDelivery.id === 'cdek' ? 'cdek_pvz' : selectedDelivery.id === 'yandex' ? 'yandex_pvz' : 'ozon_pvz',
        city,
        address,
        isDefault: false,
      });
    }

    // 3. Register order in database
    const newOrder = createOrder({
      items: orderItems,
      totalAmount: finalTotal,
      discount: discountAmount,
      deliveryMethod: `${selectedDelivery.name}${isFreeShipping ? ' (Бесплатно от 15 000 ₽)' : ''}`,
      deliveryPrice: effectiveDeliveryPrice,
      paymentMethod: 'Оплата в Telegram (СБП / перевод)',
      isPaid: false,
      recipient: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        telegram: cleanTelegram,
        email: email.trim(),
        city: `${city.trim()} (${cityDeliveryDays})`,
        address: address.trim(),
        comment: comment.trim(),
      },
    });

    // 3.1 Send automated Telegram notification directly to admin PM
    fetch('/api/orders/notify-telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch(err => console.warn('Telegram notification error:', err));

    // 4. Construct formatted text for Telegram
    const itemsFormatted = cart
      .map(
        (it, idx) =>
          `${idx + 1}. ${it.brand} ${it.name} — ${it.volumeLabel} × ${it.quantity} шт. = ${(it.price * it.quantity).toLocaleString('ru-RU')} ₽`
      )
      .join('\n');

    const formattedOrderText = `🛍️ НОВЫЙ ЗАКАЗ №${newOrder.orderNumber}
MAISON ARÔME (maisonarome.ru)

👤 Покупатель: ${fullName.trim()}
📱 Телефон: ${phone.trim()}
💬 Telegram: ${cleanTelegram}
${email.trim() ? `✉️ Email: ${email.trim()}\n` : ''}📍 Город: ${city.trim()} (${cityDeliveryDays})
🚚 Доставка: ${selectedDelivery.name} (${effectiveDeliveryPrice === 0 ? 'Бесплатно от 15 000 ₽' : `${effectiveDeliveryPrice} ₽`})
🏠 Адрес ПВЗ / доставки: ${address.trim()}
${comment.trim() ? `📝 Комментарий: ${comment.trim()}\n` : ''}
🛒 СОСТАВ ЗАКАЗА:
${itemsFormatted}

💵 Товары: ${cartTotalPrice.toLocaleString('ru-RU')} ₽
${discountAmount > 0 ? `🏷️ Скидка: -${discountAmount.toLocaleString('ru-RU')} ₽\n` : ''}🚚 Доставка: ${effectiveDeliveryPrice === 0 ? '0 ₽ (Бесплатно)' : `${effectiveDeliveryPrice.toLocaleString('ru-RU')} ₽`}
${isFreeShipping ? '🎁 Подарок: Фирменный тревел-атомайзер 10 мл + 2 семпла (0 ₽)\n' : ''}💰 ИТОГО К ОПЛАТЕ: ${finalTotal.toLocaleString('ru-RU')} ₽

Прошу подтвердить наличие позиций, выслать фото флаконов перед отправкой и направить реквизиты для оплаты.`;

    // 5. Copy to clipboard
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formattedOrderText);
      }
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }

    // 6. Open Telegram chat with pre-filled message text
    const telegramLink = `https://t.me/${TELEGRAM_MANAGER_USERNAME}?text=${encodeURIComponent(formattedOrderText)}`;
    window.open(telegramLink, '_blank');

    // 7. Redirect to OrderSuccessPage
    navigate(`/order-success/${newOrder.orderNumber}`, {
      state: {
        order: newOrder,
        orderText: formattedOrderText,
        copied: true,
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button & Title */}
      <div className="mb-6">
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-zinc-500 hover:text-black transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Вернуться в корзину</span>
        </Link>
        <h1 className="text-2xl sm:text-4xl font-normal font-serif text-zinc-950">
          Оформление заказа
        </h1>
        <div className="text-xs uppercase tracking-wider text-zinc-400 mt-1 font-mono">
          Прямое согласование, фотоконтроль флаконов и оплата в Telegram
        </div>
      </div>

      {/* Trust & Flow Explainer Banner */}
      <div className="mb-8 p-5 bg-[#f4f4f5] border border-zinc-200 rounded-none flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-black text-white flex items-center justify-center shrink-0">
            <Send className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-950">
              Как работает оформление через Telegram:
            </div>
            <div className="text-xs text-zinc-600 mt-0.5 leading-relaxed">
              После нажатия кнопки <strong>«Оформить заказ в Telegram»</strong> сформированные данные заказа автоматически откроются в вашем диалоге с менеджером (и сохранятся в буфере обмена). Менеджер подтвердит наличие, пришлет фото флаконов перед отправкой и реквизиты для оплаты (СБП / перевод).
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleOrderSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns: Form Fields */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Контакты получателя */}
          <div className="p-6 rounded-none bg-white border border-zinc-200 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950 flex items-center gap-2">
              <span className="w-5 h-5 rounded-none bg-black text-white text-[10px] font-mono flex items-center justify-center font-bold">
                1
              </span>
              Данные получателя
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Имя и Фамилия *
                </label>
                <input
                  type="text"
                  placeholder="Иван Иванов"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-none border outline-none ${
                    errors.fullName ? 'border-rose-500 bg-rose-50/50' : 'border-zinc-300 focus:border-black bg-white'
                  }`}
                />
                {errors.fullName && <div className="text-[11px] text-rose-600 mt-1">{errors.fullName}</div>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Номер телефона *
                </label>
                <input
                  type="tel"
                  placeholder="+7 (999) 000-00-00"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-none border outline-none font-mono ${
                    errors.phone ? 'border-rose-500 bg-rose-50/50' : 'border-zinc-300 focus:border-black bg-white'
                  }`}
                />
                {errors.phone && <div className="text-[11px] text-rose-600 mt-1">{errors.phone}</div>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Ваш Telegram ник (@username) *
                </label>
                <input
                  type="text"
                  placeholder="@ivanov или номер"
                  value={telegram}
                  onChange={e => setTelegram(e.target.value)}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-none border outline-none font-mono ${
                    errors.telegram ? 'border-rose-500 bg-rose-50/50' : 'border-zinc-300 focus:border-black bg-white'
                  }`}
                />
                {errors.telegram && <div className="text-[11px] text-rose-600 mt-1">{errors.telegram}</div>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Электронная почта (для истории)
                </label>
                <input
                  type="email"
                  placeholder="ivan@example.com (необязательно)"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-none border border-zinc-300 focus:border-black bg-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Доставка и Адрес */}
          <div className="p-6 rounded-none bg-white border border-zinc-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-950 flex items-center gap-2">
                <span className="w-5 h-5 rounded-none bg-black text-white text-[10px] font-mono flex items-center justify-center font-bold">
                  2
                </span>
                Доставка и Пункт выдачи (ПВЗ)
              </h2>

              {isFreeShipping && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none bg-[#5A6B32] text-white text-[10px] font-bold uppercase tracking-wider font-mono">
                  <Check className="w-3.5 h-3.5" />
                  Бесплатная доставка от 15 000 ₽
                </span>
              )}
            </div>

            {/* Quick Saved Addresses if logged in */}
            {user && user.savedAddresses && user.savedAddresses.length > 0 && (
              <div className="p-3.5 bg-zinc-50 rounded-none border border-zinc-200 space-y-2">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-zinc-900" />
                  Ваши сохранённые адреса из профиля:
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.savedAddresses.map(saved => (
                    <button
                      key={saved.id}
                      type="button"
                      onClick={() => handleSelectSavedAddress(saved)}
                      className="px-3 py-1.5 rounded-none bg-white hover:bg-black hover:text-white border border-zinc-300 text-left text-xs transition-colors flex items-center gap-1.5"
                    >
                      <MapPin className="w-3 h-3 text-zinc-900 shrink-0" />
                      <span className="font-bold">{saved.label}:</span>
                      <span className="truncate max-w-[200px]">{saved.address}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dynamic City Search with Autocomplete */}
              <div ref={cityRef} className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Город доставки *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Введите город (напр. Екатеринбург)..."
                    value={city}
                    onFocus={() => setCityDropdownOpen(true)}
                    onChange={e => {
                      setCity(e.target.value);
                      setCityDropdownOpen(true);
                    }}
                    className={`w-full text-xs px-3.5 py-2.5 rounded-none border outline-none pr-8 ${
                      errors.city ? 'border-rose-500 bg-rose-50/50' : 'border-zinc-300 focus:border-black bg-white'
                    }`}
                  />
                  <MapPin className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.city && <div className="text-[11px] text-rose-600 mt-1">{errors.city}</div>}

                {/* Autocomplete Dropdown */}
                {cityDropdownOpen && filteredCities.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-300 shadow-xl z-20 max-h-48 overflow-y-auto">
                    {filteredCities.map(c => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => handleSelectCity(c)}
                        className="w-full text-left px-3.5 py-2 hover:bg-zinc-100 flex items-center justify-between text-xs border-b border-zinc-100 last:border-b-0"
                      >
                        <div>
                          <span className="font-bold text-zinc-950">{c.name}</span>
                          <span className="text-[10px] text-zinc-500 ml-1.5">{c.region}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">{c.deliveryDays}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Срок доставки до вашего города:
                </label>
                <div className="text-xs px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 text-zinc-900 font-mono flex items-center justify-between">
                  <span>{city}</span>
                  <span className="font-bold text-black">{cityDeliveryDays}</span>
                </div>
              </div>
            </div>

            {/* Delivery Methods Grid */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
                Служба доставки:
              </label>
              <div className="space-y-2">
                {DELIVERY_OPTIONS.map(opt => {
                  const isSelected = selectedDelivery.id === opt.id;
                  const priceToPay = isFreeShipping ? 0 : opt.price;
                  return (
                    <label
                      key={opt.id}
                      onClick={() => setSelectedDelivery(opt)}
                      className={`flex items-start justify-between p-3.5 rounded-none border cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-black bg-zinc-50/70 shadow-xs'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="deliveryOption"
                          checked={isSelected}
                          onChange={() => setSelectedDelivery(opt)}
                          className="mt-0.5 accent-black rounded-none"
                        />
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2">
                            <span>{opt.name}</span>
                            <span className="text-[10px] text-zinc-400 font-mono font-normal">({opt.time})</span>
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-0.5">{opt.description}</div>
                        </div>
                      </div>

                      <div className="text-xs font-bold font-mono text-zinc-950 shrink-0 ml-4">
                        {priceToPay === 0 ? (
                          <span className="text-[#5A6B32] uppercase">Бесплатно</span>
                        ) : (
                          `${priceToPay.toLocaleString('ru-RU')} ₽`
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Address / PVZ Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                Адрес пункта выдачи (ПВЗ) или улицы/дома *
              </label>
              <input
                type="text"
                placeholder="Например: ПВЗ СДЭК ул. Ленина, д. 45 или домашний адрес"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className={`w-full text-xs px-3.5 py-2.5 rounded-none border outline-none ${
                  errors.address ? 'border-rose-500 bg-rose-50/50' : 'border-zinc-300 focus:border-black bg-white'
                }`}
              />
              {errors.address && <div className="text-[11px] text-rose-600 mt-1">{errors.address}</div>}
            </div>

            {/* Save address checkbox if logged in */}
            {user && (
              <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={saveAddressToProfile}
                  onChange={e => setSaveAddressToProfile(e.target.checked)}
                  className="rounded-none accent-black w-4 h-4"
                />
                <span className="text-xs text-zinc-700">Сохранить этот адрес в профиле для будущих заказов</span>
              </label>
            )}

            {/* Comment */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                Комментарий к заказу (пожелания к упаковке, пробникам)
              </label>
              <textarea
                rows={2}
                placeholder="Положите, пожалуйста, фирменный блоттер или пробник свежего аромата..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-none border border-zinc-300 focus:border-black bg-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout Button */}
        <div className="space-y-6">
          <div className="p-6 rounded-none bg-zinc-50 border border-zinc-200 space-y-5">
            <h2 className="text-base font-normal font-serif text-zinc-950">
              Состав заказа
            </h2>

            {/* Items list preview */}
            <div className="divide-y divide-zinc-200 max-h-60 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.image}
                      alt=""
                      className="w-10 h-10 object-contain bg-white border border-zinc-200 rounded-none shrink-0 p-0.5"
                    />
                    <div className="truncate">
                      <div className="font-bold uppercase tracking-tight text-zinc-950 truncate">
                        {item.brand}
                      </div>
                      <div className="text-zinc-600 text-[11px] truncate">{item.name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {item.volumeLabel} × {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold font-mono text-zinc-950 shrink-0">
                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              ))}
            </div>

            {/* Gift banner */}
            {isFreeShipping && (
              <div className="p-3 bg-white border border-zinc-200 rounded-none flex items-center gap-2.5">
                <Gift className="w-5 h-5 text-[#5A6B32] shrink-0" />
                <div className="text-[11px] text-zinc-700 leading-tight">
                  <strong className="text-zinc-950 font-bold uppercase">Подарок добавлен:</strong> атомайзер 10 мл + 2 семпла селектива
                </div>
              </div>
            )}

            {/* Price Calculations */}
            <div className="space-y-2 pt-4 border-t border-zinc-200 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Товары ({cart.reduce((a, b) => a + b.quantity, 0)} шт.)</span>
                <span className="font-mono">{cartTotalPrice.toLocaleString('ru-RU')} ₽</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-zinc-900 font-bold">
                  <span>Скидка</span>
                  <span className="font-mono">−{discountAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}

              <div className="flex justify-between items-center text-zinc-600">
                <span>Доставка ({selectedDelivery.name})</span>
                <span className="font-mono">
                  {effectiveDeliveryPrice === 0 ? '0 ₽ (Бесплатно)' : `${effectiveDeliveryPrice.toLocaleString('ru-RU')} ₽`}
                </span>
              </div>

              <div className="pt-3 border-t border-zinc-200 flex justify-between text-base font-bold text-zinc-950">
                <span className="uppercase tracking-wider">Итого к оплате:</span>
                <span className="font-mono text-lg">{finalTotal.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>

            {/* Primary Telegram Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-black hover:bg-zinc-800 text-white rounded-none text-xs font-bold uppercase tracking-widest text-center transition-all shadow-md active:scale-98 disabled:opacity-50"
            >
              <span className="inline-flex items-center justify-center gap-2.5">
                <Send className="w-4 h-4 text-white shrink-0" />
                <span>{isSubmitting ? 'Формирование заказа...' : 'Оформить заказ в Telegram'}</span>
              </span>
            </button>

            <div className="text-[11px] text-zinc-500 text-center leading-relaxed">
              При нажатии заказ копируется в буфер обмена и открывается диалог в Telegram с личным менеджером.
            </div>

            {/* Guarantees */}
            <div className="p-3.5 bg-white rounded-none border border-zinc-200 text-xs text-zinc-600 space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 font-bold uppercase tracking-wider text-[10px]">
                <ShieldCheck className="w-4 h-4 text-[#5A6B32]" />
                100% Оригинал
              </div>
              <div className="flex items-center gap-2 text-zinc-900 font-bold uppercase tracking-wider text-[10px]">
                <Camera className="w-4 h-4 text-[#5A6B32]" />
                Фото флакона перед отправкой
              </div>
              <div className="flex items-center gap-2 text-zinc-900 font-bold uppercase tracking-wider text-[10px]">
                <CheckCircle2 className="w-4 h-4 text-[#5A6B32]" />
                Оплата после согласования в диалоге
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
