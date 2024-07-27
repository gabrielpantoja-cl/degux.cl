// app/ui/login-form.tsx
'use client';

import { useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';
import { signIn } from 'next-auth/react'; 

interface LoginFormProps {
  isVerified: boolean;
  OAuthAccountNotLinked: boolean;
}

export default function LoginForm({ isVerified, OAuthAccountNotLinked }: LoginFormProps) {
  return (
    <div className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className="mb-3 text-2xl">
          Ingresa con Google para continuar.
        </h1>
        {OAuthAccountNotLinked && (
          <p className="text-red-500">Tu cuenta de Google no está vinculada.</p>
        )}
      </div>
      <LoginButton isVerified={isVerified} />
    </div>
  );
}

interface LoginButtonProps {
  isVerified: boolean;
}

function LoginButton({ isVerified }: LoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn("google", { callbackUrl: process.env.NEXT_PUBLIC_CALLBACK_URL });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button 
        className="mt-4 w-full" 
        onClick={handleSignIn}
        aria-label="Log in with Google"
        disabled={!isVerified || loading}
      >
        {loading ? 'Cargando...' : 'Log in with Google'} 
        {!loading && <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />}
      </Button>
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
}