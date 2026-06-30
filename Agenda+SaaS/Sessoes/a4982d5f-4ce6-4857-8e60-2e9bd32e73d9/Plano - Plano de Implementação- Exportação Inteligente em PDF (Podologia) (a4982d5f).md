# Plano de Implementação: Exportação Inteligente em PDF (Podologia)

Ajuste do fluxo de download da ficha de avaliação podológica para disponibilizar exclusivamente a exportação em PDF, com formatação automática e inteligente do nome do arquivo.

## User Review Required

> [!IMPORTANT]
> **Nome de Arquivo Dinâmico:** Para que o PDF seja salvo com o nome do paciente e a data do download, mudaremos temporariamente o `document.title` do navegador no momento da chamada de impressão (`window.print()`). O título sugerido será no formato: `avaliacao_podologia_[nome_do_paciente]_[data_atual].pdf`.
>
> **Simplificação de Exportação:** Conforme alinhado, a ficha de podologia não exibirá a opção de download em Word (.doc), concentrando a usabilidade puramente no PDF de alta fidelidade visual (com as marcações SVG e assinaturas digitais).

---

## Proposed Changes

### Componentes Frontend

#### [MODIFY] [AnamnesePodologiaForm.tsx](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/components/clientes/AnamnesePodologiaForm.tsx)
1. Criar a função `handlePrintPdf` no componente:
   - Formatar o nome do paciente removendo acentos e espaços por underscores.
   - Formatar a data atual no padrão DD_MM_AAAA.
   - Definir temporariamente `document.title` como `avaliacao_podologia_[nome]_[data]`.
   - Executar `window.print()`.
   - Restaurar o título original do documento após 1 segundo.
2. Adicionar o botão "Imprimir PDF" no cabeçalho do formulário ao lado do botão de salvar, usando ícone adequado e mantendo os padrões estéticos premium.

---

## Verification Plan

### Manual Verification
1. Abrir a Ficha de Anamnese de Podologia de um cliente de teste (ex: "Bruno Martins").
2. Clicar em "Imprimir PDF".
3. Verificar se a janela de impressão nativa do navegador abre e se o nome do arquivo sugerido padrão para salvar em PDF segue a nomenclatura `avaliacao_podologia_bruno_martins_17_06_2026.pdf`.
4. Cancelar/Confirmar e certificar-se de que o título da aba do navegador foi restaurado para o título original ("Clientes | Agenda+").


---
← Voltar para [[Sessão - Plano de Implementação- Exportação Inteligente em PDF (Podologia) (a4982d5f)]]