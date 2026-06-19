import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  RealTimeCalendarIcon,
  AutomationAiIcon,
  PerformanceAnalyticsIcon,
  SecurityLgpdIcon,
  WebhooksIcon,
  ResponsiveMobileIcon,
  NoShowsReductionIcon,
  AiAssistant247Icon,
  ProviderTimeOptimizationIcon,
} from '@/components/ui/CustomIcons';

export const metadata = {
  title: 'Martins AI Automation — Agendamentos Inteligentes',
  description:
    'Automatize seus agendamentos com inteligência artificial. Gerencie sua agenda, reduza faltas e envie lembretes via WhatsApp automaticamente com o Agenda+ by Martins AI Automation.',
  keywords: ['agendamento', 'automação', 'whatsapp', 'IA', 'agenda inteligente', 'saas'],
};

/**
 * Página raiz — Landing Page pública.
 * Se o usuário estiver autenticado, redireciona para /agenda.
 * Caso contrário, exibe a Landing Page corporativa (Stitch Design).
 */
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/agenda');
  }

  return (
    <div
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      className="min-h-screen text-white"
    >
      {/* ─── Estilos de Animação Globais ─────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(1rem); }
          50%       { transform: translateY(-10px) translateX(1rem); }
        }
        @keyframes scan {
          0%   { top: 10%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-scan  { animation: scan 3s ease-in-out infinite alternate; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════════════
          NAV BAR — Navy Dark, sticky
      ═══════════════════════════════════════════════════════════════════════ */}
      <nav
        style={{ background: '#00020e', borderBottom: '1px solid rgba(198,198,207,0.1)' }}
        className="w-full top-0 z-50 sticky"
      >
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-[1440px] mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/logo_agenda_plus_transparent.png"
              alt="Agenda+"
              style={{
                height: '52px',
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </Link>

          {/* Links de âncora (desktop) */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { name: 'Features', href: '#features' },
              { name: 'Soluções', href: '#solucoes' },
              { name: 'Preços', href: '#precos' },
              { name: 'Sobre', href: '#sobre' },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-white/75 hover:text-[#00D4FF] transition-colors duration-200 text-sm font-semibold"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden md:flex px-4 py-2 text-sm font-bold transition-colors"
              style={{ border: '1.5px solid #00D4FF', color: '#00D4FF', borderRadius: 6 }}
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="flex px-5 py-2.5 text-sm font-bold transition-all"
              style={{
                background: '#00D4FF', color: '#0D1B3E', borderRadius: 6,
                boxShadow: '0 4px 20px rgba(0,212,255,0.3)',
              }}
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN — fundo Navy Dark
      ═══════════════════════════════════════════════════════════════════════ */}
      <main style={{ background: '#0D1B3E' }}>

        {/* ─── HERO SECTION ──────────────────────────────────────────────────── */}
        <section
          className="w-full max-w-[1440px] mx-auto px-4 md:px-8 pt-16 pb-32"
          style={{ minHeight: '86vh', display: 'grid', alignItems: 'center',
            gridTemplateColumns: 'repeat(12, 1fr)', gap: 16 }}
        >
          {/* Coluna esquerda: Texto + CTAs */}
          <div style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: 24, zIndex: 10 }}
            className="lg:!col-span-6">

            {/* Badge AI */}
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '6px 14px', borderRadius: 9999,
                border: '1px solid rgba(0,212,255,0.3)',
                background: 'rgba(0,212,255,0.1)',
                backdropFilter: 'blur(4px)',
                width: 'fit-content',
              }}
            >
              <span style={{ fontSize: 12, color: '#00D4FF', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                ✦ AI-Powered Scheduling
              </span>
            </div>

            {/* Título Principal */}
            <h1 style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 700, lineHeight: 1.15,
              letterSpacing: '-0.02em', color: '#FFFFFF', margin: 0 }}>
              Automatize seus{' '}
              <br className="hidden md:block" />
              Agendamentos com o{' '}
              <span style={{ color: '#00D4FF' }}>Poder da IA</span>
            </h1>

            {/* Subtítulo */}
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7,
              maxWidth: 520, margin: 0 }}>
              Elimine o trabalho manual. Nossa IA entende contextos complexos, otimiza sua agenda e
              envia lembretes automáticos via WhatsApp — 24 horas por dia, 7 dias por semana.
            </p>

            {/* Botões */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link
                href="/cadastro"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '14px 28px', background: '#00D4FF', color: '#0D1B3E',
                  fontWeight: 700, fontSize: 15, borderRadius: 6, textDecoration: 'none',
                  boxShadow: '0 0 24px rgba(0,212,253,0.4)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                Começar Agora →
              </Link>
              <Link
                href="#features"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '14px 28px', background: 'transparent', color: '#FFFFFF',
                  fontWeight: 700, fontSize: 15, borderRadius: 6, textDecoration: 'none',
                  border: '1.5px solid rgba(198,198,207,0.4)',
                  transition: 'border-color 0.2s',
                }}
              >
                ▶ Ver Demonstração
              </Link>
            </div>

            {/* Prova Social */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16,
              paddingTop: 24, borderTop: '1px solid rgba(198,198,207,0.15)', marginTop: 8 }}>
              <div style={{ display: 'flex' }}>
                {['#1E4DB7', '#005669', '#0D1B3E'].map((bg, i) => (
                  <div key={i}
                    style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: bg, border: '2px solid #0D1B3E',
                      marginLeft: i > 0 ? -12 : 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#00D4FF', fontWeight: 700, fontSize: 12,
                    }}
                  >
                    {['A', 'B', 'C'][i]}
                  </div>
                ))}
                <div
                  style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'rgba(0,212,255,0.15)', border: '2px solid #0D1B3E',
                    marginLeft: -12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#00D4FF', fontWeight: 700, fontSize: 11,
                  }}
                >
                  +2k
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0 }}>
                Confiado por mais de{' '}
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>2.000 profissionais</span>{' '}
                de alta performance.
              </p>
            </div>
          </div>

          {/* Coluna direita: Interface Simulada com Glassmorphism */}
          <div style={{ gridColumn: 'span 12', position: 'relative' }} className="lg:!col-span-6">
            <div
              style={{
                width: '100%', aspectRatio: '1',
                background: 'linear-gradient(135deg, #152448 0%, #0D1B3E 100%)',
                borderRadius: 16, border: '1px solid rgba(198,198,207,0.2)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
                overflow: 'hidden', position: 'relative',
              }}
            >
              {/* Orbes de brilho */}
              <div style={{
                position: 'absolute', top: '25%', right: '25%',
                width: 240, height: 240, borderRadius: '50%',
                background: 'rgba(0,212,253,0.12)', filter: 'blur(70px)',
              }} />
              <div style={{
                position: 'absolute', bottom: '25%', left: '25%',
                width: 180, height: 180, borderRadius: '50%',
                background: 'rgba(37,99,235,0.08)', filter: 'blur(55px)',
              }} />

              {/* Conteúdo da interface simulada */}
              <div style={{ position: 'absolute', inset: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Header da interface */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'rgba(0,212,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      📅
                    </div>
                    <div style={{ height: 10, width: 100, background: 'rgba(255,255,255,0.18)', borderRadius: 4 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1, 2].map((k) => (
                      <div key={k} style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                    ))}
                  </div>
                </div>

                {/* Grade de calendário simulada */}
                <div style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16,
                  display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8,
                  position: 'relative',
                }}>
                  {/* Linha de scan da IA */}
                  <div
                    className="animate-scan"
                    style={{
                      position: 'absolute', left: 0, right: 0, height: 1.5,
                      background: 'linear-gradient(90deg, transparent, #00D4FF, transparent)',
                      boxShadow: '0 0 10px #00D4FF',
                    }}
                  />

                  {[
                    { span: 1, h: 32, items: [] },
                    { span: 1, h: 64, items: ['navy'] },
                    { span: 1, h: 80, items: ['ai'] },
                    { span: 1, h: 32, items: [] },
                    { span: 1, h: 48, items: ['navy'] },
                  ].map((col, ci) => (
                    <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ height: 8, width: 32, background: 'rgba(255,255,255,0.18)', borderRadius: 3 }} />
                      {col.items.includes('navy') && (
                        <div style={{
                          height: col.h, borderRadius: 6,
                          background: 'rgba(30,77,183,0.75)', border: '1px solid #1E4DB7',
                        }} />
                      )}
                      {col.items.includes('ai') && (
                        <div style={{
                          height: col.h, borderRadius: 6,
                          background: 'rgba(0,212,253,0.15)', border: '1px solid #00D4FF',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 0 15px rgba(0,212,253,0.12)',
                        }}>
                          <span className="animate-pulse-glow" style={{ fontSize: 20 }}>✦</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notificação Flutuante */}
              <div
                className="animate-float"
                style={{
                  position: 'absolute', bottom: 24, right: 24,
                  background: '#FFFFFF', color: '#0D1B3E',
                  padding: '12px 16px', borderRadius: 10,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(198,198,207,0.3)',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#00D4FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 14 }}>✓</span>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>Reunião Confirmada</div>
                  <div style={{ fontSize: 10, color: '#515d84' }}>IA negociou o melhor horário</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FEATURES SECTION ──────────────────────────────────────────────── */}
        <section id="features" style={{ background: '#f7fafe', padding: '80px 32px' }}>
          <div className="max-w-[1440px] mx-auto">
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <span style={{
                display: 'inline-block', padding: '4px 14px', borderRadius: 9999,
                background: 'rgba(0,212,255,0.1)', color: '#00677e',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', marginBottom: 16,
              }}>
                Funcionalidades
              </span>
              <h2 style={{ fontSize: 36, fontWeight: 700, color: '#0D1B3E',
                letterSpacing: '-0.02em', margin: 0 }}>
                Tudo que você precisa para escalar
              </h2>
              <p style={{ fontSize: 16, color: '#45464E', marginTop: 16, maxWidth: 560, margin: '16px auto 0' }}>
                Uma plataforma completa para gestão de agendamentos com automação inteligente via Inteligência Artificial.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              {[
                {
                  icon: <RealTimeCalendarIcon size={24} />,
                  color: '#00D4FF',
                  bg: 'rgba(0,212,255,0.08)',
                  title: 'Agenda Visual em Tempo Real',
                  desc: 'Visualize e gerencie todos os seus agendamentos em um calendário interativo com atualização automática via Supabase Realtime.',
                },
                {
                  icon: <AutomationAiIcon size={24} />,
                  color: '#2563EB',
                  bg: 'rgba(37,99,235,0.08)',
                  title: 'Secretária Virtual no WhatsApp',
                  desc: 'Nossa inteligência artificial atua como uma secretária virtual no WhatsApp, gerenciando sua agenda e enviando lembretes automáticos.',
                },
                {
                  icon: <PerformanceAnalyticsIcon size={24} />,
                  color: '#00677e',
                  bg: 'rgba(0,103,126,0.08)',
                  title: 'Analytics de Performance',
                  desc: 'Monitore taxas de comparecimento, horários de pico e performance dos seus fluxos automatizados em tempo real.',
                },
                {
                  icon: <SecurityLgpdIcon size={24} />,
                  color: '#1E4DB7',
                  bg: 'rgba(30,77,183,0.08)',
                  title: 'Segurança e LGPD',
                  desc: 'Banco de dados online confiável de alta segurança que garante o isolamento e conformidade dos dados com a LGPD.',
                },
                {
                  icon: <WebhooksIcon size={24} />,
                  color: '#00D4FF',
                  bg: 'rgba(0,212,255,0.08)',
                  title: 'Webhooks Confiáveis',
                  desc: 'Sistema resiliente de emissão de eventos com logs, retentativas e rastreamento completo de falhas.',
                },
                {
                  icon: <ResponsiveMobileIcon size={24} />,
                  color: '#2563EB',
                  bg: 'rgba(37,99,235,0.08)',
                  title: 'Responsivo e Mobile-First',
                  desc: 'Interface adaptada para desktop e mobile, permitindo gerenciar sua agenda de qualquer lugar.',
                },
              ].map((f, i) => (
                <div key={i} style={{
                  background: '#FFFFFF', borderRadius: 12, padding: 28,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(198,198,207,0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, marginBottom: 16,
                  }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0D1B3E', margin: '0 0 8px' }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 14, color: '#45464E', lineHeight: 1.6, margin: 0 }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SOLUÇÕES SECTION ──────────────────────────────────────────────── */}
        <section id="solucoes" style={{ background: '#FFFFFF', padding: '80px 32px' }}>
          <div className="max-w-[1440px] mx-auto">
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <span style={{
                display: 'inline-block', padding: '4px 14px', borderRadius: 9999,
                background: 'rgba(37,99,235,0.08)', color: '#2563EB',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', marginBottom: 16,
              }}>
                Soluções
              </span>
              <h2 style={{ fontSize: 36, fontWeight: 700, color: '#0D1B3E',
                letterSpacing: '-0.02em', margin: 0 }}>
                Resolvendo suas maiores dores operacionais
              </h2>
              <p style={{ fontSize: 16, color: '#45464E', marginTop: 16, maxWidth: 560, margin: '16px auto 0' }}>
                Criamos soluções automatizadas para que você possa focar no que realmente importa: a excelência do seu trabalho.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
              {[
                {
                  title: 'Redução Drástica de Faltas (No-Shows)',
                  desc: 'Esqueça os clientes que se esquecem do horário. Nossa secretária virtual de IA envia mensagens e lembretes personalizados pelo WhatsApp de forma automática e integrada.',
                  icon: <NoShowsReductionIcon size={24} />,
                  bg: 'rgba(16,185,129,0.08)',
                },
                {
                  title: 'Atendimento e Reserva 24/7 com IA',
                  desc: 'Seus clientes não querem esperar. Através de integrações com assistentes de IA no WhatsApp, o agendamento é negociado e fechado na hora, mesmo de madrugada ou nos finais de semana.',
                  icon: <AiAssistant247Icon size={24} />,
                  bg: 'rgba(0,212,255,0.08)',
                },
                {
                  title: 'Otimização de Tempo do Prestador',
                  desc: 'Centralize todos os seus horários e serviços em um calendário visual inteligente. Com sincronização instantânea em tempo real para evitar conflitos de agendas.',
                  icon: <ProviderTimeOptimizationIcon size={24} />,
                  bg: 'rgba(37,99,235,0.08)',
                },
              ].map((s, i) => (
                <div key={i} className="card p-8 hover:-translate-y-1 transition-all duration-300" style={{
                  background: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  border: '1px solid rgba(198,198,207,0.3)',
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 12,
                    background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {s.icon}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0D1B3E', margin: 0 }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: 14.6, color: '#45464E', lineHeight: 1.6, margin: 0 }}>
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PREÇOS SECTION ────────────────────────────────────────────────── */}
        <section id="precos" style={{ background: '#00020e', padding: '100px 32px', position: 'relative', overflow: 'hidden' }}>
          {/* Orbe de brilho no fundo */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 400, height: 400, borderRadius: '50%',
            background: 'rgba(0,212,253,0.05)', filter: 'blur(100px)',
            pointerEvents: 'none',
          }} />

          <div className="max-w-[1440px] mx-auto relative z-10">
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <span style={{
                display: 'inline-block', padding: '4px 14px', borderRadius: 9999,
                background: 'rgba(0,212,255,0.1)', color: '#00D4FF',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', marginBottom: 16,
              }}>
                Preços
              </span>
              <h2 style={{ fontSize: 36, fontWeight: 700, color: '#FFFFFF',
                letterSpacing: '-0.02em', margin: 0 }}>
                Um único plano com tudo incluído
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginTop: 16, maxWidth: 560, margin: '16px auto 0' }}>
                Transparência total para você escalar suas operações. Sem custos ocultos ou surpresas no final do mês.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '100%', maxWidth: '500px',
                background: 'linear-gradient(135deg, #0D1B3E 0%, #152448 100%)',
                borderRadius: 16,
                border: '2px solid rgba(0,212,255,0.4)',
                boxShadow: '0 10px 40px rgba(0,212,255,0.15)',
                padding: '40px 32px',
                display: 'flex', flexDirection: 'column', gap: 28,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Plano Pro</h3>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '4px 0 0' }}>Para profissionais de alta performance</p>
                  </div>
                  <span style={{
                    padding: '6px 12px', borderRadius: 9999,
                    background: 'rgba(0,212,255,0.15)', color: '#00D4FF',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                  }}>
                    RECOMENDADO
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 48, fontWeight: 800, color: '#FFFFFF' }}>R$ 79</span>
                  <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)' }}>/ mês</span>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: 0 }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    'Agendamentos e clientes ilimitados',
                    'Assistente de IA integrada ao WhatsApp',
                    'Calendário visual e real-time no painel',
                    'Suporte prioritário via WhatsApp',
                    'Configuração de múltiplos tipos de serviços',
                    'Acesso a atualizações e novos recursos',
                  ].map((benefit, bi) => (
                    <div key={bi} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ color: '#00D4FF', fontSize: 16 }}>✓</span>
                      <span style={{ fontSize: 14.6, color: 'rgba(255,255,255,0.85)' }}>{benefit}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                  <Link
                    href="/cadastro"
                    className="btn-accent"
                    style={{
                      width: '100%',
                      padding: '14px 28px',
                      fontSize: 15,
                      textDecoration: 'none',
                      textAlign: 'center',
                    }}
                  >
                    Começar Teste Grátis de 14 Dias
                  </Link>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                    Não é necessário cartão de crédito para testar.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SOBRE SECTION ─────────────────────────────────────────────────── */}
        <section id="sobre" style={{ background: '#F4F7FB', padding: '100px 32px' }}>
          <div className="max-w-[1440px] mx-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'center' }}>
            {/* Manifesto */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <span style={{
                display: 'inline-block', padding: '4px 14px', borderRadius: 9999,
                background: 'rgba(0,103,126,0.08)', color: '#005669',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', width: 'fit-content',
              }}>
                Nossa Missão
              </span>
              <h2 style={{ fontSize: 36, fontWeight: 700, color: '#0D1B3E',
                letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2 }}>
                Gestão de tempo como uma tecnologia invisível
              </h2>
              <p style={{ fontSize: 16, color: '#45464E', lineHeight: 1.7, margin: 0 }}>
                Acreditamos que profissionais excepcionais não deveriam perder horas do dia enviando lembretes manuais, negociando horários por mensagens de texto ou lidando com faltas de última hora.
              </p>
              <p style={{ fontSize: 16, color: '#45464E', lineHeight: 1.7, margin: 0 }}>
                O **Agenda+** foi projetado para operar silenciosamente no background do seu negócio. Ele resolve a parte operacional de forma totalmente autônoma, garantindo que quando você olhar para o seu calendário, tudo o que precise fazer seja focar em entregar o seu melhor serviço.
              </p>
            </div>

            {/* Estatísticas de impacto */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
              {[
                {
                  num: '85%',
                  title: 'Redução média de No-Shows',
                  desc: 'Nossos lembretes automáticos e inteligentes via WhatsApp garantem que o cliente compareça ou avise com antecedência.',
                },
                {
                  num: '10h',
                  title: 'Economizadas por semana',
                  desc: 'Elimine as conversas de "qual horário você tem disponível?" e deixe nossa IA negociar de forma instantânea.',
                },
                {
                  num: '99.9%',
                  title: 'Disponibilidade e Realtime',
                  desc: 'Infraestrutura moderna com banco de dados online altamente confiável para garantir a estabilidade permanente da sua agenda.',
                },
              ].map((stat, si) => (
                <div key={si} className="card p-6" style={{
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 24,
                  border: '1px solid rgba(198,198,207,0.3)',
                }}>
                  <div style={{ fontSize: 40, fontWeight: 800, color: '#2563EB', minWidth: 100 }}>
                    {stat.num}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0D1B3E', margin: '0 0 4px' }}>{stat.title}</h4>
                    <p style={{ fontSize: 13, color: '#45464E', margin: 0, lineHeight: 1.5 }}>{stat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA FINAL ─────────────────────────────────────────────────────── */}
        <section style={{ background: '#0D1B3E', padding: '80px 32px', textAlign: 'center' }}>
          <div className="max-w-[640px] mx-auto">
            <h2 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 700, color: '#FFFFFF',
              letterSpacing: '-0.02em', margin: '0 0 20px' }}>
              Pronto para automatizar{' '}
              <span style={{ color: '#00D4FF' }}>sua agenda?</span>
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', margin: '0 0 40px', lineHeight: 1.6 }}>
              Junte-se a mais de 2.000 profissionais que já economizam horas por semana com o Agenda+.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/cadastro"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '16px 36px', background: '#00D4FF', color: '#0D1B3E',
                  fontWeight: 700, fontSize: 16, borderRadius: 6, textDecoration: 'none',
                  boxShadow: '0 0 32px rgba(0,212,253,0.4)',
                }}
              >
                Criar Conta Gratuitamente
              </Link>
              <Link
                href="/login"
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '16px 36px', color: 'rgba(255,255,255,0.8)',
                  fontWeight: 600, fontSize: 16, borderRadius: 6, textDecoration: 'none',
                  border: '1.5px solid rgba(198,198,207,0.3)',
                }}
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════════ */}
      <footer style={{ background: '#00020e', borderTop: '1px solid rgba(198,198,207,0.1)', padding: '40px 32px' }}>
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div style={{ textAlign: 'center' }} className="md:text-left">
            <span style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', display: 'block' }}>
              Martins AI Automation
            </span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4, display: 'block' }}>
              © {new Date().getFullYear()} Martins AI Automation. Todos os direitos reservados.
            </span>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Privacidade', 'Termos de Uso', 'Segurança', 'Contato'].map((l) => (
              <a key={l} href="#"
                className="text-white/50 hover:text-white transition-colors duration-200 text-sm font-semibold no-underline"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
