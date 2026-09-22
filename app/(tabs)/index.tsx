import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { fetchPanchangam } from '../../src/api/client';
import type { PanchangamResponse } from '../../src/api/types';
import { Card } from '../../src/components/Card';
import { colors } from '../../src/theme';
import { addDays, formatDateLong, formatDateParts, formatTime, isoDate } from '../../src/format';
import { muhurtaLines, pakshaTe, primaryDayLines, weekdayShort } from '../../src/panchangamUi';
import { PANCHANGAM_CITIES, usePanchangamSettings } from '../../src/settings';

const TODAY = isoDate(new Date());
const RAIL_CARD_WIDTH = 312;
const RAIL_GAP = 12;
const RAIL_SNAP_INTERVAL = RAIL_CARD_WIDTH + RAIL_GAP;

export default function TodayScreen() {
  const { city, setCity } = usePanchangamSettings();
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [cache, setCache] = useState<Record<string, PanchangamResponse>>({});
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const data = cache[selectedDate] ?? null;

  useEffect(() => {
    setCache({});
  }, [city.slug]);

  const load = useCallback(async (date: string, force = false) => {
    if (!force && cache[date]) return;
    try {
      setError(null);
      const result = await fetchPanchangam(date, city);
      setCache((current) => ({ ...current, [date]: result }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load panchangam');
    } finally {
      setRefreshing(false);
    }
  }, [cache, city]);

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
              <Text style={styles.location}>⌖ {city.name_te}, {city.name_en}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              hitSlop={10}
              onPress={() => setSettingsOpen(true)}
              style={({ pressed }) => [styles.settingsDot, pressed && styles.pressedControl]}
            >
              <Text style={styles.settingsDotText}>⚙</Text>
            </Pressable>
          </View>

          <View style={styles.datePanel}>
            <View style={styles.dayNav}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous day"
              hitSlop={8}
              onPress={() => setSelectedDate(addDays(data.date, -1))}
              style={({ pressed }) => [styles.arrowButton, pressed && styles.arrowButtonPressed]}
            >
              <Text style={styles.arrowText}>‹</Text>
            </Pressable>
              <View style={styles.dayTitle}>
                <Text style={styles.vara}>{data.vara.name_te}</Text>
                <Text style={styles.date}>{formatDateLong(data.date)}</Text>
                <Text style={styles.monthLine}>{data.lunar_month.name_te} · {pakshaTe(data.tithi.paksha)} పక్షం</Text>
              </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next day"
              hitSlop={8}
              onPress={() => {
                const nextDate = addDays(data.date, 1);
                setSelectedDate(nextDate);
              }}
              style={({ pressed }) => [styles.arrowButton, pressed && styles.arrowButtonPressed]}
            >
              <Text style={styles.arrowText}>›</Text>
            </Pressable>
            </View>

            <View style={styles.dateStrip}>
              {dateStrip.map((date) => {
                const itemParts = formatDateParts(date);
                const active = date === selectedDate;
                return (
                  <Pressable
                    key={date}
                    hitSlop={6}
                    onPress={() => setSelectedDate(date)}
                    style={({ pressed }) => [styles.datePill, active && styles.datePillActive, pressed && styles.pressedControl]}
                  >
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
            snapToInterval={RAIL_SNAP_INTERVAL}
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
            snapToInterval={RAIL_SNAP_INTERVAL}
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
      <SettingsModal
        citySlug={city.slug}
        onClose={() => setSettingsOpen(false)}
        onSelectCity={(slug) => {
          const nextCity = PANCHANGAM_CITIES.find((candidate) => candidate.slug === slug);
          if (nextCity) setCity(nextCity);
          setSettingsOpen(false);
        }}
        visible={settingsOpen}
      />
    </ScrollView>
  );
}

function SettingsModal({ citySlug, onClose, onSelectCity, visible }: { citySlug: string; onClose: () => void; onSelectCity: (slug: string) => void; visible: boolean }) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.settingsSheet}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetEyebrow}>Panchangam settings</Text>
              <Text style={styles.sheetTitle}>స్థానం & పద్ధతి</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Close settings" hitSlop={8} onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>
          <Text style={styles.settingLabel}>Calculation location</Text>
          {PANCHANGAM_CITIES.map((candidate) => {
            const selected = candidate.slug === citySlug;
            return (
              <Pressable key={candidate.slug} accessibilityRole="button" onPress={() => onSelectCity(candidate.slug)} style={({ pressed }) => [styles.cityOption, selected && styles.cityOptionSelected, pressed && styles.pressedControl]}>
                <View>
                  <Text style={[styles.cityName, selected && styles.cityNameSelected]}>{candidate.name_te}</Text>
                  <Text style={[styles.cityMeta, selected && styles.cityMetaSelected]}>{candidate.name_en}</Text>
                </View>
                <Text style={styles.cityCheck}>{selected ? '✓' : ''}</Text>
              </Pressable>
            );
          })}
          <View style={styles.methodNote}>
            <Text style={styles.methodTitle}>Calculation profile</Text>
            <Text style={styles.methodText}>Drik Panchangam · Lahiri ayanamsha · sunrise-based Vedic day</Text>
          </View>
        </View>
      </View>
    </Modal>
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
  settingsDot: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  settingsDotText: { color: colors.maroon },
  pressedControl: { opacity: 0.72 },
  datePanel: { marginTop: 14, borderRadius: 20, padding: 13, backgroundColor: colors.maroon, overflow: 'hidden', shadowColor: colors.maroon, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 16, elevation: 3 },
  dayNav: { minHeight: 72, width: '100%', alignItems: 'center', flexDirection: 'row', zIndex: 2 },
  arrowButton: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#ffffff16', borderWidth: 1, borderColor: '#ffffff24', alignItems: 'center', justifyContent: 'center' },
  arrowButtonPressed: { backgroundColor: '#ffffff28' },
  arrowText: { color: colors.white, fontSize: 27, lineHeight: 30 },
  dayTitle: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
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
  cardRail: { paddingHorizontal: 16, gap: RAIL_GAP, paddingVertical: 6 },
  railCard: { width: RAIL_CARD_WIDTH, height: 194 },
  heroCard: { backgroundColor: colors.card, borderColor: colors.line, padding: 14 },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroCopy: { flex: 1 },
  heroLabel: { color: colors.orange, fontWeight: '800', fontSize: 11, letterSpacing: 0.3 },
  heroValue: { color: colors.ink, fontSize: 26, fontWeight: '800', marginTop: 4, letterSpacing: -0.4 },
  heroSub: { color: colors.muted, marginTop: 3, fontWeight: '600', fontSize: 13 },
  heroSmall: { color: colors.maroon, marginTop: 8, fontWeight: '700', fontSize: 13 },
  heroMoon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center' },
  heroMoonText: { color: '#e8edf4', fontSize: 27 },
  sunGrid: { flexDirection: 'row', gap: 8, marginTop: 12 },
  sunChip: { flex: 1, borderRadius: 14, backgroundColor: colors.peach, paddingVertical: 9, paddingHorizontal: 10 },
  cardLabel: { color: colors.muted, fontWeight: '700', fontSize: 11 },
  compactValue: { color: colors.ink, fontSize: 16, fontWeight: '800', marginTop: 3 },
  moonDateRow: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.line, padding: 14, shadowColor: '#5b2a10', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 1 },
  moonBadge: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center' },
  moonIcon: { color: '#dfe3ea', fontSize: 28 },
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
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#291a1370' },
  settingsSheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 28 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sheetEyebrow: { color: colors.orange, fontSize: 11, fontWeight: '800', letterSpacing: 0.3, textTransform: 'uppercase' },
  sheetTitle: { color: colors.ink, fontSize: 20, fontWeight: '800', marginTop: 2 },
  closeButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream },
  closeButtonText: { color: colors.maroon, fontSize: 26, lineHeight: 30 },
  settingLabel: { color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.3, marginBottom: 7, textTransform: 'uppercase' },
  cityOption: { minHeight: 54, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, borderWidth: 1, borderColor: colors.line, marginBottom: 7 },
  cityOptionSelected: { backgroundColor: colors.maroon, borderColor: colors.maroon },
  cityName: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  cityNameSelected: { color: colors.white },
  cityMeta: { color: colors.muted, fontSize: 11, fontWeight: '600', marginTop: 1 },
  cityMetaSelected: { color: '#ffe7d8' },
  cityCheck: { color: colors.gold, fontSize: 18, fontWeight: '800' },
  methodNote: { borderRadius: 14, backgroundColor: colors.peach, marginTop: 7, padding: 12 },
  methodTitle: { color: colors.maroon, fontSize: 12, fontWeight: '800' },
  methodText: { color: colors.ink, fontSize: 12, lineHeight: 18, marginTop: 3 },
});
