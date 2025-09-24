


'use client';

import { useState, type FormEvent } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';
import { authManager } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL || '');
  const [password, setPassword] = useState(process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { toasts, success, error: showError, removeToast } = useToast();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authManager.login(email, password, 'admin');

      if (data.type !== 'admin') {
        throw new Error('Admin credentials required');
      }

      success('Login successful!', 'Welcome to the admin dashboard.');
      router.replace('/admin');
    } catch (err: any) {
      setError(err?.message || 'Login failed');
      showError('Login failed', err?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Super Admin Login</CardTitle>
          <CardDescription>Use the seeded admin credentials</CardDescription>
        </CardHeader>

        <form onSubmit={onSubmit} className="space-y-3">
          {error && <Alert variant="error">{error}</Alert>}

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <Button className="w-full" isLoading={loading} type="submit">
            Login
          </Button>
        </form>
      </Card>
      
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
