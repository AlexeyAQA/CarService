import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '../app-context';
import { gateway } from '../data/gateway';
import type { Car } from '../data/types';
import { errorMessage } from '../lib/format';
import { Dialog } from './ui';
import { CarForm } from './CarForm';

export function CarEditorDialog({ car, onClose }: { car?: Car; onClose: () => void }) {
  const { notify } = useApp();
  const navigate = useNavigate();
  const cache = useQueryClient();
  const owners = useQuery({ queryKey: ['owners'], queryFn: () => gateway.listOwners() });
  return <Dialog wide title={car ? 'Редактировать автомобиль' : 'Добавить автомобиль'} onClose={onClose}>
    <CarForm initialCar={car} owners={owners.data ?? []} ownersLoading={owners.isPending} ownersError={owners.error ? errorMessage(owners.error) : undefined}
      onCancel={onClose} onCreateOwner={async input => {
        const owner = await gateway.createOwner(input);
        await cache.invalidateQueries({ queryKey: ['owners'] });
        notify('Владелец добавлен');
        return owner;
      }} onSubmit={async input => {
        const { vin: _vin, ...update } = input;
        const result = car ? await gateway.updateCar(car.id, update) : await gateway.createCar(input);
        cache.setQueryData(['car', result.id], result);
        await cache.invalidateQueries({ queryKey: ['cars'] });
        notify(car ? 'Данные автомобиля обновлены' : 'Автомобиль добавлен в гараж');
        onClose();
        navigate(`/cars/${result.id}`);
      }} />
  </Dialog>;
}
