import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
      if (!byDate[selectedDate]) setSelectedDate(results.find((d) => d.date === TODAY)?.date ?? start);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load calendar');
    }
  }, [selectedDate]);

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
      <View style={styles.summaryRow}>
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

      <DetailCard title="పంచాంగం" lines={primaryDayLines(day)} />
      <DetailCard title="Auspicious/Inauspicious" lines={muhurtaLines(day)} />

      {day.festivals.length > 0 && (
        <Card style={styles.festivalCard}>
          <Text style={styles.panelTitle}>పండుగలు</Text>
          {day.festivals.map((festival) => (
            <Text key={festival} style={styles.festivalText}>✦ {festival}</Text>
          ))}
        </Card>
      )}

      <Card style={styles.sankalpamCard}>
        <Text style={styles.panelTitle}>Sankalpam</Text>
        <Text style={styles.sankalpamText}>{day.sankalpam}</Text>
      </Card>
    </View>
  );
}

function DetailCard({ title, lines }: { title: string; lines: Array<{ label: string; value: string }> }) {
  return (
    <Card style={styles.detailCard}>
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
  screen: { flex: 1, backgroundColor: '#efe4d3' },
  shell: { alignItems: 'center', minHeight: '100%' },
  appFrame: { width: '100%', maxWidth: 430, minHeight: '100%', backgroundColor: colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 58, paddingBottom: 18, backgroundColor: colors.white },
  navButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center' },
  navButtonText: { color: colors.white, fontSize: 25, fontWeight: '900', lineHeight: 28 },
  monthTitleWrap: { alignItems: 'center' },
  monthTitle: { fontSize: 24, fontWeight: '900', color: colors.ink },
  location: { color: colors.muted, fontSize: 12, marginTop: 4 },
  calendarCard: { backgroundColor: colors.white, borderTopWidth: 1, borderColor: '#f0f0f0' },
  weekRow: { flexDirection: 'row', paddingHorizontal: 4, paddingTop: 12, paddingBottom: 8 },
  weekdayLabel: { flex: 1, textAlign: 'center', color: colors.muted, fontWeight: '800', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.grid, borderWidth: 1, borderColor: colors.white },
  cellSelected: { backgroundColor: colors.orange },
  cellDay: { fontSize: 18, color: colors.ink, fontWeight: '700' },
  cellDayToday: { color: colors.orange, fontWeight: '900' },
  cellDaySelected: { color: colors.white },
  markerRow: { minHeight: 18, flexDirection: 'row', gap: 2, marginTop: 2 },
  marker: { color: colors.orange, fontSize: 12 },
  markerSelected: { color: colors.white },
  errorText: { color: colors.maroon, textAlign: 'center', padding: 16 },
  details: { padding: 18, gap: 14, paddingBottom: 30 },
  summaryRow: { flexDirection: 'row', gap: 16, alignItems: 'center', marginVertical: 6 },
  moonBadge: { width: 90, height: 90, borderRadius: 15, backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center' },
  moonIcon: { color: '#dfe3ea', fontSize: 58 },
  dateBlock: { flex: 1 },
  dateBlockDay: { color: colors.orange, fontSize: 34, fontWeight: '900' },
  dateBlockMonth: { fontSize: 24 },
  dateBlockWeek: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  dateBlockDivider: { width: 80, height: 2, backgroundColor: colors.orange, marginVertical: 8 },
  dateBlockTithi: { color: colors.orange, fontSize: 24, fontWeight: '900' },
  dateBlockMonthLine: { color: colors.ink, fontWeight: '800', marginTop: 2 },
  detailCard: { gap: 8 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panelTitle: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  infoDot: { color: colors.ink, fontSize: 18 },
  detailLine: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  detailLabel: { width: 90, color: colors.orange, fontSize: 16, fontWeight: '900' },
  detailValue: { flex: 1, color: colors.ink, fontSize: 16, lineHeight: 23, fontWeight: '600' },
  festivalCard: { backgroundColor: colors.peach },
  festivalText: { color: colors.maroon, fontWeight: '800', marginTop: 8 },
  sankalpamCard: { borderLeftWidth: 4, borderLeftColor: colors.orange },
  sankalpamText: { color: colors.ink, fontSize: 14, lineHeight: 23, marginTop: 8 },
});
