import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '../app-context';
import { gateway } from '../data/gateway';
import type { Car } from '../data/types';
import { errorMessage } from '../lib/format';
import { Dialog } from './ui';
import { CarForm } from './CarForm';

export function CarEditorDialog({ car, onClose }: { car?: Car; onClose: () => void }) {
  const { mode, notify } = useApp();
  const navigate = useNavigate();
  const cache = useQueryClient();
  const owners = useQuery({ queryKey: [mode, 'owners'], queryFn: () => gateway.listOwners(mode) });
  return <Dialog wide title={car ? 'Редактировать автомобиль' : 'Добавить автомобиль'} onClose={onClose}>
    <CarForm initialCar={car} owners={owners.data ?? []} ownersLoading={owners.isPending} ownersError={owners.error ? errorMessage(owners.error) : undefined}
      onCancel={onClose} onCreateOwner={async input => {
        const owner = await gateway.createOwner(mode, input);
        await cache.invalidateQueries({ queryKey: [mode, 'owners'] });
        notify('Владелец добавлен');
        return owner;
      }} onSubmit={async input => {
        const { vin: _vin, ...update } = input;
        const result = car ? await gateway.updateCar(mode, car.id, update) : await gateway.createCar(mode, input);
        cache.setQueryData([mode, 'car', result.id], result);
        await cache.invalidateQueries({ queryKey: [mode, 'cars'] });
        notify(car ? 'Данные автомобиля обновлены' : 'Автомобиль добавлен в гараж');
        onClose();
        navigate(`/cars/${result.id}`);
      }} />
  </Dialog>;
}
