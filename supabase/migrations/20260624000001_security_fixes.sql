-- ==============================================================
-- AGENDA+ SAAS — Correções de Segurança no Banco de Dados
-- Data: 2026-06-24
-- ==============================================================

-- 1. SEC-01: Habilitar RLS e forçar RLS na tabela chat_history para evitar exposição pública
ALTER TABLE IF EXISTS public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_history FORCE ROW LEVEL SECURITY;

-- 2. SEC-05: Corrigir Políticas RLS para garantir Tenant Isolation (evitar injeção de cliente_id cruzado)

-- Tabela anamneses
DROP POLICY IF EXISTS "Anamneses inserção própria" ON public.anamneses;
CREATE POLICY "Anamneses inserção própria" ON public.anamneses 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.clientes 
      WHERE id = cliente_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anamneses atualização própria" ON public.anamneses;
CREATE POLICY "Anamneses atualização própria" ON public.anamneses 
  FOR UPDATE 
  USING (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.clientes 
      WHERE id = cliente_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.clientes 
      WHERE id = cliente_id AND user_id = auth.uid()
    )
  );

-- Tabela anamneses_podologia
DROP POLICY IF EXISTS "Anamneses podologia inserção própria" ON public.anamneses_podologia;
CREATE POLICY "Anamneses podologia inserção própria" ON public.anamneses_podologia 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.clientes 
      WHERE id = cliente_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anamneses podologia atualização própria" ON public.anamneses_podologia;
CREATE POLICY "Anamneses podologia atualização própria" ON public.anamneses_podologia 
  FOR UPDATE 
  USING (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.clientes 
      WHERE id = cliente_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.clientes 
      WHERE id = cliente_id AND user_id = auth.uid()
    )
  );

-- Tabela historico_servicos
DROP POLICY IF EXISTS "Histórico inserção própria" ON public.historico_servicos;
CREATE POLICY "Histórico inserção própria" ON public.historico_servicos 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.clientes 
      WHERE id = cliente_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Histórico atualização própria" ON public.historico_servicos;
CREATE POLICY "Histórico atualização própria" ON public.historico_servicos 
  FOR UPDATE 
  USING (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.clientes 
      WHERE id = cliente_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM public.clientes 
      WHERE id = cliente_id AND user_id = auth.uid()
    )
  );

-- 3. SEC-06: Corrigir a função do trigger notify_webhook_mutacao para suportar operação de DELETE (evitando erro com NEW = null)
CREATE OR REPLACE FUNCTION notify_webhook_mutacao()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  payload_data jsonb;
BEGIN
  -- Se for exclusão (DELETE), NEW é nulo. Usamos OLD para enviar os dados que foram removidos.
  IF (TG_OP = 'DELETE') THEN
    payload_data := row_to_json(OLD)::jsonb;
  ELSE
    payload_data := row_to_json(NEW)::jsonb;
  END IF;

  BEGIN
    PERFORM net.http_post(
      url     := current_setting('app.webhook_mutacao_url', true), -- true para não falhar se missing
      body    := payload_data::text,
      headers := '{"Content-Type":"application/json"}'::jsonb
    );
  EXCEPTION WHEN OTHERS THEN
    -- Ignorar erro caso current_setting não exista
  END;

  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;
