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
  const parts = formatDateParts(data.date);
  const phase = moonPhase(data.tithi.index);

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width > 0) setPage(Math.round(event.nativeEvent.contentOffset.x / width));
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
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onLayout={onLayout} onScroll={onScroll} scrollEventThrottle={16}>
          {width > 0 &&
            pages.map((item) => (
              <View key={item.key} style={{ width }}>
                <View style={styles.pageHeader}>
                  <Text style={styles.pageTitle} numberOfLines={1}>{item.title}</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel="Calculation details" hitSlop={10} onPress={showCalculationInfo} style={styles.infoButton}>
                    <Text style={styles.infoText}>i</Text>
                  </Pressable>
                  <Text style={styles.city} numberOfLines={1}>{cityLabel}</Text>
                </View>
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
  panel: { flexDirection: 'row', gap: 10, backgroundColor: colors.card, borderRadius: 22, borderWidth: 1, borderColor: colors.line, padding: 10, marginHorizontal: 16 },
  rail: { width: 92 },
  moonTile: { width: 68, height: 68, borderRadius: 14, backgroundColor: colors.moonTile, alignItems: 'center', justifyContent: 'center' },
  dateRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 4, marginTop: 10 },
  dateDay: { color: colors.orange, fontSize: 34, fontWeight: '900', lineHeight: 38 },
  dateMonth: { color: colors.orange, fontSize: 16, fontWeight: '800' },
  weekday: { color: colors.ink, fontSize: 12, fontWeight: '800', letterSpacing: 0.4, marginTop: 2 },
  divider: { height: 2, backgroundColor: colors.orange, marginTop: 8, borderRadius: 1 },
  lunarDay: { color: colors.orange, fontSize: 28, fontWeight: '900', lineHeight: 34 },
  lunarMasa: { color: colors.orange, fontSize: 12, fontWeight: '800' },
  vara: { color: colors.ink, fontSize: 12, fontWeight: '700', marginTop: 2 },
  main: { flex: 1, minWidth: 0 },
  pageHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  pageTitle: { flexShrink: 1, color: colors.ink, fontSize: 16, fontWeight: '800' },
  infoButton: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  infoText: { color: colors.ink, fontSize: 11, fontWeight: '800', lineHeight: 13 },
  city: { flex: 1, textAlign: 'right', color: colors.muted, fontSize: 11, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  rowLabel: { width: 78, color: colors.orange, fontSize: 12.5, fontWeight: '700', lineHeight: 19 },
  rowValue: { flex: 1, color: colors.ink, fontSize: 12.5, fontWeight: '500', lineHeight: 19 },
  sankalpam: { color: colors.ink, fontSize: 13, lineHeight: 20 },
  festivalRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  festivalName: { flexShrink: 1, color: colors.ink, fontSize: 13, fontWeight: '600' },
  festivalChip: { color: colors.maroon, backgroundColor: colors.peach, fontSize: 11, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  empty: { color: colors.muted, fontSize: 13 },
  footer: { height: 40, marginTop: 6, justifyContent: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  shareButton: { position: 'absolute', right: 0, width: 38, height: 38, borderRadius: 19, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', shadowColor: colors.maroon, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3 },
  sharePressed: { opacity: 0.75 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.line },
  dotActive: { backgroundColor: colors.orange },
});
