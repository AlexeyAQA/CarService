import { useId, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, ChevronDown, LoaderCircle, Plus, Trash2 } from 'lucide-react';
import type { Car, MaintenanceCreateRequest, ServiceCenter } from '../data/types';
import './maintenance-form.css';

interface MaintenanceFormProps {
  car: Car;
  centers: ServiceCenter[];
  onSubmit: (input: MaintenanceCreateRequest) => Promise<void>;
  onCancel: () => void;
}

// A deliberate UI limit below DECIMAL(19, 2): JSON numbers remain precise to a kopeck.
const MAX_AMOUNT_CENTS = 99_999_999_999n;
const amountPattern = /^\d{1,9}(?:[.,]\d{1,2})?$/;

function localToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isRealDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && date.getFullYear() === year
    && date.getMonth() + 1 === month && date.getDate() === day;
}

function amountInCents(raw: string): bigint | null {
  const value = raw.trim();
  if (!amountPattern.test(value)) return null;
  const [rubles, fraction = ''] = value.replace(',', '.').split('.');
  const cents = BigInt(rubles) * 100n + BigInt(fraction.padEnd(2, '0'));
  return cents <= MAX_AMOUNT_CENTS ? cents : null;
}

function formatCents(cents: bigint) {
  const rubles = new Intl.NumberFormat('ru-RU').format(cents / 100n);
  const remainder = cents % 100n;
  return `${rubles}${remainder ? `,${String(remainder).padStart(2, '0')}` : ''} ₽`;
}

const formSchema = z.object({
  serviceDate: z.string().refine(isRealDate, 'Укажите дату обслуживания')
    .refine((value) => !isRealDate(value) || value <= localToday(), 'Дата не может быть в будущем'),
  mileage: z.string().refine((value) => /^\d+$/.test(value) && Number(value) <= 2_147_483_647,
    'Укажите целый пробег от 0 до 2 147 483 647 км'),
  performerType: z.enum(['SELF', 'SERVICE_CENTER']),
  serviceCenterId: z.string(),
  description: z.string().max(255, 'Комментарий — не более 255 символов'),
  items: z.array(z.object({
    name: z.string().trim().min(1, 'Введите название').max(255, 'Не более 255 символов'),
    type: z.enum(['WORK', 'PART']),
    amount: z.string().refine((value) => amountInCents(value) !== null,
      'Сумма от 0 до 999 999 999,99 ₽, до двух знаков после запятой'),
    partNumber: z.string(),
  }).superRefine((item, context) => {
    if (item.type === 'PART' && item.partNumber.trim().length > 100) {
      context.addIssue({ code: 'custom', path: ['partNumber'], message: 'PN — не более 100 символов' });
    }
  })).min(1, 'Добавьте хотя бы одну работу или запчасть'),
}).superRefine((data, context) => {
  if (data.performerType === 'SERVICE_CENTER' && !z.uuid().safeParse(data.serviceCenterId.trim()).success) {
    context.addIssue({ code: 'custom', path: ['serviceCenterId'], message: 'Выберите сервисный центр' });
  }
});

type FormValues = z.infer<typeof formSchema>;

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <span id={id} className="field-error maintenance-field-error" role="alert">{message}</span> : null;
}

export function MaintenanceForm({ car, centers, onSubmit, onCancel }: MaintenanceFormProps) {
  const formId = useId();
  const [expanded, setExpanded] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceDate: localToday(),
      mileage: String(car.mileage),
      performerType: 'SELF',
      serviceCenterId: '',
      description: '',
      items: [{ name: '', type: 'WORK', amount: '', partNumber: '' }],
    },
    mode: 'onTouched',
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = useWatch({ control, name: 'items' });
  const performer = useWatch({ control, name: 'performerType' });
  const description = useWatch({ control, name: 'description' });
  const totalCents = items.reduce((sum, item) => sum + (amountInCents(item.amount || '') ?? 0n), 0n);
  const hasUnfinishedAmount = items.some((item) => amountInCents(item.amount || '') === null);

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);
    const input: MaintenanceCreateRequest = {
      serviceDate: values.serviceDate,
      mileage: Number(values.mileage),
      performerType: values.performerType,
      serviceCenterId: values.performerType === 'SERVICE_CENTER' ? values.serviceCenterId.trim() : null,
      description: values.description.trim() || null,
      items: values.items.map((item) => ({
        name: item.name.trim(),
        type: item.type,
        amount: Number(amountInCents(item.amount)) / 100,
        partNumber: item.type === 'PART' ? item.partNumber.trim() || null : null,
      })),
    };
    try {
      await onSubmit(input);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не удалось сохранить запись. Попробуйте ещё раз.');
    }
  }, (validationErrors) => {
    if (validationErrors.description) setExpanded(true);
  });

  return (
    <form className="maintenance-form" onSubmit={submit} noValidate aria-label="Новая запись обслуживания">
      <fieldset className="maintenance-fields" disabled={isSubmitting}>
        <div className="maintenance-date-mileage">
          <div className="field">
            <label className="field-label" htmlFor={`${formId}-date`}>Дата обслуживания</label>
            <input className="input" id={`${formId}-date`} type="date" max={localToday()}
              aria-invalid={Boolean(errors.serviceDate)} aria-describedby={errors.serviceDate ? `${formId}-date-error` : undefined}
              {...register('serviceDate')} />
            <FieldError id={`${formId}-date-error`} message={errors.serviceDate?.message} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor={`${formId}-mileage`}>Пробег, км</label>
            <input className="input" id={`${formId}-mileage`} type="text" inputMode="numeric" autoComplete="off"
              aria-invalid={Boolean(errors.mileage)} aria-describedby={errors.mileage ? `${formId}-mileage-error` : undefined}
              {...register('mileage')} />
            <FieldError id={`${formId}-mileage-error`} message={errors.mileage?.message} />
          </div>
        </div>

        <section className="maintenance-items-section" aria-labelledby={`${formId}-items-title`}>
          <div className="maintenance-section-heading">
            <h2 id={`${formId}-items-title`}>Работы и запчасти</h2>
            <span className="maintenance-position-count">{fields.length} {fields.length === 1 ? 'позиция' : fields.length < 5 ? 'позиции' : 'позиций'}</span>
          </div>
          <div className="maintenance-grid-labels" aria-hidden="true">
            <span>Наименование</span><span>Тип</span><span>Сумма, ₽</span><span />
          </div>
          <div className="maintenance-items">
            {fields.map((field, index) => {
              const itemId = `${formId}-item-${field.id}`;
              const itemErrors = errors.items?.[index];
              return (
                <div className={`maintenance-item-row${items[index]?.type === 'PART' ? ' maintenance-item-part' : ''}`} key={field.id}>
                  <div className="maintenance-name-field field">
                    <label className="maintenance-mobile-label" htmlFor={`${itemId}-name`}>Наименование</label>
                    <input className="input" id={`${itemId}-name`} placeholder="Например, замена масла" autoComplete="off" maxLength={255}
                      aria-invalid={Boolean(itemErrors?.name)} aria-describedby={itemErrors?.name ? `${itemId}-name-error` : undefined}
                      {...register(`items.${index}.name`)} />
                    <FieldError id={`${itemId}-name-error`} message={itemErrors?.name?.message} />
                    {items[index]?.type === 'PART' && (
                      <div className="maintenance-pn-field">
                        <label htmlFor={`${itemId}-pn`}>Артикул / PN <span>необязательно</span></label>
                        <input className="input maintenance-pn-input" id={`${itemId}-pn`} placeholder="Например, OC47" maxLength={100} autoComplete="off"
                          aria-invalid={Boolean(itemErrors?.partNumber)} aria-describedby={itemErrors?.partNumber ? `${itemId}-pn-error` : `${formId}-pn-help`}
                          {...register(`items.${index}.partNumber`)} />
                        <FieldError id={`${itemId}-pn-error`} message={itemErrors?.partNumber?.message} />
                      </div>
                    )}
                  </div>
                  <div className="maintenance-type-field field">
                    <label className="maintenance-mobile-label" htmlFor={`${itemId}-type`}>Тип</label>
                    <div className="maintenance-select-wrap">
                      <select className="input" id={`${itemId}-type`} {...register(`items.${index}.type`)}>
                        <option value="WORK">Работа</option><option value="PART">Запчасть</option>
                      </select>
                      <ChevronDown size={17} aria-hidden="true" />
                    </div>
                  </div>
                  <div className="maintenance-amount-field field">
                    <label className="maintenance-mobile-label" htmlFor={`${itemId}-amount`}>Сумма, ₽</label>
                    <input className="input maintenance-amount-input" id={`${itemId}-amount`} placeholder="0,00" inputMode="decimal" autoComplete="off"
                      aria-invalid={Boolean(itemErrors?.amount)} aria-describedby={itemErrors?.amount ? `${itemId}-amount-error` : undefined}
                      {...register(`items.${index}.amount`)} />
                    <FieldError id={`${itemId}-amount-error`} message={itemErrors?.amount?.message} />
                  </div>
                  <button className="icon-button maintenance-delete-item" type="button" onClick={() => remove(index)}
                    disabled={fields.length === 1} aria-label={`Удалить позицию ${index + 1}`}
                    title={fields.length === 1 ? 'В записи должна быть хотя бы одна позиция' : 'Удалить позицию'}>
                    <Trash2 size={19} aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>
          {items.some((item) => item.type === 'PART') && <p id={`${formId}-pn-help`} className="maintenance-pn-help">Сохраните номер запчасти, чтобы легко найти её к следующему ТО.</p>}
          <FieldError id={`${formId}-items-error`} message={errors.items?.message || errors.items?.root?.message} />
          <div className="maintenance-items-footer">
            <button className="button button-link maintenance-add-item" type="button"
              onClick={() => append({ name: '', type: 'WORK', amount: '', partNumber: '' })}>
              <Plus size={21} aria-hidden="true" />Добавить позицию
            </button>
            <div className="maintenance-total" aria-live="polite" aria-atomic="true">
              <div><span>Итого</span><strong>{formatCents(totalCents)}</strong></div>
              {hasUnfinishedAmount && <small>По заполненным суммам</small>}
            </div>
          </div>
        </section>

        <div className="maintenance-performer-section">
          <fieldset className="maintenance-performer-options">
            <legend>Исполнитель</legend>
            <div className="maintenance-radio-options">
              <label className="maintenance-radio">
                <input type="radio" value="SERVICE_CENTER" {...register('performerType')} />
                <span className="maintenance-radio-circle" aria-hidden="true" /><span>В сервисе</span>
              </label>
              <label className="maintenance-radio">
                <input type="radio" value="SELF" {...register('performerType')} />
                <span className="maintenance-radio-circle" aria-hidden="true" /><span>Самостоятельно</span>
              </label>
            </div>
          </fieldset>
          <div className="field maintenance-center-field">
            {performer === 'SERVICE_CENTER' ? <>
              <label className="field-label maintenance-center-label" htmlFor={`${formId}-center`}>Сервис</label>
                <div className="maintenance-select-wrap">
                  <select className="input" id={`${formId}-center`} disabled={centers.length === 0} {...register('serviceCenterId')}
                    aria-invalid={Boolean(errors.serviceCenterId)} aria-describedby={errors.serviceCenterId ? `${formId}-center-error` : undefined}>
                    <option value="">Выберите сервисный центр</option>
                    {centers.map((center) => <option key={center.id} value={center.id}>{center.name} · {center.address}</option>)}
                  </select>
                  <ChevronDown size={17} aria-hidden="true" />
                </div>
              <FieldError id={`${formId}-center-error`} message={errors.serviceCenterId?.message} />
            </> : <div className="maintenance-self-hint">Сделали сами? Сохраните работы и запчасти — они останутся в истории автомобиля.</div>}
          </div>
        </div>

        <section className="maintenance-additional">
          <button className="maintenance-additional-toggle" type="button" aria-expanded={expanded}
            aria-controls={`${formId}-additional`} onClick={() => setExpanded((value) => !value)}>
            <span><strong>Дополнительно</strong><span className="maintenance-additional-hint">Комментарий к записи</span></span>
            <ChevronDown size={20} className={expanded ? 'maintenance-chevron-open' : ''} aria-hidden="true" />
          </button>
          <div id={`${formId}-additional`} hidden={!expanded} className="maintenance-additional-content">
            <div className="field">
              <label className="field-label" htmlFor={`${formId}-description`}>Комментарий</label>
              <textarea className="input" id={`${formId}-description`} rows={3} maxLength={255}
                placeholder="Что ещё стоит помнить об этом обслуживании?"
                aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? `${formId}-description-error` : undefined}
                {...register('description')} />
              <div className="maintenance-comment-meta">
                <FieldError id={`${formId}-description-error`} message={errors.description?.message} />
                <span>{description.length} / 255</span>
              </div>
            </div>
          </div>
        </section>

        {submitError && <div className="notice maintenance-submit-error" role="alert"><AlertCircle size={20} aria-hidden="true" /><span>{submitError}</span></div>}
        <div className="form-actions maintenance-form-actions">
          <button className="button button-link maintenance-cancel" type="button" onClick={onCancel}>Отмена</button>
          <button className="button button-primary maintenance-save" type="submit">
            {isSubmitting && <LoaderCircle size={18} className="maintenance-spinner" aria-hidden="true" />}
            {isSubmitting ? 'Сохраняем…' : 'Сохранить запись'}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
