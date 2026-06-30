# Plano de Implementação: Reescrita Inteligente da Descrição do Negócio com IA

Este plano descreve a implementação da funcionalidade que permite aos usuários melhorar a descrição de seus negócios na tela de configurações da assistente virtual utilizando a API do Groq (modelo `llama-3.3-70b-versatile`).

## Proposed Changes

### 1. Configurações de Ambiente

#### [MODIFY] [.env.local](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/.env.local) e [.env.local.example](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/.env.local.example)
- Adicionar a variável `GROQ_API_KEY` para que o servidor possa autenticar as requisições à API do Groq de forma segura.

---

### 2. Backend: Server Actions

#### [NEW] [actions.ts](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/(dashboard)/configuracoes/assistente/actions.ts)
- Criar o arquivo `actions.ts` no módulo da assistente se não existir.
- Implementar a Server Action `melhorarDescricaoComIA(descricaoOriginal: string)`:
  - Valida se `GROQ_API_KEY` está configurada no ambiente.
  - Valida se o texto original não está vazio e não excede o limite.
  - Executa uma requisição HTTP POST para a API do Groq (`https://api.groq.com/openai/v1/chat/completions`) com o modelo `llama-3.3-70b-versatile`.
  - Prompt System: Instruir a IA a reescrever o texto do usuário de forma profissional, acolhedora, estruturando em seções curtas (ex: Diferenciais, Serviços, Localização) e mantendo a informação concisa (máximo 950 caracteres para segurança do limite de 1000).
  - Retorna `{ success: true, descricaoSugerida }` ou `{ error: string }`.

---

### 3. Frontend: Interface de Configuração

#### [MODIFY] [page.tsx](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/(dashboard)/configuracoes/assistente/page.tsx)
- Adicionar o botão **"Melhorar com IA"** (com ícone `Sparkles` ou similar) ao lado do título da label de "Descrição do Negócio".
- Adicionar estados no componente:
  - `sugestaoIA`: guarda o texto gerado pela IA.
  - `loadingIA`: boolean para desabilitar o botão e mostrar spinner/loading.
  - `errorIA`: string para exibir erros de requisição ou chave ausente temporariamente.
- Quando o usuário clicar no botão:
  - Chamar `melhorarDescricaoComIA` passando o texto atual do campo `descricao_negocio`.
  - Exibir o preview da sugestão da IA logo abaixo do `textarea` em um bloco com fundo suave azul/cinza e borda pontilhada (estilo Híbrido Premium).
  - Adicionar botões no bloco de preview:
    - **"Aplicar sugestão"** (`btn-primary` ou similar): copia a sugestão para o estado principal da descrição e limpa a sugestão da tela.
    - **"Descartar"** (`btn-secondary`): apenas limpa a sugestão da tela.

---

## Verification Plan

### Teste da Chamada da API
1. Tentar clicar no botão "Melhorar com IA" sem ter a chave `GROQ_API_KEY` preenchida no `.env.local` e validar se exibe o erro instruindo a preencher a chave.
2. Inserir uma chave válida do Groq em `.env.local` e testar a geração.
3. Digitar um texto simples, por exemplo: *"sou barbeiro corto cabelo e barba no centro de sp atendo de terça a sabado"*.
4. Clicar no botão, aguardar o loading e ver se o preview da sugestão aparece estruturado e profissional (ex: mostrando Diferenciais, Serviços, etc.).

### Teste de Ações na UI
1. Clicar em "Descartar" e verificar se o preview some e o texto original é mantido intacto.
2. Clicar em "Melhorar com IA" novamente, esperar a sugestão e clicar em "Aplicar sugestão".
3. Validar se o texto do textarea é atualizado com a sugestão da IA e se o preview some.
4. Salvar as configurações e garantir que o valor persistiu corretamente no banco de dados.


---
← Voltar para [[Sessão - Plano de Implementação- Reescrita Inteligente da Descrição do Negócio com IA (a41e8e40)]]