import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, CarFront, Database, FileText, MapPin, Phone, Plus, Store } from 'lucide-react';
import { useApp } from '../app-context';
import { gateway } from '../data/gateway';
import { errorMessage } from '../lib/format';
import { Dialog, EmptyState, ErrorState, Loading } from '../components/ui';
import { RecordTable } from '../components/RecordTable';

export function History() {
  const [params, setParams] = useSearchParams();
  const cars = useQuery({ queryKey: ['cars', 'history-selector'], queryFn: ({ signal }) => gateway.listAllCars(signal) });
  const selected = params.get('carId') || '';
  const carId = cars.data?.some(car => car.id === selected) ? selected : cars.data?.[0]?.id;
  return <><div className="page-eyebrow">НИЧЕГО НЕ ЗАБУДЕТСЯ</div><div className="page-heading"><div><h1>История работ</h1><p className="page-subtitle">Выберите автомобиль, чтобы посмотреть его обслуживание.</p></div></div>
    {cars.isPending ? <Loading /> : cars.isError ? <ErrorState error={cars.error} onRetry={() => void cars.refetch()} /> : !carId ? <EmptyState icon={<CarFront size={32} />} title="Добавьте автомобиль" description="История обслуживания появится после добавления автомобиля и первой записи." action={<Link className="button button-primary" to="/cars">К автомобилям<ArrowRight size={18} /></Link>} /> : <>
      <label className="field history-car-picker"><span className="field-label">Автомобиль</span><select className="input" value={carId} onChange={e => setParams({ carId: e.target.value })}>{cars.data.map(car => <option key={car.id} value={car.id}>{car.manufacturer} {car.model} · {car.regNumber || car.vin}</option>)}</select></label>
      <RecordTable key={carId} carId={carId} action={<Link className="button button-primary" to={`/cars/${carId}/records/new`}><Plus size={20} />Добавить запись</Link>} />
    </>}
  </>;
}

export function Centers() {
  const { notify } = useApp();
  const cache = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const centers = useQuery({ queryKey: ['centers'], queryFn: () => gateway.listCenters() });
  const openCreate = () => { setError(''); setCreating(true); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('');
    const data = new FormData(event.currentTarget);
    const input = { name: String(data.get('name') || '').trim(), address: String(data.get('address') || '').trim(), phone: String(data.get('phone') || '').trim() || null };
    if (!input.name || !input.address) { setError('Заполните название и адрес сервиса.'); return; }
    setBusy(true);
    try {
      await gateway.createCenter(input);
      await cache.invalidateQueries({ queryKey: ['centers'] });
      setCreating(false); notify('Сервис добавлен');
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };
  return <><div className="page-eyebrow">ПРОВЕРЕННЫЕ МЕСТА</div><div className="page-heading"><div><h1>Сервисные центры</h1><p className="page-subtitle">Контакты тех, кому вы доверяете автомобиль.</p></div><button className="button button-primary" onClick={openCreate}><Plus size={21} />Добавить сервис</button></div>
    {centers.isPending ? <Loading /> : centers.isError ? <ErrorState error={centers.error} onRetry={() => void centers.refetch()} /> : !centers.data.length ? <EmptyState icon={<Store size={34} />} title="Здесь будут ваши сервисы" description="Добавьте название и адрес центра, чтобы выбирать его при записи обслуживания." action={<button className="button button-primary" onClick={openCreate}>Добавить сервис</button>} /> : <div className="centers-grid">{centers.data.map(center => <article className="center-card" key={center.id}><div className="center-logo"><Store size={27} strokeWidth={1.6} /></div><h2>{center.name}</h2><p><MapPin size={17} /><span>{center.address}</span></p>{center.phone && <p><Phone size={17} /><a href={`tel:${center.phone.replace(/[^+\d]/g, '')}`}>{center.phone}</a></p>}</article>)}</div>}
    {creating && <Dialog title="Добавить сервис" onClose={() => !busy && setCreating(false)}><form onSubmit={submit}><fieldset className="plain-fieldset" disabled={busy}><div className="form-grid"><div className="field span-two"><label className="field-label" htmlFor="center-name">Название</label><input id="center-name" name="name" className="input" required maxLength={255} placeholder="Название сервисного центра" /></div><div className="field span-two"><label className="field-label" htmlFor="center-address">Адрес</label><input id="center-address" name="address" className="input" required maxLength={255} placeholder="Город, улица, дом" /></div><div className="field span-two"><label className="field-label" htmlFor="center-phone">Телефон · необязательно</label><input id="center-phone" name="phone" type="tel" className="input" maxLength={255} placeholder="+7 999 123-45-67" /></div></div>{error && <p className="field-error" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setCreating(false)}>Отмена</button><button className="button button-primary">{busy ? 'Сохраняем…' : 'Добавить сервис'}</button></div></fieldset></form></Dialog>}
  </>;
}

export function Documents() {
  return <><div className="page-eyebrow">ПОД РУКОЙ</div><div className="page-heading"><div><h1>Документы</h1><p className="page-subtitle">Важное об автомобиле — рядом с его историей.</p></div></div><div className="coming-soon"><div className="document-illustration"><FileText size={56} strokeWidth={1.2} /><span>СК</span></div><span className="eyebrow-badge">В СЛЕДУЮЩЕЙ ВЕРСИИ</span><h2>Бумаги найдут своё место</h2><p>Заказ-наряды, чеки и документы автомобиля.<br />Загрузка файлов появится после подключения хранилища.</p><Link className="button button-secondary" to="/cars">Вернуться в гараж<ArrowRight size={17} /></Link></div></>;
}

export function Settings() {
  const connection = useQuery({ queryKey: ['connection'], queryFn: () => gateway.listCars({ size: 1 }), staleTime: 0 });
  return <><div className="page-eyebrow">ВАША СЕРВИСНАЯ КНИЖКА</div><div className="page-heading"><div><h1>Настройки</h1><p className="page-subtitle">Автомобили и история хранятся на вашем сервере.</p></div></div>
    <section className="settings-section"><h2>Подключение</h2><div className="connection-row"><span className="connection-icon"><Database size={23} /></span><div><strong>Сервер сервисной книжки</strong><p>{connection.isFetching ? 'Проверяем соединение…' : connection.isError ? 'Не удалось подключиться. Убедитесь, что сервер запущен.' : 'Соединение установлено. Данные загружаются с сервера.'}</p></div><span className="status-label">{connection.isFetching ? 'Проверка' : connection.isError ? 'Недоступен' : 'Доступен'}</span></div><button className="button button-secondary" disabled={connection.isFetching} onClick={() => void connection.refetch()}>Проверить соединение</button></section>
    <section className="settings-section"><h2>Возможности</h2><p className="muted">Автомобили, владельцы, сервисные центры и записи обслуживания с поиском по работам и номерам запчастей. Документы и напоминания появятся позже.</p><Link className="button button-primary" to="/cars">Открыть гараж<ArrowRight size={19} /></Link></section>
  </>;
}
