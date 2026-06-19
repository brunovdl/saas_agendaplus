-- Adicionar colunas de integração do WhatsApp na tabela prestadores
ALTER TABLE public.prestadores 
  ADD COLUMN IF NOT EXISTS whatsapp_status TEXT DEFAULT 'disconnected' CHECK (whatsapp_status IN ('disconnected', 'connecting', 'connected')),
  ADD COLUMN IF NOT EXISTS whatsapp_numero TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_instance_name TEXT;
