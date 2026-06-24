'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { redefinirSenha } from '../actions';

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      router.push('/agenda');
      router.refresh();
    }
  }, [success, countdown, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validação inicial antes de chamar o servidor
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const response = await redefinirSenha({ password, confirmPassword });
      if (response.error) {
        setError(response.error);
      } else if (response.success) {
        setSuccess(response.message || 'Sua senha foi atualizada com sucesso!');
      }
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro inesperado ao atualizar sua senha.');
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
          Definir nova senha
        </h1>
        <p style={{ color: '#45464E', fontSize: '14px', margin: 0, textAlign: 'center' }}>
          Crie uma nova senha segura para acessar sua conta
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
          gap: '8px',
        }}>
          <p style={{ color: '#065F46', fontWeight: 600, margin: 0 }}>🎉 Senha redefinida!</p>
          <p style={{ color: '#065F46', fontSize: '14px', margin: 0 }}>
            {success}
          </p>
          <p style={{ color: '#065F46', fontSize: '13px', margin: 0, opacity: 0.85 }}>
            Redirecionando para a sua agenda em {countdown} segundo{countdown > 1 ? 's' : ''}...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', background: '#FFFFFF' }}>
          <div>
            <label htmlFor="reset-password" className="label">Nova Senha</label>
            <input
              id="reset-password"
              type="password"
              className="input"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="reset-confirm-password" className="label">Confirmar Nova Senha</label>
            <input
              id="reset-confirm-password"
              type="password"
              className="input"
              placeholder="Confirme a nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="error-msg" role="alert" style={{ margin: 0 }}>{error}</p>
          )}

          <button
            id="reset-submit"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px' }}
          >
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      )}
    </div>
  );
}
