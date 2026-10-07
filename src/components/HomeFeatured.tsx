import { colors } from '../theme';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import type { Stotram } from '../api/temple';
import type { PanchangamResponse } from '../api/types';
import { formatDateLong } from '../format';
import { panchangamCardTitle, primaryDayLines } from '../panchangamUi';
import type { AppLanguage } from '../settings';

function firstShloka(text: string): string {
  const paragraphs = text.trim().split(/\n\s*\n/);
  return paragraphs.find((paragraph) => paragraph.includes('॥')) ?? paragraphs[0] ?? '';
}

export function HomeFeatured({ panchangam, panchangamError, stotrams, stotramError, language, onRead }: {
  panchangam: PanchangamResponse | null;
  panchangamError?: string | null;
  stotrams: Stotram[] | null;
  stotramError: boolean;
  language: AppLanguage;
  onRead: (stotram: Stotram) => void;
}) {
  const te = language === 'te';
  const { width: screenWidth } = useWindowDimensions();
  const width = Math.min(screenWidth, 430) - 32;
  const [page, setPage] = useState(0);
  const stotram = stotrams?.[0];
  const lines = panchangam ? primaryDayLines(panchangam, language) : [];
  const shareText = page === 0 && panchangam ? `${panchangamCardTitle(te)}\n${formatDateLong(panchangam.date)}\n${lines.map((line) => `${line.label}: ${line.value}`).join('\n')}` : page === 1 && stotram ? `${te ? stotram.title_telugu || stotram.title : stotram.title}\n\n${firstShloka(stotram.text_telugu)}` : null;

  return <View style={styles.card}>
    {page === 1 && <Text pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no" style={styles.quote}>“</Text>}
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} accessibilityLabel={te ? 'ముఖ్యమైన కార్డులు' : 'Featured cards'} style={styles.pages}
      onScroll={(event) => setPage(Math.max(0, Math.min(2, Math.round(event.nativeEvent.contentOffset.x / width))))} scrollEventThrottle={16}>
      <View style={[styles.page, { width }]}>
        <Text style={styles.title}>{panchangamCardTitle(te)}</Text>
        <ScrollView nestedScrollEnabled style={styles.bodyArea} contentContainerStyle={styles.bodyContent}>
          {panchangam ? <>
            <Text style={styles.date}>{formatDateLong(panchangam.date)}</Text>
            {lines.map((line) => <View key={line.label} style={styles.line}><Text style={styles.label}>{line.label}</Text><Text style={styles.value}>{line.value}</Text></View>)}
          </> : panchangamError ? <Text style={styles.note}>{panchangamError}</Text> : <ActivityIndicator color={colors.maroon} />}
        </ScrollView>
        <View style={styles.divider} />
        <Pressable accessibilityRole="button" onPress={() => router.push('/calendar')} style={styles.readButton}><Text style={styles.readText}>{te ? 'క్యాలెండర్ తెరవండి' : 'Open calendar'}</Text></Pressable>
      </View>
      <View style={[styles.page, { width }]}>
        <Text style={styles.title}>{stotram ? te ? stotram.title_telugu || stotram.title : stotram.title : te ? 'స్తోత్రాలు' : 'Stotrams'}</Text>
        <ScrollView nestedScrollEnabled style={styles.bodyArea} contentContainerStyle={styles.verseContent}>
          {stotram ? <Text style={styles.verse}>{firstShloka(stotram.text_telugu)}</Text> : stotrams === null ? <ActivityIndicator color={colors.maroon} /> : <Text style={styles.note}>{stotramError ? (te ? 'విషయాలను లోడ్ చేయలేకపోయాము' : 'Unable to load content') : (te ? 'ప్రస్తుతం విషయాలు లేవు' : 'No content available')}</Text>}
        </ScrollView>
        <View style={styles.divider} />
        <Pressable accessibilityRole="button" disabled={!stotram} onPress={() => { if (stotram) onRead(stotram); }} style={styles.readButton}><Text style={styles.readText}>{te ? 'పూర్తిగా చదవండి' : 'Read full stotram'}</Text></Pressable>
      </View>
      <View style={[styles.page, { width }]}>
        <Text style={styles.title}>{te ? 'జ్యోతిష సేవలు' : 'Jyotisha services'}</Text>
        <ScrollView nestedScrollEnabled style={styles.bodyArea} contentContainerStyle={styles.horoscopeContent}>
          <Pressable accessibilityRole="button" onPress={() => router.push('/horoscope')} style={styles.service}>
            <View style={styles.serviceIcon}><Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Path d="m12 2 10 10-10 10L2 12ZM12 2v20M2 12h20" stroke={colors.maroon} strokeWidth={1.5} /></Svg></View>
            <Text style={styles.serviceText}>{te ? 'జాతకం' : 'Horoscope'}</Text><Text style={styles.chevron}>›</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push('/compatibility')} style={styles.service}>
            <View style={styles.serviceIcon}><Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Circle cx={8} cy={12} r={6} stroke={colors.maroon} strokeWidth={1.5} /><Circle cx={16} cy={12} r={6} stroke={colors.maroon} strokeWidth={1.5} /></Svg></View>
            <Text style={styles.serviceText}>{te ? 'వివాహ మైత్రి' : 'Marriage Compatibility'}</Text><Text style={styles.chevron}>›</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/horoscope', params: { mode: 'doshas' } })} style={styles.service}>
            <View style={styles.serviceIcon}><Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" stroke={colors.maroon} strokeWidth={1.5} strokeLinejoin="round" /></Svg></View>
            <Text style={styles.serviceText}>{te ? 'శిశు జనన నక్షత్ర దోషం' : 'Child Birth Nakshatra Dosha'}</Text><Text style={styles.chevron}>›</Text>
          </Pressable>
        </ScrollView>
      </View>
    </ScrollView>
    <View style={styles.footer}>{[0, 1, 2].map((index) => <View key={index} style={[styles.dot, index === page && styles.dotActive]} />)}</View>
    {page === 1 && <Text pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no" style={styles.quoteEnd}>”</Text>}
    {shareText && <Pressable accessibilityRole="button" accessibilityLabel={te ? 'పంచుకోండి' : 'Share'} hitSlop={5} onPress={() => { Share.share({ message: shareText }).catch(() => {}); }} style={({ pressed }) => [styles.share, pressed && styles.pressed]}>
      <Svg width={19} height={19} viewBox="0 0 24 24" fill="none"><Path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M7 10H5.5A1.5 1.5 0 0 0 4 11.5v8A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5v-8a1.5 1.5 0 0 0-1.5-1.5H17" stroke={colors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
    </Pressable>}
  </View>;
}

const styles = StyleSheet.create({
  card: { height: 288, marginHorizontal: 16, marginTop: 12, marginBottom: 12, backgroundColor: colors.peach, borderRadius: 16, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.09, shadowRadius: 12, elevation: 3 },
  pages: { flexGrow: 0, height: 260 },
  page: { height: 260, paddingTop: 14, paddingHorizontal: 16, paddingBottom: 2 },
  title: { paddingHorizontal: 30, textAlign: 'center', color: colors.ink, fontSize: 18, fontWeight: '600', lineHeight: 26, marginBottom: 8 },
  bodyArea: { flex: 1, minHeight: 0 },
  bodyContent: { paddingBottom: 4 },
  verseContent: { flexGrow: 1, justifyContent: 'center' },
  horoscopeContent: { flexGrow: 1, justifyContent: 'center', gap: 8, paddingBottom: 8 },
  service: { minHeight: 48, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', gap: 10 },
  serviceIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.maroonSoft, alignItems: 'center', justifyContent: 'center' },
  serviceText: { flex: 1, color: colors.ink, fontSize: 14, lineHeight: 22, fontWeight: '500' },
  chevron: { color: colors.maroon, fontSize: 24 },
  date: { textAlign: 'center', color: colors.muted, fontSize: 12, lineHeight: 20, marginBottom: 6 },
  line: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 5 },
  label: { width: 66, color: colors.muted, fontSize: 13, lineHeight: 22 },
  value: { flex: 1, color: colors.ink, fontSize: 13, lineHeight: 22 },
  note: { color: colors.muted, fontSize: 14, lineHeight: 24, textAlign: 'center' },
  divider: { height: 2, width: 130, alignSelf: 'center', backgroundColor: colors.maroon, marginVertical: 8 },
  readButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  readText: { color: colors.maroon, fontSize: 13, lineHeight: 22 },
  verse: { color: colors.ink, fontSize: 15, lineHeight: 25, textAlign: 'center' },
  quote: { position: 'absolute', top: 0, left: 8, fontSize: 78, color: colors.maroonSoft, lineHeight: 90 },
  quoteEnd: { position: 'absolute', bottom: -16, right: 8, fontSize: 78, color: colors.maroonSoft, lineHeight: 90 },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 7, paddingVertical: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.line },
  dotActive: { backgroundColor: colors.maroon },
  share: { position: 'absolute', right: 12, top: 12, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
});
