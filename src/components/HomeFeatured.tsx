import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { Stotram } from '../api/temple';
import type { AppLanguage } from '../settings';

function firstShloka(text: string): string {
  const paragraphs = text.trim().split(/\n\s*\n/);
  return paragraphs.find((paragraph) => paragraph.includes('॥')) ?? paragraphs[0] ?? '';
}

export function HomeFeatured({ stotrams, language, onRead }: { stotrams: Stotram[]; language: AppLanguage; onRead: (stotram: Stotram) => void }) {
  const te = language === 'te';
  const { width: screenWidth } = useWindowDimensions();
  const width = Math.min(screenWidth, 430) - 32;
  const [page, setPage] = useState(0);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const featured = stotrams.slice(0, 3);
  const current = featured[Math.min(page, featured.length - 1)];
  if (!current) return null;

  return (
    <View style={styles.card}>
      <Text pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no" style={styles.quote}>“</Text>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pages}
        style={{ height: heights[current.id] ?? 210 }}
        onScroll={(event) => setPage(Math.max(0, Math.min(featured.length - 1, Math.round(event.nativeEvent.contentOffset.x / width))))}
        scrollEventThrottle={16}
      >
        {featured.map((item) => (
          <View key={item.id} style={[styles.page, { width }]} onLayout={(event) => {
            const height = event.nativeEvent.layout.height;
            setHeights((current) => current[item.id] === height ? current : { ...current, [item.id]: height });
          }}>
            <Text style={styles.title}>{te ? item.title_telugu || item.title : item.title}</Text>
            <Text style={styles.sankalpam}>{firstShloka(item.text_telugu)}</Text>
            <View style={styles.divider} />
            <Pressable accessibilityRole="button" onPress={() => onRead(item)} style={styles.readButton}>
              <Text style={styles.readText}>{te ? 'పూర్తిగా చదవండి' : 'Read full stotram'}</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        {featured.map((item, index) => <View key={item.id} style={[styles.dot, index === page && styles.dotActive]} />)}
      </View>
      <Text pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no" style={styles.quoteEnd}>”</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={te ? 'పంచుకోండి' : 'Share'} onPress={() => {
        Share.share({ message: `${te ? current.title_telugu || current.title : current.title}\n\n${firstShloka(current.text_telugu)}` }).catch(() => {});
      }} style={({ pressed }) => [styles.share, pressed && styles.pressed]}>
        <Svg width={19} height={19} viewBox="0 0 24 24" fill="none">
          <Path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M7 10H5.5A1.5 1.5 0 0 0 4 11.5v8A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5v-8a1.5 1.5 0 0 0-1.5-1.5H17" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 12, marginBottom: 12, backgroundColor: '#fff', borderRadius: 16, shadowColor: '#18202a', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.09, shadowRadius: 12, elevation: 3 },
  pages: { alignItems: 'flex-start' },
  page: { paddingTop: 14, paddingHorizontal: 16, paddingBottom: 2 },
  title: { paddingHorizontal: 30, textAlign: 'center', color: '#141c26', fontSize: 18, fontWeight: '600', lineHeight: 26, marginBottom: 8 },
  divider: { height: 2, width: 130, alignSelf: 'center', backgroundColor: '#f15a06', marginVertical: 8 },
  readButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  readText: { color: '#f15a06', fontSize: 13, lineHeight: 22 },
  sankalpam: { color: '#141c26', fontSize: 15, lineHeight: 25, textAlign: 'center' },
  quote: { position: 'absolute', top: 0, left: 8, fontSize: 78, color: '#fbe6dc', lineHeight: 90 },
  quoteEnd: { position: 'absolute', bottom: -16, right: 8, fontSize: 78, color: '#fbe6dc', lineHeight: 90 },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 7, paddingVertical: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#bcbcbc' },
  dotActive: { backgroundColor: '#f15a06' },
  share: { position: 'absolute', right: 12, top: 12, width: 34, height: 34, borderRadius: 17, backgroundColor: '#f15a06', alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
});
