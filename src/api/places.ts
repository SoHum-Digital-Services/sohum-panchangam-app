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
// (a Telangana temple's community), so India is searched first and only
// falls back to a worldwide search if India has nothing matching.
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

// Nominatim's own relevance ranking is fuzzy (substring/token matches
// anywhere in the address, not just the city name), which is how a search
// for "nalg" was surfacing places with no real connection to what was
// typed. This app wants plain autocomplete behavior: only city names that
// literally start with what's been typed so far, narrowing as more is
// typed -- so filtering (not just sorting) happens here, client-side,
// regardless of what Nominatim itself considered relevant.
function toCandidates(results: NominatimResult[], query: string): Array<{ place: Place; city: string }> {
  const q = query.toLowerCase();
  const seen = new Set<string>();
  const candidates: Array<{ place: Place; city: string }> = [];
  for (const r of results) {
    const converted = toPlace(r);
    if (!converted) continue;
    if (!converted.city.toLowerCase().startsWith(q)) continue;
    const key = converted.place.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push(converted);
  }
  return candidates;
}

export async function searchPlaces(query: string): Promise<Place[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const priorityResults = await nominatimSearch(trimmed, PRIORITY_COUNTRY_CODE);
  let candidates = toCandidates(priorityResults, trimmed);

  // Only reach outside India if India genuinely has no prefix match --
  // not just "fewer than N results" (that's what let unrelated foreign
  // places sneak in before).
  if (candidates.length === 0) {
    const worldResults = await nominatimSearch(trimmed);
    candidates = toCandidates(worldResults, trimmed);
  }

  return candidates.slice(0, 6).map((c) => c.place);
}
