import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { fetchPanchangam } from '../../src/api/client';
import type { PanchangamResponse } from '../../src/api/types';
import { TodayPanel } from '../../src/components/TodayPanel';
import { addDays, isoDate } from '../../src/format';
import { PANCHANGAM_CITIES, usePanchangamSettings } from '../../src/settings';
import { colors } from '../../src/theme';

const TODAY = isoDate(new Date());

export default function TodayScreen() {
  const { city, setCity, language, setLanguage } = usePanchangamSettings();
  const telugu = language === 'te';
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

  const onRefresh = () => {
    setRefreshing(true);
    load(selectedDate, true);
  };

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable accessibilityRole="button" onPress={() => load(selectedDate, true)} style={({ pressed }) => [styles.retryButton, pressed && styles.pressedControl]}>
          <Text style={styles.retryText}>{telugu ? 'మళ్ళీ ప్రయత్నించండి' : 'Retry'}</Text>
        </Pressable>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.ember} size="large" />
      </View>
    );
  }

  const showCalculationInfo = () =>
    Alert.alert(
      telugu ? 'గణన వివరాలు' : 'Calculation details',
      [`${telugu ? 'ప్రొఫైల్' : 'Profile'}: ${data.source.profile}`, data.source.note].filter(Boolean).join('\n\n'),
    );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.shell}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ember} />}
    >
      <View style={styles.appFrame}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Previous day" hitSlop={8} onPress={() => setSelectedDate(addDays(data.date, -1))} style={({ pressed }) => [styles.arrowButton, pressed && styles.pressedControl]}>
            <Text style={styles.arrowText}>‹</Text>
          </Pressable>
          <View style={styles.topCenter}>
            <Text style={styles.brand}>{telugu ? 'SoHum పంచాంగం' : 'SoHum Panchangam'}</Text>
            {selectedDate !== TODAY && (
              <Pressable accessibilityRole="button" hitSlop={8} onPress={() => setSelectedDate(TODAY)} style={({ pressed }) => [styles.todayChip, pressed && styles.pressedControl]}>
                <Text style={styles.todayChipText}>{telugu ? 'ఈరోజు' : 'Today'}</Text>
              </Pressable>
            )}
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Next day" hitSlop={8} onPress={() => setSelectedDate(addDays(data.date, 1))} style={({ pressed }) => [styles.arrowButton, pressed && styles.pressedControl]}>
            <Text style={styles.arrowText}>›</Text>
          </Pressable>
        </View>

        <TodayPanel
          data={data}
          language={language}
          cityLabel={telugu ? city.name_te : city.name_en}
          onCityPress={() => setSettingsOpen(true)}
          onInfoPress={showCalculationInfo}
        />

        {data.festivals.length > 0 && (
          <View style={styles.festivals}>
            <Text style={styles.festivalsTitle}>{telugu ? 'ఈరోజు విశేషం' : 'Today’s observance'}</Text>
            {data.festivals.map((festival) => (
              <Text key={festival} style={styles.festivalText}>✦ {festival}</Text>
            ))}
          </View>
        )}
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
            <Text style={styles.methodText}>{telugu ? 'దృక్ పంచాంగం · లాహిరి అయనాంశ · సూర్యోదయ ఆధారిత వైదిక దినం' : 'Drik Panchangam · Lahiri ayanamsha · sunrise-based Vedic day'}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.night },
  shell: { alignItems: 'center', minHeight: '100%' },
  appFrame: { width: '100%', maxWidth: 430, minHeight: '100%', backgroundColor: colors.night, paddingBottom: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.night, padding: 24, gap: 14 },
  errorText: { color: colors.nightText, textAlign: 'center' },
  retryButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.ember },
  retryText: { color: colors.white, fontWeight: '800' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingBottom: 14, paddingHorizontal: 12 },
  topCenter: { flex: 1, alignItems: 'center', gap: 6 },
  brand: { color: colors.nightText, fontWeight: '800', fontSize: 17 },
  arrowButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.nightCard, borderWidth: 1, borderColor: colors.nightLine, alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: colors.nightText, fontSize: 26, lineHeight: 29 },
  todayChip: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: colors.ember },
  todayChipText: { color: colors.ember, fontSize: 12, fontWeight: '800' },
  festivals: { marginTop: 14, marginHorizontal: 12, padding: 14, borderRadius: 18, backgroundColor: colors.nightCard, borderWidth: 1, borderColor: colors.nightLine },
  festivalsTitle: { color: colors.ember, fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
  festivalText: { color: colors.nightText, fontSize: 14, fontWeight: '700', marginTop: 8 },
  pressedControl: { opacity: 0.72 },
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
