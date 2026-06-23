'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { FormAgendamentoSchema, FormEditarAgendamentoSchema, type FormAgendamentoData, type AgendamentoFormData } from '@/lib/validations/agendamento';
import { createAgendamento, updateAgendamento } from '@/app/(dashboard)/agendamentos/actions';

interface AgendamentoFormProps {
  initialData?: Partial<AgendamentoFormData> & { id?: string };
  onSuccess?: () => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

export default function AgendamentoForm({ initialData, onSuccess, onCancel, readOnly = false }: AgendamentoFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  // Helper para converter ISO string para o formato YYYY-MM-DDThh:mm do input HTML
  const formatForInput = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    // Ajusta para o timezone local do browser para exibir no input
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const isEdit = !!initialData?.id;

  // Extrai data e horários locais caso haja initialData
  const getInitialValues = () => {
    const formattedInicio = initialData?.data_hora_inicio ? formatForInput(initialData.data_hora_inicio) : '';
    const formattedFim = initialData?.data_hora_fim ? formatForInput(initialData.data_hora_fim) : '';
    
    return {
      cliente_nome: initialData?.cliente_nome || '',
      cliente_telefone: initialData?.cliente_telefone || '',
      data_agendamento: formattedInicio ? formattedInicio.slice(0, 10) : '',
      hora_inicio: formattedInicio ? formattedInicio.slice(11, 16) : '',
      hora_fim: formattedFim ? formattedFim.slice(11, 16) : '',
      status: initialData?.status || 'pendente',
      observacoes: initialData?.observacoes || '',
    };
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormAgendamentoData>({
    resolver: zodResolver(isEdit ? FormEditarAgendamentoSchema : FormAgendamentoSchema),
    defaultValues: getInitialValues(),
  });

  const onSubmit = (data: FormAgendamentoData) => {
    setServerError(null);

    startTransition(async () => {
      // Combina data e horas locais do browser para criar objetos Date locais e gerar a string ISO correspondente
      const dateInicio = new Date(`${data.data_agendamento}T${data.hora_inicio}`);
      const dateFim = new Date(`${data.data_agendamento}T${data.hora_fim}`);

      const payload: AgendamentoFormData = {
        cliente_nome: data.cliente_nome,
        cliente_telefone: data.cliente_telefone,
        data_hora_inicio: dateInicio.toISOString(),
        data_hora_fim: dateFim.toISOString(),
        status: data.status,
        observacoes: data.observacoes,
      };

      const res = isEdit
        ? await updateAgendamento(initialData.id!, payload)
        : await createAgendamento(payload);

      if (res?.error) {
        setServerError(res.error);
      } else {
        if (onSuccess) onSuccess();
        else router.push('/agendamentos');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      
      {serverError && (
        <div style={{ padding: '12px', background: '#FEE2E2', color: '#B91C1C', borderRadius: '8px', fontSize: '14px' }}>
          {serverError}
        </div>
      )}

      <div>
        <label className="label">Nome do Cliente</label>
        <input className="input" {...register('cliente_nome')} placeholder="Ex: João Silva" disabled={readOnly} />
        {errors.cliente_nome && <p className="error-msg">{errors.cliente_nome.message}</p>}
      </div>

      <div>
        <label className="label">WhatsApp</label>
        <input className="input" type="tel" {...register('cliente_telefone')} placeholder="(11) 99999-9999" disabled={readOnly} />
        {errors.cliente_telefone && <p className="error-msg">{errors.cliente_telefone.message}</p>}
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 180px' }}>
          <label className="label">Data do Agendamento</label>
          <input 
            className="input" 
            type="date" 
            {...register('data_agendamento')} 
            disabled={readOnly}
          />
          {errors.data_agendamento && <p className="error-msg">{errors.data_agendamento.message}</p>}
        </div>

        <div style={{ flex: '1 1 100px' }}>
          <label className="label">Hora de Início</label>
          <input 
            className="input" 
            type="time" 
            {...register('hora_inicio')} 
            disabled={readOnly}
          />
          {errors.hora_inicio && <p className="error-msg">{errors.hora_inicio.message}</p>}
        </div>

        <div style={{ flex: '1 1 100px' }}>
          <label className="label">Hora de Término</label>
          <input 
            className="input" 
            type="time" 
            {...register('hora_fim')} 
            disabled={readOnly}
          />
          {errors.hora_fim && <p className="error-msg">{errors.hora_fim.message}</p>}
        </div>
      </div>

      <div>
        <label className="label">Status</label>
        <select className="input" {...register('status')} disabled={readOnly}>
          <option value="pendente">Pendente</option>
          <option value="confirmado">Confirmado</option>
          <option value="remarcado">Remarcado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        {errors.status && <p className="error-msg">{errors.status.message}</p>}
      </div>

      <div>
        <label className="label">Observações</label>
        <textarea className="input" rows={3} {...register('observacoes')} placeholder="Descrição do serviço" disabled={readOnly} />
        {errors.observacoes && <p className="error-msg">{errors.observacoes.message}</p>}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        {!readOnly && (
          <button type="submit" className="btn-primary flex-1" disabled={isPending}>
            {isPending ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Agendamento'}
          </button>
        )}
        <button type="button" className="btn-secondary flex-1" onClick={() => (onCancel ? onCancel() : router.back())} disabled={isPending}>
          {readOnly ? 'Fechar' : 'Cancelar'}
        </button>
      </div>
    </form>
  );
}
