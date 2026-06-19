import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createPortalSessionAction } from '@/app/actions/subscription';

export const metadata = {
  title: 'Assinatura Suspensa — Agenda+',
  description: 'Seu período de teste expirou ou ocorreu um problema com o pagamento da sua assinatura.',
};

export default async function AssinaturaSuspensaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Buscar dados do prestador
  const { data: prestador } = await supabase
    .from('prestadores')
    .select('subscription_status, stripe_customer_id')
    .eq('id', user.id)
    .single();

  const status = prestador?.subscription_status || 'trialing';

  // Se a assinatura estiver ativa ou no trial válido, não deve ver esta página
  if (['active', 'trialing'].includes(status)) {
    redirect('/agenda');
  }

  const handlePortalRedirect = async () => {
    'use server';
    const res = await createPortalSessionAction();
    if (res.url) redirect(res.url);
  };

  const handleLogout = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
  };

  const hasStripeBilling = !!prestador?.stripe_customer_id;

  return (
    <div className="min-h-screen bg-[#00020e] text-white flex flex-col justify-between font-sans">
      {/* Glow orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[rgba(186,26,26,0.03)] rounded-full filter blur-[100px] pointer-events-none" />

      {/* Header */}
      <nav className="w-full px-8 py-6 border-b border-white/5 flex justify-between items-center max-w-[1440px] mx-auto z-10">
        <Link href="#" className="flex items-center gap-2">
          <img src="/logo_agenda_plus_transparent.png" alt="Agenda+" className="h-10 w-auto object-contain" />
        </Link>
        <form action={handleLogout}>
          <button type="submit" className="text-sm font-semibold text-white/50 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
            Sair da Conta
          </button>
        </form>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[600px] mx-auto px-6 py-16 flex flex-col items-center justify-center text-center gap-8 z-10">
        <div className="w-20 h-20 bg-[#BA1A1A]/10 border border-[#BA1A1A]/20 text-[#BA1A1A] rounded-2xl flex items-center justify-center text-4xl shadow-[0_0_32px_rgba(186,26,26,0.15)] animate-pulse">
          ⚠
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Acesso <span className="text-[#BA1A1A]">Suspenso</span>
          </h1>
          
          {status === 'past_due' || status === 'unpaid' ? (
            <p className="text-white/60 text-sm md:text-base leading-relaxed">
              Identificamos um problema no pagamento recorrente da sua assinatura. Suas configurações e o robô de atendimento do WhatsApp foram pausados temporariamente para evitar falhas de comunicação.
            </p>
          ) : (
            <p className="text-white/60 text-sm md:text-base leading-relaxed">
              O seu período de testes gratuito de 14 dias chegou ao fim. Para continuar gerenciando seus compromissos e manter sua secretária de IA respondendo clientes no WhatsApp, escolha e assine um dos nossos planos.
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
          {hasStripeBilling ? (
            <form action={handlePortalRedirect} className="w-full sm:w-auto">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 bg-[#BA1A1A] text-white hover:bg-[#BA1A1A]/90 font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Regularizar no Stripe Portal
              </button>
            </form>
          ) : (
            <Link
              href="/planos"
              className="w-full sm:w-auto px-8 py-3 bg-[#00D4FF] text-[#0D1B3E] hover:bg-[#00D4FF]/90 font-bold text-sm rounded-xl shadow-lg transition-all text-center no-underline"
            >
              Escolher um Plano de Assinatura
            </Link>
          )}
        </div>

        <p className="text-white/40 text-xs max-w-sm mt-4">
          Seus dados e históricos de agendamentos estão salvos com segurança. Assim que regularizado, o seu acesso e o robô voltarão a funcionar instantaneamente.
        </p>
      </main>

      {/* Footer */}
      <footer className="w-full px-8 py-6 border-t border-white/5 text-center text-white/40 text-xs">
        © {new Date().getFullYear()} Martins AI Automation. Todos os direitos reservados.
      </footer>
    </div>
  );
}
