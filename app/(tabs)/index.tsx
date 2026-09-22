import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { CHERUVUGATTU, fetchPanchangam } from '../../src/api/client';
import type { PanchangamResponse } from '../../src/api/types';
import { Card } from '../../src/components/Card';
import { colors } from '../../src/theme';
import { addDays, formatDateLong, formatDateParts, formatTime, isoDate } from '../../src/format';
import { muhurtaLines, pakshaTe, primaryDayLines, weekdayShort } from '../../src/panchangamUi';

const TODAY = isoDate(new Date());

export default function TodayScreen() {
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [cache, setCache] = useState<Record<string, PanchangamResponse>>({});
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const data = cache[selectedDate] ?? null;

  const load = useCallback(async (date: string, force = false) => {
    if (!force && cache[date]) return;
    try {
      setError(null);
      const result = await fetchPanchangam(date, CHERUVUGATTU);
      setCache((current) => ({ ...current, [date]: result }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load panchangam');
    } finally {
      setRefreshing(false);
    }
  }, [cache]);

  useFocusEffect(
    useCallback(() => {
      load(selectedDate);
    }, [load, selectedDate]),
  );

  const dateStrip = useMemo(() => [-2, -1, 0, 1, 2].map((offset) => addDays(selectedDate, offset)), [selectedDate]);

  const onRefresh = () => {
    setRefreshing(true);
    load(selectedDate, true);
  };

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.orange} size="large" />
      </View>
    );
  }

  const parts = formatDateParts(data.date);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.shell}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.orange} />}
    >
      <View style={styles.appFrame}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>ఓం</Text>
            </View>
            <View style={styles.brandCopy}>
              <Text style={styles.brand}>SoHum పంచాంగం</Text>
              <Text style={styles.location}>⌖ {CHERUVUGATTU.name_te}, {CHERUVUGATTU.name_en}</Text>
            </View>
            <View style={styles.settingsDot}>
              <Text style={styles.settingsDotText}>⚙</Text>
            </View>
          </View>

          <View style={styles.dayNav}>
            <Pressable onPress={() => setSelectedDate(addDays(selectedDate, -1))} style={styles.arrowButton}>
              <Text style={styles.arrowText}>‹</Text>
            </Pressable>
            <View style={styles.dayTitle}>
              <Text style={styles.vara}>{data.vara.name_te}</Text>
              <Text style={styles.date}>{formatDateLong(data.date)}</Text>
              <Text style={styles.monthLine}>{data.lunar_month.name_te} · {pakshaTe(data.tithi.paksha)} పక్షం</Text>
            </View>
            <Pressable onPress={() => setSelectedDate(addDays(selectedDate, 1))} style={styles.arrowButton}>
              <Text style={styles.arrowText}>›</Text>
            </Pressable>
          </View>

          <View style={styles.dateStrip}>
            {dateStrip.map((date) => {
              const itemParts = formatDateParts(date);
              const active = date === selectedDate;
              return (
                <Pressable key={date} onPress={() => setSelectedDate(date)} style={[styles.datePill, active && styles.datePillActive]}>
                  <Text style={[styles.datePillWeekday, active && styles.datePillTextActive]}>{weekdayShort(date)}</Text>
                  <Text style={[styles.datePillDay, active && styles.datePillTextActive]}>{itemParts.day}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.heroGrid}>
            <Card style={styles.heroCard}>
              <Text style={styles.heroLabel}>ఈరోజు తిథి</Text>
              <Text style={styles.heroValue}>{data.tithi.name_en}</Text>
              <Text style={styles.heroSub}>{data.tithi.name_te} · {data.tithi.paksha} Paksha</Text>
              <Text style={styles.heroSmall}>Ends {formatTime(data.tithi.ends_at)}</Text>
            </Card>
            <Card style={styles.sunCard}>
              <Text style={styles.cardLabel}>🌅 సూర్యోదయం</Text>
              <Text style={styles.compactValue}>{formatTime(data.sunrise)}</Text>
              <Text style={styles.cardLabel}>🌇 సూర్యాస్తమయం</Text>
              <Text style={styles.compactValue}>{formatTime(data.sunset)}</Text>
            </Card>
          </View>

          <View style={styles.moonDateRow}>
            <View style={styles.moonBadge}>
              <Text style={styles.moonIcon}>◐</Text>
            </View>
            <View style={styles.dateBlock}>
              <Text style={styles.dateBlockDay}>{parts.day}<Text style={styles.dateBlockMonth}> {parts.month}</Text></Text>
              <Text style={styles.dateBlockWeek}>{parts.weekday.toUpperCase()}</Text>
              <View style={styles.dateBlockDivider} />
              <Text style={styles.dateBlockTithi}>{data.tithi.index} {data.tithi.paksha === 'Shukla' ? 'శుక్ల' : 'బహుళ'}</Text>
              <Text style={styles.dateBlockMonthLine}>{data.lunar_month.name_te}</Text>
            </View>
          </View>

          <DetailPanel title="పంచాంగ సారాంశం" subtitle="Panchangam" lines={primaryDayLines(data)} />
          <DetailPanel title="ముఖ్య సమయాలు" subtitle="Muhurta" lines={muhurtaLines(data)} />

          {data.festivals.length > 0 && (
            <Card style={styles.festivalCard}>
              <Text style={styles.panelTitle}>ఈరోజు విశేషం</Text>
              {data.festivals.map((festival) => (
                <Text key={festival} style={styles.festivalText}>✦ {festival}</Text>
              ))}
            </Card>
          )}

          <Card style={styles.sankalpamCard}>
            <Text style={styles.panelTitle}>సంకల్పం</Text>
            <Text style={styles.sankalpamText}>{data.sankalpam}</Text>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}

function DetailPanel({ title, subtitle, lines }: { title: string; subtitle: string; lines: Array<{ label: string; value: string }> }) {
  return (
    <Card style={styles.detailPanel}>
      <Text style={styles.panelTitle}>{title}</Text>
      <Text style={styles.panelSubtitle}>{subtitle}</Text>
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
  appFrame: { width: '100%', maxWidth: 430, minHeight: '100%', backgroundColor: colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream, padding: 24 },
  errorText: { color: colors.maroon, textAlign: 'center' },
  header: { backgroundColor: colors.maroon, paddingTop: 54, paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 4, borderBottomColor: colors.saffron },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.saffron, alignItems: 'center', justifyContent: 'center' },
  logoBadgeText: { color: colors.maroon, fontWeight: '900', fontSize: 18 },
  brandCopy: { flex: 1 },
  brand: { color: colors.white, fontWeight: '900', fontSize: 20 },
  location: { color: '#ffe1ce', marginTop: 5, fontWeight: '700', fontSize: 13 },
  settingsDot: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: '#ffffff33', alignItems: 'center', justifyContent: 'center' },
  settingsDotText: { color: colors.white },
  dayNav: { flexDirection: 'row', alignItems: 'center', marginTop: 22, gap: 10 },
  arrowButton: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#ffffff18', borderWidth: 1, borderColor: '#ffffff2c', alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: colors.white, fontSize: 34, lineHeight: 36 },
  dayTitle: { flex: 1, alignItems: 'center' },
  vara: { color: '#ffe1ce', fontWeight: '900' },
  date: { color: colors.white, fontSize: 21, fontWeight: '900', marginTop: 2, textAlign: 'center' },
  monthLine: { color: '#ffe1ce', marginTop: 3, fontWeight: '700', textAlign: 'center' },
  dateStrip: { flexDirection: 'row', gap: 8, marginTop: 20 },
  datePill: { flex: 1, minHeight: 62, borderRadius: 12, borderWidth: 1, borderColor: '#ffffff2c', backgroundColor: '#ffffff14', alignItems: 'center', justifyContent: 'center' },
  datePillActive: { backgroundColor: '#fff5df', borderColor: '#fff5df' },
  datePillWeekday: { color: '#ffd9c2', fontWeight: '900', fontSize: 12 },
  datePillDay: { color: '#ffd9c2', fontWeight: '900', fontSize: 20, marginTop: 2 },
  datePillTextActive: { color: colors.maroon },
  content: { padding: 16, gap: 12, paddingBottom: 28 },
  heroGrid: { flexDirection: 'row', gap: 10 },
  heroCard: { flex: 1.25, backgroundColor: colors.maroonLight, borderColor: colors.maroonLight },
  sunCard: { flex: 0.95 },
  heroLabel: { color: '#ffe1ce', fontWeight: '900', fontSize: 12 },
  heroValue: { color: colors.white, fontSize: 30, fontWeight: '900', marginTop: 6 },
  heroSub: { color: '#ffe1ce', marginTop: 4 },
  heroSmall: { color: '#ffe1ce', marginTop: 12, fontWeight: '700' },
  cardLabel: { color: colors.muted, fontWeight: '800', fontSize: 12 },
  compactValue: { color: colors.ink, fontSize: 18, fontWeight: '900', marginTop: 4, marginBottom: 8 },
  moonDateRow: { flexDirection: 'row', gap: 14, alignItems: 'center', marginTop: 6 },
  moonBadge: { width: 86, height: 86, borderRadius: 16, backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center' },
  moonIcon: { color: '#dfe3ea', fontSize: 54 },
  dateBlock: { flex: 1 },
  dateBlockDay: { color: colors.orange, fontSize: 34, fontWeight: '900' },
  dateBlockMonth: { fontSize: 24 },
  dateBlockWeek: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  dateBlockDivider: { width: 80, height: 2, backgroundColor: colors.orange, marginVertical: 8 },
  dateBlockTithi: { color: colors.orange, fontSize: 25, fontWeight: '900' },
  dateBlockMonthLine: { color: colors.ink, fontWeight: '800', marginTop: 2 },
  detailPanel: { gap: 7 },
  panelTitle: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  panelSubtitle: { color: colors.muted, fontWeight: '700', marginTop: -3, marginBottom: 4 },
  detailLine: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  detailLabel: { width: 84, color: colors.orange, fontWeight: '900', fontSize: 15 },
  detailValue: { flex: 1, color: colors.ink, fontSize: 15, lineHeight: 22, fontWeight: '600' },
  festivalCard: { backgroundColor: colors.peach },
  festivalText: { color: colors.maroon, fontWeight: '800', marginTop: 8 },
  sankalpamCard: { borderLeftWidth: 4, borderLeftColor: colors.orange },
  sankalpamText: { color: colors.ink, fontSize: 14, lineHeight: 23, marginTop: 8 },
});
