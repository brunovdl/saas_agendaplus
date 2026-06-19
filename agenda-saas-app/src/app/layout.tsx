import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Agenda+ | Agendamento Inteligente',
    template: '%s | Agenda+',
  },
  description:
    'Sistema SaaS de agendamento visual com automação via WhatsApp. Gerencie sua agenda, reduza faltas e automatize lembretes com IA — by Martins AI Automation.',
  keywords: ['agendamento', 'SaaS', 'agenda', 'automação', 'WhatsApp', 'lembretes'],
  authors: [{ name: 'Martins AI Automation' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'Agenda+ | Agendamento Inteligente',
    description: 'Sistema SaaS de agendamento inteligente com secretária virtual integrada ao WhatsApp.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
