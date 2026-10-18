import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('maison_cookie_consent');
      if (!consent) {
        // Small delay to make it non-intrusive on page load
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleAccept = (type: 'all' | 'necessary') => {
    try {
      localStorage.setItem('maison_cookie_consent', JSON.stringify({
        status: type,
        timestamp: new Date().toISOString(),
      }));
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-5 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 text-stone-200 shadow-2xl animate-fade-in">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            <span className="font-semibold text-stone-100">Защита персональных данных (152-ФЗ): </span>
            Мы используем файлы cookie и защищенное SSL-шифрование для безопасного функционирования сайта, сохранения корзины и авторизации. Продолжая использовать бутик, вы соглашаетесь с{' '}
            <Link to="/privacy" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">
              Политикой конфиденциальности
            </Link>{' '}
            и{' '}
            <Link to="/terms" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">
              Публичной офертой
            </Link>.
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
          <button
            onClick={() => handleAccept('necessary')}
            className="px-3.5 py-2 text-xs font-medium text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg transition-colors"
          >
            Только необходимые
          </button>
          <button
            onClick={() => handleAccept('all')}
            className="px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors"
          >
            Принять
          </button>
          <button
            onClick={() => setIsVisible(false)}
            aria-label="Закрыть уведомление"
            className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg transition-colors ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
