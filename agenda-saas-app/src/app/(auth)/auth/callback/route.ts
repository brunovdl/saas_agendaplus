import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Callback de autenticação Supabase (Magic Link / OAuth).
 * Troca o code por uma sessão válida e redireciona para /agenda.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/agenda';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error('[Auth Callback] Erro ao trocar code por sessão:', error.message);
  }

  // Redirecionar para login com erro em caso de falha
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
