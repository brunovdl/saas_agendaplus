CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE agendamento_status AS ENUM (
  'pendente', 'confirmado', 'cancelado', 'remarcado'
);

CREATE TABLE public.agendamentos (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_nome       TEXT NOT NULL CHECK (char_length(cliente_nome) BETWEEN 2 AND 120),
  cliente_telefone   TEXT NOT NULL CHECK (cliente_telefone ~ '^\+[1-9]\d{7,14}$'),
  data_hora_inicio   TIMESTAMPTZ NOT NULL,
  data_hora_fim      TIMESTAMPTZ NOT NULL,
  status             agendamento_status NOT NULL DEFAULT 'pendente',
  observacoes        TEXT,
  webhook_disparado  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT inicio_antes_fim CHECK (data_hora_inicio < data_hora_fim),
  CONSTRAINT sem_sobreposicao EXCLUDE USING gist (
    user_id WITH =,
    tstzrange(data_hora_inicio, data_hora_fim) WITH &&
  )
);

CREATE INDEX idx_agendamentos_user_id     ON public.agendamentos(user_id);
CREATE INDEX idx_agendamentos_data_inicio ON public.agendamentos(data_hora_inicio);
CREATE INDEX idx_agendamentos_status      ON public.agendamentos(status);
CREATE INDEX idx_agendamentos_lembrete    ON public.agendamentos(status, data_hora_inicio)
  WHERE webhook_disparado = FALSE AND status = 'confirmado';

CREATE TABLE public.webhook_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id UUID REFERENCES public.agendamentos(id),
  tipo_evento    TEXT NOT NULL,
  payload        JSONB NOT NULL,
  status_http    INTEGER,
  tentativas     INTEGER NOT NULL DEFAULT 0,
  sucesso        BOOLEAN NOT NULL DEFAULT FALSE,
  erro_msg       TEXT,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.prestadores (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_negocio  TEXT NOT NULL,
  nome_completo TEXT NOT NULL,
  telefone      TEXT,
  timezone      TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
