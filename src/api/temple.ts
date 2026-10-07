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

export interface Stotram {
  id: string;
  slug: string;
  title: string;
  title_telugu: string;
  text_telugu: string;
  deity: string;
  seva_id: string | null;
  display_order: number;
  active_flag: boolean;
  created_at: string;
}

export interface TempleNews {
  id: string;
  title: string;
  title_telugu: string;
  content: string;
  content_telugu: string;
  is_important: boolean;
  event_date?: string | null;
  active_flag: boolean;
  created_at: string;
}

export interface TemplePhoto {
  id: string;
  title: string;
  image_url: string;
  category: string;
  media_type: string;
  created_at: string;
}

export async function fetchStotrams(): Promise<Stotram[]> {
  const res = await fetch(`${TEMPLE_API_BASE}/stotrams`);
  if (!res.ok) throw new Error(`Temple stotrams API error: ${res.status}`);
  return res.json();
}

export async function fetchTempleNews(): Promise<TempleNews[]> {
  const res = await fetch(`${TEMPLE_API_BASE}/news`);
  if (!res.ok) throw new Error(`Temple news API error: ${res.status}`);
  return res.json();
}

export async function fetchTemplePhotos(): Promise<TemplePhoto[]> {
  const res = await fetch(`${TEMPLE_API_BASE}/gallery?media_type=PHOTO`);
  if (!res.ok) throw new Error(`Temple gallery API error: ${res.status}`);
  return res.json();
}

export function templeImageUrl(path: string): string {
  return /^https?:\/\//i.test(path) ? path : `${TEMPLE_BOOKING_URL}/${path.replace(/^\//, '')}`;
}
