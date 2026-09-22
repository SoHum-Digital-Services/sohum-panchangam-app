import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { CHERUVUGATTU, City } from './api/client';

export type AppLanguage = 'te' | 'en';

export const PANCHANGAM_CITIES: City[] = [
  CHERUVUGATTU,
  { slug: 'hyderabad', name_en: 'Hyderabad', name_te: 'హైదరాబాద్', latitude: 17.385, longitude: 78.4867 },
  { slug: 'tirupati', name_en: 'Tirupati', name_te: 'తిరుపతి', latitude: 13.6288, longitude: 79.4192 },
  { slug: 'vijayawada', name_en: 'Vijayawada', name_te: 'విజయవాడ', latitude: 16.5062, longitude: 80.648 },
];

interface PanchangamSettingsValue {
  city: City;
  setCity: (city: City) => void;
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
}

const PanchangamSettingsContext = createContext<PanchangamSettingsValue | null>(null);

export function PanchangamSettingsProvider({ children }: { children: ReactNode }) {
  const [city, setCity] = useState(CHERUVUGATTU);
  const [language, setLanguage] = useState<AppLanguage>('te');
  const value = useMemo(() => ({ city, setCity, language, setLanguage }), [city, language]);
  return <PanchangamSettingsContext.Provider value={value}>{children}</PanchangamSettingsContext.Provider>;
}

export function usePanchangamSettings() {
  const settings = useContext(PanchangamSettingsContext);
  if (!settings) throw new Error('usePanchangamSettings must be used inside PanchangamSettingsProvider');
  return settings;
}
