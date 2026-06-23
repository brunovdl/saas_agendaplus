import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!webhookSecret) {
    console.error('[Stripe Webhook] A variável STRIPE_WEBHOOK_SECRET não está configurada.');
    return NextResponse.json({ error: 'Configuração ausente.' }, { status: 500 });
  }

  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Assinatura ausente.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Assinatura inválida.';
    console.error(`[Stripe Webhook Error] Assinatura inválida: ${msg}`);
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      // 1. Checkout finalizado
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const prestadorId = session.metadata?.prestador_id;
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;

        if (prestadorId) {
          // Atualiza as chaves do Stripe no banco do prestador
          await supabase
            .from('prestadores')
            .update({
              stripe_customer_id: stripeCustomerId,
              stripe_subscription_id: stripeSubscriptionId,
            })
            .eq('id', prestadorId);
          console.log(`[Stripe Webhook] Checkout finalizado para o prestador: ${prestadorId}`);
        }
        break;
      }

      // 2. Assinatura criada, atualizada ou excluída
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscription = event.data.object as any;
        const stripeCustomerId = subscription.customer as string;
        const stripeSubscriptionId = subscription.id;
        const status = subscription.status; // active, trialing, past_due, canceled, unpaid

        // Identifica o plano com base no priceId
        const priceId = subscription.items.data[0]?.price.id;
        let tier = 'free_trial';

        if (priceId === process.env.STRIPE_PRICE_NORMAL_ID) {
          tier = 'normal';
        } else if (priceId === process.env.STRIPE_PRICE_COMPLETE_ID) {
          tier = 'complete';
        } else {
          // Fallback caso não bata com os IDs de produção (ex: test mode)
          tier = 'complete';
        }

        const subscriptionEndsAt = new Date(subscription.current_period_end * 1000).toISOString();
        const trialEndsAt = subscription.trial_end 
          ? new Date(subscription.trial_end * 1000).toISOString() 
          : null;

        // Atualiza os dados de acesso do prestador buscando pelo stripe_customer_id ou stripe_subscription_id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {
          subscription_status: status,
          subscription_tier: status === 'canceled' ? 'free_trial' : tier,
          subscription_ends_at: subscriptionEndsAt,
        };

        if (trialEndsAt) {
          updateData.trial_ends_at = trialEndsAt;
        }

        // Tentar atualizar por Subscription ID primeiro, se não por Customer ID
        let updateRes = await supabase
          .from('prestadores')
          .update(updateData)
          .eq('stripe_subscription_id', stripeSubscriptionId);

        if (!updateRes.error && (updateRes.count === 0 || updateRes.count === null)) {
          updateRes = await supabase
            .from('prestadores')
            .update({
              ...updateData,
              stripe_subscription_id: stripeSubscriptionId,
            })
            .eq('stripe_customer_id', stripeCustomerId);
        }

        if (updateRes.error) {
          console.error(`[Stripe Webhook] Erro ao sincronizar assinatura ${stripeSubscriptionId}:`, updateRes.error);
        } else {
          console.log(`[Stripe Webhook] Assinatura ${stripeSubscriptionId} atualizada para o status: ${status} (Plano: ${tier})`);
        }
        break;
      }

      // 3. Falha de pagamento
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeCustomerId = invoice.customer as string;

        // Marca como inadimplente (past_due)
        const { error } = await supabase
          .from('prestadores')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_customer_id', stripeCustomerId);

        if (error) {
          console.error(`[Stripe Webhook] Erro ao marcar inadimplência para customer ${stripeCustomerId}:`, error);
        } else {
          console.log(`[Stripe Webhook] Fatura falhou. Status da conta do cliente ${stripeCustomerId} atualizado para past_due.`);
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error(`[Stripe Webhook Processing Error] ${msg}`);
    return NextResponse.json({ error: 'Erro no processamento do webhook.' }, { status: 500 });
  }
}
