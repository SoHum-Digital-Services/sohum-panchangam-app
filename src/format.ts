export function formatTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatDateLong(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
