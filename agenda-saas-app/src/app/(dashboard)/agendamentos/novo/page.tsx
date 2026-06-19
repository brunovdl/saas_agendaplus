import AgendamentoForm from '@/components/agendamentos/AgendamentoForm';

export default function NovoAgendamentoPage() {
  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#181C1F', margin: '0 0 8px' }}>Novo Agendamento</h1>
        <p style={{ color: '#45464E', margin: 0 }}>Preencha os dados do cliente para reservar o horário.</p>
      </div>

      <div className="card p-6">
        <AgendamentoForm />
      </div>
    </div>
  );
}
