import { createClient } from '@/lib/supabase/server';
import AgendamentoForm from '@/components/agendamentos/AgendamentoForm';
import { notFound } from 'next/navigation';

export default async function EditarAgendamentoPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return notFound();

  const { data: agendamento, error } = await supabase
    .from('agendamentos')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', authData.user.id)
    .single();

  if (error || !agendamento) {
    return notFound();
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#181C1F', margin: '0 0 8px' }}>Editar Agendamento</h1>
        <p style={{ color: '#45464E', margin: 0 }}>Altere as informações de {agendamento.cliente_nome}.</p>
      </div>

      <div className="card p-6">
        <AgendamentoForm initialData={{ ...agendamento, observacoes: agendamento.observacoes ?? undefined }} />
      </div>
    </div>
  );
}
