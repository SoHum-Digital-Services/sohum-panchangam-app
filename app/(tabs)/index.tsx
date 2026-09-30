import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { fetchPanchangam } from '../../src/api/client';
import type { PanchangamResponse } from '../../src/api/types';
import { Card } from '../../src/components/Card';
import { DetailCard } from '../../src/components/DetailCard';
import { colors } from '../../src/theme';
import { addDays, formatDateLong, formatDateParts, formatTime, isoDate } from '../../src/format';
import { muhurtaCardTitle, muhurtaLines, pakshaTe, panchangamCardTitle, primaryDayLines, sankalpamCardTitle, weekdayShort } from '../../src/panchangamUi';
import { PANCHANGAM_CITIES, usePanchangamSettings } from '../../src/settings';
import { railStyles, useRailMetrics } from '../../src/rail';

const TODAY = isoDate(new Date());

export default function TodayScreen() {
  const { city, setCity, language, setLanguage } = usePanchangamSettings();
  const telugu = language === 'te';
  const { cardWidth, snapInterval } = useRailMetrics();
  const railCard = { width: cardWidth };
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
              <Text style={styles.brand}>{telugu ? 'SoHum పంచాంగం' : 'SoHum Panchangam'}</Text>
              <Text style={styles.location}>⌖ {telugu ? city.name_te : city.name_en}</Text>
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
                <Text style={styles.vara}>{telugu ? data.vara.name_te : data.vara.name_en}</Text>
                <Text style={styles.date}>{formatDateLong(data.date)}</Text>
                <Text style={styles.monthLine}>{telugu ? `${data.lunar_month.name_te} · ${pakshaTe(data.tithi.paksha)} పక్షం` : `${data.lunar_month.name_en} · ${data.tithi.paksha} Paksha`}</Text>
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
                    <Text style={[styles.datePillWeekday, active && styles.datePillTextActive]}>{weekdayShort(date, language)}</Text>
                    <Text style={[styles.datePillDay, active && styles.datePillTextActive]}>{itemParts.day}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{telugu ? 'ఈరోజు' : 'Today'}</Text>
            <Text style={styles.swipeHint}>{telugu ? 'కార్డులను స్వైప్ చేయండి →' : 'Swipe cards →'}</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={snapInterval}
            contentContainerStyle={railStyles.cardRail}
          >
            <Card style={[styles.heroCard, railCard]}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroCopy}>
                  <Text style={styles.heroLabel}>{telugu ? 'ఈరోజు తిథి' : 'Today’s tithi'}</Text>
                  <Text style={styles.heroValue}>{telugu ? data.tithi.name_te : data.tithi.name_en}</Text>
                  <Text style={styles.heroSub}>{telugu ? `${pakshaTe(data.tithi.paksha)} పక్షం` : `${data.tithi.paksha} Paksha`}</Text>
                  <Text style={styles.heroSmall}>{telugu ? 'ముగింపు ' : 'Ends '}{formatTime(data.tithi.ends_at)}</Text>
                </View>
                <View style={styles.heroMoon}>
                  <Text style={styles.heroMoonText}>◐</Text>
                </View>
              </View>
              <View style={styles.sunGrid}>
                <View style={styles.sunChip}>
                  <Text style={styles.cardLabel}>🌅 {telugu ? 'సూర్యోదయం' : 'Sunrise'}</Text>
                  <Text style={styles.compactValue}>{formatTime(data.sunrise)}</Text>
                </View>
                <View style={styles.sunChip}>
                  <Text style={styles.cardLabel}>🌇 {telugu ? 'సూర్యాస్తమయం' : 'Sunset'}</Text>
                  <Text style={styles.compactValue}>{formatTime(data.sunset)}</Text>
                </View>
              </View>
            </Card>

            <Card style={[styles.moonCard, railCard]}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroCopy}>
                  <Text style={styles.heroLabel}>{telugu ? 'చంద్రుడు' : 'Moon'}</Text>
                  <Text style={styles.heroValue}>{telugu ? data.moon_rashi.name_te : data.moon_rashi.name_en}</Text>
                  <Text style={styles.heroSub}>{telugu ? 'రాశి' : 'Rashi'}</Text>
                </View>
                <View style={railStyles.moonBadge}>
                  <Text style={railStyles.moonIcon}>◐</Text>
                </View>
              </View>
              <View style={styles.sunGrid}>
                <View style={styles.sunChip}>
                  <Text style={styles.cardLabel}>🌙 {telugu ? 'చంద్రోదయం' : 'Moonrise'}</Text>
                  <Text style={styles.compactValue}>{formatTime(data.moonrise)}</Text>
                </View>
                <View style={styles.sunChip}>
                  <Text style={styles.cardLabel}>🌑 {telugu ? 'చంద్రాస్తమయం' : 'Moonset'}</Text>
                  <Text style={styles.compactValue}>{formatTime(data.moonset)}</Text>
                </View>
              </View>
            </Card>

            {data.festivals.length > 0 && (
              <Card style={[railStyles.festivalCard, railCard]}>
                <Text style={railStyles.panelTitle}>{telugu ? 'ఈరోజు విశేషం' : 'Today’s observance'}</Text>
                {data.festivals.map((festival) => (
                  <Text key={festival} style={railStyles.festivalText}>✦ {festival}</Text>
                ))}
              </Card>
            )}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{telugu ? 'వివరాలు' : 'Details'}</Text>
            <Text style={styles.swipeHint}>{telugu ? 'కార్డులను స్వైప్ చేయండి →' : 'Swipe cards →'}</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={snapInterval}
            contentContainerStyle={railStyles.cardRail}
          >
            <DetailCard title={panchangamCardTitle(telugu)} lines={primaryDayLines(data, language)} style={railCard} />
            <DetailCard title={muhurtaCardTitle(telugu)} lines={muhurtaLines(data, language)} style={railCard} />
            <Card style={[railStyles.sankalpamCard, railCard]}>
              <Text style={railStyles.panelTitle}>{sankalpamCardTitle(telugu)}</Text>
              <Text style={railStyles.sankalpamText}>{data.sankalpam}</Text>
            </Card>
          </ScrollView>
        </View>
      </View>
      <SettingsModal
        citySlug={city.slug}
        language={language}
        onClose={() => setSettingsOpen(false)}
        onSelectCity={(slug) => {
          const nextCity = PANCHANGAM_CITIES.find((candidate) => candidate.slug === slug);
          if (nextCity) setCity(nextCity);
          setSettingsOpen(false);
        }}
        onSelectLanguage={setLanguage}
        visible={settingsOpen}
      />
    </ScrollView>
  );
}

function SettingsModal({ citySlug, language, onClose, onSelectCity, onSelectLanguage, visible }: { citySlug: string; language: 'te' | 'en'; onClose: () => void; onSelectCity: (slug: string) => void; onSelectLanguage: (language: 'te' | 'en') => void; visible: boolean }) {
  const telugu = language === 'te';
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.settingsSheet}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetEyebrow}>{telugu ? 'పంచాంగం సెట్టింగులు' : 'Panchangam settings'}</Text>
              <Text style={styles.sheetTitle}>{telugu ? 'స్థానం & పద్ధతి' : 'Location & method'}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Close settings" hitSlop={8} onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>
          <Text style={styles.settingLabel}>{telugu ? 'గణన స్థానం' : 'Calculation location'}</Text>
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
          <Text style={styles.settingLabel}>{telugu ? 'యాప్ భాష' : 'App language'}</Text>
          <View style={styles.languageRow}>
            <Pressable onPress={() => onSelectLanguage('te')} style={[styles.languageOption, language === 'te' && styles.languageOptionSelected]}><Text style={[styles.languageText, language === 'te' && styles.languageTextSelected]}>తెలుగు</Text></Pressable>
            <Pressable onPress={() => onSelectLanguage('en')} style={[styles.languageOption, language === 'en' && styles.languageOptionSelected]}><Text style={[styles.languageText, language === 'en' && styles.languageTextSelected]}>English</Text></Pressable>
          </View>
          <View style={styles.methodNote}>
            <Text style={styles.methodTitle}>{telugu ? 'గణన ప్రొఫైల్' : 'Calculation profile'}</Text>
            <Text style={styles.methodText}>{telugu ? 'సూర్య సిద్ధాంత గణిత పంచాంగం · సూర్యోదయ ఆధారిత వైదిక దినం' : 'Surya Siddhanta Ganitha Panchangam · sunrise-based Vedic day'}</Text>
          </View>
        </View>
      </View>
    </Modal>
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
  heroCard: { backgroundColor: colors.card, borderColor: colors.line, padding: 14 },
  moonCard: { backgroundColor: colors.card, borderColor: colors.line, padding: 14 },
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
  languageRow: { flexDirection: 'row', gap: 8, marginBottom: 7 },
  languageOption: { flex: 1, minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  languageOptionSelected: { backgroundColor: colors.maroon, borderColor: colors.maroon },
  languageText: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  languageTextSelected: { color: colors.white },
  methodNote: { borderRadius: 14, backgroundColor: colors.peach, marginTop: 7, padding: 12 },
  methodTitle: { color: colors.maroon, fontSize: 12, fontWeight: '800' },
  methodText: { color: colors.ink, fontSize: 12, lineHeight: 18, marginTop: 3 },
});
