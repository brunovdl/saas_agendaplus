# Plano de Implementação — Telas Faltantes (Landing Page, Analytics, Configurações)

Este plano descreve o desenvolvimento completo das telas que estão ausentes ou inacabadas em relação ao protótipo do Stitch, mantendo estrita fidelidade visual e estrutural ao Brand Book da **Martins AI Automation**.

## User Review Required

> [!IMPORTANT]
> - **SVG Gráficos no Analytics:** Optamos por renderizar os mini-gráficos e o gráfico principal "Impact Over Time" usando componentes SVG nativos e interativos em React. Isso elimina a dependência de pacotes de terceiros (como Recharts ou react-chartjs-2) que frequentemente quebram builds no Next.js 16/React 19, garantindo compatibilidade de compilação 100% livre de falhas de tipagem.
> - **Dados de Perfil dinâmicos:** A tela de configurações irá consumir e atualizar o campo `full_name` na tabela `public.profiles` do banco de dados do Supabase.

## Proposed Changes

---

### [Componente de Autenticação & Landing Page]

#### [MODIFY] [page.tsx](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/page.tsx)
- Reescrever a página raiz `/` para carregar a sessão do Supabase no lado do servidor.
- Se o usuário estiver **autenticado**, redireciona automaticamente para `/agenda`.
- Se o usuário estiver **deslogado**, renderiza a Landing Page corporativa completa do Stitch.
- A Landing Page conterá:
  - Navbar fixo com links de âncora (Features, Solutions, Pricing, About) e botões "Entrar" (/login) e "Criar Conta" (/cadastro).
  - Hero Section com título impactante, texto explicativo, botões com efeitos de escala no hover e a simulação de interface de calendário com glassmorphism e a linha de animação "AI Scanning".
  - Footer corporativo com links legais.

---

### [Painel de Analytics]

#### [NEW] [page.tsx](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/(dashboard)/analytics/page.tsx)
- Implementar a página de Analytics em `/analytics`.
- Renderizar o cabeçalho da página ("Analytics Overview") com botão "Export Report" e botão de notificações.
- Implementar o grid de métricas de alta performance:
  - **Total Automations Run (12,450):** Com um gráfico de barra animado em SVG (Cyan).
  - **Total Time Saved (840 hrs):** Com texto "On Track vs. 800hr goal" e um indicador visual.
  - **Success Rate (99.2%):** Círculo de progresso em formato radial SVG + faixas de sucesso.
  - **Error Rate (0.8%):** Linha de erro tracejada em SVG (Red).
- Implementar a área de visualização gráfica principal:
  - Gráfico de Área "Impact Over Time" renderizado com linhas curvas interativas em SVG contendo os datasets "Automated Tasks" (Cyan) e "Manual Tasks" (Blue).
  - Controles de troca de período (1W, 1M, 1Y).
- Painel lateral de logs de anomalias recentes ("Recent Anomalies") com alertas do Salesforce e volumes incomuns.

---

### [Painel de Configurações]

#### [NEW] [page.tsx](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/(dashboard)/configuracoes/page.tsx)
- Criar a página de configurações em `/configuracoes`.
- No lado do cliente, buscar as informações do usuário autenticado (`supabase.auth.getUser()`) e os dados correspondentes na tabela `public.profiles` (como o `full_name`).
- Formulário de Conta:
  - Upload/Exibição do Avatar com botão de editar.
  - Campo "Full Name" (interativo e que salva no banco).
  - Campo "Email Address" (readonly).
  - Links funcionais para atualização de senha e exclusão da conta.
- Seção de Notificações com Toggles (Email Digests, Push Alerts, Marketing).
- Seção de Integrações (Google Calendar conectado por padrão; Slack com opção de conectar).
- Seção de Aparência com seleção de tema (Light/Dark Pro) e Compact Density.
- Funcionalidade para persistir as alterações de `full_name` no Supabase ao clicar em "Save All Changes" com feedback visual de sucesso.

---

### [Correções de Rota (Fallback Dashboard)]

#### [NEW] [page.tsx](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/(dashboard)/dashboard/page.tsx)
- Criar uma rota `/dashboard` que redireciona automaticamente para `/agenda` (`redirect('/agenda')`).
- Isso previne erros 404 caso o usuário clique no link de "Dashboard" da barra lateral.

## Verification Plan

### Automated Tests
- Executar `npx tsc --noEmit` para garantir que todas as novas telas estejam com tipagem TypeScript perfeitamente resolvida (Zero `any`).
- Executar `next build` para assegurar que a build de produção não possua falhas de renderização estática ou dinâmica.

### Manual Verification
- Acessar a aplicação deslogado na raiz `/` e certificar-se de ver a Landing Page.
- Fazer login e testar os botões de navegação da Sidebar (incluindo o link de Dashboard, que deve redirecionar corretamente para a Agenda).
- Acessar `/analytics` e validar o carregamento dos gráficos SVG.
- Acessar `/configuracoes`, alterar o nome completo, salvar e recarregar a página para certificar-se de que os dados foram persistidos no Supabase.


---
← Voltar para [[Sessão - Plano de Implementação — Telas Faltantes (Landing Page, Analytics, Configurações) (3c03ca36)]]