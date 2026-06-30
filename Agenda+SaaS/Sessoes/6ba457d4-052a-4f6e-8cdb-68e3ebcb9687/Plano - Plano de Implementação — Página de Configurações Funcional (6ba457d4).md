# Plano de Implementação — Página de Configurações Funcional

Tornar a página de configurações totalmente funcional e persistente no banco de dados. Armazenaremos as preferências de notificações, aparência (tema e densidade) e a URL do webhook do n8n na tabela `public.profiles`. Também adicionaremos suporte para alteração de senha e exclusão da conta.

## User Review Required

> [!IMPORTANT]
> Executaremos uma instrução DDL (SQL) para adicionar colunas de preferências e webhook à tabela `public.profiles`. A segurança será herdada automaticamente das políticas RLS existentes nessa tabela (onde cada usuário só pode ler e atualizar seu próprio registro).

## Proposed Changes

### Banco de Dados (Supabase SQL)

Adicionar as novas colunas à tabela `public.profiles` com valores padrão adequados:
- `webhook_url`: `text` (pode ser nulo)
- `email_digests`: `boolean` (padrão `true`)
- `push_alerts`: `boolean` (padrão `true`)
- `marketing_updates`: `boolean` (padrão `false`)
- `compact_density`: `boolean` (padrão `false`)
- `theme`: `text` (padrão `'light'`)

### Frontend (Configurações)

#### [MODIFY] [page.tsx](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/(dashboard)/configuracoes/page.tsx)

- **Tipos**: Atualizar a interface `ProfileData` para conter todos os novos campos.
- **Carregamento de Dados**: No `useEffect`, carregar os novos campos da tabela `profiles`.
- **Estado de Alteração**:
  - Unificar os campos no estado `profile` e criar um `originalProfile` para rastrear modificações de forma precisa, liberando o botão "Salvar Alterações" se houver alterações.
- **Salvar Preferências**: Enviar todos os dados alterados na chamada de `.update` do Supabase para a tabela `profiles`.
- **UI do Webhook**: Exibir o input do webhook diretamente no card, com feedback de validação simples de URL.
- **Formulário de Senha (Inline)**:
  - Clicar em "Atualizar" abrirá um formulário inline com os campos: *Nova Senha* e *Confirmar Nova Senha*.
  - Ao submeter, usará `supabase.auth.updateUser({ password: newPassword })` e exibirá uma mensagem de sucesso ou erro.
- **Exclusão de Conta (Inline)**:
  - Clicar em "Excluir" exibirá um painel inline pedindo para digitar "EXCLUIR" para confirmar.
  - Ao confirmar, efetuará o sign-out do usuário após simular a solicitação de exclusão (como não há endpoint admin público exposto, informará e executará o fluxo de encerramento local seguro).

---

## Verification Plan

### Automated Tests
- Executar `npm run build` para validar que o Next.js e o TypeScript compilam a página de configurações corretamente sem erros de tipo.

### Manual Verification
- Acessar a página `/configuracoes` no navegador.
- Modificar os toggles de notificação, trocar o tema (selecionar Light/Dark), inserir uma URL de Webhook no input.
- Clicar em "Salvar Alterações" e verificar se o toast de sucesso aparece. Recarregar a página para certificar-se de que os dados persistem (são carregados do banco de dados).
- Testar a alteração de senha digitando uma nova senha e submetendo.


---
← Voltar para [[Sessão - Plano de Implementação — Página de Configurações Funcional (6ba457d4)]]