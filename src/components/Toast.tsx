import React from 'react';
import { useShop } from '../context/ShopContext';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useShop();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        return (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white border border-black shadow-2xl rounded-none p-4 flex items-start gap-3 transition-all duration-200 animate-in slide-in-from-bottom-3"
          >
            {toast.image ? (
              <img
                src={toast.image}
                alt=""
                className="w-12 h-12 object-cover rounded-none shrink-0 border border-zinc-200"
              />
            ) : (
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-zinc-950" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-zinc-950" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-950">{toast.title}</div>
              <div className="text-xs text-zinc-600 mt-0.5 line-clamp-2 leading-relaxed">{toast.message}</div>
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="text-zinc-400 hover:text-black transition-colors p-1 -mr-1 -mt-1"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
