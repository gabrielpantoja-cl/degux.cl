// app/page.tsx
"use client";

import { useState } from 'react';
import AcmeLogo from '@/components/ui/acme-logo';
import { lusitana } from '@/components/ui/fonts';
import Image from 'next/image';
import Link from 'next/link';

export default function Page() {
  const [showBanner, setShowBanner] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  return (
    <main className="flex min-h-screen flex-col p-6">
      {showBanner && (
        <div className="flex items-center justify-between bg-yellow-200 p-4 rounded-lg mb-4">
          <p className="text-yellow-800">
          🚧 Estamos en desarrollo activo. Agradecemos tus comentarios y opiniones mientras mejoramos la plataforma.          </p>
          <button
            onClick={() => setShowBanner(false)}
            className="ml-4 rounded bg-yellow-300 px-3 py-1 text-yellow-800 hover:bg-yellow-400"
          >
            Cerrar
          </button>
        </div>
      )}
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
        <AcmeLogo />
      </div>
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
          <div className="h-0 w-0 border-b-[30px] border-l-[20px] border-r-[20px] border-b-black border-l-transparent border-r-transparent" />
          <p className={`${lusitana.className} text-xl text-gray-800 md:text-3xl md:leading-normal`}>
            Bienvenido a <strong>referenciales.cl</strong><br />
            Una base de datos colaborativa.
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
                He leído y acepto los <Link href="/terms" className="text-blue-500 underline">Términos y Condiciones</Link>
              </label>
            </div>
            <Link
              href="/login"
              className={`flex items-center gap-5 self-start rounded-lg px-6 py-3 text-sm font-medium text-white transition-colors md:text-base ${
                acceptedTerms ? 'bg-blue-500 hover:bg-blue-400' : 'bg-gray-300 cursor-not-allowed'
              }`}
              onClick={(e) => {
                if (!acceptedTerms) {
                  e.preventDefault();
                }
              }}
            >
              <span>Log in</span>
            </Link>
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