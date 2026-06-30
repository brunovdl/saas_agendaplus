# Plano de Implementação: Melhorias de Frontend Responsivo (Mobile-First)

Implementação de três ajustes simples e essenciais de interface para garantir consistência e usabilidade em dispositivos móveis e desktop no **Agenda+**:

1. **Botões de CTA na Landing Page**: Tornar o botão de "Entrar" (Login) visível em dispositivos móveis ao lado de "Criar Conta", ajustando padding e fonte para responsividade.
2. **Design e Animação na Tela de Login**: Ajustar a ordem do painel esquerdo da tela de login para colocar a animação no topo (Logo -> Animação -> Textos/Features) para eliminar o vácuo vertical.
3. **Botão de Sair no Mobile**: Adicionar um cabeçalho mobile exclusivo no topo da página de Configurações (`/configuracoes`) com o título "Configurações" e um botão "Sair" (Logout) à direita.

---

## User Review Required

> [!NOTE]
> **Disposição do Painel Esquerdo na Login Page**: A animação da interface simulada passará a ficar posicionada no topo da coluna esquerda, logo abaixo da logo, e os textos informativos com checks serão movidos para o rodapé.

---

## Proposed Changes

### Tela de Login

#### [MODIFY] [page.tsx](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/%28auth%29/login/page.tsx)
* Alterar o JSX do painel esquerdo (`hero-panel`) para reordenar os elementos:
  - Injetar o bloco de "Interface Simulada Animada" logo após o bloco da Logo.
  - Colocar o bloco de Tagline/Features ("Sua agenda no piloto automático...") abaixo da animação.
* Ajustar as margens e paddings dos blocos para um fluxo visual contínuo e elegante.

---

## Verification Plan

### Automated Tests
* Rodar `npx tsc --noEmit` para garantir a compilação.

### Manual Verification
* Usar o `browser_subagent` para testar no desktop e verificar que a tela de login exibe a animação no topo (abaixo da logo) e os textos no rodapé, sem espaço vazio indevido.


---
← Voltar para [[Sessão - Plano de Implementação- Melhorias de Frontend Responsivo (Mobile-First) (37df6913)]]