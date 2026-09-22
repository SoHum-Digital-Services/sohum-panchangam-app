import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { fetchSevas, TEMPLE_BOOKING_URL, type Seva } from '../../src/api/temple';
import { Card } from '../../src/components/Card';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { colors } from '../../src/theme';
import { usePanchangamSettings } from '../../src/settings';

export default function TempleScreen() {
  const { language } = usePanchangamSettings();
  const telugu = language === 'te';
  const [sevas, setSevas] = useState<Seva[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchSevas();
      setSevas(result.filter((s) => s.active_flag));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load temple sevas');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!sevas) load();
    }, [sevas, load]),
  );

  return (
    <View style={styles.screen}>
      <View style={styles.appFrame}>
        <ScreenHeader
          eyebrow={telugu ? 'ఆలయ సేవలు' : 'Temple sevas'}
          title={telugu ? 'చెరువుగట్టు దేవస్థానం' : 'Cheruvugattu Devasthanam'}
          subtitle={telugu ? 'శ్రీ పార్వతీ జడల రామలింగేశ్వర స్వామి దేవస్థానం' : 'Sri Parvathi Jadala Ramalingeshwara Swamy Devasthanam'}
        >
          <Pressable accessibilityRole="link" style={({ pressed }) => [styles.websiteButton, pressed && styles.websiteButtonPressed]} onPress={() => Linking.openURL(TEMPLE_BOOKING_URL)}>
            <Text style={styles.websiteButtonText}>Visit cheruvugattu.online ↗</Text>
          </Pressable>
        </ScreenHeader>

        {error && (
          <Text style={styles.errorText}>
            {error}
            {'\n'}(Native builds work fine — this API blocks the web preview's browser origin by design.)
          </Text>
        )}

        {!sevas && !error ? (
          <ActivityIndicator color={colors.maroon} style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            data={sevas ?? []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.name}>{telugu ? item.name_telugu : item.name_english}</Text>
                  <Text style={styles.price}>₹{item.base_price}</Text>
                </View>
                <Text style={styles.nameSecondary}>{telugu ? item.name_english : item.name_telugu}</Text>
                <Text style={styles.description}>{telugu ? item.description_telugu : item.description}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{item.duration_minutes} {telugu ? 'నిమి' : 'min'}</Text>
                  <Text style={styles.metaText}>{telugu ? `గరిష్టం ${item.max_persons_per_ticket}` : `Max ${item.max_persons_per_ticket}/ticket`}</Text>
                  {item.is_paroksha_available && <Text style={styles.metaText}>{telugu ? 'పరోక్ష సేవ' : 'Paroksha available'}</Text>}
                </View>
                {item.special_instructions ? (
                  <Text style={styles.instructions}>{item.special_instructions}</Text>
                ) : null}
                <Pressable
                  style={styles.bookButton}
                  onPress={() => Linking.openURL(`${TEMPLE_BOOKING_URL}/book/${item.id}`)}
                >
                  <Text style={styles.bookButtonText}>{telugu ? 'cheruvugattu.online లో బుక్ చేయండి' : 'Book on cheruvugattu.online'}</Text>
                </Pressable>
              </Card>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', backgroundColor: colors.creamDeep },
  appFrame: { width: '100%', maxWidth: 430, flex: 1, backgroundColor: colors.cream },
  websiteButton: { alignSelf: 'flex-start', marginTop: 12, minHeight: 44, paddingHorizontal: 12, borderRadius: 12, justifyContent: 'center', backgroundColor: '#ffffff18', borderWidth: 1, borderColor: '#ffffff2e' },
  websiteButtonPressed: { backgroundColor: '#ffffff2b' },
  websiteButtonText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  errorText: { color: colors.maroon, textAlign: 'center', padding: 16 },
  list: { padding: 16, paddingTop: 0, gap: 10, paddingBottom: 28 },
  card: {},
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { color: colors.ink, fontSize: 16, fontWeight: '800', flex: 1, marginRight: 8 },
  price: { color: colors.maroon, fontWeight: '800', fontSize: 14, backgroundColor: colors.maroonSoft, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  nameSecondary: { color: colors.muted, marginTop: 3, fontWeight: '600', fontSize: 13 },
  description: { color: colors.ink, marginTop: 8, fontSize: 13, lineHeight: 18 },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 10, flexWrap: 'wrap' },
  metaText: { color: colors.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  instructions: { color: colors.maroon, fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  bookButton: { marginTop: 12, minHeight: 44, backgroundColor: colors.maroon, borderRadius: 14, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  bookButtonText: { color: colors.white, fontWeight: '800', fontSize: 13 },
});
