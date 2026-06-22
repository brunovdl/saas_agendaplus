'use client';

import { useState, useRef, useEffect } from 'react';
import { saveAnamnesePodologia } from '@/app/(dashboard)/clientes/actions';
import type { AnamnesePodologia } from '@/types/supabase';

interface AnamnesePodologiaFormProps {
  clienteId: string;
  clienteNome: string;
  clienteDataNascimento?: string | null;
  anamneseExistente: AnamnesePodologia | null;
  onSuccess?: () => void;
}

type AbaTipo = 'geral' | 'clinico' | 'exame_fisico' | 'unhas' | 'testes' | 'assinatura';

export default function AnamnesePodologiaForm({
  clienteId,
  clienteNome,
  clienteDataNascimento,
  anamneseExistente,
  onSuccess
}: AnamnesePodologiaFormProps) {
  const [activeTab, setActiveTab] = useState<AbaTipo>('geral');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estado unificado dos dados da anamnese (salvo no JSONB 'dados')
  const [dados, setDados] = useState<Record<string, any>>(() => {
    return anamneseExistente?.dados || {
      // Geral
      queixa_principal: '',
      frequencia_podologo: '',
      alergias: '',
      medicamentos: '',
      posicao_trabalho: '',
      tempo_trabalho_pe: '',
      num_calcado: '',
      tipo_calcado_diario: '',
      usa_palmilha: '',
      fumante: '',
      ciclo_menstrual_regular: '',
      dum: '',
      gestante: '',
      amamentando: '',
      pratica_atividade_fisica: '',
      atividade_fisica_frequencia: '',
      atividade_fisica_esporte: '',

      // Clinicos
      patologias_clinicas: [],
      diabetes: 'N',
      taxa_glicemica: '',
      glicemia_data: '',
      diabetes_insulina: '',
      dieta_hidrica: 'N',
      dieta_alimentar: '',

      // Exame Fisico
      tipo_pisada: '',
      dedos_flexivel_d: false, dedos_flexivel_e: false,
      dedos_rigido_d: false, dedos_rigido_e: false,
      dedos_espalmado_d: false, dedos_espalmado_e: false,
      dedos_martelo_d: false, dedos_martelo_e: false,
      dedos_queda_d: false, dedos_queda_e: false,
      tipo_marcha: 'normal',
      tipo_marcha_patologica: '',
      joelho: 'normal',
      articulacoes: [],
      sensibilidade_dor: 'normal',

      // Unhas & Pele
      formato_unha: '',
      artelhos_pd: [],
      artelhos_pe: [],
      patologias_ungueais: [],
      outras_alteracoes_ungueais: '',
      patologias_pele: [],
      perfusao_pd: 'normal',
      perfusao_pe: 'normal',
      calos: [],
      erisipela: 'N',
      outras_alteracoes_pele: '',
      outros_comentarios: '',

      // Testes
      sensibilidade_monofilamento: {}, // mapeia ponto_id -> 'normal' | 'reduzida'
      teste_toque_dedos: {}, // mapeia dedo_id -> 'normal' | 'reduzida'
      teste_diapazao_halux_d: 'negativo',
      teste_diapazao_halux_e: 'negativo',
      teste_diapazao_maleolo_d: 'negativo',
      teste_diapazao_maleolo_e: 'negativo',
      teste_coloracao_pe_d: 'normal',
      teste_coloracao_perna_d: 'normal',
      teste_coloracao_pe_e: 'normal',
      teste_coloracao_perna_e: 'normal',
      teste_temperatura_pe_d: 'normal',
      teste_temperatura_perna_d: 'normal',
      teste_temperatura_pe_e: 'normal',
      teste_temperatura_perna_e: 'normal',
      teste_perfusao_pe_d: 'normal',
      teste_perfusao_pe_e: 'normal',
      teste_edema_pe_d: 'ausente',
      teste_edema_pe_e: 'ausente',
      teste_pulso_dorsal_d: 'presente',
      teste_pulso_tibial_d: 'presente',
      teste_pulso_dorsal_e: 'presente',
      teste_pulso_tibial_e: 'presente',

      // Assinatura & Termo
      termo_rg: '',
      termo_cpf: '',
      assinatura_paciente: '' // Base64 png
    };
  });

  // Canvas Refs para Assinatura
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Inicializa o canvas de assinatura se houver assinatura salva
  useEffect(() => {
    if (activeTab === 'assinatura' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Se já tiver uma assinatura em base64 salva, tenta desenhar no canvas
        if (dados.assinatura_paciente) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          };
          img.src = dados.assinatura_paciente;
        }
      }
    }
  }, [activeTab]);

  const updateDado = (key: string, value: any) => {
    setDados(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayDado = (key: string, item: string) => {
    setDados(prev => {
      const arr = prev[key] || [];
      if (arr.includes(item)) {
        return { ...prev, [key]: arr.filter((i: string) => i !== item) };
      } else {
        return { ...prev, [key]: [...arr, item] };
      }
    });
  };

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    
    // Obtém coordenadas exatas de forma segura contra undefined
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    const touch = 'touches' in e && e.touches && e.touches.length > 0 ? e.touches[0] : null;
    if (touch) {
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    const touch = 'touches' in e && e.touches && e.touches.length > 0 ? e.touches[0] : null;
    if (touch) {
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    e.preventDefault();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    // Salva automaticamente o base64
    saveCanvasData();
  };

  const saveCanvasData = () => {
    if (canvasRef.current) {
      const base64 = canvasRef.current.toDataURL();
      updateDado('assinatura_paciente', base64);
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateDado('assinatura_paciente', '');
      }
    }
  };

  // Salvar a Ficha inteira
  const handleSaveAll = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await saveAnamnesePodologia(clienteId, dados);
      if (res.error) {
        setMessage({ type: 'error', text: res.error });
      } else {
        setMessage({ type: 'success', text: 'Avaliação podológica salva com sucesso!' });
        if (onSuccess) onSuccess();
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Ocorreu um erro ao tentar salvar no servidor.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Imprimir ficha em PDF com nome de arquivo customizado
  const handlePrintPdf = () => {
    const originalTitle = document.title;
    
    // Normaliza o nome do paciente (remove acentos e espaços)
    const nomeLimpo = clienteNome
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    
    const dataAtual = new Date()
      .toLocaleDateString('pt-BR')
      .replace(/\//g, '_');
      
    document.title = `avaliacao_podologia_${nomeLimpo}_${dataAtual}`;
    
    window.print();
    
    // Restaura o título da aba do navegador
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  // Pontos de teste do monofilamento (Vista plantar do Pé)
  // ID do ponto e coordenadas aproximadas para posicionar no SVG do pé
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
    { id: 'dorso_e', label: '10. Dorso E', cx: 90, cy: 450, pe: 'E' }, // ponto dorsal

    { id: 'halux_d', label: '1. Hálux D', cx: 220, cy: 75, pe: 'D' },
    { id: 'dedo3_d', label: '2. 3º Dedo D', cx: 190, cy: 90, pe: 'D' },
    { id: 'dedo5_d', label: '3. 5º Dedo D', cx: 162, cy: 112, pe: 'D' },
    { id: 'meta1_d', label: '4. 1ª Cabeça Metatarso D', cx: 220, cy: 155, pe: 'D' },
    { id: 'meta3_d', label: '5. 3ª Cabeça Metatarso D', cx: 195, cy: 160, pe: 'D' },
    { id: 'meta5_d', label: '6. 5ª Cabeça Metatarso D', cx: 170, cy: 172, pe: 'D' },
    { id: 'arco_med_d', label: '7. Arco Medial D', cx: 215, cy: 235, pe: 'D' },
    { id: 'arco_lat_d', label: '8. Arco Lateral D', cx: 175, cy: 245, pe: 'D' },
    { id: 'calcaneo_d', label: '9. Calcâneo D', cx: 195, cy: 335, pe: 'D' },
    { id: 'dorso_d', label: '10. Dorso D', cx: 210, cy: 450, pe: 'D' }, // ponto dorsal
  ];

  // Dedos para o Teste do Toque (D/E)
  const dedosToque = [
    { id: 'toque_1_d', label: 'Hálux D', num: 1, pe: 'D' },
    { id: 'toque_2_d', label: '2º D D', num: 2, pe: 'D' },
    { id: 'toque_3_d', label: '3º D D', num: 3, pe: 'D' },
    { id: 'toque_4_d', label: '4º D D', num: 4, pe: 'D' },
    { id: 'toque_5_d', label: '5º D D', num: 5, pe: 'D' },
    { id: 'toque_1_e', label: 'Hálux E', num: 1, pe: 'E' },
    { id: 'toque_2_e', label: '2º D E', num: 2, pe: 'E' },
    { id: 'toque_3_e', label: '3º D E', num: 3, pe: 'E' },
    { id: 'toque_4_e', label: '4º D E', num: 4, pe: 'E' },
    { id: 'toque_5_e', label: '5º D E', num: 5, pe: 'E' },
  ];

  // Formato das unhas cadastrados
  const formatosUnhas = [
    { id: 'A', name: 'A-Normal', description: 'Formato plano e normal.' },
    { id: 'B', name: 'B-Involuta', description: 'Bordas ligeiramente curvadas para dentro.' },
    { id: 'C', name: 'C-Telha', description: 'Curvatura acentuada em forma de telha.' },
    { id: 'D', name: 'D-Funil', description: 'Estreitamento em direção à ponta livre.' },
    { id: 'E', name: 'E-Gancho', description: 'Curvatura unilateral acentuada.' },
    { id: 'F', name: 'F-Torquês', description: 'Bordas se encontram no centro em pinça.' },
    { id: 'G', name: 'G-Caracol', description: 'A unha se enrola sobre si mesma.' },
    { id: 'H', name: 'H-Cunha', description: 'Cunha/formato trapezoidal.' },
  ];

  // Patologias clínicas para checkboxes
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
    { id: 'cirurgia_mmii', label: 'Cirurgia de MMII (Membros Inferiores)' },
  ];

  // Patologias ungueais (unhas)
  const listaPatologiasUngueais = [
    { id: 'onicoatrofia', label: 'Onicoatrofia' },
    { id: 'onicocriptose', label: 'Onicocriptose (Unha Encravada)' },
    { id: 'onicocorrexe', label: 'Onicocorrexe' },
    { id: 'granuloma', label: 'Granuloma' },
    { id: 'onicogrifose', label: 'Onicogrifose' },
    { id: 'onicolise', label: 'Onicolise' },
    { id: 'onicofose', label: 'Onicofose' },
    { id: 'psoriase_ungueal', label: 'Psoríase Ungueal' },
    { id: 'onicomicose', label: 'Onicomicose' },
  ];

  // Patologias da pele
  const listaPatologiasPele = [
    { id: 'bromidrose', label: 'Bromidrose (Odor)' },
    { id: 'hidrose', label: 'Hidrose' },
    { id: 'desidrose', label: 'Desidrose' },
    { id: 'isquemia', label: 'Isquemia' },
    { id: 'mal_perfurante', label: 'Mal Perfurante Plantar' },
    { id: 'edema', label: 'Edema' },
    { id: 'tinea', label: 'Tinea Pedis (Frieira)' },
    { id: 'psoriase', label: 'Psoríase' },
    { id: 'tungiase', label: 'Tungíase (Bicho de Pé)' },
    { id: 'cianotico', label: 'Cianótico' },
    { id: 'fissuras', label: 'Fissuras (Rachaduras)' },
  ];

  // Calos
  const listaCalos = [
    { id: 'verruga_plantar', label: 'Verruga Plantar' },
    { id: 'calo_dorsal', label: 'Calo Dorsal' },
    { id: 'queratose', label: 'Queratose' },
    { id: 'calo_plantar', label: 'Calo Plantar' },
    { id: 'hiperqueratose', label: 'Hiperqueratose' },
    { id: 'calo_interdigital', label: 'Calo Interdigital' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-[#C6C6CF]/20 p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#C6C6CF]/20 gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#0D1B3E]">Ficha de Avaliação Podológica</h3>
          <p className="text-sm text-[#5C5D65]">Paciente: <strong className="text-[#0D1B3E]">{clienteNome}</strong> {clienteDataNascimento ? `(${new Date(clienteDataNascimento).toLocaleDateString('pt-BR')})` : ''}</p>
        </div>
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 font-bold text-sm rounded-lg transition"
            title="Imprimir ou salvar como PDF"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Imprimir PDF
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-5 py-2.5 bg-[#00D4FF] hover:bg-[#00B4D8] disabled:bg-gray-300 text-[#020617] font-bold rounded-lg text-sm transition shadow-[0_4px_12px_rgba(0,212,255,0.2)] flex items-center gap-2"
          >
            {isSaving ? 'Salvando...' : 'Salvar Avaliação'}
          </button>
        </div>
      </div>

      {/* Alerta de Mensagem */}
      {message && (
        <div className={`p-4 rounded-lg text-sm font-semibold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? '✓' : '⚠'} {message.text}
        </div>
      )}

      {/* Navegação de Abas */}
      <div className="flex flex-wrap gap-1 border-b border-[#C6C6CF]/20">
        {[
          { id: 'geral', label: '1. Geral & Hábitos' },
          { id: 'clinico', label: '2. Clínico' },
          { id: 'exame_fisico', label: '3. Exame Físico' },
          { id: 'unhas', label: '4. Unhas & Pele' },
          { id: 'testes', label: '5. Testes de Sensibilidade' },
          { id: 'assinatura', label: '6. Termo & Assinatura' }
        ].map(aba => (
          <button
            key={aba.id}
            type="button"
            onClick={() => setActiveTab(aba.id as AbaTipo)}
            className={`px-4 py-2.5 text-xs md:text-sm font-bold border-b-2 transition -mb-px outline-none ${
              activeTab === aba.id
                ? 'border-[#00D4FF] text-[#00D4FF]'
                : 'border-transparent text-[#5C5D65] hover:text-[#0D1B3E]'
            }`}
          >
            {aba.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="pt-2">
        {/* ABA 1: GERAL & HÁBITOS */}
        {activeTab === 'geral' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#0D1B3E] uppercase tracking-wider">Dados Principais</h4>
              <div>
                <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Queixa Principal</label>
                <textarea
                  value={dados.queixa_principal}
                  onChange={(e) => updateDado('queixa_principal', e.target.value)}
                  className="w-full p-3 border border-[#C6C6CF] rounded-lg text-sm text-[#0F172A] focus:outline-none focus:border-[#00D4FF] h-24"
                  placeholder="Descreva a reclamação do paciente..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Costuma ir ao Podólogo?</label>
                  <select
                    value={dados.costuma_ir_podologo}
                    onChange={(e) => updateDado('costuma_ir_podologo', e.target.value)}
                    className="w-full p-2.5 border border-[#C6C6CF] rounded-lg text-sm text-[#0F172A]"
                  >
                    <option value="">Selecione...</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Qual a frequência?</label>
                  <input
                    type="text"
                    value={dados.frequencia_podologo}
                    onChange={(e) => updateDado('frequencia_podologo', e.target.value)}
                    className="w-full p-2 border border-[#C6C6CF] rounded-lg text-sm text-[#0F172A]"
                    placeholder="Ex: Mensal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Fumante?</label>
                  <select
                    value={dados.fumante}
                    onChange={(e) => updateDado('fumante', e.target.value)}
                    className="w-full p-2.5 border border-[#C6C6CF] rounded-lg text-sm text-[#0F172A]"
                  >
                    <option value="">Selecione...</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Nº do Calçado</label>
                  <input
                    type="text"
                    value={dados.num_calcado}
                    onChange={(e) => updateDado('num_calcado', e.target.value)}
                    className="w-full p-2 border border-[#C6C6CF] rounded-lg text-sm text-[#0F172A]"
                    placeholder="Ex: 38"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Tipo de Calçado de Uso Diário</label>
                <input
                  type="text"
                  value={dados.tipo_calcado_diario}
                  onChange={(e) => updateDado('tipo_calcado_diario', e.target.value)}
                  className="w-full p-2 border border-[#C6C6CF] rounded-lg text-sm text-[#0F172A]"
                  placeholder="Ex: Tênis esportivo, salto, sapato social..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Usa Palmilha?</label>
                  <select
                    value={dados.usa_palmilha}
                    onChange={(e) => updateDado('usa_palmilha', e.target.value)}
                    className="w-full p-2.5 border border-[#C6C6CF] rounded-lg text-sm text-[#0F172A]"
                  >
                    <option value="">Selecione...</option>
                    <option value="Não">Não</option>
                    <option value="Ortopédica">Ortopédica</option>
                    <option value="Descanso">Descanso</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#0D1B3E] uppercase tracking-wider">Trabalho, Saúde & Atividades</h4>

              <div>
                <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Alergias (Substâncias)</label>
                <input
                  type="text"
                  value={dados.alergias}
                  onChange={(e) => updateDado('alergias', e.target.value)}
                  className="w-full p-2.5 border border-[#C6C6CF] rounded-lg text-sm text-[#0F172A]"
                  placeholder="Descreva alergias se houver..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Medicamentos em Uso Diário</label>
                <input
                  type="text"
                  value={dados.medicamentos}
                  onChange={(e) => updateDado('medicamentos', e.target.value)}
                  className="w-full p-2.5 border border-[#C6C6CF] rounded-lg text-sm text-[#0F172A]"
                  placeholder="Ex: Anti-hipertensivo, insulina..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Posição de Trabalho</label>
                  <select
                    value={dados.posicao_trabalho}
                    onChange={(e) => updateDado('posicao_trabalho', e.target.value)}
                    className="w-full p-2.5 border border-[#C6C6CF] rounded-lg text-sm text-[#0F172A]"
                  >
                    <option value="">Selecione...</option>
                    <option value="Em pé">Em pé</option>
                    <option value="Sentado">Sentado</option>
                    <option value="Andando">Andando</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Duração (hs)</label>
                  <input
                    type="text"
                    value={dados.tempo_trabalho_pe}
                    onChange={(e) => updateDado('tempo_trabalho_pe', e.target.value)}
                    className="w-full p-2 border border-[#C6C6CF] rounded-lg text-sm text-[#0F172A]"
                    placeholder="Ex: 8h"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Pratica Atividade Física?</label>
                  <select
                    value={dados.pratica_atividade_fisica}
                    onChange={(e) => updateDado('pratica_atividade_fisica', e.target.value)}
                    className="w-full p-2.5 border border-[#C6C6CF] rounded-lg text-sm text-[#0F172A]"
                  >
                    <option value="">Selecione...</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Frequência/Semana</label>
                  <input
                    type="text"
                    value={dados.atividade_fisica_frequencia}
                    onChange={(e) => updateDado('atividade_fisica_frequencia', e.target.value)}
                    className="w-full p-2 border border-[#C6C6CF] rounded-lg text-sm text-[#0F172A]"
                    placeholder="Ex: 3x por semana"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Esporte e Tipo de Calçado Utilizado</label>
                <input
                  type="text"
                  value={dados.atividade_fisica_esporte}
                  onChange={(e) => updateDado('atividade_fisica_esporte', e.target.value)}
                  className="w-full p-2.5 border border-[#C6C6CF] rounded-lg text-sm text-[#0F172A]"
                  placeholder="Ex: Corrida (Tênis amortecido), Futebol (Chuteira)..."
                />
              </div>

              {/* Seção feminina opcional */}
              <div className="pt-2 border-t border-dashed border-[#C6C6CF] space-y-3">
                <p className="text-xs font-bold text-gray-400">Ciclo Menstrual (Apenas se aplicável)</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-[#5C5D65] uppercase mb-1">Ciclo Regular?</label>
                    <select
                      value={dados.ciclo_menstrual_regular}
                      onChange={(e) => updateDado('ciclo_menstrual_regular', e.target.value)}
                      className="w-full p-1.5 border border-[#C6C6CF] rounded-lg text-xs"
                    >
                      <option value="">Sel...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#5C5D65] uppercase mb-1">DUM (Última)</label>
                    <input
                      type="date"
                      value={dados.dum}
                      onChange={(e) => updateDado('dum', e.target.value)}
                      className="w-full p-1.5 border border-[#C6C6CF] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#5C5D65] uppercase mb-1">Gestante/Lactante?</label>
                    <select
                      value={dados.gestante}
                      onChange={(e) => updateDado('gestante', e.target.value)}
                      className="w-full p-1.5 border border-[#C6C6CF] rounded-lg text-xs"
                    >
                      <option value="">Sel...</option>
                      <option value="Gestante">Gestante</option>
                      <option value="Lactante">Lactante</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: CLÍNICO */}
        {activeTab === 'clinico' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-[#0D1B3E] uppercase tracking-wider mb-3">Dados Clínicos / Patologias Preexistentes</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {listaPatologiasClinicas.map(pat => (
                  <label
                    key={pat.id}
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer text-xs font-semibold transition ${
                      dados.patologias_clinicas?.includes(pat.id)
                        ? 'border-[#00D4FF] bg-cyan-50/20 text-[#008fb3]'
                        : 'border-[#C6C6CF]/40 hover:bg-gray-50 text-[#45464E]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={dados.patologias_clinicas?.includes(pat.id)}
                      onChange={() => toggleArrayDado('patologias_clinicas', pat.id)}
                      className="rounded text-[#00D4FF] focus:ring-[#00D4FF]"
                    />
                    {pat.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-[#C6C6CF]/20 pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider text-[#0D1B3E]">Informações de Diabetes</h5>
                
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-[#45464E]">Possui Diabetes?</span>
                  <div className="flex gap-2">
                    {['S', 'N'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateDado('diabetes', opt)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                          dados.diabetes === opt
                            ? 'bg-[#00D4FF] text-slate-900 border-[#00D4FF]'
                            : 'bg-white text-slate-600 border-slate-300'
                        }`}
                      >
                        {opt === 'S' ? 'Sim' : 'Não'}
                      </button>
                    ))}
                  </div>
                </div>

                {dados.diabetes === 'S' && (
                  <div className="space-y-3 pt-2 border-t border-slate-200/50">
                    <div>
                      <label className="block text-[10px] font-bold text-[#5C5D65] uppercase mb-0.5">Última Taxa Glicêmica (mg/dL)</label>
                      <input
                        type="text"
                        value={dados.taxa_glicemica}
                        onChange={(e) => updateDado('taxa_glicemica', e.target.value)}
                        className="w-full p-1.5 border border-[#C6C6CF] rounded-lg text-xs"
                        placeholder="Ex: 110 mg/dL"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#5C5D65] uppercase mb-0.5">Data da Verificação</label>
                      <input
                        type="date"
                        value={dados.glicemia_data}
                        onChange={(e) => updateDado('glicemia_data', e.target.value)}
                        className="w-full p-1.5 border border-[#C6C6CF] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#5C5D65] uppercase mb-0.5">Uso de Insulina</label>
                      <select
                        value={dados.diabetes_insulina}
                        onChange={(e) => updateDado('diabetes_insulina', e.target.value)}
                        className="w-full p-1.5 border border-[#C6C6CF] rounded-lg text-xs"
                      >
                        <option value="">Selecione...</option>
                        <option value="Injetável">Injetável</option>
                        <option value="Via Oral">Via Oral</option>
                        <option value="Não">Não utiliza</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider text-[#0D1B3E]">Dieta Hídrica</h5>
                
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-[#45464E]">Dieta Hídrica?</span>
                  <div className="flex gap-2">
                    {['S', 'N'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateDado('dieta_hidrica', opt)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                          dados.dieta_hidrica === opt
                            ? 'bg-[#00D4FF] text-slate-900 border-[#00D4FF]'
                            : 'bg-white text-slate-600 border-slate-300'
                        }`}
                      >
                        {opt === 'S' ? 'Sim' : 'Não'}
                      </button>
                    ))}
                  </div>
                </div>

                {dados.dieta_hidrica === 'S' && (
                  <div className="pt-2 border-t border-slate-200/50">
                    <label className="block text-[10px] font-bold text-[#5C5D65] uppercase mb-0.5">Dieta alimentar (Observações)</label>
                    <textarea
                      value={dados.dieta_alimentar}
                      onChange={(e) => updateDado('dieta_alimentar', e.target.value)}
                      className="w-full p-2 border border-[#C6C6CF] rounded-lg text-xs h-16"
                      placeholder="Descreva detalhes da dieta..."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: EXAME FÍSICO (DEDOS, PISADA, MARCHA, JOELHO) */}
        {activeTab === 'exame_fisico' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tipo de Pisada */}
              <div>
                <h4 className="text-sm font-bold text-[#0D1B3E] uppercase tracking-wider mb-4">Tipo de Pisada (Selecione uma)</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'cavo_supinado', label: 'Cavo / Supinado', path: 'M 30,110 Q 15,160 25,220 Q 28,270 30,330 Q 35,400 55,440 Q 75,440 75,390 Q 68,330 36,260 Q 85,190 95,160 Q 95,110 30,110 Z' },
                    { id: 'normal_neutro', label: 'Normal / Neutro', path: 'M 30,110 Q 15,160 25,220 Q 30,270 32,330 Q 35,400 55,440 Q 75,440 75,390 Q 70,325 50,260 Q 90,195 95,160 Q 95,110 30,110 Z' },
                    { id: 'plano_pronado', label: 'Plano / Pronado', path: 'M 30,110 Q 15,160 25,220 Q 32,270 35,330 Q 35,400 55,440 Q 75,440 75,390 Q 75,320 85,260 Q 95,200 95,160 Q 95,110 30,110 Z' }
                  ].map(pisada => (
                    <button
                      key={pisada.id}
                      type="button"
                      onClick={() => updateDado('tipo_pisada', pisada.id)}
                      className={`flex flex-col items-center p-3 border rounded-xl transition ${
                        dados.tipo_pisada === pisada.id
                          ? 'border-[#00D4FF] bg-cyan-50/10'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {/* Pegada do pé simplificada em SVG */}
                      <svg width="45" height="90" viewBox="0 0 120 480" className="mb-2">
                        {/* Pé esquerdo de referência na pegada */}
                        <path
                          d={pisada.path}
                          fill={dados.tipo_pisada === pisada.id ? '#00D4FF' : '#94A3B8'}
                          opacity={dados.tipo_pisada === pisada.id ? 1 : 0.6}
                          transform="scale(1, 1)"
                        />
                        {/* Dedos da pegada */}
                        {[
                          { cx: 80, cy: 40, r: 16 },
                          { cx: 62, cy: 52, r: 10 },
                          { cx: 50, cy: 62, r: 10 },
                          { cx: 40, cy: 75, r: 10 },
                          { cx: 30, cy: 92, r: 10 }
                        ].map((d, i) => (
                          <circle
                            key={i}
                            cx={d.cx}
                            cy={d.cy}
                            r={d.r}
                            fill={dados.tipo_pisada === pisada.id ? '#00D4FF' : '#94A3B8'}
                            opacity={dados.tipo_pisada === pisada.id ? 1 : 0.6}
                          />
                        ))}
                      </svg>
                      <span className="text-[11px] font-bold text-slate-700 text-center">{pisada.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dedos (D/E) */}
              <div>
                <h4 className="text-sm font-bold text-[#0D1B3E] uppercase tracking-wider mb-3">Deformidades dos Dedos (Marque Direito/Esquerdo)</h4>
                <div className="space-y-2.5">
                  {[
                    { label: 'Flexível', key_d: 'dedos_flexivel_d', key_e: 'dedos_flexivel_e' },
                    { label: 'Rígido', key_d: 'dedos_rigido_d', key_e: 'dedos_rigido_e' },
                    { label: 'Espalmado', key_d: 'dedos_espalmado_d', key_e: 'dedos_espalmado_e' },
                    { label: 'Martelo', key_d: 'dedos_martelo_d', key_e: 'dedos_martelo_e' },
                    { label: 'Queda de Metatarso', key_d: 'dedos_queda_d', key_e: 'dedos_queda_e' }
                  ].map((dedo, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-xs font-bold text-slate-700">{dedo.label}</span>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={dados[dedo.key_d]}
                            onChange={(e) => updateDado(dedo.key_d, e.target.checked)}
                            className="rounded text-cyan-600 focus:ring-cyan-500"
                          />
                          D
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={dados[dedo.key_e]}
                            onChange={(e) => updateDado(dedo.key_e, e.target.checked)}
                            className="rounded text-cyan-600 focus:ring-cyan-500"
                          />
                          E
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Marcha, Joelho, Articulação, Dor */}
            <div className="border-t border-[#C6C6CF]/20 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Tipo de Marcha</label>
                <select
                  value={dados.tipo_marcha}
                  onChange={(e) => updateDado('tipo_marcha', e.target.value)}
                  className="w-full p-2 border border-[#C6C6CF] rounded-lg text-sm text-[#0F172A]"
                >
                  <option value="normal">Normal</option>
                  <option value="patologica">Patológica</option>
                </select>

                {dados.tipo_marcha === 'patologica' && (
                  <input
                    type="text"
                    value={dados.tipo_marcha_patologica}
                    onChange={(e) => updateDado('tipo_marcha_patologica', e.target.value)}
                    className="w-full mt-2 p-2 border border-[#C6C6CF] rounded-lg text-xs"
                    placeholder="Qual patologia?"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Joelho</label>
                <select
                  value={dados.joelho}
                  onChange={(e) => updateDado('joelho', e.target.value)}
                  className="w-full p-2 border border-[#C6C6CF] rounded-lg text-sm text-[#0F172A]"
                >
                  <option value="normal">Normal</option>
                  <option value="valgo">Valgo</option>
                  <option value="varo">Varo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Sensibilidade Geral a Dor</label>
                <select
                  value={dados.sensibilidade_dor}
                  onChange={(e) => updateDado('sensibilidade_dor', e.target.value)}
                  className="w-full p-2 border border-[#C6C6CF] rounded-lg text-sm text-[#0F172A]"
                >
                  <option value="normal">Normal</option>
                  <option value="diminuida">Diminuída (Hipostesia)</option>
                  <option value="aumentada">Aumentada (Hiperestesia)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Articulação Afetada</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {['Retropé', 'Chopart', 'Mediopé', 'Lisfranc', 'Antepé'].map(art => (
                    <button
                      key={art}
                      type="button"
                      onClick={() => toggleArrayDado('articulacoes', art)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                        dados.articulacoes?.includes(art)
                          ? 'bg-cyan-50 border-[#00D4FF] text-[#008fb3]'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      {art}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: UNHAS & PELE */}
        {activeTab === 'unhas' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Formato das Unhas */}
              <div>
                <h4 className="text-sm font-bold text-[#0D1B3E] uppercase tracking-wider mb-3">Formato das Unhas</h4>
                <div className="grid grid-cols-4 gap-2.5">
                  {formatosUnhas.map(unha => (
                    <button
                      key={unha.id}
                      type="button"
                      onClick={() => updateDado('formato_unha', unha.id)}
                      className={`flex flex-col items-center p-2.5 border rounded-lg transition relative ${
                        dados.formato_unha === unha.id
                          ? 'border-[#00D4FF] bg-cyan-50/10'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {/* Box cinza simulando o desenho do formato */}
                      <div className="w-10 h-10 border border-slate-300 rounded bg-slate-50 mb-1 flex items-center justify-center text-xs font-bold text-slate-400">
                        {unha.id}
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 text-center truncate w-full">{unha.name}</span>
                    </button>
                  ))}
                </div>

                {/* Seleção de Artelhos (Unhas com este formato) */}
                {dados.formato_unha && (
                  <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                    <p className="text-xs font-bold text-slate-700">Artelhos afetados por este formato ({dados.formato_unha}):</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Pé Esquerdo (PE)</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {['Hálux', '2º', '3º', '4º', '5º'].map(art => (
                            <button
                              key={art}
                              type="button"
                              onClick={() => toggleArrayDado('artelhos_pe', art)}
                              className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition ${
                                dados.artelhos_pe?.includes(art)
                                  ? 'bg-[#00D4FF] border-[#00D4FF] text-slate-900'
                                  : 'bg-white border-slate-300 text-slate-600'
                              }`}
                            >
                              {art}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Pé Direito (PD)</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {['Hálux', '2º', '3º', '4º', '5º'].map(art => (
                            <button
                              key={art}
                              type="button"
                              onClick={() => toggleArrayDado('artelhos_pd', art)}
                              className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition ${
                                dados.artelhos_pd?.includes(art)
                                  ? 'bg-[#00D4FF] border-[#00D4FF] text-slate-900'
                                  : 'bg-white border-slate-300 text-slate-600'
                              }`}
                            >
                              {art}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Patologias das Unhas */}
              <div>
                <h4 className="text-sm font-bold text-[#0D1B3E] uppercase tracking-wider mb-3">Alterações e Patologias Ungueais</h4>
                <div className="grid grid-cols-2 gap-2">
                  {listaPatologiasUngueais.map(pat => (
                    <label
                      key={pat.id}
                      className={`flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer text-xs font-semibold transition ${
                        dados.patologias_ungueais?.includes(pat.id)
                          ? 'border-[#00D4FF] bg-cyan-50/20 text-[#008fb3]'
                          : 'border-[#C6C6CF]/40 hover:bg-gray-50 text-[#45464E]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={dados.patologias_ungueais?.includes(pat.id)}
                        onChange={() => toggleArrayDado('patologias_ungueais', pat.id)}
                        className="rounded text-[#00D4FF] focus:ring-[#00D4FF]"
                      />
                      {pat.label}
                    </label>
                  ))}
                </div>
                <input
                  type="text"
                  value={dados.outras_alteracoes_ungueais}
                  onChange={(e) => updateDado('outras_alteracoes_ungueais', e.target.value)}
                  className="w-full mt-3 p-2 border border-[#C6C6CF] rounded-lg text-xs"
                  placeholder="Outras alterações ungueais..."
                />
              </div>
            </div>

            <div className="border-t border-[#C6C6CF]/20 pt-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Patologias da Pele e Calos */}
              <div>
                <h4 className="text-sm font-bold text-[#0D1B3E] uppercase tracking-wider mb-3">Alterações Dermatológicas & Calos</h4>
                <div className="grid grid-cols-2 gap-2">
                  {listaPatologiasPele.map(pat => (
                    <label
                      key={pat.id}
                      className={`flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer text-xs font-semibold transition ${
                        dados.patologias_pele?.includes(pat.id)
                          ? 'border-[#00D4FF] bg-cyan-50/20 text-[#008fb3]'
                          : 'border-[#C6C6CF]/40 hover:bg-gray-50 text-[#45464E]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={dados.patologias_pele?.includes(pat.id)}
                        onChange={() => toggleArrayDado('patologias_pele', pat.id)}
                        className="rounded text-[#00D4FF] focus:ring-[#00D4FF]"
                      />
                      {pat.label}
                    </label>
                  ))}
                </div>

                <div className="mt-4">
                  <span className="block text-xs font-bold text-[#5C5D65] uppercase mb-2">Tipos de Calos</span>
                  <div className="grid grid-cols-3 gap-2">
                    {listaCalos.map(calo => (
                      <label
                        key={calo.id}
                        className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer text-[10px] font-bold transition ${
                          dados.calos?.includes(calo.id)
                            ? 'border-[#00D4FF] bg-cyan-50/20 text-[#008fb3]'
                            : 'border-[#C6C6CF]/40 hover:bg-gray-50 text-[#45464E]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={dados.calos?.includes(calo.id)}
                          onChange={() => toggleArrayDado('calos', calo.id)}
                          className="rounded text-[#00D4FF]"
                        />
                        {calo.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Perfusão, Erisipela e Outras */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-[#0D1B3E] uppercase tracking-wider mb-3">Auditoria e Perfusão</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Perfusão Pé Direito</label>
                    <select
                      value={dados.perfusao_pd}
                      onChange={(e) => updateDado('perfusao_pd', e.target.value)}
                      className="w-full p-2 border border-[#C6C6CF] rounded-lg text-xs"
                    >
                      <option value="normal">Normal</option>
                      <option value="palido">Pálido</option>
                      <option value="cianotico">Cianótico</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Perfusão Pé Esquerdo</label>
                    <select
                      value={dados.perfusao_pe}
                      onChange={(e) => updateDado('perfusao_pe', e.target.value)}
                      className="w-full p-2 border border-[#C6C6CF] rounded-lg text-xs"
                    >
                      <option value="normal">Normal</option>
                      <option value="palido">Pálido</option>
                      <option value="cianotico">Cianótico</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-xs font-bold text-slate-700">Já teve ou apresenta Erisipela?</span>
                  <div className="flex gap-2">
                    {['S', 'N'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => updateDado('erisipela', opt)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                          dados.erisipela === opt
                            ? 'bg-[#00D4FF] text-slate-900 border-[#00D4FF]'
                            : 'bg-white text-slate-600 border-slate-300'
                        }`}
                      >
                        {opt === 'S' ? 'Sim' : 'Não'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Outras Alterações na Pele (Observações)</label>
                  <textarea
                    value={dados.outras_alteracoes_pele}
                    onChange={(e) => updateDado('outras_alteracoes_pele', e.target.value)}
                    className="w-full p-2.5 border border-[#C6C6CF] rounded-lg text-xs h-20"
                    placeholder="Descreva feridas, psoríase, etc..."
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">Outros Comentários e Observações da Avaliação</label>
              <textarea
                value={dados.outros_comentarios}
                onChange={(e) => updateDado('outros_comentarios', e.target.value)}
                className="w-full p-3 border border-[#C6C6CF] rounded-lg text-sm text-[#0F172A] h-20"
                placeholder="Observações adicionais do tratamento ou histórico do paciente..."
              />
            </div>
          </div>
        )}

        {/* ABA 5: TESTES DE SENSIBILIDADE (MAPAS SVG INTERATIVOS) */}
        {activeTab === 'testes' && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-sm font-bold text-[#0D1B3E] uppercase tracking-wider mb-2">Teste de Sensibilidade com Monofilamento Semmes-Weinstein (5.07)</h4>
              <p className="text-xs text-slate-500 mb-4">Clique nos pontos do pé (Plantar e Dorsal) para marcar os locais com <strong>sensibilidade reduzida ou ausente (Vermelho)</strong>. Pontos normais permanecem em <strong>Verde</strong>.</p>
              
              <div className="flex flex-col md:flex-row justify-center items-center gap-12">
                {/* SVG Pés Interativos */}
                <div className="relative border border-slate-200 bg-white rounded-xl p-4 shadow-sm" style={{ width: '310px', height: '520px' }}>
                  <span className="absolute top-2 left-4 text-[10px] font-bold text-slate-400">PÉ ESQUERDO (PE)</span>
                  <span className="absolute top-2 right-4 text-[10px] font-bold text-slate-400">PÉ DIREITO (PD)</span>
                  
                  <svg width="280" height="490" viewBox="0 0 300 500" className="mx-auto select-none">
                    {/* Desenho do contorno do Pé Esquerdo (desenhado na esquerda) */}
                    <g transform="translate(0, 0)">
                      <path
                        d="M95 50 Q125 50 135 100 Q145 160 135 200 Q120 240 125 280 Q135 320 125 380 Q115 420 85 420 Q60 420 65 380 Q75 320 50 240 Q40 160 60 100 Q70 50 95 50 Z"
                        fill="#f8fafc"
                        stroke="#cbd5e1"
                        strokeWidth="2"
                      />
                      {/* Linhas de divisão anatômica */}
                      <path d="M 60,180 L 128,180" stroke="#e2e8f0" strokeDasharray="4 4" />
                      <path d="M 68,300 L 115,300" stroke="#e2e8f0" strokeDasharray="4 4" />
                      <text x="90" y="440" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#94a3b8">Dorsal PE</text>
                    </g>
 
                    {/* Desenho do contorno do Pé Direito (desenhado na direita) */}
                    <g transform="translate(0, 0)">
                      <path
                        d="M205 50 Q175 50 165 100 Q155 160 165 200 Q180 240 175 280 Q165 320 175 380 Q185 420 215 420 Q240 420 235 380 Q225 320 250 240 Q260 160 240 100 Q230 50 205 50 Z"
                        fill="#f8fafc"
                        stroke="#cbd5e1"
                        strokeWidth="2"
                      />
                      <path d="M 172,180 L 240,180" stroke="#e2e8f0" strokeDasharray="4 4" />
                      <path d="M 185,300 L 232,300" stroke="#e2e8f0" strokeDasharray="4 4" />
                      <text x="210" y="440" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#94a3b8">Dorsal PD</text>
                    </g>

                    {/* Renderiza os círculos dos pontos interativos */}
                    {pontosMonofilamento.map(ponto => {
                      const isReduzida = dados.sensibilidade_monofilamento?.[ponto.id] === 'reduzida';
                      return (
                        <g
                          key={ponto.id}
                          className="cursor-pointer group"
                          onClick={() => {
                            const current = dados.sensibilidade_monofilamento?.[ponto.id] || 'normal';
                            const next = current === 'normal' ? 'reduzida' : 'normal';
                            updateDado('sensibilidade_monofilamento', {
                              ...dados.sensibilidade_monofilamento,
                              [ponto.id]: next
                            });
                          }}
                        >
                          <circle
                            cx={ponto.cx}
                            cy={ponto.cy}
                            r="11"
                            fill={isReduzida ? '#ef4444' : '#10b981'}
                            stroke="#ffffff"
                            strokeWidth="2"
                            className="transition-colors duration-200"
                          />
                          <text
                            cx={ponto.cx}
                            cy={ponto.cy}
                            textAnchor="middle"
                            dy=".3em"
                            fill="#ffffff"
                            fontSize="8"
                            fontWeight="bold"
                          >
                            {ponto.id.includes('dorso') ? 'D' : ponto.id.replace(/[^\d]/g, '')}
                          </text>
                          <title>{ponto.label}: {isReduzida ? 'Sensibilidade Reduzida' : 'Sensibilidade Normal'}</title>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Checklist Alternativo / Legenda */}
                <div className="space-y-4 max-w-sm">
                  <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2 text-xs">
                    <span className="font-bold text-slate-700 block">Legenda dos Pontos:</span>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#10b981] inline-block"></span>
                      <span>Sensibilidade Normal (Sente o toque)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#ef4444] inline-block"></span>
                      <span>Sensibilidade Reduzida / Ausente (Não sente)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-2 h-72 overflow-y-auto">
                    <span className="font-bold text-slate-700 block border-b pb-1.5">Diagnóstico Manual por Ponto:</span>
                    {pontosMonofilamento.map(p => {
                      const isRed = dados.sensibilidade_monofilamento?.[p.id] === 'reduzida';
                      return (
                        <div key={p.id} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                          <span className="font-semibold text-slate-600">{p.label}</span>
                          <button
                            type="button"
                            onClick={() => {
                              updateDado('sensibilidade_monofilamento', {
                                ...dados.sensibilidade_monofilamento,
                                [p.id]: isRed ? 'normal' : 'reduzida'
                              });
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isRed ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {isRed ? 'Ausente' : 'Normal'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Teste do Toque e Diapasão */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider text-[#0D1B3E]">Teste do toque nos dedos dos pés (Toque leve)</h5>
                <p className="text-[11px] text-slate-500">Marque se o paciente sente o toque rápido nos artelhos (D/E):</p>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-500 block mb-1">Pé Direito (PD)</span>
                    {dedosToque.filter(d => d.pe === 'D').map(d => {
                      const isReduzido = dados.teste_toque_dedos?.[d.id] === 'reduzida';
                      return (
                        <label key={d.id} className="flex items-center justify-between py-1 border-b border-slate-200/50 last:border-0">
                          <span>{d.label} (Dedo {d.num})</span>
                          <input
                            type="checkbox"
                            checked={!isReduzido}
                            onChange={(e) => {
                              updateDado('teste_toque_dedos', {
                                ...dados.teste_toque_dedos,
                                [d.id]: e.target.checked ? 'normal' : 'reduzida'
                              });
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                        </label>
                      );
                    })}
                  </div>

                  <div>
                    <span className="font-bold text-slate-500 block mb-1">Pé Esquerdo (PE)</span>
                    {dedosToque.filter(d => d.pe === 'E').map(d => {
                      const isReduzido = dados.teste_toque_dedos?.[d.id] === 'reduzida';
                      return (
                        <label key={d.id} className="flex items-center justify-between py-1 border-b border-slate-200/50 last:border-0">
                          <span>{d.label} (Dedo {d.num})</span>
                          <input
                            type="checkbox"
                            checked={!isReduzido}
                            onChange={(e) => {
                              updateDado('teste_toque_dedos', {
                                ...dados.teste_toque_dedos,
                                [d.id]: e.target.checked ? 'normal' : 'reduzida'
                              });
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Teste do Diapasão (Hálux e Maléolo) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider text-[#0D1B3E]">Teste de Diapasão (Vibração 128Hz)</h5>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-3">
                    <span className="font-bold text-slate-500 block border-b pb-1">Falange Distal do Hálux</span>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-[#5C5D65] uppercase mb-0.5">Hálux Direito</label>
                      <select
                        value={dados.teste_diapazao_halux_d}
                        onChange={(e) => updateDado('teste_diapazao_halux_d', e.target.value)}
                        className="w-full p-1.5 border border-[#C6C6CF] rounded-lg text-xs"
                      >
                        <option value="negativo">Negativo (Normal)</option>
                        <option value="positivo">Positivo (Alterado)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#5C5D65] uppercase mb-0.5">Hálux Esquerdo</label>
                      <select
                        value={dados.teste_diapazao_halux_e}
                        onChange={(e) => updateDado('teste_diapazao_halux_e', e.target.value)}
                        className="w-full p-1.5 border border-[#C6C6CF] rounded-lg text-xs"
                      >
                        <option value="negativo">Negativo (Normal)</option>
                        <option value="positivo">Positivo (Alterado)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="font-bold text-slate-500 block border-b pb-1">Maléolo Lateral</span>

                    <div>
                      <label className="block text-[10px] font-bold text-[#5C5D65] uppercase mb-0.5">Maléolo Direito</label>
                      <select
                        value={dados.teste_diapazao_maleolo_d}
                        onChange={(e) => updateDado('teste_diapazao_maleolo_d', e.target.value)}
                        className="w-full p-1.5 border border-[#C6C6CF] rounded-lg text-xs"
                      >
                        <option value="negativo">Negativo (Normal)</option>
                        <option value="positivo">Positivo (Alterado)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#5C5D65] uppercase mb-0.5">Maléolo Esquerdo</label>
                      <select
                        value={dados.teste_diapazao_maleolo_e}
                        onChange={(e) => updateDado('teste_diapazao_maleolo_e', e.target.value)}
                        className="w-full p-1.5 border border-[#C6C6CF] rounded-lg text-xs"
                      >
                        <option value="negativo">Negativo (Normal)</option>
                        <option value="positivo">Positivo (Alterado)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coloração, Temperatura, Perfusão, Edema, Pulso */}
            <div className="border-t border-slate-200 pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Coloração */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-2">
                <h6 className="font-bold text-xs uppercase text-[#0D1B3E]">Coloração & Temperatura</h6>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase">Pé/Perna D</label>
                    <select
                      value={dados.teste_coloracao_pe_d}
                      onChange={(e) => updateDado('teste_coloracao_pe_d', e.target.value)}
                      className="w-full p-1.5 border border-slate-200 rounded text-xs"
                    >
                      <option value="normal">Normal</option>
                      <option value="palido">Pálido</option>
                      <option value="cianotico">Cianótico</option>
                      <option value="rubor">Rubor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase">Pé/Perna E</label>
                    <select
                      value={dados.teste_coloracao_pe_e}
                      onChange={(e) => updateDado('teste_coloracao_pe_e', e.target.value)}
                      className="w-full p-1.5 border border-slate-200 rounded text-xs"
                    >
                      <option value="normal">Normal</option>
                      <option value="palido">Pálido</option>
                      <option value="cianotico">Cianótico</option>
                      <option value="rubor">Rubor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase">Temperatura D</label>
                    <select
                      value={dados.teste_temperatura_pe_d}
                      onChange={(e) => updateDado('teste_temperatura_pe_d', e.target.value)}
                      className="w-full p-1.5 border border-slate-200 rounded text-xs"
                    >
                      <option value="normal">Normal</option>
                      <option value="elevada">Elevada</option>
                      <option value="diminuida">Diminuída</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase">Temperatura E</label>
                    <select
                      value={dados.teste_temperatura_pe_e}
                      onChange={(e) => updateDado('teste_temperatura_pe_e', e.target.value)}
                      className="w-full p-1.5 border border-slate-200 rounded text-xs"
                    >
                      <option value="normal">Normal</option>
                      <option value="elevada">Elevada</option>
                      <option value="diminuida">Diminuída</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Perfusão & Edema */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-2">
                <h6 className="font-bold text-xs uppercase text-[#0D1B3E]">Perfusão & Edema Detalhado</h6>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase">Perfusão D</label>
                    <select
                      value={dados.teste_perfusao_pe_d}
                      onChange={(e) => updateDado('teste_perfusao_pe_d', e.target.value)}
                      className="w-full p-1.5 border border-slate-200 rounded text-xs"
                    >
                      <option value="normal">≤ 2 segundos</option>
                      <option value="lenta">&gt; 2 segundos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase">Perfusão E</label>
                    <select
                      value={dados.teste_perfusao_pe_e}
                      onChange={(e) => updateDado('teste_perfusao_pe_e', e.target.value)}
                      className="w-full p-1.5 border border-slate-200 rounded text-xs"
                    >
                      <option value="normal">≤ 2 segundos</option>
                      <option value="lenta">&gt; 2 segundos</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase">Edema D</label>
                    <select
                      value={dados.teste_edema_pe_d}
                      onChange={(e) => updateDado('teste_edema_pe_d', e.target.value)}
                      className="w-full p-1.5 border border-slate-200 rounded text-xs"
                    >
                      <option value="ausente">Ausente</option>
                      <option value="presente">Presente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase">Edema E</label>
                    <select
                      value={dados.teste_edema_pe_e}
                      onChange={(e) => updateDado('teste_edema_pe_e', e.target.value)}
                      className="w-full p-1.5 border border-slate-200 rounded text-xs"
                    >
                      <option value="ausente">Ausente</option>
                      <option value="presente">Presente</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pulsos */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-2">
                <h6 className="font-bold text-xs uppercase text-[#0D1B3E]">Pulsos Pediosos (D/E)</h6>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Pé Direito (PD)</span>
                    <label className="flex items-center justify-between mt-1 text-[10px]">
                      <span>Dorsal:</span>
                      <select
                        value={dados.teste_pulso_dorsal_d}
                        onChange={(e) => updateDado('teste_pulso_dorsal_d', e.target.value)}
                        className="p-1 border border-slate-200 rounded text-[10px]"
                      >
                        <option value="presente">Presente</option>
                        <option value="ausente">Ausente</option>
                      </select>
                    </label>
                    <label className="flex items-center justify-between mt-1 text-[10px]">
                      <span>Tibial:</span>
                      <select
                        value={dados.teste_pulso_tibial_d}
                        onChange={(e) => updateDado('teste_pulso_tibial_d', e.target.value)}
                        className="p-1 border border-slate-200 rounded text-[10px]"
                      >
                        <option value="presente">Presente</option>
                        <option value="ausente">Ausente</option>
                      </select>
                    </label>
                  </div>

                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Pé Esquerdo (PE)</span>
                    <label className="flex items-center justify-between mt-1 text-[10px]">
                      <span>Dorsal:</span>
                      <select
                        value={dados.teste_pulso_dorsal_e}
                        onChange={(e) => updateDado('teste_pulso_dorsal_e', e.target.value)}
                        className="p-1 border border-slate-200 rounded text-[10px]"
                      >
                        <option value="presente">Presente</option>
                        <option value="ausente">Ausente</option>
                      </select>
                    </label>
                    <label className="flex items-center justify-between mt-1 text-[10px]">
                      <span>Tibial:</span>
                      <select
                        value={dados.teste_pulso_tibial_e}
                        onChange={(e) => updateDado('teste_pulso_tibial_e', e.target.value)}
                        className="p-1 border border-slate-200 rounded text-[10px]"
                      >
                        <option value="presente">Presente</option>
                        <option value="ausente">Ausente</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 6: TERMO & ASSINATURA ELETRÔNICA */}
        {activeTab === 'assinatura' && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/60 text-slate-700 space-y-4">
              <h4 className="font-bold text-sm text-[#0D1B3E] uppercase tracking-wider text-center">Termo de Consentimento Livre e Esclarecido</h4>
              
              <div className="text-xs space-y-2.5 max-h-60 overflow-y-auto leading-relaxed p-4 bg-white border border-slate-200 rounded-lg">
                <p>
                  Eu, <strong>{clienteNome}</strong>, declaro que por minha livre iniciativa aceito submeter-me aos procedimentos de avaliação e tratamento podológico recomendados pelo profissional.
                </p>
                <p>
                  Declaro que todas as informações contidas nesta Ficha de Avaliação são verdadeiras e completas. Estou ciente de que qualquer informação incorreta ou incompleta por mim prestada poderá acarretar riscos ou danos à minha saúde em decorrência do procedimento.
                </p>
                <p>
                  Declaro também estar ciente de eventuais riscos que foram explicados previamente pelo profissional responsável pelo meu atendimento.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">CPF do Paciente</label>
                  <input
                    type="text"
                    value={dados.termo_cpf}
                    onChange={(e) => updateDado('termo_cpf', e.target.value)}
                    className="w-full p-2.5 border border-[#C6C6CF] rounded-lg text-sm"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5C5D65] uppercase mb-1">RG do Paciente</label>
                  <input
                    type="text"
                    value={dados.termo_rg}
                    onChange={(e) => updateDado('termo_rg', e.target.value)}
                    className="w-full p-2.5 border border-[#C6C6CF] rounded-lg text-sm"
                    placeholder="RG / Órgão Expedidor"
                  />
                </div>
              </div>
            </div>

            {/* Canvas de Assinatura */}
            <div className="flex flex-col items-center space-y-3">
              <span className="text-xs font-bold text-[#5C5D65] uppercase">Assinatura do Paciente (Desenhe no quadro abaixo)</span>
              
              <div className="border border-slate-300 bg-white rounded-lg shadow-inner relative overflow-hidden" style={{ width: '100%', maxWidth: '500px', height: '180px' }}>
                <canvas
                  ref={canvasRef}
                  width="500"
                  height="180"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full cursor-crosshair touch-none"
                />
                {!dados.assinatura_paciente && (
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-slate-300 pointer-events-none select-none">Assine aqui</span>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="btn-secondary px-4 py-1.5 text-xs"
                >
                  Limpar Assinatura
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botões de Navegação Inferiores */}
      <div className="border-t border-[#C6C6CF]/20 pt-4 flex justify-between items-center text-xs">
        <button
          type="button"
          disabled={activeTab === 'geral'}
          onClick={() => {
            const abas: AbaTipo[] = ['geral', 'clinico', 'exame_fisico', 'unhas', 'testes', 'assinatura'];
            const idx = abas.indexOf(activeTab);
            if (idx > 0) {
              const prevAba = abas[idx - 1];
              if (prevAba) setActiveTab(prevAba);
            }
          }}
          className="btn-secondary px-4 py-2"
        >
          ← Voltar Aba
        </button>

        <button
          type="button"
          onClick={() => {
            const abas: AbaTipo[] = ['geral', 'clinico', 'exame_fisico', 'unhas', 'testes', 'assinatura'];
            const idx = abas.indexOf(activeTab);
            if (idx < abas.length - 1) {
              const nextAba = abas[idx + 1];
              if (nextAba) setActiveTab(nextAba);
            } else {
              handleSaveAll();
            }
          }}
          className="btn-primary px-5 py-2"
        >
          {activeTab === 'assinatura' ? 'Salvar Ficha' : 'Próxima Aba →'}
        </button>
      </div>
    </div>
  );
}
