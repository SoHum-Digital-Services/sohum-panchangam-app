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
            snapToInterval={344}
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
            snapToInterval={344}
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
  header: { backgroundColor: colors.cream, paddingTop: 46, paddingBottom: 10, paddingHorizontal: 16 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBadge: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', shadowColor: colors.maroon, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 3 },
  logoBadgeText: { color: colors.maroon, fontWeight: '900', fontSize: 18 },
  brandCopy: { flex: 1 },
  brand: { color: colors.ink, fontWeight: '900', fontSize: 20 },
  location: { color: colors.muted, marginTop: 4, fontWeight: '700', fontSize: 12 },
  settingsDot: { width: 36, height: 36, borderRadius: 13, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  settingsDotText: { color: colors.maroon },
  datePanel: { marginTop: 18, borderRadius: 28, padding: 15, backgroundColor: colors.maroon, overflow: 'hidden', shadowColor: colors.maroon, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 4 },
  panelGlow: { position: 'absolute', width: 160, height: 160, borderRadius: 80, right: -54, top: -72, backgroundColor: '#ffffff12' },
  dayNav: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  arrowButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#ffffff16', borderWidth: 1, borderColor: '#ffffff24', alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: colors.white, fontSize: 32, lineHeight: 34 },
  dayTitle: { flex: 1, alignItems: 'center' },
  vara: { color: colors.gold, fontWeight: '900', letterSpacing: 0.4 },
  date: { color: colors.white, fontSize: 21, fontWeight: '900', marginTop: 3, textAlign: 'center', lineHeight: 27 },
  monthLine: { color: '#ffe7d8', marginTop: 5, fontWeight: '700', textAlign: 'center' },
  dateStrip: { flexDirection: 'row', gap: 8, marginTop: 15 },
  datePill: { flex: 1, minHeight: 54, borderRadius: 17, borderWidth: 1, borderColor: '#ffffff21', backgroundColor: '#ffffff10', alignItems: 'center', justifyContent: 'center' },
  datePillActive: { backgroundColor: colors.card, borderColor: colors.card },
  datePillWeekday: { color: '#f5cfb5', fontWeight: '900', fontSize: 12 },
  datePillDay: { color: '#f5cfb5', fontWeight: '900', fontSize: 20, marginTop: 2 },
  datePillTextActive: { color: colors.maroon },
  content: { paddingVertical: 10, gap: 10, paddingBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 18, marginTop: 2 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  swipeHint: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  cardRail: { paddingHorizontal: 16, gap: 12, paddingVertical: 8 },
  railCard: { width: 332, minHeight: 214 },
  heroCard: { backgroundColor: colors.card, borderColor: colors.line, padding: 18 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroCopy: { flex: 1 },
  heroLabel: { color: colors.orange, fontWeight: '900', fontSize: 12, letterSpacing: 0.4 },
  heroValue: { color: colors.ink, fontSize: 31, fontWeight: '900', marginTop: 6, letterSpacing: -0.8 },
  heroSub: { color: colors.muted, marginTop: 4, fontWeight: '700' },
  heroSmall: { color: colors.maroon, marginTop: 11, fontWeight: '800' },
  heroMoon: { width: 78, height: 78, borderRadius: 24, backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center' },
  heroMoonText: { color: '#e8edf4', fontSize: 46 },
  sunGrid: { flexDirection: 'row', gap: 10, marginTop: 16 },
  sunChip: { flex: 1, borderRadius: 18, backgroundColor: colors.peach, paddingVertical: 12, paddingHorizontal: 12 },
  cardLabel: { color: colors.muted, fontWeight: '800', fontSize: 12 },
  compactValue: { color: colors.ink, fontSize: 18, fontWeight: '900', marginTop: 4 },
  moonDateRow: { flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: colors.card, borderRadius: 24, borderWidth: 1, borderColor: colors.line, padding: 16, shadowColor: '#5b2a10', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 18, elevation: 2 },
  moonBadge: { width: 80, height: 80, borderRadius: 22, backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center' },
  moonIcon: { color: '#dfe3ea', fontSize: 50 },
  dateBlock: { flex: 1 },
  dateBlockDay: { color: colors.maroon, fontSize: 34, fontWeight: '900', letterSpacing: -0.8 },
  dateBlockMonth: { fontSize: 24 },
  dateBlockWeek: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  dateBlockDivider: { width: 72, height: 2, backgroundColor: colors.saffron, marginVertical: 8 },
  dateBlockTithi: { color: colors.orange, fontSize: 25, fontWeight: '900' },
  dateBlockMonthLine: { color: colors.ink, fontWeight: '800', marginTop: 2 },
  detailPanel: { gap: 8, padding: 18 },
  panelTitle: { color: colors.ink, fontSize: 19, fontWeight: '900' },
  panelSubtitle: { color: colors.muted, fontWeight: '700', marginTop: -2, marginBottom: 5 },
  detailLine: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 3 },
  detailLabel: { width: 84, color: colors.orange, fontWeight: '900', fontSize: 14 },
  detailValue: { flex: 1, color: colors.ink, fontSize: 15, lineHeight: 22, fontWeight: '600' },
  festivalCard: { backgroundColor: colors.peach, borderColor: '#ffd7b8' },
  festivalText: { color: colors.maroon, fontWeight: '800', marginTop: 8 },
  sankalpamCard: { borderLeftWidth: 4, borderLeftColor: colors.saffron },
  sankalpamText: { color: colors.ink, fontSize: 14, lineHeight: 23, marginTop: 8 },
});
