'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Sparkles, Settings, Users } from 'lucide-react';

const navItems = [
  { name: 'Agenda', href: '/agenda', icon: Calendar },
  { name: 'Auto', href: '/agendamentos', icon: Sparkles },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Configs', href: '/configuracoes', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden flex justify-around items-center bg-white border-t border-gray-200 py-3 px-4 w-full print:hidden">
      {navItems.map((item) => {
        const isActive = item.href === '/agenda'
          ? pathname === '/agenda' || pathname.startsWith('/agenda/')
          : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center ${
              isActive ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[10px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
