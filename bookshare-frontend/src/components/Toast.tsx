import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Auto-exit after 3.7s (so slideOut finishes before 4s unmount)
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 3700);

    const removeTimer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 w-full max-w-sm ${
        isExiting ? 'animate-toast-out' : 'animate-toast-in'
      } ${
        toast.type === 'success'
          ? 'bg-slate-950/85 border-emerald-500/35 text-slate-100 shadow-emerald-950/20'
          : toast.type === 'error'
          ? 'bg-slate-950/85 border-rose-500/35 text-slate-100 shadow-rose-950/20'
          : 'bg-slate-950/85 border-violet-500/35 text-slate-100 shadow-violet-950/20'
      }`}
    >
      {/* Icon */}
      <div
        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-extrabold ${
          toast.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : toast.type === 'error'
            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
        }`}
      >
        {toast.type === 'success' && '✓'}
        {toast.type === 'error' && '✕'}
        {toast.type === 'info' && 'i'}
      </div>

      {/* Message */}
      <div className="flex-grow text-xs font-semibold leading-relaxed text-slate-200">
        {toast.message}
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-slate-500 hover:text-slate-200 transition-colors text-xs font-bold cursor-pointer border-0 bg-transparent"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
