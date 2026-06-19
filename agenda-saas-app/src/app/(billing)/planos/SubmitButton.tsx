'use client';

import { useFormStatus } from 'react-dom';

interface SubmitButtonProps {
  label: string;
  isActive?: boolean;
}

export default function SubmitButton({ label, isActive }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || isActive}
      className={`w-full py-3 px-6 rounded-xl font-bold text-sm shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
        isActive
          ? 'bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 cursor-default'
          : pending
          ? 'bg-[#00D4FF]/50 text-[#0D1B3E] cursor-wait'
          : 'bg-[#00D4FF] text-[#0D1B3E] hover:bg-[#00D4FF]/90 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
      }`}
    >
      {pending && (
        <svg className="animate-spin h-4 w-4 text-[#0D1B3E]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {pending ? 'Redirecionando...' : label}
    </button>
  );
}
