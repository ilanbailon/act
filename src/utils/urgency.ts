import { differenceInHours, parseISO } from "date-fns";

export type UrgencyBand = "green" | "amber" | "red" | "none";

export const bandColor = (dueAt: string | null | undefined, now = new Date()): UrgencyBand => {
  if (!dueAt) return "none";
  const due = parseISO(dueAt);
  const diff = differenceInHours(due, now);
  if (diff > 24 * 7) return "green";
  if (diff >= 72) return "amber";
  if (diff >= 0) return "red";
  return "red";
};

export const computeCountdown = (dueAt: string | null | undefined, now = new Date()) => {
  if (!dueAt) return "";
  const due = parseISO(dueAt);
  let diff = Math.max(0, due.getTime() - now.getTime());
  const minutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(minutes / (60 * 24));
  const hours = Math.floor((minutes - days * 24 * 60) / 60);
  const mins = minutes % 60;
  return `${days}d ${hours}h ${mins}m`;
};
