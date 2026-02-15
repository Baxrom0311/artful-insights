import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { artworksApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload as UploadIcon, ImagePlus, X, Loader2, Coins } from 'lucide-react';

const Upload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setError('Only JPG, PNG, WEBP allowed');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB');
      return;
    }
    setError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

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
      const { data } = await artworksApi.create(fd);

      // Poll for completion
      const poll = async () => {
        const { data: artwork } = await artworksApi.get(String(data.id));
        if (artwork.status === 'completed' || artwork.status === 'failed') {
          navigate('/history');
        } else {
          setTimeout(poll, 2000);
        }
      };
      poll();
    } catch (err: any) {
      if (err.response?.status === 402) {
        setError('Insufficient credits. Please add more credits.');
      } else {
        setError(err.response?.data?.detail || 'Upload failed');
      }
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Upload Artwork</h1>
        <p className="mt-1 text-muted-foreground">Upload your artwork for AI-powered evaluation</p>

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
                <p className="font-medium text-card-foreground">Drag & drop your artwork</p>
                <p className="mt-1 text-sm text-muted-foreground">or click to browse · JPG, PNG, WEBP · Max 10MB</p>
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
                onClick={() => { setFile(null); setPreview(''); }}
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
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give your artwork a title" required maxLength={255} />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your artwork (optional)" rows={3} maxLength={1000} />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-accent px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-accent-foreground">
              <Coins className="h-4 w-4" />
              This evaluation will use <strong>1 credit</strong>
            </div>
          </div>

          <Button type="submit" className="w-full gradient-primary border-0 text-primary-foreground" disabled={!file || !title || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading & Evaluating...
              </>
            ) : (
              <>
                <ImagePlus className="mr-2 h-4 w-4" />
                Evaluate Artwork
              </>
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
};

export default Upload;
