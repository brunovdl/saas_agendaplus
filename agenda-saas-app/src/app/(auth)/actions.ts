'use server';

import { createClient } from '@/lib/supabase/server';
import { CadastroSchema, CadastroFormData } from '@/lib/validations/auth';
import { redirect } from 'next/navigation';

export async function signUpPrestador(data: CadastroFormData) {
  const result = CadastroSchema.safeParse(data);
  if (!result.success) {
    return { error: 'Dados inválidos. Verifique os campos preenchidos.' };
  }

  const { email, password, nome_completo, nome_negocio, timezone, telefone } = result.data;
  const tel = telefone && telefone.trim() !== '' ? telefone : undefined;

  const supabase = await createClient();

  // 1. Criar usuário no Auth (Supabase)
  // O trigger `on_auth_user_created` no banco intercepta essa criação e insere
  // automaticamente o registro correspondente na tabela `public.prestadores` usando os dados de metadata.
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nome_completo,
        nome_negocio,
        timezone,
        telefone: tel,
      },
    },
  });

  if (authError) {
    // Tratamento de mensagens comuns
    if (authError.message.includes('already registered')) {
      return { error: 'Este e-mail já está em uso.' };
    }
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: 'Erro inesperado ao criar a conta.' };
  }

  // 2. Se o Supabase configurar a sessão instantaneamente (ex: auto-confirm = true)
  if (authData.session) {
    redirect('/agenda');
  }

  return { success: true, message: 'Cadastro realizado com sucesso! Se necessário, verifique seu e-mail para confirmar a conta.' };
}
