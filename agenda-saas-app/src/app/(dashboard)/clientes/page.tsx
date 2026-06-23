'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import Link from 'next/link';
import { getClientes, createCliente } from './actions';
import { Plus, Search, User, Phone, Mail, Calendar as CalendarIcon, ArrowRight, X } from 'lucide-react';
import type { ClienteFormData } from '@/lib/validations/cliente';
import type { Cliente } from '@/types/supabase';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Formulário
  const [formData, setFormData] = useState<ClienteFormData>({
    nome: '',
    telefone: '',
    email: '',
    data_nascimento: '',
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Carregar e filtrar clientes
  const carregarClientes = async (termo?: string) => {
    const dados = await getClientes(termo);
    setClientes(dados as Cliente[]);
  };

  // Debounce de 300ms na busca — evita chamadas excessivas ao servidor
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      carregarClientes(busca);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [busca]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await createCliente(formData);
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        setIsModalOpen(false);
        setFormData({ nome: '', telefone: '', email: '', data_nascimento: '' });
        carregarClientes(busca);
      }
    });
  };

  return (
    <div className="flex-1 overflow-y-auto w-full">
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <header className="hidden md:flex justify-between items-center px-8 py-6 border-b border-[#C6C6CF]/20 bg-white sticky top-0 z-20 shadow-sm">
        <div>
          <h2 className="text-[32px] font-bold leading-[1.3] text-[#0D1B3E]">Clientes</h2>
          <p className="text-sm text-[#45464E] mt-1">Gerencie a base de clientes do seu negócio e acesse seus profiles.</p>
        </div>
      </header>

      {/* Header Mobile */}
      <div className="md:hidden flex justify-between items-center px-4 py-4 bg-white border-b border-gray-200">
        <h2 className="text-xl font-bold text-[#0D1B3E]">Clientes</h2>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Barra de Busca */}
        <div className="relative mb-6">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Buscar por nome ou número de WhatsApp..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-[#E8ECF0] rounded-[8px] text-sm text-[#181C1F] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors bg-white shadow-sm"
          />
        </div>

        {/* Listagem */}
        {clientes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-12 text-center border border-[#C6C6CF]/20">
            <div className="w-16 h-16 bg-[#EBEEF2] rounded-full flex items-center justify-center mx-auto mb-4 text-[#0D1B3E]">
              <User size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#0D1B3E] mb-1">Nenhum cliente encontrado</h3>
            <p className="text-sm text-[#76767F] max-w-md mx-auto mb-6">
              {busca ? 'Nenhum resultado corresponde à sua busca.' : 'Sua base de clientes ainda está vazia. Cadastre o primeiro manualmente ou através do agendamento de horários.'}
            </p>
            {!busca && (
              <button
                onClick={() => { setErrorMsg(null); setIsModalOpen(true); }}
                className="px-5 py-2.5 bg-[#2563EB] text-white font-bold text-sm rounded-[6px] hover:bg-blue-700 transition-colors"
              >
                Cadastrar Cliente
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] overflow-hidden border border-[#C6C6CF]/20">
            <div className="divide-y divide-[#C6C6CF]/20">
              {clientes.map((cliente) => (
                <div
                  key={cliente.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#E0E7FF] border border-blue-100 flex items-center justify-center text-[#2563EB] font-bold text-lg shrink-0">
                      {cliente.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0D1B3E] text-base">{cliente.nome}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-[#76767F]">
                        <span className="flex items-center gap-1.5">
                          <Phone size={12} className="text-blue-500" />
                          {cliente.telefone}
                        </span>
                        {cliente.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail size={12} className="text-blue-500" />
                            {cliente.email}
                          </span>
                        )}
                        {cliente.data_nascimento && (
                          <span className="flex items-center gap-1.5">
                            <CalendarIcon size={12} className="text-blue-500" />
                            {new Date(cliente.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/clientes/${cliente.id}`}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-200 text-sm font-bold text-[#0D1B3E] rounded-lg hover:bg-[#EBEEF2] hover:border-gray-300 transition-colors shrink-0"
                  >
                    Ver Perfil
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Modal de Novo Cliente ────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] w-full max-w-md overflow-hidden relative border border-[#C6C6CF]/20">
            {/* Cabeçalho */}
            <div className="px-6 py-4 border-b border-[#C6C6CF]/20 flex justify-between items-center bg-[#F8FAFC]">
              <h3 className="font-bold text-lg text-[#0D1B3E]">Novo Cliente</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-bold text-xs text-[#45464E] uppercase tracking-wider mb-1" htmlFor="nome">
                  Nome Completo
                </label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  required
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Nome do cliente"
                  className="w-full px-3 py-2 border border-[#E8ECF0] rounded-[6px] text-sm text-[#181C1F] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-xs text-[#45464E] uppercase tracking-wider mb-1" htmlFor="telefone">
                  WhatsApp
                </label>
                <input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  required
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  className="w-full px-3 py-2 border border-[#E8ECF0] rounded-[6px] text-sm text-[#181C1F] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors bg-white"
                />
                <p className="text-[10px] text-gray-500 mt-1">O código de país (+55) é adicionado automaticamente se omitido.</p>
              </div>

              <div>
                <label className="block font-bold text-xs text-[#45464E] uppercase tracking-wider mb-1" htmlFor="email">
                  E-mail (Opcional)
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="cliente@email.com"
                  className="w-full px-3 py-2 border border-[#E8ECF0] rounded-[6px] text-sm text-[#181C1F] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-xs text-[#45464E] uppercase tracking-wider mb-1" htmlFor="data_nascimento">
                  Data de Nascimento (Opcional)
                </label>
                <input
                  id="data_nascimento"
                  name="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#E8ECF0] rounded-[6px] text-sm text-[#181C1F] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors bg-white"
                />
              </div>

              {errorMsg && (
                <p className="text-xs font-semibold text-[#BA1A1A]" role="alert">{errorMsg}</p>
              )}

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[#C6C6CF]/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-sm font-bold text-gray-600 rounded-[6px] hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-[#0D1B3E] text-white font-bold text-sm rounded-[6px] hover:bg-[#152448] transition-colors shadow-sm disabled:opacity-50"
                >
                  {isPending ? 'Salvando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Floating Action Button (FAB) / Widget flutuante para criar novo cliente */}
      <button
        onClick={() => { setErrorMsg(null); setIsModalOpen(true); }}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 w-14 h-14 bg-[#00D4FF] hover:bg-[#00A8CC] text-[#0D1B3E] rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]"
        title="Novo Cliente"
        aria-label="Novo Cliente"
      >
        <Plus size={24} strokeWidth={3} />
      </button>
    </div>
  );
}
