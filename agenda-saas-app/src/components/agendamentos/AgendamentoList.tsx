import { createClient } from '@/lib/supabase/server';
import AgendamentoCard from './AgendamentoCard';

interface AgendamentoListProps {
  searchParams?: {
    data?: string;
    status?: string;
    nome?: string;
  };
}

export default async function AgendamentoList({ searchParams }: AgendamentoListProps) {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return <p>Não autorizado.</p>;
  }

  // Inicia a query do Supabase buscando os agendamentos do usuário logado
  let query = supabase
    .from('agendamentos')
    .select('*')
    .eq('user_id', authData.user.id);

  // Filtro por Nome do Cliente (busca parcial insensível a maiúsculas/minúsculas)
  if (searchParams?.nome) {
    query = query.ilike('cliente_nome', `%${searchParams.nome}%`);
  }

  // Filtro por Status
  if (searchParams?.status && searchParams.status !== 'todos') {
    query = query.eq('status', searchParams.status as 'pendente' | 'confirmado' | 'cancelado' | 'remarcado');
  }

  // Filtro por Data:
  // - Sem parâmetros (primeira carga): padrão é hoje local.
  // - Data vazia (data=): exibe todas as datas.
  // - Data específica (data=YYYY-MM-DD): exibe a data selecionada.
  let targetDateStr: string | undefined = undefined;

  if (searchParams === undefined || !('data' in searchParams)) {
    // Primeiro acesso: usar data de hoje local do servidor
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localD = new Date(d.getTime() - offset * 60 * 1000);
    targetDateStr = localD.toISOString().split('T')[0];
  } else if (searchParams.data) {
    targetDateStr = searchParams.data;
  }

  if (targetDateStr) {
    // Converte data local YYYY-MM-DD para ISO convertendo para UTC
    const start = new Date(`${targetDateStr}T00:00:00`);
    const end = new Date(`${targetDateStr}T23:59:59.999`);
    
    query = query
      .gte('data_hora_inicio', start.toISOString())
      .lte('data_hora_inicio', end.toISOString());
  }

  const { data: agendamentos, error } = await query.order('data_hora_inicio', { ascending: true });

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
