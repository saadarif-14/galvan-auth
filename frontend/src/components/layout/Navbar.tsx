'use client';
import Link from 'next/link';

export function Navbar() {


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
