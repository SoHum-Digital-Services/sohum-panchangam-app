import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../src/components/Card';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { colors } from '../../src/theme';
import { usePanchangamSettings } from '../../src/settings';

export default function MoreScreen() {
  const { language } = usePanchangamSettings();
  const telugu = language === 'te';
  return (
    <View style={styles.screen}>
      <ScrollView style={styles.appFrame} contentContainerStyle={styles.scrollContent}>
        <ScreenHeader
          eyebrow="SoHum Jyotisha"
          title={telugu ? 'మరిన్ని సేవలు' : 'More services'}
          subtitle={telugu ? 'జాతకాలు, దశలు, వివాహ పొంతన, ముహూర్తాలు' : 'Birth charts, daśā, marriage matching and muhurthams'}
        />

        <View style={styles.content}>
          <FeatureCard
            icon="☌"
            title={telugu ? 'జాతకం' : 'Horoscope'}
            description={telugu ? 'D1, విభాగ చార్టులు, విమ్శోత్తరి, యోగిని మరియు చర దశలు.' : 'D1, divisional charts, Vimshottari, Yogini and Chara daśā.'}
            action={telugu ? 'జాతకం చూడండి' : 'Open horoscope'}
            onPress={() => router.push('/horoscope')}
          />
          <FeatureCard
            icon="∞"
            title={telugu ? 'వివాహ పొంతన' : 'Marriage compatibility'}
            description={telugu ? 'ఎనిమిది కూటలతో అష్టకూట / గుణ మిలన్ మరియు దోష ఫ్లాగ్‌లు.' : 'Aṣṭakoota / Guna Milan with all eight kootas and dosha flags.'}
            action={telugu ? 'పొంతన చూడండి' : 'Check compatibility'}
            onPress={() => router.push('/compatibility')}
          />
          <FeatureCard
            icon="✦"
            title={telugu ? 'శిశు జనన దోషం' : 'Gandamool check'}
            description={telugu ? 'గండమూల స్థితి, జనన నక్షత్రం మరియు సాంప్రదాయ పరిహారాలు.' : 'Gandamool status, birth nakshatra and traditional remedy guidance.'}
            action={telugu ? 'గండమూలం చూడండి' : 'Check Gandamool'}
            onPress={() => router.push({ pathname: '/horoscope', params: { mode: 'doshas' } })}
          />
          <FeatureCard
            icon="✧"
            title={telugu ? 'ముహూర్త గణన' : 'Muhurtham calculator'}
            description={telugu ? 'మీ ప్రదేశానికి, మీరు ఎంచుకున్న తేదీల మధ్య శ్రేణీకృత వివాహ ముహూర్తాలు.' : 'Graded vivaha muhurthams for your place, between the dates you choose.'}
            action={telugu ? 'ముహూర్తాలు చూడండి' : 'Find muhurthams'}
            onPress={() => router.push('/muhurtham')}
          />
          <Card style={styles.noteCard}>
            <Text style={styles.noteTitle}>{telugu ? 'మీ ధృవీకరించిన ఇంజిన్‌పై నిర్మించబడింది' : 'Built on your verified engine'}</Text>
            <Text style={styles.noteText}>{telugu ? 'ఈ సేవలు నేటివ్ యాప్ పేజీలుగా పనిచేస్తాయి. నమోదు చేసిన జనన వివరాలు మీ కాలిక్యులేషన్ API కి మాత్రమే పంపబడతాయి.' : 'These services run as native app pages. Entered birth details are sent only to your calculation API.'}</Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

function FeatureCard({ icon, title, description, action, onPress }: { icon: string; title: string; description: string; action: string; onPress: () => void }) {
  return (
    <Card style={styles.featureCard}>
      <View style={styles.featureTop}>
        <View style={styles.iconBadge}><Text style={styles.icon}>{icon}</Text></View>
        <Text style={styles.featureTitle}>{title}</Text>
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
  scrollContent: { paddingBottom: 24 },
  content: { paddingHorizontal: 16, gap: 10 },
  featureCard: { padding: 14 },
  featureTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBadge: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.maroonSoft },
  icon: { color: colors.maroon, fontSize: 21, fontWeight: '800' },
  featureTitle: { flex: 1, color: colors.ink, fontSize: 18, fontWeight: '800' },
  featureDescription: { color: colors.ink, fontSize: 13, lineHeight: 19, marginTop: 12 },
  action: { alignItems: 'center', backgroundColor: colors.maroon, borderRadius: 12, minHeight: 44, justifyContent: 'center', marginTop: 12 },
  actionPressed: { opacity: 0.78 },
  actionText: { color: colors.white, fontSize: 13, fontWeight: '800' },
  noteCard: { backgroundColor: colors.peach, borderColor: '#ffd7b8' },
  noteTitle: { color: colors.maroon, fontSize: 14, fontWeight: '800' },
  noteText: { color: colors.ink, fontSize: 12, lineHeight: 18, marginTop: 5 },
});
