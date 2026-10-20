import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '../app-context';
import { gateway } from '../data/gateway';
import { BackLink, ErrorState, Loading } from '../components/ui';
import { MaintenanceForm } from '../components/MaintenanceForm';

export default function NewRecord() {
  const { carId = '' } = useParams();
  const { mode, notify } = useApp();
  const navigate = useNavigate();
  const cache = useQueryClient();
  const car = useQuery({ queryKey: [mode, 'car', carId], queryFn: () => gateway.getCar(mode, carId) });
  const centers = useQuery({ queryKey: [mode, 'centers'], queryFn: () => gateway.listCenters(mode), enabled: mode === 'demo' });
  if (car.isPending) return <Loading />;
  if (car.isError) return <ErrorState error={car.error} onRetry={() => void car.refetch()} />;
  return <div className="record-page"><BackLink to={`/cars/${carId}`}>К автомобилю</BackLink><div className="page-heading form-page-heading"><div><h1>Добавить запись</h1><p className="page-subtitle">{car.data.manufacturer} {car.data.model}<span className="meta-dot">·</span>{car.data.regNumber || 'Без госномера'}</p></div></div>
    {centers.isError && <div className="notice">Не удалось загрузить сервисные центры. Можно выбрать самостоятельное обслуживание.</div>}
    <MaintenanceForm car={car.data} centers={centers.data ?? []} mode={mode} onCancel={() => navigate(`/cars/${carId}`)} onSubmit={async input => {
      const record = await gateway.createRecord(mode, carId, input);
      cache.setQueryData([mode, 'record', carId, record.id], record);
      await cache.invalidateQueries({ queryKey: [mode, 'records'] });
      notify(mode === 'demo' ? 'Запись сохранена в демогараже' : 'Запись сохранена на сервере');
      navigate(`/cars/${carId}/records/${record.id}`);
    }} />
  </div>;
}
