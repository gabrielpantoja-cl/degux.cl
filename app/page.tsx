// app/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import AcmeLogo from '@/components/ui/acme-logo';
import { lusitana } from '@/components/ui/fonts';
import Image from 'next/image';
import Link from 'next/link';

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  useEffect(() => {
    const signOutMessage = localStorage.getItem('signOutMessage');
    if (signOutMessage) {
      toast.success(signOutMessage, { 
        duration: 5000,
        position: 'bottom-center'
      });
      localStorage.removeItem('signOutMessage');
    }
  }, []);

  useEffect(() => {
    const showCookiesToast = () => {
      if (!localStorage.getItem('cookiesAccepted')) {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <p>
              Sitio web optimizado para Google Chrome Desktop. Usamos cookies para mejorar tu experiencia, revisa la sección dedicada al final de la <Link href="/privacy" className="text-blue-500 underline">Política de Privacidad</Link>.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="rounded bg-yellow-300 px-3 py-1 text-yellow-800 hover:bg-yellow-400"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('cookiesAccepted', 'true');
                  toast.dismiss(t.id);
                }}
                className="rounded bg-yellow-300 px-3 py-1 text-yellow-800 hover:bg-yellow-400"
              >
                Aceptar
              </button>
            </div>
          </div>
        ), { duration: 10000, position: 'bottom-center' });
      }
    };

    const timer = setTimeout(showCookiesToast, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleAuth = async () => {
    if (!acceptedTerms) return;
    try {
      setIsLoading(true);
      const result = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: false
      });

      if (result?.error) {
        toast.error('Error al iniciar sesión');
        return;
      }

      if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      console.error('Error en inicio de sesión:', error);
      toast.error('Error inesperado al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar loading mientras se verifica la sesión
  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>;
  }

  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
        <AcmeLogo />
      </div>
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
          <div className="h-0 w-0 border-b-[30px] border-l-[20px] border-r-[20px] border-b-black border-l-transparent border-r-transparent" />
          <p className={`${lusitana.className} text-xl text-gray-800 md:text-3xl md:leading-normal`}>
            Bienvenido a <strong>referenciales.cl</strong><br />
            Una base de datos para la tasación.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                He leído y acepto los <Link href="/terms" className="text-blue-500 underline">Términos de Servicio</Link> y <Link href="/privacy" className="text-blue-500 underline">Política de Privacidad</Link>
              </label>
            </div>
            <button
              onClick={handleAuth}
              className={`flex items-center gap-5 self-start rounded-lg px-6 py-3 text-sm font-medium text-white transition-colors md:text-base ${
                acceptedTerms && !isLoading ? 'bg-blue-500 hover:bg-blue-400' : 'bg-gray-300 cursor-not-allowed'
              }`}
              disabled={!acceptedTerms || isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <span>Log in</span>
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
          <div className="relative w-full">
            {/* Versión Desktop */}
            <div className="relative hidden md:block aspect-[1000/760]">
              <Image
                src="/images/hero-desktop.png"
                alt="Panel de control versión escritorio"
                fill
                quality={100}
                priority
                style={{ objectFit: 'contain' }}
                sizes="(min-width: 768px) 1000px, 100vw"
              />
            </div>
            {/* Versión Mobile */}
            <div className="relative block md:hidden aspect-[560/620]">
              <Image
                src="/images/hero-mobile.png"
                alt="Panel de control versión móvil"
                fill
                quality={100}
                priority
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 768px) 560px, 100vw"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}