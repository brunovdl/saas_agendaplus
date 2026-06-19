// Configuração: URL base do n8n pode vir das variáveis de ambiente
const N8N_URL_MUTACAO = Deno.env.get('N8N_WEBHOOK_URL_MUTACAO') || 'https://n8n.exemplo.com/webhook/mutacao';
const N8N_URL_LEMBRETE = Deno.env.get('N8N_WEBHOOK_URL_LEMBRETE') || 'https://n8n.exemplo.com/webhook/lembrete';

/**
 * Gera um HMAC SHA-256 usando a API nativa Web Crypto do Deno.
 */
async function gerarHMAC(body: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  
  // Converter ArrayBuffer para Hex string
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Dispara o Webhook para o n8n com assinatura HMAC e Retry com Backoff.
 */
export async function dispararWebhook(
  tipo: 'mutacao' | 'lembrete',
  payload: Record<string, any>
): Promise<void> {
  const MAX_RETRIES = 3;
  const url = tipo === 'mutacao' ? N8N_URL_MUTACAO : N8N_URL_LEMBRETE;
  const secret = Deno.env.get('WEBHOOK_SECRET') || 'segredo-padrao-fallback';

  const body = JSON.stringify({ 
    tipo, 
    timestamp: new Date().toISOString(), 
    ...payload 
  });

  const sig = await gerarHMAC(body, secret);

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Webhook-Signature': sig
        },
        body,
        // Em Deno, AbortSignal.timeout(ms) pode ser usado para proteger a Edge Function
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        console.log(`[Webhook] ${tipo} enviado com sucesso. (Tentativas: ${i + 1})`);
        return;
      }
      
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.warn(`[Webhook] Falha na tentativa ${i + 1} para ${tipo}:`, err);
      if (i === MAX_RETRIES - 1) {
        console.error(`[Webhook] Todas as ${MAX_RETRIES} tentativas falharam para ${tipo}.`);
        // Aqui poderia inserir um log na tabela 'webhook_logs' usando Supabase Client.
      } else {
        await delay(500 * (i + 1)); // Backoff linear
      }
    }
  }
}
