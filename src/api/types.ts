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
  paksha: 'Shukla' | 'Bahula' | 'Krishna';
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
  name_te: string;
}

export interface Karana extends NamedPeriod {
  index: number;
  name_en: string;
  name_te: string;
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
  durmuhurtham: NamedPeriod[];
}

export interface NamedCycle {
  index: number;
  name_en: string;
  name_te: string;
}

export interface Varjyam extends NamedPeriod {
  // The nakshatra name, when the engine gives one for this period.
  nakshatra?: string;
  source_text?: string;
}

// A festival or observance of the day. `recurring` marks the regular days (Ekadashi, Pournami, Amavasya, ...).
export interface Observance {
  key: string;
  name_en: string;
  name_te: string;
  kind: 'festival' | 'solar' | 'planetary' | 'weekday' | 'recurring';
  recurring: boolean;
}

export interface DayDisplay {
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  rahu_kalam: string;
  yamagandam: string;
  gulika_kalam: string;
  abhijit: string;
  durmuhurtham: string;
  varjyam: string;
  sunrise: string;
  sunset: string;
  festivals: string[];
}

export interface PanchangamResponse {
  schema: string;
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
  source: { profile: string; calculation?: string; note?: string; month_system: string };
  festivals: string[];
  observances: Observance[];
  // Ready-to-show text for the timings, in both languages (see sohum-contracts PANCHANGAM_DAY_SHAPE.md section 4).
  display: Record<'te' | 'en', DayDisplay>;
  samvatsara: NamedCycle;
  ritu: NamedCycle;
  ayana: NamedCycle;
  sankalpam: string;
}
