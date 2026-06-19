# Guia de Integração: WhatsApp & n8n Multitenant (Fluxo Único)

Este guia descreve como configurar a integração entre a **Evolution API**, o banco de dados do **Supabase** e o **n8n** utilizando a arquitetura de **Fluxo Único Multitenant**. Essa arquitetura permite que um único workflow no n8n atenda dinamicamente a todos os prestadores cadastrados no sistema de forma isolada e inteligente.

---

## 📐 Fluxo de Dados

```
[Cliente Final] 
       │ (Envia mensagem no WhatsApp)
       ▼
[Evolution API] (Gera o evento de mensagem recebida)
       │
       ▼ (Webhook Global)
[ n8n Workflow ]
       │
       ├─► 1. Consulta Supabase (Busca Prestador pelo "instanceName")
       ├─► 2. Consulta Supabase (Busca Horários Ocupados / Agendados)
       ├─► 3. LLM/Agent (Processa contexto, tom de voz, regras, serviços e horários livres)
       ├─► 4. Tool/Supabase (Se confirmado, insere novo agendamento no banco)
       │
       ▼ (HTTP Request - /message/sendText)
[Evolution API] (Envia resposta ao cliente)
```

---

## 🛠️ Passo 1: Configurar Webhooks Globais na Evolution API

Para que a Evolution API notifique o Next.js (status de conexão) e o n8n (conversas), você deve configurar os webhooks na Evolution API. 

Você pode fazer isso pela própria interface administrativa da Evolution API ou via requisição HTTP:

### 1. Webhook de Conexão (Next.js)
A Evolution API deve notificar o Next.js quando o status do WhatsApp mudar.
* **URL do Webhook:** `https://seu-dominio-agenda.com.br/api/webhooks/evolution`
* **Eventos a selecionar:** `connection.update`
* **Headers:** `apikey: SUA_GLOBAL_API_KEY`

### 2. Webhook de Conversa (n8n)
A Evolution API deve notificar o n8n quando uma mensagem for recebida.
* **URL do Webhook:** `https://seu-n8n.com/webhook/whatsapp-agent`
* **Eventos a selecionar:** `messages.upsert`
* **Headers:** `apikey: SUA_GLOBAL_API_KEY`

---

## 🤖 Passo 2: Estrutura do Workflow no n8n

Monte o seguinte fluxo no seu n8n usando os nós indicados:

```
                  ┌───────────────┐
                  │Webhook Trigger│ (Mensagem Recebida da Evolution API)
                  └───────┬───────┘
                          │
                          ▼
               ┌─────────────────────┐
               │ Supabase: Prestador │ (Busca dados pelo $json.instance)
               └───────┬─────────────┘
                       │
                       ▼
             ┌─────────────────────────┐
             │Supabase: Agenda Ocupada │ (Busca agendamentos ativos)
             └─────────┬───────────────┘
                       │
                       ▼
             ┌─────────────────────────┐
             │      Agente de IA       │ <─── Memory (Window Buffer)
             └─────────┬───────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│Tool: Agendar no  │      │HTTP Request Node │ (Responde no WhatsApp)
│     Supabase     │      │ (Enviar Mensagem)│
└──────────────────┘      └──────────────────┘
```

---

## 📝 Detalhes de Configuração dos Nós

### Node 1: Webhook (Evolution API Message)
* **Path:** `whatsapp-agent`
* **Method:** `POST`
* O payload recebido trará o remetente em `data.key.remoteJid` e o nome da instância em `instance`.

### Node 2: Supabase (Obter Prestador)
* **Operation:** `Get Many`
* **Table:** `prestadores`
* **Filters:**
  - `whatsapp_instance_name` = `{{ $json.instance }}`
* **Retorno:** Traz o `id` do prestador, `nome_completo`, `nome_negocio`, `nicho` e o JSON `configuracao_assistente`.

### Node 3: Supabase (Obter Grade Ocupada)
* **Operation:** `Get Many` (ou `Get All`)
* **Table:** `agendamentos`
* **Filters:**
  - `user_id` = `{{ $node.getPrestador.json.id }}`
  - `data_hora_inicio` >= `{{ $now.toISO() }}`
  - `status` != `cancelado`
* **Configuração Crítica (Node Settings)**: Ative a opção **"Always Output Data"** (Sempre retornar dados) nas configurações do nó. Isso garante que, se o prestador não possuir nenhum agendamento futuro ocupado, o nó retornará um item vazio `[{}]` em vez de retornar `0` itens, permitindo que a execução prossiga normalmente até o Agente de IA para responder ao cliente.

### Node 4: Agente de IA (AI Agent + LLM)
Utilize um nó de **AI Agent** conectado a um modelo de linguagem (ex: OpenAI GPT-4o ou Claude 3.5 Sonnet) com **Window Buffer Memory** para manter o histórico do chat associado ao JID do cliente (`{{ $node["Webhook"].json.data.key.remoteJid }}`).

#### System Prompt Dinâmico:
Configure o Prompt do Agente dinamicamente usando as variáveis retornadas dos nós anteriores:
```text
Você é {{ $node["Supabase: Prestador"].json.configuracao_assistente.nome_assistente }}, a secretária virtual da empresa "{{ $node["Supabase: Prestador"].json.nome_negocio }}".
Sua missão é ajudar os clientes a agendarem serviços de forma 100% autônoma pelo WhatsApp.

Regras de Atendimento:
1. Adote um tom de voz {{ $node["Supabase: Prestador"].json.configuracao_assistente.tom_voz }}.
2. Nosso nicho de atuação é: {{ $node["Supabase: Prestador"].json.nicho }}.
3. Oferecemos os seguintes serviços:
{{ JSON.stringify($node["Supabase: Prestador"].json.configuracao_assistente.servicos, null, 2) }}

Nossos Horários de Funcionamento são:
{{ JSON.stringify($node["Supabase: Prestador"].json.configuracao_assistente.horario_funcionamento, null, 2) }}

Horários Indisponíveis (Já Ocupados):
{{ JSON.stringify($node["Supabase: Agenda Ocupada"].json, null, 2) }}

Instruções para Agendamento:
- Quando o cliente escolher um serviço e um horário disponível dentro do nosso expediente, utilize a ferramenta "ConfirmarAgendamento" para salvar a reserva no sistema.
- Lembre-se que as durações dos serviços devem ser respeitadas para não sobrepor outros clientes.
```

### Node 5: Tool "ConfirmarAgendamento" (Ferramenta de IA)
Crie uma ferramenta (Tool) conectada ao Agente de IA para inserir agendamentos.
* **Name:** `ConfirmarAgendamento`
* **Description:** *"Use esta ferramenta para confirmar o agendamento do cliente informando o nome do cliente, o nome do serviço (observações) e a data/hora de início/fim formatada em ISO 8601 (ex: 2026-06-19T14:00:00-03:00)."*
* **Lógica Interna (JavaScript / Supabase Node)**:
  Executa um `INSERT` na tabela `agendamentos` com os parâmetros recebidos:
  ```json
  {
    "user_id": "{{ $node["Supabase: Prestador"].json.id }}",
    "cliente_nome": "{{ $query.cliente_nome }}",
    "cliente_telefone": "=+{{ $('normalizePayload').item.json.remoteJid.split('@')[0] }}",
    "data_hora_inicio": "{{ $query.data_hora_inicio }}",
    "data_hora_fim": "{{ new Date(new Date($query.data_hora_inicio).getTime() + ($query.duracao * 60 * 1000)).toISOString() }}",
    "status": "confirmado",
    "observacoes": "Agendado via WhatsApp pela Secretária Virtual"
  }
  ```

  > [!IMPORTANT]
  > Para evitar falhas devido à check constraint do Supabase (`agendamentos_cliente_telefone_check`), que exige formato E.164 (`^\+[1-9]\d{7,14}$`), o campo `cliente_telefone` **não** deve ser exposto como um parâmetro preenchível pela IA. Em vez disso, configure-o com o valor estático `=+{{ $('normalizePayload').item.json.remoteJid.split('@')[0] }}` para derivar automaticamente e formatar corretamente o número a partir do JID do WhatsApp.

### Node 6: HTTP Request (Enviar Mensagem no WhatsApp)
Após o agente de IA formular a resposta final (`output`), este nó envia o texto de volta ao cliente:
* **Method:** `POST`
* **URL:** `https://www.evoapi.martinsautomation.com.br/message/sendText/{{ $node["Webhook"].json.instance }}`
* **Headers:**
  - `Content-Type: application/json`
  - `apikey: SUA_GLOBAL_API_KEY`
* **Body (Configuração de Segurança para quebras de linha)**: 
  Defina a opção **Specify Body** (Especificar Corpo) como **`Using Fields Below`** (Key-Value/Keypair) em vez de `JSON`. Isso evita falhas de JSON inválido quando a IA responde com quebras de linha (`\n`), pois o n8n serializa e escapa os valores automaticamente.
  - **number**: `{{ $node.normalizePayload.json.remoteJid.split('@')[0] }}`
  - **text**: `{{ $json.output }}`
  - **options**: `{{ { "delay": 1000, "presence": "composing" } }}`


---

## 📈 Vantagens Desta Abordagem
* **Centralização:** Um único fluxo gerencia 10, 100 ou 10.000 clientes conectados.
* **Sem Código Dinâmico:** Não é necessário usar a API do n8n para criar novos fluxos em tempo de execução.
* **Manutenção Simples:** Qualquer melhoria no prompt ou no modelo de IA é aplicada instantaneamente para todos os usuários do SaaS.
