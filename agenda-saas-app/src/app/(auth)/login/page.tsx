'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Página de Login — Design System Martins AI Automation
 * Split layout: Hero dark (Navy) + Formulário light
 */
export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      if (authError.message.includes('Email not confirmed')) {
        setError('Por favor, confirme seu e-mail antes de realizar o login. Verifique sua caixa de entrada.');
      } else {
        setError('E-mail ou senha incorretos. Verifique e tente novamente.');
      }
      setLoading(false);
      return;
    }

    router.push('/agenda');
    router.refresh();
  }

  async function handleMagicLink() {
    if (!email) {
      setError('Informe seu e-mail para receber o link de acesso.');
      return;
    }
    setLoading(true);
    setError(null);

    const { error: magicError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (magicError) {
      setError('Não foi possível enviar o link. Tente novamente.');
    } else {
      setMagicLinkSent(true);
    }
    setLoading(false);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* ─── Painel Esquerdo: Hero Navy ────────────────────────── */}
      <div
        style={{
          display: 'none',
          flex: '1',
          background: 'linear-gradient(135deg, #0D1B3E 0%, #152448 60%, #0D1B3E 100%)',
          padding: '48px',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          gap: '32px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="hero-panel"
      >
        {/* Glow decorativo */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '300px', height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-40px',
          width: '200px', height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <img
            src="/logo_agenda_plus_transparent.png"
            alt="Agenda+"
            style={{
              height: '42px',
              width: 'auto',
              objectFit: 'contain',
              alignSelf: 'flex-start',
            }}
          />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '4px 0 0 0', paddingLeft: '4px' }}>
            by Martins AI Automation
          </p>
        </div>

        {/* Interface Simulada Animada (da Landing Page) */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
          <div
            style={{
              width: '100%',
              aspectRatio: '1.25',
              background: 'linear-gradient(135deg, #152448 0%, #0D1B3E 100%)',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              position: 'relative',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Orbes de brilho */}
            <div style={{
              position: 'absolute', top: '10%', right: '10%',
              width: 150, height: 150, borderRadius: '50%',
              background: 'rgba(0,212,253,0.08)', filter: 'blur(50px)',
            }} />

            {/* Header da interface */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
              padding: '10px 14px',
              zIndex: 2,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: 'rgba(0,212,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px'
                }}>
                  📅
                </div>
                <div style={{ height: 10, width: 100, background: 'rgba(255,255,255,0.18)', borderRadius: 4 }} />
              </div>
            </div>

            {/* Grade de calendário simulada */}
            <div style={{
              flex: 1,
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8,
              padding: '16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              position: 'relative',
              zIndex: 2,
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
                { h: 36, items: [] },
                { h: 60, items: ['navy'] },
                { h: 76, items: ['ai'] },
                { h: 36, items: [] },
                { h: 48, items: ['navy'] },
              ].map((col, ci) => (
                <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ height: 8, width: 32, background: 'rgba(255,255,255,0.12)', borderRadius: 2 }} />
                  {col.items.includes('navy') && (
                    <div style={{
                      height: col.h, borderRadius: 6,
                      background: 'rgba(30,77,183,0.6)', border: '1px solid rgba(30,77,183,0.8)',
                    }} />
                  )}
                  {col.items.includes('ai') && (
                    <div style={{
                      height: col.h, borderRadius: 6,
                      background: 'rgba(0,212,253,0.12)', border: '1px solid #00D4FF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 0 10px rgba(0,212,253,0.08)',
                    }}>
                      <span className="animate-pulse-glow" style={{ fontSize: 16, color: '#00D4FF' }}>✦</span>
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
              position: 'absolute', bottom: -12, right: -12,
              background: '#FFFFFF', color: '#0D1B3E',
              padding: '8px 12px', borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              border: '1px solid rgba(198,198,207,0.2)',
              display: 'flex', alignItems: 'center', gap: 8,
              zIndex: 3,
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: '#00D4FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', color: '#0D1B3E', fontWeight: 'bold'
            }}>
              ✓
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 700, fontSize: 10, lineHeight: '1.2' }}>Confirmado por IA</div>
              <div style={{ fontSize: 8, color: '#515d84', lineHeight: '1.2' }}>via WhatsApp</div>
            </div>
          </div>
        </div>

        {/* Tagline / Features */}
        <div>
          <h1 style={{ color: '#FFFFFF', fontSize: '30px', fontWeight: 700, lineHeight: 1.3, margin: '0 0 12px' }}>
            Sua agenda no{' '}
            <span style={{ color: '#00D4FF' }}>piloto automático</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '15px', lineHeight: 1.5, margin: 0 }}>
            Gerencie agendamentos, reduza faltas e automatize lembretes via WhatsApp com uma secretária virtual inteligente.
          </p>

          {/* Features */}
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Agenda visual em tempo real', 'Lembretes automáticos via WhatsApp', 'Proteção total de dados (LGPD)'].map((feat) => (
              <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,212,255,0.2)', border: '1px solid #00D4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#00D4FF', fontSize: '11px' }}>✓</span>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Painel Direito: Formulário ────────────────────────── */}
      <div style={{
        flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px', background: '#F4F7FB',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Header mobile logo */}
          <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src="/logo_agenda_plus_light_bg.png"
              alt="Agenda+"
              style={{
                height: '52px',
                width: 'auto',
                objectFit: 'contain',
                marginBottom: '20px',
              }}
            />
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#181C1F', margin: '0 0 6px', textAlign: 'center' }}>
              Entrar na sua conta
            </h2>
            <p style={{ color: '#45464E', fontSize: '14px', margin: 0, textAlign: 'center' }}>
              Acesse o Agenda+ e gerencie sua agenda
            </p>
          </div>

          {magicLinkSent ? (
            <div style={{
              padding: '20px', borderRadius: '12px',
              background: '#D1FAE5', border: '1px solid #10B981',
              textAlign: 'center',
            }}>
              <p style={{ color: '#065F46', fontWeight: 600, margin: '0 0 8px' }}>✉️ Link enviado!</p>
              <p style={{ color: '#065F46', fontSize: '14px', margin: 0 }}>
                Verifique seu e-mail <strong>{email}</strong> e clique no link de acesso.
              </p>
            </div>
          ) : (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="email" className="label">E-mail</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label htmlFor="password" className="label" style={{ margin: 0 }}>Senha</label>
                  <a href="/esqueci-senha" style={{ fontSize: '13px', color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>
                    Esqueci minha senha?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <p className="error-msg" role="alert">{error}</p>
              )}

              <button
                id="btn-login"
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '12px', marginTop: '4px' }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <div style={{ position: 'relative', textAlign: 'center', margin: '4px 0' }}>
                <hr style={{ border: 'none', borderTop: '1px solid #C6C6CF' }} />
                <span style={{
                  position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                  background: '#F4F7FB', padding: '0 12px',
                  fontSize: '12px', color: '#76767F',
                }}>ou</span>
              </div>

              <button
                id="btn-magic-link"
                type="button"
                className="btn-outline"
                onClick={handleMagicLink}
                disabled={loading}
                style={{ width: '100%', padding: '12px' }}
              >
                ✨ Entrar sem senha (Magic Link)
              </button>

              <p style={{ textAlign: 'center', fontSize: '14px', color: '#45464E', margin: 0 }}>
                Não tem conta?{' '}
                <a href="/cadastro" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
                  Criar conta grátis
                </a>
              </p>
            </form>
          )}
        </div>
      </div>

      <style>{`
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

        @media (min-width: 768px) {
          .hero-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
