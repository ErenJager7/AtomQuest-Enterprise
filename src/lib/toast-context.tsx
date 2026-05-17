// @ts-nocheck
"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';
type Toast = { id: string; type: ToastType; title: string; message?: string };
type ToastContextType = { toast: (type: ToastType, title: string, message?: string) => void };

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

const icons = { success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info };
const colors = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  error: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  info: 'border-primary/30 bg-primary/10 text-primary',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[100] space-y-3 w-[380px]">
        {toasts.map(t => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              className={`glass-panel rounded-xl p-4 flex items-start gap-3 border animate-in slide-in-from-right ${colors[t.type]}`}
              style={{ animation: 'slideInRight 0.3s ease-out' }}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{t.title}</p>
                {t.message && <p className="text-xs text-muted-foreground mt-0.5">{t.message}</p>}
              </div>
              <button onClick={() => removeToast(t.id)} className="text-muted-foreground hover:text-white shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
