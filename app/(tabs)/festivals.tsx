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
      <View style={styles.header}>
        <Text style={styles.title}>పండుగలు</Text>
        <Text style={styles.subtitle}>{MONTH_NAMES[now.getMonth()]} {now.getFullYear()}</Text>
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
            <Text style={styles.emptyText}>No named festivals in the reference data for this month.</Text>
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
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  header: { padding: 16, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '700', color: colors.ink },
  subtitle: { color: colors.muted, marginTop: 4 },
  errorText: { color: colors.maroon, textAlign: 'center', padding: 16 },
  list: { padding: 16, gap: 10 },
  card: {},
  date: { color: colors.muted, fontWeight: '700', fontSize: 12 },
  name: { color: colors.ink, fontSize: 18, fontWeight: '700', marginTop: 4 },
  tithi: { color: colors.maroon, marginTop: 4 },
  emptyText: { color: colors.muted, textAlign: 'center', marginTop: 40 },
});
