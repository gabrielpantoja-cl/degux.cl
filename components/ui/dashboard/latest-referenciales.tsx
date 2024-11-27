// app/ui/dashboard/latest-referenciales.tsx
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { lusitana } from '@/components/ui/fonts';
import { fetchLatestReferenciales } from '@/lib/referenciales';

type LatestReferencial = {
  id: string;
  userId: string;
  lat: number;
  lng: number;
  fojas: number;
  numero: number;
  anio: number;
  cbr: string;
  monto: number;
  user: {
    id: string;
    name: string | null; // Permitir que name sea string o null
    email: string;
  };
};

export default async function LatestReferenciales() {
  const latestReferenciales: LatestReferencial[] = await fetchLatestReferenciales();
  return (
    <div className="flex w-full flex-col md:col-span-4 lg:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Últimos agregados a la base de datos:
      </h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">

        <div className="bg-white px-6">
          {latestReferenciales.map((referencial, i) => {
            return (
              <div
                key={referencial.id}
                className={clsx(
                  'flex flex-row items-center justify-between py-4',
                  {
                    'border-t': i !== 0,
                  },
                )}
              >
                <div className="flex items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold md:text-base">
                      Fojas: {referencial.fojas}
                    </p>
                    <p className="truncate text-sm font-semibold md:text-base">
                      Número: {referencial.numero}
                    </p>
                    <p className="truncate text-sm font-semibold md:text-base">
                      Año: {referencial.anio}
                    </p>
                    <p className="truncate text-sm font-semibold md:text-base">
                      CBR: {referencial.cbr}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <ArrowPathIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500 ">Actualizado justo ahora</h3>
        </div>
      </div>
    </div>
  );
}