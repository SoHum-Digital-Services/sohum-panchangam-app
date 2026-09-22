import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { fetchPanchangamRange } from '../../src/api/client';
import type { PanchangamResponse } from '../../src/api/types';
import { Card } from '../../src/components/Card';
import { colors } from '../../src/theme';
import { formatDateParts, formatTime, isoDate } from '../../src/format';
import { buildMonthGrid, monthBounds, MONTH_NAMES, WEEKDAY_LABELS } from '../../src/monthGrid';
import { calendarMarkers, muhurtaLines, pakshaTe, primaryDayLines } from '../../src/panchangamUi';
import { usePanchangamSettings } from '../../src/settings';
import { railStyles, RAIL_SNAP_INTERVAL } from '../../src/rail';

const TODAY = isoDate(new Date());

export default function CalendarScreen() {
  const { city } = usePanchangamSettings();
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
        <View style={styles.header}>
          <Pressable onPress={goPrevMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>‹</Text>
          </Pressable>
          <View style={styles.monthTitleWrap}>
            <Text style={styles.monthTitle}>{MONTH_NAMES[month]} {year}</Text>
            <Text style={styles.location}>⌖ {city.name_en}</Text>
          </View>
          <Pressable onPress={goNextMonth} style={styles.navButton}>
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

        {selected && <SelectedDayDetails day={selected} />}
      </View>
    </ScrollView>
  );
}

function SelectedDayDetails({ day }: { day: PanchangamResponse }) {
  const parts = formatDateParts(day.date);
  return (
    <View style={styles.details}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{parts.day} {parts.month} · {day.tithi.name_te}</Text>
        <Text style={styles.swipeHint}>Swipe details →</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={RAIL_SNAP_INTERVAL}
        contentContainerStyle={railStyles.cardRail}
      >
        <DetailCard title="పంచాంగం" lines={primaryDayLines(day)} style={railStyles.railCard} />
        <DetailCard title="Auspicious/Inauspicious" lines={muhurtaLines(day)} style={railStyles.railCard} />

        {day.festivals.length > 0 && (
          <Card style={[railStyles.festivalCard, railStyles.railCard]}>
            <Text style={railStyles.panelTitle}>పండుగలు</Text>
            {day.festivals.map((festival) => (
              <Text key={festival} style={railStyles.festivalText}>✦ {festival}</Text>
            ))}
          </Card>
        )}

        <Card style={[railStyles.sankalpamCard, railStyles.railCard]}>
          <Text style={railStyles.panelTitle}>Sankalpam</Text>
          <Text style={railStyles.sankalpamText}>{day.sankalpam}</Text>
        </Card>
      </ScrollView>
    </View>
  );
}

function DetailCard({ title, lines, style }: { title: string; lines: Array<{ label: string; value: string }>; style?: ViewStyle }) {
  return (
    <Card style={[styles.detailCard, style]}>
      <View style={styles.detailHeader}>
        <Text style={railStyles.panelTitle}>{title}</Text>
        <Text style={styles.infoDot}>ⓘ</Text>
      </View>
      {lines.map((line) => (
        <View key={line.label} style={railStyles.detailLine}>
          <Text style={railStyles.detailLabel}>{line.label}</Text>
          <Text style={railStyles.detailValue}>{line.value}</Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.creamDeep },
  shell: { alignItems: 'center', minHeight: '100%' },
  appFrame: { width: '100%', maxWidth: 430, minHeight: '100%', backgroundColor: colors.cream },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 48, paddingBottom: 14, backgroundColor: colors.cream },
  navButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center', shadowColor: colors.maroon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 2 },
  navButtonText: { color: colors.white, fontSize: 23, fontWeight: '800', lineHeight: 25 },
  monthTitleWrap: { alignItems: 'center' },
  monthTitle: { fontSize: 22, fontWeight: '800', color: colors.ink, letterSpacing: -0.2 },
  location: { color: colors.muted, fontSize: 11, marginTop: 3 },
  calendarCard: { marginHorizontal: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 22, padding: 9, shadowColor: '#5b2a10', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 1 },
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
  details: { paddingVertical: 10, gap: 7, paddingBottom: 22 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 18 },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  swipeHint: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  detailCard: { gap: 6, padding: 14 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoDot: { color: colors.muted, fontSize: 15 },
});
