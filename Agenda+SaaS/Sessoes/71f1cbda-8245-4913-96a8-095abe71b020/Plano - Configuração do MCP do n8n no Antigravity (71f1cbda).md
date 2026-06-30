# Configuração do MCP do n8n no Antigravity

Este plano detalha a configuração do servidor MCP do n8n no Antigravity IDE para permitir que o assistente interaja com seus workflows n8n.

## User Review Required

> [!IMPORTANT]
> A configuração do MCP do n8n requer informações específicas da sua instância n8n. Por favor, revise as opções abaixo e nos forneça os dados necessários para completar a configuração no arquivo [mcp_config.json](file:///C:/Users/Bruno%20Martins/.gemini/antigravity-ide/mcp_config.json).

## Open Questions

> [!IMPORTANT]
> Precisamos definir qual das duas abordagens de integração você prefere usar:

### Opção A: Integração Geral via API do n8n
Permite que o assistente interaja de forma ampla com a API do seu n8n (listar workflows, disparar execuções, etc.) utilizando um servidor MCP baseado no pacote `@leonardsellem/n8n-mcp-server` ou `n8n-mcp`.
* **Dados necessários:**
  1. A URL da API do seu n8n (ex: `https://seu-n8n.com/api/v1` ou `http://localhost:5678/api/v1`).
  2. Sua chave de API do n8n (gerada em *Settings > API* no painel do n8n).

### Opção B: Integração via Nó "MCP Server Trigger" (SSE)
Se você já possui ou deseja criar um workflow específico no n8n usando o nó **MCP Server Trigger**, o n8n expõe uma URL de Server-Sent Events (SSE). Nós configuramos o Antigravity para se conectar diretamente a esse endpoint SSE usando o utilitário `mcp-remote`.
* **Dados necessários:**
  1. A URL de Produção do SSE gerada pelo nó MCP Server Trigger no seu n8n (ex: `http://localhost:5678/mcp/seu-path`).

**Pergunta:** Qual dessas opções você prefere configurar e quais são as credenciais/URLs que devemos utilizar? (Por razões de segurança, você pode colar os valores reais ou indicar onde deseja preenchê-los).

---

## Proposed Changes

### Antigravity Config

#### [MODIFY] [mcp_config.json](file:///C:/Users/Bruno%20Martins/.gemini/antigravity-ide/mcp_config.json)

Dependendo da sua escolha nas perguntas acima, adicionaremos uma entrada ao objeto `mcpServers` no arquivo `mcp_config.json`.

**Se escolher a Opção A:**
```json
    "n8n": {
      "command": "npx",
      "args": [
        "-y",
        "@leonardsellem/n8n-mcp-server"
      ],
      "env": {
        "N8N_API_URL": "<SUA_URL_DA_API>",
        "N8N_API_KEY": "<SUA_CHAVE_DE_API>"
      }
    }
```

**Se escolher a Opção B:**
```json
    "n8n-sse": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "<SUA_URL_SSE_N8N>"
      ],
      "env": {}
    }
```

---

## Verification Plan

### Manual Verification
- Após salvar as configurações no `mcp_config.json`, o Antigravity IDE carregará o novo servidor MCP.
- Verificaremos se as ferramentas do n8n ficam disponíveis na lista de ferramentas (usando o `list_permissions` ou observando a inicialização das ferramentas).


---
← Voltar para [[Sessão - Configuração do MCP do n8n no Antigravity (71f1cbda)]]