'use server';

import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

/**
 * Cria uma sessão de checkout do Stripe para contratação de um plano.
 */
export async function createCheckoutSessionAction(priceId: string) {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user || !authData.user.email) {
    return { error: 'Você precisa estar logado para realizar esta ação.' };
  }

  const userId = authData.user.id;

  // 1. Buscar dados do prestador
  const { data: prestador, error: prestadorErr } = await supabase
    .from('prestadores')
    .select('id, nome_negocio, stripe_customer_id')
    .eq('id', userId)
    .single();

  if (prestadorErr || !prestador) {
    return { error: 'Prestador não encontrado no banco de dados.' };
  }

  let stripeCustomerId = prestador.stripe_customer_id;

  // 2. Se não possuir Customer ID, cria um cliente no Stripe
  if (!stripeCustomerId) {
    try {
      const customer = await stripe.customers.create({
        email: authData.user.email,
        name: prestador.nome_negocio || 'Prestador Agenda+',
        metadata: {
          prestador_id: userId,
        },
      });
      stripeCustomerId = customer.id;

      // Salva no banco de dados
      await supabase
        .from('prestadores')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);
    } catch (err: any) {
      console.error('[Stripe create customer error]', err);
      return { error: `Falha ao registrar cliente no gateway de pagamento: ${err.message}` };
    }
  }

  // 3. Criar a sessão de Checkout
  try {
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/agenda?checkout_success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/planos`,
      metadata: {
        prestador_id: userId,
      },
    });

    return { url: session.url };
  } catch (err: any) {
    console.error('[Stripe create checkout session error]', err);
    return { error: `Erro de integração ao criar sessão de pagamento: ${err.message}` };
  }
}

/**
 * Cria uma sessão do Stripe Customer Portal para gerenciar faturas, cartões ou cancelamentos.
 */
export async function createPortalSessionAction() {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { error: 'Não autenticado.' };
  }

  const userId = authData.user.id;

  const { data: prestador } = await supabase
    .from('prestadores')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (!prestador?.stripe_customer_id) {
    return { error: 'Você ainda não possui uma assinatura ativa ou faturamento configurado no Stripe.' };
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: prestador.stripe_customer_id,
      return_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/configuracoes`,
    });

    return { url: session.url };
  } catch (err: any) {
    console.error('[Stripe create portal session error]', err);
    return { error: `Falha ao abrir portal de faturamento: ${err.message}` };
  }
}
