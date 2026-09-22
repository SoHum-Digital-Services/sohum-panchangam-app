export function formatTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatDateLong(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatDateParts(dateStr: string): { day: string; month: string; weekday: string } {
  const d = new Date(`${dateStr}T00:00:00`);
  return {
    day: String(d.getDate()),
    month: d.toLocaleDateString('en-IN', { month: 'short' }),
    weekday: d.toLocaleDateString('en-IN', { weekday: 'long' }),
  };
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return isoDate(d);
}
