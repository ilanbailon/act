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
};
