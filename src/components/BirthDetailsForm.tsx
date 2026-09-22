import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { BirthDetails } from '../api/jyotisha';
import type { Place } from '../api/places';
import { colors } from '../theme';
import { DateInput } from './DateInput';
import { PlaceInput } from './PlaceInput';
import { TimeInput } from './TimeInput';

export const HYDERABAD_BIRTH_DETAILS: BirthDetails = {
  name: '',
  birth_date: '',
  birth_time: '',
  latitude: '17.385',
  longitude: '78.4867',
  place_label: 'Hyderabad, Telangana, India',
};

export function BirthDetailsFields({ details, onChange, title }: { details: BirthDetails; onChange: (next: BirthDetails) => void; title?: string }) {
  return (
    <View style={styles.wrap}>
      {title && <Text style={styles.title}>{title}</Text>}

      <View style={styles.field}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          value={details.name}
          onChangeText={(value) => onChange({ ...details, name: value })}
          placeholder="Name"
          placeholderTextColor="#ab9989"
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Date of birth</Text>
        <DateInput value={details.birth_date} onChange={(birth_date) => onChange({ ...details, birth_date })} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Exact birth time</Text>
        <TimeInput value={details.birth_time} onChange={(birth_time) => onChange({ ...details, birth_time })} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Place of birth</Text>
        <PlaceInput
          initialLabel={details.place_label}
          onSelect={(place: Place) =>
            onChange({ ...details, place_label: place.label, latitude: String(place.latitude), longitude: String(place.longitude) })
          }
        />
      </View>

      <Text style={styles.hint}>Timezone: Asia/Kolkata</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 9 },
  title: { color: colors.ink, fontSize: 16, fontWeight: '800', marginBottom: 1 },
  field: { gap: 4 },
  label: { color: colors.muted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.25 },
  input: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: 12, color: colors.ink, fontSize: 15 },
  hint: { color: colors.muted, fontSize: 11, marginTop: 1 },
});
