# Plano de Implementação — Expansão da Landing Page (Agenda+ SaaS)

Este plano descreve o desenvolvimento e integração das seções **Soluções**, **Preços** e **Sobre** no arquivo da página inicial (`src/app/page.tsx`), completando a proposta de valor do SaaS.

## Detalhes Alinhados no Grill-me

- **Soluções**: Foco nas dores operacionais (Redução de Faltas com lembretes automáticos, Atendimento 24/7 via IA, e Otimização de tempo do prestador).
- **Preços**: Plano Único: Pro por R$ 79/mês com todas as funcionalidades liberadas e teste grátis de 14 dias.
- **Sobre**: Foco na missão do produto Agenda+ em transformar a rotina dos prestadores de serviços com tecnologia invisível.

---

## Proposta de Alterações

### [MODIFY] [page.tsx](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/page.tsx)

Adicionaremos as seções de Soluções, Preços e Sobre diretamente no JSX da página inicial, inseridas entre a seção de **Features** e a seção de **CTA Final**.

#### 1. Seção: Soluções (`#solucoes`)
- Estilo: Grid de 3 colunas em fundo claro (`#F4F7FB`) para contraste visual.
- Detalhamento dos pilares de solução:
  - **Redução de Faltas (No-Shows)**: Lembretes automáticos via WhatsApp enviados 1h antes do horário.
  - **Atendimento 24/7 com IA**: Assistente que responde clientes e reserva horários direto na agenda de forma autônoma.
  - **Gestão de Tempo Eficiente**: Calendário interativo visual com atualizações em tempo real (Supabase Realtime).

#### 2. Seção: Preços (`#precos`)
- Estilo: Fundo escuro profundo (`#0D1B3E`) com layout centralizado em um card de destaque do **Plano Pro**.
- Conteúdo do card:
  - Preço: **R$ 79 / mês**
  - Recursos incluídos:
    - Agendamentos ilimitados.
    - Integração de Webhooks com n8n (WhatsApp).
    - Calendário interativo real-time.
    - Suporte prioritário.
    - Teste grátis por 14 dias (sem cartão).
  - Botão de CTA apontando para a rota `/cadastro`.

#### 3. Seção: Sobre (`#sobre`)
- Estilo: Layout moderno Off-White (`#F4F7FB`) bipartido:
  - **Lado esquerdo**: O manifesto do produto Agenda+ com foco na tecnologia invisível e na liberdade do prestador de focar no seu trabalho de excelência.
  - **Lado direito**: Indicadores numéricos simulados ou ilustrações geométricas (ex: "99.9% uptime", "Redução de até 85% de faltas").

---

## Plano de Verificação

### Compilação e Build
- Executar `npm run build` para testar integridade de arquivos e TypeScript.

### Verificação Manual
- Validar no navegador que a navegação âncora do menu do cabeçalho direciona corretamente para `#features`, `#solucoes`, `#precos` e `#sobre`.
- Verificar a responsividade mobile das novas seções.


---
← Voltar para [[Sessão - Plano de Implementação — Expansão da Landing Page (Agenda+ SaaS) (6b0fea5d)]]