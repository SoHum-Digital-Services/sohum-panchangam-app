import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { BirthDetails } from '../api/jyotisha';
import { colors } from '../theme';

export const HYDERABAD_BIRTH_DETAILS: BirthDetails = { name: '', birth_date: '', birth_time: '', latitude: '17.385', longitude: '78.4867' };

export function BirthDetailsFields({ details, onChange, title }: { details: BirthDetails; onChange: (next: BirthDetails) => void; title?: string }) {
  const field = (key: keyof BirthDetails, label: string, placeholder: string, numeric = false) => (
    <View style={styles.field} key={key}>
      <Text style={styles.label}>{label}</Text>
      <TextInput value={details[key]} onChangeText={(value) => onChange({ ...details, [key]: value })} placeholder={placeholder} placeholderTextColor="#ab9989" keyboardType={numeric ? 'decimal-pad' : 'default'} style={styles.input} />
    </View>
  );
  return <View style={styles.wrap}>{title && <Text style={styles.title}>{title}</Text>}{field('name', 'Name (optional)', 'Name')}{field('birth_date', 'Date of birth', 'YYYY-MM-DD')}{field('birth_time', 'Exact birth time', 'HH:MM or HH:MM:SS')}{field('latitude', 'Latitude', '17.385', true)}{field('longitude', 'Longitude', '78.4867', true)}<Text style={styles.hint}>Timezone: Asia/Kolkata</Text></View>;
}

const styles = StyleSheet.create({
  wrap: { gap: 9 }, title: { color: colors.ink, fontSize: 16, fontWeight: '800', marginBottom: 1 }, field: { gap: 4 }, label: { color: colors.muted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.25 }, input: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: 12, color: colors.ink, fontSize: 15 }, hint: { color: colors.muted, fontSize: 11, marginTop: 1 },
});
