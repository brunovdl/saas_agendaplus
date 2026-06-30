# Walkthrough - Configuração do MCP do n8n

Concluímos a configuração do servidor MCP do n8n no Antigravity IDE.

## Mudanças Realizadas

### Antigravity Config
#### [mcp_config.json](file:///C:/Users/Bruno%20Martins/.gemini/antigravity-ide/mcp_config.json)
Adicionamos o servidor `n8n` à configuração de `mcpServers` no arquivo `mcp_config.json` do Antigravity IDE:
```json
    "n8n": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://www.n8n.martinsautomation.com.br/mcp-server/http"
      ],
      "env": {}
    }
```

Essa configuração utiliza o utilitário `mcp-remote` para estabelecer uma ponte via StdIO com o endpoint SSE do nó MCP Server Trigger exposto em sua instância do n8n (`https://www.n8n.martinsautomation.com.br/mcp-server/http`).

## Verificação e Próximos Passos
- A configuração foi gravada com sucesso e está sintaticamente correta.
- O Antigravity IDE carregará o novo servidor MCP automaticamente. Os nós/workflows criados sob o Trigger do MCP Server no seu n8n estarão disponíveis como ferramentas para os assistentes de IA neste workspace.


---
← Voltar para [[Sessão - Configuração do MCP do n8n no Antigravity (71f1cbda)]]