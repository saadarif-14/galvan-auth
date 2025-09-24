'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ui/ToastContainer';
import { authManager } from '@/lib/auth';

export default function UserLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { toasts, success, error: showError, removeToast } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authManager.login(email, password, 'user');
      if (data.type !== 'user') {
        throw new Error('This login is for regular Users');
      }
      success('Login successful!', 'Welcome to your dashboard.');
      router.replace('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      showError('Login failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>User Login</CardTitle>
          <CardDescription>Sign in with credentials provided by the Super Admin</CardDescription>
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
        </form>
      </Card>
      
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
