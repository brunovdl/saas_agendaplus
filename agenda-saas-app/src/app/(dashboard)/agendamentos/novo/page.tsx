import AgendamentoForm from '@/components/agendamentos/AgendamentoForm';
import MobileHeader from '@/components/layout/MobileHeader';

export default function NovoAgendamentoPage() {
  return (
    <>
      <MobileHeader title="Novo Agendamento" />
      
      <div className="px-4 py-6 md:px-8 md:py-8 max-w-2xl mx-auto">
        <div className="hidden md:block mb-6">
          <h1 className="text-2xl font-bold text-[#181C1F] mb-1">Novo Agendamento</h1>
          <p className="text-sm text-[#45464E]">Preencha os dados do cliente para reservar o horário.</p>
        </div>

        <div className="card p-4 md:p-6">
          <AgendamentoForm />
        </div>
      </div>
    </>
  );
}
