import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchFestivals, fetchPanchangamRange } from '../../src/api/client';
import type { FestivalItem, PanchangamResponse } from '../../src/api/types';
import { DayPanel } from '../../src/components/DayPanel';
import { colors } from '../../src/theme';
import { addDays, isoDate } from '../../src/format';
import { buildMonthGrid, monthBounds, MONTH_NAMES, WEEKDAY_LABELS } from '../../src/monthGrid';
import { calendarMarkers } from '../../src/panchangamUi';
import { usePanchangamSettings } from '../../src/settings';

const TODAY = isoDate(new Date());

export default function CalendarScreen() {
  const { city, language } = usePanchangamSettings();
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
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
        {focused && <StatusBar style="dark" />}
        <View style={[styles.navRow, { paddingTop: insets.top + 16 }]}>
          <Pressable accessibilityRole="button" accessibilityLabel={telugu ? 'మునుపటి నెల' : 'Previous month'} onPress={goPrevMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>‹</Text>
          </Pressable>
          <Text style={styles.monthTitle}>{MONTH_NAMES[month]} {year}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={telugu ? 'తదుపరి నెల' : 'Next month'} onPress={goNextMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>›</Text>
          </Pressable>
        </View>

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
                        accessibilityRole="button"
                        accessibilityLabel={cell.date}
                        accessibilityState={{ selected: isSelected }}
                        style={styles.cell}
                        onPress={() => setSelectedDate(cell.date!)}
                      >
                        <Text style={[styles.cellDay, isToday && styles.cellDayToday, isSelected && styles.cellDaySelected]}>
                          {cell.day}
                        </Text>
                        <View style={styles.markerRow}>
                          {markers.map((marker, index) => (
                            <Text key={`${marker}-${index}`} style={styles.marker}>{marker}</Text>
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
  screen: { flex: 1, backgroundColor: colors.white },
  shell: { alignItems: 'center', minHeight: '100%' },
  appFrame: { width: '100%', maxWidth: 430, minHeight: '100%', backgroundColor: colors.white },
  navRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 20 },
  navButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f15a06', alignItems: 'center', justifyContent: 'center' },
  navButtonText: { color: colors.white, fontSize: 32, lineHeight: 36 },
  monthTitle: { flex: 1, textAlign: 'center', color: '#141c26', fontSize: 22, fontWeight: '700' },
  calendarCard: { paddingHorizontal: 8, backgroundColor: colors.white },
  weekRow: { flexDirection: 'row', paddingHorizontal: 2, paddingTop: 4, paddingBottom: 14 },
  weekdayLabel: { flex: 1, textAlign: 'center', color: '#676767', fontWeight: '400', fontSize: 14 },
  grid: { gap: 4 },
  calendarRow: { flexDirection: 'row', gap: 4 },
  cell: { flex: 1, aspectRatio: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f3f3', borderRadius: 8 },
  cellDay: { fontSize: 17, color: '#141c26', fontWeight: '500', width: 30, height: 30, lineHeight: 24, textAlign: 'center', paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  cellDayToday: { color: colors.orange, fontWeight: '800' },
  cellDaySelected: { color: colors.white, backgroundColor: '#f15a06' },
  markerRow: { minHeight: 14, flexDirection: 'row', gap: 2, marginTop: 1 },
  marker: { color: '#f15a06', fontSize: 11 },
  errorText: { color: colors.maroon, textAlign: 'center', padding: 16 },
  details: { paddingTop: 40, paddingBottom: 24 },
});
