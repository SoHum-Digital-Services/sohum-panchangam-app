import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/auth';
import { PanchangamSettingsProvider } from '../src/settings';

export default function RootLayout() {
  return (
    <AuthProvider>
      <PanchangamSettingsProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </PanchangamSettingsProvider>
    </AuthProvider>
  );
}
