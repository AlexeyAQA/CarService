import { Link, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Check, Copy, Gauge, Store, Wrench } from 'lucide-react';
import { useApp } from '../app-context';
import { gateway } from '../data/gateway';
import type { MaintenanceRecord } from '../data/types';
import { date, money, number } from '../lib/format';
import { BackLink, EmptyState, ErrorState, Loading } from '../components/ui';

export default function RecordDetails() {
  const { carId = '', recordId = '' } = useParams();
  const { mode, notify } = useApp();
  const cache = useQueryClient();
  const cached = cache.getQueryData<MaintenanceRecord>([mode, 'record', carId, recordId]);
  const record = useQuery({ queryKey: [mode, 'record', carId, recordId], queryFn: () => gateway.getRecord(mode, carId, recordId), enabled: mode === 'demo', staleTime: mode === 'api' ? Infinity : 30_000 });
  const car = useQuery({ queryKey: [mode, 'car', carId], queryFn: () => gateway.getCar(mode, carId) });
  const centers = useQuery({ queryKey: [mode, 'centers'], queryFn: () => gateway.listCenters(mode), enabled: mode === 'demo' });
  if (mode === 'api' && !cached) return <><BackLink to={`/cars/${carId}`}>К автомобилю</BackLink><EmptyState icon={<Wrench size={32} />} title="Просмотр записи пока недоступен" description="API чтения записей ещё не подключено. Ответ после создания можно посмотреть до перезагрузки страницы." action={<Link className="button button-secondary" to={`/cars/${carId}`}>Вернуться к автомобилю</Link>} /></>;
  if (record.isPending) return <Loading />;
  if (record.isError) return <ErrorState error={record.error} onRetry={() => void record.refetch()} />;
  const data = record.data;
  const center = centers.data?.find(c => c.id === data.serviceCenterId);
  return <div className="record-page"><BackLink to={`/cars/${carId}`}>К автомобилю</BackLink><div className="page-heading"><div><div className="record-label"><Check size={14} />СОХРАНЕНО</div><h1>{data.description?.trim() || 'Запись обслуживания'}</h1><p className="page-subtitle">{car.data ? `${car.data.manufacturer} ${car.data.model} · ${car.data.regNumber || ''}` : 'Сервисная книжка'}</p></div></div>
    {mode === 'api' && <div className="notice">Запись сохранена на сервере. Здесь показан ответ на создание; повторное чтение после перезагрузки станет доступно с API истории.</div>}
    <div className="record-facts"><div><CalendarDays size={23} /><span>Дата обслуживания<strong>{date(data.serviceDate)}</strong></span></div><div><Gauge size={23} /><span>Пробег<strong>{number(data.mileage)} км</strong></span></div><div><Store size={23} /><span>Исполнитель<strong>{data.performerType === 'SELF' ? 'Самостоятельно' : center?.name || 'В сервисе'}</strong></span></div></div>
    <section className="record-items-section"><h2>Работы и запчасти</h2><div className="table-scroll"><table className="items-table"><thead><tr><th>Наименование</th><th>Тип</th><th>Номер запчасти · PN</th><th className="align-right">Сумма</th></tr></thead><tbody>{[...data.items].sort((a, b) => a.position - b.position).map(item => <tr key={item.id}><td>{item.name}</td><td><span className={`type-badge ${item.type === 'PART' ? 'type-part' : ''}`}>{item.type === 'WORK' ? 'Работа' : 'Запчасть'}</span></td><td>{item.partNumber ? <span className="part-number">{item.partNumber}<button className="icon-button" aria-label={`Скопировать PN ${item.partNumber}`} onClick={() => void navigator.clipboard.writeText(item.partNumber!).then(() => notify('Номер запчасти скопирован')).catch(() => notify('Не удалось скопировать номер'))}><Copy size={15} /></button></span> : <span className="muted">—</span>}</td><td className="align-right table-amount">{money(item.amount)}</td></tr>)}</tbody></table></div><div className="record-total"><span>Итого</span><strong>{money(data.totalAmount)}</strong></div></section>
    {data.description && <section className="record-comment"><h3>Комментарий</h3><p>{data.description}</p></section>}
    <div className="form-actions"><Link className="button button-secondary" to={`/cars/${carId}`}>К истории автомобиля</Link></div>
  </div>;
}
