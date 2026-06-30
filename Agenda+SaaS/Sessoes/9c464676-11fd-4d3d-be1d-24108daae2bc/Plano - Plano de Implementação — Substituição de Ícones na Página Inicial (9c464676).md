# Plano de Implementação — Substituição de Ícones na Página Inicial

Substituir todos os emojis de funcionalidades e SVGs de soluções na landing page principal por componentes SVG customizados inline, desenhados para a marca, organizados em um arquivo centralizado de acordo com o design system da Martins AI Automation.

## Decisões de Design (Grill-me)

- **Escopo:** Substituição de todos os 6 emojis da seção "Funcionalidades" (Features) e dos 3 SVGs genéricos da seção "Soluções" por ícones SVG sob medida.
- **Organização:** Criação de um novo arquivo centralizado [CustomIcons.tsx](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/components/ui/CustomIcons.tsx) para exportar os componentes React dos ícones.
- **Aparência Visual:** Estilo "Soft-Geometric" com cantos ligeiramente arredondados (`stroke-linecap="round"`, `stroke-linejoin="round"`, `rx="X"`), espessura de traço consistente e gradientes dinâmicos usando as cores da marca (`brand-cyan`: `#00D4FF` e `brand-blue`: `#2563EB`).

---

## Proposta de Alterações

### Agenda+ App UI Components

#### [NEW] [CustomIcons.tsx](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/components/ui/CustomIcons.tsx)
Criação do arquivo que abrigará os 9 ícones customizados como componentes React, com suporte a customização de tamanho (`size`) e classes CSS.
- **Ícones de Funcionalidades (Features):**
  1. `RealTimeCalendarIcon` (Substitui 📅): Calendário isométrico/plano moderno com setas circulares de sincronização em tempo real.
  2. `AutomationN8nIcon` (Substitui 🤖): Fluxo de nós interconectados com engrenagem ou faísca de IA, simulando automação n8n.
  3. `PerformanceAnalyticsIcon` (Substitui 📊): Gráfico de barras Soft-Geometric com gradiente ascendente e uma linha de tendência fluida.
  4. `SecurityLgpdIcon` (Substitui 🔒): Escudo tecnológico de segurança com linhas de grade de dados e cadeado suave.
  5. `WebhooksIcon` (Substitui ⚡): Raio neon dinâmico envolto em um símbolo de transmissão de dados/api.
  6. `ResponsiveMobileIcon` (Substitui 📱): Dispositivo móvel integrado a uma tela de fundo simulada com elementos flexíveis.
- **Ícones de Soluções (Solutions):**
  1. `NoShowsReductionIcon` (Substitui Relógio antigo): Relógio tecnológico com balão de chat (WhatsApp) e check de confirmação.
  2. `AiAssistant247Icon` (Substitui Lâmpada antiga): Chatbot/Assistente virtual representado por uma lâmpada integrada a faíscas de IA (`✦`) e ondas de conversa.
  3. `ProviderTimeOptimizationIcon` (Substitui Calendário antigo): Calendário de blocos/slots otimizados geometricamente com setas de maximização de tempo.

#### [MODIFY] [page.tsx](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/page.tsx)
- Importação de cada ícone customizado de `@/components/ui/CustomIcons`.
- Substituição dos emojis em `Funcionalidades` (`features` array ou mapeamento).
- Substituição dos SVGs na seção `Soluções` (`solucoes` array).
- Ajuste das propriedades de tamanho, cor e margens nos wrappers dos novos ícones para obter uma estética equilibrada e premium.

---

## Plano de Verificação

### Verificação Manual
1. **Inspeção Visual da Página Inicial:**
   - Garantir que todos os 9 novos ícones renderizam perfeitamente sem quebras de layout.
   - Verificar se as cores (gradientes Navy, Cyan, Blue) estão harmônicas com o fundo escuro da Hero e fundo claro das Features/Soluções.
   - Testar a responsividade e o comportamento dos ícones em telas desktop, tablet e mobile.
2. **Build Local:**
   - Executar `npm run build` na aplicação para verificar se o TypeScript compila sem erros nos novos componentes de ícone e na importação deles.


---
← Voltar para [[Sessão - Plano de Implementação — Substituição de Ícones na Página Inicial (9c464676)]]