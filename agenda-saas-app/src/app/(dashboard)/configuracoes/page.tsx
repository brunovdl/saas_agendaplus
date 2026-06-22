'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface ProfileData {
  full_name: string;
  email: string;
  email_digests: boolean;
  push_alerts: boolean;
  marketing_updates: boolean;
  compact_density: boolean;
  theme: string;
  webhook_url: string;
}

// ─── Componente de Toggle ─────────────────────────────────────────────────────
function Toggle({ id, checked, onChange }: { id: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
        checked ? 'bg-[#00D4FF] focus:ring-[#00D4FF]' : 'bg-[#E0E3E7] focus:ring-[#76767F]'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ConfiguracoesPage() {
  const supabase = createClient();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    email: '',
    email_digests: true,
    push_alerts: true,
    marketing_updates: false,
    compact_density: false,
    theme: 'light',
    webhook_url: '',
  });
  const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ─── Estados da Senha ──────────────────────────────────────────────────────
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // ─── Estados de Exclusão da Conta ──────────────────────────────────────────
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ─── Estados de Teste de Webhook ───────────────────────────────────────────
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  // ─── Carregar perfil do usuário autenticado ────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('full_name, email_digests, push_alerts, marketing_updates, compact_density, theme, webhook_url')
        .eq('id', user.id)
        .single();

      const profileObj: ProfileData = {
        full_name: data?.full_name ?? '',
        email: user.email ?? '',
        email_digests: data?.email_digests ?? true,
        push_alerts: data?.push_alerts ?? true,
        marketing_updates: data?.marketing_updates ?? false,
        compact_density: data?.compact_density ?? false,
        theme: data?.theme ?? 'light',
        webhook_url: data?.webhook_url ?? '',
      };

      setProfile(profileObj);
      setOriginalProfile(profileObj);
    };
    fetchProfile();
  }, [supabase]);

  // ─── Salvar alterações ────────────────────────────────────────────────────
  const handleSave = () => {
    setSaveSuccess(false);
    setSaveError(null);

    startTransition(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          email_digests: profile.email_digests,
          push_alerts: profile.push_alerts,
          marketing_updates: profile.marketing_updates,
          compact_density: profile.compact_density,
          theme: profile.theme,
          webhook_url: profile.webhook_url || null,
        })
        .eq('id', user.id);

      if (error) {
        setSaveError('Erro ao salvar as configurações. Tente novamente.');
      } else {
        setOriginalProfile(profile);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    });
  };

  // ─── Alterar senha ────────────────────────────────────────────────────────
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(false);
    setPasswordError(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordError(error.message || 'Erro ao atualizar a senha.');
    } else {
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordSuccess(false);
      }, 3000);
    }
  };

  // ─── Excluir Conta ────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    setDeleteError(null);
    if (confirmDeleteText !== 'EXCLUIR') {
      setDeleteError('Por favor, digite EXCLUIR para confirmar.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (profileError) {
      setDeleteError('Erro ao excluir os dados do perfil. Tente novamente.');
      return;
    }

    await supabase.auth.signOut();
    window.location.href = '/';
  };

  // ─── Testar Webhook ───────────────────────────────────────────────────────
  const handleTestWebhook = async () => {
    if (!profile.webhook_url) return;
    setIsTestingWebhook(true);
    setTestResult(null);

    try {
      const res = await fetch(profile.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'ping', test: true, timestamp: new Date().toISOString() }),
      });

      if (res.ok || res.status === 200) {
        setTestResult({ success: true, msg: 'Conexão bem-sucedida! Webhook respondeu OK.' });
      } else {
        setTestResult({ success: false, msg: `Falha na conexão: HTTP ${res.status}` });
      }
    } catch (err: any) {
      setTestResult({ success: false, msg: `Erro de rede: ${err.message || 'não foi possível alcançar a URL'}` });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const hasChanges = originalProfile ? (
    profile.full_name !== originalProfile.full_name ||
    profile.email_digests !== originalProfile.email_digests ||
    profile.push_alerts !== originalProfile.push_alerts ||
    profile.marketing_updates !== originalProfile.marketing_updates ||
    profile.compact_density !== originalProfile.compact_density ||
    profile.theme !== originalProfile.theme ||
    profile.webhook_url !== originalProfile.webhook_url
  ) : false;

  return (
    <div className="flex-1 overflow-y-auto w-full">
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <header className="hidden md:flex justify-between items-center px-8 py-6 border-b border-[#C6C6CF]/20 bg-white sticky top-0 z-20 shadow-sm">
        <div>
          <h2 className="text-[32px] font-bold leading-[1.3] text-[#0D1B3E]">Configurações</h2>
          <p className="text-sm text-[#45464E] mt-1">Gerencie suas preferências de conta, integrações e notificações.</p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 animate-fade-in">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
              Salvo com sucesso!
            </span>
          )}
          {saveError && (
            <span className="text-sm font-semibold text-[#BA1A1A]">{saveError}</span>
          )}
          <button
            onClick={handleSave}
            disabled={isPending || !hasChanges}
            className="btn-primary px-6 py-2.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </header>

      {/* ─── Conteúdo ─────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 space-y-10 pb-20">

        {/* ─── Conta ──────────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold text-[#0D1B3E] mb-4">Conta</h2>
          <div className="card overflow-hidden">

            {/* Avatar + Campos */}
            <div className="p-6 border-b border-[#C6C6CF]/30 flex items-start gap-6">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full bg-[#EBEEF2] border border-[#C6C6CF] overflow-hidden flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#0D1B3E]">
                    {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 bg-white border border-[#C6C6CF] rounded-full p-1 shadow-sm text-[#0D1B3E] hover:text-[#00D4FF] transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="full_name" className="label">
                    Nome Completo
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                    className="input"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="label">
                    Endereço de E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profile.email}
                    readOnly
                    className="input bg-[#F1F4F8] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Senha */}
            <div className="p-5 border-b border-[#C6C6CF]/30 hover:bg-[#F7FAFE] transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#0D1B3E]">Senha</h3>
                  <p className="text-xs text-[#45464E] mt-1">Altere sua senha de acesso à conta.</p>
                </div>
                <button
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className="btn-outline px-4 py-2"
                >
                  {isChangingPassword ? 'Cancelar' : 'Atualizar'}
                </button>
              </div>

              {isChangingPassword && (
                <form onSubmit={handleUpdatePassword} className="mt-4 pt-4 border-t border-[#C6C6CF]/20 max-w-md space-y-4 animate-fade-in">
                  <div>
                    <label htmlFor="new_password" className="label text-xs">
                      Nova Senha
                    </label>
                    <input
                      id="new_password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      className="input"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm_password" className="label text-xs">
                      Confirmar Nova Senha
                    </label>
                    <input
                      id="confirm_password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Digite novamente"
                      required
                      className="input"
                    />
                  </div>
                  {passwordError && (
                    <p className="text-xs text-[#BA1A1A] font-semibold">{passwordError}</p>
                  )}
                  {passwordSuccess && (
                    <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      ✓ Senha atualizada com sucesso!
                    </p>
                  )}
                  <button
                    type="submit"
                    className="btn-primary px-4 py-2 text-xs"
                  >
                    Confirmar Alteração
                  </button>
                </form>
              )}
            </div>

            {/* Excluir conta */}
            <div className="p-5 hover:bg-[#F7FAFE] transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#BA1A1A]">Excluir Conta</h3>
                  <p className="text-xs text-[#45464E] mt-1">Remova permanentemente sua conta e todos os dados.</p>
                </div>
                <button
                  onClick={() => setIsDeletingAccount(!isDeletingAccount)}
                  className="btn-outline-danger px-4 py-2"
                >
                  {isDeletingAccount ? 'Cancelar' : 'Excluir'}
                </button>
              </div>

              {isDeletingAccount && (
                <div className="mt-4 pt-4 border-t border-[#BA1A1A]/20 max-w-md space-y-4 animate-fade-in">
                  <div className="bg-[#BA1A1A]/5 border border-[#BA1A1A]/20 rounded-lg p-4 text-xs text-[#BA1A1A]">
                    <strong>Atenção:</strong> Esta ação é irreversível. Todos os seus dados, incluindo agendamentos e clientes associados, serão permanentemente excluídos.
                  </div>
                  <div>
                    <label htmlFor="confirm_delete" className="label text-xs">
                      Digite <strong>EXCLUIR</strong> para confirmar:
                    </label>
                    <input
                      id="confirm_delete"
                      type="text"
                      value={confirmDeleteText}
                      onChange={(e) => setConfirmDeleteText(e.target.value)}
                      placeholder="EXCLUIR"
                      className="input focus:border-[#BA1A1A] focus:ring-[#BA1A1A]/30"
                    />
                  </div>
                  {deleteError && (
                    <p className="text-xs text-[#BA1A1A] font-semibold">{deleteError}</p>
                  )}
                  <button
                    onClick={handleDeleteAccount}
                    disabled={confirmDeleteText !== 'EXCLUIR'}
                    className="px-4 py-2 bg-[#BA1A1A] text-white font-bold text-xs rounded-[6px] hover:bg-[#991B1B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Excluir Permanentemente
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── Notificações ───────────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold text-[#0D1B3E] mb-4">Notificações</h2>
          <div className="card overflow-hidden divide-y divide-[#C6C6CF]/30">
            {[
              {
                id: 'email-digests',
                icon: (
                  <svg className="w-5 h-5 text-[#45464E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                ),
                title: 'Resumos por E-mail',
                desc: 'Receba resumos diários dos seus agendamentos e automações.',
                value: profile.email_digests,
                onChange: (val: boolean) => setProfile((p) => ({ ...p, email_digests: val })),
              },
              {
                id: 'push-alerts',
                icon: (
                  <svg className="w-5 h-5 text-[#45464E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                ),
                title: 'Alertas Push Urgentes',
                desc: 'Notificações imediatas para conflitos e lembretes do assistente de IA.',
                value: profile.push_alerts,
                onChange: (val: boolean) => setProfile((p) => ({ ...p, push_alerts: val })),
              },
              {
                id: 'marketing',
                icon: (
                  <svg className="w-5 h-5 text-[#45464E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                  </svg>
                ),
                title: 'Atualizações de Marketing',
                desc: 'Novidades sobre funcionalidades e atualizações do produto.',
                value: profile.marketing_updates,
                onChange: (val: boolean) => setProfile((p) => ({ ...p, marketing_updates: val })),
              },
            ].map((item) => (
              <div key={item.id} className="p-5 flex items-start justify-between">
                <div className="flex items-start gap-3 pr-4">
                  <span className="mt-0.5">{item.icon}</span>
                  <div>
                    <h3 className="font-bold text-sm text-[#0D1B3E]">{item.title}</h3>
                    <p className="text-xs text-[#45464E] mt-1">{item.desc}</p>
                  </div>
                </div>
                <Toggle id={item.id} checked={item.value} onChange={item.onChange} />
              </div>
            ))}
          </div>
        </section>

        {/* ─── Integrações ────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold text-[#0D1B3E] mb-4">Integrações</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* n8n — Webhook */}
            <div className="card p-5 border border-[#C6C6CF]/20 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-[#EBEEF2] rounded-lg flex items-center justify-center border border-[#C6C6CF]/30">
                  <svg className="w-5 h-5 text-[#FF6D42]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
                  </svg>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${profile.webhook_url ? 'bg-green-50 text-green-700' : 'bg-[#EBEEF2] text-[#45464E]'}`}>
                  {profile.webhook_url ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#0D1B3E] mb-1">Webhook de Integração</h3>
              <p className="text-xs text-[#45464E] flex-1 mb-4">Eventos de agendamento são emitidos automaticamente para sua URL externa via Edge Function.</p>
              
              <div className="space-y-3 mt-2">
                <div>
                  <label htmlFor="webhook_url" className="label text-xs">
                    URL de Destino
                  </label>
                  <input
                    id="webhook_url"
                    type="url"
                    value={profile.webhook_url}
                    onChange={(e) => setProfile((p) => ({ ...p, webhook_url: e.target.value }))}
                    placeholder="https://seu-sistema.com/webhook/..."
                    className="input text-xs"
                  />
                </div>
                {profile.webhook_url && !/^(https?:\/\/)/.test(profile.webhook_url) && (
                  <p className="text-[10px] text-[#BA1A1A] font-semibold">Insira um formato de URL válido (ex: https://...).</p>
                )}
                {profile.webhook_url && /^(https?:\/\/)/.test(profile.webhook_url) && (
                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      onClick={handleTestWebhook}
                      disabled={isTestingWebhook}
                      type="button"
                      className="btn-outline w-full py-1.5 text-xs disabled:opacity-50"
                    >
                      {isTestingWebhook ? 'Testando...' : 'Testar Conexão'}
                    </button>
                    {testResult && (
                      <p className={`text-[10px] font-semibold ${testResult.success ? 'text-emerald-600' : 'text-[#BA1A1A]'}`}>
                        {testResult.success ? '✓' : '✗'} {testResult.msg}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* WhatsApp (Secretária Virtual) */}
            <div className="card p-5 border border-[#C6C6CF]/20 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-[#EBEEF2] rounded-lg flex items-center justify-center border border-[#C6C6CF]/30">
                  <svg className="w-5 h-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <span className="bg-[#E8F5E9] text-[#2E7D32] text-xs font-bold px-2 py-1 rounded-full">Integrado</span>
              </div>
              <h3 className="font-bold text-sm text-[#0D1B3E] mb-1">WhatsApp (Secretária Virtual)</h3>
              <p className="text-xs text-[#45464E] flex-1 mb-4">Lembretes, confirmações e agendamentos automáticos gerenciados pela nossa assistente virtual de IA diretamente no WhatsApp.</p>
              <button 
                onClick={() => router.push('/configuracoes/assistente')}
                className="btn-primary w-full py-2"
              >
                Configurar Assistente
              </button>
            </div>
          </div>
        </section>

        {/* ─── Aparência ──────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold text-[#0D1B3E] mb-4">Aparência</h2>
          <div className="card overflow-hidden">
            {/* Tema */}
            <div className="p-5 border-b border-[#C6C6CF]/30">
              <h3 className="font-bold text-sm text-[#0D1B3E] mb-3">Tema Preferido</h3>
              <div className="flex gap-4">
                <label className="cursor-pointer group">
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={profile.theme === 'light'}
                    onChange={() => setProfile((p) => ({ ...p, theme: 'light' }))}
                    className="sr-only peer"
                  />
                  <div className={`w-24 h-16 bg-[#F4F7FB] border-2 rounded-lg relative overflow-hidden transition-all ${
                    profile.theme === 'light' ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20' : 'border-[#C6C6CF]'
                  }`}>
                    <div className="absolute top-2 left-2 w-12 h-2 bg-[#E8ECF0] rounded" />
                    <div className="absolute top-6 left-2 w-8 h-2 bg-[#0D1B3E] rounded" />
                  </div>
                  <span className="block text-center mt-2 font-bold text-xs text-[#45464E] group-hover:text-[#0D1B3E] transition-colors">Light</span>
                </label>
                <label className="cursor-pointer group">
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={profile.theme === 'dark'}
                    onChange={() => setProfile((p) => ({ ...p, theme: 'dark' }))}
                    className="sr-only peer"
                  />
                  <div className={`w-24 h-16 bg-[#0D1B3E] border-2 rounded-lg relative overflow-hidden transition-all ${
                    profile.theme === 'dark' ? 'border-[#00D4FF] ring-2 ring-[#00D4FF]/20' : 'border-[#C6C6CF]'
                  }`}>
                    <div className="absolute top-2 left-2 w-12 h-2 bg-[#39456b] rounded" />
                    <div className="absolute top-6 left-2 w-8 h-2 bg-[#00D4FF] rounded" />
                  </div>
                  <span className="block text-center mt-2 font-bold text-xs text-[#45464E] group-hover:text-[#00D4FF] transition-colors">Dark</span>
                </label>
              </div>
            </div>

            {/* Densidade compacta */}
            <div className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#0D1B3E]">Densidade Compacta</h3>
                <p className="text-xs text-[#45464E] mt-1">Reduz espaçamento em tabelas e listas para exibir mais dados na tela.</p>
              </div>
              <Toggle
                id="compact-density"
                checked={profile.compact_density}
                onChange={(val) => setProfile((p) => ({ ...p, compact_density: val }))}
              />
            </div>
          </div>
        </section>

        {/* ─── Botão Salvar (Mobile) ───────────────────────────────────────── */}
        <div className="flex justify-end pt-2 md:hidden">
          <button
            onClick={handleSave}
            disabled={isPending || !hasChanges}
            className="btn-primary px-6 py-3 shadow-sm disabled:opacity-50"
          >
            {isPending ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
