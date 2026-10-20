import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Check, Database, FileText, FlaskConical, MapPin, Phone, Plus, RotateCcw, Store, Wrench } from 'lucide-react';
import { useApp } from '../app-context';
import { gateway, resetDemo } from '../data/gateway';
import { errorMessage } from '../lib/format';
import { Dialog, EmptyState, ErrorState, Loading } from '../components/ui';
import { RecordTable } from '../components/RecordTable';

export function History() {
  const { mode } = useApp();
  const records = useQuery({ queryKey: [mode, 'records'], queryFn: () => gateway.listRecords(mode), enabled: mode === 'demo' });
  const centers = useQuery({ queryKey: [mode, 'centers'], queryFn: () => gateway.listCenters(mode), enabled: mode === 'demo' });
  const cars = useQuery({ queryKey: [mode, 'cars', 'history'], queryFn: () => gateway.listCars(mode, { size: 100 }), enabled: mode === 'demo' });
  return <><div className="page-eyebrow">НИЧЕГО НЕ ЗАБУДЕТСЯ</div><div className="page-heading"><div><h1>История работ</h1><p className="page-subtitle">Каждое обслуживание. Каждый важный номер.</p></div></div>{mode === 'api' ? <EmptyState icon={<Wrench size={32} />} title="История скоро появится" description="Чтение записей на сервере ещё в работе. Уже сейчас можно добавить обслуживание из карточки автомобиля." action={<Link className="button button-primary" to="/cars">К автомобилям<ArrowRight size={18} /></Link>} /> : records.isPending ? <Loading /> : records.isError ? <ErrorState error={records.error} onRetry={() => void records.refetch()} /> : <RecordTable records={records.data} centers={centers.data ?? []} cars={cars.data?.cars} title="Все записи" />}</>;
}

export function Centers() {
  const { mode, notify } = useApp();
  const cache = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const centers = useQuery({ queryKey: [mode, 'centers'], queryFn: () => gateway.listCenters(mode), enabled: mode === 'demo' });
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError('');
    const data = new FormData(event.currentTarget);
    const input = { name: String(data.get('name') || '').trim(), address: String(data.get('address') || '').trim(), phone: String(data.get('phone') || '').trim() || null };
    if (!input.name || !input.address) { setError('Заполните название и адрес сервиса.'); return; }
    setBusy(true);
    try { await gateway.createCenter(mode, input); await cache.invalidateQueries({ queryKey: [mode, 'centers'] }); setCreating(false); notify('Сервис добавлен в демогараж'); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };
  return <><div className="page-eyebrow">ПРОВЕРЕННЫЕ МЕСТА</div><div className="page-heading"><div><h1>Сервисные центры</h1><p className="page-subtitle">Контакты тех, кому вы доверяете автомобиль.</p></div>{mode === 'demo' && <button className="button button-primary" onClick={() => { setError(''); setCreating(true); }}><Plus size={21} />Добавить сервис</button>}</div>
    {mode === 'api' ? <EmptyState icon={<Store size={34} />} title="Сервисы скоро появятся" description="Создание и список сервисных центров ещё не подключены к серверу. Пока можно записывать самостоятельное обслуживание." action={<Link className="button button-secondary" to="/cars">К автомобилям</Link>} /> : centers.isPending ? <Loading /> : centers.isError ? <ErrorState error={centers.error} onRetry={() => void centers.refetch()} /> : <div className="centers-grid">{centers.data.map(center => <article className="center-card" key={center.id}><div className="center-logo"><Store size={27} strokeWidth={1.6} /></div><h2>{center.name}</h2><p><MapPin size={17} /><span>{center.address}</span></p>{center.phone && <p><Phone size={17} /><a href={`tel:${center.phone.replace(/[^+\d]/g, '')}`}>{center.phone}</a></p>}</article>)}</div>}
    {creating && <Dialog title="Добавить сервис" onClose={() => !busy && setCreating(false)}><form onSubmit={submit}><fieldset className="plain-fieldset" disabled={busy}><div className="form-grid"><div className="field span-two"><label className="field-label" htmlFor="center-name">Название</label><input id="center-name" name="name" className="input" required maxLength={255} placeholder="Название сервисного центра" /></div><div className="field span-two"><label className="field-label" htmlFor="center-address">Адрес</label><input id="center-address" name="address" className="input" required maxLength={255} placeholder="Город, улица, дом" /></div><div className="field span-two"><label className="field-label" htmlFor="center-phone">Телефон · необязательно</label><input id="center-phone" name="phone" type="tel" className="input" maxLength={255} placeholder="+7 999 123-45-67" /></div></div>{error && <p className="field-error" role="alert">{error}</p>}<div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setCreating(false)}>Отмена</button><button className="button button-primary">{busy ? 'Сохраняем…' : 'Добавить сервис'}</button></div></fieldset></form></Dialog>}
  </>;
}

export function Documents() {
  return <><div className="page-eyebrow">ПОД РУКОЙ</div><div className="page-heading"><div><h1>Документы</h1><p className="page-subtitle">Важное об автомобиле — рядом с его историей.</p></div></div><div className="coming-soon"><div className="document-illustration"><FileText size={56} strokeWidth={1.2} /><span>СК</span></div><span className="eyebrow-badge">В СЛЕДУЮЩЕЙ ВЕРСИИ</span><h2>Бумаги найдут своё место</h2><p>Заказ-наряды, чеки и документы автомобиля.<br />Загрузка файлов появится после подключения хранилища.</p><Link className="button button-secondary" to="/cars">Вернуться в гараж<ArrowRight size={17} /></Link></div></>;
}

export function Settings() {
  const { mode, setMode, notify } = useApp();
  const navigate = useNavigate();
  const cache = useQueryClient();
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return <><div className="page-eyebrow">КАК ВАМ УДОБНО</div><div className="page-heading"><div><h1>Настройки</h1><p className="page-subtitle">Выберите, с какими данными работать.</p></div></div><section className="settings-section"><h2>Режим работы</h2><div className="mode-grid">{([{ value: 'demo', title: 'Демонстрация', Icon: FlaskConical, text: 'Готовый гараж, история и сервисы. Все изменения сохраняются только в этом браузере.' }, { value: 'api', title: 'Мой сервер', Icon: Database, text: 'Ваши автомобили и владельцы из Spring. Создание записей сохраняет данные на сервере.' }] as const).map(option => <button className={`mode-card ${mode === option.value ? 'active' : ''}`} key={option.value} onClick={() => { if (mode !== option.value) setMode(option.value); }} aria-pressed={mode === option.value}><option.Icon size={27} strokeWidth={1.6} /><span className="mode-choice">{mode === option.value && <Check size={14} />}</span><strong>{option.title}</strong><span>{option.text}</span></button>)}</div><p className="settings-note">Демонстрационные и реальные данные хранятся отдельно. Переключение не переносит записи между режимами.</p><Link className="button button-primary" to="/cars">Открыть гараж<ArrowRight size={19} /></Link></section>
    <section className="settings-section"><h2>Подключение</h2><div className="connection-row"><span className="connection-icon"><Database size={23} /></span><div><strong>Локальный Spring-сервер</strong><p>По умолчанию: localhost:8080. Запустите backend перед переходом в режим «Мой сервер».</p></div><span className="status-label">{mode === 'demo' ? 'Не используется' : 'Выбран'}</span></div><p className="settings-note">В режиме сервера доступны автомобили, владельцы и создание записей. История, сервисные центры и документы подключаются по мере готовности.</p></section>
    <section className="settings-section reset-section"><div><h2>Начать демонстрацию заново</h2><p className="muted">Восстановить примеры автомобилей и записей. Изменения демогаража будут удалены.</p></div><button className="button button-secondary" onClick={() => { setError(''); setConfirmReset(true); }}><RotateCcw size={18} />Восстановить примеры</button></section>
    {confirmReset && <Dialog title="Восстановить демогараж?" onClose={() => !busy && setConfirmReset(false)}><p className="muted">Добавленные вами демонстрационные автомобили, сервисы и записи будут заменены исходными примерами. Данные Spring-сервера не затрагиваются.</p>{error && <p className="field-error" role="alert">{error}</p>}<div className="form-actions"><button className="button button-secondary" disabled={busy} onClick={() => setConfirmReset(false)}>Отмена</button><button className="button button-primary" disabled={busy} onClick={async () => { setBusy(true); try { await resetDemo(); cache.clear(); if (mode !== 'demo') setMode('demo'); notify('Демонстрационные данные восстановлены'); navigate('/cars'); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); } }}>{busy ? 'Восстанавливаем…' : 'Восстановить'}</button></div></Dialog>}
  </>;
}
