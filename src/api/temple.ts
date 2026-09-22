export interface Seva {
  id: string;
  name_english: string;
  name_telugu: string;
  description: string;
  description_telugu: string;
  base_price: number;
  duration_minutes: number;
  is_online_bookable: boolean;
  is_paroksha_available: boolean;
  max_persons_per_ticket: number;
  special_instructions: string;
  active_flag: boolean;
  location_categories: string[];
}

const TEMPLE_API_BASE = 'https://spjrsd-backend.onrender.com/api';
export const TEMPLE_BOOKING_URL = 'https://cheruvugattu.online';

export async function fetchSevas(): Promise<Seva[]> {
  const res = await fetch(`${TEMPLE_API_BASE}/sevas`);
  if (!res.ok) {
    throw new Error(`Temple sevas API error: ${res.status}`);
  }
  return res.json();
}
