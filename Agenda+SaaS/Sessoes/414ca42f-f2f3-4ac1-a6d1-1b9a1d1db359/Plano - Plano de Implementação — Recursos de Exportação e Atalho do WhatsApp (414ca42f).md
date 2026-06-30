# Plano de Implementação — Recursos de Exportação e Atalho do WhatsApp

Este plano descreve o desenvolvimento de recursos adicionais na visualização do cliente: atalho direto para o WhatsApp do cliente e ferramentas de exportação da Ficha de Anamnese para Word (DOCX) e PDF para uso clínico do prestador.

---

## Proposed Changes

### Componentes de Interface

#### [MODIFY] [ClientePerfilView.tsx](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/components/clientes/ClientePerfilView.tsx)
- **Atalho do WhatsApp**:
  - Ao lado do telefone do cliente no topo do perfil, adicionar um botão de link direto com o ícone do WhatsApp que redireciona para `https://wa.me/{telefone_limpo}` abrindo em nova aba.
- **Exportação para Word (DOCX)**:
  - Adicionar o botão "Exportar DOCX" no topo da seção de Anamnese.
  - Implementar uma função que monta um documento HTML com cabeçalhos Office XML (MIME `application/vnd.ms-word`), formatando a ficha com o cabeçalho do negócio e dados do cliente, salvando como `anamnese_{nome_cliente}.doc`.
- **Exportação para PDF / Impressão**:
  - Adicionar o botão "Imprimir / PDF" no topo da seção de Anamnese.
  - Chamar `window.print()` ao clicar.
  - Otimizar a estilização de impressão usando a variante utilitária `print:` do Tailwind CSS para ocultar elementos estruturais do painel (Sidebar, BottomNav, botões de ação e abas) e exibir uma visualização limpa e formatada da ficha de anamnese.

#### [MODIFY] [Sidebar.tsx](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/components/layout/Sidebar.tsx)
- Adicionar a classe `print:hidden` ao container principal `<aside>` para que a barra lateral suma automaticamente na impressão.

#### [MODIFY] [BottomNav.tsx](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/components/layout/BottomNav.tsx)
- Adicionar a classe `print:hidden` ao container principal `<nav>` para que o menu inferior suma automaticamente na impressão.

---

## Verification Plan

### Automated / Manual Verification
1. Abrir o perfil de um cliente com nicho de Saúde & Estética.
2. Clicar no ícone do WhatsApp e verificar se redireciona para a URL do WhatsApp Web correta com o telefone limpo de formatações.
3. Clicar em "Exportar DOCX" e confirmar se o arquivo `.doc` é baixado e pode ser aberto no Microsoft Word preservando os dados cadastrados.
4. Clicar em "Imprimir / PDF" e confirmar se a tela de impressão do navegador exibe apenas a ficha de anamnese sem Sidebar, BottomNav ou botões da interface, pronta para ser salva como PDF.
5. Executar `npm run build` para garantir que o TypeScript e Next.js compilem com sucesso.


---
← Voltar para [[Sessão - Plano de Implementação — Recursos de Exportação e Atalho do WhatsApp (414ca42f)]]