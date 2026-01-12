import { createClient } from '@supabase/supabase-js';

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    const supabaseUrl = 'https://placeholder.supabase.co';
    const supabaseAnonKey = 'placeholder-anon-key';
    return createClient(supabaseUrl, supabaseAnonKey);
  }

  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    // Verificar se as variáveis de ambiente estão configuradas
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl === 'https://placeholder.supabase.co' || 
        supabaseAnonKey === 'placeholder-anon-key') {
      console.error('⚠️ Variáveis de ambiente do Supabase não configuradas!');
      console.error('Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY');
      
      // Retornar cliente com valores placeholder para evitar erros
      // mas o sistema não funcionará até as variáveis serem configuradas
      supabaseInstance = createClient(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseAnonKey || 'placeholder-anon-key'
      );
    } else {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    }
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
