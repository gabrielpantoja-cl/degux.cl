// app/ui/login-form.tsx
'use client';

import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';
import { signIn } from 'next-auth/react'; 

export default function LoginForm() {
  return (
    <div className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className="mb-3 text-2xl">
          Ingresa con Google para continuar.
        </h1>
      </div>
      <LoginButton /> {/* Añadir el botón de login */}
    </div>
  );
}

function LoginButton() {
  const handleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: process.env.NEXT_PUBLIC_CALLBACK_URL });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <Button 
      className="mt-4 w-full" 
      onClick={handleSignIn}
      aria-label="Log in with Google"
    >
      Log in with Google <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
    </Button>
  );
}