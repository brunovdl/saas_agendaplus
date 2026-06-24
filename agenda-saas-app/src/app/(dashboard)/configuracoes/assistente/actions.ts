'use server';

export async function melhorarDescricaoComIA(descricaoOriginal: string) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return {
      error: 'Chave de API do Groq não configurada. Por favor, adicione a variável GROQ_API_KEY no arquivo .env.local.',
    };
  }

  const textoOriginal = (descricaoOriginal || '').trim();

  if (textoOriginal === '') {
    return {
      error: 'Insira um texto inicial no campo de descrição para que a IA possa melhorá-lo.',
    };
  }

  if (textoOriginal.length > 1000) {
    return {
      error: 'O texto excede o limite máximo de 1000 caracteres.',
    };
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'Você é um assistente especialista em reescrever descrições de negócios. O seu objetivo é estruturar e reescrever a descrição do negócio do usuário de forma muito profissional, acolhedora e direta, ideal para que um robô/assistente virtual de WhatsApp entenda e atenda aos clientes de maneira exemplar.\n\nRegras de escrita:\n1. Estruture em tópicos curtos e claros (ex: Sobre Nós, Diferenciais, Serviços Prestados, Regras/Políticas, Localização, etc.).\n2. Baseie-se estritamente nas informações fornecidas pelo usuário. NUNCA invente informações fictícias (ex: endereços falsos, telefones falsos, preços ou horários que não foram informados).\n3. O texto final gerado DEVE ter no máximo 950 caracteres para garantir que caiba no limite do formulário. Seja conciso e polido.',
          },
          {
            role: 'user',
            content: `Reescreva a seguinte descrição do meu negócio:\n\n"${textoOriginal}"`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Groq API Error]', errorData);
      return {
        error: `Erro na API do Groq: ${response.statusText} (${response.status})`,
      };
    }

    const data = await response.json();
    const descricaoSugerida = data?.choices?.[0]?.message?.content?.trim();

    if (!descricaoSugerida) {
      return {
        error: 'A IA retornou uma resposta vazia. Tente reescrever de outra forma.',
      };
    }

    return {
      success: true,
      descricaoSugerida,
    };
  } catch (error: any) {
    console.error('[Groq Request Exception]', error);
    return {
      error: 'Não foi possível se comunicar com o serviço da IA. Verifique sua conexão ou tente novamente mais tarde.',
    };
  }
}
