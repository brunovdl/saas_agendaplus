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

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete('token_hash');
  redirectTo.searchParams.delete('type');

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
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.search = '';
  loginUrl.searchParams.set('error', 'auth_confirm_failed');
  return NextResponse.redirect(loginUrl);
}
