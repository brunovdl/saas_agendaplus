'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface MobileHeaderProps {
  title: string;
  backHref?: string;
  rightAction?: React.ReactNode;
}

export default function MobileHeader({ title, backHref, rightAction }: MobileHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-nav md:hidden w-full select-none">
      <div className="flex items-center justify-start w-12">
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-9 h-9 -ml-1 text-gray-700 hover:text-gray-900 active:bg-gray-100 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
      </div>
      
      <h1 className="flex-1 text-center font-bold text-gray-800 text-base truncate px-1">
        {title}
      </h1>
      
      <div className="flex items-center justify-end w-12">
        {rightAction ? rightAction : <div className="w-9" />}
      </div>
    </header>
  );
}
