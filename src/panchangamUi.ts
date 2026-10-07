import type { PanchangamResponse } from './api/types';
import { formatClock, formatClockOn, formatTime } from './format';
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
  const to = te ? 'నుండి' : 'to';
  const span = (window: { starts_at: string; ends_at: string }) => `${formatTime(window.starts_at)} ${to} ${formatTime(window.ends_at)}`;
  return [
    { label: te ? 'రాహు కాలం' : 'Rahu Kalam', value: span(m.rahu_kalam) },
    { label: te ? 'యమగండం' : 'Yamagandam', value: span(m.yamagandam) },
    { label: te ? 'గుళికా కాలం' : 'Gulika Kalam', value: span(m.gulika_kalam) },
    { label: te ? 'అభిజిత్' : 'Abhijit', value: span(m.abhijit) },
    { label: te ? 'బ్రహ్మ ముహూర్తం' : 'Brahma Muhurta', value: span(m.brahma_muhurtam) },
    { label: te ? 'ప్రదోష కాలం' : 'Pradosham', value: span(m.pradosha_kalam) },
  ];
}

export interface InfoRow {
  label: string;
  value: string;
}

export interface InfoPage {
  key: string;
  title: string;
  rows: InfoRow[];
  text?: string;
}

// Telugu lunar-month names end in "ము"; the day column shows the short form (భాద్రపద).
export function masaShort(day: PanchangamResponse, language: AppLanguage): string {
  return language === 'te' ? day.lunar_month.name_te.replace(/ము$/, '') : day.lunar_month.name_en;
}

// Approximate lit fraction from the tithi (elongation at the middle of the tithi); Shukla waxes, Bahula wanes.
export function moonPhase(tithiIndex: number): { fraction: number; waxing: boolean } {
  const elongation = ((tithiIndex - 0.5) * 12 * Math.PI) / 180;
  return { fraction: (1 - Math.cos(elongation)) / 2, waxing: tithiIndex <= 15 };
}

export function todayPages(day: PanchangamResponse, language: AppLanguage = 'te'): InfoPage[] {
  const te = language === 'te';
  const at = (iso: string | null) => formatClockOn(iso, day.date);
  const span = (window: { starts_at: string; ends_at: string }) => `${at(window.starts_at)} – ${at(window.ends_at)}`;
  const m = day.muhurta;
  const paksha = te ? pakshaTe(day.tithi.paksha) : day.tithi.paksha;
  const varjyam = day.varjyam.length > 0 ? day.varjyam.map(span).join('\n') : '—';

  return [
    {
      key: 'panchanga',
      title: te ? 'పంచాంగం' : 'Panchangam',
      rows: [
        { label: te ? 'సం.' : 'Year', value: te ? `${day.samvatsara.name_te}, ${day.ayana.name_te}` : `${day.samvatsara.name_en}, ${day.ayana.name_en}` },
        { label: te ? 'మాసః' : 'Month', value: te ? `${day.ritu.name_te}, ${day.lunar_month.name_te}` : `${day.ritu.name_en}, ${day.lunar_month.name_en}` },
        { label: te ? 'తిథిః' : 'Tithi', value: `${paksha} ${te ? day.tithi.name_te : day.tithi.name_en} upto ${at(day.tithi.ends_at)}` },
        { label: te ? 'వాసరః' : 'Weekday', value: te ? day.vara.name_te : day.vara.name_en },
        { label: te ? 'నక్షత్రః' : 'Nakshatra', value: `${te ? day.nakshatra.name_te : day.nakshatra.name_en} upto ${at(day.nakshatra.ends_at)}` },
        { label: te ? 'సౌ మాసః' : 'Solar month', value: te ? day.sun_rashi.name_te : day.sun_rashi.name_en },
        { label: te ? 'దివసః' : 'Daylight', value: `${formatClock(day.sunrise)} – ${formatClock(day.sunset)}` },
      ],
    },
    {
      key: 'important',
      title: te ? 'ముఖ్య సమయాలు' : 'Important Times',
      rows: [
        { label: te ? 'రాశి' : 'Rashi', value: te ? day.moon_rashi.name_te : day.moon_rashi.name_en },
        { label: te ? 'బ్రహ్మ ముహూర్తం' : 'Brahma Muhurta', value: span(m.brahma_muhurtam) },
        { label: te ? 'ప్రాతః సంధ్యా' : 'Pratah Sandhya', value: span(m.pratah_sandhya) },
        { label: te ? 'మాధ్యాహ్న సంధ్యా' : 'Madhyahna Sandhya', value: span(m.madhyahna_sandhya) },
        { label: te ? 'సాయం సంధ్యా' : 'Sayam Sandhya', value: span(m.sayam_sandhya) },
        { label: te ? 'ప్రదోష కాలం' : 'Pradosham', value: span(m.pradosha_kalam) },
      ],
    },
    {
      key: 'auspicious',
      title: te ? 'శుభ / అశుభ సమయాలు' : 'Auspicious / Inauspicious',
      rows: [
        { label: te ? 'అభిజిత్' : 'Abhijit', value: span(m.abhijit) },
        { label: te ? 'వర్జ్యం' : 'Varjyam', value: varjyam },
        { label: te ? 'రాహు కాలం' : 'Rahu Kalam', value: span(m.rahu_kalam) },
        { label: te ? 'యమగండం' : 'Yamagandam', value: span(m.yamagandam) },
        { label: te ? 'గుళికా కాలం' : 'Gulika Kalam', value: span(m.gulika_kalam) },
      ],
    },
    {
      key: 'sankalpam',
      title: sankalpamCardTitle(te),
      rows: [],
      text: day.sankalpam,
    },
  ];
}
