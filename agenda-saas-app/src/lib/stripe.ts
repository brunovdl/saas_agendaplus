import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  // Não lançamos erro no build time caso a variável ainda não esteja no .env.local de produção,
  // mas avisamos ou tratamos em tempo de execução para evitar falhas de build.
  console.warn('[Stripe SDK] A variável STRIPE_SECRET_KEY não foi encontrada.');
}

export const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2023-10-16' as any,
});
