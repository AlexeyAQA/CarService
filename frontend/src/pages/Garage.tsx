import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, CarFront, ChevronLeft, ChevronRight, Plus, Search, X } from 'lucide-react';

import { gateway } from '../data/gateway';
import { number } from '../lib/format';
import { CarVisual, EmptyState, ErrorState, Loading } from '../components/ui';
import { CarEditorDialog } from '../components/CarEditorDialog';

export default function Garage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [creating, setCreating] = useState(false);
  const cars = useQuery({ queryKey: ['cars', page, search], queryFn: () => gateway.listCars({ page, size: 6, manufacturer: search }) });
  return <>
    <div className="page-eyebrow">ВАШ ЛИЧНЫЙ ГАРАЖ</div>
    <div className="page-heading"><div><h1>Автомобили</h1><p className="page-subtitle">Всё об обслуживании — в одном месте.</p></div><button className="button button-primary" onClick={() => setCreating(true)}><Plus size={22} />Добавить автомобиль</button></div>
    <div className="garage-toolbar"><label className="search-box"><Search size={20} /><input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Найти автомобиль по марке" aria-label="Поиск автомобиля по марке" />{search && <button className="icon-button" aria-label="Очистить поиск" onClick={() => { setSearch(''); setPage(0); }}><X size={17} /></button>}</label><span className="muted">Всего: {cars.data?.totalElements ?? '—'}</span></div>
    {cars.isPending ? <Loading /> : cars.isError ? <ErrorState error={cars.error} onRetry={() => void cars.refetch()} /> : cars.data.cars.length ? <>
      <div className="car-grid">{cars.data.cars.map(car => <Link to={`/cars/${car.id}`} className="car-card" key={car.id}><div className="car-card-art"><span className="car-year">{car.year}</span><CarVisual car={car} /><span className="car-open"><ArrowUpRight size={21} /></span></div><div className="car-card-body"><h2>{car.manufacturer} {car.model}</h2><div className="car-card-meta"><span className="plate">{car.regNumber || 'Без номера'}</span><span>{number(car.mileage)} км</span></div><div className="car-card-footer"><span>Сервисная книжка</span><ChevronRight size={18} /></div></div></Link>)}</div>
      {cars.data.totalPages > 1 && <div className="pagination"><button className="button button-secondary" disabled={!page} onClick={() => setPage(page - 1)}><ChevronLeft size={18} />Назад</button><span>Страница {page + 1} из {cars.data.totalPages}</span><button className="button button-secondary" disabled={page + 1 >= cars.data.totalPages} onClick={() => setPage(page + 1)}>Далее<ChevronRight size={18} /></button></div>}
      <div className="garage-note"><div className="small-icon"><CarFront size={23} /></div><div><strong>Помнить всё больше не нужно</strong><p>Храните историю работ, пробег и номера запчастей для каждого автомобиля.</p></div></div>
    </> : <EmptyState icon={<CarFront size={34} />} title={search ? 'Автомобили не найдены' : 'Добро пожаловать в ваш гараж'} description={search ? 'Попробуйте другую марку или очистите поиск.' : 'Добавьте автомобиль, чтобы начать вести его сервисную книжку.'} action={!search && <button className="button button-primary" onClick={() => setCreating(true)}><Plus size={20} />Добавить автомобиль</button>} />}
    {creating && <CarEditorDialog onClose={() => setCreating(false)} />}
  </>;
}
