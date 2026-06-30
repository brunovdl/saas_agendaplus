# 🛡️ Auditoria de Segurança (Security-Auditor)

Esta é uma Skill especializada de segurança usada para auditar as regras de negócio e de banco de dados do **Agenda+ SaaS**.

## 🎯 Objetivos da Skill
* Validar a aplicação correta de políticas **Row Level Security (RLS)** em todas as tabelas do [[Supabase]].
* Garantir que nenhum dado de prestador vaze ou seja editado por outros usuários.
* Prevenir injeções de SQL e brechas de acesso nas Edge Functions.
* Auditar a segurança das rotas e sessões no Next.js (App Router).

## 🔒 Princípios de RLS no Projeto
Todas as consultas devem garantir filtros estritos de usuário (`user_id = auth.uid()`). A auditoria de segurança é ativada de forma preventiva a cada alteração de banco ou regras.

---

## 🔗 Relação no Grafo
* **[[Cerebro-IA]]**: Índice Central.
* **[[GEMINI.md]]**: Alinhamento de regras de código.
* **[[Supabase]]**: Alvo principal das validações de segurança e auditorias de RLS.

---
← Voltar para o [[Cerebro-IA]]
