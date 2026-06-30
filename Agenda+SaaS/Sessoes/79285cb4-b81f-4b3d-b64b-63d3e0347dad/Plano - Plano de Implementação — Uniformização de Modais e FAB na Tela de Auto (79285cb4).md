# Plano de Implementação — Uniformização de Modais e FAB na Tela de Auto

Este plano descreve o alinhamento visual do modal de agendamento com o padrão de Novo Cliente (modal clássico centralizado) e a implementação de um botão flutuante (FAB) na tela de Auto (Listagem de Agendamentos).

## Proposed Changes

### Agenda e Calendário

#### [MODIFY] [AgendaCalendar.tsx](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/components/agenda/AgendaCalendar.tsx)
- Importar o ícone `X` de `lucide-react` para uso no cabeçalho do modal.
- Alterar o contêiner do modal (`isModalOpen`) para cobrir a tela inteira (`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in`) em vez da gaveta de mobile.
- Ajustar a estilização do card do modal para `bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] w-full max-w-md overflow-hidden relative border border-[#C6C6CF]/20 max-h-[90dvh] flex flex-col` (exatamente igual ao de Novo Cliente).
- Atualizar o header do modal para ter o padding `px-6 py-4 border-b border-[#C6C6CF]/20 flex justify-between items-center bg-[#F8FAFC]` e remover o drag handle visual do mobile.
- Substituir o botão de fechar (`✕`) pelo botão com o componente `<X size={20} />` de `lucide-react`.

### Telas e Rotas

#### [MODIFY] [page.tsx](file:///c:/Users/Bruno%20Martins/Desktop/Agenda+%20SaaS/agenda-saas-app/src/app/(dashboard)/agendamentos/page.tsx)
- Importar `Plus` de `lucide-react`.
- Ocultar o botão superior "+ Novo Agendamento" em mobile mudando o contêiner para `hidden md:flex`.
- Adicionar o botão flutuante (FAB) como `<Link href="/agendamentos/novo" className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-[#00D4FF] hover:bg-[#00A8CC] text-[#0D1B3E] rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all" />`.

## Verification Plan

### Manual Verification
- Acessar a tela de Agenda e abrir o modal de Novo Agendamento em mobile e desktop para verificar se ele abre centralizado e idêntico ao de Novo Cliente.
- Acessar a tela de Auto (Meus Agendamentos) no mobile e verificar se o botão superior sumiu e se o FAB flutua no canto inferior direito redirecionando para `/agendamentos/novo`.
- Validar a compilação do Next.js com `npm run build`.


---
← Voltar para [[Sessão - Plano de Implementação — Uniformização de Modais e FAB na Tela de Auto (79285cb4)]]