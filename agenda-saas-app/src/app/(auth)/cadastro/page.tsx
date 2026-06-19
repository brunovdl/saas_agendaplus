'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signUpPrestador } from '@/app/(auth)/actions';
import type { CadastroFormData } from '@/lib/validations/auth';

export default function CadastroPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<CadastroFormData>({
    nome_completo: '',
    nome_negocio: '',
    telefone: '',
    email: '',
    password: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
  });

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    startTransition(async () => {
      // Normalização do telefone antes da validação e submissão
      let telefoneFormatado = '';
      if (formData.telefone) {
        const limpo = formData.telefone.replace(/[^\d+]/g, '');
        if (limpo) {
          if (!limpo.startsWith('+')) {
            if (limpo.startsWith('55') && (limpo.length === 12 || limpo.length === 13)) {
              telefoneFormatado = `+${limpo}`;
            } else {
              telefoneFormatado = `+55${limpo}`;
            }
          } else {
            telefoneFormatado = limpo;
          }
        }
      }

      if (telefoneFormatado && !/^\+[1-9]\d{7,14}$/.test(telefoneFormatado)) {
        setError('O telefone digitado é inválido. Certifique-se de incluir o DDD (ex: (11) 99999-9999).');
        return;
      }

      const payload = {
        ...formData,
        telefone: telefoneFormatado || undefined,
      };

      const res = await signUpPrestador(payload);

      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccessMsg(res.message);
        // Timeout para dar tempo de ler, se não houver redirect instantâneo na action
        setTimeout(() => {
          router.push('/login');
        }, 4000);
      }
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* ─── Painel Esquerdo: Formulário ────────────────────────── */}
      <div style={{
        flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px', background: '#F4F7FB', overflowY: 'auto'
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#181C1F', margin: '0 0 6px' }}>
              Criar sua conta Agenda+
            </h2>
            <p style={{ color: '#45464E', fontSize: '14px', margin: 0 }}>
              Configure seu negócio em menos de 2 minutos.
            </p>
          </div>

          {successMsg ? (
            <div style={{
              padding: '20px', borderRadius: '12px',
              background: '#D1FAE5', border: '1px solid #10B981',
              textAlign: 'center',
            }}>
              <p style={{ color: '#065F46', fontWeight: 600, margin: '0 0 8px' }}>🎉 Conta criada!</p>
              <p style={{ color: '#065F46', fontSize: '14px', margin: 0 }}>
                {successMsg} Redirecionando para o login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label htmlFor="nome_completo" className="label">Nome Completo</label>
                <input
                  id="nome_completo"
                  name="nome_completo"
                  type="text"
                  className="input"
                  placeholder="Seu nome"
                  value={formData.nome_completo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="nome_negocio" className="label">Nome do Negócio</label>
                <input
                  id="nome_negocio"
                  name="nome_negocio"
                  type="text"
                  className="input"
                  placeholder="Ex: Martins Barber"
                  value={formData.nome_negocio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="telefone" className="label">WhatsApp (Opcional)</label>
                <input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  className="input"
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={handleChange}
                />
                <p style={{ fontSize: '12px', color: '#76767F', marginTop: '4px' }}>
                  O código do país (+55) será adicionado automaticamente se não for inserido.
                </p>
              </div>

              <div>
                <label htmlFor="email" className="label">E-mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="label">Senha</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="input"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <p className="error-msg" role="alert">{error}</p>
              )}

              <button
                id="btn-signup"
                type="submit"
                className="btn-primary"
                disabled={isPending}
                style={{ width: '100%', padding: '12px', marginTop: '4px' }}
              >
                {isPending ? 'Criando conta...' : 'Começar a usar'}
              </button>

              <p style={{ textAlign: 'center', fontSize: '14px', color: '#45464E', margin: 0, marginTop: '8px' }}>
                Já tem conta?{' '}
                <a href="/login" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
                  Fazer login
                </a>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* ─── Painel Direito: Hero Navy (Invertido em relação ao Login) ──────── */}
      <div
        style={{
          display: 'none',
          flex: '1',
          background: 'linear-gradient(135deg, #152448 0%, #0D1B3E 60%, #0D1B3E 100%)',
          padding: '48px',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="hero-panel"
      >
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <img
            src="/logo_agenda_plus_transparent.png"
            alt="Agenda+"
            style={{
              height: '64px',
              width: 'auto',
              objectFit: 'contain',
              marginBottom: '24px',
              display: 'inline-block',
            }}
          />
          <h1 style={{ color: '#FFFFFF', fontSize: '36px', fontWeight: 700, lineHeight: 1.2, margin: '0 0 16px' }}>
            Potencialize seus <br /> agendamentos
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '18px', lineHeight: 1.5, margin: 0, maxWidth: '400px' }}>
            Automatize lembretes via WhatsApp, reduza faltas e poupe horas da sua semana com o Agenda+.
          </p>
        </div>
        
        {/* Glows */}
        <div style={{
          position: 'absolute', top: '10%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)', pointerEvents: 'none'
        }} />
      </div>

      <style>{`
        @media (min-width: 768px) {
          .hero-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
