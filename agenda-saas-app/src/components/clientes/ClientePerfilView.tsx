'use client';

import { useState, useTransition } from 'react';
import { saveAnamnese, addHistoricoServico, updateCliente } from '@/app/(dashboard)/clientes/actions';
import { Calendar as CalendarIcon, User, Phone, Mail, FileText, Wrench, Plus, Check, Clock, Edit3, X } from 'lucide-react';
import type { ClienteFormData, AnamneseFormData, HistoricoServicoFormData } from '@/lib/validations/cliente';
import type { AnamnesePodologia } from '@/types/supabase';
import AnamnesePodologiaForm from './AnamnesePodologiaForm';

interface ClientePerfilViewProps {
  dados: {
    cliente: {
      id: string;
      nome: string;
      telefone: string;
      email: string | null;
      data_nascimento: string | null;
    };
    anamnese: {
      alergias: string | null;
      medicamentos: string | null;
      doencas_cronicas: string | null;
      queixa_principal: string | null;
      observacoes: string | null;
    } | null;
    anamnesePodologia?: AnamnesePodologia | null;
    historico: Array<{
      id: string;
      data_servico: string;
      descricao: string;
      valor: number | null;
      observacoes: string | null;
    }>;
    agendamentos: Array<{
      id: string;
      data_hora_inicio: string;
      data_hora_fim: string;
      status: string;
      observacoes: string | null;
    }>;
  };
  nicho: 'saude_estetica' | 'servicos_manutencao' | 'podologia';
}

export default function ClientePerfilView({ dados, nicho }: ClientePerfilViewProps) {
  const { cliente, anamnese, anamnesePodologia, historico, agendamentos } = dados;
  const [activeTab, setActiveTab] = useState<'geral' | 'nicho'>('geral');
  const [isPending, startTransition] = useTransition();

  // Edição de dados cadastrais
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [cadastroForm, setCadastroForm] = useState<ClienteFormData>({
    nome: cliente.nome,
    telefone: cliente.telefone,
    email: cliente.email || '',
    data_nascimento: cliente.data_nascimento || '',
  });
  const [cadastroError, setCadastroError] = useState<string | null>(null);

  // Form de Anamnese
  const [anamneseForm, setAnamneseForm] = useState<AnamneseFormData>({
    alergias: anamnese?.alergias || '',
    medicamentos: anamnese?.medicamentos || '',
    doencas_cronicas: anamnese?.doencas_cronicas || '',
    queixa_principal: anamnese?.queixa_principal || '',
    observacoes: anamnese?.observacoes || '',
  });
  const [anamneseSaved, setAnamneseSaved] = useState(false);
  const [anamneseError, setAnamneseError] = useState<string | null>(null);

  // Form de Novo Serviço
  const [isServicoModalOpen, setIsServicoModalOpen] = useState(false);
  const [servicoForm, setServicoForm] = useState<{
    data_servico: string;
    descricao: string;
    valor: string;
    observacoes: string;
  }>({
    data_servico: new Date().toISOString().split('T')[0] || '',
    descricao: '',
    valor: '',
    observacoes: '',
  });
  const [servicoError, setServicoError] = useState<string | null>(null);

  // Ações de cadastro
  const handleUpdateCadastro = (e: React.FormEvent) => {
    e.preventDefault();
    setCadastroError(null);
    startTransition(async () => {
      const res = await updateCliente(cliente.id, cadastroForm);
      if (res?.error) {
        setCadastroError(res.error);
      } else {
        setIsEditModalOpen(false);
        window.location.reload();
      }
    });
  };

  // Ação de Salvar Anamnese
  const handleSaveAnamnese = (e: React.FormEvent) => {
    e.preventDefault();
    setAnamneseError(null);
    setAnamneseSaved(false);
    startTransition(async () => {
      const res = await saveAnamnese(cliente.id, anamneseForm);
      if (res?.error) {
        setAnamneseError(res.error);
      } else {
        setAnamneseSaved(true);
        setTimeout(() => setAnamneseSaved(false), 3000);
      }
    });
  };

  // Ação de Salvar Serviço
  const handleAddServico = (e: React.FormEvent) => {
    e.preventDefault();
    setServicoError(null);
    startTransition(async () => {
      const valorNumerico = parseFloat(servicoForm.valor) || 0;
      const res = await addHistoricoServico({
        cliente_id: cliente.id,
        data_servico: servicoForm.data_servico,
        descricao: servicoForm.descricao,
        valor: valorNumerico,
        observacoes: servicoForm.observacoes,
      });

      if (res?.error) {
        setServicoError(res.error);
      } else {
        setIsServicoModalOpen(false);
        setServicoForm({
          data_servico: new Date().toISOString().split('T')[0] || '',
          descricao: '',
          valor: '',
          observacoes: '',
        });
        window.location.reload();
      }
    });
  };

  // Exportar Ficha para Word (.doc)
  const exportToDocx = () => {
    const title = `Anamnese - ${cliente.nome}`;
    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.5; color: #333; }
          h1 { text-align: center; color: #0d1b3e; font-size: 24px; border-bottom: 2px solid #0d1b3e; padding-bottom: 10px; }
          h3 { color: #0d1b3e; font-size: 16px; margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          p { font-size: 14px; margin: 5px 0; }
          .info-table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px; }
          .info-table td { padding: 8px; border: 1px solid #ddd; font-size: 14px; }
          .info-table td.label { font-weight: bold; background-color: #f8fafc; width: 30%; }
        </style>
      </head>
      <body>
        <h1>FICHA DE ANAMNESE CLÍNICA</h1>
        
        <table class="info-table">
          <tr>
            <td class="label">Paciente:</td>
            <td>${cliente.nome}</td>
          </tr>
          <tr>
            <td class="label">WhatsApp:</td>
            <td>${cliente.telefone}</td>
          </tr>
          <tr>
            <td class="label">E-mail:</td>
            <td>${cliente.email || 'Não informado'}</td>
          </tr>
          <tr>
            <td class="label">Data de Nascimento:</td>
            <td>${cliente.data_nascimento ? new Date(cliente.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Não informada'}</td>
          </tr>
          <tr>
            <td class="label">Data de Emissão:</td>
            <td>${new Date().toLocaleDateString('pt-BR')}</td>
          </tr>
        </table>

        <h3>Alergias / Sensibilidades</h3>
        <p>${(anamneseForm.alergias || 'Nenhuma alergia relatada.').replace(/\n/g, '<br>')}</p>

        <h3>Medicamentos em Uso</h3>
        <p>${(anamneseForm.medicamentos || 'Nenhum medicamento em uso.').replace(/\n/g, '<br>')}</p>

        <h3>Doenças Crônicas / Condições Médicas</h3>
        <p>${(anamneseForm.doencas_cronicas || 'Nenhuma condição relatada.').replace(/\n/g, '<br>')}</p>

        <h3>Queixa Principal</h3>
        <p>${(anamneseForm.queixa_principal || 'Nenhuma queixa registrada.').replace(/\n/g, '<br>')}</p>

        <h3>Observações Gerais e Evolução</h3>
        <p>${(anamneseForm.observacoes || 'Nenhuma observação adicional.').replace(/\n/g, '<br>')}</p>

        <br><br><br>
        <table style="width: 100%; border: none; margin-top: 50px;">
          <tr>
            <td style="width: 45%; border: none; text-align: center; border-top: 1px solid #333; padding-top: 8px; font-size: 12px;">
              <strong>${cliente.nome}</strong><br>Assinatura do Paciente
            </td>
            <td style="width: 10%; border: none;"></td>
            <td style="width: 45%; border: none; text-align: center; border-top: 1px solid #333; padding-top: 8px; font-size: 12px;">
              <strong>Responsável Técnico</strong><br>Assinatura do Profissional
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], {
      type: 'application/msword;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `anamnese_${cliente.nome.toLowerCase().replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Exportar para PDF (Imprimir)
  const exportToPdf = () => {
    window.print();
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6 print:hidden">
      {/* ─── Cartão de Perfil do Cliente ──────────────────────────────────── */}
      <div className="card p-6 border border-[#C6C6CF]/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#E0E7FF] border border-blue-100 flex items-center justify-center text-[#2563EB] font-bold text-2xl shrink-0">
            {cliente.nome.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0D1B3E] flex items-center gap-2">
              {cliente.nome}
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Editar informações básicas"
              >
                <Edit3 size={16} />
              </button>
            </h1>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2 text-sm text-[#45464E]">
              <span className="flex items-center gap-1.5">
                <Phone size={14} className="text-[#2563EB]" />
                {cliente.telefone}
                <a 
                  href={`https://wa.me/${cliente.telefone.replace(/[^\d]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1.5 inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 hover:bg-emerald-100/80 px-2 py-0.5 rounded-full text-xs font-semibold print:hidden"
                  title="Abrir no WhatsApp"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </span>
              {cliente.email && (
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-[#2563EB]" />
                  {cliente.email}
                </span>
              )}
              {cliente.data_nascimento && (
                <span className="flex items-center gap-1.5">
                  <CalendarIcon size={14} className="text-[#2563EB]" />
                  Nascimento: {new Date(cliente.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Abas de Navegação Interna ────────────────────────────────────── */}
      <div className="border-b border-[#C6C6CF]/30 flex gap-4">
        <button
          onClick={() => setActiveTab('geral')}
          className={`pb-3 font-bold text-sm border-b-2 transition-all px-2 ${
            activeTab === 'geral' 
              ? 'border-[#0D1B3E] text-[#0D1B3E]' 
              : 'border-transparent text-gray-500 hover:text-[#0D1B3E]'
          }`}
        >
          Visão Geral & Agendamentos
        </button>
        <button
          onClick={() => setActiveTab('nicho')}
          className={`pb-3 font-bold text-sm border-b-2 transition-all px-2 flex items-center gap-2 ${
            activeTab === 'nicho' 
              ? 'border-[#0D1B3E] text-[#0D1B3E]' 
              : 'border-transparent text-gray-500 hover:text-[#0D1B3E]'
          }`}
        >
          {nicho === 'saude_estetica' || nicho === 'podologia' ? (
            <>
              <FileText size={16} />
              Ficha de Anamnese
            </>
          ) : (
            <>
              <Wrench size={16} />
              Histórico de Serviços
            </>
          )}
        </button>
      </div>

      {/* ─── Conteúdo da Aba Geral: Agendamentos ──────────────────────────── */}
      {activeTab === 'geral' && (
        <div className="card border border-[#C6C6CF]/20 p-6">
          <h3 className="text-lg font-bold text-[#0D1B3E] mb-4">Histórico de Agendamentos</h3>
          {agendamentos.length === 0 ? (
            <div className="text-center py-12 text-[#76767F]">
              <Clock size={40} className="mx-auto mb-3 text-gray-300" />
              Nenhum agendamento registrado para este cliente.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[#45464E] font-bold">
                    <th className="pb-3 pr-4">Data/Hora</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {agendamentos.map((agend) => {
                    const dataInicio = new Date(agend.data_hora_inicio);
                    const statusColors: Record<string, string> = {
                      confirmado: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                      pendente: 'bg-amber-50 text-amber-700 border-amber-100',
                      cancelado: 'bg-rose-50 text-rose-700 border-rose-100',
                      remarcado: 'bg-blue-50 text-blue-700 border-blue-100',
                    };

                    return (
                      <tr key={agend.id} className="text-gray-900">
                        <td className="py-3 pr-4 font-medium">
                          {dataInicio.toLocaleDateString('pt-BR')} às {dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors[agend.status] || 'bg-gray-50 text-gray-700'}`}>
                            {agend.status.charAt(0).toUpperCase() + agend.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-[#76767F]">
                          {agend.observacoes || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Conteúdo da Aba Saúde/Estética: Ficha de Anamnese ────────────────── */}
      {activeTab === 'nicho' && nicho === 'saude_estetica' && (
        <form onSubmit={handleSaveAnamnese} className="card border border-[#C6C6CF]/20 p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3 flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#0D1B3E]">Ficha de Anamnese Clínica</h3>
              <p className="text-xs text-[#76767F] mt-1">Preencha as informações clínicas básicas do paciente.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportToDocx}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100/80 font-bold text-xs rounded transition-colors"
                title="Baixar ficha no formato do Microsoft Word"
              >
                <FileText size={14} /> Exportar Word
              </button>
              
              <button
                type="button"
                onClick={exportToPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 font-bold text-xs rounded transition-colors"
                title="Imprimir ou salvar como PDF"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Imprimir PDF
              </button>

              {anamneseSaved && (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 animate-fade-in pl-2">
                  <Check size={16} /> Salvo!
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="alergias" className="label text-xs uppercase tracking-wider">
                Alergias / Sensibilidades
              </label>
              <textarea
                id="alergias"
                value={anamneseForm.alergias}
                onChange={(e) => setAnamneseForm((p) => ({ ...p, alergias: e.target.value }))}
                placeholder="Ex: Alergia a dipirona, látex..."
                rows={3}
                className="input resize-y"
              />
            </div>

            <div>
              <label htmlFor="medicamentos" className="label text-xs uppercase tracking-wider">
                Medicamentos em Uso
              </label>
              <textarea
                id="medicamentos"
                value={anamneseForm.medicamentos}
                onChange={(e) => setAnamneseForm((p) => ({ ...p, medicamentos: e.target.value }))}
                placeholder="Medicamentos de uso contínuo..."
                rows={3}
                className="input resize-y"
              />
            </div>

            <div>
              <label htmlFor="doencas_cronicas" className="label text-xs uppercase tracking-wider">
                Doenças Crônicas / Condições Médicas
              </label>
              <textarea
                id="doencas_cronicas"
                value={anamneseForm.doencas_cronicas}
                onChange={(e) => setAnamneseForm((p) => ({ ...p, doencas_cronicas: e.target.value }))}
                placeholder="Ex: Hipertensão, Diabetes..."
                rows={3}
                className="input resize-y"
              />
            </div>

            <div>
              <label htmlFor="queixa_principal" className="label text-xs uppercase tracking-wider">
                Queixa Principal do Paciente
              </label>
              <textarea
                id="queixa_principal"
                value={anamneseForm.queixa_principal}
                onChange={(e) => setAnamneseForm((p) => ({ ...p, queixa_principal: e.target.value }))}
                placeholder="Motivo que levou o paciente ao atendimento..."
                rows={3}
                className="input resize-y"
              />
            </div>
          </div>

          <div>
            <label htmlFor="observacoes_anamnese" className="label text-xs uppercase tracking-wider">
              Observações Gerais de Evolução
            </label>
            <textarea
              id="observacoes_anamnese"
              value={anamneseForm.observacoes}
              onChange={(e) => setAnamneseForm((p) => ({ ...p, observacoes: e.target.value }))}
              placeholder="Outras informações clínicas importantes..."
              rows={4}
              className="input resize-y"
            />
          </div>

          {anamneseError && (
            <p className="text-sm font-semibold text-[#BA1A1A]">{anamneseError}</p>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary px-6 py-2.5 shadow-sm disabled:opacity-50"
            >
              {isPending ? 'Salvando...' : 'Salvar Ficha'}
            </button>
          </div>
        </form>
      )}

      {/* ─── Conteúdo da Aba Podologia: Ficha de Anamnese Interativa ────────── */}
      {activeTab === 'nicho' && nicho === 'podologia' && (
        <AnamnesePodologiaForm
          clienteId={cliente.id}
          clienteNome={cliente.nome}
          clienteDataNascimento={cliente.data_nascimento}
          anamneseExistente={anamnesePodologia ?? null}
          onSuccess={() => {
            // Ação pós-salvar (opcional)
          }}
        />
      )}

      {/* ─── Conteúdo da Aba Serviços: Histórico de Serviços ───────────────── */}
      {activeTab === 'nicho' && nicho === 'servicos_manutencao' && (
        <div className="card border border-[#C6C6CF]/20 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#0D1B3E]">Registros de Serviços Executados</h3>
              <p className="text-xs text-[#76767F] mt-1">Lista de ordens e manutenções concluídas para este cliente.</p>
            </div>
            <button
              onClick={() => setIsServicoModalOpen(true)}
              className="btn-primary flex items-center gap-1.5 px-4 py-2"
            >
              <Plus size={16} />
              Registrar Serviço
            </button>
          </div>

          {historico.length === 0 ? (
            <div className="text-center py-12 text-[#76767F]">
              <Wrench size={40} className="mx-auto mb-3 text-gray-300" />
              Nenhum serviço registrado no histórico deste cliente.
            </div>
          ) : (
            <div className="space-y-4">
              {historico.map((serv) => (
                <div key={serv.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {new Date(serv.data_servico).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </span>
                      <h4 className="font-bold text-[#0D1B3E] text-base mt-1.5">{serv.descricao}</h4>
                    </div>
                    {serv.valor !== null && serv.valor > 0 && (
                      <span className="font-bold text-[#0D1B3E] text-lg">
                        {serv.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    )}
                  </div>
                  {serv.observacoes && (
                    <p className="text-xs text-[#45464E] mt-2 bg-white p-2.5 rounded border border-gray-50 italic">
                      {serv.observacoes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Modal Editar Cadastro ────────────────────────────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] w-full max-w-md overflow-hidden relative border border-[#C6C6CF]/20">
            <div className="px-6 py-4 border-b border-[#C6C6CF]/20 flex justify-between items-center bg-[#F8FAFC]">
              <h3 className="font-bold text-lg text-[#0D1B3E]">Editar Cadastro</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateCadastro} className="p-6 space-y-4">
              <div>
                <label htmlFor="edit_nome" className="label text-xs uppercase tracking-wider">
                  Nome Completo
                </label>
                <input
                  id="edit_nome"
                  type="text"
                  required
                  value={cadastroForm.nome}
                  onChange={(e) => setCadastroForm((p) => ({ ...p, nome: e.target.value }))}
                  className="input text-sm"
                />
              </div>

              <div>
                <label htmlFor="edit_telefone" className="label text-xs uppercase tracking-wider">
                  WhatsApp
                </label>
                <input
                  id="edit_telefone"
                  type="tel"
                  required
                  value={cadastroForm.telefone}
                  onChange={(e) => setCadastroForm((p) => ({ ...p, telefone: e.target.value }))}
                  className="input text-sm"
                />
              </div>

              <div>
                <label htmlFor="edit_email" className="label text-xs uppercase tracking-wider">
                  E-mail
                </label>
                <input
                  id="edit_email"
                  type="email"
                  value={cadastroForm.email}
                  onChange={(e) => setCadastroForm((p) => ({ ...p, email: e.target.value }))}
                  className="input text-sm"
                />
              </div>

              <div>
                <label htmlFor="edit_nascimento" className="label text-xs uppercase tracking-wider">
                  Data de Nascimento
                </label>
                <input
                  id="edit_nascimento"
                  type="date"
                  value={cadastroForm.data_nascimento}
                  onChange={(e) => setCadastroForm((p) => ({ ...p, data_nascimento: e.target.value }))}
                  className="input text-sm"
                />
              </div>

              {cadastroError && (
                <p className="text-xs font-semibold text-[#BA1A1A]">{cadastroError}</p>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-[#C6C6CF]/20">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary px-5 py-2 text-sm disabled:opacity-50"
                >
                  {isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal Registrar Serviço ──────────────────────────────────────── */}
      {isServicoModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] w-full max-w-md overflow-hidden relative border border-[#C6C6CF]/20">
            <div className="px-6 py-4 border-b border-[#C6C6CF]/20 flex justify-between items-center bg-[#F8FAFC]">
              <h3 className="font-bold text-lg text-[#0D1B3E]">Registrar Serviço Executado</h3>
              <button onClick={() => setIsServicoModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddServico} className="p-6 space-y-4">
              <div>
                <label htmlFor="serv_data" className="label text-xs uppercase tracking-wider">
                  Data do Serviço
                </label>
                <input
                  id="serv_data"
                  type="date"
                  required
                  value={servicoForm.data_servico}
                  onChange={(e) => setServicoForm((p) => ({ ...p, data_servico: e.target.value }))}
                  className="input text-sm"
                />
              </div>

              <div>
                <label htmlFor="serv_desc" className="label text-xs uppercase tracking-wider">
                  Descrição do Serviço / Peças
                </label>
                <input
                  id="serv_desc"
                  type="text"
                  required
                  value={servicoForm.descricao}
                  onChange={(e) => setServicoForm((p) => ({ ...p, descricao: e.target.value }))}
                  placeholder="Ex: Troca de óleo, pastilhas e alinhamento"
                  className="input text-sm"
                />
              </div>

              <div>
                <label htmlFor="serv_valor" className="label text-xs uppercase tracking-wider">
                  Valor Cobrado (R$)
                </label>
                <input
                  id="serv_valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={servicoForm.valor}
                  onChange={(e) => setServicoForm((p) => ({ ...p, valor: e.target.value }))}
                  placeholder="0,00"
                  className="input text-sm"
                />
              </div>

              <div>
                <label htmlFor="serv_obs" className="label text-xs uppercase tracking-wider">
                  Observações do Técnico
                </label>
                <textarea
                  id="serv_obs"
                  value={servicoForm.observacoes}
                  onChange={(e) => setServicoForm((p) => ({ ...p, observacoes: e.target.value }))}
                  placeholder="Detalhes adicionais ou recomendações..."
                  rows={3}
                  className="input text-sm resize-y"
                />
              </div>

              {servicoError && (
                <p className="text-xs font-semibold text-[#BA1A1A]">{servicoError}</p>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-[#C6C6CF]/20">
                <button
                  type="button"
                  onClick={() => setIsServicoModalOpen(false)}
                  className="btn-secondary px-4 py-2 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary px-5 py-2 text-sm disabled:opacity-50"
                >
                  {isPending ? 'Salvando...' : 'Salvar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>

      {/* ─── Layout de Impressão Exclusivo (Oculto na tela, visível no Print) ─── */}
      {nicho === 'saude_estetica' && (
        <div className="hidden print:block font-sans p-8 space-y-6" style={{ color: '#000000', width: '100%' }}>
          <div className="border-b-2 border-gray-900 pb-4 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-extrabold uppercase tracking-tight">Ficha de Anamnese Clínica</h1>
              <p className="text-xs text-gray-500 mt-1">Gerado pelo sistema de agendamento Agenda+</p>
            </div>
            <div className="text-right text-xs text-gray-400">
              Emitido em: {new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>

          {/* Informações do Cliente */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase" style={{ fontSize: '10px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase' }}>Paciente</p>
              <p className="text-sm font-bold" style={{ fontSize: '14px', fontWeight: 'bold', margin: '4px 0 0' }}>{cliente.nome}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase" style={{ fontSize: '10px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase' }}>WhatsApp</p>
              <p className="text-sm font-semibold" style={{ fontSize: '14px', fontWeight: '600', margin: '4px 0 0' }}>{cliente.telefone}</p>
            </div>
            {cliente.email && (
              <div style={{ marginTop: '8px' }}>
                <p className="text-xs font-bold text-gray-400 uppercase" style={{ fontSize: '10px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase' }}>E-mail</p>
                <p className="text-xs" style={{ fontSize: '12px', margin: '4px 0 0' }}>{cliente.email}</p>
              </div>
            )}
            {cliente.data_nascimento && (
              <div style={{ marginTop: '8px' }}>
                <p className="text-xs font-bold text-gray-400 uppercase" style={{ fontSize: '10px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase' }}>Data de Nascimento</p>
                <p className="text-xs" style={{ fontSize: '12px', margin: '4px 0 0' }}>{new Date(cliente.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
              </div>
            )}
          </div>

          {/* Campos Clínicos */}
          <div className="space-y-4 pt-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px' }}>
            <div className="border-b border-gray-150 pb-3" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider" style={{ fontSize: '11px', fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alergias / Sensibilidades</h3>
              <p className="text-sm text-gray-600 mt-1.5 whitespace-pre-wrap" style={{ fontSize: '13px', color: '#4b5563', marginTop: '6px', whiteSpace: 'pre-wrap' }}>{anamneseForm.alergias || 'Nenhuma alergia relatada.'}</p>
            </div>

            <div className="border-b border-gray-150 pb-3" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider" style={{ fontSize: '11px', fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Medicamentos em Uso</h3>
              <p className="text-sm text-gray-600 mt-1.5 whitespace-pre-wrap" style={{ fontSize: '13px', color: '#4b5563', marginTop: '6px', whiteSpace: 'pre-wrap' }}>{anamneseForm.medicamentos || 'Nenhum medicamento em uso.'}</p>
            </div>

            <div className="border-b border-gray-150 pb-3" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider" style={{ fontSize: '11px', fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Doenças Crônicas / Condições Médicas</h3>
              <p className="text-sm text-gray-600 mt-1.5 whitespace-pre-wrap" style={{ fontSize: '13px', color: '#4b5563', marginTop: '6px', whiteSpace: 'pre-wrap' }}>{anamneseForm.doencas_cronicas || 'Nenhuma condição relatada.'}</p>
            </div>

            <div className="border-b border-gray-150 pb-3" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider" style={{ fontSize: '11px', fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Queixa Principal</h3>
              <p className="text-sm text-gray-600 mt-1.5 whitespace-pre-wrap" style={{ fontSize: '13px', color: '#4b5563', marginTop: '6px', whiteSpace: 'pre-wrap' }}>{anamneseForm.queixa_principal || 'Nenhuma queixa registrada.'}</p>
            </div>

            <div className="pb-3" style={{ paddingBottom: '12px' }}>
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider" style={{ fontSize: '11px', fontWeight: 'bold', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Observações Gerais e Evolução</h3>
              <p className="text-sm text-gray-600 mt-1.5 whitespace-pre-wrap" style={{ fontSize: '13px', color: '#4b5563', marginTop: '6px', whiteSpace: 'pre-wrap' }}>{anamneseForm.observacoes || 'Nenhuma observação adicional.'}</p>
            </div>
          </div>

          {/* Assinaturas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginTop: '80px', textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '8px', fontSize: '11px' }}>
              <p style={{ fontWeight: 'bold', margin: 0 }}>{cliente.nome}</p>
              <p style={{ color: '#6b7280', margin: '4px 0 0' }}>Assinatura do Paciente</p>
            </div>
            <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '8px', fontSize: '11px' }}>
              <p style={{ fontWeight: 'bold', margin: 0 }}>Assinatura do Profissional</p>
              <p style={{ color: '#6b7280', margin: '4px 0 0' }}>Responsável Técnico</p>
            </div>
          </div>
        </div>
      )}

      {nicho === 'podologia' && anamnesePodologia && (() => {
        const dadosPodologia = (anamnesePodologia.dados || {}) as Record<string, any>;
        
        // Definições estáticas para uso no relatório
        const listaPatologiasClinicas = [
          { id: 'gestante', label: 'Gestante' },
          { id: 'osteoporose', label: 'Osteoporose' },
          { id: 'cardiopatia', label: 'Cardiopatia' },
          { id: 'marca_passo', label: 'Marca Passo' },
          { id: 'hipertiroidismo', label: 'Hipertiroidismo' },
          { id: 'hipotireoidismo', label: 'Hipotireoidismo' },
          { id: 'hipertensao', label: 'Hipertensão' },
          { id: 'hipotensao', label: 'Hipotensão' },
          { id: 'renal', label: 'Problemas Renais' },
          { id: 'neuropatia', label: 'Neuropatia' },
          { id: 'reumatismo', label: 'Reumatismo' },
          { id: 'vasculares', label: 'Alterações Vasculares' },
          { id: 'epilepsia', label: 'Epilepsia' },
          { id: 'hepatite', label: 'Hepatite' },
          { id: 'hanseniase', label: 'Hanseníase' },
          { id: 'quimio_radio', label: 'Quimioterapia/Radioterapia' },
          { id: 'antecedentes_oncologicos', label: 'Antecedentes Oncológicos' },
          { id: 'cirurgia_mmii', label: 'Cirurgia de MMII' },
        ];

        const formatosUnhas = [
          { id: 'A', name: 'A-Normal' },
          { id: 'B', name: 'B-Involuta' },
          { id: 'C', name: 'C-Telha' },
          { id: 'D', name: 'D-Funil' },
          { id: 'E', name: 'E-Gancho' },
          { id: 'F', name: 'F-Torquês' },
          { id: 'G', name: 'G-Caracol' },
          { id: 'H', name: 'H-Cunha' },
        ];

        const listaPatologiasUngueais = [
          { id: 'onicoatrofia', label: 'Onicoatrofia' },
          { id: 'onicocriptose', label: 'Onicocriptose' },
          { id: 'onicocorrexe', label: 'Onicocorrexe' },
          { id: 'granuloma', label: 'Granuloma' },
          { id: 'onicogrifose', label: 'Onicogrifose' },
          { id: 'onicolise', label: 'Onicolise' },
          { id: 'onicofose', label: 'Onicofose' },
          { id: 'psoriase_ungueal', label: 'Psoríase Ungueal' },
          { id: 'onicomicose', label: 'Onicomicose' },
        ];

                const listaPatologiasPele = [
          { id: 'bromidrose', label: 'Bromidrose' },
          { id: 'hidrose', label: 'Hidrose' },
          { id: 'desidrose', label: 'Desidrose' },
          { id: 'isquemia', label: 'Isquemia' },
          { id: 'mal_perfurante', label: 'Mal Perfurante Plantar' },
          { id: 'edema', label: 'Edema' },
          { id: 'tinea', label: 'Tinea Pedis' },
          { id: 'psoriase', label: 'Psoríase' },
          { id: 'tungiase', label: 'Tungíase' },
          { id: 'cianotico', label: 'Cianótico' },
          { id: 'fissuras', label: 'Fissuras' },
        ];

        const listaCalos = [
          { id: 'verruga_plantar', label: 'Verruga Plantar' },
          { id: 'calo_dorsal', label: 'Calo Dorsal' },
          { id: 'queratose', label: 'Queratose' },
          { id: 'calo_plantar', label: 'Calo Plantar' },
          { id: 'hiperqueratose', label: 'Hiperqueratose' },
          { id: 'calo_interdigital', label: 'Calo Interdigital' },
        ];

        const pontosMonofilamento = [
          { id: 'halux_e', label: '1. Hálux E', cx: 80, cy: 75, pe: 'E' },
          { id: 'dedo3_e', label: '2. 3º Dedo E', cx: 110, cy: 90, pe: 'E' },
          { id: 'dedo5_e', label: '3. 5º Dedo E', cx: 138, cy: 112, pe: 'E' },
          { id: 'meta1_e', label: '4. 1ª Cabeça Metatarso E', cx: 80, cy: 155, pe: 'E' },
          { id: 'meta3_e', label: '5. 3ª Cabeça Metatarso E', cx: 105, cy: 160, pe: 'E' },
          { id: 'meta5_e', label: '6. 5ª Cabeça Metatarso E', cx: 130, cy: 172, pe: 'E' },
          { id: 'arco_med_e', label: '7. Arco Medial E', cx: 85, cy: 235, pe: 'E' },
          { id: 'arco_lat_e', label: '8. Arco Lateral E', cx: 125, cy: 245, pe: 'E' },
          { id: 'calcaneo_e', label: '9. Calcâneo E', cx: 105, cy: 335, pe: 'E' },
          { id: 'dorso_e', label: '10. Dorso E', cx: 90, cy: 450, pe: 'E' },

          { id: 'halux_d', label: '1. Hálux D', cx: 220, cy: 75, pe: 'D' },
          { id: 'dedo3_d', label: '2. 3º Dedo D', cx: 190, cy: 90, pe: 'D' },
          { id: 'dedo5_d', label: '3. 5º Dedo D', cx: 162, cy: 112, pe: 'D' },
          { id: 'meta1_d', label: '4. 1ª Cabeça Metatarso D', cx: 220, cy: 155, pe: 'D' },
          { id: 'meta3_d', label: '5. 3ª Cabeça Metatarso D', cx: 195, cy: 160, pe: 'D' },
          { id: 'meta5_d', label: '6. 5ª Cabeça Metatarso D', cx: 170, cy: 172, pe: 'D' },
          { id: 'arco_med_d', label: '7. Arco Medial D', cx: 215, cy: 235, pe: 'D' },
          { id: 'arco_lat_d', label: '8. Arco Lateral D', cx: 175, cy: 245, pe: 'D' },
          { id: 'calcaneo_d', label: '9. Calcâneo D', cx: 195, cy: 335, pe: 'D' },
          { id: 'dorso_d', label: '10. Dorso D', cx: 210, cy: 450, pe: 'D' },
        ];

        // Calcular idade do paciente se houver data de nascimento
        const calcularIdade = (dataNasc: string | null) => {
          if (!dataNasc) return 'N/A';
          const hoje = new Date();
          const nasc = new Date(dataNasc);
          let idade = hoje.getFullYear() - nasc.getFullYear();
          const m = hoje.getMonth() - nasc.getMonth();
          if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
            idade--;
          }
          return `${idade} anos`;
        };

        return (
          <div className="hidden print:block font-sans text-xs" style={{ color: '#000000', width: '100%' }}>
            
            {/* ─── PÁGINA 1: IDENTIFICAÇÃO, HÁBITOS E CLÍNICO ─────────────────────────────────── */}
            <div className="print-page p-6 space-y-6" style={{ minHeight: '29.7cm', boxSizing: 'border-box' }}>
              <div className="border-b-2 border-gray-800 pb-4 flex justify-between items-end">
                <div>
                  <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">Ficha de Avaliação Podológica</h1>
                  <p className="text-[10px] text-gray-500 mt-0.5">Gerado pelo sistema de agendamento Agenda+</p>
                </div>
                <div className="text-right text-[10px] text-gray-400">
                  Emitido em: {new Date().toLocaleDateString('pt-BR')}
                </div>
              </div>

              {/* Informações do Cliente */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Paciente</p>
                  <p className="text-sm font-bold text-slate-800">{cliente.nome}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">WhatsApp</p>
                  <p className="text-sm font-semibold text-slate-800">{cliente.telefone}</p>
                </div>
                {cliente.email && (
                  <div style={{ marginTop: '4px' }}>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">E-mail</p>
                    <p className="text-xs text-slate-700">{cliente.email}</p>
                  </div>
                )}
                {cliente.data_nascimento && (
                  <div style={{ marginTop: '4px' }}>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Data de Nascimento / Idade</p>
                    <p className="text-xs text-slate-700">
                      {new Date(cliente.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} ({calcularIdade(cliente.data_nascimento)})
                    </p>
                  </div>
                )}
              </div>

              {/* 1. Queixa Principal e Hábitos */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-gray-200 pb-1.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                  Queixa Principal e Hábitos de Vida
                </h3>
                
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Queixa Principal</p>
                  <p className="text-sm font-medium text-slate-800 whitespace-pre-wrap mt-0.5">{dadosPodologia.queixa_principal || 'Nenhuma queixa relatada.'}</p>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs pt-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
                  <p className="border-b border-slate-100 pb-1"><strong>Costuma ir ao podólogo?</strong> {dadosPodologia.costuma_ir_podologo || 'Não'} {dadosPodologia.frequencia_podologo ? `(${dadosPodologia.frequencia_podologo})` : ''}</p>
                  <p className="border-b border-slate-100 pb-1"><strong>Fumante?</strong> {dadosPodologia.fumante || 'Não'}</p>
                  <p className="border-b border-slate-100 pb-1"><strong>Usa Palmilha?</strong> {dadosPodologia.usa_palmilha || 'Não'}</p>
                  <p className="border-b border-slate-100 pb-1"><strong>Número do Calçado:</strong> {dadosPodologia.num_calcado || 'Não informado'}</p>
                  <p className="border-b border-slate-100 pb-1"><strong>Tipo de Calçado de Uso Diário:</strong> {dadosPodologia.tipo_calcado_diario || 'Não informado'}</p>
                  <p className="border-b border-slate-100 pb-1"><strong>Posição no Trabalho:</strong> {dadosPodologia.posicao_trabalho || 'Não informada'} {dadosPodologia.tempo_trabalho_pe ? `(${dadosPodologia.tempo_trabalho_pe} hs/dia)` : ''}</p>
                  <p className="border-b border-slate-100 pb-1"><strong>Pratica Atividade Física?</strong> {dadosPodologia.pratica_atividade_fisica || 'Não'} {dadosPodologia.atividade_fisica_frequencia ? `(${dadosPodologia.atividade_fisica_frequencia})` : ''}</p>
                  <p className="border-b border-slate-100 pb-1"><strong>Esporte e Calçado Utilizado:</strong> {dadosPodologia.atividade_fisica_esporte || 'Não informado'}</p>
                  
                  {dadosPodologia.alergias && <p className="col-span-2 border-b border-slate-100 pb-1" style={{ gridColumn: 'span 2' }}><strong>Alergias (Substâncias):</strong> <span className="text-red-700 font-bold">{dadosPodologia.alergias}</span></p>}
                  {dadosPodologia.medicamentos && <p className="col-span-2 border-b border-slate-100 pb-1" style={{ gridColumn: 'span 2' }}><strong>Medicamentos em Uso Diário:</strong> {dadosPodologia.medicamentos}</p>}
                  
                  {(dadosPodologia.ciclo_menstrual_regular || dadosPodologia.dum || dadosPodologia.gestante) && (
                    <p className="col-span-2 bg-pink-50/50 p-2 rounded border border-pink-100 text-pink-950" style={{ gridColumn: 'span 2', fontSize: '11px' }}>
                      <strong>Ciclo Menstrual:</strong> Regular: {dadosPodologia.ciclo_menstrual_regular || 'N/A'} | DUM: {dadosPodologia.dum ? new Date(dadosPodologia.dum).toLocaleDateString('pt-BR') : 'N/A'} | Condição: {dadosPodologia.gestante || 'N/A'}
                    </p>
                  )}
                </div>
              </div>

              {/* 2. Dados Clínicos e Patologias */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-gray-200 pb-1.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
                  Dados Clínicos e Patologias Preexistentes
                </h3>

                <div className="grid grid-cols-3 gap-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {listaPatologiasClinicas.map(pat => {
                    const ativa = dadosPodologia.patologias_clinicas?.includes(pat.id);
                    return (
                      <div key={pat.id} className={`flex items-center gap-2 p-2 border rounded-lg ${
                        ativa ? 'bg-blue-50/30 border-blue-200 font-bold text-blue-900' : 'bg-white border-slate-150 text-slate-500'
                      }`}>
                        <div className="shrink-0">
                          {ativa ? (
                            <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <div className="w-3.5 h-3.5 border border-slate-300 rounded bg-white"></div>
                          )}
                        </div>
                        <span className="text-[10px] truncate">{pat.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Bloco Diabetes */}
                  <div className={`p-3 border rounded-lg ${dadosPodologia.diabetes === 'S' ? 'border-red-200 bg-red-50/20' : 'border-slate-200 bg-white'}`}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Diabetes</p>
                    <p className="text-xs font-bold text-slate-800 mt-1">
                      Possui Diabetes? {dadosPodologia.diabetes === 'S' ? '✓ SIM' : 'NÃO'}
                    </p>
                    {dadosPodologia.diabetes === 'S' && (
                      <div className="mt-2 space-y-1 text-[11px] text-slate-700 border-t border-red-100 pt-2">
                        <p><strong>Última Taxa Glicêmica:</strong> {dadosPodologia.taxa_glicemica || 'Não informada'}</p>
                        <p><strong>Data de Verificação:</strong> {dadosPodologia.glicemia_data ? new Date(dadosPodologia.glicemia_data).toLocaleDateString('pt-BR') : 'Não informada'}</p>
                        <p><strong>Uso de Insulina:</strong> {dadosPodologia.diabetes_insulina || 'Não informado'}</p>
                      </div>
                    )}
                  </div>

                  {/* Bloco Dieta Hídrica */}
                  <div className={`p-3 border rounded-lg ${dadosPodologia.dieta_hidrica === 'S' ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200 bg-white'}`}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dieta Hídrica</p>
                    <p className="text-xs font-bold text-slate-800 mt-1">
                      Dieta Hídrica? {dadosPodologia.dieta_hidrica === 'S' ? '✓ SIM' : 'NÃO'}
                    </p>
                    {dadosPodologia.dieta_hidrica === 'S' && (
                      <div className="mt-2 text-[11px] text-slate-700 border-t border-blue-100 pt-2">
                        <p><strong>Observações Alimentares:</strong></p>
                        <p className="italic">{dadosPodologia.dieta_alimentar || 'Nenhuma observação cadastrada.'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ─── PÁGINA 2: EXAME FÍSICO E UNHAS & PELE ───────────────────────────────────────── */}
            <div className="print-page p-6 space-y-6" style={{ minHeight: '29.7cm', boxSizing: 'border-box' }}>
              <div className="border-b border-gray-200 pb-2 flex justify-between items-center text-[10px] text-gray-400">
                <span>FICHA DE AVALIAÇÃO PODOLÓGICA — {cliente.nome}</span>
                <span>Pág. 2</span>
              </div>

              {/* 3. Exame Físico */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-gray-200 pb-1.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">3</span>
                  Exame Físico das Extremidades
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
                  {/* Tipo de Pisada */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Tipo de Pisada</span>
                    <div className="grid grid-cols-3 gap-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      {[
                        { id: 'cavo_supinado', label: 'Cavo / Supinado', path: 'M 30,110 Q 15,160 25,220 Q 28,270 30,330 Q 35,400 55,440 Q 75,440 75,390 Q 68,330 36,260 Q 85,190 95,160 Q 95,110 30,110 Z' },
                        { id: 'normal_neutro', label: 'Normal / Neutro', path: 'M 30,110 Q 15,160 25,220 Q 30,270 32,330 Q 35,400 55,440 Q 75,440 75,390 Q 70,325 50,260 Q 90,195 95,160 Q 95,110 30,110 Z' },
                        { id: 'plano_pronado', label: 'Plano / Pronado', path: 'M 30,110 Q 15,160 25,220 Q 32,270 35,330 Q 35,400 55,440 Q 75,440 75,390 Q 75,320 85,260 Q 95,200 95,160 Q 95,110 30,110 Z' }
                      ].map(pisada => {
                        const ativa = dadosPodologia.tipo_pisada === pisada.id;
                        return (
                          <div
                            key={pisada.id}
                            className={`flex flex-col items-center p-2.5 border rounded-lg transition-colors ${
                              ativa ? 'border-blue-500 bg-blue-50/20' : 'border-slate-200 bg-white'
                            }`}
                          >
                            <svg width="32" height="64" viewBox="0 0 120 480" className="mb-1">
                              <path
                                d={pisada.path}
                                fill={ativa ? '#2563EB' : '#94A3B8'}
                                opacity={ativa ? 1 : 0.4}
                              />
                              {[
                                { cx: 80, cy: 40, r: 16 },
                                { cx: 62, cy: 52, r: 10 },
                                { cx: 50, cy: 62, r: 10 },
                                { cx: 40, cy: 75, r: 10 },
                                { cx: 30, cy: 92, r: 10 }
                              ].map((d, idx) => (
                                <circle
                                  key={idx}
                                  cx={d.cx}
                                  cy={d.cy}
                                  r={d.r}
                                  fill={ativa ? '#2563EB' : '#94A3B8'}
                                  opacity={ativa ? 1 : 0.4}
                                />
                              ))}
                            </svg>
                            <span className={`text-[9px] font-bold text-center block ${ativa ? 'text-blue-800' : 'text-slate-500'}`}>{pisada.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Deformidade dos Dedos */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Deformidades dos Dedos</span>
                    <table className="w-full text-left text-[11px] border border-slate-200">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                          <th className="p-1 px-2">Deformidade</th>
                          <th className="p-1 text-center">PD</th>
                          <th className="p-1 text-center">PE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { label: 'Flexível', key_d: 'dedos_flexivel_d', key_e: 'dedos_flexivel_e' },
                          { label: 'Rígido', key_d: 'dedos_rigido_d', key_e: 'dedos_rigido_e' },
                          { label: 'Espalmado', key_d: 'dedos_espalmado_d', key_e: 'dedos_espalmado_e' },
                          { label: 'Martelo', key_d: 'dedos_martelo_d', key_e: 'dedos_martelo_e' },
                          { label: 'Queda Metatarso', key_d: 'dedos_queda_d', key_e: 'dedos_queda_e' }
                        ].map((dedo, idx) => {
                          const d = dadosPodologia[dedo.key_d];
                          const e = dadosPodologia[dedo.key_e];
                          return (
                            <tr key={idx} className="text-slate-700">
                              <td className="p-1.5 px-2 font-semibold">{dedo.label}</td>
                              <td className="p-1.5 text-center">
                                {d ? <span className="font-bold text-blue-600">✓</span> : <span className="text-slate-300">—</span>}
                              </td>
                              <td className="p-1.5 text-center">
                                {e ? <span className="font-bold text-blue-600">✓</span> : <span className="text-slate-300">—</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Marcha, Joelho, Sensibilidade à dor */}
                <div className="grid grid-cols-4 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px]" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <span className="font-bold text-slate-400 block uppercase text-[9px] tracking-wider">Marcha</span>
                    <span className="text-slate-800 font-semibold">{dadosPodologia.tipo_marcha === 'patologica' ? `Patológica (${dadosPodologia.tipo_marcha_patologica || ''})` : 'Normal'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block uppercase text-[9px] tracking-wider">Joelho</span>
                    <span className="text-slate-800 font-semibold uppercase">{dadosPodologia.joelho || 'Normal'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block uppercase text-[9px] tracking-wider">Sensibilidade Dor</span>
                    <span className="text-slate-800 font-semibold">{dadosPodologia.sensibilidade_dor === 'diminuida' ? 'Diminuída' : dadosPodologia.sensibilidade_dor === 'aumentada' ? 'Aumentada' : 'Normal'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block uppercase text-[9px] tracking-wider">Articulações Afetadas</span>
                    <span className="text-slate-800 font-semibold">{dadosPodologia.articulacoes?.length > 0 ? dadosPodologia.articulacoes.join(', ') : 'Nenhuma'}</span>
                  </div>
                </div>
              </div>

              {/* 4. Unhas e Pele */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-gray-200 pb-1.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">4</span>
                  Unhas e Pele (Avaliação Dermatológica)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
                  {/* Formato das Unhas */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Formato das Unhas</span>
                    <div className="grid grid-cols-4 gap-1.5" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px' }}>
                      {formatosUnhas.map(unha => {
                        const ativa = dadosPodologia.formato_unha === unha.id;
                        return (
                          <div
                            key={unha.id}
                            className={`flex flex-col items-center p-1.5 border rounded-md ${
                              ativa ? 'border-blue-500 bg-blue-50/20 font-bold text-blue-900' : 'border-slate-200 bg-white text-slate-400'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded border flex items-center justify-center text-[11px] font-bold mb-1 ${
                              ativa ? 'border-blue-500 bg-blue-100 text-blue-800' : 'border-slate-200 bg-slate-50 text-slate-400'
                            }`}>
                              {unha.id}
                            </div>
                            <span className="text-[9px] text-slate-700 text-center truncate w-full">{unha.name}</span>
                          </div>
                        );
                      })}
                    </div>

                    {dadosPodologia.formato_unha && (
                      <div className="mt-3 bg-blue-50/20 border border-blue-100 p-2.5 rounded-lg text-[11px]">
                        <p className="font-bold text-blue-900">Artelhos Afetados por este formato ({dadosPodologia.formato_unha}):</p>
                        <p className="text-slate-800 mt-1">
                          <strong>Pé Esquerdo (PE):</strong> {dadosPodologia.artelhos_pe?.length > 0 ? dadosPodologia.artelhos_pe.join(', ') : 'Nenhum'} <br />
                          <strong>Pé Direito (PD):</strong> {dadosPodologia.artelhos_pd?.length > 0 ? dadosPodologia.artelhos_pd.join(', ') : 'Nenhum'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Alterações Dermatológicas & Calos */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Patologias Ungueais</span>
                    <div className="flex flex-wrap gap-1">
                      {listaPatologiasUngueais.map(pat => {
                        const ativa = dadosPodologia.patologias_ungueais?.includes(pat.id);
                        return (
                          <span key={pat.id} className={`px-2 py-1 rounded text-[10px] font-semibold border ${
                            ativa ? 'bg-blue-50 border-blue-200 text-blue-800 font-bold' : 'bg-white border-slate-200 text-slate-500'
                          }`}>
                            {ativa ? '✓ ' : ''}{pat.label}
                          </span>
                        );
                      })}
                    </div>
                    {dadosPodologia.outras_alteracoes_ungueais && (
                      <p className="text-[10px] text-slate-600 mt-2 bg-slate-50 p-2 rounded">
                        <strong>Obs ungueais:</strong> {dadosPodologia.outras_alteracoes_ungueais}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
                  {/* Patologias da Pele */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Alterações Dermatológicas (Pele)</span>
                    <div className="flex flex-wrap gap-1">
                      {listaPatologiasPele.map(pat => {
                        const ativa = dadosPodologia.patologias_pele?.includes(pat.id);
                        return (
                          <span key={pat.id} className={`px-2 py-1 rounded text-[10px] font-semibold border ${
                            ativa ? 'bg-blue-50 border-blue-200 text-blue-800 font-bold' : 'bg-white border-slate-200 text-slate-500'
                          }`}>
                            {ativa ? '✓ ' : ''}{pat.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tipos de Calos */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Presença de Calos</span>
                    <div className="flex flex-wrap gap-1">
                      {listaCalos.map(calo => {
                        const ativo = dadosPodologia.calos?.includes(calo.id);
                        return (
                          <span key={calo.id} className={`px-2 py-1 rounded text-[10px] font-semibold border ${
                            ativo ? 'bg-blue-50 border-blue-200 text-blue-800 font-bold' : 'bg-white border-slate-200 text-slate-500'
                          }`}>
                            {ativo ? '✓ ' : ''}{calo.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Perfusão, erisipela, observações */}
                <div className="grid grid-cols-4 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] mt-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <span className="font-bold text-slate-400 block uppercase text-[9px] tracking-wider">Perfusão PD</span>
                    <span className="text-slate-800 font-semibold uppercase">{dadosPodologia.perfusao_pd || 'Normal'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block uppercase text-[9px] tracking-wider">Perfusão PE</span>
                    <span className="text-slate-800 font-semibold uppercase">{dadosPodologia.perfusao_pe || 'Normal'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block uppercase text-[9px] tracking-wider">Histórico Erisipela</span>
                    <span className="text-slate-800 font-semibold">{dadosPodologia.erisipela === 'S' ? '✓ APRESENTA / HISTÓRICO' : 'NÃO'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 block uppercase text-[9px] tracking-wider">Outras Alterações de Pele</span>
                    <span className="text-slate-800 font-medium truncate" title={dadosPodologia.outras_alteracoes_pele}>{dadosPodologia.outras_alteracoes_pele || 'Nenhuma'}</span>
                  </div>
                </div>

                {dadosPodologia.outros_comentarios && (
                  <div className="bg-slate-100/50 p-3 rounded-lg border border-slate-200 text-[11px] mt-2">
                    <p className="font-bold text-slate-700">Comentários e Observações Adicionais:</p>
                    <p className="text-slate-850 mt-1 whitespace-pre-wrap">{dadosPodologia.outros_comentarios}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ─── PÁGINA 3: TESTES DE SENSIBILIDADE E ASSINATURA ──────────────────────────────── */}
            <div className="print-page p-6 space-y-6" style={{ minHeight: '29.7cm', boxSizing: 'border-box' }}>
              <div className="border-b border-gray-200 pb-2 flex justify-between items-center text-[10px] text-gray-400">
                <span>FICHA DE AVALIAÇÃO PODOLÓGICA — {cliente.nome}</span>
                <span>Pág. 3</span>
              </div>

              {/* 5. Testes de Sensibilidade */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-gray-200 pb-1.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">5</span>
                  Testes de Sensibilidade & Avaliação Vascular
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {/* Mapa anatômico SVG dos pés */}
                  <div className="border border-slate-200 bg-white rounded-xl p-4 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">Mapa de Monofilamento Semmes-Weinstein (5.07)</span>
                    
                    <div className="relative" style={{ width: '230px', height: '390px' }}>
                      <span className="absolute top-1 left-2 text-[8px] font-bold text-slate-400">PÉ ESQUERDO (PE)</span>
                      <span className="absolute top-1 right-2 text-[8px] font-bold text-slate-400">PÉ DIREITO (PD)</span>

                      <svg width="210" height="370" viewBox="0 0 300 500" className="mx-auto select-none">
                        {/* Contorno do Pé Esquerdo (desenhado na esquerda) */}
                        <g>
                          <path
                            d="M95 50 Q125 50 135 100 Q145 160 135 200 Q120 240 125 280 Q135 320 125 380 Q115 420 85 420 Q60 420 65 380 Q75 320 50 240 Q40 160 60 100 Q70 50 95 50 Z"
                            fill="#f8fafc"
                            stroke="#cbd5e1"
                            strokeWidth="2"
                          />
                          <path d="M 60,180 L 128,180" stroke="#e2e8f0" strokeDasharray="4 4" />
                          <path d="M 68,300 L 115,300" stroke="#e2e8f0" strokeDasharray="4 4" />
                          <text x="90" y="440" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#cbd5e1">Dorsal PE</text>
                        </g>

                        {/* Contorno do Pé Direito (desenhado na direita) */}
                        <g>
                          <path
                            d="M205 50 Q175 50 165 100 Q155 160 165 200 Q180 240 175 280 Q165 320 175 380 Q185 420 215 420 Q240 420 235 380 Q225 320 250 240 Q260 160 240 100 Q230 50 205 50 Z"
                            fill="#f8fafc"
                            stroke="#cbd5e1"
                            strokeWidth="2"
                          />
                          <path d="M 172,180 L 240,180" stroke="#e2e8f0" strokeDasharray="4 4" />
                          <path d="M 185,300 L 232,300" stroke="#e2e8f0" strokeDasharray="4 4" />
                          <text x="210" y="440" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#cbd5e1">Dorsal PD</text>
                        </g>

                        {/* Renderizar os pontos estáticos de Monofilamento */}
                        {pontosMonofilamento.map(ponto => {
                          const isReduzida = dadosPodologia.sensibilidade_monofilamento?.[ponto.id] === 'reduzida';
                          return (
                            <g key={ponto.id}>
                              <circle
                                cx={ponto.cx}
                                cy={ponto.cy}
                                r="11"
                                fill={isReduzida ? '#ef4444' : '#10b981'}
                                stroke="#ffffff"
                                strokeWidth="2"
                              />
                              <text
                                x={ponto.cx}
                                y={ponto.cy}
                                textAnchor="middle"
                                dy=".33em"
                                fill="#ffffff"
                                fontSize="8"
                                fontWeight="bold"
                              >
                                {ponto.id.includes('dorso') ? 'D' : ponto.id.replace(/[^\d]/g, '')}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    <div className="mt-4 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[9px] w-full space-y-1.5">
                      <p className="font-bold text-slate-700 block text-center border-b pb-1">Legenda do Monofilamento:</p>
                      <div className="flex justify-around">
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block"></span>
                          <span>Sensibilidade Normal</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block"></span>
                          <span>Reduzida / Ausente</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Teste do Toque, Diapasão e Vasculares */}
                  <div className="space-y-4">
                    {/* Teste do Toque */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px]">
                      <p className="font-bold text-slate-700 uppercase text-[9px] tracking-wider mb-2">Teste do Toque Leve nos Dedos</p>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-350 text-slate-500 font-bold">
                            <th className="pb-1">Artelho</th>
                            <th className="pb-1 text-center">Direito</th>
                            <th className="pb-1 text-center">Esquerdo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {['Hálux', '2º Dedo', '3º Dedo', '4º Dedo', '5º Dedo'].map((label, idx) => {
                            const num = idx + 1;
                            const isRedD = dadosPodologia.teste_toque_dedos?.[`toque_${num}_d`] === 'reduzida';
                            const isRedE = dadosPodologia.teste_toque_dedos?.[`toque_${num}_e`] === 'reduzida';
                            return (
                              <tr key={idx} className="text-slate-700">
                                <td className="py-1">{label}</td>
                                <td className="py-1 text-center font-bold">
                                  {isRedD ? <span className="text-red-600">Reduzida</span> : <span className="text-emerald-700">Normal</span>}
                                </td>
                                <td className="py-1 text-center font-bold">
                                  {isRedE ? <span className="text-red-600">Reduzida</span> : <span className="text-emerald-700">Normal</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Teste de Diapasão */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px]">
                      <p className="font-bold text-slate-700 uppercase text-[9px] tracking-wider mb-2">Teste de Diapasão (Vibração 128Hz)</p>
                      <p className="border-b border-slate-100 pb-1"><strong>Falange Distal do Hálux Direito:</strong> {dadosPodologia.teste_diapazao_halux_d === 'positivo' ? 'Alterado (Positivo)' : 'Normal (Negativo)'}</p>
                      <p className="border-b border-slate-100 pb-1"><strong>Falange Distal do Hálux Esquerdo:</strong> {dadosPodologia.teste_diapazao_halux_e === 'positivo' ? 'Alterado (Positivo)' : 'Normal (Negativo)'}</p>
                      <p className="border-b border-slate-100 pb-1"><strong>Maléolo Lateral Direito:</strong> {dadosPodologia.teste_diapazao_maleolo_d === 'positivo' ? 'Alterado (Positivo)' : 'Normal (Negativo)'}</p>
                      <p className="pb-1"><strong>Maléolo Lateral Esquerdo:</strong> {dadosPodologia.teste_diapazao_maleolo_e === 'positivo' ? 'Alterado (Positivo)' : 'Normal (Negativo)'}</p>
                    </div>

                    {/* Dados Vasculares, Pulsos e Edema */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] space-y-1.5">
                      <p className="font-bold text-slate-700 uppercase text-[9px] tracking-wider mb-2">Auditoria Circulatória & Vascular</p>
                      <p className="border-b border-slate-100 pb-1"><strong>Coloração da Pele (Pé/Perna D):</strong> {dadosPodologia.teste_coloracao_pe_d || 'N/A'} | <strong>(PE):</strong> {dadosPodologia.teste_coloracao_pe_e || 'N/A'}</p>
                      <p className="border-b border-slate-100 pb-1"><strong>Temperatura da Pele (PD):</strong> {dadosPodologia.teste_temperatura_pe_d || 'N/A'} | <strong>(PE):</strong> {dadosPodologia.teste_temperatura_pe_e || 'N/A'}</p>
                      <p className="border-b border-slate-100 pb-1"><strong>Perfusão Capilar (PD):</strong> {dadosPodologia.teste_perfusao_pe_d === 'lenta' ? 'Lenta (> 2s)' : 'Normal (≤ 2s)'} | <strong>(PE):</strong> {dadosPodologia.teste_perfusao_pe_e === 'lenta' ? 'Lenta (> 2s)' : 'Normal (≤ 2s)'}</p>
                      <p className="border-b border-slate-100 pb-1"><strong>Edemas MMII (PD):</strong> {dadosPodologia.teste_edema_pe_d || 'Ausente'} | <strong>(PE):</strong> {dadosPodologia.teste_edema_pe_e || 'Ausente'}</p>
                      <p className="font-semibold text-slate-700 mt-1">Pulsos Pediosos (Dorsal / Tibial):</p>
                      <p><strong>Pé Direito (PD):</strong> Dorsal: {dadosPodologia.teste_pulso_dorsal_d || 'Presente'} / Tibial: {dadosPodologia.teste_pulso_tibial_d || 'Presente'}</p>
                      <p><strong>Pé Esquerdo (PE):</strong> Dorsal: {dadosPodologia.teste_pulso_dorsal_e || 'Presente'} / Tibial: {dadosPodologia.teste_pulso_tibial_e || 'Presente'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Termo e Assinatura Digital do Paciente */}
              <div className="pt-6 border-t border-gray-300" style={{ marginTop: '30px' }}>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-center text-slate-800 mb-3">Termo de Responsabilidade & Assinatura</h4>
                <p className="text-[10px] leading-relaxed text-gray-500 mb-6 bg-slate-50 p-3 rounded border border-slate-150">
                  Eu, <strong>{cliente.nome}</strong>, inscrito(a) sob CPF nº {dadosPodologia.termo_cpf || '___________'} e RG nº {dadosPodologia.termo_rg || '___________'}, 
                  declaro que as informações acima prestadas são verdadeiras e completas, assumindo inteira responsabilidade pelas mesmas, 
                  e dou meu consentimento livre e esclarecido para a realização dos procedimentos de podologia recomendados.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', textAlign: 'center', alignItems: 'end', marginTop: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {dadosPodologia.assinatura_paciente ? (
                      <img 
                        src={dadosPodologia.assinatura_paciente} 
                        alt="Assinatura Eletrônica do Paciente" 
                        style={{ maxHeight: '65px', width: 'auto', marginBottom: '8px', borderBottom: '1px solid #000000' }} 
                      />
                    ) : (
                      <div style={{ height: '65px', borderBottom: '1px dashed #9ca3af', width: '200px', marginBottom: '8px' }}></div>
                    )}
                    <p style={{ fontWeight: 'bold', margin: 0, color: '#111827' }}>{cliente.nome}</p>
                    <p style={{ color: '#6b7280', margin: '2px 0 0', fontSize: '9px', fontWeight: '600', textTransform: 'uppercase' }}>Assinatura do Paciente</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ height: '65px', borderBottom: '1px dashed #9ca3af', width: '200px', marginBottom: '8px' }}></div>
                    <p style={{ fontWeight: 'bold', margin: 0, color: '#111827' }}>Assinatura do Profissional</p>
                    <p style={{ color: '#6b7280', margin: '2px 0 0', fontSize: '9px', fontWeight: '600', textTransform: 'uppercase' }}>Responsável Técnico</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        );
      })()}
    </>
  );
}
