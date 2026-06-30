import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Route Handler para confirmar OTP / Magic Link e criar uma sessão no servidor.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/agenda';

  // Obter a URL base robusta considerando proxies reversos e variáveis de ambiente
  const proto = request.headers.get('x-forwarded-proto') ?? 'http';
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? 'localhost:3000';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;
  const origin = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;

  const redirectTo = new URL(next, origin);

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Se não houver erro, limpa os parâmetros de busca específicos do otp
      // e redireciona para a página de destino (ex: /agenda)
      return NextResponse.redirect(redirectTo);
    }

    console.error('[Auth Confirm] Erro ao verificar OTP/Magic Link:', error.message);
  }

  // Em caso de falha na verificação, redireciona de volta para o login com parâmetro de erro
  const loginUrl = new URL('/login', origin);
  loginUrl.searchParams.set('error', 'auth_confirm_failed');
  return NextResponse.redirect(loginUrl);
}
