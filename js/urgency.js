export function bandColor(dueAt, reference = new Date()) {
  if (!dueAt) return 'none';
  const dueDate = new Date(dueAt);
  if (Number.isNaN(dueDate.getTime())) return 'none';

  const diffMs = dueDate.getTime() - reference.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours <= 72) {
    return 'red';
  }
  if (diffHours <= 168) {
    return 'amber';
  }
  return 'green';
}

export function computeCountdown(dueAt, reference = new Date()) {
  if (!dueAt) return 'Sin fecha límite';
  const dueDate = new Date(dueAt);
  if (Number.isNaN(dueDate.getTime())) return 'Sin fecha límite';

  let diff = Math.max(0, dueDate.getTime() - reference.getTime());
  const totalMinutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 24 * 60) / 60);
  const minutes = totalMinutes - days * 24 * 60 - hours * 60;

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours || days) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(' ');
}
