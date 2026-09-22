import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  description: { fontSize: 14, color: colors.muted, textAlign: 'center' },
});
