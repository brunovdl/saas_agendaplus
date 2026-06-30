import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Callback de autenticação Supabase (Magic Link / OAuth).
 * Troca o code por uma sessão válida e redireciona para /agenda.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/agenda';

  // Obter a URL base robusta considerando proxies reversos e variáveis de ambiente
  const proto = request.headers.get('x-forwarded-proto') ?? 'http';
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? 'localhost:3000';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;
  const origin = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;

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
