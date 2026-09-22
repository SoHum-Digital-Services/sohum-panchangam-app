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
    borderRadius: 16,
    padding: 16,
  },
});
