# Plano de Implementação — Ficha de Impressão da Podologia com Diagramas

Este plano descreve as modificações necessárias para tornar a ficha de anamnese de podologia na versão de impressão (PDF) visualmente idêntica à do preenchimento no sistema, incorporando todos os diagramas anatômicos, mapas de sensibilidade, formatos de unhas e dados clínicos em um layout premium e com paginação controlada.

## User Review Required

> [!NOTE]
> Com base nas respostas fornecidas no `/grill-me`, o layout de impressão apresentará:
> 1. Todas as opções de **Tipo de Pisada** e **Formato de Unha** dispostas em grids compactos, destacando visualmente em azul a opção selecionada.
> 2. O **Mapa Anatômico dos Pés** completo em SVG com todos os 10 pontos de teste do monofilamento destacados em Verde (Normal) ou Vermelho (Sensibilidade Reduzida), com legenda de cores.
> 3. Controle rígido de quebra de páginas físicas (A4) com classes CSS para evitar que tabelas ou diagramas sejam cortados ao meio na impressão.

---

## Propostas de Alterações

### Agenda+ SaaS — Aplicação

---

#### [MODIFY] [ClientePerfilView.tsx](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/components/clientes/ClientePerfilView.tsx)

Substituir o bloco de renderização exclusivo de impressão para podologia (linhas 839 a 971) por uma estrutura de visualização de 3 páginas de impressão controladas, com os seguintes componentes visuais:

##### Página 1: Dados Cadastrais, Hábitos e Histórico Clínico
- **Cabeçalho Agenda+:** Logo (ou texto estilizado da Martins AI Automation), data e hora da emissão do relatório.
- **Identificação do Paciente:** Nome, telefone, e-mail, data de nascimento e idade atual calculada.
- **1. Queixa Principal e Hábitos:** Grid estilizado com a queixa principal em destaque, frequência no podólogo, hábitos de fumo, numeração e tipo de calçados diários, uso de palmilhas e prática de exercícios físicos.
- **2. Histórico Clínico & Patologias:** 
  - Grid com todas as 18 patologias clínicas da ficha, exibindo-as como marcadas/desmarcadas por meio de ícones de *checkboxes* visualmente agradáveis.
  - Subseção de Diabetes e Dieta Hídrica com seus respectivos detalhes (taxa glicêmica, data do exame, uso de insulina, e observações alimentares) em caixas de destaque.

##### Página 2: Exame Físico e Unhas & Pele
- **3. Exame Físico:**
  - **Tipo de Pisada:** Renderização dos 3 SVGs de pegada dos pés (Cavo/Supinado, Normal/Neutro, Plano/Pronado) lado a lado, com a opção ativa do paciente destacada com preenchimento em azul brilhante e borda contrastante.
  - **Deformidades dos Dedos:** Tabela com as 5 deformidades dos dedos (Flexível, Rígido, Espalmado, Martelo, Queda) com sinalizadores preenchidos para Pé Direito e Pé Esquerdo.
  - **Dados de Marcha, Joelho e Sensibilidade:** Tipo de marcha, joelho, sensibilidade geral à dor e articulações afetadas representadas em layout tabular.
- **4. Alterações Dermatológicas & Calos:**
  - **Formato das Unhas:** Grid compacto com os 8 formatos de unhas cadastrados (A a H), destacando em azul a forma selecionada e exibindo de forma clara quais artelhos do Pé Direito (PD) ou Pé Esquerdo (PE) possuem essa curvatura.
  - **Patologias Ungueais e Dermatológicas:** Exibição clara e legível de todas as alterações encontradas nas unhas e pele, juntamente com observações detalhadas de erisipela e outras feridas.

##### Página 3: Testes de Sensibilidade & Assinatura
- **5. Testes de Sensibilidade & Vasculares:**
  - **Mapa Anatômico dos Pés (Monofilamento):** Renderização estática do SVG do contorno do Pé Direito e Pé Esquerdo, marcando os 10 pontos anatômicos específicos de teste em **Verde (Normal)** ou **Vermelho (Reduzido)** com base nos dados salvos do paciente, com uma legenda explicativa.
  - **Teste do Toque e Diapasão:** Tabelas curtas resumindo o resultado do toque leve nos artelhos e da vibração 128Hz no hálux e maléolo.
  - **Pulsos Pediosos & Perfusão:** Coloração do pé/perna, temperatura, tempo de perfusão capilar, edemas e pulsos tibial/dorsal.
- **6. Termo de Responsabilidade & Assinatura:**
  - Termo de consentimento exibindo o nome, CPF e RG do paciente integrados no texto.
  - Área de assinaturas com o desenho da assinatura digital do paciente em Base64 (se houver) ao lado da assinatura do responsável técnico/profissional, simulando os campos originais.

##### CSS de Impressão (`@media print`):
Adicionar no globals.css ou inline um bloco que assegura:
- Margens de impressão de `1.5cm`.
- Estilização em tons de cinza escuro/preto para texto padrão para evitar desgaste de tinta, mas preservando o azul selecionado e os pontos coloridos (verde/vermelho) dos diagramas de pé.
- Quebras de página forçadas nas classes de quebra de página de cada seção.

---

## Plano de Verificação

### Testes Manuais
1. Preencher uma ficha de anamnese podológica de testes no sistema, selecionando formatos de unhas específicos, marcando pontos de monofilamento alterados no mapa do pé, alterando o tipo de pisada e assinando digitalmente.
2. Clicar em "Imprimir PDF" no cabeçalho da Ficha de Podologia.
3. Verificar na janela de pré-visualização de impressão se:
   - Todo o dashboard lateral e botões do sistema foram ocultados.
   - O documento se divide perfeitamente em 3 páginas organizadas.
   - Os SVGs do pé de teste de monofilamento aparecem nas cores corretas (verde e vermelho).
   - O SVG de tipo de pisada selecionada aparece destacado.
   - Os formatos de unhas em grade mostram o selecionado e os artelhos correspondentes.
   - A assinatura desenhada do paciente aparece corretamente.


---
← Voltar para [[Sessão - Plano de Implementação — Ficha de Impressão da Podologia com Diagramas (27df3bbf)]]