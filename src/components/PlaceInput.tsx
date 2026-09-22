import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { searchPlaces, type Place } from '../api/places';
import { colors } from '../theme';

// Type-ahead place search replacing manual latitude/longitude entry --
// matches the pattern every other horoscope app uses. Selecting a result
// hands back {label, latitude, longitude}; the raw coordinates never need
// to be shown or typed by the user.
//
// The results list renders in a Modal instead of a plain absolutely
// positioned View. A plain View was getting painted behind sibling
// Pressables (the "Calculate" button) despite a higher zIndex --
// react-native-web gives every Pressable its own CSS stacking context
// (it applies a transform for press feedback), which isolates it from
// zIndex comparisons with unrelated siblings. Modal renders through a
// separate top-level layer on both web and native, sidestepping that
// entirely instead of fighting it with ever-higher zIndex values.
export function PlaceInput({ initialLabel, onSelect }: { initialLabel: string; onSelect: (place: Place) => void }) {
  const [query, setQuery] = useState(initialLabel);
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const wrapRef = useRef<View>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await searchPlaces(query));
      } finally {
        setLoading(false);
      }
    }, 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const openDropdown = () => {
    wrapRef.current?.measureInWindow((x, y, width, height) => setAnchor({ x, y, width, height }));
    setOpen(true);
  };

  return (
    <View ref={wrapRef} style={styles.wrap}>
      <TextInput
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          openDropdown();
        }}
        onFocus={openDropdown}
        placeholder="Start typing a city or town"
        placeholderTextColor="#ab9989"
        style={styles.input}
      />
      {loading && <ActivityIndicator size="small" color={colors.maroon} style={styles.spinner} />}

      <Modal visible={open && results.length > 0} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          {anchor && (
            <View style={[styles.dropdown, { top: anchor.y + anchor.height + 4, left: anchor.x, width: anchor.width }]}>
              {results.map((place) => (
                <Pressable
                  key={`${place.label}-${place.latitude}`}
                  style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                  onPress={() => {
                    setQuery(place.label);
                    setResults([]);
                    setOpen(false);
                    onSelect(place);
                  }}
                >
                  <Text style={styles.optionText} numberOfLines={2}>{place.label}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  input: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: 12, color: colors.ink, fontSize: 15 },
  spinner: { position: 'absolute', right: 12, top: 12 },
  backdrop: { flex: 1 },
  dropdown: { position: 'absolute', backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.line, maxHeight: 220, overflow: 'hidden', shadowColor: '#5b2a10', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 6 },
  option: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  optionPressed: { backgroundColor: colors.peach },
  optionText: { color: colors.ink, fontSize: 13 },
});
