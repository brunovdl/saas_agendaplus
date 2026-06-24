import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Proxy Next.js 16 (anteriormente "Middleware") — Proteção de rotas e refresh de sessão.
 *
 * Responsabilidades:
 *  1. Atualizar tokens de sessão expirados (refresh automático via cookies).
 *  2. Redirecionar usuários não autenticados para /login.
 *  3. Redirecionar usuários autenticados para fora das rotas de auth.
 *
 * Next.js 16: exportar como named export "proxy" ou default export.
 */
async function proxyHandler(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: getUser() deve sempre ser chamado para refresh do token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ['/', '/login', '/cadastro', '/auth/callback', '/esqueci-senha'];
  const isPublicRoute = publicRoutes.some((r) =>
    r === '/' ? pathname === '/' : pathname.startsWith(r)
  );

  // Redirecionar usuário não autenticado tentando acessar rota protegida
  if (!user && !isPublicRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirecionar usuário autenticado tentando acessar login/cadastro
  if (user && isPublicRoute && pathname !== '/auth/callback') {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/agenda';
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

// Export nomeado "proxy" — convenção Next.js 16
export { proxyHandler as proxy };

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
