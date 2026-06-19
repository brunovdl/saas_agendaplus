-- 1. Alterar a tabela de prestadores para incluir o nicho de trabalho
ALTER TABLE public.prestadores 
  ADD COLUMN IF NOT EXISTS nicho TEXT CHECK (nicho IN ('saude_estetica', 'servicos_manutencao'));

-- 2. Criar a tabela de clientes
CREATE TABLE IF NOT EXISTS public.clientes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.prestadores(id) ON DELETE CASCADE,
  nome             TEXT NOT NULL CHECK (char_length(nome) BETWEEN 2 AND 120),
  telefone         TEXT NOT NULL CHECK (telefone ~ '^\+[1-9]\d{7,14}$'),
  email            TEXT,
  data_nascimento  DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_cliente_telefone UNIQUE (user_id, telefone)
);

-- Índices para otimização de busca
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_telefone ON public.clientes(telefone);

-- Habilitar Row Level Security (RLS) para clientes
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes FORCE ROW LEVEL SECURITY;

-- Políticas de RLS para clientes
CREATE POLICY "Clientes leitura própria" ON public.clientes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Clientes inserção própria" ON public.clientes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Clientes atualização própria" ON public.clientes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Clientes deleção própria" ON public.clientes FOR DELETE USING (auth.uid() = user_id);

-- 3. Modificar a tabela de agendamentos para suportar relacionamento com cliente
ALTER TABLE public.agendamentos 
  ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente_id ON public.agendamentos(cliente_id);

-- 4. Criar a tabela de anamneses (exclusiva para Saúde & Estética)
CREATE TABLE IF NOT EXISTS public.anamneses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id       UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE UNIQUE,
  user_id          UUID NOT NULL REFERENCES public.prestadores(id) ON DELETE CASCADE,
  alergias         TEXT,
  medicamentos     TEXT,
  doencas_cronicas TEXT,
  queixa_principal TEXT,
  observacoes      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS para anamneses
ALTER TABLE public.anamneses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anamneses FORCE ROW LEVEL SECURITY;

-- Políticas de RLS para anamneses
CREATE POLICY "Anamneses leitura própria" ON public.anamneses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anamneses inserção própria" ON public.anamneses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anamneses atualização própria" ON public.anamneses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anamneses deleção própria" ON public.anamneses FOR DELETE USING (auth.uid() = user_id);

-- 5. Criar a tabela de histórico de serviços (exclusiva para Serviços & Manutenção)
CREATE TABLE IF NOT EXISTS public.historico_servicos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id    UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.prestadores(id) ON DELETE CASCADE,
  data_servico  DATE NOT NULL DEFAULT CURRENT_DATE,
  descricao     TEXT NOT NULL CHECK (char_length(descricao) >= 2),
  valor         NUMERIC(10,2) CHECK (valor >= 0),
  observacoes   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS para histórico de serviços
ALTER TABLE public.historico_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_servicos FORCE ROW LEVEL SECURITY;

-- Políticas de RLS para histórico de serviços
CREATE POLICY "Histórico leitura própria" ON public.historico_servicos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Histórico inserção própria" ON public.historico_servicos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Histórico atualização própria" ON public.historico_servicos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Histórico deleção própria" ON public.historico_servicos FOR DELETE USING (auth.uid() = user_id);
