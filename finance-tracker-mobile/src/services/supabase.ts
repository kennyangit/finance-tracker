import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

let supabaseClient: SupabaseClient | null = null;

function getEnvironmentVariables() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  return {
    supabaseUrl: url || '',
    supabaseAnonKey: key || '',
  };
}

export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const { supabaseUrl, supabaseAnonKey } = getEnvironmentVariables();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase URL and ANON_KEY must be set in environment variables. Create a .env file with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return supabaseClient;
}

export async function initSupabase() {
  return getSupabaseClient();
}

// Table name constant
export const TRANSACTIONS_TABLE = 'transactions';
