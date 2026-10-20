import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CarFront, LoaderCircle, X } from 'lucide-react';
import type { Car } from '../data/types';
import { errorMessage } from '../lib/format';

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link className="back-link" to={to}><ArrowLeft size={21} />{children}</Link>;
}
export function Loading({ text = 'Загружаем данные…' }: { text?: string }) {
  return <div className="loading-state" role="status"><LoaderCircle className="spin" size={28} /><span>{text}</span></div>;
}
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return <div className="error-state" role="alert"><AlertCircle size={28} /><h2>Не удалось загрузить данные</h2><p>{errorMessage(error)}</p>{onRetry && <button className="button button-secondary" onClick={onRetry}>Попробовать снова</button>}</div>;
}
export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><h2>{title}</h2><p>{description}</p>{action}</div>;
}
export function Dialog({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog?.close(); document.body.style.overflow = previous; };
  }, []);
  return <dialog ref={ref} className={`dialog ${wide ? 'dialog-wide' : ''}`} aria-label={title} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="dialog-inner"><div className="dialog-heading"><h2>{title}</h2><button type="button" className="icon-button" onClick={onClose} aria-label="Закрыть окно"><X size={23} /></button></div>{children}</div>
  </dialog>;
}
export function CarVisual({ car, demo = false }: { car: Car; demo?: boolean }) {
  const [failed, setFailed] = useState(false);
  const image = demo ? car.photo ?? null : null;
  useEffect(() => setFailed(false), [image]);
  if (image && !failed) return <img className="car-image" src={image} alt={`${car.manufacturer} ${car.model}`} onError={() => setFailed(true)} />;
  return <div className="car-placeholder" aria-label={`${car.manufacturer} ${car.model}`}><CarFront strokeWidth={1} /><span>{car.manufacturer}</span></div>;
}
