import { API_BASE_URL } from './client';
import type { BirthDetails } from './jyotisha';
import type { Place } from './places';

// GET /v1/muhurta on the panchangam engine: graded vivaha muhurtas between two
// dates for a place (Muhurta Chintamani rules; grades and scores are the engine's own).
export interface Muhurtham {
  grade: 1 | 2 | 3;
  date: string;
  time: string;
  weekday_en: string;
  weekday_te: string;
  lunar_month_en: string;
  lunar_month_te: string;
  paksha: string;
  tithi_en: string;
  tithi_te: string;
  nakshatra_en: string;
  nakshatra_te: string;
  lagna_en: string;
  lagna_te: string;
  text_te: string;
  personal?: { tara_en: string; tara_te: string; chandra_house: number };
}

export interface MuhurthamResult {
  event: string;
  event_te: string;
  count: number;
  muhurtas: Muhurtham[];
  personal?: { birth_nakshatra_en: string; birth_rashi_en: string; removed_unsuitable: number };
}

// Events the app offers. `ready` is whether the engine computes it yet; the others
// are listed so people can see what is coming (engine rules added one by one).
export const EVENTS = [
  { key: 'vivaha', en: 'Vivaha (wedding)', te: 'వివాహం', ready: true },
  { key: 'gruha_pravesham', en: 'Gruha pravesham', te: 'గృహ ప్రవేశం', ready: true },
  { key: 'upanayanam', en: 'Upanayanam', te: 'ఉపనయనం', ready: true },
  { key: 'namakaranam', en: 'Namakaranam', te: 'నామకరణం', ready: true },
] as const;
export type EventKey = (typeof EVENTS)[number]['key'];

// `person`: birth details for muhurthams suited to that person (Tara and Chandra balam). The name is
// never sent; only the birth date, time and place go to the calculation API.
export async function findMuhurthams(startDate: string, endDate: string, place: Place, event: EventKey = 'vivaha', person?: BirthDetails): Promise<MuhurthamResult> {
  const params = new URLSearchParams({
    event,
    start_date: startDate,
    end_date: endDate,
    latitude: String(place.latitude),
    longitude: String(place.longitude),
  });
  if (person) {
    params.set('birth_date', person.birth_date);
    params.set('birth_time', person.birth_time);
    params.set('birth_latitude', person.latitude);
    params.set('birth_longitude', person.longitude);
    params.set('birth_timezone', 'Asia/Kolkata');
  }
  const res = await fetch(`${API_BASE_URL}/v1/muhurta?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Muhurtham API error: ${res.status}`);
  }
  return res.json();
}
