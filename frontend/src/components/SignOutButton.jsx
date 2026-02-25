'use client';

import { signOut, useSession } from 'next-auth/react';

export default function SignOutButton() {
  const { data: session } = useSession();

  return (
    <div className="flex items-center gap-3">
      {session?.user?.name && (
        <span className="text-sm text-gray-600">{session.user.name}</span>
      )}
      <button
        onClick={() => signOut({ callbackUrl: '/admin/login' })}
        className="text-sm bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 transition font-medium"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
