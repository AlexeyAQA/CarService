import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '../app-context';
import { gateway } from '../data/gateway';
import { BackLink, ErrorState, Loading } from '../components/ui';
import { MaintenanceForm } from '../components/MaintenanceForm';

export default function NewRecord() {
  const { carId = '' } = useParams();
  const { notify } = useApp();
  const navigate = useNavigate();
  const cache = useQueryClient();
  const car = useQuery({ queryKey: ['car', carId], queryFn: () => gateway.getCar(carId) });
  const centers = useQuery({ queryKey: ['centers'], queryFn: () => gateway.listCenters() });
  if (car.isPending) return <Loading />;
  if (car.isError) return <ErrorState error={car.error} onRetry={() => void car.refetch()} />;
  return <div className="record-page"><BackLink to={`/cars/${carId}`}>К автомобилю</BackLink><div className="page-heading form-page-heading"><div><h1>Добавить запись</h1><p className="page-subtitle">{car.data.manufacturer} {car.data.model}<span className="meta-dot">·</span>{car.data.regNumber || 'Без госномера'}</p></div></div>
    {centers.isPending && <div className="notice" role="status">Загружаем сервисные центры…</div>}
    {centers.isError && <div className="notice" role="alert">Не удалось загрузить сервисные центры. Можно выбрать самостоятельное обслуживание. <button className="button-link" onClick={() => void centers.refetch()}>Повторить</button></div>}
    {centers.isSuccess && centers.data.length === 0 && <div className="notice">Пока нет сервисных центров. <Link to="/centers">Добавить сервис</Link> или выбрать самостоятельное обслуживание.</div>}
    <MaintenanceForm car={car.data} centers={centers.data ?? []} onCancel={() => navigate(`/cars/${carId}`)} onSubmit={async input => {
      const record = await gateway.createRecord(carId, input);
      cache.setQueryData(['record', carId, record.id], record);
      await cache.invalidateQueries({ queryKey: ['records'] });
      notify('Запись сохранена');
      navigate(`/cars/${carId}/records/${record.id}`);
    }} />
  </div>;
}
