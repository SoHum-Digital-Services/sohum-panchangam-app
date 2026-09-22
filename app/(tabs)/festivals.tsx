import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { CHERUVUGATTU, fetchPanchangamRange } from '../../src/api/client';
import type { PanchangamResponse } from '../../src/api/types';
import { Card } from '../../src/components/Card';
import { colors } from '../../src/theme';
import { monthBounds, MONTH_NAMES } from '../../src/monthGrid';

interface FestivalDay {
  date: string;
  name: string;
  tithi: string;
}

export default function FestivalsScreen() {
  const now = new Date();
  const [items, setItems] = useState<FestivalDay[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const { start, end } = monthBounds(now.getFullYear(), now.getMonth());
      const days: PanchangamResponse[] = await fetchPanchangamRange(start, end, CHERUVUGATTU);
      const festivalDays: FestivalDay[] = [];
      for (const day of days) {
        for (const name of day.festivals) {
          festivalDays.push({ date: day.date, name, tithi: day.tithi.name_en });
        }
      }
      setItems(festivalDays);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load festivals');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!items) load();
    }, [items, load]),
  );

  return (
    <View style={styles.screen}>
      <View style={styles.appFrame}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>SoHum పంచాంగం</Text>
          <Text style={styles.title}>పండుగలు</Text>
          <Text style={styles.subtitle}>{MONTH_NAMES[now.getMonth()]} {now.getFullYear()} · Cheruvugattu</Text>
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
                <Text style={styles.emptyText}>No named festivals in the reference data for this month.</Text>
              </Card>
            }
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.tithi}>{item.tithi}</Text>
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
  header: { margin: 16, marginTop: 56, borderRadius: 28, backgroundColor: colors.maroon, padding: 20, shadowColor: colors.maroon, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 4 },
  eyebrow: { color: colors.gold, fontWeight: '900', fontSize: 12, letterSpacing: 0.5 },
  title: { fontSize: 30, fontWeight: '900', color: colors.white, marginTop: 6 },
  subtitle: { color: '#ffe7d8', marginTop: 6, fontWeight: '700' },
  errorText: { color: colors.maroon, textAlign: 'center', padding: 16 },
  list: { padding: 16, paddingTop: 0, gap: 12, paddingBottom: 32 },
  card: { borderLeftWidth: 4, borderLeftColor: colors.saffron },
  date: { color: colors.muted, fontWeight: '700', fontSize: 12 },
  name: { color: colors.ink, fontSize: 18, fontWeight: '900', marginTop: 5 },
  tithi: { color: colors.maroon, marginTop: 5, fontWeight: '800' },
  emptyCard: { marginTop: 8, backgroundColor: colors.card },
  emptyText: { color: colors.muted, textAlign: 'center', lineHeight: 22 },
});
