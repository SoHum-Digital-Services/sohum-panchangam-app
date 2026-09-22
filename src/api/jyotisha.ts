import { API_BASE_URL } from './client';

export interface BirthDetails { name: string; birth_date: string; birth_time: string; latitude: string; longitude: string; }
export interface HoroscopeResult {
  subject: { name: string | null; birth_local: string };
  ascendant: { sign: string; nakshatra: string; pada: number };
  planets: Array<{ name: string; sign: string; nakshatra: string; pada: number; house: number }>;
  charts: Record<string, { code: string; name: string; points: Array<{ name: string; sign: string; house: number }> }>;
  dashas: { active_path: Array<{ level: string; lord: string; starts_at: string; ends_at: string }> };
  doshas?: Record<string, { dosha: string; present: boolean; birth_nakshatra?: string; severity?: string; remedies_te?: string; note?: string }>;
  disclaimer: string;
}
export interface CompatibilityResult {
  bride: { nakshatra: string; rashi: string }; groom: { nakshatra: string; rashi: string };
  kootas: Array<{ koota: string; points: number; max_points: number; note: string }>;
  total_points: number; max_points: number; verdict: string; doshas: Array<{ name: string; note: string }>; note: string;
}

function body(details: BirthDetails) {
  return { name: details.name.trim() || null, birth_date: details.birth_date, birth_time: details.birth_time, latitude: Number(details.latitude), longitude: Number(details.longitude), timezone: 'Asia/Kolkata' };
}
async function post<T>(path: string, requestBody: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
  if (!response.ok) throw new Error((await response.text()) || `Calculation failed (${response.status})`);
  return response.json() as Promise<T>;
}
export function calculateHoroscope(details: BirthDetails, withDoshas = false) { return post<HoroscopeResult>(withDoshas ? '/v1/horoscope/predictions' : '/v1/horoscope', body(details)); }
export function calculateCompatibility(bride: BirthDetails, groom: BirthDetails) { return post<CompatibilityResult>('/v1/compatibility/ashtakoota', { bride: body(bride), groom: body(groom) }); }
