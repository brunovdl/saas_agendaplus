import { createClient } from '@/lib/supabase/server';
import AgendamentoForm from '@/components/agendamentos/AgendamentoForm';
import MobileHeader from '@/components/layout/MobileHeader';
import { notFound } from 'next/navigation';

export default async function EditarAgendamentoPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ remarcar?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return notFound();

  const { data: agendamento, error } = await supabase
    .from('agendamentos')
    .select('*')
    .eq('id', resolvedParams.id)
    .eq('user_id', authData.user.id)
    .single();

  if (error || !agendamento) {
    return notFound();
  }

  if (resolvedSearchParams?.remarcar === 'true') {
    agendamento.status = 'remarcado';
  }

  return (
    <>
      <MobileHeader title="Editar Agendamento" />
      
      <div className="px-4 py-6 md:p-8 max-w-2xl mx-auto">
        <div className="hidden md:block mb-6">
          <h1 className="text-2xl font-bold text-[#181C1F] mb-1">Editar Agendamento</h1>
          <p className="text-sm text-[#45464E]">Altere as informações de {agendamento.cliente_nome}.</p>
        </div>

        <div className="card p-4 md:p-6">
          <AgendamentoForm initialData={{ ...agendamento, observacoes: agendamento.observacoes ?? undefined }} />
        </div>
      </div>
    </>
  );
}
