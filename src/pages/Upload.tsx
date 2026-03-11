import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppLayout from '@/components/layout/AppLayout';
import { artworksApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload as UploadIcon, ImagePlus, X, Loader2, Coins } from 'lucide-react';
import type { AppLanguage, EvaluationScheme } from '@/types';

const SCHEME_VALUES: EvaluationScheme[] = [
  'painting',
  'graphics',
  'sculpture',
  'applied_art',
  'design_cg_photo',
  'design_ad_graphics',
  'design_interior_industrial',
  'design_fashion_textile',
  'art_history',
];

const LANGUAGE_OPTIONS: Array<{ value: AppLanguage; label: string }> = [
  { value: 'uz', label: "O'zbekcha" },
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
];

const Upload = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [evaluationScheme, setEvaluationScheme] = useState<EvaluationScheme>('painting');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const pollTimeoutRef = useRef<number | null>(null);
  const schemeOptions = useMemo(
    () => SCHEME_VALUES.map((value) => ({ value, label: t(`scheme:${value}`) })),
    [t]
  );

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      if (pollTimeoutRef.current !== null) {
        window.clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
    };
  }, [preview]);

  const handleFile = useCallback((f: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setError(t('upload:error.type'));
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError(t('upload:error.size'));
      return;
    }
    setError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, [t]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('title', title);
      fd.append('description', description);
      fd.append('evaluation_scheme', evaluationScheme);
      const { data } = await artworksApi.create(fd, language);

      const poll = async () => {
        try {
          const { data: artwork } = await artworksApi.get(String(data.id));

          if (artwork.status === 'completed') {
            if (pollTimeoutRef.current !== null) {
              window.clearTimeout(pollTimeoutRef.current);
              pollTimeoutRef.current = null;
            }
            navigate('/dashboard');
            return;
          }

          if (artwork.status === 'failed') {
            if (pollTimeoutRef.current !== null) {
              window.clearTimeout(pollTimeoutRef.current);
              pollTimeoutRef.current = null;
            }
            setLoading(false);
            setError(t('upload:error.evaluation_failed'));
            return;
          }

          pollTimeoutRef.current = window.setTimeout(poll, 2000);
        } catch {
          if (pollTimeoutRef.current !== null) {
            window.clearTimeout(pollTimeoutRef.current);
            pollTimeoutRef.current = null;
          }
          setLoading(false);
          setError(t('upload:error.status_check'));
        }
      };
      await poll();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 402) {
        setError(t('upload:error.credits'));
      } else if (axios.isAxiosError(err)) {
        setError((err.response?.data as { detail?: string } | undefined)?.detail || t('upload:error.failed'));
      } else {
        setError(t('upload:error.failed'));
      }
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">{t('upload:title')}</h1>
        <p className="mt-1 text-muted-foreground">{t('upload:subtitle')}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
          )}

          {/* Drop zone */}
          {!preview ? (
            <div
              className={`flex cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed p-12 transition-colors ${
                dragOver ? 'border-primary bg-accent' : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
                <UploadIcon className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium text-card-foreground">{t('upload:drop.title')}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('upload:drop.subtitle')}</p>
              </div>
              <input
                id="file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-xl border border-border bg-card">
              <img src={preview} alt="Preview" className="mx-auto max-h-80 object-contain p-4" />
              <button
                type="button"
                onClick={() => {
                  if (preview) {
                    URL.revokeObjectURL(preview);
                  }
                  setFile(null);
                  setPreview('');
                }}
                className="absolute right-3 top-3 rounded-full bg-card/90 p-1.5 shadow-card hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="border-t border-border px-4 py-2 text-sm text-muted-foreground">
                {file?.name} · {((file?.size || 0) / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>{t('upload:title_label')}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('upload:title_placeholder')} required maxLength={255} />
          </div>

          <div className="space-y-2">
            <Label>{t('upload:description_label')}</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('upload:description_placeholder')} rows={3} maxLength={1000} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">{t('upload:language_label')}</Label>
            <select
              id="language"
              value={language}
              onChange={(e) => {
                const nextLanguage = e.target.value as AppLanguage;
                setLanguage(nextLanguage);
              }}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evaluation_scheme">{t('upload:scheme_label')}</Label>
            <select
              id="evaluation_scheme"
              value={evaluationScheme}
              onChange={(e) => setEvaluationScheme(e.target.value as EvaluationScheme)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              {schemeOptions.map((scheme) => (
                <option key={scheme.value} value={scheme.value}>
                  {scheme.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-accent px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-accent-foreground">
              <Coins className="h-4 w-4" />
              {t('upload:credit_note')}
            </div>
          </div>

          <Button type="submit" className="w-full gradient-primary border-0 text-primary-foreground" disabled={!file || !title || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('upload:loading')}
              </>
            ) : (
              <>
                <ImagePlus className="mr-2 h-4 w-4" />
                {t('upload:submit')}
              </>
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
};

export default Upload;
