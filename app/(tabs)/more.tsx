import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../src/components/Card';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { colors } from '../../src/theme';
import { usePanchangamSettings } from '../../src/settings';
import { useAuth } from '../../src/auth';

export default function MoreScreen() {
  const { language } = usePanchangamSettings();
  const telugu = language === 'te';
  return (
    <View style={styles.screen}>
      <View style={styles.appFrame}>
        <ScreenHeader
          eyebrow="SoHum Jyotisha"
          title={telugu ? 'మరిన్ని సేవలు' : 'More services'}
          subtitle={telugu ? 'జాతకాలు, దశలు, వివాహ పొంతన' : 'Birth charts, daśā and marriage matching'}
        />

        <View style={styles.content}>
          <AccountCard telugu={telugu} />
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
          <Card style={styles.noteCard}>
            <Text style={styles.noteTitle}>{telugu ? 'మీ ధృవీకరించిన ఇంజిన్‌పై నిర్మించబడింది' : 'Built on your verified engine'}</Text>
            <Text style={styles.noteText}>{telugu ? 'ఈ సేవలు నేటివ్ యాప్ పేజీలుగా పనిచేస్తాయి. నమోదు చేసిన జనన వివరాలు మీ కాలిక్యులేషన్ API కి మాత్రమే పంపబడతాయి.' : 'These services run as native app pages. Entered birth details are sent only to your calculation API.'}</Text>
          </Card>
        </View>
      </View>
    </View>
  );
}

function AccountCard({ telugu }: { telugu: boolean }) {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) return null;

  return (
    <Card style={styles.accountCard}>
      {user ? (
        <View style={styles.accountRow}>
          <Text style={styles.accountText} numberOfLines={1}>
            {telugu ? 'సైన్ ఇన్ అయ్యారు: ' : 'Signed in as '}
            {user.email ?? user.user_metadata?.full_name ?? (telugu ? 'మీరు' : 'you')}
          </Text>
          <Pressable accessibilityRole="button" onPress={signOut}>
            <Text style={styles.accountLink}>{telugu ? 'సైన్ అవుట్' : 'Sign out'}</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={styles.accountText}>
            {telugu
              ? 'ChantTracker, GatiVani వంటి SoHum యాప్‌లలో ఉపయోగించే అదే ఖాతాతో సైన్ ఇన్ చేయండి (ఐచ్ఛికం).'
              : 'Sign in with the same account you use across SoHum apps like ChantTracker and GatiVani (optional).'}
          </Text>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.accountAction, pressed && styles.actionPressed]}
            onPress={signInWithGoogle}
          >
            <Text style={styles.actionText}>{telugu ? 'Google తో కొనసాగండి' : 'Continue with Google'}</Text>
          </Pressable>
        </>
      )}
    </Card>
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
  content: { paddingHorizontal: 16, gap: 10 },
  accountCard: { padding: 14 },
  accountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  accountText: { flex: 1, color: colors.ink, fontSize: 13, lineHeight: 18 },
  accountLink: { color: colors.maroon, fontSize: 13, fontWeight: '800' },
  accountAction: { alignItems: 'center', backgroundColor: colors.maroon, borderRadius: 12, minHeight: 44, justifyContent: 'center', marginTop: 10 },
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
