import { createClient } from '@supabase/supabase-js';

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    const supabaseUrl = 'https://placeholder.supabase.co';
    const supabaseAnonKey = 'placeholder-anon-key';
    return createClient(supabaseUrl, supabaseAnonKey);
  }

  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseInstance;
};

export interface Ticket {
  id: string;
  email: string;
  description: string;
  status: 'aberto' | 'em_andamento' | 'resolvido';
  created_at: string;
  updated_at: string;
}

export interface PushToken {
  id: string;
  token: string;
  device_info: string;
  created_at: string;
  updated_at: string;
}
