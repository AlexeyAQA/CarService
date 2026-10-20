import type { Car, MaintenanceItemCreateRequest, MaintenanceRecord, Owner, ServiceCenter } from './types';

export const DEMO_STORAGE_KEY = 'service-book:demo:v1';
export const DUSTER_ID = '11111111-1111-4111-8111-111111111111';
export const KIA_ID = '22222222-2222-4222-8222-222222222222';
export const DEMO_OWNER_ID = '33333333-3333-4333-8333-333333333333';

export interface DemoState {
  version: 1;
  cars: Car[];
  owners: Owner[];
  records: MaintenanceRecord[];
  centers: ServiceCenter[];
  archivedCarIds: string[];
}

const AUTO_CENTER_ID = '44444444-4444-4444-8444-444444444444';
const TIRE_CENTER_ID = '55555555-5555-4555-8555-555555555555';
const RENAULT_CENTER_ID = '66666666-6666-4666-8666-666666666666';

const centers: ServiceCenter[] = [
  { id: AUTO_CENTER_ID, name: 'АвтоСервис', address: 'Москва, ул. Обручева, 23', phone: '74951234567' },
  { id: TIRE_CENTER_ID, name: 'Шинный центр', address: 'Москва, ул. Профсоюзная, 78', phone: '74957654321' },
  { id: RENAULT_CENTER_ID, name: 'Renault Сервис', address: 'Москва, Ленинский проспект, 146', phone: '74951230000' },
];

const cars: Car[] = [
  {
    id: DUSTER_ID, vin: 'X7LHSRHGN60412345', regNumber: 'А123ВС 77', year: 2018,
    mileage: 87450, manufacturer: 'Renault', model: 'Duster', ownerId: DEMO_OWNER_ID,
    createdAt: '2023-05-12T10:00:00+04:00', updatedAt: '2026-09-12T13:30:00+04:00',
    photo: '/images/duster.png',
    nextMaintenance: { title: 'Замена тормозной жидкости', mileage: 90000, date: '2026-11-15' },
  },
  {
    id: KIA_ID, vin: 'Z94C241BBKR123456', regNumber: 'М456КТ 77', year: 2019,
    mileage: 56320, manufacturer: 'Kia', model: 'Rio', ownerId: DEMO_OWNER_ID,
    createdAt: '2024-03-10T10:00:00+04:00', updatedAt: '2026-08-22T12:00:00+04:00',
    nextMaintenance: { title: 'Замена масла и фильтра', mileage: 60000, date: '2027-02-22' },
  },
];

const work = (name: string, amount: number): MaintenanceItemCreateRequest => ({ name, type: 'WORK', amount, partNumber: null });
const part = (name: string, amount: number, partNumber: string | null = null): MaintenanceItemCreateRequest => ({ name, type: 'PART', amount, partNumber });

function record(
  index: number,
  serviceDate: string,
  mileage: number,
  description: string,
  items: MaintenanceItemCreateRequest[],
  serviceCenterId: string | null = AUTO_CENTER_ID,
  carId = DUSTER_ID,
): MaintenanceRecord {
  const suffix = String(index).padStart(12, '0');
  return {
    id: `77777777-7777-4777-8777-${suffix}`, carId, serviceDate, mileage, description,
    performerType: serviceCenterId ? 'SERVICE_CENTER' : 'SELF', serviceCenterId,
    items: items.map((item, position) => ({
      ...item, id: `88888888-8888-4888-8888-${String(index * 100 + position).padStart(12, '0')}`,
      position, partNumber: item.partNumber ?? null,
    })),
    totalAmount: items.reduce((sum, item) => sum + Math.round(item.amount * 100), 0) / 100,
    createdAt: `${serviceDate}T12:00:00+04:00`, updatedAt: `${serviceDate}T12:00:00+04:00`,
  };
}

const records: MaintenanceRecord[] = [
  record(1, '2026-09-12', 87200, 'Замена масла и фильтра', [work('Замена масла и фильтра', 1500), part('Моторное масло 5W-40, 5 л', 5900, 'ELF-5W40-5L'), part('Масляный фильтр', 1100, 'OC47')]),
  record(2, '2026-06-18', 82100, 'Передние тормозные колодки', [work('Замена передних тормозных колодок', 2200), part('Комплект передних тормозных колодок', 4000, 'GDB3332')]),
  record(3, '2026-04-04', 79000, 'Замена воздушного фильтра', [part('Воздушный фильтр', 1400, 'C 1858/2')], null),
  record(4, '2025-11-10', 74800, 'Сезонный шиномонтаж', [work('Снятие, установка и балансировка 4 колёс', 3600)], TIRE_CENTER_ID),
  record(5, '2025-09-15', 72400, 'Замена масла и фильтра', [work('Замена масла и фильтра', 1400), part('Моторное масло 5W-40, 5 л', 5500, 'ELF-5W40-5L'), part('Масляный фильтр', 1000, 'OC47')]),
  record(6, '2025-06-21', 68100, 'Замена свечей зажигания', [work('Замена свечей зажигания', 1800), part('Свечи зажигания, комплект', 3200, '7700500155')]),
  record(7, '2025-04-12', 65700, 'Сезонный шиномонтаж', [work('Снятие, установка и балансировка 4 колёс', 3400)], TIRE_CENTER_ID),
  record(8, '2024-11-15', 60300, 'Замена тормозной жидкости', [work('Замена тормозной жидкости', 1800), part('Тормозная жидкость DOT 4, 1 л', 800, 'DOT4-1L')]),
  record(9, '2024-09-14', 57800, 'Замена масла и фильтра', [work('Замена масла и фильтра', 1300), part('Моторное масло 5W-40, 5 л', 4900, 'ELF-5W40-5L'), part('Масляный фильтр', 900, 'OC47')]),
  record(10, '2024-05-03', 52100, 'Замена салонного фильтра', [part('Салонный фильтр', 850, 'CU 1829')], null),
  record(11, '2023-11-11', 46800, 'Замена аккумулятора', [work('Замена аккумулятора', 500), part('Аккумулятор 60 А·ч', 7200, '560408054')]),
  record(12, '2023-06-10', 41000, 'Диагностика после покупки', [work('Комплексная диагностика автомобиля', 3500), work('Проверка углов установки колёс', 1500)], RENAULT_CENTER_ID),
  record(13, '2026-08-22', 55200, 'Замена масла и фильтра', [work('Замена масла и фильтра', 1500), part('Моторное масло 5W-30, 4 л', 4200, '05100-00441'), part('Масляный фильтр', 650, '26300-35505')], AUTO_CENTER_ID, KIA_ID),
  record(14, '2026-04-11', 49800, 'Сезонный шиномонтаж', [work('Снятие, установка и балансировка 4 колёс', 3200)], TIRE_CENTER_ID, KIA_ID),
];

export function createDemoState(): DemoState {
  return structuredClone({
    version: 1,
    cars,
    owners: [{
      id: DEMO_OWNER_ID, fullName: 'Алексей Петров', phone: '79991234567', email: 'alex@example.com',
      cars: cars.map(({ id, vin, regNumber, manufacturer, model }) => ({ id, vin, regNumber, manufacturer, model })),
      createdAt: '10:00 - 12.05.2023', updatedAt: '13:30 - 12.09.2026',
    }],
    records,
    centers,
    archivedCarIds: [],
  });
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const hasStrings = (value: Record<string, unknown>, keys: string[]) => keys.every((key) => typeof value[key] === 'string');
const hasNumbers = (value: Record<string, unknown>, keys: string[]) => keys.every((key) => typeof value[key] === 'number' && Number.isFinite(value[key]));

/** Check persisted shape before it reaches the UI. Invalid storage is never silently overwritten. */
export function isDemoState(value: unknown): value is DemoState {
  if (!isObject(value) || value.version !== 1) return false;
  const validCar = (car: unknown) => isObject(car)
    && hasStrings(car, ['id', 'vin', 'manufacturer', 'model', 'ownerId', 'createdAt', 'updatedAt'])
    && hasNumbers(car, ['year', 'mileage']) && (car.regNumber === null || typeof car.regNumber === 'string');
  const validOwner = (owner: unknown) => isObject(owner)
    && hasStrings(owner, ['id', 'fullName', 'phone', 'email', 'createdAt', 'updatedAt']) && Array.isArray(owner.cars);
  const validItem = (item: unknown) => isObject(item) && hasStrings(item, ['id', 'name'])
    && ['WORK', 'PART'].includes(String(item.type)) && hasNumbers(item, ['amount', 'position'])
    && (item.partNumber === null || typeof item.partNumber === 'string');
  const validRecord = (record: unknown) => isObject(record)
    && hasStrings(record, ['id', 'carId', 'serviceDate', 'createdAt', 'updatedAt'])
    && hasNumbers(record, ['mileage', 'totalAmount']) && ['SELF', 'SERVICE_CENTER'].includes(String(record.performerType))
    && (record.serviceCenterId === null || typeof record.serviceCenterId === 'string')
    && (record.description === null || typeof record.description === 'string')
    && Array.isArray(record.items) && record.items.every(validItem);
  const validCenter = (center: unknown) => isObject(center) && hasStrings(center, ['id', 'name', 'address'])
    && (center.phone === null || typeof center.phone === 'string');
  return Array.isArray(value.cars) && value.cars.every(validCar)
    && Array.isArray(value.owners) && value.owners.every(validOwner)
    && Array.isArray(value.records) && value.records.every(validRecord)
    && Array.isArray(value.centers) && value.centers.every(validCenter)
    && Array.isArray(value.archivedCarIds) && value.archivedCarIds.every((id) => typeof id === 'string');
}
