'use client';

import { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { createClient } from '@/lib/supabase/client';
import type { Agendamento } from '@/types/supabase';
import AgendamentoForm from '@/components/agendamentos/AgendamentoForm';

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
    // Para simplificar a Fase 4, alertamos. Na Fase 5/futuro abrirá o Modal de Criação!
    // Você clicou no horário: arg.dateStr
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
    <div className="h-full w-full custom-calendar-wrapper p-4 relative">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => {
            setSelectedEventId(undefined);
            setSelectedDate(undefined);
            setIsModalOpen(true);
          }}
          className="btn-accent"
        >
          Novo Agendamento
        </button>
      </div>

      <div style={{ height: 'calc(100% - 60px)' }}>
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

      {/* Modal Overlay (Estilo Stitch Design) */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0D1B3E]/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-[#0D1B3E]">
                {selectedEventId ? 'Editar Agendamento' : 'Novo Agendamento'}
              </h2>
              <button className="text-gray-400 hover:text-gray-700" onClick={handleModalClose}>
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
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
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
