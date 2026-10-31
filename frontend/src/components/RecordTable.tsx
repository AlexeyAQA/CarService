import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { ChevronRight, SlidersHorizontal, Wrench } from 'lucide-react';
import type { RecordFilters, PerformerType } from '../data/types';
import { gateway } from '../data/gateway';
import { date, money, number, recordCount } from '../lib/format';
import { EmptyState, ErrorState, Loading } from './ui';

export function RecordTable({ carId, action, title = 'История обслуживания' }: {
  carId: string; action?: ReactNode; title?: string;
}) {
  const filterId = useId();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState<RecordFilters>({});
  const [filters, setFilters] = useState<RecordFilters>({});
  const [validation, setValidation] = useState('');
  const centers = useQuery({ queryKey: ['centers'], queryFn: () => gateway.listCenters() });
  const history = useInfiniteQuery({
    queryKey: ['records', carId, filters],
    queryFn: ({ pageParam, signal }) => gateway.listRecords(carId, filters, pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: last => last.page + 1 < last.totalPages ? last.page + 1 : undefined,
  });
  const records = history.data?.pages.flatMap(page => page.records) ?? [];
  const total = history.data?.pages[0]?.totalElements;
  const filtered = Object.values(filters).some(Boolean);
  const apply = (event: FormEvent) => {
    event.preventDefault();
    if (draft.dateFrom && draft.dateTo && draft.dateFrom > draft.dateTo) {
      setValidation('Дата «С» должна быть не позже даты «По».'); return;
    }
    setValidation('');
    setFilters({ ...draft, q: draft.q?.trim() || undefined });
  };
  return <section className="history-section">
    <div className="section-heading"><div className="heading-with-count"><h2>{title}</h2><span className="muted">{total === undefined ? '—' : recordCount(total)}</span></div><div className="heading-actions"><button className={`button button-secondary ${filtersOpen ? 'is-selected' : ''}`} aria-expanded={filtersOpen} aria-controls={filterId} onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={19} />Фильтры{filtered && <i className="filter-dot" />}</button>{action}</div></div>
    {filtersOpen && <form id={filterId} className="history-filters" onSubmit={apply}>
      <label className="field history-search"><span className="field-label">Работа или артикул</span><input className="input" placeholder="Название работы или PN запчасти" maxLength={255} value={draft.q ?? ''} onChange={e => setDraft({ ...draft, q: e.target.value })} /></label>
      <label className="field"><span className="field-label">С даты</span><input className="input" type="date" value={draft.dateFrom ?? ''} onChange={e => setDraft({ ...draft, dateFrom: e.target.value })} /></label>
      <label className="field"><span className="field-label">По дату</span><input className="input" type="date" value={draft.dateTo ?? ''} onChange={e => setDraft({ ...draft, dateTo: e.target.value })} /></label>
      <label className="field"><span className="field-label">Исполнитель</span><select className="input" value={draft.performerType ?? ''} onChange={e => { const performerType = e.target.value as PerformerType | ''; setDraft({ ...draft, performerType: performerType || undefined, serviceCenterId: performerType === 'SELF' ? undefined : draft.serviceCenterId }); }}><option value="">Все исполнители</option><option value="SERVICE_CENTER">В сервисе</option><option value="SELF">Самостоятельно</option></select></label>
      <label className="field"><span className="field-label">Сервисный центр</span><select className="input" disabled={draft.performerType === 'SELF' || centers.isPending || centers.isError} value={draft.serviceCenterId ?? ''} onChange={e => setDraft({ ...draft, serviceCenterId: e.target.value || undefined })}><option value="">Все сервисы</option>{centers.data?.map(center => <option key={center.id} value={center.id}>{center.name} · {center.address}</option>)}</select></label>
      {centers.isError && <div className="history-filter-message notice" role="alert">Не удалось загрузить сервисные центры. <button type="button" className="button-link" onClick={() => void centers.refetch()}>Повторить</button></div>}
      {validation && <p className="history-filter-message field-error" role="alert">{validation}</p>}
      <div className="history-filter-actions"><button className="button button-primary">Применить</button><button type="button" className="button button-secondary" onClick={() => { setDraft({}); setFilters({}); setValidation(''); }}>Сбросить</button></div>
    </form>}
    {history.isPending ? <Loading text="Загружаем историю…" /> : history.isError && !history.data ? <ErrorState error={history.error} onRetry={() => void history.refetch()} /> : records.length ? <>
      <div className="table-scroll"><table className="history-table"><thead><tr><th>Дата и пробег</th><th>Работы</th><th className="align-right">Сумма</th><th><span className="sr-only">Подробнее</span></th></tr></thead><tbody>{records.map(record => {
        const workTitle = record.items.filter(item => item.type === 'WORK').map(item => item.name).join(', ') || record.items.map(item => item.name).join(', ');
        const centerName = record.performerType === 'SELF' ? 'Самостоятельно' : centers.data?.find(center => center.id === record.serviceCenterId)?.name || 'В сервисе';
        return <tr key={record.id}><td><span className="table-primary">{date(record.serviceDate)}</span><span className="table-secondary">{number(record.mileage)} км</span></td><td><Link className="record-title" to={`/cars/${carId}/records/${record.id}`}>{workTitle}</Link><span className="table-secondary">{centerName}</span></td><td className="align-right table-amount">{money(record.totalAmount)}</td><td><Link className="row-arrow" to={`/cars/${carId}/records/${record.id}`} aria-label={`Открыть запись от ${date(record.serviceDate)}`}><ChevronRight size={21} /></Link></td></tr>;
      })}</tbody></table></div>
      {history.isError && <ErrorState error={history.error} onRetry={() => void (history.isFetchNextPageError ? history.fetchNextPage() : history.refetch())} />}
      <div className="table-footer"><span>Показано {records.length} из {total} записей</span>{history.hasNextPage && <button className="button-link" disabled={history.isFetching} onClick={() => void history.fetchNextPage()}>{history.isFetchingNextPage ? 'Загружаем…' : 'Показать ещё'}<ChevronRight size={17} /></button>}</div>
    </> : <EmptyState icon={<Wrench size={30} />} title={filtered ? 'Таких записей пока нет' : 'История начинается здесь'} description={filtered ? 'Измените параметры фильтра или сбросьте их.' : 'Добавьте первое обслуживание. Работы, расходы и номера запчастей сохранятся вместе.'} />}
  </section>;
}
