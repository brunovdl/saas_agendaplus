# Walkthrough — Integração do WhatsApp via Evolution API & n8n

Implementamos com sucesso toda a infraestrutura, banco de dados, rotas e interface para permitir que os profissionais conectem seus números de WhatsApp via **Evolution API** diretamente no Agenda+. Além disso, documentamos como criar a arquitetura multitenant simplificada no **n8n**.

---

## 🛠️ Alterações e Entregas Realizadas

### 1. Banco de Dados & Infra (Supabase)
* **Novas Colunas**: Adicionamos os campos `whatsapp_status`, `whatsapp_numero` e `whatsapp_instance_name` na tabela `prestadores` através da migração [20260619000002_add_whatsapp_integration_fields.sql](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/supabase/migrations/20260619000002_add_whatsapp_integration_fields.sql).
* **Tipagem**: Modificamos [supabase.ts](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/types/supabase.ts) para suportar os novos campos nas consultas TypeScript do Next.js.
* **Variáveis de Ambiente**: Atualizamos `.env.local` e `.env.local.example` com o endpoint da Evolution API: `https://www.evoapi.martinsautomation.com.br`.

### 2. Integração Backend do Next.js
* **Server Actions**: Criamos [evolution.ts](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/actions/evolution.ts) para realizar a comunicação segura e administrativa com a Evolution API.
* **Webhook Endpoint**: Criamos a rota [route.ts](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/api/webhooks/evolution/route.ts) no Next.js para atualizar o status do WhatsApp no banco de dados automaticamente quando a conexão for atualizada na Evolution API (inclusive se for desconectado manualmente no celular do usuário).

### 3. Interface Visual do Assistente
* **Painel QR Code**: Atualizamos a página [page.tsx](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/%28dashboard%29/configuracoes/assistente/page.tsx) com a seção de WhatsApp. Ela exibe o QR Code gerado, roda o polling dinâmico a cada 4 segundos detectando o escaneamento, exibe o número ativo e oferece a opção de desconectar.

### 4. Guia & Criação Automática do n8n Multitenant
* **Guia Técnico**: Criamos o guia [n8n_whatsapp_integration.md](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/docs/n8n_whatsapp_integration.md) na pasta `docs` detalhando o design e funcionamento do fluxo.
* **Criação do Workflow**: Criamos o workflow de IA centralizado diretamente na sua instância do n8n utilizando as ferramentas MCP. 
  - **Nome do Workflow**: `WhatsApp AI Agent (Multitenant)`
  - **ID do Workflow**: `zv40A7jX8At33Tzh`
  - **URL no n8n**: https://www.n8n.martinsautomation.com.br/workflow/zv40A7jX8At33Tzh
  - **Credenciais Associadas**: O n8n mapeou automaticamente suas credenciais `SupaBase - Banco de dados` e `OpenAi account` nos nós respectivos do fluxo.
  - **Status**: **Ativo e Publicado** (Pronto para receber webhooks de conversas).

---

## 🧪 Validação dos Testes

* **Conexão Realizada**: A chave master `EVOLUTION_API_KEY` foi configurada e o teste de geração de instância e leitura de QR Code foi realizado com sucesso. A conexão com o WhatsApp foi estabelecida e sincronizada com êxito!
* **Validação do Workflow**: O código do workflow do n8n foi validado sintaticamente pelo compilador do SDK com `valid: true` antes da criação.
* **Publicação**: O workflow foi ativado e publicado com sucesso na instância de produção do n8n do usuário.
* **Compilação**: O build final de produção foi gerado e validado sem erros com `npm run build`.
* **Correção do Bug de Agenda Vazia (Zero-Item Safety)**: Identificamos e corrigimos o problema de interrupção de fluxo quando o prestador não possui agendamentos futuros. Ativamos a configuração `alwaysOutputData: true` no nó `getAgendaOcupada` (via MCP `update_workflow`), fazendo com que o n8n continue a execução passando um item vazio `[{}]` para a IA, a qual prossegue normalmente com o atendimento.
* **Resolução do Erro 401 (Unauthorized) no Envio de Mensagens**: Configuramos a chave de API fornecida (`b1h2m3k400b1h2m3k400b1h2m3k400`) diretamente na lista de cabeçalhos (`apikey`) no nó `sendResponse` (HTTP Request) para autenticar com segurança na Evolution API. As alterações foram publicadas e ativadas com sucesso.
* **Resolução do Erro 400 (Bad Request) - Mudança de Payload**: Ajustamos a estrutura do corpo do POST no nó `sendResponse`. A Evolution API em sua versão mais recente requer a propriedade `text` diretamente no primeiro nível do objeto raiz (em vez de aninhada sob `textMessage.text`). O payload foi corrigido e publicado, resolvendo a falha de envio de mensagens do agente.
* **Resolução do Erro 400 (Bad Request) - Violação de Check Constraint de Telefone**: Identificamos que o banco de dados possui uma restrição (`agendamentos_cliente_telefone_check`) que exige que o número do telefone do cliente esteja estritamente no padrão E.164 (`^\+[1-9]\d{7,14}$`). Para evitar erros de digitação e formatação por parte da IA, modificamos o parâmetro `cliente_telefone` no nó `ConfirmarAgendamento` (no n8n) para preenchimento estático automático. O número é extraído diretamente do JID da conversa via a expressão `=+{{ $('normalizePayload').item.json.remoteJid.split('@')[0] }}`. Desta forma, o telefone é garantido no formato E.164 adequado (ex: `+556991847619`), resolvendo a violação e tornando o agendamento à prova de falhas.







---
← Voltar para [[Sessão - Plano de Implementação- Conexão WhatsApp via Evolution API & n8n (8927a80e)]]