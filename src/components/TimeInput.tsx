import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';

// 24-hour HH:MM entry, two boxes, no AM/PM. Typing 2 digits for hour
// auto-advances to minute. `onChange` fires with "HH:MM" once both parts
// are present.
export function TimeInput({ value, onChange }: { value: string; onChange: (time: string) => void }) {
  const [hh, mm] = value ? value.split(':') : ['', ''];
  const [h, setH] = useState(hh ?? '');
  const [m, setM] = useState(mm ?? '');
  const minuteRef = useRef<TextInput>(null);
  const hourRef = useRef<TextInput>(null);

  const emit = (nextH: string, nextM: string) => {
    if (nextH.length === 2 && nextM.length === 2) {
      onChange(`${nextH}:${nextM}`);
    } else {
      onChange('');
    }
  };

  return (
    <View style={styles.row}>
      <TextInput
        ref={hourRef}
        value={h}
        onChangeText={(text) => {
          let digits = text.replace(/\D/g, '').slice(0, 2);
          if (digits.length === 2 && Number(digits) > 23) digits = '23';
          setH(digits);
          emit(digits, m);
          if (digits.length === 2) minuteRef.current?.focus();
        }}
        placeholder="HH"
        placeholderTextColor={colors.muted}
        keyboardType="number-pad"
        maxLength={2}
        style={[styles.box, styles.boxSmall]}
      />
      <Text style={styles.sep}>:</Text>
      <TextInput
        ref={minuteRef}
        value={m}
        onChangeText={(text) => {
          let digits = text.replace(/\D/g, '').slice(0, 2);
          if (digits.length === 2 && Number(digits) > 59) digits = '59';
          setM(digits);
          emit(h, digits);
        }}
        onKeyPress={(e) => {
          if (e.nativeEvent.key === 'Backspace' && m.length === 0) hourRef.current?.focus();
        }}
        placeholder="MM"
        placeholderTextColor={colors.muted}
        keyboardType="number-pad"
        maxLength={2}
        style={[styles.box, styles.boxSmall]}
      />
      <Text style={styles.hint24}>24h</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  box: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: 10, color: colors.ink, fontSize: 15, textAlign: 'center' },
  boxSmall: { width: 56 },
  sep: { color: colors.muted, fontWeight: '800' },
  hint24: { color: colors.muted, fontSize: 11, fontWeight: '700', marginLeft: 6 },
});
