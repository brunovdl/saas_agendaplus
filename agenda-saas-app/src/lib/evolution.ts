/**
 * Utilitários do Lado do Servidor para a Evolution API.
 * 
 * ⚠️ IMPORTANTE: Este arquivo NÃO é um arquivo de Server Actions ("use server").
 * Ele executa estritamente no lado do servidor e serve para evitar a exposição
 * de lógica interna como endpoints Server Actions públicos.
 */

/**
 * Configura síncronamente o comportamento (settings) e o webhook da instância na Evolution API.
 */
export async function configureInstanceHelper(instanceName: string) {
  const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
  const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
  const webhookUrl = process.env.EVOLUTION_WEBHOOK_URL;

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    console.error('[configureInstanceHelper] Evolution API não está configurada no servidor.');
    return { error: 'Evolution API não configurada.' };
  }

  // 1. Configurar Comportamento (Settings)
  try {
    const settingsRes = await fetch(`${EVOLUTION_API_URL}/settings/set/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        groupsIgnore: true,
        groups_ignore: true,
        rejectCall: true,
        reject_call: true,
        readMessages: true,
        read_messages: true,
      }),
    });
    const settingsData = await settingsRes.json();
    console.log(`[Evolution API Configure Settings Response for ${instanceName}]`, settingsData);
  } catch (settingsErr) {
    console.error(`[Evolution API Configure Settings Error for ${instanceName}]`, settingsErr);
  }

  // 2. Configurar Webhook
  if (webhookUrl) {
    try {
      const webhookRes = await fetch(`${EVOLUTION_API_URL}/webhook/set/${instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          webhook: {
            enabled: true,
            url: webhookUrl,
            byEvents: false,
            events: ['MESSAGES_UPSERT'],
          }
        }),
      });
      const webhookData = await webhookRes.json();
      console.log(`[Evolution API Configure Webhook Response for ${instanceName}]`, webhookData);
    } catch (webhookErr) {
      console.error(`[Evolution API Configure Webhook Error for ${instanceName}]`, webhookErr);
    }
  }
}
