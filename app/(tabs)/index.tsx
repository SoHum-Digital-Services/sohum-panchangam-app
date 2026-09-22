import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
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

          <View style={styles.datePanel}>
            <View style={styles.panelGlow} />
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
        </View>

        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today</Text>
            <Text style={styles.swipeHint}>Swipe cards →</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={312}
            contentContainerStyle={styles.cardRail}
          >
            <Card style={[styles.heroCard, styles.railCard]}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroCopy}>
                  <Text style={styles.heroLabel}>ఈరోజు తిథి</Text>
                  <Text style={styles.heroValue}>{data.tithi.name_en}</Text>
                  <Text style={styles.heroSub}>{data.tithi.name_te} · {data.tithi.paksha} Paksha</Text>
                  <Text style={styles.heroSmall}>Ends {formatTime(data.tithi.ends_at)}</Text>
                </View>
                <View style={styles.heroMoon}>
                  <Text style={styles.heroMoonText}>◐</Text>
                </View>
              </View>
              <View style={styles.sunGrid}>
                <View style={styles.sunChip}>
                  <Text style={styles.cardLabel}>🌅 సూర్యోదయం</Text>
                  <Text style={styles.compactValue}>{formatTime(data.sunrise)}</Text>
                </View>
                <View style={styles.sunChip}>
                  <Text style={styles.cardLabel}>🌇 సూర్యాస్తమయం</Text>
                  <Text style={styles.compactValue}>{formatTime(data.sunset)}</Text>
                </View>
              </View>
            </Card>

            <View style={[styles.moonDateRow, styles.railCard]}>
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

            {data.festivals.length > 0 && (
              <Card style={[styles.festivalCard, styles.railCard]}>
                <Text style={styles.panelTitle}>ఈరోజు విశేషం</Text>
                {data.festivals.map((festival) => (
                  <Text key={festival} style={styles.festivalText}>✦ {festival}</Text>
                ))}
              </Card>
            )}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Details</Text>
            <Text style={styles.swipeHint}>పంచాంగం • ముహూర్తం • సంకల్పం</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={312}
            contentContainerStyle={styles.cardRail}
          >
            <DetailPanel title="పంచాంగ సారాంశం" subtitle="Panchangam" lines={primaryDayLines(data)} style={styles.railCard} />
            <DetailPanel title="ముఖ్య సమయాలు" subtitle="Muhurta" lines={muhurtaLines(data)} style={styles.railCard} />
            <Card style={[styles.sankalpamCard, styles.railCard]}>
              <Text style={styles.panelTitle}>సంకల్పం</Text>
              <Text style={styles.sankalpamText}>{data.sankalpam}</Text>
            </Card>
          </ScrollView>
        </View>
      </View>
    </ScrollView>
  );
}

function DetailPanel({ title, subtitle, lines, style }: { title: string; subtitle: string; lines: Array<{ label: string; value: string }>; style?: ViewStyle }) {
  return (
    <Card style={[styles.detailPanel, style]}>
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
  screen: { flex: 1, backgroundColor: colors.creamDeep },
  shell: { alignItems: 'center', minHeight: '100%' },
  appFrame: { width: '100%', maxWidth: 430, minHeight: '100%', backgroundColor: colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream, padding: 24 },
  errorText: { color: colors.maroon, textAlign: 'center' },
  header: { backgroundColor: colors.cream, paddingTop: 42, paddingBottom: 8, paddingHorizontal: 16 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', shadowColor: colors.maroon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 2 },
  logoBadgeText: { color: colors.maroon, fontWeight: '800', fontSize: 17 },
  brandCopy: { flex: 1 },
  brand: { color: colors.ink, fontWeight: '800', fontSize: 19 },
  location: { color: colors.muted, marginTop: 3, fontWeight: '600', fontSize: 11 },
  settingsDot: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  settingsDotText: { color: colors.maroon },
  datePanel: { marginTop: 14, borderRadius: 24, padding: 13, backgroundColor: colors.maroon, overflow: 'hidden', shadowColor: colors.maroon, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 16, elevation: 3 },
  panelGlow: { position: 'absolute', width: 160, height: 160, borderRadius: 80, right: -54, top: -72, backgroundColor: '#ffffff12' },
  dayNav: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  arrowButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#ffffff16', borderWidth: 1, borderColor: '#ffffff24', alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: colors.white, fontSize: 28, lineHeight: 30 },
  dayTitle: { flex: 1, alignItems: 'center' },
  vara: { color: colors.gold, fontWeight: '800', fontSize: 13, letterSpacing: 0.3 },
  date: { color: colors.white, fontSize: 19, fontWeight: '800', marginTop: 2, textAlign: 'center', lineHeight: 24 },
  monthLine: { color: '#ffe7d8', marginTop: 4, fontWeight: '600', fontSize: 12, textAlign: 'center' },
  dateStrip: { flexDirection: 'row', gap: 7, marginTop: 13 },
  datePill: { flex: 1, minHeight: 48, borderRadius: 15, borderWidth: 1, borderColor: '#ffffff21', backgroundColor: '#ffffff10', alignItems: 'center', justifyContent: 'center' },
  datePillActive: { backgroundColor: colors.card, borderColor: colors.card },
  datePillWeekday: { color: '#f5cfb5', fontWeight: '800', fontSize: 11 },
  datePillDay: { color: '#f5cfb5', fontWeight: '800', fontSize: 18, marginTop: 1 },
  datePillTextActive: { color: colors.maroon },
  content: { paddingVertical: 8, gap: 8, paddingBottom: 22 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 18, marginTop: 2 },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  swipeHint: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  cardRail: { paddingHorizontal: 16, gap: 10, paddingVertical: 6 },
  railCard: { width: 300, minHeight: 172 },
  heroCard: { backgroundColor: colors.card, borderColor: colors.line, padding: 14 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroCopy: { flex: 1 },
  heroLabel: { color: colors.orange, fontWeight: '800', fontSize: 11, letterSpacing: 0.3 },
  heroValue: { color: colors.ink, fontSize: 26, fontWeight: '800', marginTop: 4, letterSpacing: -0.4 },
  heroSub: { color: colors.muted, marginTop: 3, fontWeight: '600', fontSize: 13 },
  heroSmall: { color: colors.maroon, marginTop: 8, fontWeight: '700', fontSize: 13 },
  heroMoon: { width: 58, height: 58, borderRadius: 18, backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center' },
  heroMoonText: { color: '#e8edf4', fontSize: 34 },
  sunGrid: { flexDirection: 'row', gap: 8, marginTop: 12 },
  sunChip: { flex: 1, borderRadius: 14, backgroundColor: colors.peach, paddingVertical: 9, paddingHorizontal: 10 },
  cardLabel: { color: colors.muted, fontWeight: '700', fontSize: 11 },
  compactValue: { color: colors.ink, fontSize: 16, fontWeight: '800', marginTop: 3 },
  moonDateRow: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.line, padding: 14, shadowColor: '#5b2a10', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 1 },
  moonBadge: { width: 62, height: 62, borderRadius: 18, backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center' },
  moonIcon: { color: '#dfe3ea', fontSize: 38 },
  dateBlock: { flex: 1 },
  dateBlockDay: { color: colors.maroon, fontSize: 28, fontWeight: '800', letterSpacing: -0.4 },
  dateBlockMonth: { fontSize: 20 },
  dateBlockWeek: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  dateBlockDivider: { width: 56, height: 2, backgroundColor: colors.saffron, marginVertical: 6 },
  dateBlockTithi: { color: colors.orange, fontSize: 21, fontWeight: '800' },
  dateBlockMonthLine: { color: colors.ink, fontWeight: '700', fontSize: 13, marginTop: 1 },
  detailPanel: { gap: 6, padding: 14 },
  panelTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  panelSubtitle: { color: colors.muted, fontWeight: '600', fontSize: 12, marginTop: -2, marginBottom: 3 },
  detailLine: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingVertical: 2 },
  detailLabel: { width: 78, color: colors.orange, fontWeight: '800', fontSize: 12 },
  detailValue: { flex: 1, color: colors.ink, fontSize: 13, lineHeight: 18, fontWeight: '500' },
  festivalCard: { backgroundColor: colors.peach, borderColor: '#ffd7b8' },
  festivalText: { color: colors.maroon, fontWeight: '700', fontSize: 13, marginTop: 7 },
  sankalpamCard: { borderLeftWidth: 4, borderLeftColor: colors.saffron },
  sankalpamText: { color: colors.ink, fontSize: 13, lineHeight: 20, marginTop: 7 },
});
