import type { PanchangamResponse } from './api/types';
import { formatTime } from './format';

export const weekdayTeShort = ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని'];

export function weekdayShort(dateStr: string): string {
  return weekdayTeShort[new Date(`${dateStr}T00:00:00`).getDay()];
}

export function pakshaTe(paksha: string): string {
  if (paksha === 'Shukla') return 'శుక్ల';
  if (paksha === 'Bahula' || paksha === 'Krishna') return 'బహుళ';
  return paksha;
}

export function moonPhaseIcon(tithiIndex: number): string {
  if (tithiIndex === 15) return '●';
  if (tithiIndex === 30) return '○';
  if (tithiIndex < 15) return '◐';
  return '◑';
}

export function calendarMarkers(day?: PanchangamResponse): string[] {
  if (!day) return [];
  const markers: string[] = [];
  if (day.tithi.index === 11) markers.push('🪔');
  if (day.tithi.index === 15 || day.tithi.index === 30) markers.push(moonPhaseIcon(day.tithi.index));
  if (day.festivals.length > 0) markers.push('✦');
  return markers.slice(0, 3);
}

export function primaryDayLines(day: PanchangamResponse): Array<{ label: string; value: string }> {
  return [
    { label: 'సం.', value: `${day.samvatsara.name_te}, ${day.ayana.name_te}` },
    { label: 'మాసం', value: `${day.lunar_month.name_te}, ${pakshaTe(day.tithi.paksha)} పక్షం` },
    { label: 'తిథి', value: `${day.tithi.name_te} upto ${formatTime(day.tithi.ends_at)}` },
    { label: 'వాసరః', value: day.vara.name_te },
    { label: 'నక్షత్రం', value: `${day.nakshatra.name_te} upto ${formatTime(day.nakshatra.ends_at)}` },
    { label: 'దివసం', value: `${formatTime(day.sunrise)} - ${formatTime(day.sunset)}` },
  ];
}

export function muhurtaLines(day: PanchangamResponse): Array<{ label: string; value: string }> {
  const m = day.muhurta;
  return [
    { label: 'రాహు కాలం', value: `${formatTime(m.rahu_kalam.starts_at)} to ${formatTime(m.rahu_kalam.ends_at)}` },
    { label: 'యమగండం', value: `${formatTime(m.yamagandam.starts_at)} to ${formatTime(m.yamagandam.ends_at)}` },
    { label: 'గుళికా కాలం', value: `${formatTime(m.gulika_kalam.starts_at)} to ${formatTime(m.gulika_kalam.ends_at)}` },
    { label: 'అభిజిత్', value: `${formatTime(m.abhijit.starts_at)} to ${formatTime(m.abhijit.ends_at)}` },
    { label: 'బ్రహ్మ ముహూర్తం', value: `${formatTime(m.brahma_muhurtam.starts_at)} to ${formatTime(m.brahma_muhurtam.ends_at)}` },
    { label: 'ప్రదోష కాలం', value: `${formatTime(m.pradosha_kalam.starts_at)} to ${formatTime(m.pradosha_kalam.ends_at)}` },
  ];
}
