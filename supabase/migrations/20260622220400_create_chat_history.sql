-- Criar a tabela chat_history para armazenar o histórico de conversas do n8n
CREATE TABLE IF NOT EXISTS public.chat_history (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  message JSONB NOT NULL
);

-- Criar índice para otimizar buscas por ID de sessão (JID do WhatsApp)
CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON public.chat_history(session_id);
