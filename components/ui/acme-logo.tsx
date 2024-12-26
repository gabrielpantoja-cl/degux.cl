// components/ui/acme-logo.tsx
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/components/ui/fonts';

export default function AcmeLogo() {
  return (
    <div
      className={`
        ${lusitana.className} 
        flex flex-col items-center justify-center 
        min-h-[6rem]
        mt-4 md:mt-0  // Reducimos el margen superior en móvil
        gap-2
      `}
    >
      <GlobeAltIcon 
        className="h-6 w-6 md:h-10 md:w-10 text-white transform hover:rotate-180 transition-transform duration-500 ease-in-out" 
      />
      <p className="text-sm md:text-lg font-semibold tracking-tight text-white text-center leading-tight">
        referenciales
        <span className="text-sky-300">.cl</span>
      </p>
    </div>
  );
}