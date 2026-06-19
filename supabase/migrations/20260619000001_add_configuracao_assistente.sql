-- Adicionar coluna configuracao_assistente do tipo JSONB na tabela prestadores
ALTER TABLE public.prestadores
ADD COLUMN IF NOT EXISTS configuracao_assistente JSONB DEFAULT '{
  "horario_funcionamento": {
    "segunda": {"inicio": "09:00", "fim": "18:00", "ativo": true},
    "terca": {"inicio": "09:00", "fim": "18:00", "ativo": true},
    "quarta": {"inicio": "09:00", "fim": "18:00", "ativo": true},
    "quinta": {"inicio": "09:00", "fim": "18:00", "ativo": true},
    "sexta": {"inicio": "09:00", "fim": "18:00", "ativo": true},
    "sabado": {"inicio": "09:00", "fim": "14:00", "ativo": false},
    "domingo": {"inicio": "09:00", "fim": "14:00", "ativo": false}
  },
  "servicos": [],
  "nome_assistente": "Assistente Virtual",
  "tom_voz": "profissional"
}'::jsonb;
