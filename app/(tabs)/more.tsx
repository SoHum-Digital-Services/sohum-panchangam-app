import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../src/components/Card';
import { colors } from '../../src/theme';

export default function MoreScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.appFrame}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>SoHum Jyotisha</Text>
          <Text style={styles.title}>మరిన్ని సేవలు</Text>
          <Text style={styles.subtitle}>Birth charts, daśā and marriage matching</Text>
        </View>

        <View style={styles.content}>
          <FeatureCard
            icon="☌"
            title="జాతకం"
            subtitle="Horoscope"
            description="D1, divisional charts, Vimshottari, Yogini and Chara daśā."
            action="Open horoscope"
            onPress={() => router.push('/horoscope')}
          />
          <FeatureCard
            icon="∞"
            title="వివాహ పొంతన"
            subtitle="Marriage compatibility"
            description="Aṣṭakoota / Guna Milan with all eight kootas and dosha flags."
            action="Check compatibility"
            onPress={() => router.push('/compatibility')}
          />
          <FeatureCard icon="✦" title="శిశు జనన దోషం" subtitle="Gandamool / birth nakshatra" description="Gandamool status, birth nakshatra and traditional remedy guidance." action="Check Gandamool" onPress={() => router.push({ pathname: '/horoscope', params: { mode: 'doshas' } })} />
          <Card style={styles.noteCard}>
            <Text style={styles.noteTitle}>Built on your verified engine</Text>
            <Text style={styles.noteText}>These services run as native app pages. Entered birth details are sent only to your calculation API.</Text>
          </Card>
        </View>
      </View>
    </View>
  );
}

function FeatureCard({ icon, title, subtitle, description, action, onPress }: { icon: string; title: string; subtitle: string; description: string; action: string; onPress: () => void }) {
  return (
    <Card style={styles.featureCard}>
      <View style={styles.featureTop}>
        <View style={styles.iconBadge}><Text style={styles.icon}>{icon}</Text></View>
        <View style={styles.featureCopy}>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <Text style={styles.featureDescription}>{description}</Text>
      <Pressable accessibilityRole="button" style={({ pressed }) => [styles.action, pressed && styles.actionPressed]} onPress={onPress}>
        <Text style={styles.actionText}>{action} →</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', backgroundColor: colors.creamDeep },
  appFrame: { width: '100%', maxWidth: 430, flex: 1, backgroundColor: colors.cream },
  header: { margin: 16, marginTop: 48, borderRadius: 20, backgroundColor: colors.maroon, padding: 16 },
  eyebrow: { color: colors.gold, fontWeight: '800', fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase' },
  title: { color: colors.white, fontSize: 23, lineHeight: 29, fontWeight: '800', marginTop: 4 },
  subtitle: { color: '#ffe7d8', fontSize: 12, lineHeight: 17, fontWeight: '600', marginTop: 4 },
  content: { paddingHorizontal: 16, gap: 10 },
  featureCard: { padding: 14 },
  featureTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBadge: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.maroonSoft },
  icon: { color: colors.maroon, fontSize: 21, fontWeight: '800' },
  featureCopy: { flex: 1 },
  featureTitle: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  featureSubtitle: { color: colors.muted, fontSize: 12, fontWeight: '700', marginTop: 1 },
  featureDescription: { color: colors.ink, fontSize: 13, lineHeight: 19, marginTop: 12 },
  action: { alignItems: 'center', backgroundColor: colors.maroon, borderRadius: 12, minHeight: 44, justifyContent: 'center', marginTop: 12 },
  actionPressed: { opacity: 0.78 },
  actionText: { color: colors.white, fontSize: 13, fontWeight: '800' },
  noteCard: { backgroundColor: colors.peach, borderColor: '#ffd7b8' },
  noteTitle: { color: colors.maroon, fontSize: 14, fontWeight: '800' },
  noteText: { color: colors.ink, fontSize: 12, lineHeight: 18, marginTop: 5 },
});
