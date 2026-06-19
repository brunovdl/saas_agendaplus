import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { dispararWebhook } from '../_shared/dispatcher.ts';

serve(async (req: Request) => {
  // Opcional: Validar se quem chama é realmente o nosso banco de dados.
  // Pode-se checar um bearer token que o pg_net envia no header.
  
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const payload = await req.json();
    
    // O pg_net envia a row diretamente como JSON (configurado no trigger row_to_json)
    // Extraindo dados para conformidade com o Contrato do n8n (WebhookMutacaoPayload)
    const webhookData = {
      evento: 'agendamento.atualizado', // Simplificando, poderia inferir de OLD/NEW se passássemos TG_OP
      agendamento_id: payload.id,
      prestador_id: payload.user_id,
      cliente_nome: payload.cliente_nome,
      cliente_telefone: payload.cliente_telefone,
      data_hora_inicio: payload.data_hora_inicio,
      data_hora_fim: payload.data_hora_fim,
      status: payload.status,
    };

    // Dispara o webhook em "Background" no contexto Deno ou aguarda.
    // Como é Edge Function, é seguro usar await para garantir a conclusão antes do encerramento.
    await dispararWebhook('mutacao', webhookData);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Erro na função webhook-mutacao:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
