# Plano de Implementação — Perfil de Negócio e Agendamento Público (Fase 6.1)

Este plano foi estendido para incluir a correção do bug de salvamento de campos nulos e a implementação do upload de logotipo por meio do componente `FilePicker` integrado ao Supabase Storage.

---

## User Review Required

> [!IMPORTANT]
> **Upload para o Supabase Storage (Bucket `logos`)**:
> * O profissional selecionará uma imagem local no seu computador utilizando o `ft.FilePicker` do Flet.
> * A aplicação lerá os bytes do arquivo em memória e fará o upload via SDK do Supabase para o bucket público `logos`.
> * Para prevenir colisões de nomes e burlar problemas de cache agressivo dos navegadores dos clientes, os arquivos no bucket serão salvos na estrutura: `{business_id}/{timestamp}_{filename}`.
> * O limite máximo de tamanho de imagem aceito pelo bucket é de 2MB, o qual validaremos na interface antes do envio para o servidor.

---

## Proposed Changes

### Camada de Serviços e Dados

#### [MODIFY] [services.py](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+/app/services.py)
* **Correção do Bug `.strip()`**: Ajustar as funções `update_business_details` para tratar valores `None` em `name`, `logo_url`, `slug` e `bio` (usando fallbacks como `(val or "").strip()`), eliminando o erro `'NoneType' object has no attribute 'strip'`.

---

### Camada de Interface de Usuário (Configurações)

#### [MODIFY] [settings_view.py](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+/app/ui/settings_view.py)
* **Integração do `ft.FilePicker`**:
  * Adicionar o componente `ft.FilePicker` no overlay da página.
  * No callback de seleção de arquivo, ler os bytes da imagem local, verificar se o arquivo possui menos de 2MB e realizar o upload para o bucket `logos` do Supabase Storage.
  * Atualizar o campo `brand_logo_url` no banco de dados e atualizar o preview visual do logotipo na interface.
* **Componente de Preview do Logotipo**:
  * Adicionar uma miniatura circular da imagem carregada (`ft.Image` com `border_radius=35`), exibindo um ícone de estabelecimento padrão (`ft.Icons.STOREFRONT_ROUNDED`) caso o logotipo ainda não tenha sido configurado.
  * O input de texto da URL da logo se tornará apenas para leitura (`read_only=True`), servindo como indicador visual da URL pública gerada no Supabase.

---

## Verification Plan

### Testes Manuais
1. **Validação do Bug do Salvamento**:
   * Acessar a aba "Config." e tentar salvar o perfil com o campo de descrição ou logotipo em branco. Validar se os dados salvam normalmente sem estourar o erro de `'NoneType'`.
2. **Teste de Upload de Logotipo (FilePicker)**:
   * Clicar no botão "Selecionar Logo" nas configurações.
   * Selecionar uma imagem local superior a 2MB e certificar que o app impede o envio com uma notificação apropriada.
   * Selecionar uma imagem válida (ex: PNG ou JPG) de até 2MB e certificar que ela é carregada, a URL pública é gerada no input e a imagem de preview é atualizada na tela.
   * Salvar as alterações e acessar o portal público do cliente (`?slug=...`) para confirmar que a nova logo e os dados são carregados corretamente.


---
← Voltar para [[Sessão - Plano de Implementação — Perfil de Negócio e Agendamento Público (Fase 6.1) (73e86ff0)]]