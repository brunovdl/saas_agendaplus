import Link from 'next/link';
import AgendamentoList from '@/components/agendamentos/AgendamentoList';
import { Suspense } from 'react';

export default function AgendamentosPage() {
  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#181C1F]">Meus Agendamentos</h1>
          <p className="text-sm text-[#45464E] mt-1">Gerencie seus clientes e horários de forma simples.</p>
        </div>
        <Link href="/agendamentos/novo" className="btn-primary whitespace-nowrap self-start sm:self-auto" style={{ textDecoration: 'none' }}>
          + Novo Agendamento
        </Link>
      </div>

      <Suspense fallback={<div className="text-center py-12 text-[#76767F]">Carregando agendamentos...</div>}>
        <AgendamentoList />
      </Suspense>
    </div>
  );
}
