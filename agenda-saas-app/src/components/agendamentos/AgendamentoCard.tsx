import Link from 'next/link';
import type { Agendamento } from '@/types/supabase';
import { cancelarAgendamento, concluirAgendamento } from '@/app/(dashboard)/agendamentos/actions';
import { MessageCircle, Pencil, Calendar, Ban, Check } from 'lucide-react';

interface AgendamentoCardProps {
  agendamento: Agendamento;
}

export default function AgendamentoCard({ agendamento }: AgendamentoCardProps) {
  const isCancelado = agendamento.status === 'cancelado';
  const isConcluido = agendamento.status === 'concluido';

  async function handleCancel() {
    'use server';
    await cancelarAgendamento(agendamento.id);
  }

  async function handleConcluir() {
    'use server';
    await concluirAgendamento(agendamento.id);
  }

  const formatHora = (isoStr: string) => {
    return new Date(isoStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatData = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('pt-BR');
  };

  const getWhatsappLink = (telefone: string) => {
    const limpo = telefone.replace(/\D/g, '');
    const ddi = limpo.length <= 11 && !limpo.startsWith('55') ? '55' : '';
    return `https://wa.me/${ddi}${limpo}`;
  };

  return (
    <div 
      className={`card p-4 md:p-5 flex flex-col gap-3 md:gap-4 transition-all duration-200 ${
        isCancelado ? 'opacity-60' : 'hover:shadow-md'
      }`}
    >
      {/* Cabeçalho com Nome e Status */}
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-[#181C1F] line-clamp-1">
            {agendamento.cliente_nome}
          </h3>
          <p className="text-xs md:text-sm text-[#45464E] mt-0.5">
            {agendamento.cliente_telefone}
          </p>
        </div>
        <span className={`chip chip-${agendamento.status}`}>
          {agendamento.status.charAt(0).toUpperCase() + agendamento.status.slice(1)}
        </span>
      </div>

      {/* Informações de Data e Horário */}
      <div className="flex gap-4 text-xs md:text-sm text-[#45464E]">
        <div className="flex flex-col">
          <span className="text-[10px] md:text-xs text-[#76767F] uppercase tracking-wider font-semibold">
            Data
          </span>
          <span className="font-medium text-[#181C1F]">
            {formatData(agendamento.data_hora_inicio)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] md:text-xs text-[#76767F] uppercase tracking-wider font-semibold">
            Horário
          </span>
          <span className="font-medium text-[#181C1F]">
            {formatHora(agendamento.data_hora_inicio)} - {formatHora(agendamento.data_hora_fim)}
          </span>
        </div>
      </div>

      {/* Observações */}
      {agendamento.observacoes && (
        <div className="text-xs md:text-sm text-[#76767F] bg-[#F4F7FB] p-2 md:p-3 rounded-md line-clamp-2 md:line-clamp-none">
          {agendamento.observacoes}
        </div>
      )}

      {/* Ações Rápidas */}
      <div className="flex items-center gap-2 mt-auto pt-3 md:pt-4 border-t border-[#EBECEF]">
        {/* WhatsApp */}
        <a
          id={`btn-whatsapp-${agendamento.id}`}
          href={getWhatsappLink(agendamento.cliente_telefone)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2 flex items-center justify-center border-[1.5px] border-[#065F46] text-[#065F46] hover:bg-[#D1FAE5] rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]"
          title="Enviar mensagem no WhatsApp"
          aria-label="Enviar mensagem no WhatsApp"
        >
          <MessageCircle size={18} strokeWidth={2} />
        </a>

        {/* Editar */}
        <Link
          id={`btn-editar-${agendamento.id}`}
          href={`/agendamentos/${agendamento.id}/editar`}
          className="flex-1 py-2 flex items-center justify-center border-[1.5px] border-brand-blue text-brand-blue hover:bg-brand-blue/5 rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]"
          title="Editar agendamento"
          aria-label="Editar agendamento"
        >
          <Pencil size={18} strokeWidth={2} />
        </Link>

        {/* Remarcar */}
        <Link
          id={`btn-remarcar-${agendamento.id}`}
          href={`/agendamentos/${agendamento.id}/editar?remarcar=true`}
          className="flex-1 py-2 flex items-center justify-center border-[1.5px] border-[#4C1D95] text-[#4C1D95] hover:bg-[#EDE9FE] rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]"
          title="Remarcar agendamento"
          aria-label="Remarcar agendamento"
        >
          <Calendar size={18} strokeWidth={2} />
        </Link>

        {/* Concluir (Apenas se o agendamento não estiver cancelado ou concluído) */}
        {!isCancelado && !isConcluido && (
          <form action={handleConcluir} className="flex-1 flex">
            <button
              id={`btn-concluir-${agendamento.id}`}
              type="submit"
              className="w-full py-2 flex items-center justify-center border-[1.5px] border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]"
              title="Concluir agendamento"
              aria-label="Concluir agendamento"
            >
              <Check size={18} strokeWidth={2} />
            </button>
          </form>
        )}

        {/* Cancelar (Apenas se o agendamento não estiver cancelado ou concluído) */}
        {!isCancelado && !isConcluido && (
          <form action={handleCancel} className="flex-1 flex">
            <button
              id={`btn-cancelar-${agendamento.id}`}
              type="submit"
              className="w-full py-2 flex items-center justify-center border-[1.5px] border-error text-error hover:bg-error-container/40 rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]"
              title="Cancelar agendamento"
              aria-label="Cancelar agendamento"
            >
              <Ban size={18} strokeWidth={2} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
