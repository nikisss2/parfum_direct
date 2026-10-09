import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Camera, CheckCircle2, Send, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-300 pt-16 pb-12 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Trust Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-zinc-800">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-white">100% Оригинал</div>
              <div className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Только оригинальные флаконы от официальных европейских дистрибьюторов.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-white">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-white">Фото перед отправкой</div>
              <div className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Присылаем фото собранного заказа, атомайзеров и флаконов в Telegram/WhatsApp.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-white">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-white">Оплата по факту сборки</div>
              <div className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Никакой предоплаты вслепую: оплачиваете после подтверждения и проверки фото.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-white">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs uppercase tracking-wider text-white">Доставка по РФ и СНГ</div>
              <div className="text-xs text-zinc-400 mt-1 leading-relaxed">
                СДЭК, Яндекс Доставка, Почта России, Ozon, 5POST, Авито. От 1 дня.
              </div>
            </div>
          </div>
        </div>

        {/* Main Links Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12 border-b border-zinc-800 text-xs">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl font-black font-serif tracking-tighter text-white">
                PD
              </span>
              <span className="text-sm font-bold tracking-widest text-zinc-400 font-serif uppercase">
                PARFUM DIRECT
              </span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              Премиальный интернет-магазин оригинальной парфюмерии и распивов. Более 100 000 позиций нишевых, арабских и люксовых брендов с доставкой по всей России.
            </p>
            <div className="pt-2 flex items-center gap-3 text-zinc-400">
              <a
                href="https://t.me/nikisss2"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-none bg-zinc-900 hover:bg-black text-white border border-zinc-700 flex items-center gap-2 transition-colors uppercase tracking-wider text-xs font-semibold"
              >
                <Send className="w-3.5 h-3.5" />
                Telegram: @nikisss2
              </a>
              <span className="text-[11px] text-zinc-500 font-mono">12 400+ подписчиков</span>
            </div>
          </div>

          {/* Catalog links */}
          <div className="space-y-3">
            <div className="font-semibold text-white tracking-wide uppercase text-[11px]">Каталог</div>
            <ul className="space-y-2 text-zinc-400">
              <li><Link to="/catalog" className="hover:text-white transition-colors">Все ароматы</Link></li>
              <li><Link to="/aromabox" className="hover:text-white transition-colors text-amber-300 font-medium">Собери аромабокс (−15%)</Link></li>
              <li><Link to="/catalog?type=decant" className="hover:text-white transition-colors">Распивы (3, 5, 10 мл)</Link></li>
              <li><Link to="/catalog?category=niche" className="hover:text-white transition-colors">Нишевая парфюмерия</Link></li>
              <li><Link to="/catalog?category=arabian" className="hover:text-white transition-colors">Арабская парфюмерия</Link></li>
              <li><Link to="/catalog?category=luxury" className="hover:text-white transition-colors">Люксовая парфюмерия</Link></li>
              <li><Link to="/catalog?filter=hits" className="hover:text-white transition-colors">Хиты продаж</Link></li>
            </ul>
          </div>

          {/* Service & Guides */}
          <div className="space-y-3">
            <div className="font-semibold text-white tracking-wide uppercase text-[11px]">Сервис и Помощь</div>
            <ul className="space-y-2 text-zinc-400">
              <li><Link to="/faq" className="hover:text-white transition-colors text-white font-medium">Ответы на вопросы (FAQ)</Link></li>
              <li><Link to="/contacts" className="hover:text-white transition-colors">Контакты и шоурум</Link></li>
              <li><Link to="/reviews" className="hover:text-white transition-colors text-amber-300 font-medium">Отзывы покупателей (★ 4.9)</Link></li>
              <li><Link to="/how-to-decant" className="hover:text-white transition-colors">Как устроен распив</Link></li>
              <li><Link to="/delivery" className="hover:text-white transition-colors">Доставка и оплата</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">О компании</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Конфиденциальность</Link></li>
            </ul>
          </div>

          {/* Contacts */}
          <div className="space-y-3">
            <div className="font-semibold text-white tracking-wide uppercase text-[11px]">Контакты</div>
            <div className="space-y-2.5 text-zinc-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <a href="tel:+78005553590" className="hover:text-white font-medium text-white">8 (800) 555-35-90</a>
              </div>
              <div className="text-[11px] text-zinc-500">Ежедневно: 09:00 — 21:00 (МСК)</div>
              <div className="flex items-center gap-2 pt-1">
                <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <a href="mailto:order@parfumdirect.ru" className="hover:text-white">order@parfumdirect.ru</a>
              </div>
              <div className="flex items-start gap-2 pt-1 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <span>Москва, Пресненская наб., 12 (Шоурум выдачи)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Services strip */}
        <div className="py-6 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="text-zinc-500">Партнеры по логистике:</div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-semibold text-zinc-300">
            <span>СДЭК</span>
            <span>·</span>
            <span>Яндекс Доставка</span>
            <span>·</span>
            <span>Почта России</span>
            <span>·</span>
            <span>Ozon Доставка</span>
            <span>·</span>
            <span>5POST</span>
            <span>·</span>
            <span>Авито Доставка</span>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500">
          <div>© {new Date().getFullYear()} Parfum Direct. Все права защищены. 100% оригинальная парфюмерия.</div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-zinc-300">Политика конфиденциальности</Link>
            <span>·</span>
            <span>Оферта</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
