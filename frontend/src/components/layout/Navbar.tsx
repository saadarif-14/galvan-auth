'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    try {
      await fetch(process.env.NEXT_PUBLIC_API_BASE + '/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    if (typeof window !== 'undefined') localStorage.removeItem('role');
    router.replace('/login');
  };

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === href ? 'bg-black text-white' : 'text-black hover:bg-neutral-100'}`}>
      {children}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold text-[var(--heading)]">Galvan AI</Link>
        </div>
      </div>
    </nav>
  );
}
