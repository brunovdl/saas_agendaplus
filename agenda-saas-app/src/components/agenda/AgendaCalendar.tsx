'use client';

import { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { createClient } from '@/lib/supabase/client';
import type { Agendamento } from '@/types/supabase';
import AgendamentoForm from '@/components/agendamentos/AgendamentoForm';
import { Plus, X } from 'lucide-react';

// Helper de mapeamento de cores dos chips de status para o calendário
const STATUS_COLORS: Record<string, string> = {
  pendente: '#005669',     // secondary
  confirmado: '#1E4DB7',   // blue-main
  remarcado: '#00D4FF',    // cyan-neon
  cancelado: '#ba1a1a',    // error
};

export default function AgendaCalendar() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const calendarRef = useRef<FullCalendar>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchAgendamentos = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;
      setUserId(authData.user.id);

      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .eq('user_id', authData.user.id);

      if (!error && data) {
        setAgendamentos(data);
      }
    };

    fetchAgendamentos();
  }, [supabase]);

  // Realtime Subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('agenda_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agendamentos',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAgendamentos((prev) => [...prev, payload.new as Agendamento]);
          } else if (payload.eventType === 'UPDATE') {
            setAgendamentos((prev) =>
              prev.map((item) => (item.id === payload.new.id ? (payload.new as Agendamento) : item))
            );
          } else if (payload.eventType === 'DELETE') {
            setAgendamentos((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId]);

  // Adapter para FullCalendar Event
  const events = agendamentos.map((item) => ({
    id: item.id,
    title: `${item.cliente_nome} (${item.cliente_telefone})`,
    start: item.data_hora_inicio,
    end: item.data_hora_fim,
    backgroundColor: STATUS_COLORS[item.status] || '#1E4DB7',
    borderColor: 'transparent',
    textColor: '#FFFFFF',
    extendedProps: {
      status: item.status,
      observacoes: item.observacoes,
    },
  }));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>();
  
  // Encontra os dados do agendamento se for edição
  const selectedAgendamento = selectedEventId ? agendamentos.find(a => a.id === selectedEventId) : undefined;

  const handleDateClick = (arg: { dateStr: string }) => {
    // Impede a criação de agendamentos no passado
    if (new Date(arg.dateStr) < new Date()) {
      return;
    }
    setSelectedEventId(undefined);
    setSelectedDate(arg.dateStr); // Ex: "2026-10-04T09:00:00-03:00"
    setIsModalOpen(true);
  };

  const handleEventClick = (arg: { event: { id: string } }) => {
    setSelectedEventId(arg.event.id);
    setSelectedDate(undefined);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDate(undefined);
    setSelectedEventId(undefined);
  };

  return (
    <div className="h-full w-full custom-calendar-wrapper p-2 md:p-4 relative">
      <div style={{ height: '100%' }} className="calendar-scroll-wrapper">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="100%"
          nowIndicator={true}
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          buttonText={{
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia'
          }}
          locale="pt-br"
        />
      </div>

      {/* Modal Overlay — idêntico ao de Novo Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] w-full max-w-md overflow-hidden relative border border-[#C6C6CF]/20 max-h-[90dvh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#C6C6CF]/20 flex justify-between items-center bg-[#F8FAFC]">
              <h3 className="font-bold text-lg text-[#0D1B3E]">
                {selectedEventId 
                  ? (selectedAgendamento && new Date(selectedAgendamento.data_hora_fim) < new Date() 
                      ? 'Consultar Agendamento' 
                      : 'Editar Agendamento') 
                  : 'Novo Agendamento'}
              </h3>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>
            {/* Body com scroll */}
            <div className="p-6 overflow-y-auto flex-1">
              <AgendamentoForm 
                initialData={
                  selectedAgendamento
                    ? { ...selectedAgendamento, observacoes: selectedAgendamento.observacoes ?? undefined }
                    : selectedDate
                    ? { data_hora_inicio: selectedDate, data_hora_fim: selectedDate }
                    : undefined
                }
                onSuccess={handleModalClose}
                onCancel={handleModalClose}
                readOnly={selectedAgendamento ? new Date(selectedAgendamento.data_hora_fim) < new Date() : false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) / Widget flutuante para criar novo agendamento */}
      <button
        onClick={() => {
          setSelectedEventId(undefined);
          setSelectedDate(undefined);
          setIsModalOpen(true);
        }}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 w-14 h-14 bg-[#00D4FF] hover:bg-[#00A8CC] text-[#0D1B3E] rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]"
        title="Novo Agendamento"
        aria-label="Novo Agendamento"
      >
        <Plus size={24} strokeWidth={3} />
      </button>
    </div>
  );
}
