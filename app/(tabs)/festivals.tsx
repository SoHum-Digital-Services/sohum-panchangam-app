import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { fetchPanchangamRange } from '../../src/api/client';
import type { PanchangamResponse } from '../../src/api/types';
import { Card } from '../../src/components/Card';
import { colors } from '../../src/theme';
import { monthBounds, MONTH_NAMES } from '../../src/monthGrid';
import { usePanchangamSettings } from '../../src/settings';

interface FestivalDay {
  date: string;
  name: string;
  tithi_en: string;
  tithi_te: string;
}

export default function FestivalsScreen() {
  const { city, language } = usePanchangamSettings();
  const telugu = language === 'te';
  const now = new Date();
  const [items, setItems] = useState<FestivalDay[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const { start, end } = monthBounds(now.getFullYear(), now.getMonth());
      const days: PanchangamResponse[] = await fetchPanchangamRange(start, end, city);
      const festivalDays: FestivalDay[] = [];
      for (const day of days) {
        for (const name of day.festivals) {
          festivalDays.push({ date: day.date, name, tithi_en: day.tithi.name_en, tithi_te: day.tithi.name_te });
        }
      }
      setItems(festivalDays);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load festivals');
    }
  }, [city]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={styles.screen}>
      <View style={styles.appFrame}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{telugu ? 'SoHum పంచాంగం' : 'SoHum Panchangam'}</Text>
          <Text style={styles.title}>{telugu ? 'పండుగలు' : 'Festivals'}</Text>
          <Text style={styles.subtitle}>{MONTH_NAMES[now.getMonth()]} {now.getFullYear()} · {telugu ? city.name_te : city.name_en}</Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {!items && !error ? (
          <ActivityIndicator color={colors.maroon} style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            data={items ?? []}
            keyExtractor={(item, i) => `${item.date}-${i}`}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>{telugu ? 'ఈ నెలకు రిఫరెన్స్ డేటాలో పేరున్న పండుగలు లేవు.' : 'No named festivals in the reference data for this month.'}</Text>
              </Card>
            }
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.tithi}>{telugu ? item.tithi_te : item.tithi_en}</Text>
              </Card>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', backgroundColor: colors.creamDeep },
  appFrame: { width: '100%', maxWidth: 430, flex: 1, backgroundColor: colors.cream },
  header: { margin: 16, marginTop: 48, borderRadius: 24, backgroundColor: colors.maroon, padding: 16, shadowColor: colors.maroon, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 16, elevation: 3 },
  eyebrow: { color: colors.gold, fontWeight: '800', fontSize: 11, letterSpacing: 0.4 },
  title: { fontSize: 26, fontWeight: '800', color: colors.white, marginTop: 5 },
  subtitle: { color: '#ffe7d8', marginTop: 5, fontWeight: '600', fontSize: 13 },
  errorText: { color: colors.maroon, textAlign: 'center', padding: 16 },
  list: { padding: 16, paddingTop: 0, gap: 10, paddingBottom: 28 },
  card: { borderLeftWidth: 4, borderLeftColor: colors.saffron },
  date: { color: colors.muted, fontWeight: '600', fontSize: 11 },
  name: { color: colors.ink, fontSize: 16, fontWeight: '800', marginTop: 4 },
  tithi: { color: colors.maroon, marginTop: 4, fontWeight: '700', fontSize: 13 },
  emptyCard: { marginTop: 8, backgroundColor: colors.card },
  emptyText: { color: colors.muted, textAlign: 'center', fontSize: 13, lineHeight: 20 },
});
