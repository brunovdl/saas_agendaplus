import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('E-mail inválido').trim(),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

export const CadastroSchema = z.object({
  nome_completo: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').trim(),
  nome_negocio: z.string().min(2, 'Nome do negócio deve ter pelo menos 2 caracteres').trim(),
  telefone: z
    .string()
    .trim()
    .transform((val) => {
      const limpo = val.replace(/[^\d+]/g, '');
      if (!limpo) return '';
      if (!limpo.startsWith('+')) {
        if (limpo.startsWith('55') && (limpo.length === 12 || limpo.length === 13)) {
          return `+${limpo}`;
        }
        return `+55${limpo}`;
      }
      return limpo;
    })
    .pipe(
      z
        .string()
        .regex(/^\+[1-9]\d{7,14}$/, 'Telefone deve ser válido com DDD (ex: (11) 99999-9999)')
        .or(z.literal(''))
    )
    .optional(),
  timezone: z.string().default('America/Sao_Paulo'),
  email: z.string().email('E-mail inválido').trim(),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
});

export type CadastroFormData = z.infer<typeof CadastroSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido').trim(),
});

export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
  confirmPassword: z.string().min(8, 'A confirmação de senha deve ter no mínimo 8 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;
