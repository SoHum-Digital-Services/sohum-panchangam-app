import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { CHERUVUGATTU, fetchPanchangam } from '../../src/api/client';
import type { PanchangamResponse } from '../../src/api/types';
import { Card } from '../../src/components/Card';
import { colors } from '../../src/theme';
import { formatDateLong, formatTime, isoDate } from '../../src/format';

export default function TodayScreen() {
  const [data, setData] = useState<PanchangamResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchPanchangam(isoDate(new Date()), CHERUVUGATTU);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load panchangam');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!data) load();
    }, [data, load]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.maroon} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.maroon} />}
    >
      <View style={styles.header}>
        <Text style={styles.brand}>SoHum పంచాంగం</Text>
        <Text style={styles.location}>⌖ {CHERUVUGATTU.name_te}, {CHERUVUGATTU.name_en}</Text>
        <Text style={styles.vara}>{data.vara.name_te}</Text>
        <Text style={styles.date}>{formatDateLong(data.date)}</Text>
      </View>

      <View style={styles.content}>
        <Card style={styles.heroCard}>
          <Text style={styles.heroLabel}>ఈరోజు తిథి</Text>
          <Text style={styles.heroValue}>{data.tithi.name_en}</Text>
          <Text style={styles.heroSub}>{data.tithi.name_te} · {data.tithi.paksha} Paksha</Text>
          <Text style={styles.heroSmall}>Ends {formatTime(data.tithi.ends_at)}</Text>
        </Card>

        <View style={styles.row}>
          <Card style={styles.flexCard}>
            <Text style={styles.cardLabel}>🌅 సూర్యోదయం</Text>
            <Text style={styles.cardValue}>{formatTime(data.sunrise)}</Text>
            <Text style={styles.cardSmall}>Sunset {formatTime(data.sunset)}</Text>
          </Card>
          <Card style={styles.flexCard}>
            <Text style={styles.cardLabel}>చంద్రోదయం</Text>
            <Text style={styles.cardValue}>{formatTime(data.moonrise)}</Text>
            <Text style={styles.cardSmall}>Moonset {formatTime(data.moonset)} · {data.moon_rashi.name_en}</Text>
          </Card>
        </View>

        <Text style={styles.sectionEyebrow}>పంచాంగ సారాంశం</Text>
        <Text style={styles.sectionHeading}>Five limbs</Text>
        <View style={styles.limbGrid}>
          <LimbCard label="Vāra" value={data.vara.name_en} sub={data.vara.name_te} />
          <LimbCard label="Tithi" value={data.tithi.name_en} sub={data.tithi.name_te} note={`Ends ${formatTime(data.tithi.ends_at)}`} />
          <LimbCard label="Nakshatra" value={`${data.nakshatra.name_en} (pada ${data.nakshatra.pada})`} sub={data.nakshatra.name_te} note={`Ends ${formatTime(data.nakshatra.ends_at)}`} />
          <LimbCard label="Yoga" value={data.yoga.name_en} note={`Ends ${formatTime(data.yoga.ends_at)}`} />
          <LimbCard label="Karana" value={data.karana.name_en} note={`Ends ${formatTime(data.karana.ends_at)}`} />
        </View>

        <Text style={styles.sectionEyebrow}>ముఖ్య సమయాలు</Text>
        <Text style={styles.sectionHeading}>Muhurta windows</Text>
        <View style={styles.limbGrid}>
          <LimbCard label="Rahu Kalam" value={`${formatTime(data.muhurta.rahu_kalam.starts_at)} – ${formatTime(data.muhurta.rahu_kalam.ends_at)}`} />
          <LimbCard label="Yamagandam" value={`${formatTime(data.muhurta.yamagandam.starts_at)} – ${formatTime(data.muhurta.yamagandam.ends_at)}`} />
          <LimbCard label="Gulika Kalam" value={`${formatTime(data.muhurta.gulika_kalam.starts_at)} – ${formatTime(data.muhurta.gulika_kalam.ends_at)}`} />
          <LimbCard label="Abhijit" value={`${formatTime(data.muhurta.abhijit.starts_at)} – ${formatTime(data.muhurta.abhijit.ends_at)}`} />
          <LimbCard label="Brahma Muhurtam" value={`${formatTime(data.muhurta.brahma_muhurtam.starts_at)} – ${formatTime(data.muhurta.brahma_muhurtam.ends_at)}`} />
          <LimbCard label="Pratah Sandhya" value={`${formatTime(data.muhurta.pratah_sandhya.starts_at)} – ${formatTime(data.muhurta.pratah_sandhya.ends_at)}`} />
          <LimbCard label="Madhyahna Sandhya" value={`${formatTime(data.muhurta.madhyahna_sandhya.starts_at)} – ${formatTime(data.muhurta.madhyahna_sandhya.ends_at)}`} />
          <LimbCard label="Sayam Sandhya" value={`${formatTime(data.muhurta.sayam_sandhya.starts_at)} – ${formatTime(data.muhurta.sayam_sandhya.ends_at)}`} />
          <LimbCard label="Pradosha Kalam" value={`${formatTime(data.muhurta.pradosha_kalam.starts_at)} – ${formatTime(data.muhurta.pradosha_kalam.ends_at)}`} />
        </View>
        {data.varjyam.length > 0 && (
          <Text style={styles.footnote}>
            Varjyam: {data.varjyam
              .map((v) => `${formatTime(v.starts_at)}–${formatTime(v.ends_at)}${v.nakshatra ? ` (${v.nakshatra})` : ''}`)
              .join(', ')}
          </Text>
        )}

        <Text style={styles.sectionEyebrow}>పంచాంగ వివరాలు</Text>
        <Text style={styles.sectionHeading}>Samvatsara, Ritu &amp; Ayana</Text>
        <View style={styles.limbGrid}>
          <LimbCard label="Samvatsara" value={data.samvatsara.name_en} sub={data.samvatsara.name_te} />
          <LimbCard label="Ritu" value={data.ritu.name_en} sub={data.ritu.name_te} />
          <LimbCard label="Ayana" value={data.ayana.name_en} sub={data.ayana.name_te} />
        </View>

        <Text style={styles.sectionEyebrow}>సంకల్పం</Text>
        <Text style={styles.sectionHeading}>Sankalpam</Text>
        <Card>
          <Text style={styles.sankalpamText}>{data.sankalpam}</Text>
        </Card>
      </View>
    </ScrollView>
  );
}

function LimbCard({ label, value, sub, note }: { label: string; value: string; sub?: string; note?: string }) {
  return (
    <Card style={styles.limbCard}>
      <Text style={styles.limbLabel}>{label}</Text>
      <Text style={styles.limbValue}>{value}</Text>
      {sub ? <Text style={styles.limbSub}>{sub}</Text> : null}
      {note ? <Text style={styles.limbNote}>{note}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream, padding: 24 },
  errorText: { color: colors.maroon, textAlign: 'center' },
  header: { backgroundColor: colors.maroon, paddingTop: 60, paddingBottom: 24, paddingHorizontal: 18 },
  brand: { color: colors.white, fontWeight: '800', fontSize: 18 },
  location: { color: '#ffe1ce', marginTop: 6, fontWeight: '700' },
  vara: { color: '#ffe1ce', textAlign: 'center', marginTop: 16, fontWeight: '800' },
  date: { color: colors.white, textAlign: 'center', fontSize: 22, fontWeight: '700', marginTop: 2 },
  content: { padding: 16, gap: 12 },
  heroCard: { backgroundColor: colors.maroonLight, borderColor: colors.maroonLight },
  heroLabel: { color: '#ffe1ce', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  heroValue: { color: colors.white, fontSize: 28, fontWeight: '700', marginTop: 6 },
  heroSub: { color: '#ffe1ce', marginTop: 4 },
  heroSmall: { color: '#ffe1ce', marginTop: 8, fontSize: 12 },
  row: { flexDirection: 'row', gap: 12 },
  flexCard: { flex: 1 },
  cardLabel: { color: colors.muted, fontWeight: '700', fontSize: 12 },
  cardValue: { color: colors.ink, fontSize: 22, fontWeight: '700', marginTop: 6 },
  cardSmall: { color: colors.muted, marginTop: 4, fontSize: 12 },
  sectionEyebrow: { color: colors.maroon, fontWeight: '800', fontSize: 12, textTransform: 'uppercase', marginTop: 8 },
  sectionHeading: { color: colors.ink, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  limbGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  limbCard: { width: '47%' },
  limbLabel: { color: colors.muted, fontWeight: '800', fontSize: 11, textTransform: 'uppercase' },
  limbValue: { color: colors.ink, fontSize: 16, fontWeight: '700', marginTop: 6 },
  limbSub: { color: colors.muted, marginTop: 4 },
  limbNote: { color: colors.maroon, fontWeight: '700', marginTop: 8, fontSize: 12 },
  footnote: { color: colors.muted, fontSize: 12, marginTop: 4 },
  sankalpamText: { color: colors.ink, fontSize: 14, lineHeight: 22 },
});
