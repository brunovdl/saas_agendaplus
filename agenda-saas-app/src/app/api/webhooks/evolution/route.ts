import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log('[Evolution API Webhook Received]', JSON.stringify(payload, null, 2));

    const event = payload.event;
    const instanceName = payload.instance;

    if (!instanceName) {
      return NextResponse.json({ error: 'Falta o campo instance no payload.' }, { status: 400 });
    }

    // Processar apenas atualizações de conexão
    if (event === 'connection.update') {
      const state = payload.data?.state;
      const userJid = payload.data?.user?.id || payload.data?.user?.jid || '';
      
      // Limpar o JID do WhatsApp para pegar apenas o número (ex: 5511999999999@s.whatsapp.net -> 5511999999999)
      const numero = userJid ? userJid.split('@')[0] : null;

      let status = 'disconnected';
      if (state === 'open') {
        status = 'connected';
      } else if (state === 'connecting') {
        status = 'connecting';
      } else {
        status = 'disconnected';
      }

      console.log(`[Evolution API Webhook] Atualizando status de ${instanceName} para ${status} (Número: ${numero})`);

      // Criar cliente Supabase Admin (service role) pois a chamada vem de fora sem JWT do prestador
      const supabase = createAdminClient();

      const { data, error } = await supabase
        .from('prestadores')
        .update({
          whatsapp_status: status,
          whatsapp_numero: status === 'connected' ? numero : null,
        })
        .eq('whatsapp_instance_name', instanceName)
        .select('id, nome_negocio');

      if (error) {
        console.error('[Evolution API Webhook Update Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log('[Evolution API Webhook Sync Success]', data);
      return NextResponse.json({ success: true, updated: data });
    }

    // Outros eventos (ex: mensagens recebidas) podem ser ignorados aqui e tratados no n8n diretamente
    return NextResponse.json({ success: true, message: 'Evento ignorado no webhook do sistema de agenda.' });
  } catch (err: any) {
    console.error('[Evolution API Webhook Route Crash]', err);
    return NextResponse.json({ error: err.message || err }, { status: 500 });
  }
}
