'use server';

import { createClient } from '@/lib/supabase/server';
import { AgendamentoSchema, AgendamentoUpdateSchema, type AgendamentoFormData, type AgendamentoUpdateData } from '@/lib/validations/agendamento';
import { revalidatePath } from 'next/cache';
import type { TablesUpdate } from '@/types/supabase';

export async function createAgendamento(data: AgendamentoFormData) {
  const result = AgendamentoSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Dados inválidos. Verifique os campos do formulário.' };
  }

  const supabase = await createClient();

  // Verifica usuário autenticado (a RLS já garante isso no banco, mas checamos no servidor para feedback amigável)
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { error: 'Você precisa estar logado para criar um agendamento.' };
  }

  const { cliente_nome, cliente_telefone, ...resto } = result.data;

  // ─── Sincronização Automática do Cliente ──────────────────────────────
  let clienteId: string | null = null;
  
  // 1. Procurar se já existe cliente com o mesmo telefone para esse prestador
  const { data: clienteExistente, error: getCliError } = await supabase
    .from('clientes')
    .select('id, nome')
    .eq('user_id', authData.user.id)
    .eq('telefone', cliente_telefone)
    .maybeSingle();

  if (getCliError || !clienteExistente) {
    // 2. Criar novo cliente caso não exista
    const { data: novoCliente, error: createCliError } = await supabase
      .from('clientes')
      .insert({
        user_id: authData.user.id,
        nome: cliente_nome,
        telefone: cliente_telefone,
      })
      .select('id')
      .maybeSingle();

    if (!createCliError && novoCliente) {
      clienteId = novoCliente.id;
    } else {
      console.error('[Sync Cliente Insert Error]', createCliError);
    }
  } else {
    // 3. Usar cliente existente e atualizar o nome se mudou
    clienteId = clienteExistente.id;
    if (clienteExistente.nome !== cliente_nome) {
      await supabase
        .from('clientes')
        .update({ nome: cliente_nome })
        .eq('id', clienteId);
    }
  }

  // O Supabase vai disparar automaticamente o Webhook de criação (mutacao) via PostgreSQL Trigger!
  const { error } = await supabase.from('agendamentos').insert({
    cliente_nome,
    cliente_telefone,
    ...resto,
    cliente_id: clienteId,
    user_id: authData.user.id,
  });

  if (error) {
    // Tratar violação de sobreposição do EXCLUDE USING gist
    if (error.code === '23P01') {
      return { error: 'Já existe um agendamento neste horário. Por favor, escolha outro.' };
    }
    console.error('[Create Agendamento Error]', error);
    return { error: 'Erro ao criar agendamento. Tente novamente mais tarde.' };
  }

  revalidatePath('/agenda');
  revalidatePath('/agendamentos');
  revalidatePath('/clientes');
  if (clienteId) {
    revalidatePath(`/clientes/${clienteId}`);
  }
  return { success: true };
}

export async function updateAgendamento(id: string, data: AgendamentoUpdateData) {
  const result = AgendamentoUpdateSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Dados inválidos.' };
  }

  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { error: 'Acesso negado.' };
  }

  const updatePayload: TablesUpdate<'agendamentos'> = { ...result.data };

  // ─── Sincronização do Cliente no Update ────────────────────────────────
  if (result.data.cliente_telefone) {
    const telefone = result.data.cliente_telefone;
    const nome = result.data.cliente_nome;

    let nomeFinal = nome ?? '';
    if (!nomeFinal) {
      const { data: agendamentoAtual } = await supabase
        .from('agendamentos')
        .select('cliente_nome')
        .eq('id', id)
        .single();
      nomeFinal = agendamentoAtual?.cliente_nome ?? 'Cliente Sem Nome';
    }

    let clienteId: string | null = null;
    const { data: clienteExistente } = await supabase
      .from('clientes')
      .select('id, nome')
      .eq('user_id', authData.user.id)
      .eq('telefone', telefone)
      .maybeSingle();

    if (!clienteExistente) {
      const { data: novoCliente } = await supabase
        .from('clientes')
        .insert({
          user_id: authData.user.id,
          nome: nomeFinal,
          telefone: telefone,
        })
        .select('id')
        .maybeSingle();
      if (novoCliente) clienteId = novoCliente.id;
    } else {
      clienteId = clienteExistente.id;
      if (clienteExistente.nome !== nomeFinal && nomeFinal !== 'Cliente Sem Nome') {
        await supabase
          .from('clientes')
          .update({ nome: nomeFinal })
          .eq('id', clienteId);
      }
    }
    updatePayload.cliente_id = clienteId;
  }

  const { error } = await supabase
    .from('agendamentos')
    .update(updatePayload)
    .eq('id', id)
    .eq('user_id', authData.user.id);

  if (error) {
    if (error.code === '23P01') {
      return { error: 'Conflito de horários: já existe um agendamento para a nova data/hora.' };
    }
    console.error('[Update Agendamento Error]', error);
    return { error: 'Erro ao atualizar o agendamento.' };
  }

  revalidatePath('/agenda');
  revalidatePath('/agendamentos');
  revalidatePath('/clientes');
  if (updatePayload.cliente_id) {
    revalidatePath(`/clientes/${updatePayload.cliente_id}`);
  }
  return { success: true };
}

export async function cancelarAgendamento(id: string) {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { error: 'Acesso negado.' };
  }

  // Carrega o agendamento para obter o cliente_id para revalidação
  const { data: agendamento } = await supabase
    .from('agendamentos')
    .select('cliente_id')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('agendamentos')
    .update({ status: 'cancelado' })
    .eq('id', id)
    .eq('user_id', authData.user.id);

  if (error) {
    console.error('[Cancel Agendamento Error]', error);
    return { error: 'Erro ao cancelar agendamento.' };
  }

  revalidatePath('/agenda');
  revalidatePath('/agendamentos');
  if (agendamento?.cliente_id) {
    revalidatePath(`/clientes/${agendamento.cliente_id}`);
  }
  return { success: true };
}

export async function concluirAgendamento(id: string) {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { error: 'Acesso negado.' };
  }

  // Carrega o agendamento para obter o cliente_id para revalidação
  const { data: agendamento } = await supabase
    .from('agendamentos')
    .select('cliente_id')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('agendamentos')
    .update({ status: 'concluido' })
    .eq('id', id)
    .eq('user_id', authData.user.id);

  if (error) {
    console.error('[Concluir Agendamento Error]', error);
    return { error: 'Erro ao concluir agendamento.' };
  }

  revalidatePath('/agenda');
  revalidatePath('/agendamentos');
  if (agendamento?.cliente_id) {
    revalidatePath(`/clientes/${agendamento.cliente_id}`);
  }
  return { success: true };
}
