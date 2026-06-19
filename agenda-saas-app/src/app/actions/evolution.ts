'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

// Função auxiliar para sanitizar o ID do usuário como nome de instância válido
function getCleanInstanceName(userId: string) {
  return `instancia_${userId.replace(/[^a-zA-Z0-9]/g, '')}`;
}

/**
 * Cria a instância na Evolution API (se necessário) e retorna o QR Code em base64.
 */
export async function connectWhatsAppAction() {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { error: 'Você precisa estar logado para conectar o WhatsApp.' };
  }

  const userId = authData.user.id;
  const instanceName = getCleanInstanceName(userId);

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    return { error: 'Evolution API não está configurada no servidor (.env.local).' };
  }

  try {
    // 1. Tentar criar a instância
    const createRes = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        instanceName,
        token: userId, // Usamos o ID do usuário como token da instância
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      }),
    });

    const createData = await createRes.json();
    console.log('[Evolution API Create Instance Response]', createData);

    // Se já existia ou foi criada, vamos atualizar o banco para status 'connecting'
    await supabase
      .from('prestadores')
      .update({
        whatsapp_status: 'connecting',
        whatsapp_instance_name: instanceName,
      })
      .eq('id', userId);

    // 2. Buscar o QR Code de conexão
    const connectRes = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': EVOLUTION_API_KEY,
      },
    });

    const connectData = await connectRes.json();
    console.log('[Evolution API Connect Response]', connectData);

    if (connectData.base64) {
      return { qrcode: connectData.base64 };
    } else if (connectData.code) {
      // Alguns retornos da Evolution API vêm no campo 'code' contendo o base64 ou a string crua
      const qr = connectData.code.startsWith('data:image') 
        ? connectData.code 
        : `data:image/png;base64,${connectData.code}`;
      return { qrcode: qr };
    }

    // Se retornar instabilidade ou disser que já está conectado
    if (connectData.instance?.state === 'open' || connectData.status === 'open') {
      await supabase
        .from('prestadores')
        .update({
          whatsapp_status: 'connected',
        })
        .eq('id', userId);
      
      revalidatePath('/configuracoes/assistente');
      return { alreadyConnected: true };
    }

    return { error: 'Não foi possível gerar o QR Code. Verifique se o serviço está online.' };
  } catch (err: any) {
    console.error('[Evolution API Connection Action Error]', err);
    return { error: `Erro de rede ao conectar com Evolution API: ${err.message || err}` };
  }
}

/**
 * Consulta a Evolution API para validar se a conexão está ativa e atualiza o Supabase.
 */
export async function checkWhatsAppConnectionAction() {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { error: 'Não autenticado.' };
  }

  const userId = authData.user.id;
  const instanceName = getCleanInstanceName(userId);

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    return { error: 'Evolution API não configurada.' };
  }

  try {
    const res = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': EVOLUTION_API_KEY,
      },
    });

    const data = await res.json();
    console.log('[Evolution API Connection State Response]', data);

    const state = data.instance?.state || data.status;

    if (state === 'open') {
      // Buscar também informações da instância para tentar pegar o número de telefone
      let numero = null;
      try {
        const profileRes = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`, {
          method: 'GET',
          headers: { 'apikey': EVOLUTION_API_KEY }
        });
        const profileData = await profileRes.json();
        // A Evolution API retorna dados do celular conectado no connectionState em alguns formatos
        numero = profileData.instance?.number || null;
      } catch (e) {
        console.error('Erro ao buscar telefone no profile da instância', e);
      }

      await supabase
        .from('prestadores')
        .update({
          whatsapp_status: 'connected',
          whatsapp_numero: numero,
        })
        .eq('id', userId);

      revalidatePath('/configuracoes/assistente');
      return { connected: true, numero };
    } else if (state === 'connecting') {
      return { connected: false, status: 'connecting' };
    } else {
      await supabase
        .from('prestadores')
        .update({
          whatsapp_status: 'disconnected',
          whatsapp_numero: null,
        })
        .eq('id', userId);
      return { connected: false, status: 'disconnected' };
    }
  } catch (err: any) {
    console.error('[Evolution API Check Connection Error]', err);
    return { error: err.message || err };
  }
}

/**
 * Desconecta o WhatsApp da Evolution API e atualiza o Supabase.
 */
export async function disconnectWhatsAppAction() {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { error: 'Não autenticado.' };
  }

  const userId = authData.user.id;
  const instanceName = getCleanInstanceName(userId);

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    return { error: 'Evolution API não configurada.' };
  }

  try {
    // 1. Tentar deletar a instância na Evolution API (assim desconecta e limpa cache)
    const deleteRes = await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
      method: 'DELETE',
      headers: {
        'apikey': EVOLUTION_API_KEY,
      },
    });

    const deleteData = await deleteRes.json();
    console.log('[Evolution API Delete Instance Response]', deleteData);

    // 2. Atualizar o Supabase
    await supabase
      .from('prestadores')
      .update({
        whatsapp_status: 'disconnected',
        whatsapp_numero: null,
        whatsapp_instance_name: null,
      })
      .eq('id', userId);

    revalidatePath('/configuracoes/assistente');
    return { success: true };
  } catch (err: any) {
    console.error('[Evolution API Disconnect Error]', err);
    
    // Mesmo em caso de erro na API de terceiros, forçamos a desconexão no Supabase local do cliente
    await supabase
      .from('prestadores')
      .update({
        whatsapp_status: 'disconnected',
        whatsapp_numero: null,
        whatsapp_instance_name: null,
      })
      .eq('id', userId);

    revalidatePath('/configuracoes/assistente');
    return { success: true, warning: 'Instância desconectada localmente. O servidor externo pode estar offline.' };
  }
}
