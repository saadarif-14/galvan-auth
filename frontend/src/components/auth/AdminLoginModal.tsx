'use client';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';
import { useRouter } from 'next/navigation';

export function AdminLoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL || '');
  const [password, setPassword] = useState(process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch<{ role: string }>("/auth/login", { method: 'POST', body: JSON.stringify({ email, password }) });
      if (typeof window !== 'undefined') localStorage.setItem('role', data.role);
      onClose();
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-[61] w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-1">Admin Login</h2>
        <p className="text-sm text-neutral-600 mb-4">Enter Super Admin credentials to continue</p>
        {error && <div className="mb-3"><Alert variant="error">{error}</Alert></div>}
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="admin-email">Email</Label>
            <Input id="admin-email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="admin-password">Password</Label>
            <Input id="admin-password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={loading}>Login</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
