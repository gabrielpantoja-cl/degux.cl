// app/dashboard/referenciales/page.tsx
import Pagination from '@/components/ui/referenciales/pagination';
import Search from '@/components/ui/search';
import Table from '@/components/ui/referenciales/table';
import { CreateReferencial } from '@/components/ui/referenciales/buttons';
import { lusitana } from '@/components/ui/fonts';
import { ReferencialesTableSkeleton } from '@/components/ui/skeletons';
import { Suspense } from 'react';
import { fetchReferencialesPages } from '@/lib/referenciales';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Referenciales',
};

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {

  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchReferencialesPages(); // Sin argumentos

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Referenciales</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Buscar referencial..." />
        <CreateReferencial />
      </div>
      <Suspense key={query + currentPage} fallback={<ReferencialesTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}