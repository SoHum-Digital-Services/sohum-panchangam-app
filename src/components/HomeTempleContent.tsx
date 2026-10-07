import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchStotrams, fetchTempleNews, fetchTemplePhotos, templeImageUrl, type Stotram, type TempleNews, type TemplePhoto } from '../api/temple';
import type { FestivalItem } from '../api/types';
import { formatDateLong, formatDateParts } from '../format';
import type { AppLanguage } from '../settings';
import { HomeFeatured } from './HomeFeatured';
import { newsArtwork, stotramArtwork } from '../homeArtwork';

export function HomeTempleContent({ language, festivals, festivalError, onSelectFestival, onViewFestivals }: {
  language: AppLanguage;
  festivals: FestivalItem[] | null;
  festivalError?: string | null;
  onSelectFestival: (date: string) => void;
  onViewFestivals: () => void;
}) {
  const te = language === 'te';
  const insets = useSafeAreaInsets();
  const [stotrams, setStotrams] = useState<Stotram[] | null>(null);
  const [news, setNews] = useState<TempleNews[] | null>(null);
  const [photos, setPhotos] = useState<TemplePhoto[]>([]);
  const [errors, setErrors] = useState({ stotrams: false, news: false });
  const [list, setList] = useState<'stotrams' | 'news' | null>(null);
  const [reading, setReading] = useState<Stotram | TempleNews | null>(null);
  useEffect(() => {
    let active = true;
    fetchStotrams().then((items) => { if (active) setStotrams(items); }).catch(() => {
      if (active) { setStotrams([]); setErrors((current) => ({ ...current, stotrams: true })); }
    });
    fetchTempleNews().then((items) => { if (active) setNews(items); }).catch(() => {
      if (active) { setNews([]); setErrors((current) => ({ ...current, news: true })); }
    });
    fetchTemplePhotos().then((items) => { if (active) setPhotos(items.filter((item) => item.media_type === 'PHOTO')); }).catch(() => {});
    return () => { active = false; };
  }, []);
  // A temple establishing photo decorates festival cards; it is not an event attribution.
  const photo = photos.find((item) => item.category === 'Temple' && /temple/i.test(item.title)) ?? photos[0];
  const title = (item: Stotram | TempleNews) => te ? item.title_telugu || item.title : item.title;
  const body = reading ? 'text_telugu' in reading ? reading.text_telugu : te ? reading.content_telugu || reading.content : reading.content : '';
  const status = (items: unknown[] | null, failed: boolean) => !items ? <ActivityIndicator color="#f15a06" style={styles.status} /> : items.length === 0 ? <Text style={styles.status}>{failed ? (te ? 'విషయాలను లోడ్ చేయలేకపోయాము' : 'Unable to load content') : (te ? 'ప్రస్తుతం విషయాలు లేవు' : 'No content available')}</Text> : null;
  const festivalImage = <View style={styles.image}>{photo && <Image source={{ uri: templeImageUrl(photo.image_url) }} style={styles.image} accessibilityLabel={photo.title} />}</View>;
  const section = (label: string, onPress: () => void) => <View style={styles.heading}><Text style={styles.headingText}>{label}</Text><Pressable accessibilityRole="button" accessibilityLabel={`${te ? 'అన్నీ చూడండి' : 'View All'}: ${label}`} onPress={onPress} style={styles.viewAllButton}><Text style={styles.viewAll}>{te ? 'అన్నీ చూడండి' : 'View All'}</Text></Pressable></View>;

  return <>
    {stotrams?.length ? <HomeFeatured stotrams={stotrams} language={language} onRead={setReading} /> : status(stotrams, errors.stotrams)}
    {section(te ? 'రాబోయే పండుగలు' : 'Upcoming festivals', onViewFestivals)}
    {status(festivals, !!festivalError)}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
      {festivals?.slice(0, 8).map((item) => {
        const date = formatDateParts(item.date);
        return <Pressable key={`${item.key}-${item.date}`} accessibilityRole="button" onPress={() => onSelectFestival(item.date)} style={styles.card}>
          {festivalImage}
          <View style={styles.badge}><Text style={styles.badgeDay}>{date.day}</Text><Text style={styles.badgeMonth}>{date.month}</Text></View>
          <View style={styles.caption}><Text style={styles.cardTitle}>{te ? item.name_te || item.name : item.name}</Text></View>
        </Pressable>;
      })}
    </ScrollView>
    {section(te ? 'స్తోత్రాలు' : 'Stotrams', () => setList('stotrams'))}
    {status(stotrams, errors.stotrams)}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
      {stotrams?.slice(0, 8).map((item) => <Pressable key={item.id} accessibilityRole="button" onPress={() => setReading(item)} style={styles.card}><Image source={stotramArtwork(item)} style={styles.image} accessible={false} /><View style={styles.caption}><Text style={styles.cardTitle}>{title(item)}</Text></View></Pressable>)}
    </ScrollView>
    {section(te ? 'దేవాలయ వార్తలు' : 'Temple news', () => setList('news'))}
    {status(news, errors.news)}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
      {news?.slice(0, 8).map((item) => <Pressable key={item.id} accessibilityRole="button" onPress={() => setReading(item)} style={styles.card}>
        <Image source={newsArtwork(item)} style={styles.image} accessible={false} />
        {item.event_date && <View style={styles.badge}><Text style={styles.badgeDay}>{formatDateParts(item.event_date).day}</Text><Text style={styles.badgeMonth}>{formatDateParts(item.event_date).month}</Text></View>}
        <View style={styles.caption}><Text style={styles.cardTitle}>{title(item)}</Text></View>
      </Pressable>)}
    </ScrollView>
    <Modal visible={!!list || !!reading} animationType="slide" onRequestClose={() => { setReading(null); setList(null); }}>
      <View style={styles.reader}>
        <View style={[styles.readerHeader, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.readerTitle}>{reading ? title(reading) : list === 'stotrams' ? (te ? 'స్తోత్రాలు' : 'Stotrams') : (te ? 'దేవాలయ వార్తలు' : 'Temple news')}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={te ? 'మూసివేయండి' : 'Close'} onPress={() => { if (reading) setReading(null); else setList(null); }} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.readerContent}>
          {reading ? <>
            {'text_telugu' in reading && !te && <Text style={styles.note}>Original Telugu text</Text>}
            <Text style={styles.body}>{body}</Text>
            <Pressable accessibilityRole="button" style={styles.share} onPress={() => { Share.share({ message: `${title(reading)}\n\n${body}` }).catch(() => {}); }}><Text style={styles.shareText}>{te ? 'పంచుకోండి' : 'Share'}</Text></Pressable>
          </> : <>{status(list === 'stotrams' ? stotrams : news, list === 'stotrams' ? errors.stotrams : errors.news)}{(list === 'stotrams' ? stotrams : news)?.map((item) => <Pressable key={item.id} accessibilityRole="button" onPress={() => setReading(item)} style={styles.listRow}><Text style={styles.listTitle}>{title(item)}</Text>{'event_date' in item && item.event_date && <Text style={styles.note}>{formatDateLong(item.event_date)}</Text>}</Pressable>)}</>}
        </ScrollView>
      </View>
    </Modal>
  </>;
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 16, marginBottom: 6 },
  headingText: { flex: 1, color: '#141c26', fontSize: 20, lineHeight: 32, fontWeight: '600' },
  viewAllButton: { minHeight: 44, justifyContent: 'center' },
  viewAll: { color: '#8b8b8b', fontSize: 13, lineHeight: 22 },
  rail: { paddingHorizontal: 16, gap: 8, paddingTop: 6, paddingBottom: 10 },
  card: { width: 116, borderRadius: 5, backgroundColor: '#fbf5e9', shadowColor: '#18202a', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  image: { width: 116, height: 100, backgroundColor: '#eee', borderTopLeftRadius: 5, borderTopRightRadius: 5, overflow: 'hidden' },
  caption: { paddingHorizontal: 8, paddingVertical: 8, minHeight: 54 },
  cardTitle: { color: '#141c26', fontSize: 13, lineHeight: 20, textAlign: 'center' },
  badge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#fff', borderRadius: 3, borderWidth: 1, borderColor: '#f15a06', minWidth: 30, paddingHorizontal: 4, paddingVertical: 2, alignItems: 'center' },
  badgeDay: { color: '#141c26', fontSize: 14, fontWeight: '700', lineHeight: 18 },
  badgeMonth: { color: '#141c26', fontSize: 10, fontWeight: '600', lineHeight: 14 },
  status: { marginHorizontal: 16, marginVertical: 16, color: '#747474', fontSize: 14, lineHeight: 24 },
  reader: { flex: 1, backgroundColor: '#fff' },
  readerHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  readerTitle: { flex: 1, fontSize: 20, lineHeight: 32, fontWeight: '700', color: '#141c26' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: '#f15a06' },
  closeText: { color: '#fff', fontSize: 26 },
  readerContent: { padding: 20, paddingBottom: 48 },
  body: { fontSize: 18, lineHeight: 34, color: '#141c26' },
  note: { fontSize: 13, lineHeight: 22, color: '#747474', marginBottom: 12 },
  listRow: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  listTitle: { fontSize: 17, lineHeight: 28, color: '#141c26' },
  share: { alignSelf: 'flex-start', minHeight: 44, paddingHorizontal: 20, justifyContent: 'center', backgroundColor: '#f15a06', borderRadius: 22, marginTop: 24 },
  shareText: { color: '#fff', fontSize: 15 },
});
