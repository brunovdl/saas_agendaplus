import Link from 'next/link';
import AgendamentoList from '@/components/agendamentos/AgendamentoList';
import { Suspense } from 'react';

export default function AgendamentosPage() {
  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#181C1F', margin: '0 0 8px' }}>Meus Agendamentos</h1>
          <p style={{ color: '#45464E', margin: 0 }}>Gerencie seus clientes e horários de forma simples.</p>
        </div>
        <Link href="/agendamentos/novo" className="btn-primary" style={{ textDecoration: 'none' }}>
          + Novo Agendamento
        </Link>
      </div>

      <Suspense fallback={<div style={{ textAlign: 'center', padding: '48px', color: '#76767F' }}>Carregando agendamentos...</div>}>
        <AgendamentoList />
      </Suspense>
    </div>
  );
}
