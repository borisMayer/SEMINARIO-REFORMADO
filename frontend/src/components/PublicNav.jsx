'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function PublicNav() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-amber-500 font-bold text-lg tracking-wide">
              Seminario Reformado
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/cursos"
              className="text-slate-300 hover:text-amber-400 text-sm font-medium transition-colors"
            >
              Cursos
            </Link>
            <Link
              href="/recursos"
              className="text-slate-300 hover:text-amber-400 text-sm font-medium transition-colors"
            >
              Recursos
            </Link>
            <Link
              href="/biblioteca"
              className="text-slate-300 hover:text-amber-400 text-sm font-medium transition-colors"
            >
              Biblioteca
            </Link>

            {session ? (
              <div className="flex items-center gap-3">
                {session.user.isAdmin && (
                  <Link
                    href="/admin"
                    className="text-slate-300 hover:text-amber-400 text-sm font-medium transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name}
                      className="w-7 h-7 rounded-full"
                    />
                  )}
                  <span className="text-slate-400 text-sm">
                    {session.user.name?.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-slate-400 hover:text-red-400 text-sm transition-colors"
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Iniciar sesión
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-slate-300 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-2 border-t border-slate-800 mt-2">
            <Link href="/cursos" className="block text-slate-300 hover:text-amber-400 py-2 text-sm">Cursos</Link>
            <Link href="/recursos" className="block text-slate-300 hover:text-amber-400 py-2 text-sm">Recursos</Link>
            <Link href="/biblioteca" className="block text-slate-300 hover:text-amber-400 py-2 text-sm">Biblioteca</Link>
            {session ? (
              <>
                {session.user.isAdmin && (
                  <Link href="/admin" className="block text-slate-300 hover:text-amber-400 py-2 text-sm">Admin</Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="block text-red-400 hover:text-red-300 py-2 text-sm"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link href="/login" className="block text-amber-500 hover:text-amber-400 py-2 text-sm font-semibold">
                Iniciar sesión
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
