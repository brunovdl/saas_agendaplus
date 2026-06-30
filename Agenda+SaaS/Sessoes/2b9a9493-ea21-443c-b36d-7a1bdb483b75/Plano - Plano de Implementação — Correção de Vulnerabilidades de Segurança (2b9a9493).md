# Plano de Implementação — Correção de Vulnerabilidades de Segurança

Este plano detalha a implementação das correções de segurança para os riscos identificados na auditoria anterior do **Agenda+ SaaS**.

## User Review Required

> [!IMPORTANT]
> As correções abrangem a criação de uma nova migration SQL no Supabase para segurança do banco de dados (RLS e triggers) e alterações de arquivos no app Next.js (autenticação de webhooks, proteção de Server Actions, ativação do Middleware global e mitigação de adulteração de parâmetros no Stripe).

---

## Proposed Changes

### 💾 Banco de Dados (Supabase)

#### [NEW] [20260624000001_security_fixes.sql](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/supabase/migrations/20260624000001_security_fixes.sql)
Criação de nova migration para aplicar correções de banco de dados:
- **SEC-01**: Habilitar RLS e forçar RLS na tabela `chat_history`.
- **SEC-05**: Ajustar políticas de RLS para inserção/atualização de `anamneses`, `anamneses_podologia` e `historico_servicos`, garantindo que o `cliente_id` pertença ao `user_id` autenticado (prevenindo tenant isolation bypass).
- **SEC-06**: Recriar o trigger `notify_webhook_mutacao` tratando operações de `DELETE` onde `NEW` é nulo, usando `OLD`.

---

### 💻 Aplicação Web (Next.js)

#### [MODIFY] [.env.local.example](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/.env.local.example)
- **SEC-03**: Remover a chave de API da Resend exposta hardcoded.

#### [NEW] [evolution.ts](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/lib/evolution.ts)
- **SEC-04**: Criar arquivo utilitário puro de servidor (sem `"use server"`) para hospedar a lógica interna de `configureInstanceHelper` e evitar que ela seja exposta como Server Action pública.

#### [MODIFY] [actions/evolution.ts](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/actions/evolution.ts)
- **SEC-04**: Importar `configureInstanceHelper` do novo arquivo utilitário e remover sua declaração/exportação local.

#### [MODIFY] [api/webhooks/evolution/route.ts](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/api/webhooks/evolution/route.ts)
- **SEC-02**: Adicionar autenticação via Header `Authorization: Bearer <WEBHOOK_SECRET>` para validar a chamada da Evolution API.
- **SEC-04**: Atualizar a importação de `configureInstanceHelper` para o novo caminho utilitário.

#### [NEW] [middleware.ts](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/middleware.ts)
- **SEC-07**: Criar o middleware oficial do Next.js redirecionando seu comportamento para a lógica já existente no handler.

#### [DELETE] [proxy.ts](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/proxy.ts)
- **SEC-07**: Remover o arquivo de proxy customizado obsoleto que não era reconhecido pelo Next.js.

#### [MODIFY] [actions/subscription.ts](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/actions/subscription.ts)
- **SEC-08**: Validar que o `priceId` recebido no checkout seja um preço de plano permitido (`STRIPE_PRICE_NORMAL_ID` ou `STRIPE_PRICE_COMPLETE_ID`).

---

## Verification Plan

### Automated Tests
- Execução de `npm run build` no app Next.js para garantir que as alterações no middleware, rotas de API e Server Actions compilem corretamente e sem erros de TypeScript.

### Manual Verification
- Verificar se a rota de webhook do WhatsApp rejeita requisições sem o token apropriado.
- Verificar se a aplicação Next.js inicia e redireciona rotas protegidas corretamente com o `middleware.ts` ativo.


---
← Voltar para [[Sessão - Plano de Implementação — Correção de Vulnerabilidades de Segurança (2b9a9493)]]