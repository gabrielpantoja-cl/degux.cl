// app/ui/login-form.tsx
'use client';

import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';
import { signIn } from 'next-auth/react'; 

interface LoginFormProps {
  isVerified: boolean;
  OAuthAccountNotLinked: boolean; // Añadir esta línea
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
      <LoginButton isVerified={isVerified} /> {/* Añadir el botón de login con la propiedad isVerified */}
    </div>
  );
}

interface LoginButtonProps {
  isVerified: boolean;
}

function LoginButton({ isVerified }: LoginButtonProps) {
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
      disabled={!isVerified} // Deshabilitar el botón si no está verificado
    >
      Log in with Google <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
    </Button>
  );
}