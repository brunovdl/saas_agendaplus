# Regras de Backend — Martins AI Automation (Agenda+ SaaS)

> [!IMPORTANT]
> **ATENÇÃO AGENTE:** Este documento contém as regras obrigatórias de arquitetura e desenvolvimento para o backend do **Agenda+ SaaS**. Sempre que for implementar, modificar ou revisar lógica de servidor (Server Actions, Route Handlers, integrações, banco de dados), você **DEVE** consultar e seguir estritamente as diretrizes abaixo para manter consistência técnica e segurança.

---

## 1. Stack Tecnológica e Padrões

- **Runtime**: Next.js App Router (Node.js via Vercel / servidor local)
- **Linguagem**: TypeScript (strict mode)
- **Banco de Dados**: [Supabase](https://supabase.com) (PostgreSQL + RLS)
- **ORM / Query Builder**: SDK oficial `@supabase/supabase-js` (sem Prisma, sem Drizzle)
- **Autenticação**: Supabase Auth (JWT + cookies HttpOnly via `@supabase/ssr`)
- **Validação**: [Zod](https://zod.dev) — toda entrada de dados deve ser validada com schemas Zod
- **Pagamentos**: [Stripe](https://stripe.com) — SDK oficial `stripe`
- **Automação WhatsApp**: [Evolution API](https://doc.evolution-api.com) — chamadas REST internas
- **Types do Banco**: Sempre usar o arquivo gerado em [`src/types/supabase.ts`](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/types/supabase.ts). **Nunca tipar tabelas manualmente** com `any` para dados do Supabase.

---

## 2. Clientes Supabase — Qual Usar em Cada Contexto

> [!CAUTION]
> **Regra de Ouro:** Jamais utilize o `adminClient` em Client Components ou exponha a `SUPABASE_SERVICE_ROLE_KEY` em variáveis prefixadas com `NEXT_PUBLIC_`. Isso compromete toda a segurança RLS.

### 2.1 Client Components (browser)
Use o [`client.ts`](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/lib/supabase/client.ts):
```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
```
- Usa `anon_key`
- Todas as operações são limitadas pelas políticas **RLS** do usuário autenticado
- Adequado para leituras reativas em componentes do lado do cliente

### 2.2 Server Components, Server Actions e Route Handlers
Use o [`server.ts`](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/lib/supabase/server.ts) — **sempre `await`**:
```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
```
- Lê/escreve cookies da requisição atual via `next/headers`
- Usa `anon_key`, respeitando RLS por usuário autenticado
- **Padrão obrigatório** para toda lógica no servidor

### 2.3 Webhooks e Jobs de Manutenção
Use o [`admin.ts`](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/lib/supabase/admin.ts) — **bypass total de RLS**:
```typescript
import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();
```
- Usa `service_role_key` — **bypassa RLS completamente**
- **Restrito a**: Route Handlers de webhooks (Stripe, Evolution), Edge Functions, jobs de manutenção
- **NUNCA** use em Server Actions acionadas pelo usuário diretamente

---

## 3. Server Actions — Padrões Obrigatórios

Toda Server Action deve seguir esta estrutura:

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function minhaAction(/* dados */) {
  // 1. Autenticar o usuário
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { error: 'Não autenticado.' };
  }

  // 2. Validar entradas com Zod (nunca confiar no dado cru do cliente)
  const parsed = MeuSchema.safeParse(/* dados */);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  // 3. Executar operação no banco
  const { error } = await supabase.from('tabela').insert(parsed.data);
  if (error) {
    return { error: 'Mensagem amigável ao usuário.' };
  }

  // 4. Revalidar cache da rota afetada
  revalidatePath('/rota-afetada');
  return { success: true };
}
```

### Regras de Server Actions:
- **Sempre** começar com `'use server'`
- **Sempre** autenticar antes de qualquer operação no banco
- **Sempre** retornar `{ error: string }` em falhas — nunca lançar exceções não tratadas para o cliente
- **Sempre** chamar `revalidatePath()` após mutações que afetam dados exibidos em tela
- **Nunca** retornar dados sensíveis (tokens, chaves, dados de outros usuários)
- **Nunca** confiar em `userId` vindo do cliente — sempre buscar via `supabase.auth.getUser()`

---

## 4. Route Handlers (API Routes)

Route Handlers ficam em `src/app/api/**`. São usados exclusivamente para:
- **Webhooks externos** (Stripe, Evolution API) — recebem POST de terceiros
- **Endpoints que precisam de resposta HTTP bruta** (streaming, headers customizados)

### Padrão para Webhook:
```typescript
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  // 1. Validar assinatura/segredo do webhook
  const signature = req.headers.get('x-signature');
  if (!signature || !validarAssinatura(signature)) {
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 400 });
  }

  // 2. Usar adminClient — webhooks operam fora da sessão do usuário
  const supabase = createAdminClient();

  // 3. Processar evento
  // ...

  return NextResponse.json({ received: true });
}
```

### Webhooks Ativos:
| Rota | Propósito |
|---|---|
| [`/api/webhooks/stripe`](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/api/webhooks/stripe/route.ts) | Sincroniza eventos de assinatura (criação, atualização, cancelamento, falha de pagamento) |
| `/api/webhooks/evolution` | Recebe mensagens do WhatsApp via Evolution API |

---

## 5. Proteção de Rotas (Proxy / Middleware)

O arquivo [`src/proxy.ts`](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/proxy.ts) é o **proxy do Next.js** (equivalente ao `middleware.ts`). Ele:

1. Atualiza tokens de sessão expirados automaticamente (refresh via cookies)
2. Redireciona usuários **não autenticados** para `/login`
3. Redireciona usuários **autenticados** para `/agenda` se tentarem acessar `/login` ou `/cadastro`

### Rotas Públicas Configuradas:
```typescript
const publicRoutes = ['/', '/login', '/cadastro', '/auth/callback'];
```

> [!WARNING]
> Ao adicionar uma **nova rota pública** (landing page, página de preços, etc.), adicione-a explicitamente no array `publicRoutes` em `proxy.ts`. Esquecer isso redireciona usuários não logados para `/login` em rotas que deveriam ser acessíveis.

---

## 6. Validação com Zod — Schemas Existentes

Todos os schemas ficam em `src/lib/validations/`. **Reutilize os schemas existentes** antes de criar novos.

| Arquivo | Schemas Exportados | Uso |
|---|---|---|
| [`agendamento.ts`](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/lib/validations/agendamento.ts) | `BaseAgendamentoSchema`, `AgendamentoSchema`, `FormAgendamentoSchema`, `AgendamentoUpdateSchema`, `AgendamentoFiltrosSchema` | Criação, edição e filtros de agendamentos |
| [`cliente.ts`](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/lib/validations/cliente.ts) | `ClienteSchema`, `AnamneseSchema`, `AnamnesePodologiaSchema`, `HistoricoServicoSchema` | Dados de clientes, anamnese e histórico |
| [`auth.ts`](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/lib/validations/auth.ts) | `LoginSchema`, `CadastroSchema` | Login e cadastro de prestadores |

### Padrão de Validação em Actions:
```typescript
import { AgendamentoSchema } from '@/lib/validations/agendamento';

const parsed = AgendamentoSchema.safeParse(dadosCrus);
if (!parsed.success) {
  return { error: parsed.error.errors[0].message };
}
// Usar parsed.data — tipado e validado
```

### Telefones — Formato E.164:
Todos os telefones **devem ser armazenados em formato E.164** (`+5511999999999`). Os schemas de validação já aplicam a transformação automaticamente. **Nunca salve telefones sem o prefixo `+` e código do país.**

---

## 7. Integração Stripe

O cliente Stripe fica em [`src/lib/stripe.ts`](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/lib/stripe.ts).

### Variáveis de Ambiente Necessárias:
| Variável | Uso |
|---|---|
| `STRIPE_SECRET_KEY` | Autenticação do SDK Stripe (servidor) |
| `STRIPE_WEBHOOK_SECRET` | Validação de assinatura dos webhooks |
| `STRIPE_PRICE_NORMAL_ID` | Price ID do plano Normal |
| `STRIPE_PRICE_COMPLETE_ID` | Price ID do plano Complete |

### Fluxo de Assinatura:
1. **Checkout** → `createCheckoutSessionAction()` em [`actions/subscription.ts`](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/actions/subscription.ts)
2. **Confirmação** → Webhook `checkout.session.completed` atualiza `stripe_subscription_id` no banco
3. **Mudanças de Status** → Webhooks `customer.subscription.*` sincronizam `subscription_status` e `subscription_tier`
4. **Falha de Pagamento** → Webhook `invoice.payment_failed` define status como `past_due`

### Tiers de Assinatura (`subscription_tier`):
| Valor | Descrição |
|---|---|
| `free_trial` | Período de avaliação / sem assinatura |
| `normal` | Plano Normal |
| `complete` | Plano Complete |

> [!WARNING]
> O Webhook Stripe **deve usar `createAdminClient()`** pois opera fora da sessão do usuário. Nunca use `createClient()` (server) em Route Handlers de webhook — não há cookies de sessão disponíveis.

---

## 8. Integração Evolution API (WhatsApp)

A Evolution API é o gateway de mensagens WhatsApp. Todas as chamadas são feitas via `fetch` em Server Actions em [`actions/evolution.ts`](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/actions/evolution.ts).

### Variáveis de Ambiente Necessárias:
| Variável | Uso |
|---|---|
| `EVOLUTION_API_URL` | URL base da Evolution API (ex: `https://api.meudominio.com`) |
| `EVOLUTION_API_KEY` | Chave de autenticação global da API |
| `EVOLUTION_WEBHOOK_URL` | URL que a Evolution API usa para enviar eventos de mensagens recebidas |

### Nome de Instância:
Cada prestador tem uma instância WhatsApp com nome único gerado por `getCleanInstanceName(userId, nomeNegocio)`:
- Formato: `{nome_negocio_sanitizado}_{8_primeiros_chars_userId}`
- Armazenado na coluna `whatsapp_instance_name` da tabela `prestadores`
- **Reutilize sempre o nome salvo no banco** — nunca gere um novo se já existir

### Actions Disponíveis:
| Action | Propósito |
|---|---|
| `connectWhatsAppAction()` | Cria instância e retorna QR Code em base64 |
| `checkWhatsAppConnectionAction()` | Verifica estado da conexão e atualiza banco |
| `disconnectWhatsAppAction()` | Deleta instância e limpa dados no banco |
| `configureInstanceHelper(instanceName)` | Configura settings e webhook na instância |

### Estados de Conexão (`whatsapp_status`):
- `disconnected` → Não conectado
- `connecting` → Aguardando escaneamento do QR Code
- `connected` → WhatsApp ativo

---

## 9. Convenções de Banco de Dados (Supabase)

### Tabelas Principais:
| Tabela | Descrição |
|---|---|
| `prestadores` | Dados do profissional (usuário do sistema) |
| `clientes` | Clientes de cada prestador (com isolamento por RLS) |
| `agendamentos` | Agendamentos vinculados a prestador e cliente |
| `servicos` | Catálogo de serviços do prestador |
| `anamneses` | Fichas de anamnese dos clientes |
| `historico_servicos` | Histórico de serviços realizados por cliente |

### RLS (Row Level Security):
- **Todas as tabelas têm RLS ativado** por padrão
- A política padrão é: **o prestador só acessa seus próprios dados** (`prestador_id = auth.uid()`)
- Ao criar uma nova tabela, sempre adicione a política RLS correspondente via migration SQL

### Convenções de Nomenclatura:
- **Tabelas**: `snake_case` plural (ex: `agendamentos`, `prestadores`)
- **Colunas**: `snake_case` (ex: `data_hora_inicio`, `stripe_customer_id`)
- **PKs**: `id UUID DEFAULT gen_random_uuid()`
- **Timestamps**: `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`
- **FKs**: `{entidade}_id` (ex: `prestador_id`, `cliente_id`)

### Status de Agendamentos:
Os únicos valores válidos para `status` são (definidos no Zod Schema e no CHECK do PostgreSQL):
```
'pendente' | 'confirmado' | 'cancelado' | 'remarcado' | 'concluido'
```

> [!CAUTION]
> **Nunca adicione um novo status sem atualizar**: o schema Zod em `agendamento.ts`, o tipo TypeScript em `supabase.ts` e a CHECK constraint do PostgreSQL. Os três devem estar sincronizados.

---

## 10. Variáveis de Ambiente — Referência Completa

| Variável | Visibilidade | Obrigatória | Propósito |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | ✅ | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública | ✅ | Chave anônima Supabase (respeita RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Privada** | ✅ | Chave admin Supabase (bypass RLS) |
| `STRIPE_SECRET_KEY` | **Privada** | ✅ | SDK Stripe no servidor |
| `STRIPE_WEBHOOK_SECRET` | **Privada** | ✅ | Validação de assinatura do webhook Stripe |
| `STRIPE_PRICE_NORMAL_ID` | **Privada** | ✅ | Price ID do plano Normal |
| `STRIPE_PRICE_COMPLETE_ID` | **Privada** | ✅ | Price ID do plano Complete |
| `EVOLUTION_API_URL` | **Privada** | ✅ | URL base da Evolution API |
| `EVOLUTION_API_KEY` | **Privada** | ✅ | Chave global da Evolution API |
| `EVOLUTION_WEBHOOK_URL` | **Privada** | ⚡ Opcional | URL do webhook para receber mensagens |
| `NEXTAUTH_URL` | **Privada** | ⚡ Produção | URL base da aplicação (usado nas URLs de redirect do Stripe) |

> [!WARNING]
> **Nunca prefixe com `NEXT_PUBLIC_`** variáveis que contenham segredos (`SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `EVOLUTION_API_KEY`). Isso as expõe no bundle do cliente e representa uma vulnerabilidade crítica de segurança.

---

## 11. Tratamento de Erros — Padrão do Projeto

### Server Actions:
- Sempre retornar `{ error: string }` para falhas — nunca `throw` sem capturar
- Mensagens de erro devem ser amigáveis ao usuário (em português)
- Logar erros técnicos no console com prefixo descritivo: `[NomeDoContexto] mensagem`

```typescript
// ✅ Correto
} catch (err: any) {
  console.error('[Stripe Checkout Error]', err);
  return { error: `Falha ao criar sessão de pagamento: ${err.message}` };
}

// ❌ Errado — nunca faça isso
} catch (err) {
  throw err;
}
```

### Route Handlers:
- Sempre retornar `NextResponse.json({ error: ... }, { status: 4xx | 5xx })` para falhas
- Nunca expor stack traces ou detalhes internos na resposta HTTP
- Sempre retornar `{ received: true }` com `status: 200` para webhooks bem processados

---

## 12. Checklist antes de Implementar Qualquer Feature Backend

- [ ] Qual cliente Supabase usar? (`client`, `server` ou `admin`)
- [ ] A operação precisa de autenticação? → Verificar `supabase.auth.getUser()`
- [ ] Os dados de entrada foram validados com Zod?
- [ ] A RLS protege os dados corretamente? (testar com usuário diferente)
- [ ] Chamei `revalidatePath()` após mutações?
- [ ] As variáveis de ambiente necessárias existem no `.env.local`?
- [ ] Erros são tratados e retornados de forma amigável?
- [ ] Dados sensíveis não estão sendo retornados ao cliente?


---
← Voltar para [[Cerebro-IA]]