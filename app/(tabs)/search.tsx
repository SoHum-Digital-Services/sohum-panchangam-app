import { colors } from '../../src/theme';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { fetchStotrams, fetchTempleNews, type Stotram, type TempleNews } from '../../src/api/temple';
import { usePanchangamSettings } from '../../src/settings';

export default function SearchScreen() {
  const { language } = usePanchangamSettings();
  const te = language === 'te';
  const focused = useIsFocused();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [stotrams, setStotrams] = useState<Stotram[] | null>(null);
  const [news, setNews] = useState<TempleNews[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [reading, setReading] = useState<Stotram | TempleNews | null>(null);

  useEffect(() => {
    let active = true;
    fetchStotrams().then((items) => { if (active) setStotrams(items); }).catch(() => {
      if (active) { setStotrams([]); setFailed(true); }
    });
    fetchTempleNews().then((items) => { if (active) setNews(items); }).catch(() => {
      if (active) { setNews([]); setFailed(true); }
    });
    return () => { active = false; };
  }, []);

  const term = query.trim().toLocaleLowerCase();
  const results = term ? [...(stotrams ?? []), ...(news ?? [])].filter((item) => `${item.title} ${item.title_telugu}`.toLocaleLowerCase().includes(term)) : [];
  const loading = stotrams === null || news === null;
  const title = (item: Stotram | TempleNews) => te ? item.title_telugu || item.title : item.title;
  const body = reading ? 'text_telugu' in reading ? reading.text_telugu : te ? reading.content_telugu || reading.content : reading.content : '';

  return <View style={styles.screen}>
    {focused && <StatusBar style="dark" />}
    <View style={[styles.frame, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.heading}>{te ? 'శోధన' : 'Search'}</Text>
      <View style={styles.field}>
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none"><Circle cx={10} cy={10} r={7} stroke={colors.muted} strokeWidth={2} /><Path d="m15 15 6 6" stroke={colors.muted} strokeWidth={2} strokeLinecap="round" /></Svg>
        <TextInput accessibilityLabel={te ? 'విషయాలను వెతకండి' : 'Search content'} placeholder={te ? 'స్తోత్రాలు, మంత్రాలు, వార్తలు వెతకండి' : 'Search stotrams, mantras, news'} placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} autoCorrect={false} autoCapitalize="none" returnKeyType="search" style={styles.input} />
        {query ? <Pressable accessibilityRole="button" accessibilityLabel={te ? 'శోధన తొలగించండి' : 'Clear search'} onPress={() => setQuery('')} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable> : null}
      </View>
      {loading && <ActivityIndicator color={colors.maroon} style={styles.loading} />}
      {failed && <Text style={styles.note}>{te ? 'కొన్ని విషయాలను లోడ్ చేయలేకపోయాము' : 'Some content could not be loaded'}</Text>}
      <FlatList
        data={results}
        keyExtractor={(item) => `${'text_telugu' in item ? 'stotram' : 'news'}-${item.id}`}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListEmptyComponent={<View style={styles.empty}>
          <Svg width={90} height={90} viewBox="0 0 100 100" fill="none"><Circle cx={50} cy={50} r={48} fill={colors.peach} /><Circle cx={43} cy={43} r={19} stroke={colors.maroon} strokeWidth={3} /><Path d="m57 57 20 20" stroke={colors.maroon} strokeWidth={4} strokeLinecap="round" /></Svg>
          <Text style={styles.emptyText}>{term ? loading ? (te ? 'విషయాలను లోడ్ చేస్తున్నాము' : 'Loading content') : (te ? 'ఫలితాలు లేవు' : 'No results found') : (te ? 'తెలుగు లేదా ఆంగ్లంలో విషయాలను వెతకండి' : 'Find content by its Telugu or English title')}</Text>
        </View>}
        renderItem={({ item }) => <Pressable accessibilityRole="button" onPress={() => setReading(item)} style={styles.row}>
          <Text style={styles.resultTitle}>{title(item)}</Text>
          <Text style={styles.note}>{'text_telugu' in item ? (te ? 'స్తోత్రాలు · మంత్రాలు' : 'Stotrams · Mantras') : (te ? 'దేవాలయ వార్తలు' : 'Temple news')}</Text>
        </Pressable>}
      />
    </View>
    <Modal visible={!!reading} animationType="slide" onRequestClose={() => setReading(null)}>
      <View style={[styles.frame, { paddingTop: insets.top + 16 }]}>
        <View style={styles.readerHeader}><Text style={styles.readerTitle}>{reading ? title(reading) : ''}</Text><Pressable accessibilityRole="button" accessibilityLabel={te ? 'మూసివేయండి' : 'Close'} onPress={() => setReading(null)} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable></View>
        <ScrollView contentContainerStyle={styles.readerContent}>
          {reading && 'text_telugu' in reading && !te && <Text style={styles.note}>Original Telugu text</Text>}
          <Text style={styles.body}>{body}</Text>
        </ScrollView>
      </View>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', backgroundColor: colors.white },
  frame: { flex: 1, width: '100%', maxWidth: 430, alignSelf: 'center', backgroundColor: colors.white },
  heading: { fontSize: 24, lineHeight: 36, fontWeight: '600', color: colors.ink, marginHorizontal: 16, marginBottom: 16 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, paddingLeft: 12, paddingRight: 4, minHeight: 52, borderRadius: 12, backgroundColor: colors.field },
  input: { flex: 1, minWidth: 0, paddingVertical: 14, color: colors.ink, fontSize: 15 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 26, color: colors.maroon },
  loading: { marginTop: 16 },
  list: { padding: 16, paddingBottom: 32 },
  empty: { alignItems: 'center', paddingVertical: 64, gap: 20 },
  emptyText: { color: colors.muted, textAlign: 'center', fontSize: 15, lineHeight: 26 },
  row: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  resultTitle: { color: colors.ink, fontSize: 17, lineHeight: 28 },
  note: { color: colors.muted, fontSize: 13, lineHeight: 22, paddingHorizontal: 16 },
  readerHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  readerTitle: { flex: 1, color: colors.ink, fontSize: 20, fontWeight: '600', lineHeight: 32 },
  readerContent: { padding: 20, paddingBottom: 48 },
  body: { color: colors.ink, fontSize: 18, lineHeight: 34 },
});
