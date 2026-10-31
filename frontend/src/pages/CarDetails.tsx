import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive, ChevronRight, Copy, MoreHorizontal, Pencil, Plus } from 'lucide-react';
import { useApp } from '../app-context';
import { gateway } from '../data/gateway';
import { errorMessage, number } from '../lib/format';
import { BackLink, CarVisual, Dialog, ErrorState, Loading } from '../components/ui';
import { RecordTable } from '../components/RecordTable';
import { CarEditorDialog } from '../components/CarEditorDialog';

export default function CarDetails() {
  const { carId = '' } = useParams();
  const { notify } = useApp();
  const navigate = useNavigate();
  const cache = useQueryClient();
  const [panel, setPanel] = useState<'about' | 'edit' | 'archive' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const carQuery = useQuery({ queryKey: ['car', carId], queryFn: () => gateway.getCar(carId) });
  if (carQuery.isPending) return <Loading />;
  if (carQuery.isError) return <ErrorState error={carQuery.error} onRetry={() => void carQuery.refetch()} />;
  const car = carQuery.data;
  const newRecordButton = <Link className="button button-primary" to={`/cars/${car.id}/records/new`}><Plus size={24} />Добавить запись</Link>;
  return <>
    <BackLink to="/cars">Все автомобили</BackLink>
    <div className="car-hero"><div className="car-hero-art"><CarVisual car={car} /></div><div className="car-hero-copy"><span className="car-kicker">МОЯ СЕРВИСНАЯ КНИЖКА</span><h1>{car.manufacturer} {car.model}</h1><p className="hero-meta">{car.regNumber || 'Без госномера'}<span>·</span>{car.year}<span>·</span>{number(car.mileage)} км</p><button className="button-link about-link" onClick={() => setPanel('about')}>Об автомобиле<ChevronRight size={19} /></button></div><details className="car-menu"><summary aria-label="Действия с автомобилем"><MoreHorizontal size={23} /></summary><div className="dropdown-menu"><button onClick={() => setPanel('edit')}><Pencil size={17} />Редактировать</button><button onClick={() => { setError(''); setPanel('archive'); }}><Archive size={17} />Убрать из гаража</button></div></details></div>
    <RecordTable key={car.id} carId={car.id} action={newRecordButton} />
    {panel === 'about' && <Dialog title="Об автомобиле" onClose={() => setPanel(null)}><p className="dialog-subtitle">{car.manufacturer} {car.model}</p><dl className="detail-grid"><div><dt>Госномер</dt><dd>{car.regNumber || 'Не указан'}</dd></div><div><dt>Год выпуска</dt><dd>{car.year}</dd></div><div><dt>Текущий пробег</dt><dd>{number(car.mileage)} км</dd></div><div><dt>VIN</dt><dd className="copy-value">{car.vin}<button className="icon-button" aria-label="Скопировать VIN" onClick={() => void navigator.clipboard.writeText(car.vin).then(() => notify('VIN скопирован')).catch(() => notify('Не удалось скопировать VIN'))}><Copy size={16} /></button></dd></div></dl><div className="form-actions"><button className="button button-secondary" onClick={() => setPanel('edit')}><Pencil size={17} />Редактировать</button></div></Dialog>}
    {panel === 'edit' && <CarEditorDialog car={car} onClose={() => setPanel(null)} />}
    {panel === 'archive' && <Dialog title="Убрать автомобиль из гаража?" onClose={() => !busy && setPanel(null)}><p className="muted">{car.manufacturer} {car.model} исчезнет из списка. История обслуживания сохранится. Возврат автомобиля из архива в интерфейсе пока недоступен.</p>{error && <p className="field-error" role="alert">{error}</p>}<div className="form-actions"><button className="button button-secondary" disabled={busy} onClick={() => setPanel(null)}>Отмена</button><button className="button button-danger" disabled={busy} onClick={async () => { setBusy(true); try { await gateway.deleteCar(car.id); await cache.invalidateQueries({ queryKey: ['cars'] }); await cache.invalidateQueries({ queryKey: ['records'] }); notify('Автомобиль убран из гаража'); navigate('/cars'); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }}>{busy ? 'Сохраняем…' : 'Убрать из гаража'}</button></div></Dialog>}
  </>;
}
