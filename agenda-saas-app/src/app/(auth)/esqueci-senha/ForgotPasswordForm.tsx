'use client';

import { useState } from 'react';
import { solicitarRecuperacaoSenha } from '../actions';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await solicitarRecuperacaoSenha({ email });
      if (response.error) {
        setError(response.error);
      } else if (response.success) {
        setSuccess(response.message || 'E-mail enviado com sucesso!');
      }
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro inesperado. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '400px' }}>
      {/* Header */}
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
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#181C1F', margin: '0 0 6px', textAlign: 'center' }}>
          Recuperar sua senha
        </h1>
        <p style={{ color: '#45464E', fontSize: '14px', margin: 0, textAlign: 'center' }}>
          Digite o seu e-mail cadastrado para receber as instruções
        </p>
      </div>

      {success ? (
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: '#D1FAE5',
          border: '1px solid #10B981',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <p style={{ color: '#065F46', fontWeight: 600, margin: 0 }}>✉️ E-mail enviado!</p>
          <p style={{ color: '#065F46', fontSize: '14px', margin: 0 }}>
            {success}
          </p>
          <a
            id="forgot-success-back-to-login"
            href="/login"
            className="btn-primary"
            style={{ textDecoration: 'none', width: '100%', padding: '12px' }}
          >
            Voltar para o login
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', background: '#FFFFFF' }}>
          <div>
            <label htmlFor="forgot-email" className="label">E-mail de cadastro</label>
            <input
              id="forgot-email"
              type="email"
              className="input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="error-msg" role="alert" style={{ margin: 0 }}>{error}</p>
          )}

          <button
            id="forgot-submit"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px' }}
          >
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <a
              id="forgot-back-to-login"
              href="/login"
              style={{ fontSize: '14px', color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}
            >
              Voltar para o login
            </a>
          </div>
        </form>
      )}
    </div>
  );
}
