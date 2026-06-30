# Regras de Frontend — Martins AI Automation (Agenda+ SaaS)

> [!IMPORTANT]
> **ATENÇÃO AGENTE:** Este documento contém as regras obrigatórias de design e desenvolvimento para o frontend do **Agenda+ SaaS**. Sempre que for implementar, modificar ou revisar elementos de interface (UI), você **DEVE** consultar e seguir estritamente as diretrizes abaixo para manter a consistência estética e técnica.

---

## 1. Stack Tecnológica e Padrões
- **Framework**: Next.js (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + CSS Vanilla (via [globals.css](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/globals.css))
- **Ícones**: Lucide React
- **Design System**: Baseado no [DESIGN.md](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/.agent/DESIGN.md) (agora centralizado na pasta `.agent/`)
- **Estilos Globais**: Qualquer estilo global ou customização de terceiros deve ser mantido no [globals.css](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/globals.css).

---

## 2. Cores e Tokens do Design System
A paleta de cores reflete inovação, automação e elegância técnica. **Nunca use cores genéricas** (ex: `bg-red-500`, `text-blue-600`). Use os tokens configurados no Tailwind:

### Cores Principais
- **`brand-navy`** (`#0D1B3E`): Fundo de menus, cabeçalhos e botões primários.
- **`brand-navy-light`** (`#152448`): Estado de *hover* do Navy Dark.
- **`brand-cyan`** (`#00D4FF`): Ações de Inteligência Artificial, automações e destaques tecnológicos.
- **`brand-cyan-dim`** (`#00A8CC`): Estado de *hover* do Cyan Neon.
- **`brand-blue`** (`#2563EB`): Foco ativo, links e bordas ativas em fundos claros.
- **`brand-blue-dark`** (`#1E4DB7`): Estado ativo profundo (*active*).
- **`brand-offwhite`** (`#F4F7FB` / `surface`): Fundo padrão da aplicação (minimiza fadiga visual).
- **`brand-white`** (`#FFFFFF` / `card`): Fundo de cards, modais e elementos elevados.

### Status de Agendamentos (Contraste Acessível)
Sempre utilize as seguintes combinações para chips de status:
- **Pendente**: Fundo `#FEF3C7` | Texto `#92400E` (Cor base `#F59E0B`)
- **Confirmado**: Fundo `#D1FAE5` | Texto `#065F46` (Cor base `#10B981`)
- **Cancelado**: Fundo `#FEE2E2` | Texto `#991B1B` (Cor base `#EF4444`)
- **Remarcado**: Fundo `#EDE9FE` | Texto `#4C1D95` (Cor base `#6366F1`)
- **Concluído**: Fundo `#E0F2FE` | Texto `#0369A1` (Cor base `#0284C7`)

---

## 3. Filosofia de Bordas e Arredondamento (Border Radius)
O design segue o princípio **"Soft-Geometric"** (formas modernas porém estruturadas).

> [!CAUTION]
> **Regra Crucial:** **NUNCA** utilize botões ou inputs no formato pílula (`rounded-full`), com exceção exclusiva de chips de status compactos ou tags específicas.

### Escala de Arredondamento Aplicável:
- `none` (`0px`): Sem arredondamento.
- `sm` (`2px`): Detalhes pequenos e cantos internos acoplados.
- `DEFAULT` (`4px`): Inputs e botões muito pequenos.
- `md` (`6px`): **Botões principais**, tags, alertas e chips de status.
- `lg` (`8px`): Cantos de modais, diálogos e cards de listagem comuns.
- `xl` (`12px`): Cards principais do painel de controle e grandes blocos da interface.
- `2xl` (`16px`): Seções complexas ou modais estruturais.

---

## 4. Tipografia
A família tipográfica padrão é **Inter**, otimizada para legibilidade de dados densos.
- **Suavização**: Sempre use as classes `-webkit-font-smoothing: antialiased` e `-moz-osx-font-smoothing: grayscale` (já aplicadas no `body` do `globals.css`).

### Escala de Fontes:
- **`text-display-hero`** (`48px` | Line-height `1.2` | Bold)
- **`text-headline-h1`** (`32px` | Line-height `1.3` | Bold)
- **`text-headline-h2`** (`24px` | Line-height `1.4` | Bold)
- **`text-body-main`** (`14.6px` | Line-height `1.5` | Regular)
- **`text-label-bold`** (`14px` | Line-height `1` | Bold)

---

## 5. Espaçamento e Grid (Escala Base 8px)
- **`stack-xs`** (`4px`): Entre labels e inputs.
- **`stack-sm`** (`8px`): Itens de listas pequenas.
- **`stack-md`** (`16px`): Margem interna padrão de cartões pequenos e botões.
- **`stack-lg`** (`24px`): Margem interna de cartões grandes.
- **`stack-xl`** (`48px`): Espaçamento entre seções grandes do dashboard.
- **`margin-mobile`** (`16px`): Margens laterais em smartphones.
- **`margin-desktop`** (`32px`): Margens laterais em telas desktop.
- **`gutter`** (`16px`): Espaço entre colunas.

### Grid Responsivo
Sempre utilize classes responsivas respeitando o sistema de colunas:
- **Mobile**: 4 colunas (`grid-cols-4`)
- **Tablet**: 8 colunas (`grid-cols-8`)
- **Desktop**: 12 colunas (`grid-cols-12`)

*Exemplo:* `className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-gutter"`

---

## 6. Sombras e Elevação (Evitar Bordas Rígidas)
Para manter o aspecto premium, utilize sombras suaves baseadas em azul escuro (Navy) com baixa opacidade em vez de bordas escuras.
- **`shadow-card`**: `0 4px 20px rgba(0, 0, 0, 0.08)` (Cards e modais).
- **`shadow-nav`**: `0 1px 3px rgba(13, 27, 62, 0.15)` (Barras de navegação/headers).
- **`shadow-focus`**: `0 0 0 2px rgba(0, 212, 255, 0.3)` (Anel de foco Cyan ao redor de elementos ativos).
- **`shadow-active`**: `0 0 0 1px #2563EB` (Indicação ativa em azul).

---

## 7. Componentes e Classes Globais (globals.css)
Sempre prefira as classes utilitárias CSS definidas globalmente em vez de escrever classes Tailwind repetitivas no próprio elemento:

1. **Botões**:
   - Primário: `className="btn-primary"` (Fundo Navy Dark, hover Navy Light).
   - Secundário / Outline Neutro: `className="btn-secondary"` (Borda cinza, texto cinza escuro, hover cinza claro, para ações neutras como "Cancelar").
   - Automação/AI: `className="btn-accent"` (Fundo Cyan Neon, texto Navy Dark, hover com sombra Cyan).
   - Outline: `className="btn-outline"` (Borda Blue Bright, texto Blue Bright, hover com opacidade).
   - Perigo Outline: `className="btn-outline-danger"` (Borda vermelha para ações destrutivas).
   
2. **Inputs**:
   - Input padrão: `className="input"` (Bordas cinza 6px radius, focus Blue Bright com anel de brilho).
   - Label padrão: `className="label"` (Font bold, 14px, margem inferior de 6px).
   - Mensagem de erro: `className="error-msg"` (Texto vermelho, 12px, para formulários).

3. **Cards**:
   - Card padrão: `className="card"` (Fundo branco, 12px radius, shadow-card).
   - Cabeçalho do Card: `className="card-header"` (Padding 16px 20px, borda inferior sutil).

4. **Chips de Status**:
   - Geral: `className="chip chip-[status]"` (ex: `chip-pendente`, `chip-confirmado`, `chip-cancelado`, `chip-remarcado`).

---

## 8. Integrações de Terceiros (FullCalendar)
Customizações visuais do calendário já estão configuradas no [globals.css](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/globals.css). Ao renderizar o FullCalendar:
- Envolva o componente com uma div que contenha a classe `.custom-calendar-wrapper`.
- Para telas mobile, envolva com a classe `.calendar-scroll-wrapper` para habilitar scroll horizontal na grade de semana sem esmagar as colunas.
- O botão "Hoje" deve manter o destaque Cyan Neon (`.fc-today-button`).

---

## 9. Regras de Acessibilidade e SEO
- **Hierarquia de Títulos**: Sempre use um único `<h1>` por página, seguido por uma estrutura lógica (`<h2>`, `<h3>`).
- **IDs Únicos**: Garanta que todos os elementos interativos (botões, inputs de formulário, links) tenham IDs descritivos exclusivos para permitir testes de automação eficientes.
- **Contraste**: Não altere os fundos dos chips de status ou botões padrão de forma a quebrar as diretrizes de contraste pré-testadas.


---
← Voltar para [[Cerebro-IA]]