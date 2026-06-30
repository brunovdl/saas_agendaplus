# 💳 Stripe (Pagamentos & Assinaturas)

O **Stripe** é responsável pelo faturamento recorrente do SaaS, gerenciando o ciclo de vida das assinaturas dos prestadores de serviço.

## 💰 Regras de Assinatura
* **Período de Trial**: 14 dias grátis para novos usuários cadastrados.
* **Planos**: Integração com webhooks do Stripe para escutar eventos de criação, atualização e cancelamento de assinaturas.
* **Sincronização**: Os dados de faturamento do cliente são gravados em tempo real na tabela `prestadores` do [[Supabase]] (`stripe_customer_id`, `stripe_subscription_id`, `subscription_status`, `trial_ends_at`).

---

## 🔗 Relação no Grafo
* **[[Cerebro-IA]]**: Índice Central.
* **[[Supabase]]**: Armazenamento do status de faturamento e expiração do trial/assinatura.

---
← Voltar para o [[Cerebro-IA]]
