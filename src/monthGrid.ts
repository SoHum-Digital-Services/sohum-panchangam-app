export function monthBounds(year: number, month: number): { start: string; end: string; daysInMonth: number } {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    start: `${year}-${pad(month + 1)}-01`,
    end: `${year}-${pad(month + 1)}-${pad(daysInMonth)}`,
    daysInMonth,
  };
}

export interface GridCell {
  day: number | null;
  date: string | null;
}

export function buildMonthGrid(year: number, month: number): GridCell[] {
  const { daysInMonth } = monthBounds(year, month);
  const firstWeekday = new Date(year, month, 1).getDay();
  const pad = (n: number) => String(n).padStart(2, '0');
  const cells: GridCell[] = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ day: null, date: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, date: `${year}-${pad(month + 1)}-${pad(d)}` });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: null, date: null });
  }
  return cells;
}

export const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
