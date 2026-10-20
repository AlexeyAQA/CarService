import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, X } from 'lucide-react';
import type { AppMode } from './data/types';

type AppContextValue = { mode: AppMode; setMode: (mode: AppMode) => void; notify: (message: string) => void };
const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [mode, updateMode] = useState<AppMode>(() => {
    try { return localStorage.getItem('service-book-mode') === 'api' ? 'api' : 'demo'; } catch { return 'demo'; }
  });
  const [toast, setToast] = useState('');
  const notify = useCallback((message: string) => setToast(message), []);
  const setMode = useCallback((next: AppMode) => {
    queryClient.clear();
    updateMode(next);
    try { localStorage.setItem('service-book-mode', next); } catch { /* The current tab still works. */ }
    setToast(next === 'demo' ? 'Деморежим включён' : 'Включено подключение к вашему серверу');
  }, [queryClient]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 5500);
    return () => clearTimeout(timer);
  }, [toast]);
  return <AppContext.Provider value={{ mode, setMode, notify }}>
    {children}
    {toast && <div className="toast" role="status"><CheckCircle2 size={20} /><span>{toast}</span><button className="icon-button" aria-label="Закрыть уведомление" onClick={() => setToast('')}><X size={17} /></button></div>}
  </AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('AppProvider is required');
  return context;
}
