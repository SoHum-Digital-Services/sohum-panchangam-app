import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';

// Indian DD/MM/YYYY entry as three boxes that auto-advance -- type 2 digits
// for day, focus jumps to month; 2 digits for month, focus jumps to year.
// Backspace on an empty box jumps back to the previous one. `onChange`
// fires with an ISO YYYY-MM-DD string once all three parts are present
// (API/internal format stays ISO regardless of how it's entered).
export function DateInput({ value, onChange }: { value: string; onChange: (isoDate: string) => void }) {
  const [year, month, day] = value ? value.split('-') : ['', '', ''];
  const [d, setD] = useState(day ?? '');
  const [m, setM] = useState(month ?? '');
  const [y, setY] = useState(year ?? '');
  const dayRef = useRef<TextInput>(null);
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  const emit = (nextD: string, nextM: string, nextY: string) => {
    if (nextD.length === 2 && nextM.length === 2 && nextY.length === 4) {
      onChange(`${nextY}-${nextM}-${nextD}`);
    } else {
      onChange('');
    }
  };

  return (
    <View style={styles.row}>
      <TextInput
        ref={dayRef}
        value={d}
        onChangeText={(text) => {
          let digits = text.replace(/\D/g, '').slice(0, 2);
          if (digits.length === 2) {
            const n = Number(digits);
            if (n < 1) digits = '01';
            else if (n > 31) digits = '31';
          }
          setD(digits);
          emit(digits, m, y);
          if (digits.length === 2) monthRef.current?.focus();
        }}
        placeholder="DD"
        placeholderTextColor="#ab9989"
        keyboardType="number-pad"
        maxLength={2}
        style={[styles.box, styles.boxSmall]}
      />
      <Text style={styles.sep}>/</Text>
      <TextInput
        ref={monthRef}
        value={m}
        onChangeText={(text) => {
          let digits = text.replace(/\D/g, '').slice(0, 2);
          if (digits.length === 2) {
            const n = Number(digits);
            if (n < 1) digits = '01';
            else if (n > 12) digits = '12';
          }
          setM(digits);
          emit(d, digits, y);
          if (digits.length === 2) yearRef.current?.focus();
        }}
        onKeyPress={(e) => {
          if (e.nativeEvent.key === 'Backspace' && m.length === 0) dayRef.current?.focus();
        }}
        placeholder="MM"
        placeholderTextColor="#ab9989"
        keyboardType="number-pad"
        maxLength={2}
        style={[styles.box, styles.boxSmall]}
      />
      <Text style={styles.sep}>/</Text>
      <TextInput
        ref={yearRef}
        value={y}
        onChangeText={(text) => {
          const digits = text.replace(/\D/g, '').slice(0, 4);
          setY(digits);
          emit(d, m, digits);
        }}
        onKeyPress={(e) => {
          if (e.nativeEvent.key === 'Backspace' && y.length === 0) monthRef.current?.focus();
        }}
        placeholder="YYYY"
        placeholderTextColor="#ab9989"
        keyboardType="number-pad"
        maxLength={4}
        style={[styles.box, styles.boxYear]}
      />
      <Text style={styles.icon}>📅</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  box: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: 10, color: colors.ink, fontSize: 15, textAlign: 'center' },
  boxSmall: { width: 56 },
  boxYear: { width: 76 },
  sep: { color: colors.muted, fontWeight: '800' },
  icon: { fontSize: 18, marginLeft: 4 },
});
