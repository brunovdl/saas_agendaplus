import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';
import { createClient } from '@/lib/supabase/server';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  
  // 1. Obter o usuário logado
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Se não houver usuário logado, redireciona para a página de login
    redirect('/login');
  }

  // 2. Buscar o nicho e o nome do negócio do prestador
  const { data: prestador, error } = await supabase
    .from('prestadores')
    .select('nome_negocio, nicho')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[Dashboard Layout Fetch Error]', error);
  }

  const nicho = prestador?.nicho;
  const nomeNegocio = prestador?.nome_negocio ?? 'Seu Negócio';

  // 3. Se o nicho for nulo, exibe a tela de Onboarding e impede acesso às telas regulares
  if (!nicho) {
    return <OnboardingScreen nomeNegocio={nomeNegocio} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F7FB] text-gray-900 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-auto hide-scrollbar">
          {children}
        </div>
        <BottomNav />
      </main>
    </div>
  );
}
