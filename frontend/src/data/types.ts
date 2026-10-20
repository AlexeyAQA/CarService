export type AppMode = 'demo' | 'api';
export type MaintenanceItemType = 'WORK' | 'PART';
export type PerformerType = 'SELF' | 'SERVICE_CENTER';

export interface CarSummary {
  id: string;
  vin: string;
  regNumber: string | null;
  manufacturer: string;
  model: string;
}

export interface Car extends CarSummary {
  year: number;
  mileage: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  /** Display-only demo metadata; not part of the Java API. */
  photo?: string;
  nextMaintenance?: { title: string; mileage: number; date: string };
}

export interface CarCreateRequest {
  vin: string;
  regNumber?: string | null;
  year: number;
  mileage: number;
  manufacturer: string;
  model: string;
  ownerId: string;
}

export type CarUpdateRequest = {
  [K in keyof Omit<CarCreateRequest, 'vin'>]?: CarCreateRequest[K] | null;
};

export interface CarFilters {
  page?: number;
  size?: number;
  manufacturer?: string;
}

export interface CarPage {
  cars: Car[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface OwnerCreateRequest {
  fullName: string;
  phone: string;
  email: string;
}

export interface Owner extends OwnerCreateRequest {
  id: string;
  cars: CarSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceItemCreateRequest {
  name: string;
  type: MaintenanceItemType;
  amount: number;
  partNumber?: string | null;
}

export interface MaintenanceItem extends MaintenanceItemCreateRequest {
  id: string;
  partNumber: string | null;
  position: number;
}

export interface MaintenanceCreateRequest {
  serviceDate: string;
  mileage: number;
  performerType: PerformerType;
  serviceCenterId: string | null;
  description: string | null;
  items: MaintenanceItemCreateRequest[];
}

export interface MaintenanceRecord extends Omit<MaintenanceCreateRequest, 'items'> {
  id: string;
  carId: string;
  items: MaintenanceItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCenterCreateRequest {
  name: string;
  address: string;
  phone?: string | null;
}

export interface ServiceCenter extends ServiceCenterCreateRequest {
  id: string;
  phone: string | null;
  createdAt?: string;
  updatedAt?: string;
}
