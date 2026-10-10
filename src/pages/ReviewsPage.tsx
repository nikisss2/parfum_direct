import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  CheckCircle2,
  ShieldCheck,
  Camera,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Filter,
  Package,
  Award,
  X
} from 'lucide-react';

interface ReviewItem {
  id: string;
  author: string;
  city: string;
  date: string;
  rating: number;
  fragrances: string[];
  type: 'decant' | 'bottle' | 'box';
  comment: string;
  hasPhoto: boolean;
  photoUrl?: string;
  photoCaption?: string;
  likes: number;
  adminReply?: string;
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    author: 'Екатерина В.',
    city: 'Москва',
    date: 'Вчера, 18:40',
    rating: 5,
    fragrances: ['Marc-Antoine Barrois Ganymede (10 мл)', 'Baccarat Rouge 540 (5 мл)'],
    type: 'decant',
    comment:
      'Заказываю здесь уже в третий раз! Прислали фото готовых отливантов в Telegram буквально через 40 минут после заявки. Атомайзеры шикарные, тяжелые, металл с очень мелким и аккуратным распылением (не брызгают струей). Ганимед — 100% оригинал, шлейф на весь офис до самого вечера. Спасибо за пробник Tom Ford в подарок!',
    hasPhoto: true,
    photoUrl: '/assets/gallery/order-decants.jpg',
    photoCaption: 'Атомайзеры 10 и 5 мл с фирменными этикетками и подарочным спреем',
    likes: 42,
    adminReply:
      'Екатерина, большое спасибо за доверие и теплые слова! Носите с удовольствием, всегда рады собрать для вас новые ароматы!'
  },
  {
    id: 'rev-2',
    author: 'Александр М.',
    city: 'Санкт-Петербург',
    date: '2 дня назад',
    rating: 5,
    fragrances: ['Creed Aventus (100 мл флакон)', 'Creed Absolu Aventus (10 мл)'],
    type: 'bottle',
    comment:
      'Брал полный флакон Creed Aventus. Был скепсис насчет оригинальности, пока менеджер не прислал подробные фото флакона и коробки со всех ракурсов. Доехало СДЭКом в СПб за 2 дня. Упаковано намертво в 5 слоев пупырки. Авентус безупречный, свежий и дымный.',
    hasPhoto: true,
    photoUrl: '/assets/gallery/order-bottles.jpg',
    photoCaption: 'Флакон Creed перед отправкой в Санкт-Петербург',
    likes: 29
  },
  {
    id: 'rev-3',
    author: 'Дарья К.',
    city: 'Екатеринбург',
    date: '3 дня назад',
    rating: 5,
    fragrances: ['Аромабокс «Восточная сказка» (5 ароматов по 5 мл)'],
    type: 'box',
    comment:
      'Собрала свой собственный аромабокс в конструкторе на сайте! Взяла Lattafa Khamrah, French Avenue Royal Blend, Amouage Guidance, After Effect и Club de Nuit. Коробка просто премиум качества — магнитный клапан, бархатный ложемент, открытка с моим текстом. И главное скидка 15% получилась. Доставка в Екб заняла всего 3 дня!',
    hasPhoto: true,
    photoUrl: '/assets/gallery/order-arabian.jpg',
    photoCaption: 'Аромабокс на 5 селективных ароматов в черной подарочной коробке',
    likes: 38,
    adminReply: 'Дарья, спасибо! Этот восточный сет — настоящий бестселлер сезона.'
  },
  {
    id: 'rev-4',
    author: 'Максим Т.',
    city: 'Казань',
    date: '5 дней назад',
    rating: 5,
    fragrances: ['Tom Ford Tobacco Vanille (10 мл)', 'Tom Ford Oud Wood (10 мл)'],
    type: 'decant',
    comment:
      'Идеальное решение, чтобы не отдавать 40 тысяч за флаконы, которые потом будут стоять на полке. Отливанты приехали в идеале. Стойкость табакованили — двое суток на свитере. Отдельный респект за то, что оплата только ПОСЛЕ того, как прислали фото флаконов с весами.',
    hasPhoto: true,
    photoUrl: '/assets/gallery/order-dispatch.jpg',
    photoCaption: 'Надежная упаковка посылки перед сдачей в курьерскую службу СДЭК',
    likes: 21
  },
  {
    id: 'rev-5',
    author: 'Алина С.',
    city: 'Краснодар',
    date: 'Неделю назад',
    rating: 5,
    fragrances: ['Parfums de Marly Delina (5 мл)', 'Byredo Blanche (5 мл)', 'Ex Nihilo Fleur Narcotique (5 мл)'],
    type: 'decant',
    comment:
      'Подарила себе любимой на день рождения набор отливантов. Все стеклянные колбы целые, плотно закрыты, ни капли не протекло в пути. Настоящий оригинальный парфюм, с магазинными тестерами в ЗЯ совпадает на 100%. Буду советовать подругам!',
    hasPhoto: false,
    likes: 17
  },
  {
    id: 'rev-6',
    author: 'Илья Р.',
    city: 'Новосибирск',
    date: '8 дней назад',
    rating: 5,
    fragrances: ['Armaf Club de Nuit Intense Man (105 мл флакон)'],
    type: 'bottle',
    comment:
      'Заказывал вслепую по рекомендациям. Флакон пришел оригинальный, тяжелый, с цепочкой и камнями на крышке. Стойкость монструозная! В Сибирь доехало за 4 дня. Сервис на высоте, менеджер отвечал даже в 9 вечера.',
    hasPhoto: false,
    likes: 14
  },
  {
    id: 'rev-7',
    author: 'Виктория Д.',
    city: 'Нижний Новгород',
    date: '10 дней назад',
    rating: 5,
    fragrances: ['Xerjoff Erba Pura (5 мл)', 'Amouage Guidance (5 мл)'],
    type: 'decant',
    comment:
      'Гайданс — это разрыв сердечка, один пшик держится уже сутки! Очень порадовало, что этикетки не бумажные самоклейки, а аккуратные полиграфические с защитным покрытием, надписи не стираются в сумке.',
    hasPhoto: true,
    photoUrl: '/assets/gallery/order-decants.jpg',
    photoCaption: 'Коллекция тревел-атомайзеров для сумки',
    likes: 25
  },
  {
    id: 'rev-8',
    author: 'Артем К.',
    city: 'Сочи',
    date: '2 недели назад',
    rating: 5,
    fragrances: ['Le Labo Santal 33 (10 мл)', 'Initio Oud for Greatness (5 мл)'],
    type: 'decant',
    comment:
      'Первый раз брал распив в интернете, сильно переживал за подделки. Но здесь все максимально честно: показали шприц, флакон, процесс распива. Ароматы подлинные 100%. Буду постоянным клиентом.',
    hasPhoto: false,
    likes: 19
  }
];

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'photo' | 'decant' | 'bottle' | 'box'>('all');
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; caption?: string } | null>(null);

  // Form states for new review
  const [formName, setFormName] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formFragrance, setFormFragrance] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const toggleLike = (id: string) => {
    setLikedReviews(prev => {
      const isLiked = !!prev[id];
      setReviews(curr =>
        curr.map(r => (r.id === id ? { ...r, likes: isLiked ? r.likes - 1 : r.likes + 1 } : r))
      );
      return { ...prev, [id]: !isLiked };
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formComment.trim()) return;

    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: formName.trim(),
      city: formCity.trim() || 'Москва',
      date: 'Только что',
      rating: formRating,
      fragrances: formFragrance ? [formFragrance.trim()] : ['Парфюмерный сет'],
      type: 'decant',
      comment: formComment.trim(),
      hasPhoto: false,
      likes: 1,
    };

    setReviews([newRev, ...reviews]);
    setFormSuccess(true);
    setTimeout(() => {
      setModalOpen(false);
      setFormSuccess(false);
      setFormName('');
      setFormCity('');
      setFormFragrance('');
      setFormComment('');
    }, 1800);
  };

  const filteredReviews = reviews.filter(r => {
    if (activeFilter === 'photo') return r.hasPhoto;
    if (activeFilter === 'decant') return r.type === 'decant';
    if (activeFilter === 'bottle') return r.type === 'bottle';
    if (activeFilter === 'box') return r.type === 'box';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 sm:space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500">
        <Link to="/" className="hover:text-zinc-900 transition-colors">Главная</Link>
        <span>/</span>
        <span className="text-zinc-900 font-medium">Отзывы покупателей</span>
      </nav>

      {/* Hero Social Proof Banner */}
      <div className="rounded-none bg-zinc-950 text-white p-6 sm:p-10 lg:p-12 relative overflow-hidden border border-zinc-900">
        <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-800/20 rounded-none pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Big score and summary */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none border border-zinc-800 bg-white/5 text-[11px] font-bold uppercase tracking-widest text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Честные отзывы реальных покупателей</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal font-serif tracking-tight leading-tight">
              Отзывы о Maison Arôme
            </h1>
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-xl font-light">
              Мы гордимся доверием наших клиентов. Каждый отзыв проходит проверку: мы публикуем реальные впечатления о стойкости, оригинальности и скорости доставки по всей России.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => setModalOpen(true)}
                className="px-7 py-4 rounded-none bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-zinc-900" />
                <span>Оставить свой отзыв</span>
              </button>
              <Link
                to="/catalog"
                className="px-7 py-4 rounded-none border border-white/30 hover:border-white bg-transparent text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <span>Перейти в каталог</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Score Breakdown */}
          <div className="lg:col-span-5 bg-zinc-900/80 border border-zinc-800 rounded-none p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <div className="text-4xl sm:text-5xl font-serif text-white">4.9</div>
                <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">из 5.0 на основе 1 420+ заказов</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1 uppercase tracking-wider">
                  98.6% рекомендуют нас
                </div>
              </div>
            </div>

            {/* Stars Bar Chart */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-14 text-zinc-400 font-medium">5 звезд</span>
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-none overflow-hidden">
                  <div className="h-full bg-white rounded-none w-[94%]" />
                </div>
                <span className="w-10 text-right text-zinc-300 font-bold">94%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-14 text-zinc-400 font-medium">4 звезды</span>
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-none overflow-hidden">
                  <div className="h-full bg-zinc-400 rounded-none w-[5%]" />
                </div>
                <span className="w-10 text-right text-zinc-300 font-bold">5%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-14 text-zinc-400 font-medium">3 звезды</span>
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-none overflow-hidden">
                  <div className="h-full bg-zinc-600 rounded-none w-[1%]" />
                </div>
                <span className="w-10 text-right text-zinc-300 font-bold">1%</span>
              </div>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-3 text-[11px] text-zinc-300 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% оригинал</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Фото перед оплатой</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Все отзывы (1 420)' },
            { id: 'photo', label: 'С фото распаковки (642)' },
            { id: 'decant', label: 'Распивы (980)' },
            { id: 'bottle', label: 'Флаконы (320)' },
            { id: 'box', label: 'Аромабоксы (120)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-4 py-2.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all border ${
                activeFilter === tab.id
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-black hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="text-xs font-bold uppercase tracking-widest text-black hover:text-zinc-600 transition-colors flex items-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Написать отзыв</span>
        </button>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReviews.map(review => (
          <div
            key={review.id}
            className="p-6 rounded-none bg-white border border-zinc-200 hover:border-black transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header with name, stars, date */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-950 uppercase tracking-wide">{review.author}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none border border-zinc-200 bg-zinc-50 text-zinc-800 text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Покупатель
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">
                    г. {review.city} · {review.date}
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>

              {/* Fragrances tags */}
              {review.fragrances.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {review.fragrances.map((frag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-none border border-zinc-200 bg-zinc-50 text-zinc-800 text-[10px] font-bold uppercase tracking-wider"
                    >
                      {frag}
                    </span>
                  ))}
                </div>
              )}

              {/* Comment text */}
              <p className="mt-3.5 text-xs sm:text-sm text-zinc-700 leading-relaxed font-light">
                {review.comment}
              </p>

              {/* Attached Photo */}
              {review.hasPhoto && review.photoUrl && (
                <div className="mt-4">
                  <div
                    onClick={() => setPreviewPhoto({ url: review.photoUrl!, caption: review.photoCaption })}
                    className="group relative cursor-pointer aspect-video max-w-sm rounded-none overflow-hidden border border-zinc-200 bg-zinc-100"
                  >
                    <img
                      src={review.photoUrl}
                      alt={review.photoCaption || 'Фото распаковки заказа'}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-[10px] text-white font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" />
                        Увеличить фото
                      </span>
                    </div>
                  </div>
                  {review.photoCaption && (
                    <div className="text-[11px] text-zinc-500 mt-1.5 font-light">
                      {review.photoCaption}
                    </div>
                  )}
                </div>
              )}

              {/* Admin reply if any */}
              {review.adminReply && (
                <div className="mt-4 p-4 rounded-none bg-zinc-50 border-l-2 border-black text-xs space-y-1">
                  <div className="font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="w-3 h-3 text-black" />
                    Ответ Maison Arôme:
                  </div>
                  <div className="text-zinc-600 leading-relaxed font-light">{review.adminReply}</div>
                </div>
              )}
            </div>

            {/* Footer with Like button */}
            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
              <span className="text-[10px] uppercase tracking-wider">Заказ проверен службой качества</span>
              <button
                onClick={() => toggleLike(review.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none border text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  likedReviews[review.id]
                    ? 'border-black bg-black text-white'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:border-black'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{review.likes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-none max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-zinc-900">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-none hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {formSuccess ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 bg-zinc-100 text-black border border-zinc-900 rounded-none flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-normal font-serif text-zinc-900 uppercase tracking-wider">Спасибо за ваш отзыв!</h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto font-light">
                  Ваш отзыв успешно отправлен и появится на сайте после быстрой проверки модератором.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <h3 className="text-xl font-normal font-serif text-zinc-950 uppercase tracking-wide">Оставить отзыв</h3>
                  <p className="text-xs text-zinc-500 mt-1 font-light">
                    Поделитесь вашими впечатлениями об аромате и скорости сборки заказа
                  </p>
                </div>

                {/* Rating Stars Selection */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                    Ваша оценка:
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        className="p-1 hover:scale-105 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= formRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-zinc-200 fill-zinc-100'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 ml-2">
                      {formRating === 5
                        ? 'Отлично (5/5)'
                        : formRating === 4
                        ? 'Хорошо (4/5)'
                        : `${formRating} из 5`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Ваше имя *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Анна"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Город
                    </label>
                    <input
                      type="text"
                      placeholder="Москва"
                      value={formCity}
                      onChange={e => setFormCity(e.target.value)}
                      className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Заказанный аромат / Аромабокс
                  </label>
                  <input
                    type="text"
                    placeholder="Например: Creed Aventus (10 мл)"
                    value={formFragrance}
                    onChange={e => setFormFragrance(e.target.value)}
                    className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Текст отзыва *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Опишите стойкость аромата, качество атомайзера, упаковку..."
                    value={formComment}
                    onChange={e => setFormComment(e.target.value)}
                    className="w-full text-xs px-3.5 py-3 rounded-none border border-zinc-300 outline-none focus:border-black transition-colors"
                  />
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-none text-[11px] text-zinc-600 flex items-start gap-2">
                  <Camera className="w-4 h-4 text-zinc-800 shrink-0 mt-0.5" />
                  <span>
                    Фотографии распаковки и флаконов можно также прислать нашему менеджеру в Telegram для начисления 500 бонусных баллов!
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-black hover:bg-zinc-800 text-white rounded-none text-xs font-bold uppercase tracking-widest shadow-sm transition-all"
                >
                  Опубликовать отзыв
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Photo Preview */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in cursor-zoom-out"
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute -top-10 right-0 text-white hover:text-zinc-300 transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewPhoto.url}
              alt="Увеличенное фото отзыва"
              className="max-h-[80vh] w-auto rounded-none shadow-2xl object-contain border border-zinc-800"
            />
            {previewPhoto.caption && (
              <div className="text-white text-xs mt-3 text-center bg-black/80 px-4 py-2 rounded-none border border-zinc-700 tracking-wider">
                {previewPhoto.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
