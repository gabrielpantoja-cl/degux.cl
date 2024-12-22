// app/page.tsx
"use client";

import { useState } from 'react';
import AcmeLogo from '@/components/ui/acme-logo';
import { lusitana } from '@/components/ui/fonts';
import Image from 'next/image';
import Link from 'next/link';

export default function Page() {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <main className="flex min-h-screen flex-col p-6">
      {showBanner && (
        <div className="flex items-center justify-between bg-yellow-200 p-4 rounded-lg mb-4">
          <p className="text-yellow-800">
          🏗️ Estamos en fase beta. Agradecemos tu paciencia y feedback mientras mejoramos nuestro servicio.
          </p>
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
            Una base de datos para la tasación.
          </p>
          <div className="flex flex-col gap-4">
            <Link
              href="/login"
              className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
            >
              <span>Log in</span>
            </Link>
            <Link
              href="/terms"
              className="flex items-center gap-5 self-start rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 md:text-base"
            >
              <span>Términos y Condiciones</span>
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
          <div className="relative w-full">
            <div className="relative hidden md:block aspect-[1000/760]">
              <Image
                src="/hero-desktop.png"
                alt="Screenshots of the dashboard project showing desktop version"
                fill
                style={{ objectFit: 'contain' }}
                priority
                sizes="(min-width: 768px) 1000px, 100vw"
              />
            </div>
            <div className="relative block md:hidden aspect-[560/620]">
              <Image
                src="/hero-mobile.png"
                alt="Screenshot of the dashboard project showing mobile version"
                fill
                style={{ objectFit: 'contain' }}
                priority
                sizes="(max-width: 768px) 560px, 100vw"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}