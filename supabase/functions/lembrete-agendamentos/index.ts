import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { dispararWebhook } from '../_shared/dispatcher.ts';

serve(async (req: Request) => {
  try {
    // Inicializa cliente Supabase com a Service Role Key para poder fazer updates no banco
    // ignorando o RLS, já que este é um Job de Cron do sistema.
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credenciais não configuradas.');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Busca agendamentos confirmados cuja data de início está a 1 hora a partir de agora
    // e que ainda não tiveram o webhook de lembrete disparado.
    // Usamos now() e now() + 1 hora no postgres. A API RPC ou query precisa filtrar isso.
    // Deno/JS equivalente:
    const now = new Date();
    const umHoraParaFrente = new Date(now.getTime() + 60 * 60 * 1000);

    const { data: agendamentos, error: fetchError } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('status', 'confirmado')
      .eq('webhook_disparado', false)
      .gte('data_hora_inicio', now.toISOString())
      .lte('data_hora_inicio', umHoraParaFrente.toISOString());

    if (fetchError) {
      throw fetchError;
    }

    if (!agendamentos || agendamentos.length === 0) {
      return new Response(JSON.stringify({ message: 'Nenhum lembrete pendente.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log(`[Lembrete] Encontrados ${agendamentos.length} agendamentos para notificar.`);

    // 2. Para cada um, atualiza atômicamente (webhook_disparado = true) para evitar concorrência
    // e caso o update tenha sucesso, dispara o webhook.
    for (const ag of agendamentos) {
      const { data: updatedAgendamento, error: updateError } = await supabase
        .from('agendamentos')
        .update({ webhook_disparado: true })
        .eq('id', ag.id)
        .eq('webhook_disparado', false) // Double check de transação
        .select()
        .single();

      if (updateError || !updatedAgendamento) {
        console.warn(`Falha ao dar lock no agendamento ${ag.id} (Possível duplicidade cron).`);
        continue;
      }

      // 3. Dispara o webhook para o n8n via Dispatcher compartilhado
      const lembretePayload = {
        evento: 'agendamento.lembrete_1h',
        agendamento_id: updatedAgendamento.id,
        cliente_nome: updatedAgendamento.cliente_nome,
        cliente_telefone: updatedAgendamento.cliente_telefone,
        data_hora_inicio: updatedAgendamento.data_hora_inicio,
      };

      await dispararWebhook('lembrete', lembretePayload);
    }

    return new Response(JSON.stringify({ success: true, processed: agendamentos.length }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro no job de lembrete:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
