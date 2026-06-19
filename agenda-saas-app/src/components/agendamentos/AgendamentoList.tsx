import { createClient } from '@/lib/supabase/server';
import AgendamentoCard from './AgendamentoCard';

export default async function AgendamentoList() {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return <p>Não autorizado.</p>;
  }

  // Busca os agendamentos do usuário logado ordenados por data (mais recentes primeiro)
  const { data: agendamentos, error } = await supabase
    .from('agendamentos')
    .select('*')
    .eq('user_id', authData.user.id)
    .order('data_hora_inicio', { ascending: true });

  if (error) {
    return <p>Erro ao carregar agendamentos: {error.message}</p>;
  }

  if (!agendamentos || agendamentos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', background: '#F4F7FB', borderRadius: '12px' }}>
        <p style={{ color: '#45464E' }}>Nenhum agendamento encontrado.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
      {agendamentos.map((agendamento) => (
        <AgendamentoCard key={agendamento.id} agendamento={agendamento} />
      ))}
    </div>
  );
}
