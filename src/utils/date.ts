import { addDays, format, isSameDay, parseISO, startOfWeek } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

const TIME_ZONE = 'America/Lima';

export const nowInLima = () => utcToZonedTime(new Date(), TIME_ZONE);

export const formatDate = (date: Date, pattern = 'yyyy-MM-dd') => format(date, pattern);

export const todayString = () => formatDate(nowInLima());

export const isToday = (date: string | null | undefined) => {
  if (!date) return false;
  const target = parseISO(date);
  return isSameDay(target, nowInLima());
};

export const weekDays = (reference = nowInLima()) => {
  const monday = startOfWeek(reference, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
};

export const formatDateTime = (date: string | null) => {
  if (!date) return 'Sin fecha';
  const zoned = utcToZonedTime(new Date(date), TIME_ZONE);
  return format(zoned, 'dd MMM yyyy HH:mm');
};
