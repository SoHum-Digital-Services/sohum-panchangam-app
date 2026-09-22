import type { PanchangamResponse } from './api/types';
import { formatTime } from './format';
import type { AppLanguage } from './settings';

export const weekdayTeShort = ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని'];

export function weekdayShort(dateStr: string, language: AppLanguage = 'te'): string {
  if (language === 'en') return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short' });
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

export function primaryDayLines(day: PanchangamResponse, language: AppLanguage = 'te'): Array<{ label: string; value: string }> {
  const te = language === 'te';
  return [
    { label: te ? 'సం.' : 'Year', value: te ? `${day.samvatsara.name_te}, ${day.ayana.name_te}` : `${day.samvatsara.name_en}, ${day.ayana.name_en}` },
    { label: te ? 'మాసం' : 'Month', value: te ? `${day.lunar_month.name_te}, ${pakshaTe(day.tithi.paksha)} పక్షం` : `${day.lunar_month.name_en}, ${day.tithi.paksha} Paksha` },
    { label: te ? 'తిథి' : 'Tithi', value: `${te ? day.tithi.name_te : day.tithi.name_en} · ${formatTime(day.tithi.ends_at)}` },
    { label: te ? 'వాసరః' : 'Weekday', value: te ? day.vara.name_te : day.vara.name_en },
    { label: te ? 'నక్షత్రం' : 'Nakshatra', value: `${te ? day.nakshatra.name_te : day.nakshatra.name_en} · ${formatTime(day.nakshatra.ends_at)}` },
    { label: te ? 'దివసం' : 'Daylight', value: `${formatTime(day.sunrise)} - ${formatTime(day.sunset)}` },
  ];
}

export function muhurtaLines(day: PanchangamResponse, language: AppLanguage = 'te'): Array<{ label: string; value: string }> {
  const m = day.muhurta;
  const te = language === 'te';
  return [
    { label: te ? 'రాహు కాలం' : 'Rahu Kalam', value: `${formatTime(m.rahu_kalam.starts_at)} to ${formatTime(m.rahu_kalam.ends_at)}` },
    { label: te ? 'యమగండం' : 'Yamagandam', value: `${formatTime(m.yamagandam.starts_at)} to ${formatTime(m.yamagandam.ends_at)}` },
    { label: te ? 'గుళికా కాలం' : 'Gulika Kalam', value: `${formatTime(m.gulika_kalam.starts_at)} to ${formatTime(m.gulika_kalam.ends_at)}` },
    { label: te ? 'అభిజిత్' : 'Abhijit', value: `${formatTime(m.abhijit.starts_at)} to ${formatTime(m.abhijit.ends_at)}` },
    { label: te ? 'బ్రహ్మ ముహూర్తం' : 'Brahma Muhurta', value: `${formatTime(m.brahma_muhurtam.starts_at)} to ${formatTime(m.brahma_muhurtam.ends_at)}` },
    { label: te ? 'ప్రదోష కాలం' : 'Pradosham', value: `${formatTime(m.pradosha_kalam.starts_at)} to ${formatTime(m.pradosha_kalam.ends_at)}` },
  ];
}
