import { createDemoState, DEMO_STORAGE_KEY, isDemoState, type DemoState } from './demo';
import type {
  AppMode, Car, CarCreateRequest, CarFilters, CarPage, CarUpdateRequest,
  MaintenanceCreateRequest, MaintenanceRecord, Owner, OwnerCreateRequest,
  ServiceCenter, ServiceCenterCreateRequest,
} from './types';

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export class FeatureUnavailableError extends ApiError {
  constructor(message: string) {
    super(501, message);
    this.name = 'FeatureUnavailableError';
  }
}

function loadDemo(): DemoState {
  let saved: string | null;
  try {
    saved = window.localStorage.getItem(DEMO_STORAGE_KEY);
  } catch {
    throw new ApiError(0, 'Браузер запретил доступ к локальным данным. Разрешите хранение данных для этого сайта.');
  }
  if (saved === null) return createDemoState();
  try {
    const parsed: unknown = JSON.parse(saved);
    if (isDemoState(parsed)) return parsed;
  } catch { /* Report invalid JSON together with invalid persisted shapes. */ }
  throw new ApiError(0, 'Демонстрационные данные повреждены. Восстановите примеры в настройках.');
}

function saveDemo(state: DemoState): void {
  try {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
  } catch {
    throw new ApiError(0, 'Не удалось сохранить изменения в браузере. Проверьте свободное место и разрешение на хранение данных.');
  }
}

export async function resetDemo(): Promise<void> {
  saveDemo(createDemoState());
}

const fallbackErrors: Record<number, string> = {
  400: 'Проверьте заполненные поля: сервер не принял запрос.',
  404: 'Запись не найдена. Возможно, она была удалена.',
  409: 'Изменения противоречат существующим данным.',
  500: 'Сервер не смог выполнить запрос. Попробуйте ещё раз.',
  502: 'Нет соединения с сервером. Проверьте, запущен ли backend.',
  503: 'Сервер временно недоступен. Попробуйте ещё раз.',
};

async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      method,
      headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new ApiError(0, 'Нет соединения с сервером. Проверьте, запущен ли backend.');
  }
  if (response.status === 204) return undefined as T;
  const raw = await response.text();
  let data: unknown;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
  if (!response.ok) {
    const message = typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string'
      ? data.message : '';
    // Spring currently includes a technical validation dump; don't show stack/DTO internals in the interface.
    const safeMessage = message.length > 0 && message.length <= 300 && !/Validation failed|Exception|org\.|java\.|SQL/i.test(message)
      ? message : fallbackErrors[response.status] ?? 'Не удалось выполнить запрос. Попробуйте ещё раз.';
    throw new ApiError(response.status, safeMessage);
  }
  if (data === null) throw new ApiError(response.status, 'Сервер вернул неожиданный ответ. Проверьте подключение к API.');
  return data as T;
}

const copy = <T>(value: T): T => structuredClone(value);
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const ownerTimestamp = () => {
  const date = new Date();
  const two = (value: number) => String(value).padStart(2, '0');
  return `${two(date.getHours())}:${two(date.getMinutes())} - ${two(date.getDate())}.${two(date.getMonth() + 1)}.${date.getFullYear()}`;
};

function ensure(condition: boolean, message: string, status = 400): asserts condition {
  if (!condition) throw new ApiError(status, message);
}

function nonBlank(value: unknown, label: string, max: number): asserts value is string {
  ensure(typeof value === 'string' && value.trim().length > 0, `Заполните поле «${label}».`);
  ensure(value.length <= max, `Поле «${label}» должно содержать не более ${max} символов.`);
}

function activeCar(state: DemoState, carId: string): Car {
  const car = state.cars.find((item) => item.id === carId && !state.archivedCarIds.includes(item.id));
  if (!car) throw new ApiError(404, 'Автомобиль не найден.');
  return car;
}

function validateCar(state: DemoState, input: CarCreateRequest): void {
  ensure(/^[A-HJ-NPR-Z0-9]{17}$/i.test(input.vin), 'VIN должен содержать 17 латинских букв и цифр, кроме I, O и Q.');
  nonBlank(input.manufacturer, 'Марка', 100);
  nonBlank(input.model, 'Модель', 100);
  if (input.regNumber != null) nonBlank(input.regNumber, 'Госномер', 20);
  ensure(Number.isInteger(input.year) && input.year >= 1886 && input.year <= new Date().getFullYear(), 'Проверьте год выпуска автомобиля.');
  ensure(Number.isInteger(input.mileage) && input.mileage >= 0 && input.mileage <= 2147483647, 'Пробег должен быть целым неотрицательным числом.');
  ensure(state.owners.some((owner) => owner.id === input.ownerId), 'Владелец не найден.', 404);
}

function ownersWithCars(state: DemoState): Owner[] {
  return state.owners.map((owner) => ({
    ...owner,
    cars: state.cars.filter((car) => car.ownerId === owner.id).map(({ id, vin, regNumber, manufacturer, model }) => ({ id, vin, regNumber, manufacturer, model })),
  }));
}

const unavailableHistory = () => new FeatureUnavailableError('История обслуживания появится после подключения API чтения записей. Сейчас можно создать новую запись.');
const unavailableCenters = () => new FeatureUnavailableError('Список сервисных центров пока доступен в деморежиме. API центров ещё не подключено.');

export const gateway = {
  async listCars(mode: AppMode, filters: CarFilters = {}): Promise<CarPage> {
    const { page = 0, size = 20, manufacturer } = filters;
    if (mode === 'api') {
      const query = new URLSearchParams({ page: String(page), size: String(size) });
      if (manufacturer?.trim()) query.set('manufacturer', manufacturer.trim());
      return request<CarPage>(`/cars?${query}`);
    }
    ensure(Number.isInteger(page) && page >= 0 && Number.isInteger(size) && size >= 1 && size <= 100, 'Некорректные параметры страницы.');
    const state = loadDemo();
    const search = manufacturer?.trim().toLocaleLowerCase() ?? '';
    const cars = state.cars.filter((car) => !state.archivedCarIds.includes(car.id) && car.manufacturer.toLocaleLowerCase().includes(search))
      .sort((a, b) => a.model.localeCompare(b.model));
    return copy({ cars: cars.slice(page * size, (page + 1) * size), page, size, totalElements: cars.length, totalPages: Math.ceil(cars.length / size) });
  },

  async getCar(mode: AppMode, carId: string): Promise<Car> {
    if (mode === 'api') return request<Car>(`/cars/${encodeURIComponent(carId)}`);
    return copy(activeCar(loadDemo(), carId));
  },

  async createCar(mode: AppMode, input: CarCreateRequest): Promise<Car> {
    if (mode === 'api') return request<Car>('/cars', 'POST', input);
    const state = loadDemo();
    validateCar(state, input);
    ensure(!state.cars.some((car) => car.vin.toUpperCase() === input.vin.toUpperCase()), 'Автомобиль с указанным VIN уже существует.', 409);
    const timestamp = now();
    const car: Car = { ...input, vin: input.vin.toUpperCase(), regNumber: input.regNumber ?? null, id: id(), createdAt: timestamp, updatedAt: timestamp };
    state.cars.push(car);
    saveDemo(state);
    return copy(car);
  },

  async updateCar(mode: AppMode, carId: string, input: CarUpdateRequest): Promise<Car> {
    if (mode === 'api') return request<Car>(`/cars/${encodeURIComponent(carId)}`, 'PATCH', input);
    const state = loadDemo();
    const car = activeCar(state, carId);
    ensure(Object.values(input).some((value) => value != null), 'Измените хотя бы одно поле.');
    ensure(input.mileage == null || input.mileage >= car.mileage, 'Пробег автомобиля нельзя уменьшить.', 409);
    const changes = Object.fromEntries(Object.entries(input).filter(([, value]) => value != null));
    const updated: Car = { ...car, ...changes, updatedAt: now() };
    validateCar(state, updated);
    state.cars = state.cars.map((item) => item.id === carId ? updated : item);
    saveDemo(state);
    return copy(updated);
  },

  async deleteCar(mode: AppMode, carId: string): Promise<void> {
    if (mode === 'api') return request<void>(`/cars/${encodeURIComponent(carId)}`, 'DELETE');
    const state = loadDemo();
    activeCar(state, carId);
    state.archivedCarIds.push(carId);
    saveDemo(state);
  },

  async listOwners(mode: AppMode): Promise<Owner[]> {
    if (mode === 'demo') return copy(ownersWithCars(loadDemo()));
    const owners: Owner[] = [];
    let page = 0;
    let totalPages = 1;
    while (page < totalPages) {
      const result = await request<{ owners: Owner[]; totalPages: number }>(`/owners?page=${page}&size=100`);
      owners.push(...result.owners);
      totalPages = result.totalPages;
      page += 1;
    }
    return owners;
  },

  async createOwner(mode: AppMode, input: OwnerCreateRequest): Promise<Owner> {
    if (mode === 'api') return request<Owner>('/owners', 'POST', input);
    nonBlank(input.fullName, 'Имя владельца', 100);
    ensure(input.fullName.length >= 2, 'Имя должно содержать не менее 2 символов.');
    ensure(/^7\d{10}$/.test(input.phone), 'Телефон должен содержать 11 цифр и начинаться с 7.');
    ensure(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email), 'Введите корректный email.');
    const state = loadDemo();
    const timestamp = ownerTimestamp();
    const owner: Owner = { ...input, id: id(), cars: [], createdAt: timestamp, updatedAt: timestamp };
    state.owners.push(owner);
    saveDemo(state);
    return copy(owner);
  },

  async listRecords(mode: AppMode, carId?: string): Promise<MaintenanceRecord[]> {
    if (mode === 'api') throw unavailableHistory();
    const state = loadDemo();
    if (carId) activeCar(state, carId);
    return copy(state.records.filter((record) => (!carId || record.carId === carId) && !state.archivedCarIds.includes(record.carId))
      .sort((a, b) => b.serviceDate.localeCompare(a.serviceDate) || b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id)));
  },

  async getRecord(mode: AppMode, carId: string, recordId: string): Promise<MaintenanceRecord> {
    if (mode === 'api') throw unavailableHistory();
    const state = loadDemo();
    activeCar(state, carId);
    const record = state.records.find((item) => item.id === recordId && item.carId === carId);
    if (!record) throw new ApiError(404, 'Запись обслуживания не найдена.');
    return copy(record);
  },

  async createRecord(mode: AppMode, carId: string, input: MaintenanceCreateRequest): Promise<MaintenanceRecord> {
    if (mode === 'api') return request<MaintenanceRecord>(`/cars/${encodeURIComponent(carId)}/maintenance-records`, 'POST', input);
    const state = loadDemo();
    activeCar(state, carId);
    ensure(/^\d{4}-\d{2}-\d{2}$/.test(input.serviceDate) && Number.isFinite(Date.parse(input.serviceDate))
      && new Date(`${input.serviceDate}T00:00:00Z`).toISOString().slice(0, 10) === input.serviceDate && input.serviceDate <= today(), 'Укажите существующую дату обслуживания не позже сегодняшней.');
    ensure(Number.isInteger(input.mileage) && input.mileage >= 0 && input.mileage <= 2147483647, 'Пробег должен быть целым неотрицательным числом.');
    ensure(input.performerType === 'SELF' || input.performerType === 'SERVICE_CENTER', 'Выберите исполнителя.');
    if (input.performerType === 'SELF') ensure(input.serviceCenterId == null, 'Для самостоятельной работы сервис не указывается.');
    else ensure(state.centers.some((center) => center.id === input.serviceCenterId), 'Сервисный центр не найден.', 404);
    ensure(input.description == null || input.description.length <= 255, 'Комментарий должен содержать не более 255 символов.');
    ensure(Array.isArray(input.items) && input.items.length > 0, 'Добавьте хотя бы одну работу или запчасть.');
    let totalCents = 0;
    const items = input.items.map((item, position) => {
      nonBlank(item.name, 'Наименование позиции', 255);
      ensure(item.type === 'WORK' || item.type === 'PART', 'Выберите тип позиции.');
      const cents = Math.round(item.amount * 100);
      ensure(Number.isFinite(item.amount) && item.amount >= 0 && Number.isSafeInteger(cents)
        && Math.abs(item.amount * 100 - cents) < 0.00001, 'Сумма должна быть неотрицательным числом с точностью до копейки.');
      totalCents += cents;
      ensure(Number.isSafeInteger(totalCents), 'Общая сумма слишком велика для отображения.');
      ensure(item.partNumber == null || item.partNumber.length <= 100, 'PN должен содержать не более 100 символов.');
      const partNumber = item.partNumber?.trim() || null;
      ensure(item.type === 'PART' || partNumber === null, 'PN можно указать только для запчасти.');
      return { ...item, id: id(), position, partNumber };
    });
    const timestamp = now();
    const record: MaintenanceRecord = { ...input, id: id(), carId, items, totalAmount: totalCents / 100, createdAt: timestamp, updatedAt: timestamp };
    state.records.push(record);
    // The current backend does not change the car's mileage when recording a past service.
    saveDemo(state);
    return copy(record);
  },

  async listCenters(mode: AppMode): Promise<ServiceCenter[]> {
    if (mode === 'api') throw unavailableCenters();
    return copy(loadDemo().centers);
  },

  async createCenter(mode: AppMode, input: ServiceCenterCreateRequest): Promise<ServiceCenter> {
    if (mode === 'api') throw new FeatureUnavailableError('Создание сервисных центров пока доступно только в деморежиме.');
    nonBlank(input.name, 'Название сервиса', 255);
    nonBlank(input.address, 'Адрес', 255);
    ensure(input.phone == null || input.phone.length <= 255, 'Телефон должен содержать не более 255 символов.');
    const state = loadDemo();
    const timestamp = now();
    const center: ServiceCenter = { ...input, id: id(), phone: input.phone?.trim() || null, createdAt: timestamp, updatedAt: timestamp };
    state.centers.push(center);
    saveDemo(state);
    return copy(center);
  },
};
