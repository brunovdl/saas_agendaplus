'use server';

import { createClient } from '@/lib/supabase/server';
import { 
  ClienteSchema, 
  AnamneseSchema, 
  HistoricoServicoSchema,
  type ClienteFormData,
  type AnamneseFormData,
  type HistoricoServicoFormData 
} from '@/lib/validations/cliente';
import { revalidatePath } from 'next/cache';

// ─── Atualizar o nicho do prestador (Onboarding) ──────────────────────────
export async function saveNichoPrestador(nicho: 'saude_estetica' | 'servicos_manutencao' | 'podologia') {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { error: 'Você precisa estar logado para realizar esta ação.' };
  }

  const { error } = await supabase
    .from('prestadores')
    .update({ nicho })
    .eq('id', authData.user.id);

  if (error) {
    console.error('[Save Nicho Error]', error);
    return { error: 'Erro ao salvar o nicho. Tente novamente mais tarde.' };
  }

  revalidatePath('/agenda');
  revalidatePath('/clientes');
  return { success: true };
}

// ─── Obter perfil do prestador ─────────────────────────────────────────────
export async function getPrestadorPerfil() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return null;
  }

  const { data, error } = await supabase
    .from('prestadores')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (error || !data) {
    console.error('[Get Prestador Error]', error);
    return null;
  }

  return data;
}

// ─── Listar clientes com filtro de busca ──────────────────────────────────
export async function getClientes(busca?: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return [];
  }

  let query = supabase
    .from('clientes')
    .select('*')
    .eq('user_id', authData.user.id)
    .order('nome', { ascending: true });

  if (busca && busca.trim() !== '') {
    const termo = `%${busca.trim()}%`;
    query = query.or(`nome.ilike.${termo},telefone.ilike.${termo}`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[Get Clientes Error]', error);
    return [];
  }

  return data ?? [];
}

// ─── Obter detalhes de um cliente ──────────────────────────────────────────
export async function getClienteDetails(id: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return null;
  }

  // 1. Carrega o cliente
  const { data: cliente, error: cliError } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .eq('user_id', authData.user.id)
    .single();

  if (cliError || !cliente) {
    console.error('[Get Cliente Details Error]', cliError);
    return null;
  }

  // 2. Carrega a Ficha de Anamnese (opcional)
  const { data: anamnese } = await supabase
    .from('anamneses')
    .select('*')
    .eq('cliente_id', id)
    .single();

  // Carrega a Ficha de Anamnese de Podologia (opcional)
  const { data: anamnesePodologia } = await supabase
    .from('anamneses_podologia')
    .select('*')
    .eq('cliente_id', id)
    .single();

  // 3. Carrega o Histórico de Serviços (opcional)
  const { data: historico } = await supabase
    .from('historico_servicos')
    .select('*')
    .eq('cliente_id', id)
    .order('data_servico', { ascending: false });

  // 4. Carrega os Agendamentos recentes
  const { data: agendamentos } = await supabase
    .from('agendamentos')
    .select('*')
    .eq('cliente_id', id)
    .order('data_hora_inicio', { ascending: false });

  return {
    cliente,
    anamnese: anamnese ?? null,
    anamnesePodologia: anamnesePodologia ?? null,
    historico: historico ?? [],
    agendamentos: agendamentos ?? [],
  };
}

// ─── Criar cliente manualmente ─────────────────────────────────────────────
export async function createCliente(data: ClienteFormData) {
  const result = ClienteSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Dados inválidos. Verifique os campos preenchidos.' };
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { error: 'Acesso negado.' };
  }

  const { nome, telefone, email, data_nascimento } = result.data;

  const { data: newCli, error } = await supabase
    .from('clientes')
    .insert({
      user_id: authData.user.id,
      nome,
      telefone,
      email: email || null,
      data_nascimento: data_nascimento || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { error: 'Um cliente com este telefone já está cadastrado.' };
    }
    console.error('[Create Cliente Error]', error);
    return { error: 'Erro ao cadastrar o cliente.' };
  }

  revalidatePath('/clientes');
  return { success: true, data: newCli };
}

// ─── Atualizar cliente manualmente ─────────────────────────────────────────
export async function updateCliente(id: string, data: ClienteFormData) {
  const result = ClienteSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Dados inválidos.' };
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { error: 'Acesso negado.' };
  }

  const { nome, telefone, email, data_nascimento } = result.data;

  const { error } = await supabase
    .from('clientes')
    .update({
      nome,
      telefone,
      email: email || null,
      data_nascimento: data_nascimento || null,
    })
    .eq('id', id)
    .eq('user_id', authData.user.id);

  if (error) {
    if (error.code === '23505') {
      return { error: 'Outro cliente com este telefone já está cadastrado.' };
    }
    console.error('[Update Cliente Error]', error);
    return { error: 'Erro ao atualizar dados do cliente.' };
  }

  revalidatePath('/clientes');
  revalidatePath(`/clientes/${id}`);
  return { success: true };
}

// ─── Salvar/Atualizar Ficha de Anamnese ────────────────────────────────────
export async function saveAnamnese(clienteId: string, data: AnamneseFormData) {
  const result = AnamneseSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Dados inválidos.' };
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { error: 'Acesso negado.' };
  }

  // Verifica se o cliente pertence a este prestador
  const { data: cliente } = await supabase
    .from('clientes')
    .select('id')
    .eq('id', clienteId)
    .eq('user_id', authData.user.id)
    .single();

  if (!cliente) {
    return { error: 'Cliente não encontrado ou não pertence à sua conta.' };
  }

  // Upsert na tabela de anamneses
  const { error } = await supabase
    .from('anamneses')
    .upsert({
      cliente_id: clienteId,
      user_id: authData.user.id,
      ...result.data,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'cliente_id' });

  if (error) {
    console.error('[Save Anamnese Error]', error);
    return { error: 'Erro ao salvar a ficha de anamnese.' };
  }

  revalidatePath(`/clientes/${clienteId}`);
  return { success: true };
}

// ─── Salvar/Atualizar Ficha de Anamnese de Podologia ───────────────────────
export async function saveAnamnesePodologia(clienteId: string, dados: any) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { error: 'Acesso negado.' };
  }

  // Verifica se o cliente pertence a este prestador
  const { data: cliente } = await supabase
    .from('clientes')
    .select('id')
    .eq('id', clienteId)
    .eq('user_id', authData.user.id)
    .single();

  if (!cliente) {
    return { error: 'Cliente não encontrado ou não pertence à sua conta.' };
  }

  // Upsert na tabela de anamneses_podologia
  const { error } = await supabase
    .from('anamneses_podologia')
    .upsert({
      cliente_id: clienteId,
      user_id: authData.user.id,
      dados: dados || {},
      updated_at: new Date().toISOString(),
    }, { onConflict: 'cliente_id' });

  if (error) {
    console.error('[Save Anamnese Podologia Error]', error);
    return { error: 'Erro ao salvar a ficha de anamnese de podologia.' };
  }

  revalidatePath(`/clientes/${clienteId}`);
  return { success: true };
}

// ─── Adicionar registro ao Histórico de Serviços ───────────────────────────
export async function addHistoricoServico(data: HistoricoServicoFormData) {
  const result = HistoricoServicoSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Dados inválidos. Verifique os campos.' };
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { error: 'Acesso negado.' };
  }

  const { cliente_id, data_servico, descricao, valor, observacoes } = result.data;

  // Verifica se o cliente pertence a este prestador
  const { data: cliente } = await supabase
    .from('clientes')
    .select('id')
    .eq('id', cliente_id)
    .eq('user_id', authData.user.id)
    .single();

  if (!cliente) {
    return { error: 'Cliente não encontrado.' };
  }

  const { error } = await supabase
    .from('historico_servicos')
    .insert({
      cliente_id,
      user_id: authData.user.id,
      data_servico,
      descricao,
      valor: valor || 0,
      observacoes: observacoes || null,
    });

  if (error) {
    console.error('[Add Servico Error]', error);
    return { error: 'Erro ao registrar o serviço no histórico.' };
  }

  revalidatePath(`/clientes/${cliente_id}`);
  return { success: true };
}
