import type { PanchangamResponse } from './types';

const BASE_URL = 'https://panchangam-eight.vercel.app';

export interface City {
  slug: string;
  name_en: string;
  name_te: string;
  latitude: number;
  longitude: number;
}

export const CHERUVUGATTU: City = {
  slug: 'hyderabad-cheruvugattu',
  name_en: 'Cheruvugattu (Narketpally)',
  name_te: 'చెరువుగట్టు',
  latitude: 17.19,
  longitude: 78.61,
};

export async function fetchPanchangam(
  date: string,
  city: City,
): Promise<PanchangamResponse> {
  const params = new URLSearchParams({
    date,
    latitude: String(city.latitude),
    longitude: String(city.longitude),
  });
  const res = await fetch(`${BASE_URL}/v1/panchangam?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Panchangam API error: ${res.status}`);
  }
  return res.json();
}
