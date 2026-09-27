import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// The shared SoHum identity project -- same account works across
// ChantTracker, GatiVani, Darshan, Shop, and Vani. This app has no
// user-gated features yet; signing in here only establishes that shared
// identity for when it does.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://ziebgspujtdzkiwyybsa.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_cp3vrEcGluNQ6Cv6uXAEeQ_ZAdJ9NRv';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
