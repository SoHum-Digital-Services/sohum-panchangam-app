import { Text, View, ViewStyle } from 'react-native';
import { Card } from './Card';
import { railStyles } from '../rail';

export function DetailCard({ title, lines, style }: { title: string; lines: Array<{ label: string; value: string }>; style?: ViewStyle }) {
  return (
    <Card style={style}>
      <Text style={railStyles.panelTitle}>{title}</Text>
      {lines.map((line) => (
        <View key={line.label} style={railStyles.detailLine}>
          <Text style={railStyles.detailLabel}>{line.label}</Text>
          <Text style={railStyles.detailValue}>{line.value}</Text>
        </View>
      ))}
    </Card>
  );
}
