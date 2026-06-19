import { z } from 'zod';

const TELEFONE_E164 = /^\+[1-9]\d{7,14}$/;

export const ClienteSchema = z.object({
  nome: z
    .string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres')
    .max(120, 'O nome deve ter no máximo 120 caracteres')
    .trim(),
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
        .regex(TELEFONE_E164, 'WhatsApp deve ser válido com DDD (ex: (11) 99999-9999)')
    ),
  email: z
    .string()
    .trim()
    .email('E-mail inválido')
    .optional()
    .or(z.literal('')),
  data_nascimento: z
    .string()
    .optional()
    .or(z.literal('')),
});

export type ClienteFormData = z.infer<typeof ClienteSchema>;

export const AnamneseSchema = z.object({
  alergias: z.string().max(1000, 'Máximo 1000 caracteres').optional().or(z.literal('')),
  medicamentos: z.string().max(1000, 'Máximo 1000 caracteres').optional().or(z.literal('')),
  doencas_cronicas: z.string().max(1000, 'Máximo 1000 caracteres').optional().or(z.literal('')),
  queixa_principal: z.string().max(1000, 'Máximo 1000 caracteres').optional().or(z.literal('')),
  observacoes: z.string().max(2000, 'Máximo 2000 caracteres').optional().or(z.literal('')),
});

export type AnamneseFormData = z.infer<typeof AnamneseSchema>;

export const AnamnesePodologiaSchema = z.object({
  dados: z.record(z.string(), z.any()).optional().default({}),
});

export type AnamnesePodologiaFormData = z.infer<typeof AnamnesePodologiaSchema>;

export const HistoricoServicoSchema = z.object({
  cliente_id: z.string().uuid('ID do cliente inválido'),
  data_servico: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  descricao: z.string().min(2, 'A descrição deve ter pelo menos 2 caracteres').max(1000, 'Máximo 1000 caracteres'),
  valor: z
    .number()
    .min(0, 'O valor não pode ser negativo')
    .optional()
    .or(z.literal(0)),
  observacoes: z.string().max(2000, 'Máximo 2000 caracteres').optional().or(z.literal('')),
});

export type HistoricoServicoFormData = z.infer<typeof HistoricoServicoSchema>;
