# Plano de Implementação - Atualização de Planos na Landing Page

Este plano descreve as etapas para atualizar a seção de Preços da Landing Page pública (`src/app/page.tsx`), substituindo o modelo de plano único de faturamento pela exibição dos dois novos planos de assinatura (Normal e Completo).

## User Review Required

> [!NOTE]
> Os botões de chamada para ação (CTA) de ambos os planos redirecionarão os visitantes públicos para a página de `/cadastro`, onde eles iniciarão o período de trial de 14 dias.

---

## Proposta de Alterações

### 🛠️ Modificação de Código

#### [MODIFY] [page.tsx](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/page.tsx)
Substituir o bloco HTML/React da seção de faturamento (linhas 520 a 616) para exibir o grid responsivo contendo os dois novos planos:

1. **Título da Seção**: De "Um único plano com tudo incluído" para "Escolha o plano ideal para o seu negócio".
2. **Card do Plano Normal (R$ 39,90/mês)**:
   - Estilo com bordas sutis e fundo glassmorphism.
   - Recursos: Agenda visual, controle de clientes, métricas, suporte básico.
3. **Card do Plano Completo (R$ 79,90/mês - Destaque)**:
   - Destaque com borda ciano e badge de "POPULAR".
   - Recursos: Tudo do Normal + Assistente de IA no WhatsApp, agendamentos 24/7 e QR Code do WhatsApp.

---

## Plano de Verificação

### Testes Manuais
1. Aplicar a substituição do bloco de preços em `src/app/page.tsx`.
2. Rodar a compilação do TypeScript (`npx tsc --noEmit`) para atestar a validade sintática do arquivo.
3. Validar visualmente a renderização da Landing Page e do grid na seção de preços.


---
← Voltar para [[Sessão - Plano de Implementação - Atualização de Planos na Landing Page (144fa157)]]