export const number = (value: number) => new Intl.NumberFormat('ru-RU').format(value);
export const money = (value: number) => new Intl.NumberFormat('ru-RU', {
  style: 'currency', currency: 'RUB', maximumFractionDigits: 2,
  minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
}).format(value);
export const date = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split('-');
  return `${day}.${month}.${year}`;
};
export const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
export const recordCount = (count: number) => {
  const tail = count % 100;
  return `${count} ${tail >= 11 && tail <= 14 ? 'записей' : count % 10 === 1 ? 'запись' : count % 10 >= 2 && count % 10 <= 4 ? 'записи' : 'записей'}`;
};
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Не удалось выполнить действие. Попробуйте ещё раз.';
