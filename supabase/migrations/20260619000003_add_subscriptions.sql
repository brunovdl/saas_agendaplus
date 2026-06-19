-- Migration para adicionar controle de assinaturas do Stripe na tabela de prestadores

ALTER TABLE prestadores 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free_trial', -- 'free_trial', 'normal', 'complete'
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing', -- 'trialing', 'active', 'past_due', 'canceled', 'unpaid'
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '14 days'),
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE;
