import { useState } from 'react';
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { PanchangamResponse } from '../api/types';
import { formatDateParts } from '../format';
import { masaShort, moonPhase, todayPages } from '../panchangamUi';
import type { AppLanguage } from '../settings';
import { colors } from '../theme';
import { MoonPhase } from './MoonPhase';

interface Props {
  data: PanchangamResponse;
  language: AppLanguage;
  cityLabel: string;
  onCityPress: () => void;
  onInfoPress: () => void;
}

export function TodayPanel({ data, language, cityLabel, onCityPress, onInfoPress }: Props) {
  const te = language === 'te';
  const pages = todayPages(data, language);
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);
  const parts = formatDateParts(data.date);
  const phase = moonPhase(data.tithi.index);

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width > 0) setPage(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={styles.panel}>
      <View style={styles.rail}>
        <View style={styles.moonTile}>
          <MoonPhase fraction={phase.fraction} waxing={phase.waxing} size={58} />
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
                  <Pressable accessibilityRole="button" accessibilityLabel="Calculation details" hitSlop={10} onPress={onInfoPress} style={styles.infoButton}>
                    <Text style={styles.infoText}>i</Text>
                  </Pressable>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="Change location" hitSlop={6} onPress={onCityPress}>
                  <Text style={styles.city} numberOfLines={1}>⌖ {cityLabel}</Text>
                </Pressable>
                {item.text ? <Text style={styles.sankalpam}>{item.text}</Text> : null}
                {item.rows.map((row) => (
                  <View key={row.label} style={styles.row}>
                    <Text style={styles.rowLabel}>{row.label}</Text>
                    <Text style={styles.rowValue}>{row.value}</Text>
                  </View>
                ))}
              </View>
            ))}
        </ScrollView>
        <View style={styles.dots}>
          {pages.map((item, index) => (
            <View key={item.key} style={[styles.dot, index === page && styles.dotActive]} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { flexDirection: 'row', gap: 12, backgroundColor: colors.nightCard, borderRadius: 22, borderWidth: 1, borderColor: colors.nightLine, padding: 10, marginHorizontal: 8 },
  rail: { width: 104 },
  moonTile: { width: 76, height: 76, borderRadius: 16, backgroundColor: colors.moonTile, alignItems: 'center', justifyContent: 'center' },
  dateRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 4, marginTop: 10 },
  dateDay: { color: colors.ember, fontSize: 40, fontWeight: '900', lineHeight: 44 },
  dateMonth: { color: colors.ember, fontSize: 18, fontWeight: '800' },
  weekday: { color: colors.nightText, fontSize: 12, fontWeight: '800', letterSpacing: 0.4, marginTop: 2 },
  divider: { height: 2, backgroundColor: colors.ember, marginTop: 8, borderRadius: 1 },
  lunarDay: { color: colors.ember, fontSize: 30, fontWeight: '900', lineHeight: 36 },
  lunarMasa: { color: colors.ember, fontSize: 13, fontWeight: '800' },
  vara: { color: colors.nightText, fontSize: 13, fontWeight: '700', marginTop: 2 },
  main: { flex: 1, minWidth: 0 },
  pageHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pageTitle: { flexShrink: 1, color: colors.nightText, fontSize: 18, fontWeight: '800' },
  infoButton: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.nightText, alignItems: 'center', justifyContent: 'center' },
  infoText: { color: colors.nightText, fontSize: 12, fontWeight: '800', lineHeight: 14 },
  city: { color: colors.nightMuted, fontSize: 12, fontWeight: '600', marginTop: 4, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, paddingVertical: 5 },
  rowLabel: { width: 80, color: colors.ember, fontSize: 13, fontWeight: '800', lineHeight: 19 },
  rowValue: { flex: 1, color: colors.nightText, fontSize: 13, fontWeight: '500', lineHeight: 19 },
  sankalpam: { color: colors.nightText, fontSize: 13, lineHeight: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.nightLine },
  dotActive: { backgroundColor: colors.ember },
});
