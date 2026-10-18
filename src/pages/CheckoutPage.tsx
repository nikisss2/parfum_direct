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
  AlertCircle,
  Coins
} from 'lucide-react';
import { SavedAddress } from '../types';
import { PvzPoint, INITIAL_PVZ_DATABASE } from '../data/pvzData';

export const TELEGRAM_MANAGER_USERNAME = 'nikisss2'; // Telegram юзернейм для связи (без @)

interface CityData {
  name: string;
  region: string;
  deliveryDays: string;
  distanceKm: number;
}

const RUSSIAN_CITIES: CityData[] = [
  { name: 'Москва', region: 'г. Москва', deliveryDays: '1 день', distanceKm: 0 },
  { name: 'Балашиха', region: 'Московская область', deliveryDays: '1 день', distanceKm: 25 },
  { name: 'Подольск', region: 'Московская область', deliveryDays: '1 день', distanceKm: 40 },
  { name: 'Тверь', region: 'Тверская область', deliveryDays: '1–2 дня', distanceKm: 170 },
  { name: 'Владимир', region: 'Владимирская область', deliveryDays: '1–2 дня', distanceKm: 185 },
  { name: 'Калуга', region: 'Калужская область', deliveryDays: '1–2 дня', distanceKm: 180 },
  { name: 'Тула', region: 'Тульская область', deliveryDays: '1–2 дня', distanceKm: 185 },
  { name: 'Рязань', region: 'Рязанская область', deliveryDays: '1–2 дня', distanceKm: 195 },
  { name: 'Ярославль', region: 'Ярославская область', deliveryDays: '1–2 дня', distanceKm: 260 },
  { name: 'Иваново', region: 'Ивановская область', deliveryDays: '1–2 дня', distanceKm: 300 },
  { name: 'Смоленск', region: 'Смоленская область', deliveryDays: '1–2 дня', distanceKm: 390 },
  { name: 'Брянск', region: 'Брянская область', deliveryDays: '1–2 дня', distanceKm: 390 },
  { name: 'Нижний Новгород', region: 'Нижегородская область', deliveryDays: '1–2 дня', distanceKm: 420 },
  { name: 'Липецк', region: 'Липецкая область', deliveryDays: '1–2 дня', distanceKm: 440 },
  { name: 'Воронеж', region: 'Воронежская область', deliveryDays: '1–2 дня', distanceKm: 520 },
  { name: 'Курск', region: 'Курская область', deliveryDays: '1–2 дня', distanceKm: 530 },
  { name: 'Пенза', region: 'Пензенская область', deliveryDays: '2–3 дня', distanceKm: 640 },
  { name: 'Чебоксары', region: 'Чувашская Республика', deliveryDays: '2–3 дня', distanceKm: 650 },
  { name: 'Белгород', region: 'Белгородская область', deliveryDays: '1–2 дня', distanceKm: 660 },
  { name: 'Санкт-Петербург', region: 'г. Санкт-Петербург', deliveryDays: '1–2 дня', distanceKm: 700 },
  { name: 'Казань', region: 'Республика Татарстан', deliveryDays: '2–3 дня', distanceKm: 810 },
  { name: 'Саратов', region: 'Саратовская область', deliveryDays: '2–3 дня', distanceKm: 850 },
  { name: 'Ульяновск', region: 'Ульяновская область', deliveryDays: '2–3 дня', distanceKm: 870 },
  { name: 'Киров', region: 'Кировская область', deliveryDays: '2–3 дня', distanceKm: 950 },
  { name: 'Волгоград', region: 'Волгоградская область', deliveryDays: '2–3 дня', distanceKm: 970 },
  { name: 'Тольятти', region: 'Самарская область', deliveryDays: '2–3 дня', distanceKm: 990 },
  { name: 'Петрозаводск', region: 'Республика Карелия', deliveryDays: '2–3 дня', distanceKm: 1000 },
  { name: 'Самара', region: 'Самарская область', deliveryDays: '2–3 дня', distanceKm: 1050 },
  { name: 'Набережные Челны', region: 'Республика Татарстан', deliveryDays: '2–3 дня', distanceKm: 1050 },
  { name: 'Ростов-на-Дону', region: 'Ростовская область', deliveryDays: '2–3 дня', distanceKm: 1070 },
  { name: 'Ижевск', region: 'Удмуртская Республика', deliveryDays: '2–3 дня', distanceKm: 1200 },
  { name: 'Архангельск', region: 'Архангельская область', deliveryDays: '2–3 дня', distanceKm: 1230 },
  { name: 'Калининград', region: 'Калининградская область', deliveryDays: '2–4 дня', distanceKm: 1250 },
  { name: 'Краснодар', region: 'Краснодарский край', deliveryDays: '2–3 дня', distanceKm: 1340 },
  { name: 'Уфа', region: 'Республика Башкортостан', deliveryDays: '2–3 дня', distanceKm: 1350 },
  { name: 'Ставрополь', region: 'Ставропольский край', deliveryDays: '2–3 дня', distanceKm: 1400 },
  { name: 'Астрахань', region: 'Астраханская область', deliveryDays: '2–3 дня', distanceKm: 1400 },
  { name: 'Пермь', region: 'Пермский край', deliveryDays: '2–3 дня', distanceKm: 1430 },
  { name: 'Оренбург', region: 'Оренбургская область', deliveryDays: '2–3 дня', distanceKm: 1450 },
  { name: 'Сочи', region: 'Краснодарский край', deliveryDays: '2–3 дня', distanceKm: 1620 },
  { name: 'Магнитогорск', region: 'Челябинская область', deliveryDays: '2–3 дня', distanceKm: 1700 },
  { name: 'Симферополь', region: 'Республика Крым', deliveryDays: '3–4 дня', distanceKm: 1750 },
  { name: 'Севастополь', region: 'г. Севастополь', deliveryDays: '3–4 дня', distanceKm: 1800 },
  { name: 'Екатеринбург', region: 'Свердловская область', deliveryDays: '2–3 дня', distanceKm: 1780 },
  { name: 'Махачкала', region: 'Республика Дагестан', deliveryDays: '3–4 дня', distanceKm: 1800 },
  { name: 'Челябинск', region: 'Челябинская область', deliveryDays: '2–3 дня', distanceKm: 1910 },
  { name: 'Мурманск', region: 'Мурманская область', deliveryDays: '2–3 дня', distanceKm: 1930 },
  { name: 'Тюмень', region: 'Тюменская область', deliveryDays: '2–3 дня', distanceKm: 2140 },
  // Cities > 2500 km
  { name: 'Омск', region: 'Омская область', deliveryDays: '3–4 дня', distanceKm: 2700 },
  { name: 'Сургут', region: 'ХМАО — Югра', deliveryDays: '3–4 дня', distanceKm: 2900 },
  { name: 'Новосибирск', region: 'Новосибирская область', deliveryDays: '3–4 дня', distanceKm: 3350 },
  { name: 'Барнаул', region: 'Алтайский край', deliveryDays: '3–4 дня', distanceKm: 3600 },
  { name: 'Томск', region: 'Томская область', deliveryDays: '3–4 дня', distanceKm: 3600 },
  { name: 'Кемерово', region: 'Кемеровская область', deliveryDays: '3–4 дня', distanceKm: 3600 },
  { name: 'Новокузнецк', region: 'Кемеровская область', deliveryDays: '3–4 дня', distanceKm: 3750 },
  { name: 'Красноярск', region: 'Красноярский край', deliveryDays: '3–4 дня', distanceKm: 4150 },
  { name: 'Иркутск', region: 'Иркутская область', deliveryDays: '3–5 дней', distanceKm: 5200 },
  { name: 'Улан-Удэ', region: 'Республика Бурятия', deliveryDays: '4–5 дней', distanceKm: 5600 },
  { name: 'Хабаровск', region: 'Хабаровский край', deliveryDays: '4–6 дней', distanceKm: 8400 },
  { name: 'Владивосток', region: 'Приморский край', deliveryDays: '4–6 дней', distanceKm: 9100 },
];

interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  time: string;
  priceNote: string;
  price: number;
}

const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: 'cdek',
    name: 'СДЭК Доставка',
    description: 'До пункта выдачи заказов (ПВЗ) или постамата',
    time: '2–4 дня',
    priceNote: 'от 0 ₽ (по тарифам ТК)',
    price: 0,
  },
  {
    id: 'yandex',
    name: 'Яндекс Доставка',
    description: 'В пункт выдачи Яндекс Маркет или курьером',
    time: '1–2 дня',
    priceNote: 'от 0 ₽ (по тарифам ТК)',
    price: 0,
  },
  {
    id: 'ozon',
    name: 'Ozon Доставка',
    description: 'В удобный пункт выдачи заказов Ozon рядом с домом',
    time: '2–3 дня',
    priceNote: 'от 0 ₽ (по тарифам ТК)',
    price: 0,
  },
  {
    id: 'fivepost',
    name: '5POST (Пятёрочка / Перекрёсток)',
    description: 'Выдача на кассе или в постамате у дома',
    time: '2–4 дня',
    priceNote: 'от 0 ₽ (по тарифам ТК)',
    price: 0,
  },
  {
    id: 'post',
    name: 'Почта России (1 класс)',
    description: 'Ускоренное авиа-отправление по РФ и СНГ',
    time: '3–6 дней',
    priceNote: 'от 0 ₽ (по тарифам ТК)',
    price: 0,
  },
];

export const CheckoutPage: React.FC = () => {
  const { cart, cartTotalPrice, createOrder, user, addSavedAddress } = useShop();
  const navigate = useNavigate();
  const location = useLocation();

  const discountAmount = (location.state as any)?.discountAmount || 0;

  // Form states
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [telegram, setTelegram] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState(() => {
    return localStorage.getItem('user_city') || user?.city || 'Москва';
  });
  const [cityDeliveryDays, setCityDeliveryDays] = useState(() => {
    const saved = localStorage.getItem('user_city') || user?.city || 'Москва';
    const found = RUSSIAN_CITIES.find(c => c.name.toLowerCase() === saved.toLowerCase());
    return found ? found.deliveryDays : '1–2 дня';
  });
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [address, setAddress] = useState(user?.defaultAddress || '');
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption>(DELIVERY_OPTIONS[0]);
  const [selectedPvz, setSelectedPvz] = useState<PvzPoint | null>(null);
  const [pvzDropdownOpen, setPvzDropdownOpen] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Бесплатная доставка от 25 000 ₽ и до 2 500 км от склада в Москве
  const matchedCity = RUSSIAN_CITIES.find(c => c.name.toLowerCase() === city.trim().toLowerCase());
  const cityDistanceKm = matchedCity?.distanceKm ?? 0;
  const isWithinDistance = cityDistanceKm <= 2500;
  const isFreeShipping = cartTotalPrice >= 25000 && isWithinDistance;

  // Loyalty bonus points (default: false - unchecked by default)
  const [bonusPoints, setBonusPoints] = useState<number>(() => {
    return user ? 500 : 0;
  });
  const [useBonusPoints, setUseBonusPoints] = useState<boolean>(false);

  useEffect(() => {
    if (user?.id) {
      const token = localStorage.getItem('maison_auth_token') || '';
      fetch(`/api/loyalty/card?userId=${encodeURIComponent(user.id)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then(r => r.json())
        .then(data => {
          if (data && data.card && data.card.balance !== undefined) {
            setBonusPoints(Number(data.card.balance));
          } else if (data && data.points !== undefined) {
            setBonusPoints(Number(data.points));
          } else if (data && data.balance !== undefined) {
            setBonusPoints(Number(data.balance));
          } else {
            setBonusPoints(500);
          }
        })
        .catch(() => {
          setBonusPoints(500);
        });
    } else {
      setBonusPoints(0);
    }
  }, [user?.id]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cityRef = useRef<HTMLDivElement>(null);
  const pvzInputRef = useRef<HTMLDivElement>(null);

  // Sync city selection dynamically from Header or storage events
  useEffect(() => {
    const syncCity = (e: any) => {
      const saved = e?.detail || localStorage.getItem('user_city');
      if (saved && saved !== city) {
        setCity(saved);
        const found = RUSSIAN_CITIES.find(c => c.name.toLowerCase() === saved.toLowerCase());
        if (found) setCityDeliveryDays(found.deliveryDays);
      }
    };
    window.addEventListener('storage', syncCity);
    window.addEventListener('city-change', syncCity);
    return () => {
      window.removeEventListener('storage', syncCity);
      window.removeEventListener('city-change', syncCity);
    };
  }, [city]);

  // Filter city autocomplete
  const filteredCities = RUSSIAN_CITIES.filter(c =>
    c.name.toLowerCase().includes(city.trim().toLowerCase()) ||
    c.region.toLowerCase().includes(city.trim().toLowerCase())
  ).slice(0, 6);

  // Instant zero-latency PVZ autocomplete across all networks
  const pvzSuggestions = React.useMemo(() => {
    const q = address.trim().toLowerCase();
    const cityNorm = city.trim().toLowerCase();

    // 1. Matches for current city
    let list = INITIAL_PVZ_DATABASE.filter(p =>
      p.city.toLowerCase() === cityNorm ||
      p.city.toLowerCase().includes(cityNorm) ||
      cityNorm.includes(p.city.toLowerCase())
    );

    if (list.length === 0) {
      list = INITIAL_PVZ_DATABASE;
    }

    if (q) {
      list = list.filter(p =>
        p.address.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.networkName.toLowerCase().includes(q) ||
        (p.metro && p.metro.toLowerCase().includes(q))
      );
    }

    return list.slice(0, 10);
  }, [city, address]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setCityDropdownOpen(false);
      }
      if (pvzInputRef.current && !pvzInputRef.current.contains(event.target as Node)) {
        setPvzDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = (c: CityData) => {
    setCity(c.name);
    setCityDeliveryDays(c.deliveryDays);
    setCityDropdownOpen(false);
    localStorage.setItem('user_city', c.name);
    window.dispatchEvent(new CustomEvent('city-change', { detail: c.name }));
  };

  const handleSelectPvzPoint = (p: PvzPoint) => {
    setSelectedPvz(p);
    setCity(p.city);
    setAddress(`${p.networkName} — ${p.address} [${p.workTime}]`);
    setCityDeliveryDays(p.deliveryDays);
    setPvzDropdownOpen(false);

    // Auto-select corresponding delivery option
    const matchOpt = DELIVERY_OPTIONS.find(o =>
      o.id === p.network ||
      (p.network === 'boxberry' && o.id === 'cdek') ||
      (p.network === 'post' && o.id === 'post') ||
      (p.network === 'fivepost' && o.id === 'fivepost')
    );
    if (matchOpt) {
      setSelectedDelivery(matchOpt);
    }
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

  const effectiveDeliveryPrice = 0;
  const maxBonusRedeemable = Math.min(bonusPoints, Math.floor((cartTotalPrice - discountAmount) * 0.3));
  const appliedBonusPoints = useBonusPoints ? maxBonusRedeemable : 0;
  const finalTotal = Math.max(0, cartTotalPrice - discountAmount - appliedBonusPoints);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Укажите ваше имя и фамилию';
    if (!phone.trim() || phone.length < 8) errs.phone = 'Укажите действующий телефон';
    if (!telegram.trim()) errs.telegram = 'Укажите ник в Telegram (@username или номер)';
    if (!city.trim()) errs.city = 'Укажите ваш город';
    if (!address.trim()) errs.address = 'Укажите адрес ПВЗ или улицу/дом';
    if (!agreeTerms) errs.terms = 'Необходимо подтвердить согласие с Пользовательским соглашением и Офертой';
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
      discount: discountAmount + appliedBonusPoints,
      deliveryMethod: `${selectedDelivery.name}${isFreeShipping ? ' (Бесплатно от 25 000 ₽)' : ''}`,
      deliveryPrice: 0,
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

    // 3.1 Deduct bonus points if used
    if (appliedBonusPoints > 0 && user?.id) {
      const token = localStorage.getItem('maison_auth_token') || '';
      fetch('/api/loyalty/use', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId: user.id, amount: appliedBonusPoints, orderId: newOrder.id }),
      }).catch(err => console.warn('Bonus redemption error:', err));
    }

    // 3.2 Send automated Telegram notification directly to admin PM
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
🚚 Доставка: ${selectedDelivery.name} (${isFreeShipping ? 'Бесплатно от 25 000 ₽ (до 2 500 км от МСК)' : 'от 0 ₽ по тарифам ТК'})
🏠 Адрес ПВЗ / доставки: ${address.trim()}
${comment.trim() ? `📝 Комментарий: ${comment.trim()}\n` : ''}
🛒 СОСТАВ ЗАКАЗА:
${itemsFormatted}

💵 Товары: ${cartTotalPrice.toLocaleString('ru-RU')} ₽
${discountAmount > 0 ? `🏷️ Скидка: -${discountAmount.toLocaleString('ru-RU')} ₽\n` : ''}${appliedBonusPoints > 0 ? `💎 Списание бонусов: -${appliedBonusPoints.toLocaleString('ru-RU')} ₽\n` : ''}🚚 Доставка: ${isFreeShipping ? '0 ₽ (Бесплатно от 25 000 ₽)' : 'от 0 ₽ (по тарифам ТК, склад в Москве)'}
${isFreeShipping ? '🎁 Подарок: Фирменный тревел-атомайзер 10 мл + 2 семпла (0 ₽)\n' : ''}💰 ИТОГО: ${finalTotal.toLocaleString('ru-RU')} ₽

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
                    errors.fullName ? 'border-rose-500 bg-rose-50/50' : 'border-zinc-300 focus:border-black bg-white text-zinc-900'
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
                    errors.phone ? 'border-rose-500 bg-rose-50/50' : 'border-zinc-300 focus:border-black bg-white text-zinc-900'
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
                    errors.telegram ? 'border-rose-500 bg-rose-50/50' : 'border-zinc-300 focus:border-black bg-white text-zinc-900'
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
                  className="w-full text-xs px-3.5 py-2.5 rounded-none border border-zinc-300 focus:border-black bg-white text-zinc-900 outline-none"
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
                  Бесплатная доставка от 25 000 ₽ (до 2 500 км)
                </span>
              )}
              {cartTotalPrice >= 25000 && !isWithinDistance && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none bg-amber-100 text-amber-950 border border-amber-300 text-[10px] font-bold uppercase tracking-wider font-mono">
                  Свыше 2 500 км от МСК · Расчет ТК от 0 ₽
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
                      className="px-3 py-1.5 rounded-none bg-white hover:bg-black hover:text-white border border-zinc-300 text-left text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
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
                      errors.city ? 'border-rose-500 bg-rose-50/50' : 'border-zinc-300 focus:border-black bg-white text-zinc-900'
                    }`}
                  />
                  <MapPin className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.city && <div className="text-[11px] text-rose-600 mt-1">{errors.city}</div>}

                {/* Autocomplete Dropdown */}
                {cityDropdownOpen && filteredCities.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-300 shadow-xl z-20 max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200 rounded-none">
                    {filteredCities.map(c => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => handleSelectCity(c)}
                        className="w-full text-left px-3.5 py-2 hover:bg-zinc-100 flex items-center justify-between text-xs border-b border-zinc-100 last:border-b-0 cursor-pointer"
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-950">
                  Служба доставки:
                </label>
                <span className="text-[11px] font-bold text-zinc-800 bg-amber-50 px-2 py-0.5 border border-amber-200">
                  📦 Склад в Москве · Доставка от 0 ₽
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mb-2 font-light">
                Стоимость доставки от 0 ₽ — зависит от расстояния и выбранной компании доставки.
              </p>
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
                        {isFreeShipping ? (
                          <span className="text-[#5A6B32] uppercase">Бесплатно</span>
                        ) : (
                          <span className="text-zinc-700">{opt.priceNote}</span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Address / PVZ Input with Instant Autocomplete for all companies */}
            <div ref={pvzInputRef} className="pt-2 relative space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>Адрес пункта выдачи (ПВЗ всех компаний) или адрес доставки *</span>
                </label>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Яндекс Маркет · СДЭК · Ozon · Boxberry · 5POST · Почта РФ
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder={`Начните вводить улицу или ПВЗ в г. ${city} (напр. Ленина, Мира, Тверская)...`}
                  value={address}
                  onFocus={() => setPvzDropdownOpen(true)}
                  onChange={e => {
                    setAddress(e.target.value);
                    setPvzDropdownOpen(true);
                  }}
                  className={`w-full text-xs px-3.5 py-3 rounded-none border outline-none pr-9 ${
                    errors.address ? 'border-rose-500 bg-rose-50/50' : 'border-zinc-300 focus:border-black bg-white text-zinc-900 shadow-xs'
                  }`}
                />
                <MapPin className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.address && <div className="text-[11px] text-rose-600 mt-1">{errors.address}</div>}

              {/* Instant PVZ Suggestions Dropdown */}
              {pvzDropdownOpen && pvzSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-300 shadow-2xl z-30 max-h-72 overflow-y-auto divide-y divide-zinc-100 animate-in fade-in slide-in-from-top-1 duration-200 rounded-none">
                  <div className="px-3.5 py-2 bg-zinc-50 text-[10px] font-bold uppercase text-zinc-600 tracking-wider flex items-center justify-between sticky top-0 z-10 border-b border-zinc-200">
                    <span>Пункты выдачи в г. {city} (все службы)</span>
                    <span className="text-zinc-400 font-mono">{pvzSuggestions.length} предложений</span>
                  </div>
                  {pvzSuggestions.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPvzPoint(p)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-zinc-50 transition-colors flex items-start justify-between gap-3 cursor-pointer group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-none font-mono ${
                              p.network === 'yandex'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : p.network === 'cdek'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : p.network === 'fivepost'
                                ? 'bg-orange-100 text-orange-900 border border-orange-300'
                                : 'bg-zinc-200 text-zinc-800'
                            }`}
                          >
                            {p.networkName}
                          </span>
                          <span className="text-xs font-bold text-zinc-900 group-hover:text-black">
                            {p.name}
                          </span>
                          {p.metro && (
                            <span className="text-[10px] text-zinc-500 font-mono">
                              м. {p.metro}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-600 mt-0.5 truncate">
                          {p.address}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          {p.workTime} · {p.deliveryDays}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase text-black shrink-0 border border-zinc-300 group-hover:border-black group-hover:bg-black group-hover:text-white px-2 py-1 transition-colors self-center">
                        Выбрать
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected PVZ Card Highlight */}
            {selectedPvz && (
              <div className="p-3.5 bg-zinc-950 text-white border border-black flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-amber-400 text-black font-bold">
                      {selectedPvz.networkName}
                    </span>
                    <span className="text-xs font-bold truncate">{selectedPvz.name}</span>
                  </div>
                  <div className="text-[11px] text-zinc-300 mt-0.5 truncate">{selectedPvz.address}</div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    {selectedPvz.workTime} · Срок: {selectedPvz.deliveryDays} · от 0 ₽
                  </div>
                </div>
                <div className="px-2.5 py-1 bg-emerald-600 text-white font-mono text-[10px] uppercase font-bold shrink-0 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Выбрано
                </div>
              </div>
            )}

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
                className="w-full text-xs px-3.5 py-2 rounded-none border border-zinc-300 focus:border-black bg-white text-zinc-900 outline-none"
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

            {/* Loyalty bonus redemption */}
            {user ? (
              <div className="p-3.5 bg-zinc-900 text-white space-y-2 border border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">Программа лояльности</span>
                  </div>
                  <span className="text-xs font-mono text-amber-300 font-bold">{bonusPoints} баллов</span>
                </div>
                {bonusPoints > 0 ? (
                  <label className="flex items-start gap-2.5 pt-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useBonusPoints}
                      onChange={e => setUseBonusPoints(e.target.checked)}
                      className="mt-0.5 accent-amber-500 rounded-none w-4 h-4 shrink-0"
                    />
                    <div className="text-[11px] leading-snug">
                      <span className="font-bold text-white block">Списать баллы на этот заказ</span>
                      <span className="text-zinc-400 text-[10px]">
                        Доступно к списанию до 30%: <strong className="text-white font-mono">{maxBonusRedeemable} ₽</strong> (1 балл = 1 ₽)
                      </span>
                    </div>
                  </label>
                ) : (
                  <p className="text-[10px] text-zinc-400 leading-tight">
                    Баллы будут начислены после завершения этого заказа (кэшбэк от 5% до 10%).
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 bg-zinc-100 border border-zinc-200 text-[11px] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-zinc-700">
                  <Coins className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Кэшбэк до 10% и 500 приветственных баллов</span>
                </div>
                <Link to="/auth?mode=login" className="text-black font-bold uppercase text-[10px] underline shrink-0 hover:text-zinc-700">
                  Войти
                </Link>
              </div>
            )}

            {/* Price Calculations */}
            <div className="space-y-2 pt-4 border-t border-zinc-200 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Товары ({cart.reduce((a, b) => a + b.quantity, 0)} шт.)</span>
                <span className="font-mono text-zinc-950">{cartTotalPrice.toLocaleString('ru-RU')} ₽</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-zinc-900 font-bold">
                  <span>Скидка</span>
                  <span className="font-mono text-emerald-600">−{discountAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}

              {appliedBonusPoints > 0 && (
                <div className="flex justify-between text-zinc-900 font-bold">
                  <span className="flex items-center gap-1 text-amber-800">
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    Оплата бонусами
                  </span>
                  <span className="font-mono text-amber-700">−{appliedBonusPoints.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}

              <div className="flex justify-between items-center text-zinc-600">
                <span>Доставка ({selectedDelivery.name})</span>
                <span className="font-mono text-zinc-950 font-bold">
                  {isFreeShipping ? '0 ₽ (Бесплатно)' : 'от 0 ₽'}
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 font-light leading-snug">
                * Склад в Москве. Окончательный тариф доставки (от 0 ₽) рассчитывается по тарифам ТК.
              </div>

              <div className="pt-3 border-t border-zinc-200 flex justify-between text-base font-bold text-zinc-950">
                <span className="uppercase tracking-wider">Итого к оплате:</span>
                <span className="font-mono text-lg">{finalTotal.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>

            {/* Legal Consent Checkbox (152-ФЗ и Оферта) */}
            <div className="space-y-1 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-zinc-600 select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 accent-black rounded-none w-4 h-4 shrink-0"
                />
                <span className="leading-tight text-[11px]">
                  Я подтверждаю заказ и принимаю условия{' '}
                  <Link to="/terms" target="_blank" className="text-zinc-950 underline hover:text-black font-semibold">
                    Пользовательского соглашения
                  </Link>
                  ,{' '}
                  <Link to="/offer" target="_blank" className="text-zinc-950 underline hover:text-black font-semibold">
                    Публичной оферты
                  </Link>{' '}
                  и даю согласие на{' '}
                  <Link to="/privacy" target="_blank" className="text-zinc-950 underline hover:text-black font-semibold">
                    обработку персональных данных (152-ФЗ)
                  </Link>
                  .
                </span>
              </label>
              {errors.terms && <div className="text-[11px] text-rose-600 pl-6">{errors.terms}</div>}
            </div>

            {/* Primary Telegram Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting || !agreeTerms}
              className="w-full py-4 bg-black hover:bg-zinc-800 text-white rounded-none text-xs font-bold uppercase tracking-widest text-center transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
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
