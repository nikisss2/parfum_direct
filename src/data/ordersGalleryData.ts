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
    title: 'Сет премиальных отливантов и упаковка',
    description: 'Индивидуальные флаконы с металлическими спреями, ламинированными этикетками и фирменной бархатной упаковкой Maison Arôme.',
    items: [
      'Marc-Antoine Barrois Ganymede — 10 мл',
      'Maison Francis Kurkdjian Baccarat Rouge 540 — 10 мл',
      'Ex Nihilo Fleur Narcotique — 10 мл',
      'Фирменный бархатный мешочек в подарок'
    ],
    imageUrl: '/assets/gallery/real-order-01.jpg',
    deliveryService: 'СДЭК (1 день, ПВЗ Тверская)',
    badge: 'Распив 3×10 мл',
    date: 'Вчера, 18:40',
    status: 'Фотоконтроль пройден',
    filterType: 'decant'
  },
  {
    id: 'ord-2',
    orderNumber: '№84935',
    customerName: 'Александр',
    city: 'Санкт-Петербург',
    title: 'Полноразмерный запечатанный флакон с батч-кодом',
    description: 'Оригинальный заводской флакон с европейским батч-кодом. Проверка со всех ракурсов и фотоотчет перед запечатыванием в посылку.',
    items: [
      'Creed Aventus 100 мл (Оригинал)',
      'Пробник селектива в подарок'
    ],
    imageUrl: '/assets/gallery/real-order-02.jpg',
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
    title: 'Восточная селекция и дорожные атомайзеры',
    description: 'Премиальные стеклянные атомайзеры с защитными металлическими капсулами. Заправка шприцем без контакта с воздухом.',
    items: [
      'French Avenue Royal Blend — 10 мл',
      'Lattafa Khamrah Qahwa — 10 мл',
      'Фирменные блоттеры'
    ],
    imageUrl: '/assets/gallery/real-order-03.jpg',
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
    title: 'Подарочный бокс с нишевыми ароматами',
    description: 'Собран в фирменном боксе Maison Arôme с наполнителем, лентой и открыткой с пожеланиями.',
    items: [
      'Marc-Antoine Barrois Ganymede — 5 мл',
      'Amouage Guidance — 5 мл',
      'Tom Ford Tobacco Vanille — 5 мл',
      'Byredo Blanche — 5 мл'
    ],
    imageUrl: '/assets/gallery/real-order-04.jpg',
    deliveryService: '5POST (3 дня)',
    badge: 'Aroma Box (4 шт.)',
    date: '4 дня назад',
    status: 'Фото выслано в Telegram',
    filterType: 'box'
  },
  {
    id: 'ord-5',
    orderNumber: '№84951',
    customerName: 'Дмитрий',
    city: 'Краснодар',
    title: 'Точный распив на ювелирных весах',
    description: 'Контроль объема на прецизионных весах перед упаковкой. Прозрачные стеклянные флаконы с надежным микроспреем.',
    items: [
      'Tom Ford Tobacco Vanille — 15 мл',
      'Tom Ford Lost Cherry — 15 мл'
    ],
    imageUrl: '/assets/gallery/real-order-05.jpg',
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
    title: 'Собрано на складе: оригинальные селективные духи',
    description: 'Контрольная проверка батч-кода на официальных базах перед упаковкой в многослойную пупырчатую пленку.',
    items: [
      'Amouage Guidance 100 мл (Оригинал, Оман)',
      'Дорожный тревел-спрей 5 мл'
    ],
    imageUrl: '/assets/gallery/real-order-06.jpg',
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
    title: 'Флакон в фирменном крафтовом боксе Maison Arôme',
    description: 'Защищенная отправка в усиленной картонной коробке с термозащитой для безопасной транспортировки в любой регион.',
    items: [
      'French Avenue Royal Blend Bourbon 100 мл',
      'Семпл нишевого парфюма в подарок'
    ],
    imageUrl: '/assets/gallery/real-order-07.jpg',
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
    title: 'Комплект флаконов перед передачей в курьерскую службу',
    description: 'Финишный фотоотчет посылки перед наклейкой штрихкода СДЭК и отправкой покупателю.',
    items: [
      'Marc-Antoine Barrois Ganymede 100 мл',
      'Тревел-отливант Thomas Kosmala No 4 (10 мл)'
    ],
    imageUrl: '/assets/gallery/real-order-08.jpg',
    deliveryService: 'Яндекс Доставка (1 день)',
    badge: 'Бестселлер',
    date: '8 дней назад',
    status: 'Фотоконтроль пройден',
    filterType: 'bottle'
  }
];
