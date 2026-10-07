import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { fetchFestivals, fetchPanchangamRange } from '../../src/api/client';
import type { FestivalItem, PanchangamResponse } from '../../src/api/types';
import { DayPanel } from '../../src/components/DayPanel';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { colors } from '../../src/theme';
import { addDays, isoDate } from '../../src/format';
import { buildMonthGrid, monthBounds, MONTH_NAMES, WEEKDAY_LABELS } from '../../src/monthGrid';
import { calendarMarkers } from '../../src/panchangamUi';
import { usePanchangamSettings } from '../../src/settings';

const TODAY = isoDate(new Date());

export default function CalendarScreen() {
  const { city, language } = usePanchangamSettings();
  const telugu = language === 'te';
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [days, setDays] = useState<Record<string, PanchangamResponse> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [upcoming, setUpcoming] = useState<FestivalItem[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(false);

  const load = useCallback(async (y: number, m: number) => {
    try {
      setError(null);
      setDays(null);
      const { start, end } = monthBounds(y, m);
      // Festivals load alongside the month (up to ~6 weeks past it, for the panel's upcoming list) but never block it.
      setUpcomingLoading(true);
      fetchFestivals(start, addDays(end, 45), city)
        .then(setUpcoming)
        .catch(() => setUpcoming([]))
        .finally(() => setUpcomingLoading(false));
      const results = await fetchPanchangamRange(start, end, city);
      const byDate: Record<string, PanchangamResponse> = {};
      for (const d of results) byDate[d.date] = d;
      setDays(byDate);
      setSelectedDate((current) => (byDate[current] ? current : results.find((d) => d.date === TODAY)?.date ?? start));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load calendar');
    }
  }, [city]);

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

  const weeks = useMemo(() => {
    const cells = buildMonthGrid(year, month);
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [year, month]);
  const selected = days?.[selectedDate];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.shell}>
      <View style={styles.appFrame}>
        <ScreenHeader
          eyebrow={telugu ? 'SoHum పంచాంగం' : 'SoHum Panchangam'}
          title={`${MONTH_NAMES[month]} ${year}`}
          subtitle={`⌖ ${telugu ? city.name_te : city.name_en}`}
        >
          <View style={styles.navRow}>
            <Pressable onPress={goPrevMonth} style={styles.navButton}>
              <Text style={styles.navButtonText}>‹</Text>
            </Pressable>
            <Pressable onPress={goNextMonth} style={styles.navButton}>
              <Text style={styles.navButtonText}>›</Text>
            </Pressable>
          </View>
        </ScreenHeader>

        <View style={styles.calendarCard}>
          <View style={styles.weekRow}>
            {WEEKDAY_LABELS.map((label, i) => (
              <Text key={i} style={styles.weekdayLabel}>{label}</Text>
            ))}
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {!days && !error ? (
            <ActivityIndicator color={colors.orange} style={{ marginTop: 24, marginBottom: 24 }} />
          ) : (
            <View style={styles.grid}>
              {weeks.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.calendarRow}>
                  {week.map((cell, dayIndex) => {
                    if (!cell.date) return <View key={dayIndex} style={styles.cell} />;
                    const dayData = days?.[cell.date];
                    const markers = calendarMarkers(dayData);
                    const isToday = cell.date === TODAY;
                    const isSelected = cell.date === selectedDate;
                    return (
                      <Pressable
                        key={cell.date}
                        style={[styles.cell, isSelected && styles.cellSelected]}
                        onPress={() => setSelectedDate(cell.date!)}
                      >
                        <Text style={[styles.cellDay, isToday && styles.cellDayToday, isSelected && styles.cellDaySelected]}>
                          {cell.day}
                        </Text>
                        <View style={styles.markerRow}>
                          {markers.map((marker, index) => (
                            <Text key={`${marker}-${index}`} style={[styles.marker, isSelected && styles.markerSelected]}>{marker}</Text>
                          ))}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          )}
        </View>

        {selected && (
          <View style={styles.details}>
            <DayPanel data={selected} language={language} cityLabel={telugu ? city.name_te : city.name_en} upcoming={upcoming} upcomingLoading={upcomingLoading} />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.creamDeep },
  shell: { alignItems: 'center', minHeight: '100%' },
  appFrame: { width: '100%', maxWidth: 430, minHeight: '100%', backgroundColor: colors.cream },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  navButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#ffffff16', borderWidth: 1, borderColor: '#ffffff24', alignItems: 'center', justifyContent: 'center' },
  navButtonText: { color: colors.white, fontSize: 23, fontWeight: '800', lineHeight: 25 },
  calendarCard: { marginHorizontal: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 22, padding: 9, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 1 },
  weekRow: { flexDirection: 'row', paddingHorizontal: 2, paddingTop: 3, paddingBottom: 7 },
  weekdayLabel: { flex: 1, textAlign: 'center', color: colors.muted, fontWeight: '800', fontSize: 11, letterSpacing: 0.2 },
  grid: { gap: 4 },
  calendarRow: { flexDirection: 'row', gap: 4 },
  cell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.grid, borderRadius: 12 },
  cellSelected: { backgroundColor: colors.maroon },
  cellDay: { fontSize: 15, color: colors.ink, fontWeight: '700' },
  cellDayToday: { color: colors.orange, fontWeight: '800' },
  cellDaySelected: { color: colors.white },
  markerRow: { minHeight: 14, flexDirection: 'row', gap: 2, marginTop: 1 },
  marker: { color: colors.orange, fontSize: 10 },
  markerSelected: { color: colors.gold },
  errorText: { color: colors.maroon, textAlign: 'center', padding: 16 },
  details: { paddingTop: 14, paddingBottom: 22 },
});
