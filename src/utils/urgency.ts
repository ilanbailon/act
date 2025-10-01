import { differenceInHours } from 'date-fns';

import { toZonedTime } from 'date-fns-tz';

const TIME_ZONE = 'America/Lima';

export type UrgencyBand = 'none' | 'green' | 'amber' | 'red';

export const bandColor = (dueAt: string | null, reference: Date = new Date()): UrgencyBand => {
  if (!dueAt) return 'none';
  const zonedDue = toZonedTime(new Date(dueAt), TIME_ZONE);
  const zonedRef = toZonedTime(reference, TIME_ZONE);
  const hours = differenceInHours(zonedDue, zonedRef);

import { utcToZonedTime } from 'date-fns-tz';

const TIME_ZONE = 'America/Lima';

export const bandColor = (dueAt: string | null, reference: Date = new Date()) => {
  if (!dueAt) return 'none';
  const zonedDue = utcToZonedTime(new Date(dueAt), TIME_ZONE);
  const hours = differenceInHours(zonedDue, reference);

  if (hours > 24 * 7) return 'green';
  if (hours >= 72) return 'amber';
  return 'red';
};

export const computeCountdown = (dueAt: string | null, reference: Date = new Date()) => {
  if (!dueAt) return 'Sin fecha';
  const diffMs = new Date(dueAt).getTime() - reference.getTime();
  if (diffMs <= 0) return 'Vencido';
  const minutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(minutes / (60 * 24));
  const hours = Math.floor((minutes - days * 60 * 24) / 60);
  const mins = minutes % 60;
  return `${days}d ${hours}h ${mins}m`;
};
