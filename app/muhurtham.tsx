import { useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { findMuhurthams, Muhurtham, MuhurthamResult } from '../src/api/muhurtham';
import type { Place } from '../src/api/places';
import { Card } from '../src/components/Card';
import { DateInput } from '../src/components/DateInput';
import { PlaceInput } from '../src/components/PlaceInput';
import { colors } from '../src/theme';
import { usePanchangamSettings } from '../src/settings';

const HYDERABAD: Place = { label: 'Hyderabad, Telangana, India', latitude: 17.385, longitude: 78.4867 };
const MAX_DAYS = 400; // the engine's limit for one search

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return iso(d);
}
const daysBetween = (a: string, b: string) => Math.round((new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime()) / 86400000);

// The time as the engine gives it (local, with offset), as 1:38 AM.
function clock(time: string) {
  const [h, m] = time.slice(11, 16).split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

const GRADES = {
  1: { en: 'Best', te: 'ఉత్తమం' },
  2: { en: 'Good', te: 'మంచిది' },
  3: { en: 'Acceptable', te: 'సాధారణం' },
} as const;

export default function MuhurthamScreen() {
  const { language } = usePanchangamSettings();
  const telugu = language === 'te';
  const today = iso(new Date());
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(addDays(today, 180));
  const [place, setPlace] = useState<Place>(HYDERABAD);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [result, setResult] = useState<MuhurthamResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const span = daysBetween(from, to);
    if (span < 0) { setError(telugu ? 'ముగింపు తేదీ ప్రారంభ తేదీ తర్వాత ఉండాలి' : 'The end date must be after the start date'); return; }
    if (span > MAX_DAYS) { setError(telugu ? `ఒకసారి ${MAX_DAYS} రోజుల వరకు మాత్రమే వెతకవచ్చు` : `You can search up to ${MAX_DAYS} days at a time`); return; }
    setLoading(true); setError(null);
    try { setResult(await findMuhurthams(from, to, place)); }
    catch (e) { setError(e instanceof Error ? e.message : (telugu ? 'గణన విఫలమైంది' : 'Calculation failed')); }
    finally { setLoading(false); }
  };

  return <ScrollView style={styles.screen} contentContainerStyle={styles.shell}><View style={styles.frame}>
    <Pressable accessibilityRole="button" accessibilityLabel={telugu ? 'వెనుకకు' : 'Back'} onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
    <View style={styles.header}>
      <Text style={styles.eyebrow}>Muhurta Chintamani</Text>
      <Text style={styles.title}>{telugu ? 'వివాహ ముహూర్తాలు' : 'Vivaha muhurthams'}</Text>
      <Text style={styles.subtitle}>{telugu ? 'మీ ప్రదేశానికి, మీరు ఎంచుకున్న తేదీల మధ్య శుభ వివాహ ముహూర్తాలు' : 'Auspicious wedding times for your place, between the dates you choose'}</Text>
    </View>
    <View style={styles.content}>
      <Card style={styles.formCard}>
        <Text style={styles.label}>{telugu ? 'నుండి' : 'From'}</Text>
        <DateInput value={from} onChange={setFrom} />
        <Text style={styles.label}>{telugu ? 'వరకు' : 'To'}</Text>
        <DateInput value={to} onChange={setTo} />
        <Text style={styles.label}>{telugu ? 'ప్రదేశం' : 'Place'}</Text>
        <PlaceInput initialLabel={place.label} onSelect={setPlace} onDropdownVisibleChange={setPlaceOpen} />
      </Card>
      <Pressable accessibilityRole="button" onPress={submit} disabled={placeOpen || loading} style={[styles.primary, placeOpen && styles.primaryHidden]}>
        {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryText}>{telugu ? 'ముహూర్తాలు చూడండి' : 'Find muhurthams'} →</Text>}
      </Pressable>
      {loading && <Text style={styles.note}>{telugu ? 'లెక్కిస్తోంది… కొన్ని సెకన్లు పట్టవచ్చు.' : 'Calculating… this can take a few seconds.'}</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      {result && <Results result={result} telugu={telugu} />}
    </View>
  </View></ScrollView>;
}

function Results({ result, telugu }: { result: MuhurthamResult; telugu: boolean }) {
  if (!result.muhurtas.length) {
    return <Card><Text style={styles.empty}>{telugu ? 'ఈ తేదీల మధ్య వివాహ ముహూర్తాలు లేవు. ఎక్కువ రోజులు ఎంచుకుని మళ్ళీ చూడండి.' : 'No vivaha muhurthams between these dates. Try a longer range.'}</Text></Card>;
  }
  return <View style={styles.results}>
    <Text style={styles.count}>{telugu ? `${result.count} ముహూర్తాలు` : `${result.count} muhurthams`}</Text>
    {result.muhurtas.map((m) => <MuhurthamCard key={m.time} m={m} telugu={telugu} />)}
    <Text style={styles.note}>{telugu
      ? 'శ్రేణులు మా ఇంజిన్ స్వంత గణన. ముహూర్తాన్ని నిర్ణయించే ముందు మీ కుటుంబ పురోహితుని సంప్రదించండి.'
      : 'The grades are this engine’s own. Please confirm a muhurtham with your family purohit before fixing it.'}</Text>
  </View>;
}

function MuhurthamCard({ m, telugu }: { m: Muhurtham; telugu: boolean }) {
  const grade = GRADES[m.grade];
  const [y, mo, d] = m.date.split('-');
  return <Card style={styles.card}>
    <View style={styles.cardTop}>
      <Text style={styles.date}>{`${d}-${mo}-${y}`} · {telugu ? m.weekday_te : m.weekday_en}</Text>
      <Text style={[styles.grade, m.grade === 1 && styles.gradeBest]}>{telugu ? grade.te : grade.en}</Text>
    </View>
    <Text style={styles.time}>{clock(m.time)}{m.time.slice(0, 10) !== m.date ? (telugu ? ' (తెల్లవారుజాము)' : ' (before sunrise, next morning)') : ''}</Text>
    {telugu
      ? <Text style={styles.detail}>{m.text_te}</Text>
      : <Text style={styles.detail}>{m.lunar_month_en} {m.paksha} {m.tithi_en} · {m.nakshatra_en} nakshatra · {m.lagna_en} lagna</Text>}
  </Card>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.creamDeep }, shell: { alignItems: 'center' },
  frame: { width: '100%', maxWidth: 430, minHeight: '100%', backgroundColor: colors.cream, paddingBottom: 28 },
  back: { marginLeft: 16, marginTop: 48, width: 44, height: 44, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  backText: { color: colors.maroon, fontSize: 30, lineHeight: 34 },
  header: { margin: 16, marginTop: 12, borderRadius: 20, backgroundColor: colors.maroon, padding: 16 },
  eyebrow: { color: colors.gold, fontWeight: '800', fontSize: 11, textTransform: 'uppercase' },
  title: { color: colors.white, fontSize: 24, fontWeight: '800', marginTop: 4 },
  subtitle: { color: '#ffe7d8', fontSize: 12, lineHeight: 18, marginTop: 4 },
  content: { paddingHorizontal: 16, gap: 10 },
  formCard: { zIndex: 10, gap: 6 },
  label: { color: colors.muted, fontSize: 12, fontWeight: '700', marginTop: 4 },
  primary: { minHeight: 46, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  primaryHidden: { opacity: 0 }, primaryText: { color: colors.white, fontWeight: '800', fontSize: 14 },
  error: { color: colors.maroon, fontSize: 12 },
  results: { gap: 10 },
  count: { color: colors.orange, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  card: { gap: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  date: { color: colors.ink, fontSize: 15, fontWeight: '800', flexShrink: 1 },
  grade: { color: colors.maroon, fontSize: 11, fontWeight: '800', borderWidth: 1, borderColor: colors.line, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  gradeBest: { backgroundColor: colors.peach },
  time: { color: colors.maroon, fontSize: 20, fontWeight: '800' },
  detail: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  empty: { color: colors.ink, fontSize: 13, lineHeight: 19 },
  note: { color: colors.muted, fontSize: 11, lineHeight: 16 },
});
