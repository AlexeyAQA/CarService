import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus } from 'lucide-react';
import type { Car, CarCreateRequest, Owner, OwnerCreateRequest } from '../data/types';
import { errorMessage } from '../lib/format';

const carSchema = z.object({
  manufacturer: z.string().trim().min(1, 'Укажите марку').max(100, 'Не более 100 символов'),
  model: z.string().trim().min(1, 'Укажите модель').max(100, 'Не более 100 символов'),
  vin: z.string().trim().toUpperCase().regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'Нужно 17 латинских букв и цифр, без I, O и Q'),
  regNumber: z.string().trim().max(20, 'Не более 20 символов'),
  year: z.string().refine(v => /^\d{4}$/.test(v) && Number(v) >= 1886 && Number(v) <= new Date().getFullYear(), 'Укажите корректный год выпуска'),
  mileage: z.string().refine(v => /^\d+$/.test(v) && Number(v) <= 2147483647, 'Укажите целый неотрицательный пробег'),
  ownerId: z.string().min(1, 'Выберите владельца'),
});
const ownerSchema = z.object({
  fullName: z.string().trim().min(2, 'Минимум 2 символа').max(100, 'Не более 100 символов'),
  phone: z.string().regex(/^7\d{10}$/, 'Нужно 11 цифр, начиная с 7'),
  email: z.email('Введите корректный email'),
});
type CarValues = z.infer<typeof carSchema>;
interface Props {
  initialCar?: Car; owners: Owner[]; ownersLoading?: boolean; ownersError?: string;
  onCreateOwner: (input: OwnerCreateRequest) => Promise<Owner>;
  onSubmit: (input: CarCreateRequest) => Promise<void>; onCancel: () => void;
}
export function CarForm({ initialCar: car, owners, ownersLoading, ownersError, onCreateOwner, onSubmit, onCancel }: Props) {
  const id = useId();
  const [newOwner, setNewOwner] = useState(false);
  const [createdOwners, setCreatedOwners] = useState<Owner[]>([]);
  const [error, setError] = useState('');
  const form = useForm<CarValues>({ resolver: zodResolver(carSchema), defaultValues: {
    manufacturer: car?.manufacturer ?? '', model: car?.model ?? '', vin: car?.vin ?? '', regNumber: car?.regNumber ?? '',
    year: car ? String(car.year) : '', mileage: car ? String(car.mileage) : '', ownerId: car?.ownerId ?? owners[0]?.id ?? '',
  } });
  const ownerForm = useForm<OwnerCreateRequest>({ resolver: zodResolver(ownerSchema), defaultValues: { fullName: '', phone: '', email: '' } });
  const { errors, isSubmitting } = form.formState;
  const allOwners = [...owners, ...createdOwners.filter(o => !owners.some(existing => existing.id === o.id))];
  const fields: Array<{ name: keyof CarValues; label: string; placeholder: string; maxLength?: number; numeric?: boolean }> = [
    { name: 'manufacturer', label: 'Марка', placeholder: 'Renault', maxLength: 100 },
    { name: 'model', label: 'Модель', placeholder: 'Duster', maxLength: 100 },
    { name: 'vin', label: 'VIN', placeholder: '17 символов', maxLength: 17 },
    { name: 'regNumber', label: 'Госномер · необязательно', placeholder: 'А123ВС 77', maxLength: 20 },
    { name: 'year', label: 'Год выпуска', placeholder: '2018', maxLength: 4, numeric: true },
    { name: 'mileage', label: 'Пробег, км', placeholder: '87450', maxLength: 10, numeric: true },
  ];
  if (newOwner) return <form noValidate onSubmit={ownerForm.handleSubmit(async input => {
    setError(''); try { const owner = await onCreateOwner(input); setCreatedOwners(previous => [...previous, owner]); form.setValue('ownerId', owner.id, { shouldValidate: true }); setNewOwner(false); ownerForm.reset(); } catch (e) { setError(errorMessage(e)); }
  })}>
    <button type="button" className="button-link" onClick={() => { setNewOwner(false); setError(''); }}><ArrowLeft size={17} />К данным автомобиля</button><h3>Новый владелец</h3>
    <div className="form-grid">{([{ name: 'fullName', label: 'Имя и фамилия', placeholder: 'Алексей Иванов' }, { name: 'phone', label: 'Телефон', placeholder: '79991234567' }, { name: 'email', label: 'Email', placeholder: 'alexey@example.com' }] as const).map(field => <div className={`field ${field.name === 'fullName' ? 'span-two' : ''}`} key={field.name}><label className="field-label" htmlFor={`${id}-${field.name}`}>{field.label}</label><input className="input" id={`${id}-${field.name}`} placeholder={field.placeholder} type={field.name === 'email' ? 'email' : field.name === 'phone' ? 'tel' : 'text'} aria-invalid={Boolean(ownerForm.formState.errors[field.name])} {...ownerForm.register(field.name)} />{ownerForm.formState.errors[field.name] && <span className="field-error">{ownerForm.formState.errors[field.name]?.message}</span>}</div>)}</div>
    <p className="field-hint">Телефон — 11 цифр, начиная с 7, без плюса и пробелов.</p>{error && <p className="field-error" role="alert">{error}</p>}<div className="form-actions"><button className="button button-primary" disabled={ownerForm.formState.isSubmitting}>{ownerForm.formState.isSubmitting ? 'Сохраняем…' : 'Добавить владельца'}</button></div>
  </form>;
  return <form noValidate onSubmit={form.handleSubmit(async input => {
    setError('');
    if (car && Number(input.mileage) < car.mileage) { form.setError('mileage', { message: 'Текущий пробег нельзя уменьшить' }, { shouldFocus: true }); return; }
    if (car?.regNumber && !input.regNumber) { form.setError('regNumber', { message: 'Очистка госномера пока не поддерживается. Укажите новое значение.' }, { shouldFocus: true }); return; }
    try { await onSubmit({ ...input, regNumber: input.regNumber || null, year: Number(input.year), mileage: Number(input.mileage) }); } catch (e) { setError(errorMessage(e)); }
  })}>
    <fieldset className="plain-fieldset" disabled={isSubmitting}><div className="form-grid">{fields.map(field => <div className="field" key={field.name}><label className="field-label" htmlFor={`${id}-${field.name}`}>{field.label}</label><input className="input" id={`${id}-${field.name}`} placeholder={field.placeholder} maxLength={field.maxLength} inputMode={field.numeric ? 'numeric' : 'text'} readOnly={field.name === 'vin' && Boolean(car)} aria-invalid={Boolean(errors[field.name])} {...form.register(field.name)} />{errors[field.name] && <span className="field-error" role="alert">{errors[field.name]?.message}</span>}</div>)}
    <div className="field span-two"><label className="field-label" htmlFor={`${id}-owner`}>Владелец</label><select className="input" id={`${id}-owner`} aria-invalid={Boolean(errors.ownerId)} {...form.register('ownerId')}><option value="">{ownersLoading ? 'Загружаем владельцев…' : 'Выберите владельца'}</option>{allOwners.map(owner => <option key={owner.id} value={owner.id}>{owner.fullName}</option>)}</select>{errors.ownerId && <span className="field-error">{errors.ownerId.message}</span>}{ownersError && <span className="field-error">{ownersError}</span>}<button type="button" className="button-link field-action" onClick={() => { setError(''); setNewOwner(true); }}><Plus size={16} />Добавить владельца</button></div></div>
    {error && <div className="notice notice-error" role="alert">{error}</div>}<div className="form-actions"><button type="button" className="button button-secondary" onClick={onCancel}>Отмена</button><button type="submit" className="button button-primary">{isSubmitting ? 'Сохраняем…' : car ? 'Сохранить изменения' : 'Добавить автомобиль'}</button></div></fieldset>
  </form>;
}
