// app/auth/signin/page.tsx
'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Iniciar Sesión
          </h2>
        </div>
        <button
          onClick={() => signIn('google', { callbackUrl })}
          className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
        >
          Continuar con Google
        </button>
      </div>
    </div>
  );
}