import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, listItemToPerfume } from '../api/catalog';
import { ProductCard } from '../components/ProductCard';
import { Perfume } from '../types';
import { SEO } from '../components/SEO';
import {
  Sparkles,
  Briefcase,
  Flame,
  Wind,
  Coffee,
  Sun,
  Cake,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

interface CollectionDef {
  id: string;
  title: string;
  shortTitle: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  notesPill: string[];
  queries: string[];
}

const COLLECTIONS: CollectionDef[] = [
  {
    id: 'office',
    title: 'В офис и на учёбу',
    shortTitle: 'В офис / учёбу',
    badge: 'Свежесть · Чистота',
    icon: Briefcase,
    description:
      'Элегантные, политкорректные и чистые ароматы с деликатным шлейфом. Они звучат благородно и сдержанно, не раздражают коллег и однокурсников в закрытых аудиториях и кабинетах. Нотки белой рубашки, минеральной свежести, нежных цитрусов и мягкой замши.',
    notesPill: ['Бергамот', 'Амброксан', 'Альдегиды', 'Белая замша', 'Морская соль', 'Зеленый чай'],
    queries: ['Aventus', 'Lacoste Pour Femme', 'Molecule 02', 'Blanche', 'Versace Pour Homme', 'Wood Sage', 'Cedrat Boise', 'Coach Blue'],
  },
  {
    id: 'evening',
    title: 'На вечер и свидание',
    shortTitle: 'На вечер',
    badge: 'Соблазн · Глубина',
    icon: Flame,
    description:
      'Глубокие, притягательные и согревающие композиции для романтических вечеров, свиданий и светских выходов. Манящие ноты коньяка, ликёрной черешни, бурбонской ванили, корицы и тягучей амбры, которые раскрываются чувственно и интимно.',
    notesPill: ['Коньяк', 'Ликерная вишня', 'Бурбонская ваниль', 'Корица', 'Амбра', 'Бобы тонка'],
    queries: ['Angels Share', 'Lost Cherry', 'Khamrah Qahwa', 'Liquid Brun', 'Grand Soir', 'Crystal Noir', 'Side Effect'],
  },
  {
    id: 'sillage',
    title: 'Шлейфовые комплиментарные хиты',
    shortTitle: 'Шлейфовые хиты',
    badge: 'Шлейф · Комплименты',
    icon: Wind,
    description:
      'Легендарные нишевые шедевры с максимальной диффузией и невероятной стойкостью, за которыми оборачиваются на улицах и постоянно спрашивают название. Магнетический шлейф, заполняющий пространство вокруг вас.',
    notesPill: ['Минералы', 'Акигалавуд', 'Шафран', 'Серая амбра', 'Личи', 'Турецкая роза'],
    queries: ['Ganymede', 'Baccarat Rouge 540', 'Bal d Afrique', 'Delina', 'Fleur Narcotique', 'Instant Crush'],
  },
  {
    id: 'cozy',
    title: 'Уютный кашемир и согревающие пряности',
    shortTitle: 'Уютный кашемир',
    badge: 'Тепло · Пряности',
    icon: Coffee,
    description:
      'Согревающие осенне-зимние ароматы для прохладных дней, шерстяных свитеров и теплых шарфов. Уютные полутона дорогого табачного листа, жареных каштанов, дыма, кардамона, пачули и сливочного сандала.',
    notesPill: ['Табачный лист', 'Каштан', 'Кардамон', 'Сандал', 'Ладан', 'Черный перец'],
    queries: ['Tobacco Vanille', 'By the Fireplace', 'Asad', 'Amber Empire', 'Bottled Elixir', 'Santal 33'],
  },
  {
    id: 'summer',
    title: 'Летняя свежесть и цитрусовый бриз',
    shortTitle: 'Летняя свежесть',
    badge: 'Цитрусы · Акватика',
    icon: Sun,
    description:
      'Освежающие цитрусовые фреши, средиземноморский морской бриз, морозная мята и терпкий зеленый чай. Дарят прохладу в жару, отлично подходят для спорта, путешествий и повседневного ношения летом.',
    notesPill: ['Морской бриз', 'Мята', 'Красный апельсин', 'Грейпфрут', 'Карамбола', 'Белый кедр'],
    queries: ['Versace Eros', 'Eau Fraiche', 'Light Blue', 'Silver Mountain', 'Coach', 'Afternoon Swim'],
  },
  {
    id: 'gourmand',
    title: 'Гурманский рай и десертные ноты',
    shortTitle: 'Гурманские десерты',
    badge: 'Шоколад · Ваниль',
    icon: Cake,
    description:
      'Сладкие кондитерские искушения для истинных ценителей сладкого: ноты горячего шоколада, карамельного пралине, запеченного печенья, клубничного зефира и густой мадагаскарской ванили.',
    notesPill: ['Горячий шоколад', 'Карамель', 'Зефир маршмеллоу', 'Пралине', 'Кофе', 'Миндаль'],
    queries: ['Chocolate Greedy', 'Lira', 'Yara', 'Vanilla Cake', 'Love Dont Be Shy', 'The Scent'],
  },
];

export const CollectionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('office');
  const [productsByCollection, setProductsByCollection] = useState<Record<string, Perfume[]>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const currentDef = COLLECTIONS.find(c => c.id === activeTab) || COLLECTIONS[0];

  useEffect(() => {
    // Load products for the active collection if not loaded yet
    if (productsByCollection[activeTab]) {
      return;
    }

    setLoading(true);
    const targetQueries = currentDef.queries;

    Promise.all(
      targetQueries.map(q =>
        fetchProducts({ q, limit: 2, sort: 'popular' })
          .then(r => r.items.map(listItemToPerfume))
          .catch(() => [] as Perfume[])
      )
    )
      .then(results => {
        // Flatten, deduplicate by ID, and filter out placeheld images
        const map = new Map<string, Perfume>();
        for (const list of results) {
          for (const item of list) {
            if (!map.has(item.id)) {
              map.set(item.id, item);
            }
          }
        }
        const flat = Array.from(map.values()).slice(0, 12);
        setProductsByCollection(prev => ({ ...prev, [activeTab]: flat }));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-white pb-20">
      <SEO
        title="Особенные подборки парфюмерии — Maison Arôme"
        description="Тематические подборки ароматов от экспертов Maison Arôme: в офис и на учёбу, на вечер и свидание, шлейфовые хиты, уютный кашемир, летняя акватика и гурманский рай."
        canonical="https://maison-arome.ru/collections"
      />

      {/* Hero Header */}
      <section className="border-b border-zinc-100 py-12 sm:py-16 bg-gradient-to-b from-zinc-50/60 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Гид по ароматам · Кураторские подборки</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-zinc-950 tracking-tight leading-tight">
            Особенные подборки ароматов
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-zinc-500 max-w-2xl mx-auto leading-relaxed font-light text-delicate">
            Мы изучили парфюмерные композиции и сгруппировали их по поводам, шлейфу и характеру звучания — от политкорректных ароматов для офиса до манящих вечерних шедевров.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 space-y-8 sm:space-y-10">
        {/* Collection Pill Tabs (Quiet Luxury, rounded-full) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {COLLECTIONS.map(col => {
            const Icon = col.icon;
            const isActive = col.id === activeTab;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setActiveTab(col.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wide flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-black text-white shadow-md'
                    : 'bg-zinc-100/80 hover:bg-zinc-200/80 text-zinc-700 hover:text-black border border-zinc-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-zinc-500'}`} />
                <span>{col.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Collection Description Card */}
        <div className="p-6 sm:p-8 rounded-[28px] bg-zinc-50/80 border border-zinc-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-xs shrink-0">
                <currentDef.icon className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A6B32]">
                  {currentDef.badge}
                </span>
                <h2 className="text-xl sm:text-2xl font-light text-zinc-950">
                  {currentDef.title}
                </h2>
              </div>
            </div>

            <Link
              to="/catalog"
              className="pill-btn-outline py-2 px-5 text-xs inline-flex items-center gap-1.5 self-start sm:self-center"
            >
              <span>Все ароматы в каталоге</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-light text-delicate max-w-4xl">
            {currentDef.description}
          </p>

          {/* Key Characteristic Notes Chips */}
          <div className="pt-1 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Ключевые ноты подборки:
            </span>
            {currentDef.notesPill.map((note, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full bg-white border border-zinc-200 text-[11px] text-zinc-800 font-light shadow-2xs"
              >
                {note}
              </span>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              Позиции в подборке ({productsByCollection[activeTab]?.length || 0})
            </span>
            <span className="text-xs text-zinc-500 font-light">
              100% оригиналы · Отливанты от 1 мл и целые флаконы
            </span>
          </div>

          {loading && !productsByCollection[activeTab]?.length ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 py-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white p-2 sm:p-3 relative flex flex-col justify-between animate-pulse select-none">
                  <div>
                    <div className="flex items-center justify-between gap-1.5 mb-1 min-h-[26px]">
                      <div className="h-5 w-12 bg-zinc-100 rounded-full" />
                      <div className="h-5 w-5 bg-zinc-100 rounded-full" />
                    </div>
                    <div className="relative aspect-square bg-[#F7F7F8] rounded-[24px] flex items-center justify-center p-4">
                      <div className="w-1/3 h-3/5 bg-zinc-200/60 rounded-full" />
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      <div className="h-6 w-11 bg-zinc-100 rounded-full" />
                      <div className="h-6 w-11 bg-zinc-100 rounded-full" />
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="h-3 w-1/3 bg-zinc-200/80 rounded-full" />
                      <div className="h-4 w-3/4 bg-zinc-100 rounded-full" />
                    </div>
                  </div>
                  <div className="mt-3 pt-2 space-y-2">
                    <div className="h-5 w-1/3 bg-zinc-200/80 rounded-full" />
                    <div className="w-full h-8 sm:h-9 bg-zinc-100 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {(productsByCollection[activeTab] || []).map(perf => (
                <ProductCard key={perf.id} perfume={perf} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
