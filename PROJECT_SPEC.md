# Especificação Técnica: SaaS de Agendamento com IA

## 1. Visão Geral do Projeto
Sistema SaaS para gestão de agendamentos. O sistema fornece uma interface web para os prestadores de serviço gerenciarem suas agendas e expõe uma arquitetura baseada em eventos (Webhooks) para integração com fluxos externos de automação no n8n, que ficarão responsáveis pela comunicação com o cliente final via WhatsApp.

## 2. Stack Tecnológica
* **Front-end:** React, Next.js, Tailwind CSS.
* **Back-end & Banco de Dados:** Supabase (PostgreSQL, Auth, Edge Functions, Realtime).
* **Linguagem Oficial:** TypeScript (Tipagem estrita obrigatória).
* **Design System:** Seguir as diretrizes da "Martins AI Automation" (variáveis CSS definidas no tailwind.config.js).

## 3. Regras de Arquitetura e Código
* **Single Source of Truth:** O banco de dados (Supabase) é a fonte da verdade. O estado do front-end deve sempre refletir o banco.
* **Tipagem:** Nenhum tipo `any` é permitido. Todas as respostas do Supabase devem ser tipadas usando as interfaces geradas no arquivo `types/supabase.ts`.
* **Segurança (RLS):** Todas as tabelas no Supabase devem ter Row Level Security (RLS) ativadas. Um usuário (prestador) só pode ler, inserir, atualizar e deletar registros vinculados ao seu próprio `user_id`.
* **Componentização:** Componentes React devem ser pequenos, focados em uma única responsabilidade e preferencialmente Server Components onde a interatividade no cliente (Client Components com `"use client"`) não for estritamente necessária.

## 4. Modelagem de Dados Principal
Tabela `agendamentos`:
* `id` (UUID, Primary Key)
* `user_id` (UUID, Foreign Key para auth.users)
* `cliente_nome` (String)
* `cliente_telefone` (String - Formato internacional WhatsApp)
* `data_hora_inicio` (Timestamptz)
* `data_hora_fim` (Timestamptz)
* `status` (Enum: 'pendente', 'confirmado', 'cancelado', 'remarcado')

## 5. Integrações e Webhooks (Fluxo n8n)
O sistema não envia mensagens diretamente. Ele emite eventos para o n8n.
* **Eventos de Mutação:** Qualquer criação, edição ou cancelamento de agendamento via UI deve atualizar o Supabase. O Supabase (via Trigger ou Edge Function) disparará um Webhook para a automação.
* **Job de Confirmação (1 Hora de Antecedência):** Existe uma rotina (Edge Function via pg_cron) que roda a cada 15 minutos buscando agendamentos confirmados que ocorrerão na próxima 1 hora. O sistema dispara um Webhook específico contendo os dados do cliente para que o n8n envie o lembrete.

## 6. Instruções para o Assistente de IA (Antigravity)
* **Sempre** consulte este arquivo antes de criar novos arquivos ou alterar a lógica de banco de dados.
* Se for solicitado o desenvolvimento de uma nova feature, valide se ela não quebra a regra de isolamento do WhatsApp (o sistema apenas emite webhooks, não envia mensagens nativas).
* Mantenha o código limpo, documentado e focado em modularidade.