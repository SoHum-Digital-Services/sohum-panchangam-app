// Place search backing the birth-details "place of birth" autocomplete.
// Uses OpenStreetMap Nominatim (free, no API key). Its usage policy caps
// unauthenticated traffic at ~1 request/second and asks for a real
// User-Agent -- fine for this app's current scale, but swap for a paid
// geocoder (Google Places, Mapbox) before any real production traffic.
export interface Place {
  label: string;
  latitude: number;
  longitude: number;
}

interface NominatimResult {
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
  };
}

// This app's users are overwhelmingly searching for Indian birthplaces
// (a Telangana temple's community), so India-scoped results are queried
// first and always sort ahead of the rest -- not a hard restriction,
// since someone can still be born elsewhere.
const PRIORITY_COUNTRY_CODE = 'in';

async function nominatimSearch(query: string, countrycodes?: string): Promise<NominatimResult[]> {
  const params = new URLSearchParams({ q: query, format: 'jsonv2', addressdetails: '1', limit: '10' });
  if (countrycodes) params.set('countrycodes', countrycodes);
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'SoHumPanchangamApp/1.0' },
  });
  if (!res.ok) return [];
  return res.json();
}

function toPlace(r: NominatimResult): { place: Place; city: string } | null {
  const city = r.address?.city || r.address?.town || r.address?.village || r.address?.municipality;
  if (!city) return null;
  const label = [city, r.address?.state, r.address?.country].filter(Boolean).join(', ');
  return { place: { label, latitude: Number(r.lat), longitude: Number(r.lon) }, city };
}

export async function searchPlaces(query: string): Promise<Place[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  // Priority-country results first, then a broader fallback search topped
  // up only if the priority search came up short.
  const priorityResults = await nominatimSearch(trimmed, PRIORITY_COUNTRY_CODE);
  const combined = [...priorityResults];
  if (priorityResults.length < 5) {
    combined.push(...(await nominatimSearch(trimmed)));
  }

  // Nominatim returns neighbourhoods, development authorities, urban/rural
  // splits of the same city, etc. Keep only results that resolve to an
  // actual city/town/village, and build a clean "City, State, Country"
  // label ourselves instead of Nominatim's noisy full address string --
  // that also naturally dedupes the "Foo (Urban)" / "Foo (Rural)" pairs.
  const seen = new Set<string>();
  const candidates: Array<{ place: Place; city: string }> = [];
  for (const r of combined) {
    const converted = toPlace(r);
    if (!converted) continue;
    const key = converted.place.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push(converted);
  }

  // City names starting with what was typed ("Hyder..." -> "Hyderabad")
  // rank above ones that merely contain it, matching normal autocomplete
  // behavior; priority-country order (already first in `candidates`,
  // since combined starts with priorityResults) is preserved within each
  // group via a stable sort.
  const q = trimmed.toLowerCase();
  candidates.sort((a, b) => {
    const aStarts = a.city.toLowerCase().startsWith(q) ? 0 : 1;
    const bStarts = b.city.toLowerCase().startsWith(q) ? 0 : 1;
    return aStarts - bStarts;
  });

  return candidates.slice(0, 6).map((c) => c.place);
}
