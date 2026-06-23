'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export default function AgendamentoFiltros() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showAvancados, setShowAvancados] = useState(false);

  // Helper para data local de hoje YYYY-MM-DD
  const getLocalDateString = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localD = new Date(d.getTime() - offset * 60 * 1000);
    return localD.toISOString().split('T')[0];
  };

  // Estados locais para controlar os inputs e debouncing do nome
  const [nome, setNome] = useState(searchParams.get('nome') || '');
  const status = searchParams.get('status') || 'todos';
  
  // Data padrão no input
  const data = searchParams.has('data') 
    ? (searchParams.get('data') || '') 
    : getLocalDateString();

  // Função geral para atualizar os filtros na URL
  const updateFilters = (updates: { nome?: string; status?: string; data?: string }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.nome !== undefined) {
      if (updates.nome.trim()) {
        params.set('nome', updates.nome.trim());
      } else {
        params.delete('nome');
      }
    }

    if (updates.status !== undefined) {
      if (updates.status && updates.status !== 'todos') {
        params.set('status', updates.status);
      } else {
        params.delete('status');
      }
    }

    if (updates.data !== undefined) {
      params.set('data', updates.data);
    }

    params.delete('page');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Debounce de 300ms para a digitação do Nome do Cliente
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentNome = searchParams.get('nome') || '';
      if (nome.trim() !== currentNome) {
        updateFilters({ nome });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [nome]);

  // Sincroniza o estado do input se o parâmetro de busca for limpo externamente
  useEffect(() => {
    const externalNome = searchParams.get('nome') || '';
    // Guard: só atualiza se o valor externo mudou (evita cascading render ao digitar)
    if (externalNome !== nome) {
      const timer = setTimeout(() => {
        setNome(externalNome);
      }, 0);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleLimparFiltros = () => {
    setNome('');
    startTransition(() => {
      router.push(pathname);
    });
  };

  const temFiltroAtivo = searchParams.has('nome') || searchParams.has('status') || searchParams.has('data');
  const temFiltrosAvancadosAtivos = (status && status !== 'todos') || searchParams.has('data');

  return (
    <div className="card p-4 md:p-5 mb-6 md:mb-8 border border-[#C6C6CF]/20">
      
      {/* Linha Principal (Exclusiva do Mobile — Compacta) */}
      <div className="flex gap-2 items-end md:hidden">
        <div className="relative flex-1">
          <label className="label" htmlFor="filter-nome-mobile">Nome do Cliente</label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-[#76767F]">
              <Search size={18} />
            </span>
            <input
              id="filter-nome-mobile"
              type="text"
              className="input pl-9"
              placeholder="Buscar por nome..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
        </div>

        {/* Botão de Funil / Sliders */}
        <button
          id="btn-toggle-filtros"
          onClick={() => setShowAvancados(!showAvancados)}
          className={`h-[42px] px-3 flex items-center justify-center border-[1.5px] rounded-md transition-colors duration-150 relative ${
            showAvancados || temFiltrosAvancadosAtivos
              ? 'border-brand-blue bg-brand-blue/5 text-brand-blue'
              : 'border-outline-variant text-[#45464E] hover:bg-gray-50'
          }`}
          title="Mais Filtros"
          aria-label="Mais Filtros"
        >
          <SlidersHorizontal size={20} />
          {temFiltrosAvancadosAtivos && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#BA1A1A] rounded-full border border-white" />
          )}
        </button>
      </div>

      {/* Grid Desktop / Seção Expansível Mobile */}
      <div 
        className={`${
          showAvancados ? 'flex flex-col gap-4 mt-4' : 'hidden'
        } md:grid md:grid-cols-4 md:gap-4 md:items-end`}
      >
        {/* Nome do Cliente (Oculto no mobile porque já está no cabeçalho) */}
        <div className="hidden md:block relative">
          <label className="label" htmlFor="filter-nome-desktop">Nome do Cliente</label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-[#76767F]">
              <Search size={18} />
            </span>
            <input
              id="filter-nome-desktop"
              type="text"
              className="input pl-9"
              placeholder="Buscar por nome..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="label" htmlFor="filter-status">Status</label>
          <select
            id="filter-status"
            className="input font-medium"
            value={status}
            onChange={(e) => updateFilters({ status: e.target.value })}
          >
            <option value="todos">Todos os Status</option>
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="remarcado">Remarcado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {/* Data */}
        <div>
          <label className="label" htmlFor="filter-data">Data</label>
          <input
            id="filter-data"
            type="date"
            className="input"
            value={data}
            onChange={(e) => updateFilters({ data: e.target.value })}
          />
        </div>

        {/* Ações / Limpar Filtros */}
        <div className="flex gap-2 items-center h-[42px] sm:h-auto mt-2 md:mt-0">
          {temFiltroAtivo && (
            <button
              id="btn-limpar-filtros"
              onClick={handleLimparFiltros}
              className="btn-secondary w-full flex items-center justify-center gap-1 hover:border-red-400 hover:text-red-500 transition-colors"
              title="Limpar todos os filtros"
              disabled={isPending}
            >
              <X size={16} />
              Limpar Filtros
            </button>
          )}
          {isPending && (
            <span className="text-xs text-[#76767F] ml-auto pr-2 animate-pulse self-center">
              Buscando...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
