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
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

// "06:07am" style used by the dark Today layout (zero-padded, no space).
export function formatClock(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${String(hours % 12 || 12).padStart(2, '0')}:${minutes}${hours >= 12 ? 'pm' : 'am'}`;
}

// Same as formatClock, with a "(+1)" suffix when the moment falls on a later calendar day than baseDate.
export function formatClockOn(iso: string | null, baseDate: string): string {
  if (!iso) return '—';
  const dayOffset = Math.round((new Date(`${isoDate(new Date(iso))}T00:00:00`).getTime() - new Date(`${baseDate}T00:00:00`).getTime()) / 86400000);
  return dayOffset > 0 ? `${formatClock(iso)}(+${dayOffset})` : formatClock(iso);
}
