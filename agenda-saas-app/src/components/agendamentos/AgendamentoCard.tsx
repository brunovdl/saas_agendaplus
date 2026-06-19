import Link from 'next/link';
import type { Agendamento } from '@/types/supabase';
import { cancelarAgendamento } from '@/app/(dashboard)/agendamentos/actions';

interface AgendamentoCardProps {
  agendamento: Agendamento;
}

export default function AgendamentoCard({ agendamento }: AgendamentoCardProps) {
  const isCancelado = agendamento.status === 'cancelado';

  async function handleCancel() {
    'use server';
    await cancelarAgendamento(agendamento.id);
  }

  const formatHora = (isoStr: string) => {
    return new Date(isoStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };
  const formatData = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="card p-5" style={{ display: 'flex', flexDirection: 'column', gap: '16px', opacity: isCancelado ? 0.6 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 600, color: '#181C1F' }}>
            {agendamento.cliente_nome}
          </h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#45464E' }}>
            {agendamento.cliente_telefone}
          </p>
        </div>
        <span className={`chip chip-${agendamento.status}`}>
          {agendamento.status.charAt(0).toUpperCase() + agendamento.status.slice(1)}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#45464E' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', color: '#76767F', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data</span>
          <span style={{ fontWeight: 500, color: '#181C1F' }}>{formatData(agendamento.data_hora_inicio)}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', color: '#76767F', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Horário</span>
          <span style={{ fontWeight: 500, color: '#181C1F' }}>
            {formatHora(agendamento.data_hora_inicio)} - {formatHora(agendamento.data_hora_fim)}
          </span>
        </div>
      </div>

      {agendamento.observacoes && (
        <div style={{ fontSize: '13px', color: '#76767F', background: '#F4F7FB', padding: '8px 12px', borderRadius: '6px' }}>
          {agendamento.observacoes}
        </div>
      )}

      {!isCancelado && (
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #EBECEF' }}>
          {/* O Editar vai para uma página no futuro, ou modal. No momento vou linkar para /agendamentos/[id]/editar */}
          <Link href={`/agendamentos/${agendamento.id}/editar`} className="btn-outline" style={{ flex: 1, textAlign: 'center', padding: '8px' }}>
            Editar
          </Link>
          
          <form action={handleCancel} style={{ flex: 1 }}>
            <button 
              type="submit" 
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold border-[1.5px] border-red-500 text-red-500 hover:bg-red-50 rounded-md transition-colors duration-150" 
              style={{ width: '100%', padding: '8px' }}
            >
              Cancelar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
