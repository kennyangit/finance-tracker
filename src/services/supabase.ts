import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

function getEnvironmentVariables() {
  // Try Vite env first (development)
  const viteUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL;
  const viteKey = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY;

  if (viteUrl && viteKey) {
    return {
      supabaseUrl: viteUrl,
      supabaseAnonKey: viteKey
    };
  }

  // Fallback to Node.js process.env (Vercel)
  const nodeUrl = typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined;
  const nodeKey = typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : undefined;

  return {
    supabaseUrl: nodeUrl || '',
    supabaseAnonKey: nodeKey || ''
  };
}

export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const { supabaseUrl, supabaseAnonKey } = getEnvironmentVariables();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and ANON_KEY must be set in environment variables. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, or set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel.');
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

export async function initSupabase() {
  return getSupabaseClient();
}

// Table name constant
export const TRANSACTIONS_TABLE = 'transactions';
