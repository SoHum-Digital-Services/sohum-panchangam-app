import type { FestivalItem, MonthlyObservanceType, TithiDaysResponse } from './api/types';

const labels: Record<MonthlyObservanceType, { name: string; name_te: string }> = {
  ekadashi: { name: 'Ekadashi', name_te: 'ఏకాదశి' },
  pournami: { name: 'Pournami', name_te: 'పౌర్ణమి' },
  amavasya: { name: 'Amavasya', name_te: 'అమావాస్య' },
  sankashta_chaturthi: { name: 'Sankashta Chaturthi', name_te: 'సంకష్ట చతుర్థి' },
  masa_shivaratri: { name: 'Masa Shivaratri', name_te: 'మాస శివరాత్రి' },
  shani_trayodashi: { name: 'Shani Trayodashi', name_te: 'శని త్రయోదశి' },
  pradosham: { name: 'Pradosham', name_te: 'ప్రదోషం' },
  pitru_tarpanam: { name: 'Pitru Tarpanam', name_te: 'పితృ తర్పణం' },
  maha_shivaratri: { name: 'Maha Shivaratri', name_te: 'మహా శివరాత్రి' },
};

export function monthlyObservances(days: TithiDaysResponse['days']): FestivalItem[] {
  return (Object.keys(labels) as MonthlyObservanceType[]).flatMap((key) =>
    (days[key] ?? []).filter((day) => key !== 'pitru_tarpanam' || day.differs_from_amavasya === true).map((day) => ({
      key,
      date: day.date,
      weekday: day.weekday,
      name: key === 'pradosham' ? day.title || labels[key].name : labels[key].name,
      name_te: key === 'pradosham' ? day.title_te || day.title || labels[key].name_te : labels[key].name_te,
    })),
  ).sort((a, b) => a.date.localeCompare(b.date));
}
