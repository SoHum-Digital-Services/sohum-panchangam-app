import { API_BASE_URL } from './client';
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
}

export interface MuhurthamResult {
  event: string;
  event_te: string;
  count: number;
  muhurtas: Muhurtham[];
}

export async function findMuhurthams(startDate: string, endDate: string, place: Place): Promise<MuhurthamResult> {
  const params = new URLSearchParams({
    event: 'vivaha',
    start_date: startDate,
    end_date: endDate,
    latitude: String(place.latitude),
    longitude: String(place.longitude),
  });
  const res = await fetch(`${API_BASE_URL}/v1/muhurta?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Muhurtham API error: ${res.status}`);
  }
  return res.json();
}
