import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { authApi } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Coins, Save, Lock, Mail, AtSign } from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', bio: '' });
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateProfile(form);
      await refreshUser();
      toast.success(t('profile:toast.saved'));
    } catch {
      toast.error(t('profile:toast.save_error'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) {
      toast.error(t('profile:toast.pw_mismatch'));
      return;
    }
    setPwSaving(true);
    try {
      await authApi.changePassword(pwForm.old_password, pwForm.new_password);
      setPwForm({ old_password: '', new_password: '', confirm: '' });
      toast.success(t('profile:toast.pw_saved'));
    } catch {
      toast.error(t('profile:toast.pw_error'));
    } finally {
      setPwSaving(false);
    }
  };

  if (!user) return null;

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username;
  const initials = `${(user.first_name || user.username).charAt(0)}${user.last_name?.charAt(0) || ''}`.toUpperCase();

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1180px] space-y-6 lg:space-y-8">
        <div className="lg:hidden">
          <h1 className="text-3xl font-bold">{t('profile:title')}</h1>
        </div>

        <section className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-6">
          <div className="rounded-[1.75rem] border border-border bg-card p-8 shadow-card">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">{t('profile:title')}</p>
                  <h1 className="mt-3 text-4xl font-bold text-card-foreground">{displayName}</h1>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2 rounded-full border border-border bg-muted/35 px-4 py-2">
                    <AtSign className="h-4 w-4" />
                    {user.username}
                  </span>
                  <span className="flex items-center gap-2 rounded-full border border-border bg-muted/35 px-4 py-2">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </span>
                </div>

                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  {form.bio?.trim() || t('profile:bio_placeholder')}
                </p>
              </div>

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl gradient-primary text-xl font-bold text-primary-foreground shadow-elevated">
                {initials}
              </div>
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-border bg-card p-6 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{t('profile:credits')}</p>
            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-warning">
                <Coins className="h-7 w-7" />
              </div>
              <div>
                <div className="font-mono text-4xl font-bold text-card-foreground">{user.credits}</div>
                <p className="mt-1 text-sm text-muted-foreground">{t('profile:credit_note')}</p>
              </div>
            </div>
          </aside>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          <form onSubmit={handleSave} className="space-y-5 rounded-[1.75rem] border border-border bg-card p-6 shadow-card lg:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">{t('profile:info')}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t('profile:bio_placeholder')}</p>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-border bg-muted/45 px-4 py-2 text-sm font-medium text-muted-foreground lg:flex">
                <AtSign className="h-4 w-4" />
                {user.username}
              </div>
            </div>

            <div className="space-y-2 lg:hidden">
              <Label>{t('profile:username')}</Label>
              <Input value={user.username} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>{t('profile:email')}</Label>
              <Input value={form.email} onChange={updateField('email')} type="email" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('profile:first_name')}</Label>
                <Input value={form.first_name} onChange={updateField('first_name')} />
              </div>
              <div className="space-y-2">
                <Label>{t('profile:last_name')}</Label>
                <Input value={form.last_name} onChange={updateField('last_name')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('profile:bio')}</Label>
              <Textarea value={form.bio} onChange={updateField('bio')} rows={5} placeholder={t('profile:bio_placeholder')} />
            </div>

            <Button type="submit" disabled={saving} className="lg:min-w-52">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {t('profile:save')}
            </Button>
          </form>

          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card lg:hidden">
              <h2 className="text-lg font-semibold text-card-foreground">{t('profile:credits')}</h2>
              <div className="mt-3 flex items-center gap-3">
                <Coins className="h-8 w-8 text-warning" />
                <span className="font-mono text-4xl font-bold text-card-foreground">{user.credits}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t('profile:credit_note')}</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 rounded-[1.75rem] border border-border bg-card p-6 shadow-card lg:p-8">
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">{t('profile:password')}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t('profile:update_password')}</p>
              </div>

              <div className="space-y-2">
                <Label>{t('profile:current_password')}</Label>
                <Input type="password" value={pwForm.old_password} onChange={(e) => setPwForm((p) => ({ ...p, old_password: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>{t('profile:new_password')}</Label>
                <Input type="password" value={pwForm.new_password} onChange={(e) => setPwForm((p) => ({ ...p, new_password: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>{t('profile:confirm_password')}</Label>
                <Input type="password" value={pwForm.confirm} onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))} required />
              </div>
              <Button type="submit" variant="outline" disabled={pwSaving} className="lg:min-w-56">
                {pwSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                {t('profile:update_password')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
