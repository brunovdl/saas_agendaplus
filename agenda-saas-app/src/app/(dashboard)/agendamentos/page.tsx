import Link from 'next/link';
import AgendamentoList from '@/components/agendamentos/AgendamentoList';
import { Suspense } from 'react';
import { Plus } from 'lucide-react';

export default function AgendamentosPage() {
  return (
    <div className="px-4 py-6 md:px-8 md:py-8 max-w-5xl mx-auto relative min-h-[calc(100vh-64px)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#181C1F]">Meus Agendamentos</h1>
          <p className="text-sm text-[#45464E] mt-1">Gerencie seus clientes e horários de forma simples.</p>
        </div>
        <Link 
          href="/agendamentos/novo" 
          className="hidden md:inline-flex btn-primary whitespace-nowrap self-start sm:self-auto" 
          style={{ textDecoration: 'none' }}
        >
          + Novo Agendamento
        </Link>
      </div>

      <Suspense fallback={<div className="text-center py-12 text-[#76767F]">Carregando agendamentos...</div>}>
        <AgendamentoList />
      </Suspense>

      {/* Floating Action Button (FAB) no mobile para direcionar para novo agendamento */}
      <Link
        href="/agendamentos/novo"
        className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-[#00D4FF] hover:bg-[#00A8CC] text-[#0D1B3E] rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]"
        title="Novo Agendamento"
        aria-label="Novo Agendamento"
        style={{ textDecoration: 'none' }}
      >
        <Plus size={24} strokeWidth={3} />
      </Link>
    </div>
  );
}
