# Design System — Martins AI Automation (Agenda+ SaaS)

Este documento descreve as diretrizes visuais e o sistema de design implementado no **Agenda+ SaaS**, baseado no *Brand Book da Martins AI Automation*. As definições abaixo estão consolidadas no arquivo de configuração do [tailwind.config.js](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/tailwind.config.js) e no estilo global do [globals.css](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/globals.css).

---

## 1. Paleta de Cores

A paleta de cores foi projetada para transmitir inovação, confiabilidade e foco em automação tecnológica. Ela é composta por cores principais, cores semânticas de status e tokens de superfícies.

### Cores Principais

| Nome do Token | Valor Hex | Função e Aplicação | Exemplo de Uso |
| :--- | :--- | :--- | :--- |
| **Navy Dark** (`brand-navy`) | `#0D1B3E` | Fundo de navegação lateral, cabeçalhos de tabelas e botões primários. | Sidebar, botões principais |
| **Navy Light** (`brand-navy-light`) | `#152448` | Estado de *hover* sobre elementos Navy Dark e áreas de destaque secundárias. | Hover de botões primários |
| **Cyan Neon** (`brand-cyan`) | `#00D4FF` | Ações relacionadas a Inteligência Artificial, automação e destaques tecnológicos. | Botões de IA/Automação |
| **Cyan Dim** (`brand-cyan-dim`) | `#00A8CC` | Variação mais escura do Cyan Neon para *hover* e legibilidade do texto. | Hover do botão de automação |
| **Blue Bright** (`brand-blue`) | `#2563EB` | Foco de navegação, links e botões *outline* em superfícies claras. | Borda de inputs ativos, links |
| **Blue Dark** (`brand-blue-dark`) | `#1E4DB7` | Estado ativo (*active*) de interações e botões baseados em azul. | Estado de foco profundo |
| **Off White** (`brand-offwhite` / `surface`) | `#F4F7FB` | Background principal da aplicação. Minimiza fadiga visual. | Fundo da tela de dashboard |
| **White** (`brand-white` / `card`) | `#FFFFFF` | Fundo de superfícies elevadas e recipientes de informações. | Cards de agendamentos, modais |

### Cores Semânticas (Status de Agendamentos)

Os status de agendamentos possuem representações visuais com contraste de acessibilidade testado (fundo claro com texto escuro correspondente).

| Status | Cor Base | Background do Chip | Texto do Chip |
| :--- | :--- | :--- | :--- |
| **Pendente** | `#F59E0B` | `#FEF3C7` | `#92400E` |
| **Confirmado** | `#10B981` | `#D1FAE5` | `#065F46` |
| **Cancelado** | `#EF4444` | `#FEE2E2` | `#991B1B` |
| **Remarcado** | `#6366F1` | `#EDE9FE` | `#4C1D95` |

---

## 2. Tipografia

A tipografia do projeto utiliza a família **Inter**, focando na legibilidade de dados densos e telas de gestão.

- **Fonte Principal:** `Inter, system-ui, sans-serif`
- **Suavização:** `-webkit-font-smoothing: antialiased` habilitado para melhor renderização de textos finos.

### Escala de Fontes

- **`display-hero`**: `48px` | Line-height: `1.2` | Letter-spacing: `-0.02em` | Peso: `700` (Bold)
- **`headline-h1`**: `32px` | Line-height: `1.3` | Peso: `700` (Bold)
- **`headline-h2`**: `24px` | Line-height: `1.4` | Peso: `700` (Bold)
- **`body-main`**: `14.6px` | Line-height: `1.5` | Peso: `400` (Regular)
- **`label-bold`**: `14px` | Line-height: `1` | Peso: `700` (Bold)

---

## 3. Filosofia de Bordas e Arredondamento (Border Radius)

O Brand Book estabelece a regra **"Soft-Geometric"**. As bordas são ligeiramente arredondadas, gerando um visual moderno mas estruturado. 
> [!IMPORTANT]
> **Nunca** utilize botões em formato de pílula (*pill-shaped* ou `rounded-full`), exceto exclusivamente em chips de status e tags circulares compactas.

### Escala de Arredondamento

- **`none` (0px)**: Sem arredondamento.
- **`sm` (2px)**: Detalhes pequenos, cantos internos acoplados.
- **`DEFAULT` (4px)**: Campos de entrada (*inputs*) e botões pequenos.
- **`md` (6px)**: Botões principais da aplicação, tags, alertas de mensagens e chips de status.
- **`lg` (8px)**: Cantos de modais, diálogos e cards de listagem comuns.
- **`xl` (12px)**: Cards principais do painel de controle e grandes blocos da interface.
- **`2xl` (16px)**: Grandes seções ou modais estruturais complexos.
- **`full` (9999px)**: Utilizado estritamente para chips de status ovais.

---

## 4. Sombras e Elevação (Box Shadows)

Para evitar bordas pretas rígidas e manter a interface com aspecto premium e "leveza", o design system utiliza sombras suaves baseadas em tons de azul escuro (Navy) com baixa opacidade.

- **`shadow-card`**: `0 4px 20px rgba(0, 0, 0, 0.08)` (Sombra suave de elevação para cards e modais).
- **`shadow-nav`**: `0 1px 3px rgba(13, 27, 62, 0.15)` (Usado para cabeçalhos e barras de navegação).
- **`shadow-focus`**: `0 0 0 2px rgba(0, 212, 255, 0.3)` (Anel de foco ao redor de elementos interativos usando Cyan).
- **`shadow-active`**: `0 0 0 1px #2563EB` (Indicação de estado ativo ou focado usando Blue Bright).

---

## 5. Espaçamento e Grid (8px Rhythmic Scale)

O layout segue o ritmo clássico de grade base 8px, garantindo proporcionalidade e harmonia vertical.

- **`stack-xs` (4px)**: Espaçamento interno muito curto (ex: entre label e input).
- **`stack-sm` (8px)**: Espaçamento de agrupamento (ex: entre itens de uma lista pequena).
- **`stack-md` (16px)**: Margem interna padrão de cartões pequenos e botões.
- **`stack-lg` (24px)**: Margem interna de cartões grandes e seções menores.
- **`stack-xl` (48px)**: Espaçamento entre seções grandes do dashboard.
- **`margin-mobile` (16px)**: Margem lateral padrão para smartphones.
- **`margin-desktop` (32px)**: Margem lateral padrão para telas desktop.
- **`gutter` (16px)**: Espaçamento entre colunas de um grid.

### Grid Responsiva
A aplicação deve se adequar a diferentes tamanhos de tela seguindo a estrutura:
- **Desktop:** Grid de 12 colunas (`grid-cols-12`).
- **Tablet:** Grid de 8 colunas (`grid-cols-8`).
- **Mobile:** Grid de 4 colunas (`grid-cols-4`).

---

## 6. Componentes e Classes Utilitárias do globals.css

### Botões

1. **Botão Primário (`.btn-primary`):**
   Fundo Navy Dark, texto branco, cantos com `border-radius: 6px`. Ao passar o mouse (*hover*), transiciona suavemente para Navy Light.
   ```html
   <button class="btn-primary">Salvar Agendamento</button>
   ```

2. **Botão de Automação / Destaque AI (`.btn-accent`):**
   Fundo Cyan Neon com texto Navy Dark, aplicando uma sombra brilhante ao passar o mouse. Usado para inteligência artificial ou envio de webhooks.
   ```html
   <button class="btn-accent">Integrar com WhatsApp</button>
   ```

3. **Botão Outline (`.btn-outline`):**
   Borda e texto em Blue Bright com fundo transparente. Efeito de *hover* aplica uma leve opacidade azul ao fundo.
   ```html
   <button class="btn-outline">Voltar</button>
   ```

### Inputs e Formulários

- **Campos de Texto (`.input`):**
  Bordas de tom cinza médio (`outline-variant`), raio de 6px. Ao receber foco, a borda assume a cor Blue Bright e um anel de brilho suave de `3px`.
  ```html
  <label class="label" for="nome">Nome do Cliente</label>
  <input type="text" id="nome" class="input" placeholder="Digite o nome..." />
  ```

### Cards

- **Estrutura de Card (`.card`):**
  Fundo branco elevado com `border-radius: 12px` e a sombra suave `shadow-card`. Cabeçalhos internos usam borda sutil na parte inferior.
  ```html
  <div class="card">
    <div class="card-header">Detalhes do Dia</div>
    <div class="p-5">Conteúdo do Card...</div>
  </div>
  ```

### Chips de Status

- **Componente Compacto (`.chip`):**
  Aplica formatação em maiúsculas, espaçamento de letras aprimorado e cantos arredondados de 6px.
  - Pendente: `.chip-pendente`
  - Confirmado: `.chip-confirmado`
  - Cancelado: `.chip-cancelado`
  - Remarcado: `.chip-remarcado`
  ```html
  <span class="chip chip-confirmado">Confirmado</span>
  ```

---

## 7. Integrações e Estilos de Terceiros (FullCalendar)

O componente de calendário visual diário e semanal foi customizado no [globals.css](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/globals.css) para respeitar o design system da Martins AI Automation:
- Os cabeçalhos de dias usam fundo Off White e fontes fortes em cinza escuro.
- Os botões de navegação no topo utilizam fundo branco com borda outline cinza, e o estado ativo ganha preenchimento Navy Dark.
- O botão "Hoje" (Today) é destacado na cor Cyan Neon para rápida localização.
