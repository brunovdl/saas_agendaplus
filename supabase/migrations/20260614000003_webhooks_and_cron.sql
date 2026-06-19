CREATE EXTENSION IF NOT EXISTS pg_net;

-- Trigger para mutações usando pg_net
CREATE OR REPLACE FUNCTION notify_webhook_mutacao()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Em ambiente local a configuração app.webhook_mutacao_url pode não existir,
  -- mas o trigger tenta enviar caso exista.
  BEGIN
    PERFORM net.http_post(
      url     := current_setting('app.webhook_mutacao_url', true), -- true para não falhar se missing
      body    := row_to_json(NEW)::text,
      headers := '{"Content-Type":"application/json"}'::jsonb
    );
  EXCEPTION WHEN OTHERS THEN
    -- Ignorar erro caso current_setting não exista
  END;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_mutacao
  AFTER INSERT OR UPDATE OR DELETE ON public.agendamentos
  FOR EACH ROW EXECUTE FUNCTION notify_webhook_mutacao();

-- Job pg_cron para lembretes
-- Executa a cada 15 minutos chamando a Edge Function de lembrete
SELECT cron.schedule(
  'job-lembrete-15min', '*/15 * * * *',
  $$ SELECT net.http_post(
    url     := 'https://frauytuzqpubsbijbjrt.supabase.co/functions/v1/lembrete-agendamentos',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key', true))
  ); $$
);
