import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

/**
 * Cliente Supabase para uso em Server Components, Server Actions e Route Handlers.
 * Lê/escreve cookies da requisição atual via next/headers.
 * Usa o anon_key — respeitando RLS por usuário autenticado.
 *
 * IMPORTANTE: Sempre chamar `await createClient()` em contextos server.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll pode falhar em Server Components (read-only context).
            // É seguro ignorar — o Middleware é responsável por refresh de sessão.
          }
        },
      },
    }
  );
}
