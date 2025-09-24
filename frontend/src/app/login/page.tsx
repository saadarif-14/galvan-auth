'use client';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch<{ role: string }>("/auth/login", {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('role', data.role);
      }
      if (data.role === 'SUPERADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in with your credentials</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          {error && <Alert variant="error">{error}</Alert>}
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <Button className="w-full" isLoading={loading} type="submit">Login</Button>
          <p className="text-sm text-center text-neutral-600">No account? <a className="underline" href="/register">Register</a></p>
        </form>
      </Card>
    </div>
  );
}
