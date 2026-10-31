import type {
  Car, CarCreateRequest, CarFilters, CarPage, CarUpdateRequest,
  MaintenanceCreateRequest, MaintenanceRecord, Owner, OwnerCreateRequest,
  RecordFilters, RecordPage, ServiceCenter, ServiceCenterCreateRequest,
} from './types';

export class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const fallbackErrors: Record<number, string> = {
  400: 'Проверьте заполненные поля: сервер не принял запрос.',
  404: 'Запись не найдена. Возможно, она была удалена.',
  409: 'Изменения противоречат существующим данным.',
  500: 'Сервер не смог выполнить запрос. Попробуйте ещё раз.',
  502: 'Нет соединения с сервером. Проверьте, запущен ли backend.',
  503: 'Сервер временно недоступен. Попробуйте ещё раз.',
};

async function request<T>(path: string, method = 'GET', body?: unknown, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      method, signal,
      headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError(0, 'Нет соединения с сервером. Проверьте, запущен ли backend.');
  }
  if (response.status === 204) return undefined as T;
  const raw = await response.text();
  let data: unknown;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
  if (!response.ok) {
    const message = typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string'
      ? data.message : '';
    const safeMessage = message.length > 0 && message.length <= 300 && !/Validation failed|Exception|org\.|java\.|SQL/i.test(message)
      ? message : fallbackErrors[response.status] ?? 'Не удалось выполнить запрос. Попробуйте ещё раз.';
    throw new ApiError(response.status, safeMessage);
  }
  if (data === null) throw new ApiError(response.status, 'Сервер вернул неожиданный ответ. Проверьте подключение к API.');
  return data as T;
}

const encoded = encodeURIComponent;
export const gateway = {
  listCars(filters: CarFilters = {}, signal?: AbortSignal): Promise<CarPage> {
    const { page = 0, size = 20, manufacturer } = filters;
    const query = new URLSearchParams({ page: String(page), size: String(size) });
    if (manufacturer?.trim()) query.set('manufacturer', manufacturer.trim());
    return request(`/cars?${query}`, 'GET', undefined, signal);
  },
  async listAllCars(signal?: AbortSignal): Promise<Car[]> {
    const cars: Car[] = [];
    let page = 0;
    let totalPages = 1;
    while (page < totalPages) {
      const result = await gateway.listCars({ page, size: 100 }, signal);
      cars.push(...result.cars);
      totalPages = result.totalPages;
      page += 1;
    }
    return cars;
  },
  getCar(carId: string): Promise<Car> { return request(`/cars/${encoded(carId)}`); },
  createCar(input: CarCreateRequest): Promise<Car> { return request('/cars', 'POST', input); },
  updateCar(carId: string, input: CarUpdateRequest): Promise<Car> { return request(`/cars/${encoded(carId)}`, 'PATCH', input); },
  deleteCar(carId: string): Promise<void> { return request(`/cars/${encoded(carId)}`, 'DELETE'); },
  async listOwners(): Promise<Owner[]> {
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
  createOwner(input: OwnerCreateRequest): Promise<Owner> { return request('/owners', 'POST', input); },
  listRecords(carId: string, filters: RecordFilters = {}, page = 0, signal?: AbortSignal): Promise<RecordPage> {
    const query = new URLSearchParams({ page: String(page), size: '5' });
    for (const [key, value] of Object.entries(filters)) {
      if (value?.trim()) query.set(key, value.trim());
    }
    return request(`/cars/${encoded(carId)}/maintenance-records?${query}`, 'GET', undefined, signal);
  },
  getRecord(carId: string, recordId: string): Promise<MaintenanceRecord> {
    return request(`/cars/${encoded(carId)}/maintenance-records/${encoded(recordId)}`);
  },
  createRecord(carId: string, input: MaintenanceCreateRequest): Promise<MaintenanceRecord> {
    return request(`/cars/${encoded(carId)}/maintenance-records`, 'POST', input);
  },
  listCenters(): Promise<ServiceCenter[]> { return request('/service-centers'); },
  createCenter(input: ServiceCenterCreateRequest): Promise<ServiceCenter> {
    return request('/service-centers', 'POST', input);
  },
};
