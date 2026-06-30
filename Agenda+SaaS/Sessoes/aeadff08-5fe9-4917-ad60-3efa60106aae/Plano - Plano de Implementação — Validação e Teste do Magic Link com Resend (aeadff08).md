# Plano de Implementação — Validação e Teste do Magic Link com Resend

Este plano detalha o roteiro para orientar o usuário na adição de URLs de redirecionamento seguras no painel do Supabase e na realização do teste funcional completo do login por link mágico (Magic Link) via Resend.

## User Review Required

> [!IMPORTANT]
> Sem configurar as **Additional Redirect URLs** no painel do Supabase Cloud, o link enviado por e-mail falhará ao tentar redirecionar o usuário de volta para o ambiente local (`http://localhost:3000`), fazendo com que o Supabase rejeite a autenticação local por razões de segurança.

## Proposed Changes

### Guias de Configuração

#### [MODIFY] [resend_config_guide.md](file:///C:/Users/Bruno%20Martins/.gemini/antigravity-ide/brain/aeadff08-5fe9-4917-ad60-3efa60106aae/resend_config_guide.md)
Adicionar uma nova seção no guia de configuração focada exclusivamente no **Passo a Passo de Redirect URLs** e nos detalhes de teste do Magic Link.

---

## Verification Plan

### Manual Verification
1. **Adicionar URL no Supabase**: Instruir o usuário a adicionar `http://localhost:3000/auth/callback` nas URLs de redirect no console do Supabase Cloud.
2. **Executar teste na interface**:
   - Acessar `http://localhost:3000/login`.
   - Digitar o e-mail.
   - Clicar em "Entrar sem senha (Magic Link)".
   - Validar se o e-mail do Resend chega e se, ao clicar, o usuário é logado com sucesso no Agenda+.


---
← Voltar para [[Sessão - Plano de Implementação — Validação e Teste do Magic Link com Resend (aeadff08)]]