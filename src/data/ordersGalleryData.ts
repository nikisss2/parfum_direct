export interface OrderReport {
  id: string;
  orderNumber: string;
  customerName: string;
  city: string;
  title: string;
  description: string;
  items: string[];
  imageUrl: string;
  deliveryService: string;
  badge: string;
  date: string;
  status: string;
  filterType: 'all' | 'decant' | 'bottle' | 'box';
}

export const ORDERS_GALLERY: OrderReport[] = [
  {
    id: 'ord-1',
    orderNumber: '№84920',
    customerName: 'Екатерина',
    city: 'Москва',
    title: 'Сет премиальных отливантов в металлических флаконах',
    description: '4 аромата по 10 мл: Ganymede, Baccarat 540, Fleur Narcotique, Delina. Индивидуальные ламинированные этикетки и подарочный дорожный спрей.',
    items: [
      'Marc-Antoine Barrois Ganymede — 10 мл',
      'Maison Francis Kurkdjian Baccarat Rouge 540 — 10 мл',
      'Ex Nihilo Fleur Narcotique — 10 мл',
      'Parfums de Marly Delina — 10 мл'
    ],
    imageUrl: '/assets/gallery/order-decants.jpg',
    deliveryService: 'СДЭК (1 день, ПВЗ Ленина)',
    badge: 'Распив 4×10 мл',
    date: 'Вчера, 18:40',
    status: 'Фотоконтроль пройден',
    filterType: 'decant'
  },
  {
    id: 'ord-2',
    orderNumber: '№84935',
    customerName: 'Александр',
    city: 'Санкт-Петербург',
    title: 'Полноразмерный флакон Creed Aventus 100 мл',
    description: 'Оригинальный запечатанный флакон с европейским батч-кодом. Свежая партия, фото коробки и серийного номера со всех ракурсов перед отправкой.',
    items: [
      'Creed Aventus 100 мл (Eau de Parfum)',
      'Фирменный блоттер Creed в подарок'
    ],
    imageUrl: '/assets/gallery/order-aventus.jpg',
    deliveryService: 'Яндекс Доставка (2 дня)',
    badge: 'Оригинал 100 мл',
    date: '2 дня назад',
    status: 'Фото выслано в Telegram',
    filterType: 'bottle'
  },
  {
    id: 'ord-3',
    orderNumber: '№84912',
    customerName: 'Михаил',
    city: 'Казань',
    title: 'Восточная селекция Lattafa Khamrah & French Avenue',
    description: 'Флакон Khamrah и набор тревел-отливантов пряных арабских бестселлеров в фирменном крафтовом боксе с древесной стружкой.',
    items: [
      'Lattafa Khamrah 100 мл',
      'French Avenue Royal Blend — 10 мл',
      'Семпл French Avenue After Effect в подарок'
    ],
    imageUrl: '/assets/gallery/order-arabian.jpg',
    deliveryService: 'СДЭК Доставка (2 дня)',
    badge: 'Арабская селекция',
    date: '3 дня назад',
    status: 'Фотоконтроль пройден',
    filterType: 'bottle'
  },
  {
    id: 'ord-4',
    orderNumber: '№84944',
    customerName: 'Алина',
    city: 'Екатеринбург',
    title: 'Персональный Aroma Box на 6 нишевых ароматов',
    description: 'Собран в интерактивном конструкторе на сайте со скидкой 15%. Черная бархатная коробка на магните с тиснением и открыткой.',
    items: [
      'French Avenue After Effect — 5 мл',
      'Marc-Antoine Barrois Ganymede — 5 мл',
      'Amouage Guidance — 5 мл',
      'Tom Ford Tobacco Vanille — 5 мл',
      'Xerjoff Erba Pura — 5 мл',
      'Byredo Blanche — 5 мл'
    ],
    imageUrl: '/assets/gallery/order-aftereffect.jpg',
    deliveryService: '5POST (3 дня, пункт у дома)',
    badge: 'Aroma Box (6 шт.)',
    date: '4 дня назад',
    status: 'Фото выслано в Telegram',
    filterType: 'box'
  },
  {
    id: 'ord-5',
    orderNumber: '№84951',
    customerName: 'Дмитрий',
    city: 'Краснодар',
    title: 'Tom Ford Tobacco Vanille & Lost Cherry',
    description: 'Два культовых аромата в стеклянных флаконах по 15 мл с металлическими спреями. Взвешивание на ювелирных весах перед упаковкой.',
    items: [
      'Tom Ford Tobacco Vanille — 15 мл',
      'Tom Ford Lost Cherry — 15 мл',
      'Блоттер Tom Ford Oud Wood'
    ],
    imageUrl: '/assets/gallery/order-bottles.jpg',
    deliveryService: 'СДЭК (2 дня)',
    badge: 'Tom Ford Дуэт',
    date: '5 дней назад',
    status: 'Фотоконтроль пройден',
    filterType: 'decant'
  },
  {
    id: 'ord-6',
    orderNumber: '№84958',
    customerName: 'Елена',
    city: 'Новосибирск',
    title: 'Флакон и дорожный отливант Amouage Guidance',
    description: 'Оригинальный полноразмерный флакон оманского дома Amouage + металлический тревел-спрей 10 мл для сумочки.',
    items: [
      'Amouage Guidance 100 мл (Оригинал, Оман)',
      'Amouage Guidance — 10 мл (Тревел-спрей)'
    ],
    imageUrl: '/assets/gallery/order-guidance.jpg',
    deliveryService: 'Почта России 1 класс (3 дня)',
    badge: 'Amouage Оман',
    date: '6 дней назад',
    status: 'Фото выслано в Telegram',
    filterType: 'bottle'
  },
  {
    id: 'ord-7',
    orderNumber: '№84962',
    customerName: 'Сергей',
    city: 'Самара',
    title: 'French Avenue Royal Blend Bourbon 100 мл',
    description: 'Роскошный коньячный флакон в тяжелом хрустале с металлической крышкой. Дополнительная термозащитная упаковка.',
    items: [
      'French Avenue Royal Blend Bourbon 100 мл',
      'Пробник Lattafa Khamrah Qahwa (2 мл)'
    ],
    imageUrl: '/assets/gallery/order-royalblend.jpg',
    deliveryService: 'СДЭК Доставка (2 дня)',
    badge: 'Эксклюзив',
    date: 'Неделю назад',
    status: 'Фотоконтроль пройден',
    filterType: 'bottle'
  },
  {
    id: 'ord-8',
    orderNumber: '№84969',
    customerName: 'Ольга',
    city: 'Нижний Новгород',
    title: 'Marc-Antoine Barrois Ganymede 100 мл',
    description: 'Главный бестселлер минерально-замшевой ниши. Оригинальная коробка с нетронутой слюдой, проверка батч-кода при клиенте.',
    items: [
      'Marc-Antoine Barrois Ganymede 100 мл',
      '2 семпла селектива в подарок'
    ],
    imageUrl: '/assets/gallery/order-ganymede.jpg',
    deliveryService: 'Яндекс Доставка (1 день)',
    badge: 'Бестселлер',
    date: '8 дней назад',
    status: 'Фотоконтроль пройден',
    filterType: 'bottle'
  },
  {
    id: 'ord-9',
    orderNumber: '№84975',
    customerName: 'Иван',
    city: 'Ростов-на-Дону',
    title: 'Сет тревел-спреев 5×5 мл со шприцевым распивом',
    description: 'Мужская подборка: Creed Aventus, Sauvage Elixir, Layton, Oud Wood, Terre d’Hermes. Прочные ударопрочные флаконы с четким распылителем.',
    items: [
      'Creed Aventus — 5 мл',
      'Dior Sauvage Elixir — 5 мл',
      'Parfums de Marly Layton — 5 мл',
      'Tom Ford Oud Wood — 5 мл',
      'Hermes Terre d’Hermes — 5 мл'
    ],
    imageUrl: '/assets/gallery/order-dispatch.jpg',
    deliveryService: 'СДЭК (2 дня)',
    badge: 'Мужской сет',
    date: '9 дней назад',
    status: 'Фото выслано в Telegram',
    filterType: 'decant'
  },
  {
    id: 'ord-10',
    orderNumber: '№84982',
    customerName: 'Мария',
    city: 'Владивосток',
    title: 'Amouage Reflection Man + Thomas Kosmala No 4',
    description: 'Комбинированный заказ в Приморский край: полноразмерный Reflection Man и тревел 10 мл Après l’Amour. Усиленная пятислойная упаковка.',
    items: [
      'Amouage Reflection Man 100 мл',
      'Thomas Kosmala No 4 Après l’Amour — 10 мл',
      'Фирменный тревел-атомайзер 5 мл (0 ₽)'
    ],
    imageUrl: '/assets/gallery/order-reflection.jpg',
    deliveryService: 'Почта России Авиа (4 дня)',
    badge: 'Дальний Восток',
    date: '10 дней назад',
    status: 'Фотоконтроль пройден',
    filterType: 'bottle'
  }
];
