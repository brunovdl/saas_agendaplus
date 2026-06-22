import { getClienteDetails, getPrestadorPerfil } from '../actions';
import ClientePerfilView from '@/components/clientes/ClientePerfilView';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import MobileHeader from '@/components/layout/MobileHeader';

interface ClienteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClienteDetailPage({ params }: ClienteDetailPageProps) {
  const { id } = await params;

  // 1. Carrega dados do cliente e histórico
  const dados = await getClienteDetails(id);
  if (!dados) {
    notFound();
  }

  // 2. Carrega perfil do prestador para saber o nicho
  const prestador = await getPrestadorPerfil();
  if (!prestador || !prestador.nicho) {
    redirect('/agenda');
  }

  return (
    <div className="w-full">
      <MobileHeader title="Perfil do Cliente" backHref="/clientes" />

      {/* ─── Breadcrumb / Botão de Voltar ─────────────────────────────────── */}
      <div className="hidden md:block px-4 md:px-8 pt-6">
        <Link
          href="/clientes"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#45464E] hover:text-[#0D1B3E] transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar para Lista
        </Link>
      </div>

      <ClientePerfilView dados={dados} nicho={prestador.nicho as 'saude_estetica' | 'servicos_manutencao'} />
    </div>
  );
}
