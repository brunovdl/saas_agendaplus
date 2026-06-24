'use server';

import { createClient } from '@/lib/supabase/server';
import {
  CadastroSchema,
  CadastroFormData,
  ForgotPasswordSchema,
  ForgotPasswordFormData,
  ResetPasswordSchema,
  ResetPasswordFormData,
} from '@/lib/validations/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

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

export async function solicitarRecuperacaoSenha(data: ForgotPasswordFormData) {
  const result = ForgotPasswordSchema.safeParse(data);
  if (!result.success) {
    return { error: 'E-mail inválido.' };
  }

  const { email } = result.data;
  const supabase = await createClient();

  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') ?? 'http';
  const origin = `${protocol}://${host}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/recuperar-senha`,
  });

  if (error) {
    console.error('[Reset Password Request Error]', error);
    return { error: 'Não foi possível enviar o e-mail de recuperação. Verifique o endereço digitado.' };
  }

  return { success: true, message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha em instantes.' };
}

export async function redefinirSenha(data: ResetPasswordFormData) {
  const result = ResetPasswordSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || 'Dados inválidos.' };
  }

  const { password } = result.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    console.error('[Reset Password Update Error]', error);
    return { error: 'Erro ao redefinir a senha: ' + error.message };
  }

  return { success: true, message: 'Senha atualizada com sucesso!' };
}
