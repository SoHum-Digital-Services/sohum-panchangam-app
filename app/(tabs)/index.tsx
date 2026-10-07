import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { fetchFestivals, fetchMonthlyObservances, fetchPanchangam } from '../../src/api/client';
import type { FestivalItem, PanchangamResponse } from '../../src/api/types';
import { Card } from '../../src/components/Card';
import { HomeTempleContent } from '../../src/components/HomeTempleContent';
import { DetailCard } from '../../src/components/DetailCard';
import { colors } from '../../src/theme';
import { addDays, formatDateLong, formatTime, isoDate } from '../../src/format';
import { muhurtaCardTitle, muhurtaLines, panchangamCardTitle, primaryDayLines, sankalpamCardTitle } from '../../src/panchangamUi';
import { PANCHANGAM_CITIES, usePanchangamSettings } from '../../src/settings';
import { railStyles, useRailMetrics } from '../../src/rail';

const TODAY = isoDate(new Date());

export default function TodayScreen() {
  const { city, setCity, language, setLanguage } = usePanchangamSettings();
  const focused = useIsFocused();
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const telugu = language === 'te';
  const { cardWidth, snapInterval } = useRailMetrics();
  const railCard = { width: cardWidth };
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [cache, setCache] = useState<Record<string, PanchangamResponse>>({});
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [festivalsOpen, setFestivalsOpen] = useState(false);
  const [festivalResult, setFestivalResult] = useState<{ key: string; items: FestivalItem[]; error?: string } | null>(null);
  const [monthlyResult, setMonthlyResult] = useState<{ key: string; items: FestivalItem[]; error?: string } | null>(null);
  const cacheKey = `${city.slug}:${selectedDate}`;
  const data = cache[cacheKey] ?? null;
  const festivalItems = festivalResult?.key === cacheKey ? festivalResult.items : null;
  const monthlyItems = monthlyResult?.key === cacheKey ? monthlyResult.items : null;
  const monthlyError = monthlyResult?.key === cacheKey ? monthlyResult.error : null;
  const festivalError = festivalResult?.key === cacheKey ? festivalResult.error : null;

  const load = useCallback(async (date: string, force = false) => {
    const key = `${city.slug}:${date}`;
    if (!force && cache[key]) return;
    try {
      setError(null);
      const result = await fetchPanchangam(date, city);
      setCache((current) => ({ ...current, [key]: result }));
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

  useFocusEffect(useCallback(() => {
    let active = true;
    fetchFestivals(selectedDate, addDays(selectedDate, 60), city)
      .then((items) => { if (active) setFestivalResult({ key: cacheKey, items }); })
      .catch((e) => { if (active) setFestivalResult({ key: cacheKey, items: [], error: e instanceof Error ? e.message : 'Failed to load festivals' }); });
    return () => { active = false; };
  }, [selectedDate, city, cacheKey]));

  useFocusEffect(useCallback(() => {
    let active = true;
    fetchMonthlyObservances(selectedDate, addDays(selectedDate, 60), city)
      .then((items) => { if (active) setMonthlyResult({ key: cacheKey, items }); })
      .catch((e) => { if (active) setMonthlyResult({ key: cacheKey, items: [], error: e instanceof Error ? e.message : 'Failed to load monthly observances' }); });
    return () => { active = false; };
  }, [selectedDate, city, cacheKey]));

  const onRefresh = () => {
    setRefreshing(true);
    load(selectedDate, true);
  };
  const selectFestival = (date: string) => {
    setSelectedDate(date);
    setFestivalsOpen(false);
    scroll.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <ScrollView
      ref={scroll}
      style={styles.screen}
      contentContainerStyle={styles.shell}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f15a06" />}
    >
      {focused && <StatusBar style="light" />}
      <View style={styles.appFrame}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.brandRow}>
            <Pressable accessibilityRole="button" accessibilityLabel={telugu ? 'సెట్టింగులు తెరవండి' : 'Open settings'} onPress={() => setSettingsOpen(true)} style={({ pressed }) => [styles.settingsDot, pressed && styles.pressedControl]}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={8} r={3.5} stroke="#fff" strokeWidth={1.8} />
                <Path d="M5 21v-3a7 7 0 0 1 14 0v3" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
              </Svg>
            </Pressable>
            <View style={styles.brandCopy}>
              <Text style={styles.brand}>{telugu ? 'SoHum పంచాంగం' : 'SoHum Panchangam'}</Text>
              <Text style={styles.location}>{telugu ? city.name_te : city.name_en}</Text>
            </View>
          </View>
        </View>

        <HomeTempleContent language={language} festivals={festivalItems} festivalError={festivalError} monthlyFestivals={monthlyItems} monthlyError={monthlyError} onSelectFestival={selectFestival} onViewFestivals={() => setFestivalsOpen(true)} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{telugu ? 'రోజు వివరాలు' : 'Day details'}</Text>
        </View>
        {error ? <Text style={styles.festivalStatus}>{error}</Text> : !data ? <ActivityIndicator color="#f15a06" style={styles.festivalStatus} /> : <>
        <View style={styles.dayNav}>
          <Pressable accessibilityRole="button" accessibilityLabel={telugu ? 'మునుపటి రోజు' : 'Previous day'} onPress={() => setSelectedDate(addDays(data.date, -1))} style={styles.arrowButton}>
            <Text style={styles.arrowText}>‹</Text>
          </Pressable>
          <Text style={styles.date}>{formatDateLong(data.date)}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={telugu ? 'తదుపరి రోజు' : 'Next day'} onPress={() => setSelectedDate(addDays(data.date, 1))} style={styles.arrowButton}>
            <Text style={styles.arrowText}>›</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast" snapToInterval={snapInterval} contentContainerStyle={railStyles.cardRail}>
          <DetailCard title={panchangamCardTitle(telugu)} lines={primaryDayLines(data, language)} style={{ ...railCard, ...styles.detailCard }} />
          <DetailCard title={muhurtaCardTitle(telugu)} lines={muhurtaLines(data, language)} style={{ ...railCard, ...styles.detailCard }} />
          <Card style={[railCard, styles.detailCard]}>
            <Text style={railStyles.panelTitle}>{sankalpamCardTitle(telugu)}</Text>
            <Text style={railStyles.sankalpamText}>{data.sankalpam}</Text>
          </Card>
          <DetailCard title={telugu ? 'చంద్రుడు' : 'Moon'} lines={[
            { label: telugu ? 'రాశి' : 'Rashi', value: telugu ? data.moon_rashi.name_te : data.moon_rashi.name_en },
            { label: telugu ? 'చంద్రోదయం' : 'Moonrise', value: formatTime(data.moonrise) },
            { label: telugu ? 'చంద్రాస్తమయం' : 'Moonset', value: formatTime(data.moonset) },
          ]} style={{ ...railCard, ...styles.detailCard }} />
        </ScrollView>
        </>}
      </View>
      <Modal transparent animationType="slide" visible={festivalsOpen} onRequestClose={() => setFestivalsOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.settingsSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{telugu ? 'రాబోయే పండుగలు' : 'Upcoming festivals'}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={telugu ? 'మూసివేయండి' : 'Close festivals'} onPress={() => setFestivalsOpen(false)} style={styles.closeButton}><Text style={styles.closeButtonText}>×</Text></Pressable>
            </View>
            <ScrollView style={styles.festivalList}>
              {!festivalItems && <ActivityIndicator color="#f15a06" style={styles.festivalStatus} />}
              {(festivalItems ?? []).map((festival) => (
                <Pressable accessibilityRole="button" key={`${festival.key}-${festival.date}`} onPress={() => selectFestival(festival.date)} style={styles.festivalListRow}>
                  <Text style={styles.festivalListName}>{telugu ? festival.name_te || festival.name : festival.name}</Text>
                  <Text style={styles.festivalListDate}>{formatDateLong(festival.date)}</Text>
                </Pressable>
              ))}
              {festivalItems?.length === 0 && <Text style={styles.festivalStatus}>{festivalError ?? (telugu ? 'రాబోయే పండుగలు లేవు' : 'No upcoming festivals found')}</Text>}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
            <Pressable accessibilityRole="button" accessibilityLabel={telugu ? 'సెట్టింగులు మూసివేయండి' : 'Close settings'} hitSlop={8} onPress={onClose} style={styles.closeButton}>
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
            <Text style={styles.methodText}>{telugu ? 'సూర్య సిద్ధాంత పంచాంగం · సూర్యోదయ ఆధారిత వైదిక దినం' : 'Surya Siddhanta panchangam · sunrise-based Vedic day'}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  shell: { alignItems: 'center', minHeight: '100%' },
  appFrame: { width: '100%', maxWidth: 430, minHeight: '100%', backgroundColor: '#fff', paddingBottom: 24 },
  header: { backgroundColor: '#f15a06', paddingBottom: 20, paddingHorizontal: 20 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  brandCopy: { flex: 1 },
  brand: { color: '#fff', fontWeight: '700', fontSize: 24, lineHeight: 36 },
  location: { color: '#fff', marginTop: 2, fontSize: 12, lineHeight: 20 },
  settingsDot: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  pressedControl: { opacity: 0.72 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16, marginBottom: 6 },
  sectionTitle: { flex: 1, color: '#141c26', fontSize: 20, lineHeight: 32, fontWeight: '600' },
  festivalStatus: { marginHorizontal: 16, marginVertical: 16, color: '#747474', fontSize: 14, lineHeight: 24 },
  dayNav: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginBottom: 8 },
  arrowButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f15a06', alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: '#fff', fontSize: 27, lineHeight: 30 },
  date: { flex: 1, color: '#141c26', fontSize: 14, fontWeight: '500', textAlign: 'center', lineHeight: 24 },
  detailCard: { backgroundColor: '#fbf5e9', borderColor: '#f1ece4', borderRadius: 8 },
  festivalList: { maxHeight: 420 },
  festivalListRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  festivalListName: { color: '#141c26', fontSize: 16, lineHeight: 26 },
  festivalListDate: { color: '#f15a06', fontSize: 12, lineHeight: 20, marginTop: 4 },
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
