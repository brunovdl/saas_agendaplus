'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// ─── Ícones Material Symbols (inline SVG para evitar dependência) ─────────────
const icons: Record<string, React.ReactNode> = {
  dashboard: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
    </svg>
  ),
  calendar: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  ),
  sparkles: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
      <path d="M5 19l.75 2.25L8 22l-2.25.75L5 25l-.75-2.25L2 22l2.25-.75L5 19z" opacity="0.6"/>
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  insights: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
};

const navItems = [
  { name: 'Agenda', href: '/agenda', iconKey: 'calendar' },
  { name: 'Agendamentos', href: '/agendamentos', iconKey: 'sparkles' },
  { name: 'Clientes', href: '/clientes', iconKey: 'users' },
  { name: 'Configurações', href: '/configuracoes', iconKey: 'settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <aside
      className="hidden md:flex flex-col h-full py-6 px-4 flex-shrink-0 z-10 relative print:hidden"
      style={{
        width: 256,
        background: '#FFFFFF',
        borderRight: '1px solid rgba(198,198,207,0.4)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}
    >
      {/* ─── Logo ─────────────────────────────────────────────────────── */}
      <div className="mb-10 px-2">
        <img
          src="/logo_agenda_plus_light_bg.png"
          alt="Agenda+"
          style={{
            height: '42px',
            width: 'auto',
            objectFit: 'contain',
            display: 'block',
          }}
        />
        <p className="text-sm text-[#45464E] mt-1">Pro Plan</p>
      </div>

      {/* ─── Navegação ────────────────────────────────────────────────── */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = item.href === '/agenda'
            ? pathname === '/agenda' || pathname.startsWith('/agenda/')
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 font-bold text-sm transition-all rounded-lg group"
              style={{
                color: isActive ? '#00677e' : '#45464E',
                background: isActive ? 'rgba(0,210,253,0.08)' : 'transparent',
                borderRight: isActive ? '3px solid #00677e' : '3px solid transparent',
                borderRadius: isActive ? '8px 0 0 8px' : '8px',
              }}
            >
              <span style={{ color: isActive ? '#00677e' : '#2563EB' }}>
                {icons[item.iconKey]}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* ─── Rodapé: Avatar + Automate Now ────────────────────────────── */}
      <div
        className="mt-auto pt-5 flex flex-col gap-3"
        style={{ borderTop: '1px solid rgba(198,198,207,0.3)' }}
      >
        {/* Botão Automate Now (Cyan) */}
        <button
          className="w-full flex items-center justify-center gap-2 py-2.5 font-bold text-sm rounded-lg transition-all"
          style={{
            background: '#00D4FF',
            color: '#0D1B3E',
            boxShadow: '0 2px 12px rgba(0,212,255,0.3)',
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z"/>
          </svg>
          Automate Now
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 font-bold text-sm rounded-lg transition-colors"
          style={{ color: '#45464E', border: '1px solid rgba(198,198,207,0.4)' }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sair
        </button>
      </div>
    </aside>
  );
}
