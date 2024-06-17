// app/dashboard/referenciales/page.tsx
import Pagination from '@/app/ui/referenciales/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/referenciales/table';
import { CreateReferencial } from '@/app/ui/referenciales/buttons';
import { lusitana } from '@/app/ui/fonts';
import { ReferencialesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchReferencialesPages } from '@/app/lib/referenciales';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Referenciales',
};

export default async function Page({
  searchParams = {}, // Proporcionar un valor predeterminado para searchParams
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  // Extraer query y currentPage de searchParams, proporcionando valores predeterminados
  const { query = '', page = '1' } = searchParams;
  // Convertir currentPage a número
  const currentPage = parseInt(page, 10);

  // Dado que fetchReferencialesPages no espera argumentos, se elimina el argumento 'query'
  const totalPagesResult = await fetchReferencialesPages();
  // Asegurar que totalPages siempre sea un número, asignando un valor por defecto si es necesario
  const totalPages = totalPagesResult !== undefined ? totalPagesResult : 1;

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Referenciales</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Buscar referencial..." />
        <CreateReferencial />
      </div>
      <Suspense key={`${query}-${currentPage}`} fallback={<ReferencialesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}