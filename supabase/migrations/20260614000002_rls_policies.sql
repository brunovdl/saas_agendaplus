ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos FORCE ROW LEVEL SECURITY;

CREATE POLICY "Leitura própria"    ON public.agendamentos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Inserção própria"   ON public.agendamentos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Atualização própria" ON public.agendamentos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Deleção própria"    ON public.agendamentos FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.prestadores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Perfil próprio" ON public.prestadores FOR ALL USING (auth.uid() = id);

-- Mitigando vulnerabilidade de RLS na tabela `documentssn`
ALTER TABLE public.documentssn ENABLE ROW LEVEL SECURITY;
