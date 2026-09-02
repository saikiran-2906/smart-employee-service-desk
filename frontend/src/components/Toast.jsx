import React, { createContext, useCallback, useContext, useState } from 'react';

// Lightweight toast notification system (success/error messages).
const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback((type, title, msg) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, type, title, msg }]);
    setTimeout(() => remove(id), 3500);
  }, [remove]);

  const api = {
    success: (title, msg) => notify('success', title, msg),
    error: (title, msg) => notify('error', title, msg),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            <div className="toast__title">{t.title}</div>
            {t.msg && <div className="toast__msg">{t.msg}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
