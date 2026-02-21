import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { authApi } from '@/lib/api';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Coins, Save, Lock } from 'lucide-react';
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

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-8">
        <h1 className="text-3xl font-bold">{t('profile:title')}</h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Profile info */}
          <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold text-card-foreground">{t('profile:info')}</h2>

            <div className="space-y-2">
              <Label>{t('profile:username')}</Label>
              <Input value={user.username} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>{t('profile:email')}</Label>
              <Input value={form.email} onChange={updateField('email')} type="email" />
            </div>
            <div className="grid grid-cols-2 gap-3">
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
              <Textarea value={form.bio} onChange={updateField('bio')} rows={3} placeholder={t('profile:bio_placeholder')} />
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {t('profile:save')}
            </Button>
          </form>

          {/* Right column */}
          <div className="space-y-6">
            {/* Credits */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-lg font-semibold text-card-foreground">{t('profile:credits')}</h2>
              <div className="mt-3 flex items-center gap-3">
                <Coins className="h-8 w-8 text-warning" />
                <span className="font-mono text-4xl font-bold text-card-foreground">{user.credits}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t('profile:credit_note')}</p>
            </div>

            {/* Change password */}
            <form onSubmit={handleChangePassword} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-lg font-semibold text-card-foreground">{t('profile:password')}</h2>
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
              <Button type="submit" variant="outline" disabled={pwSaving}>
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
