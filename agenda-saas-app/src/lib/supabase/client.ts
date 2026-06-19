import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

/**
 * Cliente Supabase para uso em Client Components (browser).
 * Usa o anon_key — todas as operações são limitadas pelas políticas RLS.
 * NÃO tem acesso ao service_role_key.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
