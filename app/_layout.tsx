import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PanchangamSettingsProvider } from '../src/settings';

export default function RootLayout() {
  return (
    <PanchangamSettingsProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </PanchangamSettingsProvider>
  );
}
