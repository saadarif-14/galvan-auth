'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useRouter } from 'next/navigation';

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('pendingRegistration');
      if (saved) {
        const data = JSON.parse(saved);
        setEmail(data.email);
        setPayload(data);
      }
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiFetch("/auth/verify", { method: 'POST', body: JSON.stringify({ email, otp, payload }) });
      router.push('/login');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>Enter the OTP we sent to your email</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          {error && <Alert variant="error">{error}</Alert>}
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="otp">OTP</Label>
            <Input id="otp" placeholder="123456" value={otp} onChange={e => setOtp(e.target.value)} />
          </div>
          <Button className="w-full" isLoading={loading} type="submit">Verify</Button>
        </form>
      </Card>
    </div>
  );
}
