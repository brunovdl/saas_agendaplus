-- 1. Alterar a restrição de nicho na tabela de prestadores para incluir 'podologia'
ALTER TABLE public.prestadores DROP CONSTRAINT IF EXISTS prestadores_nicho_check;
ALTER TABLE public.prestadores ADD CONSTRAINT prestadores_nicho_check CHECK (nicho IN ('saude_estetica', 'servicos_manutencao', 'podologia'));

-- 2. Criar a tabela de anamneses para o nicho de Podologia (dados complexos em JSONB)
CREATE TABLE IF NOT EXISTS public.anamneses_podologia (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id       UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE UNIQUE,
  user_id          UUID NOT NULL REFERENCES public.prestadores(id) ON DELETE CASCADE,
  dados            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar índice para busca rápida por cliente
CREATE INDEX IF NOT EXISTS idx_anamneses_podologia_cliente_id ON public.anamneses_podologia(cliente_id);
CREATE INDEX IF NOT EXISTS idx_anamneses_podologia_user_id ON public.anamneses_podologia(user_id);

-- 3. Habilitar Row Level Security (RLS) para anamneses_podologia
ALTER TABLE public.anamneses_podologia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anamneses_podologia FORCE ROW LEVEL SECURITY;

-- 4. Políticas de RLS para anamneses_podologia
CREATE POLICY "Anamneses podologia leitura própria" ON public.anamneses_podologia FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anamneses podologia inserção própria" ON public.anamneses_podologia FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anamneses podologia atualização própria" ON public.anamneses_podologia FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anamneses podologia deleção própria" ON public.anamneses_podologia FOR DELETE USING (auth.uid() = user_id);
