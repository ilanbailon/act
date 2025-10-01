
import { addDays, format, isToday, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";

const LIMA_TZ = "America/Lima";

export const toLimaDate = (date: Date | string | number) => toZonedTime(new Date(date), LIMA_TZ);

export const formatDate = (date: Date | string | number, fmt = "PPP") =>
  format(toLimaDate(date), fmt, { locale: es });

export const formatISODate = (date: Date | string | number) => format(toLimaDate(date), "yyyy-MM-dd");

export const todayInLima = () => formatISODate(new Date());

export const startOfWeekInLima = (date: Date | string | number = new Date()) =>
  startOfWeek(toLimaDate(date), { weekStartsOn: 1 });

export const getWeekDays = (anchor: Date | string | number = new Date()) => {
  const start = startOfWeekInLima(anchor);
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    return {
      date,
      iso: formatISODate(date),
      label: format(date, "eee d", { locale: es }),
      isToday: isToday(date)
    };
  });

import { addDays, format, isSameDay, parseISO, startOfWeek } from 'date-fns';

import { toZonedTime } from 'date-fns-tz';

const TIME_ZONE = 'America/Lima';

export const nowInLima = () => toZonedTime(new Date(), TIME_ZONE);

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

  const zoned = toZonedTime(new Date(date), TIME_ZONE);

  const zoned = utcToZonedTime(new Date(date), TIME_ZONE);

  return format(zoned, 'dd MMM yyyy HH:mm');

};
