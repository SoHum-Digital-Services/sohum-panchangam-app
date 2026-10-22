import { StyleSheet, View, ViewProps } from 'react-native';
import { colors } from '../theme';

export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  },
});
