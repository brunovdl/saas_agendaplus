'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import MobileHeader from '@/components/layout/MobileHeader';
import type { Json } from '@/types/supabase';
import { Sparkles } from 'lucide-react';
import { melhorarDescricaoComIA } from './actions';
import {
  connectWhatsAppAction,
  checkWhatsAppConnectionAction,
  disconnectWhatsAppAction,
} from '@/app/actions/evolution';

interface HorarioDia {
  inicio: string;
  fim: string;
  ativo: boolean;
}

interface HorarioFuncionamento {
  segunda: HorarioDia;
  terca: HorarioDia;
  quarta: HorarioDia;
  quinta: HorarioDia;
  sexta: HorarioDia;
  sabado: HorarioDia;
  domingo: HorarioDia;
}

interface Servico {
  id: string;
  nome: string;
  valor: number;
  duracao: number; // em minutos
}

interface ConfiguracaoAssistente {
  nome_assistente: string;
  tom_voz: string;
  horario_funcionamento: HorarioFuncionamento;
  servicos: Servico[];
  descricao_negocio?: string;
}

const DIAS_SEMANA_MAP: Record<keyof HorarioFuncionamento, string> = {
  segunda: 'Segunda-feira',
  terca: 'Terça-feira',
  quarta: 'Quarta-feira',
  quinta: 'Quinta-feira',
  sexta: 'Sexta-feira',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

const DEFAULT_CONFIG: ConfiguracaoAssistente = {
  nome_assistente: 'Assistente Virtual',
  tom_voz: 'profissional',
  descricao_negocio: '',
  horario_funcionamento: {
    segunda: { inicio: '09:00', fim: '18:00', ativo: true },
    terca: { inicio: '09:00', fim: '18:00', ativo: true },
    quarta: { inicio: '09:00', fim: '18:00', ativo: true },
    quinta: { inicio: '09:00', fim: '18:00', ativo: true },
    sexta: { inicio: '09:00', fim: '18:00', ativo: true },
    sabado: { inicio: '09:00', fim: '14:00', ativo: false },
    domingo: { inicio: '09:00', fim: '14:00', ativo: false },
  },
  servicos: [],
};

export default function AssistenteConfigPage() {
  const supabase = createClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [config, setConfig] = useState<ConfiguracaoAssistente>(DEFAULT_CONFIG);
  const [originalConfig, setOriginalConfig] = useState<ConfiguracaoAssistente | null>(null);
  const [nomeNegocio, setNomeNegocio] = useState('');
  const [originalNomeNegocio, setOriginalNomeNegocio] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Estados para reescrita com IA (Groq)
  const [sugestaoIA, setSugestaoIA] = useState<string | null>(null);
  const [loadingIA, setLoadingIA] = useState(false);
  const [errorIA, setErrorIA] = useState<string | null>(null);

  async function handleMelhorarDescricao() {
    const desc = config.descricao_negocio;
    if (!desc || desc.trim() === '') {
      setErrorIA('Por favor, digite um rascunho da descrição antes de tentar reescrever com IA.');
      return;
    }

    setLoadingIA(true);
    setErrorIA(null);
    setSugestaoIA(null);

    try {
      const res = await melhorarDescricaoComIA(desc);
      if (res.error) {
        setErrorIA(res.error);
      } else if (res.success && res.descricaoSugerida) {
        setSugestaoIA(res.descricaoSugerida);
      }
    } catch (err) {
      console.error(err);
      setErrorIA('Ocorreu um erro ao processar a solicitação com a IA.');
    } finally {
      setLoadingIA(false);
    }
  }

  // Estados do WhatsApp
  const [whatsappStatus, setWhatsappStatus] = useState<string>('disconnected');
  const [whatsappNumero, setWhatsappNumero] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<string>('free_trial');

  // Estados do formulário de novo serviço
  const [novoServicoNome, setNovoServicoNome] = useState('');
  const [novoServicoValor, setNovoServicoValor] = useState('');
  const [novoServicoDuracao, setNovoServicoDuracao] = useState('30');
  const [servicoError, setServicoError] = useState<string | null>(null);

  // Carregar dados do prestador
  useEffect(() => {
    const fetchConfig = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('prestadores')
        .select('nome_negocio, configuracao_assistente, whatsapp_status, whatsapp_numero, subscription_tier')
        .eq('id', user.id)
        .single();

      if (data) {
        setWhatsappStatus(data.whatsapp_status || 'disconnected');
        setWhatsappNumero(data.whatsapp_numero || null);
        setSubscriptionTier(data.subscription_tier || 'free_trial');
        setNomeNegocio(data.nome_negocio || '');
        setOriginalNomeNegocio(data.nome_negocio || '');

        if (data.configuracao_assistente) {
          const loadedConfig = data.configuracao_assistente as unknown as ConfiguracaoAssistente;
          
          // Garantir que todos os campos existam para evitar crashes
          const mergedConfig: ConfiguracaoAssistente = {
            nome_assistente: loadedConfig.nome_assistente ?? DEFAULT_CONFIG.nome_assistente,
            tom_voz: loadedConfig.tom_voz ?? DEFAULT_CONFIG.tom_voz,
            descricao_negocio: loadedConfig.descricao_negocio ?? DEFAULT_CONFIG.descricao_negocio,
            horario_funcionamento: {
              ...DEFAULT_CONFIG.horario_funcionamento,
              ...(loadedConfig.horario_funcionamento ?? {}),
            },
            servicos: loadedConfig.servicos ?? DEFAULT_CONFIG.servicos,
          };

          setConfig(mergedConfig);
          setOriginalConfig(mergedConfig);
        } else {
          setOriginalConfig(DEFAULT_CONFIG);
        }
      }
    };

    fetchConfig();
  }, [supabase]);

  // Polling para verificar se o QR code foi escaneado
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (whatsappStatus === 'connecting' && qrCodeBase64) {
      intervalId = setInterval(async () => {
        const res = await checkWhatsAppConnectionAction();
        if (res.connected) {
          setWhatsappStatus('connected');
          setWhatsappNumero(res.numero);
          setQrCodeBase64(null);
          setWhatsappError(null);
          clearInterval(intervalId);
        }
      }, 4000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [whatsappStatus, qrCodeBase64]);

  // Ação de Conectar WhatsApp (Gerar QR Code)
  const handleConnectWhatsApp = async () => {
    setQrLoading(true);
    setWhatsappError(null);
    setQrCodeBase64(null);

    const res = await connectWhatsAppAction();
    setQrLoading(false);

    if (res.error) {
      setWhatsappError(res.error);
    } else if (res.alreadyConnected) {
      setWhatsappStatus('connected');
      setWhatsappError(null);
    } else if (res.qrcode) {
      setQrCodeBase64(res.qrcode);
      setWhatsappStatus('connecting');
    }
  };

  // Ação de Desconectar WhatsApp
  const handleDisconnectWhatsApp = async () => {
    if (!confirm('Tem certeza que deseja desconectar o WhatsApp da sua secretária virtual?')) return;
    setWhatsappError(null);
    
    const res = await disconnectWhatsAppAction();
    if (res.success) {
      setWhatsappStatus('disconnected');
      setWhatsappNumero(null);
      setQrCodeBase64(null);
      if (res.warning) {
        setWhatsappError(res.warning);
      }
    } else {
      setWhatsappError(res.error || 'Erro ao desconectar.');
    }
  };

  // Salvar configurações do assistente
  const handleSave = () => {
    setSaveSuccess(false);
    setSaveError(null);

    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('prestadores')
        .update({
          nome_negocio: nomeNegocio,
          configuracao_assistente: config as unknown as Json,
        })
        .eq('id', user.id);

      if (error) {
        setSaveError('Erro ao salvar as configurações do assistente. Tente novamente.');
      } else {
        setOriginalConfig(config);
        setOriginalNomeNegocio(nomeNegocio);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    });
  };

  // Adicionar serviço
  const handleAddServico = (e: React.FormEvent) => {
    e.preventDefault();
    setServicoError(null);

    if (!novoServicoNome.trim()) {
      setServicoError('O nome do serviço é obrigatório.');
      return;
    }

    const valorNum = parseFloat(novoServicoValor);
    if (isNaN(valorNum) || valorNum < 0) {
      setServicoError('O valor do serviço deve ser um número válido.');
      return;
    }

    const duracaoNum = parseInt(novoServicoDuracao);
    if (isNaN(duracaoNum) || duracaoNum <= 0) {
      setServicoError('A duração deve ser maior que zero.');
      return;
    }

    const novo: Servico = {
      id: crypto.randomUUID(),
      nome: novoServicoNome.trim(),
      valor: valorNum,
      duracao: duracaoNum,
    };

    setConfig((prev) => ({
      ...prev,
      servicos: [...prev.servicos, novo],
    }));

    setNovoServicoNome('');
    setNovoServicoValor('');
    setNovoServicoDuracao('30');
  };

  // Remover serviço
  const handleRemoveServico = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      servicos: prev.servicos.filter((s) => s.id !== id),
    }));
  };

  // Toggle dia da semana
  const handleToggleDia = (dia: keyof HorarioFuncionamento) => {
    setConfig((prev) => ({
      ...prev,
      horario_funcionamento: {
        ...prev.horario_funcionamento,
        [dia]: {
          ...prev.horario_funcionamento[dia],
          ativo: !prev.horario_funcionamento[dia].ativo,
        },
      },
    }));
  };

  // Alterar horário de início ou fim de um dia
  const handleChangeHorario = (dia: keyof HorarioFuncionamento, campo: 'inicio' | 'fim', valor: string) => {
    setConfig((prev) => ({
      ...prev,
      horario_funcionamento: {
        ...prev.horario_funcionamento,
        [dia]: {
          ...prev.horario_funcionamento[dia],
          [campo]: valor,
        },
      },
    }));
  };

  const hasChanges = (originalConfig ? JSON.stringify(config) !== JSON.stringify(originalConfig) : false) || nomeNegocio !== originalNomeNegocio;

  if (subscriptionTier === 'normal') {
    return (
      <div className="flex-1 overflow-y-auto w-full bg-[#F4F7FB] min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-[#C6C6CF]/20 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-[#00D4FF]/10 text-[#00677e] rounded-2xl flex items-center justify-center text-3xl mx-auto">
            ✦
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#0D1B3E]">Recurso Premium (IA)</h3>
            <p className="text-sm text-[#45464E] leading-relaxed">
              O assistente de IA personalizado e a conexão com o WhatsApp estão disponíveis exclusivamente no <strong>Plano Completo</strong>.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => router.push('/planos')}
              className="w-full py-2.5 px-4 bg-[#0D1B3E] hover:bg-[#152448] text-white font-bold text-sm rounded-lg shadow-sm transition-all"
            >
              Fazer Upgrade de Plano
            </button>
          </div>
          <p className="text-xs text-[#76767F]">
            Mude de plano a qualquer momento no painel de assinaturas do Stripe.
          </p>
        </div>
      </div>
    );
  }

  const salvarMobileButton = (
    <button
      onClick={handleSave}
      disabled={isPending || !hasChanges}
      className="px-2.5 py-1.5 bg-[#0D1B3E] text-white font-bold text-[11px] rounded-[6px] hover:bg-[#152448] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
    >
      {isPending ? 'Salvando...' : 'Salvar Alterações'}
    </button>
  );

  return (
    <div className="flex-1 overflow-y-auto w-full bg-[#F4F7FB] min-h-screen">
      <MobileHeader title="Assistente" backHref="/configuracoes" rightAction={salvarMobileButton} />

      {saveSuccess && (
        <div className="md:hidden bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-center text-xs font-semibold text-emerald-700 animate-fade-in">
          Configurações salvas com sucesso!
        </div>
      )}
      {saveError && (
        <div className="md:hidden bg-red-50 border-b border-red-200 px-4 py-2 text-center text-xs font-semibold text-[#BA1A1A]">
          {saveError}
        </div>
      )}

      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <header className="hidden md:flex justify-between items-center px-8 py-6 border-b border-[#C6C6CF]/20 bg-white sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/configuracoes')}
            className="p-2 border border-[#C6C6CF]/40 rounded-lg text-[#45464E] hover:text-[#0D1B3E] hover:bg-[#EBEEF2] transition-all"
            title="Voltar para Configurações"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h2 className="text-[28px] font-bold leading-[1.3] text-[#0D1B3E]">Configurações do Assistente</h2>
            <p className="text-sm text-[#45464E] mt-1">Configure o nome, tom de voz, horários e serviços oferecidos pela sua secretária virtual no WhatsApp.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 animate-fade-in">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
              Salvo com sucesso!
            </span>
          )}
          {saveError && (
            <span className="text-sm font-semibold text-[#BA1A1A]">{saveError}</span>
          )}
          <button
            onClick={handleSave}
            disabled={isPending || !hasChanges}
            className="px-6 py-2.5 bg-[#0D1B3E] text-white font-bold text-sm rounded-[6px] hover:bg-[#152448] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </header>

      {/* ─── Conteúdo ─────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 space-y-10 pb-20">

        {/* ─── Seção 0: Conexão WhatsApp (Secretária Virtual) ───────────────── */}
        <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 border border-[#C6C6CF]/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#0D1B3E] mb-1">WhatsApp da Secretária Virtual</h3>
              <p className="text-xs text-[#45464E]">Conecte seu celular para habilitar o envio de lembretes e agendamento automático de clientes.</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
              whatsappStatus === 'connected' ? 'bg-[#E8F5E9] text-[#2E7D32]' :
              whatsappStatus === 'connecting' ? 'bg-[#FFF3E0] text-[#E65100] animate-pulse' :
              'bg-[#F1F4F8] text-[#45464E]'
            }`}>
              {whatsappStatus === 'connected' ? 'Conectado' :
               whatsappStatus === 'connecting' ? 'Aguardando Escaneamento' :
               'Desconectado'}
            </span>
          </div>

          {whatsappStatus === 'connected' ? (
            <div className="bg-[#E8F5E9]/30 border border-[#2E7D32]/20 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#E8F5E9] rounded-full flex items-center justify-center text-[#2E7D32] text-xl font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0D1B3E]">Seu WhatsApp está ativo e conectado!</h4>
                  <p className="text-xs text-[#45464E] mt-0.5">
                    Número conectado: <strong className="text-[#0D1B3E]">+{whatsappNumero}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={handleDisconnectWhatsApp}
                className="px-4 py-2 border border-[#BA1A1A] text-[#BA1A1A] hover:bg-[#BA1A1A]/5 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
              >
                Desconectar WhatsApp
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {qrCodeBase64 ? (
                <div className="flex flex-col md:flex-row gap-6 p-5 border border-[#E8ECF0] rounded-xl bg-[#F9FAFB] items-center">
                  <div className="bg-white p-3 border border-[#E8ECF0] rounded-lg shadow-sm">
                    {/* Exibição do QR Code */}
                    <img 
                      src={qrCodeBase64} 
                      alt="WhatsApp Connection QR Code" 
                      className="w-48 h-48 object-contain" 
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <h4 className="font-bold text-sm text-[#0D1B3E]">Como conectar:</h4>
                    <ol className="list-decimal pl-4 text-xs text-[#45464E] space-y-1.5">
                      <li>Abra o WhatsApp no seu smartphone.</li>
                      <li>Toque em <strong>Menu (três pontos)</strong> ou <strong>Configurações</strong>.</li>
                      <li>Selecione <strong>Dispositivos Conectados</strong> e depois <strong>Conectar um Dispositivo</strong>.</li>
                      <li>Aponte a câmera do seu celular para esta tela para ler o QR Code.</li>
                    </ol>
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={handleConnectWhatsApp}
                        disabled={qrLoading}
                        className="px-4 py-2 bg-[#0D1B3E] text-white rounded-lg text-xs font-bold hover:bg-[#152448] transition-colors disabled:opacity-50"
                      >
                        {qrLoading ? 'Gerando...' : 'Regerar QR Code'}
                      </button>
                      <span className="text-[11px] text-[#45464E] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                        Aguardando leitura no celular...
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-[#C6C6CF]/30 rounded-xl bg-[#F9FAFB] text-center space-y-4">
                  <div className="w-16 h-16 bg-[#EBEEF2] rounded-full flex items-center justify-center mx-auto text-3xl">
                    📱
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0D1B3E]">Habilitar Assistente de IA por WhatsApp</h4>
                    <p className="text-xs text-[#45464E] max-w-md mx-auto mt-1">
                      Ao conectar seu WhatsApp, a assistente poderá agendar e responder clientes de forma totalmente autônoma seguindo suas regras de negócio.
                    </p>
                  </div>
                  <button
                    onClick={handleConnectWhatsApp}
                    disabled={qrLoading}
                    className="px-6 py-2.5 bg-[#0D1B3E] text-white rounded-lg text-sm font-bold hover:bg-[#152448] transition-colors shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {qrLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Gerando Instância...
                      </>
                    ) : (
                      'Conectar WhatsApp'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
          {whatsappError && (
            <p className="text-xs text-[#BA1A1A] font-semibold mt-3" role="alert">⚠ {whatsappError}</p>
          )}
        </section>
        
        {/* ─── Seção 1: Personalidade da IA ───────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 border border-[#C6C6CF]/20">
          <h3 className="text-lg font-bold text-[#0D1B3E] mb-1">Personalidade do Assistente</h3>
          <p className="text-xs text-[#45464E] mb-6">Defina como a inteligência artificial se apresentará aos clientes no WhatsApp.</p>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-bold text-sm text-[#45464E] mb-2" htmlFor="nome_assistente">
                  Nome do Assistente (Ex: Carolina, Roberto)
                </label>
                <input
                  id="nome_assistente"
                  type="text"
                  value={config.nome_assistente}
                  onChange={(e) => setConfig((prev) => ({ ...prev, nome_assistente: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E8ECF0] rounded-[6px] text-sm text-[#181C1F] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors bg-white"
                  placeholder="Ex: Secretária Virtual"
                />
              </div>

              <div>
                <label className="block font-bold text-sm text-[#45464E] mb-2" htmlFor="tom_voz">
                  Tom de Voz das Mensagens
                </label>
                <select
                  id="tom_voz"
                  value={config.tom_voz}
                  onChange={(e) => setConfig((prev) => ({ ...prev, tom_voz: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E8ECF0] rounded-[6px] text-sm text-[#181C1F] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors bg-white"
                >
                  <option value="profissional">Profissional e Polido (Recomendado)</option>
                  <option value="amigavel">Amigável e Descontraído</option>
                  <option value="direto">Direto e Objetivo</option>
                  <option value="carismatico">Carismático e Acolhedor</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-sm text-[#45464E] mb-2" htmlFor="nome_negocio">
                Nome do Negócio
              </label>
              <input
                id="nome_negocio"
                type="text"
                value={nomeNegocio}
                onChange={(e) => setNomeNegocio(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8ECF0] rounded-[6px] text-sm text-[#181C1F] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors bg-white"
                placeholder="Ex: Barbearia Estilo, Clínica Sorriso"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-bold text-sm text-[#45464E]" htmlFor="descricao_negocio">
                  Descrição do Negócio
                </label>
                <div className="flex items-center gap-3">
                  <button
                    id="btn-melhorar-descricao-ia"
                    type="button"
                    onClick={handleMelhorarDescricao}
                    disabled={loadingIA || !(config.descricao_negocio || '').trim()}
                    className="btn-accent"
                    style={{
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      height: '28px',
                      gap: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Sparkles size={13} className={loadingIA ? 'animate-spin' : ''} />
                    {loadingIA ? 'Melhorando...' : 'Melhorar com IA'}
                  </button>
                  <span className={`text-xs font-semibold ${
                    (config.descricao_negocio || '').length > 900 ? 'text-[#BA1A1A]' : 'text-[#76767F]'
                  }`}>
                    {(config.descricao_negocio || '').length}/1000
                  </span>
                </div>
              </div>
              <textarea
                id="descricao_negocio"
                value={config.descricao_negocio || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.length <= 1000) {
                    setConfig((prev) => ({ ...prev, descricao_negocio: val }));
                  }
                }}
                rows={5}
                className="w-full px-3 py-2 border border-[#E8ECF0] rounded-[6px] text-sm text-[#181C1F] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors bg-white resize-y"
                placeholder="Descreva sobre o seu negócio, os serviços prestados, a localização ou regras específicas para a assistente saber como responder aos clientes..."
                maxLength={1000}
              />

              {errorIA && (
                <p className="error-msg text-xs mt-1" role="alert">{errorIA}</p>
              )}

              {sugestaoIA && (
                <div 
                  id="preview-ia-container"
                  className="mt-3 p-4 rounded-[8px]" 
                  style={{ 
                    backgroundColor: 'rgba(0, 212, 255, 0.05)', 
                    border: '1.5px dashed rgba(0, 212, 255, 0.3)',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles size={14} className="text-[#00A8CC]" />
                    <span className="text-xs font-bold text-[#0D1B3E]">Sugestão da IA (Groq):</span>
                  </div>
                  <p className="text-sm text-[#45464E] leading-relaxed whitespace-pre-wrap mb-4 bg-white/60 p-3 rounded-[6px] border border-[#E8ECF0]">
                    {sugestaoIA}
                  </p>
                  <div className="flex gap-2">
                    <button
                      id="btn-aplicar-descricao-sugerida"
                      type="button"
                      onClick={() => {
                        setConfig((prev) => ({ ...prev, descricao_negocio: sugestaoIA }));
                        setSugestaoIA(null);
                      }}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}
                    >
                      Aplicar sugestão
                    </button>
                    <button
                      id="btn-descartar-descricao-sugerida"
                      type="button"
                      onClick={() => setSugestaoIA(null)}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}
                    >
                      Descartar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── Seção 2: Horário de Funcionamento ────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 border border-[#C6C6CF]/20">
          <h3 className="text-lg font-bold text-[#0D1B3E] mb-1">Horário de Funcionamento</h3>
          <p className="text-xs text-[#45464E] mb-6">Defina os dias e intervalos em que a IA poderá agendar clientes automaticamente.</p>
          
          <div className="space-y-4">
            {(Object.keys(DIAS_SEMANA_MAP) as Array<keyof HorarioFuncionamento>).map((dia) => {
              const diaConfig = config.horario_funcionamento[dia];
              return (
                <div key={dia} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-[#E8ECF0] hover:bg-[#F9FAFB] transition-colors gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={diaConfig.ativo}
                      onClick={() => handleToggleDia(dia)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                        diaConfig.ativo ? 'bg-[#00D4FF]' : 'bg-[#E0E3E7]'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          diaConfig.ativo ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <span className="font-semibold text-sm text-[#0D1B3E] min-w-[100px]">
                      {DIAS_SEMANA_MAP[dia]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={diaConfig.inicio}
                      disabled={!diaConfig.ativo}
                      onChange={(e) => handleChangeHorario(dia, 'inicio', e.target.value)}
                      className="px-2 py-1.5 border border-[#E8ECF0] rounded-[6px] text-xs text-[#181C1F] focus:outline-none focus:border-[#2563EB] bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                    <span className="text-[#76767F] text-xs">às</span>
                    <input
                      type="time"
                      value={diaConfig.fim}
                      disabled={!diaConfig.ativo}
                      onChange={(e) => handleChangeHorario(dia, 'fim', e.target.value)}
                      className="px-2 py-1.5 border border-[#E8ECF0] rounded-[6px] text-xs text-[#181C1F] focus:outline-none focus:border-[#2563EB] bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Seção 3: Catálogo de Serviços ────────────────────────────────── */}
        <section className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] p-6 border border-[#C6C6CF]/20">
          <h3 className="text-lg font-bold text-[#0D1B3E] mb-1">Catálogo de Serviços e Valores</h3>
          <p className="text-xs text-[#45464E] mb-6">Cadastre os serviços disponíveis para que o assistente de IA possa negociar com base nos valores e tempos de execução corretos.</p>

          {/* Lista de serviços cadastrados */}
          <div className="space-y-3 mb-8">
            {config.servicos.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-[#C6C6CF]/30 rounded-xl bg-[#F9FAFB]">
                <span className="text-3xl">💼</span>
                <p className="text-sm font-semibold text-[#45464E] mt-3">Nenhum serviço cadastrado ainda</p>
                <p className="text-xs text-[#76767F] mt-1">Preencha o formulário abaixo para adicionar seu primeiro serviço.</p>
              </div>
            ) : (
              <div className="border border-[#E8ECF0] rounded-xl overflow-hidden divide-y divide-[#E8ECF0]">
                {config.servicos.map((servico) => (
                  <div key={servico.id} className="flex justify-between items-center p-4 hover:bg-[#F9FAFB] transition-colors">
                    <div>
                      <h4 className="font-bold text-sm text-[#0D1B3E]">{servico.nome}</h4>
                      <p className="text-xs text-[#76767F] mt-0.5">
                        Duração: {servico.duracao} min | Valor: R$ {servico.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveServico(servico.id)}
                      className="p-2 text-[#BA1A1A] hover:bg-[#BA1A1A]/5 rounded-lg transition-colors"
                      title="Excluir serviço"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulário para adicionar serviço */}
          <form onSubmit={handleAddServico} className="p-5 border border-[#E8ECF0] rounded-xl bg-[#F9FAFB] space-y-4">
            <h4 className="font-bold text-sm text-[#0D1B3E]">Novo Serviço</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#45464E] mb-1.5" htmlFor="servico_nome">
                  Nome do Serviço
                </label>
                <input
                  id="servico_nome"
                  type="text"
                  value={novoServicoNome}
                  onChange={(e) => setNovoServicoNome(e.target.value)}
                  placeholder="Ex: Podologia Completa"
                  className="w-full px-3 py-1.5 border border-[#E8ECF0] rounded-[6px] text-xs text-[#181C1F] focus:outline-none focus:border-[#2563EB] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#45464E] mb-1.5" htmlFor="servico_valor">
                  Valor (R$)
                </label>
                <input
                  id="servico_valor"
                  type="number"
                  step="0.01"
                  value={novoServicoValor}
                  onChange={(e) => setNovoServicoValor(e.target.value)}
                  placeholder="Ex: 120.00"
                  className="w-full px-3 py-1.5 border border-[#E8ECF0] rounded-[6px] text-xs text-[#181C1F] focus:outline-none focus:border-[#2563EB] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#45464E] mb-1.5" htmlFor="servico_duracao">
                  Duração (minutos)
                </label>
                <select
                  id="servico_duracao"
                  value={novoServicoDuracao}
                  onChange={(e) => setNovoServicoDuracao(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#E8ECF0] rounded-[6px] text-xs text-[#181C1F] focus:outline-none focus:border-[#2563EB] bg-white"
                >
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">60 minutos (1 hora)</option>
                  <option value="90">90 minutos (1h 30m)</option>
                  <option value="120">120 minutos (2 horas)</option>
                </select>
              </div>
            </div>

            {servicoError && (
              <p className="text-xs text-[#BA1A1A] font-semibold">{servicoError}</p>
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-[6px] hover:bg-[#1D4ED8] transition-colors"
            >
              + Adicionar Serviço
            </button>
          </form>
        </section>
        
      </div>
    </div>
  );
}
