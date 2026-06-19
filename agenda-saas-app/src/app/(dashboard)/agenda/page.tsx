import AgendaCalendar from '@/components/agenda/AgendaCalendar';

export default function AgendaPage() {
  return (
    <div className="h-full flex flex-col">
      <header className="flex justify-between items-center px-8 py-6 bg-white border-b border-gray-200 shrink-0">
        <h2 className="text-2xl font-bold text-[#0D1B3E]">Agenda</h2>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-500 font-medium">Gestão em Tempo Real</p>
        </div>
      </header>

      <div className="flex-1 p-8 overflow-hidden bg-[#F4F7FB] flex flex-col">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 overflow-hidden">
          <AgendaCalendar />
        </div>
      </div>
    </div>
  );
}
