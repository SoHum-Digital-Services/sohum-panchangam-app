import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { fetchSevas, TEMPLE_BOOKING_URL, type Seva } from '../../src/api/temple';
import { Card } from '../../src/components/Card';
import { colors } from '../../src/theme';

export default function TempleScreen() {
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
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Temple sevas</Text>
          <Text style={styles.title}>చెరువుగట్టు దేవస్థానం</Text>
          <Text style={styles.subtitle}>Sri Parvathi Jadala Ramalingeshwara Swamy Devasthanam</Text>
        </View>

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
                  <Text style={styles.name}>{item.name_english}</Text>
                  <Text style={styles.price}>₹{item.base_price}</Text>
                </View>
                <Text style={styles.nameTelugu}>{item.name_telugu}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{item.duration_minutes} min</Text>
                  <Text style={styles.metaText}>Max {item.max_persons_per_ticket}/ticket</Text>
                  {item.is_paroksha_available && <Text style={styles.metaText}>Paroksha available</Text>}
                </View>
                {item.special_instructions ? (
                  <Text style={styles.instructions}>{item.special_instructions}</Text>
                ) : null}
                <Pressable
                  style={styles.bookButton}
                  onPress={() => Linking.openURL(`${TEMPLE_BOOKING_URL}/book/${item.id}`)}
                >
                  <Text style={styles.bookButtonText}>Book on cheruvugattu.online</Text>
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
  header: { margin: 16, marginTop: 56, borderRadius: 28, backgroundColor: colors.maroon, padding: 20, shadowColor: colors.maroon, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 4 },
  eyebrow: { color: colors.gold, fontWeight: '900', fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase' },
  title: { fontSize: 25, fontWeight: '900', color: colors.white, marginTop: 6, lineHeight: 31 },
  subtitle: { color: '#ffe7d8', marginTop: 6, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  errorText: { color: colors.maroon, textAlign: 'center', padding: 16 },
  list: { padding: 16, paddingTop: 0, gap: 12, paddingBottom: 32 },
  card: {},
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { color: colors.ink, fontSize: 17, fontWeight: '900', flex: 1, marginRight: 8 },
  price: { color: colors.maroon, fontWeight: '900', fontSize: 16, backgroundColor: colors.maroonSoft, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  nameTelugu: { color: colors.muted, marginTop: 3, fontWeight: '700' },
  description: { color: colors.ink, marginTop: 8, fontSize: 13, lineHeight: 18 },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 10, flexWrap: 'wrap' },
  metaText: { color: colors.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  instructions: { color: colors.maroon, fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  bookButton: { marginTop: 14, backgroundColor: colors.maroon, borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
  bookButtonText: { color: colors.white, fontWeight: '900', fontSize: 13 },
});
