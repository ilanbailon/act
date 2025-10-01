const TIME_ZONE = 'America/Lima';
const locale = 'es-PE';

const dayFormatter = new Intl.DateTimeFormat(locale, {
  weekday: 'short',
});

const dateFormatter = new Intl.DateTimeFormat(locale, {
  day: 'numeric',
  month: 'short',
});

const longDateFormatter = new Intl.DateTimeFormat(locale, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export function nowInLima() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TIME_ZONE }));
}

export function todayKey() {
  return formatISODate(nowInLima());
}

export function formatISODate(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(date) {
  if (!date) return '—';
  return longDateFormatter.format(new Date(date));
}

export function formatDay(date) {
  if (!date) return '';
  return dateFormatter.format(new Date(date));
}

export function formatWeekday(date) {
  if (!date) return '';
  return dayFormatter.format(new Date(date));
}

export function startOfWeek(base = nowInLima()) {
  const date = new Date(base);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday start
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function getWeekDates(base = nowInLima()) {
  const start = startOfWeek(base);
  return Array.from({ length: 7 }, (_, index) => {
    const copy = new Date(start);
    copy.setDate(copy.getDate() + index);
    return copy;
  });
}

export function isSameDate(a, b) {
  if (!a || !b) return false;
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

export function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toDateInputValue(date) {
  if (!date) return '';
  return formatISODate(date);
}

export function toDateTimeLocalValue(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
