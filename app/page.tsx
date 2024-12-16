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
            🚧 Bienvenido a Referenciales.cl: Estamos en fase de desarrollo,
            por lo que algunos datos podrían ser temporales. ¡Explora y ayúdanos a mejorar! 📊
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
            Una base de datos colaborativa para la tasación inmobiliaria.
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
          <Image
            src="/hero-desktop.png"
            width={1000}
            height={760}
            className="hidden md:block"
            alt="Screenshots of the dashboard project showing desktop and mobile versions"
          />
          <Image
            src="/hero-mobile.png"
            width={560}
            height={620}
            className="block md:hidden"
            alt="Screenshot of the dashboard project showing mobile version"
          />
        </div>
      </div>
    </main>
  );
}