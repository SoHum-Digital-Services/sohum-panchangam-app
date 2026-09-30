import type { PanchangamResponse } from './api/types';
import { formatTime } from './format';
import type { AppLanguage } from './settings';

export const weekdayTeShort = ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని'];

export function weekdayShort(dateStr: string, language: AppLanguage = 'te'): string {
  if (language === 'en') return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short' });
  return weekdayTeShort[new Date(`${dateStr}T00:00:00`).getDay()];
}

// Single source of truth for card titles that appear on more than one
// screen (Today's "Details" rail, Calendar's day-detail rail), so the same
// content is never labeled two different things depending which tab you're on.
export function panchangamCardTitle(telugu: boolean): string {
  return telugu ? 'పంచాంగం' : 'Panchangam';
}
export function muhurtaCardTitle(telugu: boolean): string {
  return telugu ? 'ముహూర్తం' : 'Muhurta';
}
export function sankalpamCardTitle(telugu: boolean): string {
  return telugu ? 'సంకల్పం' : 'Sankalpam';
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

// The day's festivals and observances in the chosen language.
export function observanceNames(day: PanchangamResponse, language: AppLanguage = 'te'): string[] {
  return day.observances.map((o) => (language === 'te' ? o.name_te : o.name_en));
}

export function primaryDayLines(day: PanchangamResponse, language: AppLanguage = 'te'): Array<{ label: string; value: string }> {
  const te = language === 'te';
  return [
    { label: te ? 'సం.' : 'Year', value: te ? `${day.samvatsara.name_te}, ${day.ayana.name_te}` : `${day.samvatsara.name_en}, ${day.ayana.name_en}` },
    { label: te ? 'మాసం' : 'Month', value: te ? `${day.lunar_month.name_te}, ${pakshaTe(day.tithi.paksha)} పక్షం` : `${day.lunar_month.name_en}, ${day.tithi.paksha} Paksha` },
    { label: te ? 'తిథి' : 'Tithi', value: `${te ? day.tithi.name_te : day.tithi.name_en} · ${formatTime(day.tithi.ends_at)}` },
    { label: te ? 'వాసరః' : 'Weekday', value: te ? day.vara.name_te : day.vara.name_en },
    { label: te ? 'నక్షత్రం' : 'Nakshatra', value: `${te ? day.nakshatra.name_te : day.nakshatra.name_en} · ${formatTime(day.nakshatra.ends_at)}` },
    { label: te ? 'యోగం' : 'Yoga', value: `${te ? day.yoga.name_te : day.yoga.name_en} · ${formatTime(day.yoga.ends_at)}` },
    { label: te ? 'కరణం' : 'Karana', value: `${te ? day.karana.name_te : day.karana.name_en} · ${formatTime(day.karana.ends_at)}` },
    { label: te ? 'దివసం' : 'Daylight', value: `${formatTime(day.sunrise)} - ${formatTime(day.sunset)}` },
  ];
}

export function muhurtaLines(day: PanchangamResponse, language: AppLanguage = 'te'): Array<{ label: string; value: string }> {
  const m = day.muhurta;
  const te = language === 'te';
  const to = te ? 'నుండి' : 'to';
  const span = (window: { starts_at: string; ends_at: string }) => `${formatTime(window.starts_at)} ${to} ${formatTime(window.ends_at)}`;
  return [
    { label: te ? 'రాహు కాలం' : 'Rahu Kalam', value: span(m.rahu_kalam) },
    { label: te ? 'యమగండం' : 'Yamagandam', value: span(m.yamagandam) },
    { label: te ? 'గుళికా కాలం' : 'Gulika Kalam', value: span(m.gulika_kalam) },
    { label: te ? 'అభిజిత్' : 'Abhijit', value: span(m.abhijit) },
    { label: te ? 'బ్రహ్మ ముహూర్తం' : 'Brahma Muhurta', value: span(m.brahma_muhurtam) },
    { label: te ? 'ప్రదోష కాలం' : 'Pradosham', value: span(m.pradosha_kalam) },
    { label: te ? 'దుర్ముహూర్తం' : 'Durmuhurtham', value: day.display[language].durmuhurtham || '—' },
    { label: te ? 'వర్జ్యం' : 'Varjyam', value: day.display[language].varjyam || '—' }, // the windows that begin today; `day.varjyam` also holds one that starts tomorrow morning
  ];
}
