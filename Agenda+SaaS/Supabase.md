# ⚡ Supabase (Integração)

O **Supabase** é a espinha dorsal de dados e autenticação do **Agenda+ SaaS**. Todas as operações de agendamentos, prestadores e configurações dependem diretamente desta integração.

## 🗄️ Tabelas Principais (Single Source of Truth)
* **`prestadores`**: Dados cadastrais do negócio, nicho (`saude_estetica` ou `servicos_manutencao`), tokens do assistente virtual, assinatura Stripe e período de trial.
* **`agendamentos`**: Agendamentos feitos por clientes. Conecta com a tabela `clientes`.
* **`clientes`**: Dados de contato dos clientes que agendam serviços.

## 🛡️ Políticas de RLS
A segurança das tabelas é auditada pela skill de [[Security-Auditor]]. Toda tabela deve possuir RLS ativa baseada no `user_id` do prestador autenticado.

---

## 🔗 Relação no Grafo
* **[[Cerebro-IA]]**: Índice Central.
* **[[Security-Auditor]]**: Auditoria e validação de segurança nas tabelas.
* **[[n8n]]**: Workflows externos que escutam inserções/atualizações de agendamentos via Supabase Webhooks.
* **[[Stripe]]**: Sincronização de dados de assinatura para atualizar o status do prestador.

---
← Voltar para o [[Cerebro-IA]]
