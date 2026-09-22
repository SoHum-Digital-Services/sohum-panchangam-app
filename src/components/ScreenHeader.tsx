import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

// One header shell for every tab: a maroon card with an eyebrow label, a
// title, and an optional subtitle. Screen-specific controls (date nav,
// month arrows, a link button) go in `children`, rendered below the text.
export function ScreenHeader({ eyebrow, title, subtitle, children }: { eyebrow: string; title?: string; subtitle?: string; children?: ReactNode }) {
  return (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    margin: 16,
    marginTop: 48,
    borderRadius: 20,
    backgroundColor: colors.maroon,
    padding: 16,
    shadowColor: colors.maroon,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 3,
  },
  eyebrow: { color: colors.gold, fontWeight: '800', fontSize: 11, letterSpacing: 0.4, textTransform: 'uppercase' },
  title: { color: colors.white, fontSize: 24, fontWeight: '800', marginTop: 4 },
  subtitle: { color: '#ffe7d8', fontSize: 12, lineHeight: 17, fontWeight: '600', marginTop: 4 },
});
