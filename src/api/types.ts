export interface NamedPeriod {
  starts_at: string;
  ends_at: string;
}

export interface Vara {
  index: number;
  name_en: string;
  name_te: string;
}

export interface Tithi extends NamedPeriod {
  index: number;
  name_en: string;
  name_te: string;
  paksha: 'Shukla' | 'Krishna';
}

export interface Nakshatra extends NamedPeriod {
  index: number;
  name_en: string;
  name_te: string;
  pada: number;
}

export interface Yoga extends NamedPeriod {
  index: number;
  name_en: string;
  name_te?: string;
}

export interface Karana extends NamedPeriod {
  index: number;
  name_en: string;
  name_te?: string;
}

export interface LunarMonth {
  month_index: number;
  name_en: string;
  name_te: string;
  month_system: 'amanta' | 'purnimanta';
  month_type: string;
  is_adhika: boolean;
  is_nija: boolean;
  is_kshaya: boolean;
  began_at: string;
  ends_at: string;
}

export interface Rashi {
  index: number;
  name_en: string;
  name_te: string;
}

export interface Muhurta {
  rahu_kalam: NamedPeriod;
  yamagandam: NamedPeriod;
  gulika_kalam: NamedPeriod;
  abhijit: NamedPeriod;
  brahma_muhurtam: NamedPeriod;
  pratah_sandhya: NamedPeriod;
  madhyahna_sandhya: NamedPeriod;
  sayam_sandhya: NamedPeriod;
  pradosha_kalam: NamedPeriod;
  // Not returned by the API yet (only on its unmerged day-shape branch); shown when present.
  durmuhurtham?: NamedPeriod[];
}

export interface NamedCycle {
  index: number;
  name_en: string;
  name_te: string;
}

export interface Varjyam extends NamedPeriod {
  // When Swiss-Lahiri computed, this is the nakshatra name. When sourced
  // from the Mukteshwara reference workbook it's absent (that workbook
  // doesn't record which nakshatra); source_text has the raw published row.
  nakshatra?: string;
  source_text?: string;
}

export interface PanchangamResponse {
  date: string;
  location: { latitude: number; longitude: number; altitude_m: number; timezone: string };
  sunrise: string;
  sunset: string;
  moonrise: string | null;
  moonset: string | null;
  vara: Vara;
  tithi: Tithi;
  nakshatra: Nakshatra;
  yoga: Yoga;
  karana: Karana;
  lunar_month: LunarMonth;
  moon_rashi: Rashi;
  sun_rashi: Rashi;
  muhurta: Muhurta;
  varjyam: Varjyam[];
  source: { profile: string; note: string; month_system: string };
  festivals: string[];
  samvatsara: NamedCycle;
  ritu: NamedCycle;
  ayana: NamedCycle;
  sankalpam: string;
}

// One entry from GET /v1/festivals.
export interface FestivalItem {
  key: string;
  name: string;
  name_te: string;
  date: string;
  weekday: string;
}

export type MonthlyObservanceType = 'ekadashi' | 'pournami' | 'amavasya' | 'sankashta_chaturthi' | 'masa_shivaratri' | 'shani_trayodashi' | 'pradosham' | 'pitru_tarpanam' | 'maha_shivaratri';

export interface TithiDay {
  date: string;
  weekday: string;
  tithi_at_sunrise: number;
  differs_from_amavasya?: boolean;
  paksha?: 'Shukla' | 'Krishna';
  title?: string;
  title_te?: string;
}

export interface TithiDaysResponse {
  days: Partial<Record<MonthlyObservanceType, TithiDay[]>>;
}
