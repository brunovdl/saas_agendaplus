'use client';

import { useState, useTransition } from 'react';
import { saveNichoPrestador } from '@/app/(dashboard)/clientes/actions';

interface OnboardingScreenProps {
  nomeNegocio: string;
}

export default function OnboardingScreen({ nomeNegocio }: OnboardingScreenProps) {
  const [selectedNicho, setSelectedNicho] = useState<'saude_estetica' | 'servicos_manutencao' | 'podologia' | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!selectedNicho) return;

    setError(null);
    startTransition(async () => {
      const res = await saveNichoPrestador(selectedNicho);
      if (res?.error) {
        setError(res.error);
      } else {
        // Recarrega a página para aplicar a nova rota e liberar o layout
        window.location.reload();
      }
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #020617 0%, #0d1b3e 100%)',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '32px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow Orbs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)', pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '1020px', zIndex: 1, textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ marginBottom: '24px' }}>
          <img
            src="/logo_agenda_plus_transparent.png"
            alt="Agenda+"
            style={{
              height: '54px',
              width: 'auto',
              objectFit: 'contain',
              display: 'inline-block',
            }}
          />
        </div>

        {/* Título */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: 800,
          color: '#FFFFFF',
          margin: '0 0 8px',
          lineHeight: 1.2,
          letterSpacing: '-0.025em'
        }}>
          Olá, {nomeNegocio}!
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: '16px',
          margin: '0 0 40px',
        }}>
          Para personalizarmos sua experiência, selecione qual é o nicho do seu negócio.
        </p>

        {/* Cards de Nicho */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '40px',
        }}>
          {/* Card 1: Saúde & Estética */}
          <button
            onClick={() => setSelectedNicho('saude_estetica')}
            style={{
              textAlign: 'left',
              padding: '28px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: selectedNicho === 'saude_estetica' ? '2px solid #00D4FF' : '2px solid rgba(255, 255, 255, 0.08)',
              boxShadow: selectedNicho === 'saude_estetica' ? '0 0 20px rgba(0, 212, 255, 0.2)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              outline: 'none',
              transform: selectedNicho === 'saude_estetica' ? 'scale(1.02)' : 'scale(1)',
            }}
            className="group hover-card"
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: selectedNicho === 'saude_estetica' ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00D4FF',
              transition: 'all 0.2s ease',
            }}>
              {/* Ícone Sparkles/Saúde */}
              <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>

            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#FFFFFF',
                margin: '0 0 6px',
              }}>
                Saúde & Estética
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.55)',
                margin: '0 0 16px',
                lineHeight: 1.4,
              }}>
                Ideal para consultórios médicos, dentistas, manicures, clínicas gerais e salões de beleza.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#00D4FF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ✓ Ficha de Anamnese estruturada
                </span>
                <span style={{ fontSize: '13px', color: '#00D4FF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ✓ Prontuário e notas de evolução
                </span>
                <span style={{ fontSize: '13px', color: '#00D4FF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ✓ Histórico de agendamentos
                </span>
              </div>
            </div>
          </button>

          {/* Card 2: Podologia */}
          <button
            onClick={() => setSelectedNicho('podologia')}
            style={{
              textAlign: 'left',
              padding: '28px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: selectedNicho === 'podologia' ? '2px solid #00D4FF' : '2px solid rgba(255, 255, 255, 0.08)',
              boxShadow: selectedNicho === 'podologia' ? '0 0 20px rgba(0, 212, 255, 0.2)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              outline: 'none',
              transform: selectedNicho === 'podologia' ? 'scale(1.02)' : 'scale(1)',
            }}
            className="group hover-card"
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: selectedNicho === 'podologia' ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00D4FF',
              transition: 'all 0.2s ease',
            }}>
              {/* Ícone de Pés / Saúde Clínica */}
              <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>

            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#FFFFFF',
                margin: '0 0 6px',
              }}>
                Podologia
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.55)',
                margin: '0 0 16px',
                lineHeight: 1.4,
              }}>
                Ideal para podólogos autônomos ou clínicas especializadas em saúde e estética clínica dos pés.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#00D4FF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ✓ Avaliação Podológica interativa
                </span>
                <span style={{ fontSize: '13px', color: '#00D4FF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ✓ Testes e mapas de sensibilidade SVG
                </span>
                <span style={{ fontSize: '13px', color: '#00D4FF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ✓ Assinatura eletrônica do paciente
                </span>
              </div>
            </div>
          </button>

          {/* Card 3: Serviços & Manutenção */}
          <button
            onClick={() => setSelectedNicho('servicos_manutencao')}
            style={{
              textAlign: 'left',
              padding: '28px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: selectedNicho === 'servicos_manutencao' ? '2px solid #00D4FF' : '2px solid rgba(255, 255, 255, 0.08)',
              boxShadow: selectedNicho === 'servicos_manutencao' ? '0 0 20px rgba(0, 212, 255, 0.2)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              outline: 'none',
              transform: selectedNicho === 'servicos_manutencao' ? 'scale(1.02)' : 'scale(1)',
            }}
            className="group hover-card"
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: selectedNicho === 'servicos_manutencao' ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00D4FF',
              transition: 'all 0.2s ease',
            }}>
              {/* Ícone Wrench/Ferramenta */}
              <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>

            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#FFFFFF',
                margin: '0 0 6px',
              }}>
                Serviços & Manutenção
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.55)',
                margin: '0 0 16px',
                lineHeight: 1.4,
              }}>
                Ideal para oficinas mecânicas, assistências técnicas, instaladores, marcenarias e prestadores de serviços.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#00D4FF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ✓ Histórico de Serviços executados
                </span>
                <span style={{ fontSize: '13px', color: '#00D4FF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ✓ Registro de descrição e valores
                </span>
                <span style={{ fontSize: '13px', color: '#00D4FF', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ✓ Histórico de agendamentos
                </span>
              </div>
            </div>
          </button>
        </div>

        {error && (
          <p style={{ color: '#EF4444', fontSize: '14px', marginBottom: '20px', fontWeight: 600 }}>{error}</p>
        )}

        {/* CTA Botão */}
        <button
          onClick={handleSubmit}
          disabled={!selectedNicho || isPending}
          style={{
            padding: '14px 40px',
            fontSize: '15px',
            fontWeight: 700,
            borderRadius: '8px',
            background: selectedNicho ? '#00D4FF' : 'rgba(255, 255, 255, 0.05)',
            color: selectedNicho ? '#020617' : 'rgba(255, 255, 255, 0.25)',
            border: 'none',
            cursor: selectedNicho && !isPending ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            boxShadow: selectedNicho ? '0 4px 18px rgba(0, 212, 255, 0.3)' : 'none',
          }}
        >
          {isPending ? 'Configurando...' : 'Confirmar e Começar'}
        </button>
      </div>

      <style>{`
        .hover-card:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.15) !important;
        }
      `}</style>
    </div>
  );
}
