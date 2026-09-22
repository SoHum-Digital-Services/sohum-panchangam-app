import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { searchPlaces, type Place } from '../api/places';
import { colors } from '../theme';
import { usePanchangamSettings } from '../settings';

// Type-ahead place search replacing manual latitude/longitude entry --
// matches the pattern every other horoscope app uses. Selecting a result
// hands back {label, latitude, longitude}; the raw coordinates never need
// to be shown or typed by the user.
//
// Renders the results list as a plain absolutely-positioned View, not a
// Modal -- a Modal was tried first to dodge a zIndex/stacking issue with
// the submit button, but presenting a Modal blurs the TextInput (and
// dismisses the keyboard) every time its visibility toggles, which is
// worse. The actual stacking fix belongs to the parent form (see
// BirthDetailsForm.tsx): zIndex only ranks siblings within the same
// stacking context, and setting it deep inside here (below the form's own
// root View) never reached the level where it needed to outrank the
// submit button.
export function PlaceInput({ initialLabel, onSelect, onDropdownVisibleChange }: { initialLabel: string; onSelect: (place: Place) => void; onDropdownVisibleChange?: (visible: boolean) => void }) {
  const { language } = usePanchangamSettings();
  const telugu = language === 'te';
  const [query, setQuery] = useState(initialLabel);
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownVisible = open && results.length > 0;

  // Lets the parent form hide content that sits below this field (e.g. a
  // hint line) while the dropdown is open, instead of it visually
  // colliding with the overlay.
  useEffect(() => {
    onDropdownVisibleChange?.(dropdownVisible);
  }, [dropdownVisible, onDropdownVisibleChange]);

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

  return (
    <View style={styles.wrap}>
      <TextInput
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={telugu ? 'ఒక నగరం లేదా పట్టణం పేరు టైప్ చేయండి' : 'Start typing a city or town'}
        placeholderTextColor="#ab9989"
        style={styles.input}
      />
      {loading && <ActivityIndicator size="small" color={colors.maroon} style={styles.spinner} />}
      {dropdownVisible && (
        <View style={styles.dropdown}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  input: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: 12, color: colors.ink, fontSize: 15 },
  spinner: { position: 'absolute', right: 12, top: 12 },
  dropdown: { position: 'absolute', top: 48, left: 0, right: 0, backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.line, maxHeight: 220, overflow: 'hidden', shadowColor: '#5b2a10', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 6 },
  option: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  optionPressed: { backgroundColor: colors.peach },
  optionText: { color: colors.ink, fontSize: 13 },
});
