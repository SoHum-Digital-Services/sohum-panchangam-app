import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { CHERUVUGATTU, fetchPanchangamRange } from '../../src/api/client';
import type { PanchangamResponse } from '../../src/api/types';
import { Card } from '../../src/components/Card';
import { colors } from '../../src/theme';
import { formatDateParts, formatTime, isoDate } from '../../src/format';
import { buildMonthGrid, monthBounds, MONTH_NAMES, WEEKDAY_LABELS } from '../../src/monthGrid';
import { calendarMarkers, muhurtaLines, pakshaTe, primaryDayLines } from '../../src/panchangamUi';

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
      setSelectedDate((current) => (byDate[current] ? current : results.find((d) => d.date === TODAY)?.date ?? start));
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

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);
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
            <Text style={styles.location}>⌖ {CHERUVUGATTU.name_en}</Text>
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
              {grid.map((cell, i) => {
                if (!cell.date) return <View key={i} style={styles.cell} />;
                const dayData = days?.[cell.date];
                const markers = calendarMarkers(dayData);
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
                    <View style={styles.markerRow}>
                      {markers.map((marker, index) => (
                        <Text key={`${marker}-${index}`} style={[styles.marker, isSelected && styles.markerSelected]}>{marker}</Text>
                      ))}
                    </View>
                  </Pressable>
                );
              })}
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
        <Text style={styles.sectionTitle}>{parts.day} {parts.month}</Text>
        <Text style={styles.swipeHint}>Swipe details →</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={344}
        contentContainerStyle={styles.cardRail}
      >
        <View style={[styles.summaryRow, styles.railCard]}>
          <View style={styles.moonBadge}>
            <Text style={styles.moonIcon}>◐</Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={styles.dateBlockDay}>{parts.day}<Text style={styles.dateBlockMonth}> {parts.month}</Text></Text>
            <Text style={styles.dateBlockWeek}>{parts.weekday.toUpperCase()}</Text>
            <View style={styles.dateBlockDivider} />
            <Text style={styles.dateBlockTithi}>{day.tithi.index} {pakshaTe(day.tithi.paksha)}</Text>
            <Text style={styles.dateBlockMonthLine}>{day.lunar_month.name_te}</Text>
          </View>
        </View>

        <DetailCard title="పంచాంగం" lines={primaryDayLines(day)} style={styles.railCard} />
        <DetailCard title="Auspicious/Inauspicious" lines={muhurtaLines(day)} style={styles.railCard} />

        {day.festivals.length > 0 && (
          <Card style={[styles.festivalCard, styles.railCard]}>
            <Text style={styles.panelTitle}>పండుగలు</Text>
            {day.festivals.map((festival) => (
              <Text key={festival} style={styles.festivalText}>✦ {festival}</Text>
            ))}
          </Card>
        )}

        <Card style={[styles.sankalpamCard, styles.railCard]}>
          <Text style={styles.panelTitle}>Sankalpam</Text>
          <Text style={styles.sankalpamText}>{day.sankalpam}</Text>
        </Card>
      </ScrollView>
    </View>
  );
}

function DetailCard({ title, lines, style }: { title: string; lines: Array<{ label: string; value: string }>; style?: ViewStyle }) {
  return (
    <Card style={[styles.detailCard, style]}>
      <View style={styles.detailHeader}>
        <Text style={styles.panelTitle}>{title}</Text>
        <Text style={styles.infoDot}>ⓘ</Text>
      </View>
      {lines.map((line) => (
        <View key={line.label} style={styles.detailLine}>
          <Text style={styles.detailLabel}>{line.label}</Text>
          <Text style={styles.detailValue}>{line.value}</Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.creamDeep },
  shell: { alignItems: 'center', minHeight: '100%' },
  appFrame: { width: '100%', maxWidth: 430, minHeight: '100%', backgroundColor: colors.cream },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 58, paddingBottom: 18, backgroundColor: colors.cream },
  navButton: { width: 40, height: 40, borderRadius: 15, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center', shadowColor: colors.maroon, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.16, shadowRadius: 12, elevation: 3 },
  navButtonText: { color: colors.white, fontSize: 25, fontWeight: '900', lineHeight: 28 },
  monthTitleWrap: { alignItems: 'center' },
  monthTitle: { fontSize: 25, fontWeight: '900', color: colors.ink, letterSpacing: -0.4 },
  location: { color: colors.muted, fontSize: 12, marginTop: 4 },
  calendarCard: { marginHorizontal: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 28, padding: 10, shadowColor: '#5b2a10', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 2 },
  weekRow: { flexDirection: 'row', paddingHorizontal: 2, paddingTop: 4, paddingBottom: 8 },
  weekdayLabel: { flex: 1, textAlign: 'center', color: colors.muted, fontWeight: '900', fontSize: 12, letterSpacing: 0.3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 5 },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.grid, borderWidth: 2, borderColor: colors.card, borderRadius: 14 },
  cellSelected: { backgroundColor: colors.maroon },
  cellDay: { fontSize: 17, color: colors.ink, fontWeight: '800' },
  cellDayToday: { color: colors.orange, fontWeight: '900' },
  cellDaySelected: { color: colors.white },
  markerRow: { minHeight: 18, flexDirection: 'row', gap: 2, marginTop: 2 },
  marker: { color: colors.orange, fontSize: 12 },
  markerSelected: { color: colors.gold },
  errorText: { color: colors.maroon, textAlign: 'center', padding: 16 },
  details: { paddingVertical: 14, gap: 8, paddingBottom: 26 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 18 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  swipeHint: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  cardRail: { paddingHorizontal: 16, gap: 12, paddingVertical: 8 },
  railCard: { width: 332, minHeight: 218 },
  summaryRow: { flexDirection: 'row', gap: 14, alignItems: 'center', marginVertical: 2, backgroundColor: colors.card, borderRadius: 24, borderWidth: 1, borderColor: colors.line, padding: 16, shadowColor: '#5b2a10', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 18, elevation: 2 },
  moonBadge: { width: 82, height: 82, borderRadius: 22, backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center' },
  moonIcon: { color: '#dfe3ea', fontSize: 52 },
  dateBlock: { flex: 1 },
  dateBlockDay: { color: colors.maroon, fontSize: 34, fontWeight: '900', letterSpacing: -0.8 },
  dateBlockMonth: { fontSize: 24 },
  dateBlockWeek: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  dateBlockDivider: { width: 72, height: 2, backgroundColor: colors.saffron, marginVertical: 8 },
  dateBlockTithi: { color: colors.orange, fontSize: 24, fontWeight: '900' },
  dateBlockMonthLine: { color: colors.ink, fontWeight: '800', marginTop: 2 },
  detailCard: { gap: 8, padding: 18 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panelTitle: { color: colors.ink, fontSize: 19, fontWeight: '900' },
  infoDot: { color: colors.muted, fontSize: 18 },
  detailLine: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 3 },
  detailLabel: { width: 90, color: colors.orange, fontSize: 14, fontWeight: '900' },
  detailValue: { flex: 1, color: colors.ink, fontSize: 15, lineHeight: 22, fontWeight: '600' },
  festivalCard: { backgroundColor: colors.peach, borderColor: '#ffd7b8' },
  festivalText: { color: colors.maroon, fontWeight: '800', marginTop: 8 },
  sankalpamCard: { borderLeftWidth: 4, borderLeftColor: colors.saffron },
  sankalpamText: { color: colors.ink, fontSize: 14, lineHeight: 23, marginTop: 8 },
});
