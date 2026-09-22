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
        snapToInterval={312}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 48, paddingBottom: 14, backgroundColor: colors.cream },
  navButton: { width: 36, height: 36, borderRadius: 13, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center', shadowColor: colors.maroon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 2 },
  navButtonText: { color: colors.white, fontSize: 23, fontWeight: '800', lineHeight: 25 },
  monthTitleWrap: { alignItems: 'center' },
  monthTitle: { fontSize: 22, fontWeight: '800', color: colors.ink, letterSpacing: -0.2 },
  location: { color: colors.muted, fontSize: 11, marginTop: 3 },
  calendarCard: { marginHorizontal: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 22, padding: 9, shadowColor: '#5b2a10', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 1 },
  weekRow: { flexDirection: 'row', paddingHorizontal: 2, paddingTop: 3, paddingBottom: 7 },
  weekdayLabel: { flex: 1, textAlign: 'center', color: colors.muted, fontWeight: '800', fontSize: 11, letterSpacing: 0.2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 4 },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.grid, borderWidth: 2, borderColor: colors.card, borderRadius: 12 },
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
  cardRail: { paddingHorizontal: 16, gap: 10, paddingVertical: 6 },
  railCard: { width: 300, minHeight: 172 },
  summaryRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginVertical: 2, backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.line, padding: 14, shadowColor: '#5b2a10', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 1 },
  moonBadge: { width: 62, height: 62, borderRadius: 18, backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center' },
  moonIcon: { color: '#dfe3ea', fontSize: 38 },
  dateBlock: { flex: 1 },
  dateBlockDay: { color: colors.maroon, fontSize: 28, fontWeight: '800', letterSpacing: -0.4 },
  dateBlockMonth: { fontSize: 20 },
  dateBlockWeek: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  dateBlockDivider: { width: 56, height: 2, backgroundColor: colors.saffron, marginVertical: 6 },
  dateBlockTithi: { color: colors.orange, fontSize: 21, fontWeight: '800' },
  dateBlockMonthLine: { color: colors.ink, fontWeight: '700', fontSize: 13, marginTop: 1 },
  detailCard: { gap: 6, padding: 14 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panelTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  infoDot: { color: colors.muted, fontSize: 15 },
  detailLine: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 2 },
  detailLabel: { width: 82, color: colors.orange, fontSize: 12, fontWeight: '800' },
  detailValue: { flex: 1, color: colors.ink, fontSize: 13, lineHeight: 18, fontWeight: '500' },
  festivalCard: { backgroundColor: colors.peach, borderColor: '#ffd7b8' },
  festivalText: { color: colors.maroon, fontWeight: '700', fontSize: 13, marginTop: 7 },
  sankalpamCard: { borderLeftWidth: 4, borderLeftColor: colors.saffron },
  sankalpamText: { color: colors.ink, fontSize: 13, lineHeight: 20, marginTop: 7 },
});
