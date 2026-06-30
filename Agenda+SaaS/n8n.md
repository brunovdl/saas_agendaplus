# 🔌 n8n (Automações & WhatsApp)

O **n8n** é o motor de automação que conecta o **Agenda+ SaaS** com canais de comunicação em tempo real, focando no WhatsApp dos clientes finais.

## 🤖 Módulos e Integrações
* **Assistente Virtual**: Configurado no front-end do prestador (salvo no [[Supabase]]), o n8n consome esses dados para simular o comportamento do assistente.
* **Evolution API (WhatsApp)**: Envio e recebimento de mensagens automáticas de confirmação de agendamentos, remarcações e cancelamentos.
* **Webhooks**: Escuta eventos de banco de dados do [[Supabase]] para disparar fluxos automáticos.

---

## 🔗 Relação no Grafo
* **[[Cerebro-IA]]**: Índice Central.
* **[[Supabase]]**: Fonte das regras de agendamento e chaves de configuração do assistente.
* **[[Resend]]**: Disparo de relatórios e alertas por email a partir de fluxos de automação.

---
← Voltar para o [[Cerebro-IA]]
