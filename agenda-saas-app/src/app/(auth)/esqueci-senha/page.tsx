import { Metadata } from 'next';
import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Recuperar Senha | Agenda+',
  description: 'Recupere o acesso à sua conta no Agenda+',
};

export default function ForgotPasswordPage() {
  return (
    <main
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F4F7FB',
        padding: '24px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <ForgotPasswordForm />
    </main>
  );
}
