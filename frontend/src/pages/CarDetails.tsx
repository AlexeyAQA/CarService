import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, ArrowUpRight, ChevronRight, Clock3, Copy, MoreHorizontal, Pencil, Plus, Wrench } from 'lucide-react';
import { useApp } from '../app-context';
import { gateway } from '../data/gateway';
import { date, errorMessage, number } from '../lib/format';
import { BackLink, CarVisual, Dialog, EmptyState, ErrorState, Loading } from '../components/ui';
import { RecordTable } from '../components/RecordTable';
import { CarEditorDialog } from '../components/CarEditorDialog';

export default function CarDetails() {
  const { carId = '' } = useParams();
  const { mode, notify } = useApp();
  const navigate = useNavigate();
  const cache = useQueryClient();
  const [panel, setPanel] = useState<'about' | 'edit' | 'archive' | 'reminder' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const carQuery = useQuery({ queryKey: [mode, 'car', carId], queryFn: () => gateway.getCar(mode, carId) });
  const records = useQuery({ queryKey: [mode, 'records', carId], queryFn: () => gateway.listRecords(mode, carId), enabled: mode === 'demo' });
  const centers = useQuery({ queryKey: [mode, 'centers'], queryFn: () => gateway.listCenters(mode), enabled: mode === 'demo' });
  if (carQuery.isPending) return <Loading />;
  if (carQuery.isError) return <ErrorState error={carQuery.error} onRetry={() => void carQuery.refetch()} />;
  const car = carQuery.data;
  const newRecordButton = <Link className="button button-primary" to={`/cars/${car.id}/records/new`}><Plus size={24} />Добавить запись</Link>;
  const reminder = mode === 'demo' ? car.nextMaintenance : undefined;
  return <>
    <BackLink to="/cars">Все автомобили</BackLink>
    <div className="car-hero"><div className="car-hero-art"><CarVisual car={car} demo={mode === 'demo'} /></div><div className="car-hero-copy"><span className="car-kicker">МОЯ СЕРВИСНАЯ КНИЖКА</span><h1>{car.manufacturer} {car.model}</h1><p className="hero-meta">{car.regNumber || 'Без госномера'}<span>·</span>{car.year}<span>·</span>{number(car.mileage)} км</p><button className="button-link about-link" onClick={() => setPanel('about')}>Об автомобиле<ChevronRight size={19} /></button></div><details className="car-menu"><summary aria-label="Действия с автомобилем"><MoreHorizontal size={23} /></summary><div className="dropdown-menu"><button onClick={() => setPanel('edit')}><Pencil size={17} />Редактировать</button><button onClick={() => { setError(''); setPanel('archive'); }}><Archive size={17} />Убрать из гаража</button></div></details></div>
    {reminder && <button className="reminder" onClick={() => setPanel('reminder')}><span className="reminder-icon"><Clock3 size={34} strokeWidth={1.7} /></span><span className="reminder-title"><span>Ближайшее ТО</span><strong>{reminder.title}</strong></span><span className="reminder-due"><strong>{car.mileage >= reminder.mileage ? 'Пора запланировать' : `Через ${number(reminder.mileage - car.mileage)} км`}</strong><span>или до {date(reminder.date)}</span></span><ChevronRight size={23} /></button>}
    {mode === 'api' ? <section className="history-section"><div className="section-heading"><h2>История обслуживания</h2>{newRecordButton}</div><EmptyState icon={<Wrench size={30} />} title="Создайте первую запись" description="Создание записей уже подключено. Просмотр полной истории станет доступен после добавления чтения записей на сервере." /></section> : records.isPending ? <Loading text="Загружаем историю…" /> : records.isError ? <ErrorState error={records.error} onRetry={() => void records.refetch()} /> : <RecordTable records={records.data} centers={centers.data ?? []} action={newRecordButton} />}
    {panel === 'about' && <Dialog title="Об автомобиле" onClose={() => setPanel(null)}><p className="dialog-subtitle">{car.manufacturer} {car.model}</p><dl className="detail-grid"><div><dt>Госномер</dt><dd>{car.regNumber || 'Не указан'}</dd></div><div><dt>Год выпуска</dt><dd>{car.year}</dd></div><div><dt>Текущий пробег</dt><dd>{number(car.mileage)} км</dd></div><div><dt>VIN</dt><dd className="copy-value">{car.vin}<button className="icon-button" aria-label="Скопировать VIN" onClick={() => void navigator.clipboard.writeText(car.vin).then(() => notify('VIN скопирован')).catch(() => notify('Не удалось скопировать VIN'))}><Copy size={16} /></button></dd></div></dl><div className="form-actions"><button className="button button-secondary" onClick={() => setPanel('edit')}><Pencil size={17} />Редактировать</button></div></Dialog>}
    {panel === 'edit' && <CarEditorDialog car={car} onClose={() => setPanel(null)} />}
    {panel === 'reminder' && reminder && <Dialog title="Ближайшее обслуживание" onClose={() => setPanel(null)}><div className="notice">Пример планирования в деморежиме</div><h3>{reminder.title}</h3><p className="muted">Плановый пробег — {number(reminder.mileage)} км. Дата — {date(reminder.date)}. Ориентируйтесь на событие, которое наступит раньше.</p><p className="muted">Сохранение собственных напоминаний появится в следующей версии.</p><div className="form-actions"><Link className="button button-primary" to={`/cars/${car.id}/records/new`} onClick={() => setPanel(null)}>Записать обслуживание<ArrowUpRight size={18} /></Link></div></Dialog>}
    {panel === 'archive' && <Dialog title="Убрать автомобиль из гаража?" onClose={() => !busy && setPanel(null)}><p className="muted">{car.manufacturer} {car.model} исчезнет из списка. История обслуживания сохранится. Возврат автомобиля из архива в интерфейсе пока недоступен.</p>{error && <p className="field-error" role="alert">{error}</p>}<div className="form-actions"><button className="button button-secondary" disabled={busy} onClick={() => setPanel(null)}>Отмена</button><button className="button button-danger" disabled={busy} onClick={async () => { setBusy(true); try { await gateway.deleteCar(mode, car.id); await cache.invalidateQueries({ queryKey: [mode, 'cars'] }); await cache.invalidateQueries({ queryKey: [mode, 'records'] }); notify('Автомобиль убран из гаража'); navigate('/cars'); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }}>{busy ? 'Сохраняем…' : 'Убрать из гаража'}</button></div></Dialog>}
  </>;
}
