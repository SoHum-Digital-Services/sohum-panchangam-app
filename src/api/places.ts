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

export async function searchPlaces(query: string): Promise<Place[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];
  const params = new URLSearchParams({
    q: trimmed,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '10',
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'SoHumPanchangamApp/1.0' },
  });
  if (!res.ok) return [];
  const results: NominatimResult[] = await res.json();

  // Nominatim returns neighbourhoods, development authorities, urban/rural
  // splits of the same city, etc. Keep only results that resolve to an
  // actual city/town/village, and build a clean "City, State, Country"
  // label ourselves instead of Nominatim's noisy full address string --
  // that also naturally dedupes the "Foo (Urban)" / "Foo (Rural)" pairs.
  const seen = new Set<string>();
  const places: Place[] = [];
  for (const r of results) {
    const city = r.address?.city || r.address?.town || r.address?.village || r.address?.municipality;
    if (!city) continue;
    const label = [city, r.address?.state, r.address?.country].filter(Boolean).join(', ');
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    places.push({ label, latitude: Number(r.lat), longitude: Number(r.lon) });
    if (places.length === 6) break;
  }
  return places;
}
