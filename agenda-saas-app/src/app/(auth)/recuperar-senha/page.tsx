import { Metadata } from 'next';
import ResetPasswordForm from './ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Definir Nova Senha | Agenda+',
  description: 'Defina sua nova senha de acesso no Agenda+',
};

export default function ResetPasswordPage() {
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
      <ResetPasswordForm />
    </main>
  );
}
