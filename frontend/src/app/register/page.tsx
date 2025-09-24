'use client';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    mobileNumber: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setError('Self-registration is disabled. Please contact the Super Admin.');
    setLoading(false);
  };

  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>We’ll send an OTP to verify your email</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          {error && <Alert variant="error">{error}</Alert>}
          <div className="space-y-2">
            <Label htmlFor="avatar">Profile picture</Label>
            {avatarPreview && (
              <img src={avatarPreview} alt="Preview" className="h-16 w-16 rounded-full object-cover border" />
            )}
            <input id="avatar" type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setAvatarFile(file);
              if (file) {
                const url = URL.createObjectURL(file);
                setAvatarPreview(url);
              } else {
                setAvatarPreview('');
              }
            }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" value={form.firstName} onChange={set('firstName')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" value={form.lastName} onChange={set('lastName')} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="mobileNumber">Mobile number</Label>
            <Input id="mobileNumber" placeholder="+1 555 555 5555" value={form.mobileNumber} onChange={set('mobileNumber')} />
          </div>
          <Button className="w-full" isLoading={loading} type="submit">Request Account</Button>
          <p className="text-sm text-center text-neutral-600">Already registered? <a className="underline" href="/login">Login</a></p>
        </form>
      </Card>
    </div>
  );
}
