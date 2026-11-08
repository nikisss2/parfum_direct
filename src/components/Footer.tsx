import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Camera, Droplet, Send, Phone, Mail, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F8F8FA] text-zinc-700 pt-16 pb-12 border-t border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Trust Grid - Soft Rounded Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-12 border-b border-zinc-200/80">
          <div className="p-6 rounded-[24px] bg-white border border-zinc-200/60 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-900">
              <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <div className="font-normal text-xs uppercase tracking-[0.1em] text-zinc-900">100% Оригинал</div>
              <div className="text-xs text-zinc-500 mt-1 leading-relaxed text-delicate">
                Прямые поставки от официальных дистрибьюторов Европы и ОАЭ. Батч-коды на каждом флаконе.
              </div>
            </div>
          </div>

          <div className="p-6 rounded-[24px] bg-white border border-zinc-200/60 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-900">
              <Camera className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <div className="font-normal text-xs uppercase tracking-[0.1em] text-zinc-900">Фото перед отправкой</div>
              <div className="text-xs text-zinc-500 mt-1 leading-relaxed text-delicate">
                Присылаем фото собранного заказа и флаконов в Telegram до передачи курьеру.
              </div>
            </div>
          </div>

          <div className="p-6 rounded-[24px] bg-white border border-zinc-200/60 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-900">
              <Droplet className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <div className="font-normal text-xs uppercase tracking-[0.1em] text-zinc-900">Чистый распив от 1 мл</div>
              <div className="text-xs text-zinc-500 mt-1 leading-relaxed text-delicate">
                Стеклянные итальянские атомайзеры с тонким микрораспылением.
              </div>
            </div>
          </div>

          <div className="p-6 rounded-[24px] bg-white border border-zinc-200/60 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-900">
              <Truck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <div className="font-normal text-xs uppercase tracking-[0.1em] text-zinc-900">Доставка по всей РФ</div>
              <div className="text-xs text-zinc-500 mt-1 leading-relaxed text-delicate">
                СДЭК, Яндекс Доставка и Почта России. Быстро, надежно и бережно.
              </div>
            </div>
          </div>
        </div>

        {/* Main Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12 border-b border-zinc-200/80 text-xs">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/branding/логотип_2.png"
                alt="MAISON ARÔME"
                className="h-9 sm:h-11 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/assets/branding/логотип_2_white.png';
                }}
              />
            </div>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-sm text-delicate">
              Концептуальное пространство селективной парфюмерии и ухода. Более 100 000 позиций редких ароматов и распивов от 1 мл с бережной доставкой по всей России.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://t.me/nikisss2"
                target="_blank"
                rel="noreferrer"
                className="pill-btn-black py-2.5 px-5 text-[11px]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Написать</span>
              </a>
              <Link
                to="/catalog"
                className="pill-btn-outline py-2.5 px-5 text-[11px]"
              >
                <span>Каталог</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Catalog links */}
          <div className="space-y-3">
            <div className="font-normal text-zinc-900 tracking-[0.12em] uppercase text-[11px]">Каталог</div>
            <ul className="space-y-2 text-zinc-500 text-delicate">
              <li><Link to="/catalog" className="hover:text-black transition-colors">Все ароматы</Link></li>
              <li><Link to="/catalog?type=decant" className="hover:text-black transition-colors">Распивы (1–20 мл)</Link></li>
              <li><Link to="/catalog?filter=hits" className="hover:text-black transition-colors">Бестселлеры</Link></li>
              <li><Link to="/catalog?filter=new" className="hover:text-black transition-colors">Новинки</Link></li>
              <li><Link to="/catalog?kind=perfume" className="hover:text-black transition-colors">Селектив & Ниша</Link></li>
              <li><Link to="/certificates" className="hover:text-black transition-colors">Подарочные сертификаты</Link></li>
            </ul>
          </div>

          {/* Service & Guides */}
          <div className="space-y-3">
            <div className="font-normal text-zinc-900 tracking-[0.12em] uppercase text-[11px]">Сервис</div>
            <ul className="space-y-2 text-zinc-500 text-delicate">
              <li><Link to="/why-cheaper" className="hover:text-black transition-colors">Почему у нас честные цены</Link></li>
              <li><Link to="/loyalty" className="hover:text-black transition-colors">Программа лояльности</Link></li>
              <li><Link to="/gallery" className="hover:text-black transition-colors">Галерея заказов</Link></li>
              <li><Link to="/reviews" className="hover:text-black transition-colors">Отзывы покупателей</Link></li>
              <li><Link to="/faq" className="hover:text-black transition-colors">Вопросы и ответы (FAQ)</Link></li>
              <li><Link to="/delivery" className="hover:text-black transition-colors">Доставка и оплата</Link></li>
              <li><Link to="/returns" className="hover:text-black transition-colors">Возврат и гарантия</Link></li>
            </ul>
          </div>

          {/* Contacts */}
          <div className="space-y-3">
            <div className="font-normal text-zinc-900 tracking-[0.12em] uppercase text-[11px]">Контакты & Реквизиты</div>
            <div className="space-y-2.5 text-zinc-500 text-delicate">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <a href="tel:+79122879486" className="hover:text-black font-normal text-zinc-900">8 (912) 287-94-86</a>
              </div>
              <div className="text-[11px] text-zinc-400">Telegram / WhatsApp: @nikisss2</div>
              <div className="flex items-center gap-2 pt-1">
                <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <a href="mailto:order@maisonarome.ru" className="hover:text-black">order@maisonarome.ru</a>
              </div>
              <div className="text-[11px] text-zinc-400 pt-1">
                Москва · Доставка СДЭК и Яндекс по всей РФ
              </div>
              <div className="text-[11px] text-zinc-400 font-sans tabular-nums pt-0.5">
                ИП Лаптев Н. В. · ИНН: 667221490551
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 text-delicate border-t border-zinc-100">
          <div className="flex items-center gap-2.5">
            <span>© {new Date().getFullYear()} Maison Arôme. Все права защищены.</span>
            <span className="px-1.5 py-0.5 rounded border border-zinc-300 text-[10px] text-zinc-500 font-mono">16+</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-[11px]">
            <Link to="/offer" className="hover:text-zinc-700 transition-colors">Оферта</Link>
            <span>·</span>
            <Link to="/privacy" className="hover:text-zinc-700 transition-colors">Конфиденциальность (152-ФЗ)</Link>
            <span>·</span>
            <Link to="/returns" className="hover:text-zinc-700 transition-colors">Возврат и обмен</Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-zinc-700 transition-colors">Соглашение</Link>
            <span>·</span>
            <Link to="/contacts" className="hover:text-zinc-700 transition-colors">Контакты</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
