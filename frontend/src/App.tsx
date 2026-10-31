import { Component, Suspense, lazy, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import { Link, NavLink, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { CarFront, ChevronDown, CircleHelp, FileText, Menu, NotebookText, Settings2, Store, Wrench, X } from 'lucide-react';

import { Loading } from './components/ui';
const Garage = lazy(() => import('./pages/Garage'));
const CarDetails = lazy(() => import('./pages/CarDetails'));
const NewRecord = lazy(() => import('./pages/NewRecord'));
const RecordDetails = lazy(() => import('./pages/RecordDetails'));
const Centers = lazy(() => import('./pages/Secondary').then(m => ({ default: m.Centers })));
const Documents = lazy(() => import('./pages/Secondary').then(m => ({ default: m.Documents })));
const History = lazy(() => import('./pages/Secondary').then(m => ({ default: m.History })));
const Settings = lazy(() => import('./pages/Secondary').then(m => ({ default: m.Settings })));

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, _info: ErrorInfo) { console.error('Application render error', error); }
  render() { return this.state.failed ? <div className="error-state"><h1>Что-то пошло не так</h1><p>Попробуйте перезагрузить страницу.</p><button className="button button-primary" onClick={() => location.reload()}>Перезагрузить</button></div> : this.props.children; }
}
function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { setMobileOpen(false); window.scrollTo(0, 0); }, [location.pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [mobileOpen]);
  useEffect(() => {
    const titles: Record<string, string> = { cars: 'Автомобили', history: 'История работ', centers: 'Сервисные центры', documents: 'Документы', settings: 'Настройки' };
    document.title = `${titles[location.pathname.split('/')[1]] || 'Гараж'} · Сервисная книжка`;
  }, [location.pathname]);
  const links = [{ to: '/cars', label: 'Автомобили', Icon: CarFront }, { to: '/history', label: 'История работ', Icon: NotebookText }, { to: '/centers', label: 'Сервисы', Icon: Store }, { to: '/documents', label: 'Документы', Icon: FileText }];
  return <div className="app-shell"><a className="skip-link" href="#main-content">К содержимому</a><header className="app-header"><button className="mobile-menu icon-button" aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={24} /> : <Menu size={24} />}</button><Link className="brand" to="/cars"><span className="brand-symbol"><Wrench size={27} strokeWidth={2.6} /></span><span>Сервисная книжка</span></Link><div className="header-right"><Link className="profile-link" to="/settings"><span className="avatar"><CarFront size={20} /></span><span>Мой гараж</span><ChevronDown size={16} /></Link></div></header>
    {mobileOpen && <button className="sidebar-overlay" aria-label="Закрыть навигацию" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}><nav aria-label="Основная навигация">{links.map(({ to, label, Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Icon size={23} strokeWidth={1.65} /><span>{label}</span></NavLink>)}</nav><div className="sidebar-bottom"><div className="sidebar-caption"><span className="sidebar-line" /><p>Забота об автомобиле.<br /><strong>Без лишних хлопот.</strong></p></div><NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Settings2 size={23} strokeWidth={1.7} /><span>Настройки</span></NavLink><span className="sidebar-version">СЕРВИСНАЯ КНИЖКА · 01</span></div></aside>
    <main id="main-content" className="main-content"><div className="page-content"><ErrorBoundary key={location.pathname}><Suspense fallback={<Loading />}><Outlet /></Suspense></ErrorBoundary></div><footer className="page-footer"><span>Ваша история. Ваш автомобиль.</span><Link to="/settings"><CircleHelp size={14} />Подключение к серверу</Link></footer></main>
  </div>;
}
export default function App() {
  return <Routes><Route element={<Layout />}><Route index element={<Navigate to="/cars" replace />} /><Route path="cars" element={<Garage />} /><Route path="cars/:carId" element={<CarDetails />} /><Route path="cars/:carId/records/new" element={<NewRecord />} /><Route path="cars/:carId/records/:recordId" element={<RecordDetails />} /><Route path="history" element={<History />} /><Route path="centers" element={<Centers />} /><Route path="documents" element={<Documents />} /><Route path="settings" element={<Settings />} /><Route path="*" element={<div className="empty-state"><h1>Страница не найдена</h1><p>Возможно, адрес изменился.</p><Link className="button button-primary" to="/cars">Вернуться в гараж</Link></div>} /></Route></Routes>;
}
