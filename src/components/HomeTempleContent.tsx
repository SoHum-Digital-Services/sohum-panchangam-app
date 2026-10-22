import { colors } from '../theme';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchStotrams, fetchTempleNews, type Stotram, type TempleNews } from '../api/temple';
import type { FestivalItem, PanchangamResponse } from '../api/types';
import { formatDateLong, formatDateParts } from '../format';
import type { AppLanguage } from '../settings';
import { HomeFeatured } from './HomeFeatured';
import { festivalArtwork, newsArtwork, stotramArtwork } from '../homeArtwork';

export function HomeTempleContent({ language, panchangam, panchangamError, festivals, festivalError, monthlyFestivals, monthlyError, onSelectFestival, onViewFestivals }: {
  language: AppLanguage;
  panchangam: PanchangamResponse | null;
  panchangamError?: string | null;
  festivals: FestivalItem[] | null;
  festivalError?: string | null;
  monthlyFestivals: FestivalItem[] | null;
  monthlyError?: string | null;
  onSelectFestival: (date: string) => void;
  onViewFestivals: () => void;
}) {
  const te = language === 'te';
  const insets = useSafeAreaInsets();
  const [stotrams, setStotrams] = useState<Stotram[] | null>(null);
  const [news, setNews] = useState<TempleNews[] | null>(null);
  const [errors, setErrors] = useState({ stotrams: false, news: false });
  const [list, setList] = useState<'stotrams' | 'news' | 'mantras' | 'monthly' | null>(null);
  const [reading, setReading] = useState<Stotram | TempleNews | null>(null);
  useEffect(() => {
    let active = true;
    fetchStotrams().then((items) => { if (active) setStotrams(items); }).catch(() => {
      if (active) { setStotrams([]); setErrors((current) => ({ ...current, stotrams: true })); }
    });
    fetchTempleNews().then((items) => { if (active) setNews(items); }).catch(() => {
      if (active) { setNews([]); setErrors((current) => ({ ...current, news: true })); }
    });
    return () => { active = false; };
  }, []);
  const mantras = stotrams?.filter((item) => /(?:^|-)mantras?(?:-|$)/.test(item.slug)) ?? null;
  const hymns = stotrams?.filter((item) => !/(?:^|-)mantras?(?:-|$)/.test(item.slug)) ?? null;
  const listTitles = {
    stotrams: te ? 'స్తోత్రాలు' : 'Stotrams',
    mantras: te ? 'మంత్రాలు' : 'Mantras',
    monthly: te ? 'మాసిక పర్వదినాలు' : 'Monthly observances',
    news: te ? 'దేవాలయ వార్తలు' : 'Temple news',
  };
  const listItems = list === 'news' ? news : list === 'mantras' ? mantras : hymns;
  const monthlyEmpty = te ? 'ఈ కాలానికి మాసిక పర్వదినాలు అందుబాటులో లేవు' : 'No monthly observances available for this period';
  const title = (item: Stotram | TempleNews) => te ? item.title_telugu || item.title : item.title;
  const body = reading ? 'text_telugu' in reading ? reading.text_telugu : te ? reading.content_telugu || reading.content : reading.content : '';
  const status = (items: unknown[] | null, failed: boolean, emptyMessage?: string) => !items ? <ActivityIndicator color={colors.maroon} style={styles.status} /> : items.length === 0 ? <Text style={styles.status}>{failed ? (te ? 'విషయాలను లోడ్ చేయలేకపోయాము' : 'Unable to load content') : (emptyMessage ?? (te ? 'ప్రస్తుతం విషయాలు లేవు' : 'No content available'))}</Text> : null;
  const section = (label: string, onPress?: () => void) => <View style={styles.heading}><Text style={styles.headingText}>{label}</Text>{onPress ? <Pressable accessibilityRole="button" accessibilityLabel={`${te ? 'అన్నీ చూడండి' : 'View All'}: ${label}`} onPress={onPress} style={styles.viewAllButton}><Text style={styles.viewAll}>{te ? 'అన్నీ చూడండి' : 'View All'}</Text></Pressable> : null}</View>;
  const stotramRail = (items: Stotram[] | null) => <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
    {items?.slice(0, 8).map((item) => <Pressable key={item.id} accessibilityRole="button" onPress={() => setReading(item)} style={styles.card}><Image source={stotramArtwork(item)} resizeMode="contain" style={styles.image} accessible={false} /><View style={styles.caption}><Text style={styles.cardTitle}>{title(item)}</Text></View></Pressable>)}
  </ScrollView>;

  return <>
    <HomeFeatured panchangam={panchangam} panchangamError={panchangamError} stotrams={hymns} stotramError={errors.stotrams} language={language} onRead={setReading} />
    {section(listTitles.monthly, monthlyFestivals?.length ? () => setList('monthly') : undefined)}
    {status(monthlyFestivals, !!monthlyError, monthlyEmpty)}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
      {monthlyFestivals?.slice(0, 8).map((item) => {
        const date = formatDateParts(item.date);
        return <Pressable key={`${item.key}-${item.date}`} accessibilityRole="button" onPress={() => onSelectFestival(item.date)} style={styles.card}>
          <Image source={festivalArtwork(item)} resizeMode="contain" style={styles.image} accessible={false} />
          <View style={styles.badge}><Text style={styles.badgeDay}>{date.day}</Text><Text style={styles.badgeMonth}>{date.month}</Text></View>
          <View style={styles.caption}><Text style={styles.cardTitle}>{te ? item.name_te || item.name : item.name}</Text></View>
        </Pressable>;
      })}
    </ScrollView>
    {section(te ? 'రాబోయే పండుగలు' : 'Upcoming festivals', onViewFestivals)}
    {status(festivals, !!festivalError)}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
      {festivals?.slice(0, 8).map((item) => {
        const date = formatDateParts(item.date);
        return <Pressable key={`${item.key}-${item.date}`} accessibilityRole="button" onPress={() => onSelectFestival(item.date)} style={styles.card}>
          <Image source={festivalArtwork(item)} resizeMode="contain" style={styles.image} accessible={false} />
          <View style={styles.badge}><Text style={styles.badgeDay}>{date.day}</Text><Text style={styles.badgeMonth}>{date.month}</Text></View>
          <View style={styles.caption}><Text style={styles.cardTitle}>{te ? item.name_te || item.name : item.name}</Text></View>
        </Pressable>;
      })}
    </ScrollView>
    {section(listTitles.stotrams, () => setList('stotrams'))}
    {status(hymns, errors.stotrams)}
    {stotramRail(hymns)}
    {section(listTitles.mantras, () => setList('mantras'))}
    {status(mantras, errors.stotrams)}
    {stotramRail(mantras)}
    {section(te ? 'దేవాలయ వార్తలు' : 'Temple news', () => setList('news'))}
    {status(news, errors.news)}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
      {news?.slice(0, 8).map((item) => <Pressable key={item.id} accessibilityRole="button" onPress={() => setReading(item)} style={styles.card}>
        <Image source={newsArtwork(item)} resizeMode="contain" style={styles.image} accessible={false} />
        {item.event_date && <View style={styles.badge}><Text style={styles.badgeDay}>{formatDateParts(item.event_date).day}</Text><Text style={styles.badgeMonth}>{formatDateParts(item.event_date).month}</Text></View>}
        <View style={styles.caption}><Text style={styles.cardTitle}>{title(item)}</Text></View>
      </Pressable>)}
    </ScrollView>
    <Modal visible={!!list || !!reading} animationType="slide" onRequestClose={() => { setReading(null); setList(null); }}>
      <View style={styles.reader}>
        <View style={[styles.readerHeader, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.readerTitle}>{reading ? title(reading) : list ? listTitles[list] : ''}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={te ? 'మూసివేయండి' : 'Close'} onPress={() => { if (reading) setReading(null); else setList(null); }} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.readerContent}>
          {reading ? <>
            {'text_telugu' in reading && !te && <Text style={styles.note}>Original Telugu text</Text>}
            <Text style={styles.body}>{body}</Text>
            <Pressable accessibilityRole="button" style={styles.share} onPress={() => { Share.share({ message: `${title(reading)}\n\n${body}` }).catch(() => {}); }}><Text style={styles.shareText}>{te ? 'పంచుకోండి' : 'Share'}</Text></Pressable>
          </> : list === 'monthly' ? <>{status(monthlyFestivals, !!monthlyError, monthlyEmpty)}{monthlyFestivals?.map((item) => <Pressable key={`${item.key}-${item.date}`} accessibilityRole="button" onPress={() => { setList(null); onSelectFestival(item.date); }} style={styles.listRow}><Text style={styles.listTitle}>{te ? item.name_te || item.name : item.name}</Text><Text style={styles.note}>{formatDateLong(item.date)}</Text></Pressable>)}</> : <>{status(listItems, list === 'news' ? errors.news : errors.stotrams)}{listItems?.map((item) => <Pressable key={item.id} accessibilityRole="button" onPress={() => setReading(item)} style={styles.listRow}><Text style={styles.listTitle}>{title(item)}</Text>{'event_date' in item && item.event_date && <Text style={styles.note}>{formatDateLong(item.event_date)}</Text>}</Pressable>)}</>}
        </ScrollView>
      </View>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 24, marginBottom: 6 },
  headingText: { flex: 1, color: colors.ink, fontSize: 20, lineHeight: 32, fontWeight: '500' },
  viewAllButton: { minHeight: 44, justifyContent: 'center' },
  viewAll: { color: colors.muted, fontSize: 13, lineHeight: 22 },
  rail: { paddingHorizontal: 16, gap: 10, paddingTop: 6, paddingBottom: 10 },
  card: { width: 106, borderRadius: 5, backgroundColor: colors.peach, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  image: { width: 106, height: 106, backgroundColor: colors.white, borderTopLeftRadius: 5, borderTopRightRadius: 5, overflow: 'hidden' },
  caption: { paddingHorizontal: 8, paddingVertical: 8, minHeight: 52 },
  cardTitle: { color: colors.ink, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  badge: { position: 'absolute', top: 6, right: 6, backgroundColor: colors.white, borderRadius: 3, borderWidth: 1, borderColor: colors.maroon, minWidth: 30, paddingHorizontal: 4, paddingVertical: 2, alignItems: 'center' },
  badgeDay: { color: colors.ink, fontSize: 14, fontWeight: '700', lineHeight: 18 },
  badgeMonth: { color: colors.ink, fontSize: 10, fontWeight: '600', lineHeight: 14 },
  status: { marginHorizontal: 16, marginVertical: 16, color: colors.muted, fontSize: 14, lineHeight: 24 },
  reader: { flex: 1, backgroundColor: colors.white },
  readerHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  readerTitle: { flex: 1, fontSize: 20, lineHeight: 32, fontWeight: '700', color: colors.ink },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: colors.maroon },
  closeText: { color: colors.white, fontSize: 26 },
  readerContent: { padding: 20, paddingBottom: 48 },
  body: { fontSize: 18, lineHeight: 34, color: colors.ink },
  note: { fontSize: 13, lineHeight: 22, color: colors.muted, marginBottom: 12 },
  listRow: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  listTitle: { fontSize: 17, lineHeight: 28, color: colors.ink },
  share: { alignSelf: 'flex-start', minHeight: 44, paddingHorizontal: 20, justifyContent: 'center', backgroundColor: colors.maroon, borderRadius: 22, marginTop: 24 },
  shareText: { color: colors.white, fontSize: 15 },
});
