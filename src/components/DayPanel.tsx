import { useState } from 'react';
import { Alert, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { FestivalItem, PanchangamResponse } from '../api/types';
import { formatDateParts } from '../format';
import { dayPages, masaShort, moonPhase, shareText } from '../panchangamUi';
import type { AppLanguage } from '../settings';
import { colors } from '../theme';
import { MoonPhase } from './MoonPhase';

interface Props {
  data: PanchangamResponse;
  language: AppLanguage;
  cityLabel: string;
  upcoming: FestivalItem[];
  upcomingLoading?: boolean;
}

export function DayPanel({ data, language, cityLabel, upcoming, upcomingLoading = false }: Props) {
  const te = language === 'te';
  const pages = dayPages(data, language, upcoming);
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);
  const [pageHeights, setPageHeights] = useState<Record<string, number>>({});
  const parts = formatDateParts(data.date);
  const phase = moonPhase(data.tithi.index);

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width > 0) setPage(Math.max(0, Math.min(pages.length - 1, Math.round(event.nativeEvent.contentOffset.x / width))));
  };
  const sharePage = () => {
    const current = pages[Math.min(page, pages.length - 1)];
    Share.share({ message: shareText(data, current, cityLabel, language) }).catch(() => {});
  };
  const showCalculationInfo = () =>
    Alert.alert(
      te ? 'గణన వివరాలు' : 'Calculation details',
      [`${te ? 'ప్రొఫైల్' : 'Profile'}: ${data.source.profile}`, data.source.note].filter(Boolean).join('\n\n'),
    );

  return (
    <View style={styles.panel}>
      <View style={styles.rail}>
        <View style={styles.moonTile}>
          <MoonPhase fraction={phase.fraction} waxing={phase.waxing} size={54} />
        </View>
        <View style={styles.dateRow}>
          <Text style={styles.dateDay}>{parts.day.padStart(2, '0')}</Text>
          <Text style={styles.dateMonth}>{parts.month}</Text>
        </View>
        <Text style={styles.weekday}>{parts.weekday.toUpperCase()}</Text>
        <View style={styles.divider} />
        <View style={styles.dateRow}>
          <Text style={styles.lunarDay}>{data.tithi.index}</Text>
          <Text style={styles.lunarMasa}>{masaShort(data, language)}</Text>
        </View>
        <Text style={styles.vara}>{te ? data.vara.name_te : data.vara.name_en}</Text>
      </View>

      <View style={styles.main}>
        <ScrollView style={{ height: Math.max(260, pageHeights[pages[page].key] ?? 260) }} contentContainerStyle={styles.pages} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onLayout={onLayout} onScroll={onScroll} scrollEventThrottle={16}>
          {width > 0 &&
            pages.map((item) => (
              <View key={item.key} style={{ width }} onLayout={(event) => {
                const height = event.nativeEvent.layout.height;
                setPageHeights((current) => current[item.key] === height ? current : { ...current, [item.key]: height });
              }}>
                <View style={styles.pageHeader}>
                  <Text style={styles.pageTitle}>{item.title}</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel={te ? 'గణన వివరాలు' : 'Calculation details'} hitSlop={10} onPress={showCalculationInfo} style={styles.infoButton}>
                    <Text style={styles.infoText}>i</Text>
                  </Pressable>
                </View>
                <Text style={styles.city}>{cityLabel}</Text>
                {item.text ? <Text style={styles.sankalpam}>{item.text}</Text> : null}
                {item.festivals ? (
                  item.festivals.length > 0 ? (
                    item.festivals.map((festival) => (
                      <View key={`${festival.name}-${festival.date}`} style={styles.festivalRow}>
                        <Text style={styles.festivalName}>✦ {festival.name}</Text>
                        <Text style={styles.festivalChip}>{festival.date}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.empty}>{upcomingLoading ? '…' : te ? 'రాబోయే పండుగలు లేవు' : 'No upcoming festivals found'}</Text>
                  )
                ) : null}
                {item.rows.map((row) => (
                  <View key={row.label} style={styles.row}>
                    <Text style={styles.rowLabel}>{row.label}</Text>
                    <Text style={styles.rowValue}>{row.value}</Text>
                  </View>
                ))}
              </View>
            ))}
        </ScrollView>
        <View style={styles.footer}>
          <View style={styles.dots}>
            {pages.map((item, index) => (
              <View key={item.key} style={[styles.dot, index === page && styles.dotActive]} />
            ))}
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={te ? 'పంచుకోండి' : 'Share'} hitSlop={8} onPress={sharePage} style={({ pressed }) => [styles.shareButton, pressed && styles.sharePressed]}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M7 10H5.5A1.5 1.5 0 0 0 4 11.5v8A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5v-8a1.5 1.5 0 0 0-1.5-1.5H17" stroke={colors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { flexDirection: 'row', gap: 16, backgroundColor: colors.white, marginHorizontal: 16 },
  rail: { width: 80 },
  moonTile: { width: 64, height: 64, borderRadius: 6, backgroundColor: colors.moonTile, alignItems: 'center', justifyContent: 'center' },
  dateRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 4, marginTop: 10 },
  dateDay: { color: '#f15a06', fontSize: 36, fontWeight: '800', lineHeight: 42 },
  dateMonth: { color: '#f15a06', fontSize: 14, fontWeight: '700' },
  weekday: { color: '#141c26', fontSize: 11, fontWeight: '700', letterSpacing: 0.2, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f15a06', marginTop: 8, borderRadius: 1 },
  lunarDay: { color: '#f15a06', fontSize: 30, fontWeight: '800', lineHeight: 38 },
  lunarMasa: { color: '#f15a06', fontSize: 12, fontWeight: '800' },
  vara: { color: '#141c26', fontSize: 12, fontWeight: '700', marginTop: 2 },
  main: { flex: 1, minWidth: 0 },
  pages: { alignItems: 'flex-start' },
  pageHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
  pageTitle: { flex: 1, color: '#141c26', fontSize: 18, lineHeight: 26, fontWeight: '700' },
  infoButton: { marginTop: 4, width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#141c26', alignItems: 'center', justifyContent: 'center' },
  infoText: { color: '#141c26', fontSize: 11, fontWeight: '800', lineHeight: 13 },
  city: { color: '#676767', fontSize: 12, lineHeight: 18, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 3 },
  rowLabel: { width: '38%', color: '#f15a06', fontSize: 14, fontWeight: '500', lineHeight: 23 },
  rowValue: { flex: 1, color: '#141c26', fontSize: 14, fontWeight: '400', lineHeight: 23 },
  sankalpam: { color: '#141c26', fontSize: 14, lineHeight: 25 },
  festivalRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 6, paddingVertical: 5 },
  festivalName: { flex: 1, minWidth: '55%', color: '#141c26', fontSize: 14, lineHeight: 23, fontWeight: '400' },
  festivalChip: { color: '#141c26', backgroundColor: '#fbe4bb', fontSize: 11, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  empty: { color: colors.muted, fontSize: 13 },
  footer: { height: 48, marginTop: 24, justifyContent: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', paddingRight: 54, gap: 6 },
  shareButton: { position: 'absolute', right: 0, width: 44, height: 44, borderRadius: 22, backgroundColor: '#f15a06', alignItems: 'center', justifyContent: 'center', shadowColor: colors.maroon, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3 },
  sharePressed: { opacity: 0.75 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#bcbcbc' },
  dotActive: { backgroundColor: '#f15a06' },
});
