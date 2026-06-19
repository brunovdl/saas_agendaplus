import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/**
 * Cliente Supabase com service_role_key — bypassa RLS completamente.
 *
 * ⚠️ USO RESTRITO:
 *   - Edge Functions (supabase/functions/)
 *   - Server Actions que precisam operar em nome de outro usuário
 *   - Jobs de manutenção (pg_cron via Edge Function)
 *
 * NUNCA use este cliente em Client Components ou exponha no bundle do cliente.
 * NUNCA inclua SUPABASE_SERVICE_ROLE_KEY em variáveis NEXT_PUBLIC_.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      '[Supabase Admin] Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.'
    );
  }

  return createSupabaseClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
