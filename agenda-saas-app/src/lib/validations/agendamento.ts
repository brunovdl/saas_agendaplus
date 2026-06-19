import { z } from 'zod';

/**
 * Regex E.164 para telefones WhatsApp.
 * Aceita: +5511999999999, +1234567890, etc.
 * O n8n usa este formato diretamente para identificar o destino no WhatsApp.
 */
const TELEFONE_E164 = /^\+[1-9]\d{7,14}$/;

/**
 * Schema de validação para criação/edição de agendamento.
 * Validação em dupla camada: Zod (client-side) + Check Constraints (PostgreSQL).
 */
export const BaseAgendamentoSchema = z.object({
    cliente_nome: z
      .string()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(120, 'Nome deve ter no máximo 120 caracteres')
      .trim(),

    cliente_telefone: z
      .string()
      .trim()
      .transform((val) => {
        const limpo = val.replace(/[^\d+]/g, '');
        if (!limpo) return '';
        
        // Se não começa com +, adicionamos o prefixo correto
        if (!limpo.startsWith('+')) {
          // Se o usuário digitou o prefixo 55 mas sem o + (ex: 5511999999999)
          if (limpo.startsWith('55') && (limpo.length === 12 || limpo.length === 13)) {
            return `+${limpo}`;
          }
          // Caso contrário, assume-se que é um número nacional e adicionamos +55
          return `+55${limpo}`;
        }
        return limpo;
      })
      .pipe(
        z
          .string()
          .regex(TELEFONE_E164, 'Telefone deve ser válido com DDD (ex: (11) 99999-9999)')
          .trim()
      ),

    data_hora_inicio: z
      .string({ error: 'Data/hora de início é obrigatória' })
      .min(1, 'Data/hora de início é obrigatória'),

    data_hora_fim: z
      .string({ error: 'Data/hora de fim é obrigatória' })
      .min(1, 'Data/hora de fim é obrigatória'),

    status: z.enum(['pendente', 'confirmado', 'cancelado', 'remarcado'], {
      error: 'Status inválido',
    }),

    observacoes: z
      .string()
      .max(500, 'Observações devem ter no máximo 500 caracteres')
      .trim()
      .optional(),
});

export const AgendamentoSchema = BaseAgendamentoSchema
  .refine(
    (data) => new Date(data.data_hora_inicio) < new Date(data.data_hora_fim),
    {
      message: 'O horário de início deve ser anterior ao horário de fim',
      path: ['data_hora_fim'],
    }
  )
  .refine(
    (data) => new Date(data.data_hora_inicio) > new Date(),
    {
      message: 'O agendamento não pode ser no passado',
      path: ['data_hora_inicio'],
    }
  );

export type AgendamentoFormData = z.infer<typeof AgendamentoSchema>;

export const FormAgendamentoSchema = z.object({
  cliente_nome: BaseAgendamentoSchema.shape.cliente_nome,
  cliente_telefone: BaseAgendamentoSchema.shape.cliente_telefone,
  data_agendamento: z.string().min(1, 'A data é obrigatória').regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  hora_inicio: z.string().min(1, 'O horário de início é obrigatório').regex(/^\d{2}:\d{2}$/, 'Horário inválido'),
  hora_fim: z.string().min(1, 'O horário de término é obrigatório').regex(/^\d{2}:\d{2}$/, 'Horário inválido'),
  status: BaseAgendamentoSchema.shape.status,
  observacoes: BaseAgendamentoSchema.shape.observacoes,
}).refine(
  (data) => {
    if (!data.data_agendamento || !data.hora_inicio || !data.hora_fim) return true;
    const inicio = new Date(`${data.data_agendamento}T${data.hora_inicio}`);
    const fim = new Date(`${data.data_agendamento}T${data.hora_fim}`);
    return inicio < fim;
  },
  {
    message: 'O horário de início deve ser anterior ao horário de fim',
    path: ['hora_fim'],
  }
).refine(
  (data) => {
    if (!data.data_agendamento || !data.hora_inicio) return true;
    const inicio = new Date(`${data.data_agendamento}T${data.hora_inicio}`);
    // Dá uma tolerância de 1 minuto para evitar conflito de milissegundos na submissão
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - 1);
    return inicio > agora;
  },
  {
    message: 'O agendamento não pode ser no passado',
    path: ['hora_inicio'],
  }
);

export type FormAgendamentoData = z.infer<typeof FormAgendamentoSchema>;

/**
 * Schema para atualização parcial (todos os campos opcionais exceto id).
 */
export const AgendamentoUpdateSchema = BaseAgendamentoSchema.partial();
export type AgendamentoUpdateData = z.infer<typeof AgendamentoUpdateSchema>;

/**
 * Schema de filtros para listagem de agendamentos.
 */
export const AgendamentoFiltrosSchema = z.object({
  status: z.enum(['pendente', 'confirmado', 'cancelado', 'remarcado']).optional(),
  data_inicio: z.string().date().optional(),
  data_fim: z.string().date().optional(),
  page: z.number().int().positive().default(1),
  per_page: z.number().int().positive().max(100).default(20),
});

export type AgendamentoFiltros = z.infer<typeof AgendamentoFiltrosSchema>;
