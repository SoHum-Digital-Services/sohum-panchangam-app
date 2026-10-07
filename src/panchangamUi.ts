import type { FestivalItem, PanchangamResponse } from './api/types';
import { formatClock, formatClockOn, formatDateLong, formatTime } from './format';
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
  festivals?: Array<{ name: string; date: string }>;
}

// Amanta month names in order (month_index 1 = Chaitra), short form as the day panel shows them.
const MASA_SHORT_TE = ['చైత్ర', 'వైశాఖ', 'జ్యేష్ఠ', 'ఆషాఢ', 'శ్రావణ', 'భాద్రపద', 'ఆశ్వయుజ', 'కార్తీక', 'మార్గశిర', 'పుష్య', 'మాఘ', 'ఫాల్గుణ'];
const MASA_SHORT_EN = ['Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada', 'Ashwayuja', 'Kartika', 'Margashira', 'Pushya', 'Magha', 'Phalguna'];

// Telugu lunar-month names end in "ము"; the day column shows the short form (భాద్రపద).
export function masaShort(day: PanchangamResponse, language: AppLanguage): string {
  return language === 'te' ? day.lunar_month.name_te.replace(/ము$/, '') : day.lunar_month.name_en;
}

// A Purnimanta month runs Pournami to Pournami, so in the Bahula half it already carries the next Amanta month's name.
// Adhika, Nija and Kshaya months are left blank rather than guessed.
export function purnimantaMasa(day: PanchangamResponse, language: AppLanguage): string {
  if (day.lunar_month.month_type !== 'normal') return '—';
  const index = (day.lunar_month.month_index - 1 + (day.tithi.index > 15 ? 1 : 0)) % 12;
  return (language === 'te' ? MASA_SHORT_TE : MASA_SHORT_EN)[index];
}

// Approximate lit fraction from the tithi (elongation at the middle of the tithi); Shukla waxes, Bahula wanes.
export function moonPhase(tithiIndex: number): { fraction: number; waxing: boolean } {
  const elongation = ((tithiIndex - 0.5) * 12 * Math.PI) / 180;
  return { fraction: (1 - Math.cos(elongation)) / 2, waxing: tithiIndex <= 15 };
}

export function festivalChipDate(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function dayPages(day: PanchangamResponse, language: AppLanguage = 'te', upcoming: FestivalItem[] = []): InfoPage[] {
  const te = language === 'te';
  const at = (iso: string | null) => formatClockOn(iso, day.date);
  const span = (window: { starts_at: string; ends_at: string }) => `${at(window.starts_at)} to ${at(window.ends_at)}`;
  const spans = (windows: Array<{ starts_at: string; ends_at: string }>) => (windows.length > 0 ? windows.map(span).join('\n') : '—');
  const m = day.muhurta;
  const paksha = te ? pakshaTe(day.tithi.paksha) : day.tithi.paksha;
  const yogaName = te ? day.yoga.name_te ?? day.yoga.name_en : day.yoga.name_en;
  const karanaName = te ? day.karana.name_te ?? day.karana.name_en : day.karana.name_en;

  const auspicious: InfoRow[] = [
    { label: te ? 'అభిజిత్' : 'Abhijit', value: span(m.abhijit) },
    { label: te ? 'వర్జ్యం' : 'Varjyam', value: spans(day.varjyam) },
  ];
  if (m.durmuhurtham) auspicious.push({ label: te ? 'దుర్ముహూర్తం' : 'Durmuhurtam', value: spans(m.durmuhurtham) });
  auspicious.push(
    { label: te ? 'రాహు కాలం' : 'Rahu Kalam', value: span(m.rahu_kalam) },
    { label: te ? 'యమగండం' : 'Yamagandam', value: span(m.yamagandam) },
    { label: te ? 'గుళికా కాలం' : 'Gulika Kalam', value: span(m.gulika_kalam) },
  );

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
    { key: 'sankalpam', title: sankalpamCardTitle(te), rows: [], text: day.sankalpam },
    {
      key: 'festivals',
      title: te ? 'రాబోయే పండుగలు' : 'Upcoming Festivals',
      rows: [],
      festivals: upcoming.filter((f) => f.date >= day.date).slice(0, 6).map((f) => ({ name: te ? f.name_te : f.name, date: festivalChipDate(f.date) })),
    },
    { key: 'auspicious', title: te ? 'శుభ / అశుభ సమయాలు' : 'Auspicious / Inauspicious', rows: auspicious },
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
      key: 'additional',
      title: te ? 'అదనపు వివరాలు' : 'Additional Details',
      rows: [
        { label: te ? 'పూర్ణిమాంత మాసః' : 'Purnimanta month', value: purnimantaMasa(day, language) },
        { label: te ? 'అమాంత మాసః' : 'Amanta month', value: masaShort(day, language) },
        { label: te ? 'సౌరమాన మాసః' : 'Solar month', value: te ? day.sun_rashi.name_te : day.sun_rashi.name_en },
        { label: te ? 'సంవత్సరః' : 'Samvatsara', value: te ? day.samvatsara.name_te : day.samvatsara.name_en },
        { label: te ? 'యోగ' : 'Yoga', value: `${yogaName} upto ${at(day.yoga.ends_at)}` },
        { label: te ? 'కరణ' : 'Karana', value: `${karanaName} upto ${at(day.karana.ends_at)}` },
      ],
    },
  ];
}

// Plain-text version of one panel page, for the share sheet.
export function shareText(day: PanchangamResponse, page: InfoPage, cityLabel: string, language: AppLanguage = 'te'): string {
  const lines = [`${page.title} · ${formatDateLong(day.date)}`, cityLabel, ''];
  if (page.text) lines.push(page.text);
  if (page.festivals) lines.push(...page.festivals.map((f) => `✦ ${f.name} – ${f.date}`));
  lines.push(...page.rows.map((row) => `${row.label}: ${row.value.replace(/\n/g, ', ')}`));
  lines.push('', language === 'te' ? '— SoHum పంచాంగం' : '— SoHum Panchangam');
  return lines.join('\n');
}
