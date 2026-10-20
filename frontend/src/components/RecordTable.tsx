import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, SlidersHorizontal, Wrench, X } from 'lucide-react';
import type { Car, MaintenanceRecord, ServiceCenter } from '../data/types';
import { date, money, number, recordCount } from '../lib/format';
import { EmptyState } from './ui';

export function RecordTable({ records, centers, cars, action, title = 'История обслуживания' }: {
  records: MaintenanceRecord[]; centers: ServiceCenter[]; cars?: Car[]; action?: React.ReactNode; title?: string;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [performer, setPerformer] = useState('');
  const [count, setCount] = useState(5);
  const centerName = (record: MaintenanceRecord) => record.performerType === 'SELF' ? 'Самостоятельно' : centers.find(c => c.id === record.serviceCenterId)?.name || 'В сервисе';
  const filtered = useMemo(() => records.filter(record => (!performer || record.performerType === performer) &&
    `${record.description || ''} ${record.items.map(i => `${i.name} ${i.partNumber || ''}`).join(' ')}`.toLocaleLowerCase('ru').includes(search.toLocaleLowerCase('ru')))
    .sort((a, b) => b.serviceDate.localeCompare(a.serviceDate) || b.id.localeCompare(a.id)), [records, search, performer]);
  return <section className="history-section">
    <div className="section-heading"><div className="heading-with-count"><h2>{title}</h2><span className="muted">{recordCount(records.length)}</span></div><div className="heading-actions"><button className={`button button-secondary ${filtersOpen ? 'is-selected' : ''}`} aria-expanded={filtersOpen} aria-controls="record-filters" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={19} />Фильтры{(search || performer) && <i className="filter-dot" />}</button>{action}</div></div>
    {filtersOpen && <div id="record-filters" className="filter-panel"><label className="search-box"><Search size={18} /><input placeholder="Название работы или PN запчасти" aria-label="Поиск по работам и PN" value={search} onChange={e => { setSearch(e.target.value); setCount(5); }} />{search && <button className="icon-button" aria-label="Очистить поиск" onClick={() => { setSearch(''); setCount(5); }}><X size={16} /></button>}</label><select className="input" aria-label="Исполнитель" value={performer} onChange={e => { setPerformer(e.target.value); setCount(5); }}><option value="">Все исполнители</option><option value="SERVICE_CENTER">В сервисе</option><option value="SELF">Самостоятельно</option></select></div>}
    {filtered.length ? <><div className="table-scroll"><table className="history-table"><thead><tr><th>Дата и пробег</th><th>{cars ? 'Автомобиль и работы' : 'Работы'}</th><th className="align-right">Сумма</th><th><span className="sr-only">Подробнее</span></th></tr></thead><tbody>
      {filtered.slice(0, count).map(record => {
        const car = cars?.find(c => c.id === record.carId);
        const title = record.description?.trim() || record.items.filter(i => i.type === 'WORK').map(i => i.name).join(', ') || record.items.map(i => i.name).join(', ');
        return <tr key={record.id}><td><span className="table-primary">{date(record.serviceDate)}</span><span className="table-secondary">{number(record.mileage)} км</span></td><td><Link className="record-title" to={`/cars/${record.carId}/records/${record.id}`}>{title}</Link><span className="table-secondary">{car ? `${car.manufacturer} ${car.model} · ` : ''}{centerName(record)}</span></td><td className="align-right table-amount">{money(record.totalAmount)}</td><td><Link className="row-arrow" to={`/cars/${record.carId}/records/${record.id}`} aria-label={`Открыть запись от ${date(record.serviceDate)}`}><ChevronRight size={21} /></Link></td></tr>;
      })}
    </tbody></table></div><div className="table-footer"><span>Показано {Math.min(count, filtered.length)} из {filtered.length} записей</span>{count < filtered.length && <button className="button-link" onClick={() => setCount(count + 5)}>Показать ещё <ChevronRight size={17} /></button>}</div></> : <EmptyState icon={<Wrench size={30} />} title={records.length ? 'Таких записей пока нет' : 'История начинается здесь'} description={records.length ? 'Измените поиск или выберите другого исполнителя.' : 'Добавьте первое обслуживание. Работы, расходы и номера запчастей сохранятся вместе.'} />}
  </section>;
}
