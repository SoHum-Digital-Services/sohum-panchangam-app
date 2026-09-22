import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { CHERUVUGATTU, fetchPanchangamRange } from '../../src/api/client';
import type { PanchangamResponse } from '../../src/api/types';
import { Card } from '../../src/components/Card';
import { colors } from '../../src/theme';
import { formatTime, isoDate } from '../../src/format';
import { buildMonthGrid, monthBounds, MONTH_NAMES, WEEKDAY_LABELS } from '../../src/monthGrid';

const TODAY = isoDate(new Date());

export default function CalendarScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [days, setDays] = useState<Record<string, PanchangamResponse> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(TODAY);

  const load = useCallback(async (y: number, m: number) => {
    try {
      setError(null);
      setDays(null);
      const { start, end } = monthBounds(y, m);
      const results = await fetchPanchangamRange(start, end, CHERUVUGATTU);
      const byDate: Record<string, PanchangamResponse> = {};
      for (const d of results) byDate[d.date] = d;
      setDays(byDate);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load calendar');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(year, month);
    }, [year, month, load]),
  );

  const goPrevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); } else { setMonth((m) => m - 1); }
  };
  const goNextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); } else { setMonth((m) => m + 1); }
  };

  const grid = buildMonthGrid(year, month);
  const selected = days?.[selectedDate];

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={goPrevMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.monthTitle}>{MONTH_NAMES[month]} {year}</Text>
        <Pressable onPress={goNextMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map((label, i) => (
          <Text key={i} style={styles.weekdayLabel}>{label}</Text>
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {!days && !error ? (
        <ActivityIndicator color={colors.maroon} style={{ marginTop: 24 }} />
      ) : (
        <View style={styles.grid}>
          {grid.map((cell, i) => {
            if (!cell.date) return <View key={i} style={styles.cell} />;
            const dayData = days?.[cell.date];
            const hasFestival = (dayData?.festivals.length ?? 0) > 0;
            const isToday = cell.date === TODAY;
            const isSelected = cell.date === selectedDate;
            return (
              <Pressable
                key={i}
                style={[styles.cell, isSelected && styles.cellSelected]}
                onPress={() => setSelectedDate(cell.date!)}
              >
                <Text style={[styles.cellDay, isToday && styles.cellDayToday, isSelected && styles.cellDaySelected]}>
                  {cell.day}
                </Text>
                {hasFestival && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
              </Pressable>
            );
          })}
        </View>
      )}

      {selected && (
        <Card style={styles.detailCard}>
          <Text style={styles.detailDate}>{selectedDate} · {selected.vara.name_en}</Text>
          <Text style={styles.detailTithi}>{selected.tithi.name_en} · {selected.tithi.paksha} Paksha</Text>
          <Text style={styles.detailSub}>{selected.nakshatra.name_en} · ends {formatTime(selected.nakshatra.ends_at)}</Text>
          {selected.festivals.length > 0 && (
            <Text style={styles.detailFestival}>🪔 {selected.festivals.join(', ')}</Text>
          )}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 60 },
  navButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center' },
  navButtonText: { color: colors.white, fontSize: 20, fontWeight: '700' },
  monthTitle: { fontSize: 18, fontWeight: '700', color: colors.ink },
  weekRow: { flexDirection: 'row', paddingHorizontal: 16 },
  weekdayLabel: { flex: 1, textAlign: 'center', color: colors.muted, fontWeight: '700', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 4 },
  cellSelected: { backgroundColor: colors.maroon, borderRadius: 12 },
  cellDay: { fontSize: 15, color: colors.ink },
  cellDayToday: { color: colors.maroon, fontWeight: '800' },
  cellDaySelected: { color: colors.white, fontWeight: '800' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.saffron, marginTop: 2 },
  dotSelected: { backgroundColor: colors.white },
  errorText: { color: colors.maroon, textAlign: 'center', padding: 16 },
  detailCard: { margin: 16 },
  detailDate: { color: colors.muted, fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  detailTithi: { color: colors.ink, fontSize: 18, fontWeight: '700', marginTop: 6 },
  detailSub: { color: colors.muted, marginTop: 4 },
  detailFestival: { color: colors.maroon, fontWeight: '700', marginTop: 10 },
});
