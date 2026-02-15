import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Loader2 } from 'lucide-react';
import authBg from '@/assets/auth-bg.jpg';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', password_confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password_confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err: any) {
      const data = err.response?.data;
      const msg = data ? Object.values(data).flat().join(' ') : 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 lg:block">
        <img src={authBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 gradient-hero opacity-60" />
        <div className="relative z-10 flex h-full flex-col justify-end p-12">
          <h2 className="text-4xl font-bold text-primary-foreground">Start your artistic journey</h2>
          <p className="mt-3 max-w-md text-lg text-primary-foreground/70">
            Get AI-powered feedback on your artwork and track your progress over time.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <Palette className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ArtEval<span className="text-primary">.AI</span></span>
          </div>

          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="mt-1 text-muted-foreground">Start evaluating your art today</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
            )}
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={form.username} onChange={update('username')} placeholder="Choose a username" required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={form.password} onChange={update('password')} placeholder="Min. 8 characters" required />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input type="password" value={form.password_confirm} onChange={update('password_confirm')} placeholder="Repeat password" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
