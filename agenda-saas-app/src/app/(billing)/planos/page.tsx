import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSessionAction, createPortalSessionAction } from '@/app/actions/subscription';
import SubmitButton from './SubmitButton'; // Componente cliente para gerenciar loading de checkout

export const metadata = {
  title: 'Escolha seu Plano — Agenda+',
  description: 'Selecione o melhor plano de agendamento e automatização para o seu negócio.',
};

export default async function PlanosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Buscar dados de assinatura do prestador
  const { data: prestador } = await supabase
    .from('prestadores')
    .select('subscription_tier, subscription_status, stripe_customer_id')
    .eq('id', user.id)
    .single();

  const currentTier = prestador?.subscription_tier || 'free_trial';
  const currentStatus = prestador?.subscription_status || 'trialing';

  // Chaves do Stripe
  const priceNormalId = process.env.STRIPE_PRICE_NORMAL_ID || 'price_1PNormalFake';
  const priceCompleteId = process.env.STRIPE_PRICE_COMPLETE_ID || 'price_1PCompleteFake';

  // Server Actions locais envelopadas para o checkout
  const handleCheckoutNormal = async () => {
    'use server';
    const res = await createCheckoutSessionAction(priceNormalId);
    if (res.url) redirect(res.url);
  };

  const handleCheckoutComplete = async () => {
    'use server';
    const res = await createCheckoutSessionAction(priceCompleteId);
    if (res.url) redirect(res.url);
  };

  const handlePortalRedirect = async () => {
    'use server';
    const res = await createPortalSessionAction();
    if (res.url) redirect(res.url);
  };

  const isSubscribed = prestador?.stripe_customer_id && ['active', 'trialing', 'past_due'].includes(currentStatus);

  return (
    <div className="min-h-screen bg-[#00020e] text-white flex flex-col justify-between font-sans">
      {/* Glow orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[rgba(0,212,253,0.04)] rounded-full filter blur-[100px] pointer-events-none" />

      {/* Header */}
      <nav className="w-full px-8 py-6 border-b border-white/5 flex justify-between items-center max-w-[1440px] mx-auto z-10">
        <Link href="/agenda" className="flex items-center gap-2">
          <img src="/logo_agenda_plus_transparent.png" alt="Agenda+" className="h-10 w-auto object-contain" />
        </Link>
        <Link href="/agenda" className="text-sm font-semibold text-white/70 hover:text-[#00D4FF] transition-colors">
          ← Voltar ao Sistema
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-16 flex flex-col items-center justify-center gap-12 z-10">
        <div className="text-center space-y-4 max-w-xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Escolha o <span className="text-[#00D4FF]">Plano Ideal</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg">
            Potencialize seus agendamentos e otimize o seu tempo. Gerencie seu calendário de forma visual ou automatize tudo com Inteligência Artificial.
          </p>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          
          {/* Card: Plano Normal */}
          <div className={`rounded-2xl border p-8 bg-gradient-to-b from-[#0D1B3E]/60 to-[#0A122C]/80 backdrop-blur-md flex flex-col justify-between gap-8 transition-all duration-300 relative ${
            currentTier === 'normal' && ['active', 'trialing'].includes(currentStatus)
              ? 'border-[#00D4FF] shadow-[0_0_24px_rgba(0,212,253,0.15)]'
              : 'border-white/10 hover:border-white/20'
          }`}>
            {currentTier === 'normal' && ['active', 'trialing'].includes(currentStatus) && (
              <span className="absolute -top-3 right-6 bg-[#00D4FF] text-[#0D1B3E] font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                Seu Plano Atual
              </span>
            )}
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold">Plano Normal</h3>
                <p className="text-white/50 text-xs mt-1">Essencial para profissionais independentes</p>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-white">R$ 39,90</span>
                <span className="text-white/50 text-sm">/ mês</span>
              </div>

              <hr className="border-white/10" />

              <div className="space-y-4">
                {[
                  'Agenda visual em tempo real',
                  'Gestão centralizada de clientes',
                  'Faturamento e taxas de no-show no painel',
                  'Acesso responsivo (computador e celular)',
                  'Suporte básico via e-mail',
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-3 text-sm text-white/80">
                    <span className="text-[#00D4FF] font-bold">✓</span>
                    <span>{feat}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3 text-sm text-white/40 line-through">
                  <span>✗</span>
                  <span>Secretária Virtual integrada ao WhatsApp</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/40 line-through">
                  <span>✗</span>
                  <span>Negociação e agendamentos via IA 24/7</span>
                </div>
              </div>
            </div>

            <form action={handleCheckoutNormal} className="w-full">
              <SubmitButton 
                isActive={currentTier === 'normal' && ['active', 'trialing'].includes(currentStatus)}
                label={currentTier === 'normal' && ['active', 'trialing'].includes(currentStatus) ? 'Plano Ativo' : 'Assinar Plano Normal'}
              />
            </form>
          </div>

          {/* Card: Plano Completo */}
          <div className={`rounded-2xl border p-8 bg-gradient-to-b from-[#152448]/80 to-[#0D1B3E]/90 backdrop-blur-md flex flex-col justify-between gap-8 transition-all duration-300 relative ${
            (currentTier === 'complete' || currentTier === 'free_trial') && ['active', 'trialing'].includes(currentStatus)
              ? 'border-[#00D4FF] shadow-[0_0_32px_rgba(0,212,253,0.25)]'
              : 'border-white/10 hover:border-white/20'
          }`}>
            {((currentTier === 'complete' || currentTier === 'free_trial') && ['active', 'trialing'].includes(currentStatus)) && (
              <span className="absolute -top-3 right-6 bg-[#00D4FF] text-[#0D1B3E] font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                {currentTier === 'free_trial' ? 'Período de Testes' : 'Seu Plano Atual'}
              </span>
            )}

            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">Plano Completo (com IA)</h3>
                  <p className="text-white/50 text-xs mt-1">Automatização 100% autônoma via WhatsApp</p>
                </div>
                <span className="bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#00D4FF] text-[10px] font-bold px-2 py-0.5 rounded">
                  POPULAR
                </span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-extrabold text-white">R$ 79,90</span>
                <span className="text-white/50 text-sm">/ mês</span>
              </div>

              <hr className="border-white/10" />

              <div className="space-y-4">
                {[
                  'Tudo do Plano Normal incluído',
                  'Secretária Virtual Inteligente no WhatsApp',
                  'Agendamentos e negociações de horários 24/7',
                  'Parametrização de tom de voz e nome da IA',
                  'Cadastro de serviços e horários da IA',
                  'QR Code dinâmico gerado no painel',
                  'Integração e webhook automáticos',
                  'Suporte prioritário via WhatsApp',
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-3 text-sm text-white/80">
                    <span className="text-[#00D4FF] font-bold">✦</span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <form action={handleCheckoutComplete} className="w-full">
              <SubmitButton 
                isActive={(currentTier === 'complete' || currentTier === 'free_trial') && ['active', 'trialing'].includes(currentStatus)}
                label={currentTier === 'free_trial' ? 'Contratar Plano Completo' : (currentTier === 'complete' && ['active', 'trialing'].includes(currentStatus)) ? 'Plano Ativo' : 'Assinar Plano Completo'}
              />
            </form>
          </div>

        </div>

        {/* Manage Subscription Button (Customer Portal) */}
        {isSubscribed && (
          <form action={handlePortalRedirect} className="z-10 mt-4">
            <button
              type="submit"
              className="text-sm font-semibold text-white/50 hover:text-white underline decoration-white/30 hover:decoration-white transition-all bg-transparent border-none cursor-pointer"
            >
              Gerenciar formas de pagamento ou cancelar assinatura
            </button>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full px-8 py-6 border-t border-white/5 text-center text-white/40 text-xs">
        © {new Date().getFullYear()} Martins AI Automation. Todos os direitos reservados.
      </footer>
    </div>
  );
}
