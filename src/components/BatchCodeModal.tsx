import React, { useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, ExternalLink, Camera, Search, Sparkles } from 'lucide-react';

interface BatchCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BatchCodeModal: React.FC<BatchCodeModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-[28px] border border-zinc-200 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5A6B32]/10 text-[#5A6B32] text-[11px] font-medium tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Гарантия подлинности</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-light text-zinc-950 tracking-tight">
            Как проверить оригинальность по батч-коду?
          </h3>
          <p className="text-xs text-zinc-500 font-light leading-relaxed">
            Батч-код (Batch Code) — это уникальный идентификатор производственной партии, наносимый официальным брендом.
          </p>
        </div>

        {/* 3 Step Guide */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3.5">
            <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-mono shrink-0">
              1
            </span>
            <div className="space-y-1 text-xs">
              <div className="font-medium text-zinc-900">Сверьте коды на коробке и флаконе</div>
              <div className="text-zinc-500 font-light leading-relaxed">
                Шифр нанесен тиснением на картонной упаковке и выгравирован лазером на дне стеклянного флакона. Они строго идентичны.
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3.5">
            <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-mono shrink-0">
              2
            </span>
            <div className="space-y-1 text-xs">
              <div className="font-medium text-zinc-900">Проверьте в международном реестре</div>
              <div className="text-zinc-500 font-light leading-relaxed">
                Введите бренд и код на независимых сервисах проверки косметики: система покажет фабрику и дату розлива.
              </div>
              <div className="flex flex-wrap gap-2 pt-1.5">
                <a
                  href="https://www.checkfresh.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-900 hover:text-black underline bg-white px-2.5 py-1 rounded-full border border-zinc-200 shadow-2xs"
                >
                  <span>CheckFresh.com</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
                <a
                  href="http://checkcosmetic.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-900 hover:text-black underline bg-white px-2.5 py-1 rounded-full border border-zinc-200 shadow-2xs"
                >
                  <span>Cosmetic Calculator</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-3.5">
            <span className="w-6 h-6 rounded-full bg-[#5A6B32] text-white text-xs flex items-center justify-center font-mono shrink-0">
              3
            </span>
            <div className="space-y-1 text-xs">
              <div className="font-medium text-zinc-900 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#5A6B32]" />
                <span>Фотоконтроль перед отправкой</span>
              </div>
              <div className="text-zinc-500 font-light leading-relaxed">
                Перед отправкой вашего заказа менеджер пришлет в Telegram детальное макро-фото флакона, пульверизатора и батч-кода именно вашей посылки.
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-zinc-100">
          <div className="text-[11px] text-zinc-400 font-light">
            Maison Arôme · Прямые поставки из ЕС и ОАЭ
          </div>
          <button
            onClick={onClose}
            className="pill-btn-black py-2.5 px-6 rounded-full text-xs font-light transition-transform active:scale-95"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
